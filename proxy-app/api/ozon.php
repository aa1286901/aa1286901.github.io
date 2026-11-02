<?php

declare(strict_types=1);

// Оплата по СБП через ссылку Ozon с подтверждением по уведомлениям банка.
// Клиент переводит сумму с уникальными копейками; телефон с приложением Ozon пересылает
// уведомление о поступлении на /api/ozon/notify?key=..., и сайт сам находит заявку по сумме.

const OZON_ORDER_TTL_HOURS = 24;

function ozon_pay_url(): string
{
    $url = trim((string) (getenv('OZON_PAY_URL') ?: ''));
    return $url !== '' ? $url : 'https://finance.ozon.ru/apps/sbp/ozonbankpay/01a19cdb-1ed0-7770-b518-ca3adc128bcd';
}

function ozon_notify_key(): string
{
    return trim((string) (getenv('OZON_NOTIFY_KEY') ?: ''));
}

function ozon_enabled(): bool
{
    $flag = strtolower(trim((string) (getenv('OZON_PAY_ENABLED') ?: '1')));
    return !in_array($flag, ['0', 'false', 'off', 'no'], true);
}

function ensure_ozon_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;
    $pdo = db();
    $pdo->exec('CREATE TABLE IF NOT EXISTS ozon_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        kind TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        days INTEGER NOT NULL,
        amount_kop INTEGER NOT NULL,
        promo_code TEXT DEFAULT NULL,
        status TEXT NOT NULL DEFAULT "pending",
        payer TEXT DEFAULT NULL,
        notification TEXT DEFAULT NULL,
        invite_code TEXT DEFAULT NULL,
        confirmed_by TEXT DEFAULT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        paid_at TEXT DEFAULT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_ozon_orders_status ON ozon_orders(status, amount_kop)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS ozon_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        amount_kop INTEGER DEFAULT NULL,
        payer TEXT DEFAULT NULL,
        order_id INTEGER DEFAULT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
}

function ozon_money(int $kop): string
{
    return number_format($kop / 100, 2, ',', ' ') . ' ₽';
}

// Подобрать уникальные копейки: среди ожидающих заявок сумма не повторяется.
function ozon_unique_amount(int $baseRub): int
{
    $stmt = db()->prepare("SELECT amount_kop FROM ozon_orders WHERE status = 'pending' AND created_at >= datetime('now', :ttl)");
    $stmt->execute([':ttl' => '-' . OZON_ORDER_TTL_HOURS . ' hours']);
    $busy = array_flip(array_map('intval', array_column($stmt->fetchAll(), 'amount_kop')));
    for ($shift = 0; $shift < 5; $shift++) {
        $candidates = range(11, 99);
        shuffle($candidates);
        foreach ($candidates as $kop) {
            if ($kop % 10 === 0) {
                continue; // избегаем «круглых» копеек вроде ,50 — их легко ввести по ошибке
            }
            $amount = ($baseRub + $shift) * 100 + $kop;
            if (!isset($busy[$amount])) {
                return $amount;
            }
        }
    }
    return ($baseRub + 5) * 100 + random_int(11, 99);
}

function ozon_find_order(string $token): ?array
{
    $stmt = db()->prepare('SELECT * FROM ozon_orders WHERE token = :token LIMIT 1');
    $stmt->execute([':token' => $token]);
    return $stmt->fetch() ?: null;
}

function ozon_order_public(array $o, bool $withCode = false): array
{
    $created = strtotime((string) $o['created_at'] . ' UTC') ?: time();
    $status = (string) $o['status'];
    if ($status === 'pending' && time() - $created > OZON_ORDER_TTL_HOURS * 3600) {
        $status = 'expired';
    }
    $data = [
        'token' => (string) $o['token'],
        'kind' => (string) $o['kind'],
        'planName' => (string) $o['plan_name'],
        'days' => (int) $o['days'],
        'amountKop' => (int) $o['amount_kop'],
        'amountLabel' => ozon_money((int) $o['amount_kop']),
        'amountInput' => number_format(((int) $o['amount_kop']) / 100, 2, ',', ''),
        'status' => $status,
        'payUrl' => ozon_pay_url(),
        'phone' => (string) $o['phone'],
        'displayPhone' => display_phone((string) $o['phone']),
        'createdAt' => (string) $o['created_at'],
        'paidAt' => $o['paid_at'] ?? null,
    ];
    if ($withCode && $status === 'paid') {
        $data['inviteCode'] = (string) ($o['invite_code'] ?? '');
    }
    return $data;
}

function ozon_create_order(string $phone, string $kind, string $planId, ?string $promoCode = null): array
{
    ensure_ozon_schema();
    if ($kind === 'vpn') {
        $plan = null;
        foreach (vpn_plans_payload() as $p) {
            if ($p['id'] === $planId) {
                $plan = $p;
            }
        }
        if (!$plan) {
            json_response(['message' => 'Тариф VPN не найден'], 422);
        }
        $baseRub = (int) preg_replace('/\D+/', '', (string) $plan['price']);
        $days = (int) $plan['durationDays'];
        $name = 'VPN · ' . $plan['name'];
        $promoCode = null;
    } else {
        $promo = $promoCode ? promo_code_data($promoCode) : null;
        if ($promo && !empty($promo['amount'])) {
            $planId = (string) $promo['planId'];
        } else {
            $promo = null;
            $promoCode = null;
        }
        $plan = plan_by_id((int) $planId);
        if (!$plan) {
            json_response(['message' => 'Тариф не найден'], 422);
        }
        $baseRub = $promo ? (int) $promo['amount'] : plan_price_amount($plan);
        $days = (int) ($plan['durationDays'] ?? 0);
        $name = (string) $plan['name'];
    }
    if ($baseRub <= 0 || $days <= 0) {
        json_response(['message' => 'Неверная цена тарифа'], 422);
    }

    // Уже есть ожидающая заявка этого номера на тот же тариф — возвращаем её, а не плодим новые
    $same = db()->prepare("SELECT * FROM ozon_orders WHERE status = 'pending' AND phone = :phone AND kind = :kind AND plan_id = :plan
        AND COALESCE(promo_code, '') = :promo AND created_at >= datetime('now', :ttl) ORDER BY id DESC LIMIT 1");
    $same->execute([':phone' => $phone, ':kind' => $kind, ':plan' => $planId, ':promo' => (string) $promoCode, ':ttl' => '-' . OZON_ORDER_TTL_HOURS . ' hours']);
    if ($existing = $same->fetch()) {
        return $existing;
    }
    $count = db()->prepare("SELECT COUNT(*) FROM ozon_orders WHERE status = 'pending' AND phone = :phone AND created_at >= datetime('now', '-24 hours')");
    $count->execute([':phone' => $phone]);
    if ((int) $count->fetchColumn() >= 5) {
        json_response(['message' => 'Слишком много неоплаченных заявок. Оплатите или отмените предыдущую.'], 429);
    }

    $token = bin2hex(random_bytes(12));
    $amount = ozon_unique_amount($baseRub);
    $stmt = db()->prepare('INSERT INTO ozon_orders (token, phone, kind, plan_id, plan_name, days, amount_kop, promo_code)
        VALUES (:token, :phone, :kind, :plan_id, :plan_name, :days, :amount, :promo)');
    $stmt->execute([
        ':token' => $token, ':phone' => $phone, ':kind' => $kind, ':plan_id' => $planId,
        ':plan_name' => $name, ':days' => $days, ':amount' => $amount, ':promo' => $promoCode,
    ]);
    return ozon_find_order($token);
}

// Выдать доступ по оплаченной заявке.
function ozon_fulfill(array $order, string $by, ?string $payer = null, ?string $notification = null): array
{
    if ((string) $order['status'] === 'paid') {
        return $order;
    }
    $phone = normalize_phone((string) $order['phone']);
    $inviteCode = null;
    if ((string) $order['kind'] === 'vpn') {
        vpn_update_user($phone, 'add', (int) $order['days']);
    } else {
        $existing = find_user($phone);
        $saved = save_user([
            'phone' => $phone,
            'subscription_type' => normalize_subscription_type_to_days((string) $order['days'] . ' дней'),
            'expires_at' => build_extended_expires_at($existing, (int) $order['days']),
            'is_active' => true,
            'balance' => $existing ? (int) ($existing['balance'] ?? 0) : 0,
            'regenerate_invite' => !$existing || empty($existing['invite_code']),
        ]);
        $fresh = find_user($phone);
        $inviteCode = (string) ($saved['inviteCode'] ?? ($fresh['invite_code'] ?? ''));
    }
    $stmt = db()->prepare("UPDATE ozon_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP, confirmed_by = :by,
        payer = COALESCE(:payer, payer), notification = COALESCE(:note, notification), invite_code = :code WHERE id = :id");
    $stmt->execute([':by' => $by, ':payer' => $payer, ':note' => $notification, ':code' => $inviteCode, ':id' => $order['id']]);
    return ozon_find_order((string) $order['token']);
}

// Разобрать текст уведомления: сумма поступления и имя отправителя.
function ozon_parse_notification(string $text): array
{
    $clean = str_replace(["\u{00A0}", "\u{202F}", "\u{2009}"], ' ', $text);
    $amount = null;
    // Сначала ищем сумму со знаком «+», затем любую сумму с ₽/руб
    $patterns = [
        '/\+\s*(\d{1,3}(?:[ ]?\d{3})*(?:[.,]\d{1,2})?)\s*(?:₽|руб|RUB|р\b)/iu',
        '/(\d{1,3}(?:[ ]?\d{3})*(?:[.,]\d{1,2})?)\s*(?:₽|руб|RUB|р\b)/iu',
    ];
    foreach ($patterns as $re) {
        if (preg_match($re, $clean, $m)) {
            $num = str_replace([' ', ','], ['', '.'], $m[1]);
            $amount = (int) round(((float) $num) * 100);
            break;
        }
    }
    $payer = null;
    if (preg_match('/(?:от|отправитель:?)\s+([A-ZА-ЯЁ][\p{L}\-]+(?:\s+[A-ZА-ЯЁ][\p{L}\-]+(?:вич|вна|ична|оглы|кызы))?(?:\s+[A-ZА-ЯЁ]\.)?)/u', $clean, $pm)) {
        $payer = trim($pm[1]);
    }
    $incoming = (bool) preg_match('/\+|поступ|пополн|зачисл|входящ|перевод от|получен/iu', $clean);
    return ['amountKop' => $amount, 'payer' => $payer, 'incoming' => $incoming];
}

// Принять уведомление: сохранить и попробовать найти заявку по сумме.
function ozon_accept_notification(string $text): array
{
    ensure_ozon_schema();
    $text = trim(mb_substr($text, 0, 1000));
    $parsed = ozon_parse_notification($text);
    $stmt = db()->prepare('INSERT INTO ozon_notifications (text, amount_kop, payer) VALUES (:t, :a, :p)');
    $stmt->execute([':t' => $text, ':a' => $parsed['amountKop'], ':p' => $parsed['payer']]);
    $noteId = (int) db()->lastInsertId();

    $matched = null;
    if ($parsed['amountKop'] && $parsed['incoming']) {
        $find = db()->prepare("SELECT * FROM ozon_orders WHERE status = 'pending' AND amount_kop = :a
            AND created_at >= datetime('now', :ttl) ORDER BY id DESC LIMIT 1");
        $find->execute([':a' => $parsed['amountKop'], ':ttl' => '-' . OZON_ORDER_TTL_HOURS . ' hours']);
        $order = $find->fetch() ?: null;
        if ($order) {
            $matched = ozon_fulfill($order, 'auto', $parsed['payer'], $text);
            db()->prepare('UPDATE ozon_notifications SET order_id = :o WHERE id = :id')->execute([':o' => $order['id'], ':id' => $noteId]);
        }
    }
    return [
        'ok' => true,
        'amount' => $parsed['amountKop'] ? ozon_money((int) $parsed['amountKop']) : null,
        'payer' => $parsed['payer'],
        'matched' => $matched ? ['phone' => display_phone((string) $matched['phone']), 'plan' => (string) $matched['plan_name']] : null,
    ];
}

function ozon_notify_url(): string
{
    $key = ozon_notify_key();
    return vpn_public_base() . '/api/ozon/notify' . ($key !== '' ? '?key=' . rawurlencode($key) : '');
}

function ozon_admin_payload(): array
{
    ensure_ozon_schema();
    $orders = db()->query('SELECT * FROM ozon_orders ORDER BY id DESC LIMIT 150')->fetchAll();
    $notes = db()->query('SELECT * FROM ozon_notifications ORDER BY id DESC LIMIT 60')->fetchAll();
    return [
        'enabled' => ozon_enabled(),
        'payUrl' => ozon_pay_url(),
        'webhookReady' => ozon_notify_key() !== '',
        'webhookUrl' => ozon_notify_key() !== '' ? ozon_notify_url() : null,
        'orders' => array_map(static function (array $o): array {
            $pub = ozon_order_public($o);
            $pub['id'] = (int) $o['id'];
            $pub['payer'] = $o['payer'] ?? null;
            $pub['confirmedBy'] = $o['confirmed_by'] ?? null;
            $pub['promoCode'] = $o['promo_code'] ?? null;
            return $pub;
        }, $orders),
        'notifications' => array_map(static fn (array $n): array => [
            'id' => (int) $n['id'],
            'text' => (string) $n['text'],
            'amountLabel' => $n['amount_kop'] !== null ? ozon_money((int) $n['amount_kop']) : null,
            'payer' => $n['payer'] ?? null,
            'matched' => !empty($n['order_id']),
            'createdAt' => (string) $n['created_at'],
        ], $notes),
    ];
}

function ozon_handle_routes(string $uri, string $method): void
{
    if (strpos($uri, '/api/ozon/') !== 0 && strpos($uri, '/api/admin/ozon') !== 0) {
        return;
    }
    ensure_ozon_schema();

    // Уведомление от телефона с приложением Ozon (MacroDroid и т. п.)
    if ($uri === '/api/ozon/notify') {
        $key = ozon_notify_key();
        $given = (string) ($_GET['key'] ?? $_POST['key'] ?? '');
        if ($key === '' || !hash_equals($key, $given)) {
            json_response(['message' => 'Forbidden'], 403);
        }
        $raw = (string) file_get_contents('php://input');
        $json = json_decode($raw, true);
        $text = (string) ($_GET['text'] ?? $_POST['text'] ?? (is_array($json) ? ($json['text'] ?? '') : $raw));
        if (trim($text) === '') {
            json_response(['message' => 'Пустое уведомление'], 422);
        }
        json_response(ozon_accept_notification($text));
    }

    if ($uri === '/api/ozon/orders' && $method === 'POST') {
        if (!ozon_enabled()) {
            json_response(['message' => 'Оплата через Ozon сейчас отключена'], 403);
        }
        $data = read_json_body();
        $kind = ((string) ($data['kind'] ?? 'proxy')) === 'vpn' ? 'vpn' : 'proxy';
        if ($kind === 'vpn') {
            $auth = require_auth();
            $user = require_active_subscription_user($auth);
            $phone = normalize_phone((string) $user['phone']);
        } else {
            $phone = normalize_phone((string) ($data['phone'] ?? ''));
        }
        if ($phone === '') {
            json_response(['message' => 'Укажите корректный номер телефона'], 422);
        }
        $order = ozon_create_order($phone, $kind, (string) ($data['plan_id'] ?? ''), isset($data['promoCode']) ? (string) $data['promoCode'] : null);
        json_response(['order' => ozon_order_public($order)], 201);
    }

    if (preg_match('#^/api/ozon/orders/([a-f0-9]{24})$#', $uri, $m) === 1 && $method === 'GET') {
        $order = ozon_find_order($m[1]);
        if (!$order) {
            json_response(['message' => 'Заявка не найдена'], 404);
        }
        $payload = ['order' => ozon_order_public($order, true)];
        if ((string) $order['status'] === 'paid' && (string) $order['kind'] === 'proxy') {
            $user = find_user((string) $order['phone']);
            if ($user) {
                $payload['subscription'] = user_subscription_payload($user);
            }
        }
        json_response($payload);
    }

    if (preg_match('#^/api/ozon/orders/([a-f0-9]{24})/cancel$#', $uri, $m) === 1 && $method === 'POST') {
        db()->prepare("UPDATE ozon_orders SET status = 'cancelled' WHERE token = :t AND status = 'pending'")->execute([':t' => $m[1]]);
        json_response(['message' => 'Заявка отменена']);
    }

    if ($uri === '/api/admin/ozon' && $method === 'GET') {
        require_admin();
        json_response(ozon_admin_payload());
    }

    // Вставить текст уведомления вручную (для проверки или если телефон не переслал)
    if ($uri === '/api/admin/ozon/notify' && $method === 'POST') {
        require_admin();
        $text = (string) (read_json_body()['text'] ?? '');
        if (trim($text) === '') {
            json_response(['message' => 'Вставьте текст уведомления'], 422);
        }
        json_response(ozon_accept_notification($text));
    }

    if (preg_match('#^/api/admin/ozon/(\d+)/(confirm|reject)$#', $uri, $m) === 1 && $method === 'POST') {
        require_admin();
        $stmt = db()->prepare('SELECT * FROM ozon_orders WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => (int) $m[1]]);
        $order = $stmt->fetch() ?: null;
        if (!$order) {
            json_response(['message' => 'Заявка не найдена'], 404);
        }
        if ($m[2] === 'confirm') {
            $order = ozon_fulfill($order, 'admin');
            json_response(['message' => 'Оплата подтверждена', 'inviteCode' => $order['invite_code'] ?? null]);
        }
        db()->prepare("UPDATE ozon_orders SET status = 'cancelled', confirmed_by = 'admin' WHERE id = :id AND status = 'pending'")
            ->execute([':id' => (int) $m[1]]);
        json_response(['message' => 'Заявка отклонена']);
    }
}
