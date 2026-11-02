<?php

declare(strict_types=1);

// Оплата по СБП через ссылку Ozon с ручным подтверждением.
// Клиент указывает, от чьего имени будет перевод, платит сумму тарифа по ссылке Ozon,
// нажимает «Я оплатил(а)» и присылает чек. Администратор видит имя в уведомлении банка
// и подтверждает заявку в админке — доступ выдаётся автоматически.

const OZON_ORDER_TTL_HOURS = 24;

function ozon_pay_url(): string
{
    $url = trim((string) (getenv('OZON_PAY_URL') ?: ''));
    return $url !== '' ? $url : 'https://finance.ozon.ru/apps/sbp/ozonbankpay/01a19cdb-1ed0-7770-b518-ca3adc128bcd';
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
    $cols = array_column($pdo->query('PRAGMA table_info(ozon_orders)')->fetchAll(), 'name');
    if (!in_array('claimed_at', $cols, true)) {
        $pdo->exec('ALTER TABLE ozon_orders ADD COLUMN claimed_at TEXT DEFAULT NULL');
    }
}

function ozon_money(int $kop): string
{
    return number_format($kop / 100, $kop % 100 === 0 ? 0 : 2, ',', ' ') . ' ₽';
}

// Имя отправителя, как его покажет банк: «Иван И.», «Мария Петровна К.»
function ozon_clean_payer(string $raw): string
{
    $name = trim((string) preg_replace('/\s+/u', ' ', $raw));
    $len = mb_strlen($name);
    if ($len < 2 || $len > 60 || !preg_match('/\p{L}{2}/u', $name)) {
        json_response(['message' => 'Укажите, от чьего имени будет перевод — например, «Иван И.»'], 422);
    }
    return $name;
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
    // Заявка, по которой клиент нажал «Я оплатил(а)», не истекает — ждёт решения администратора
    if ($status === 'pending' && empty($o['claimed_at']) && time() - $created > OZON_ORDER_TTL_HOURS * 3600) {
        $status = 'expired';
    }
    $data = [
        'token' => (string) $o['token'],
        'kind' => (string) $o['kind'],
        'planName' => (string) $o['plan_name'],
        'days' => (int) $o['days'],
        'amountKop' => (int) $o['amount_kop'],
        'amountLabel' => ozon_money((int) $o['amount_kop']),
        'amountInput' => number_format(((int) $o['amount_kop']) / 100, ((int) $o['amount_kop']) % 100 === 0 ? 0 : 2, ',', ''),
        'payer' => $o['payer'] ?? null,
        'claimedAt' => $o['claimed_at'] ?? null,
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

function ozon_create_order(string $phone, string $kind, string $planId, ?string $promoCode, string $payer): array
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
        db()->prepare('UPDATE ozon_orders SET payer = :payer WHERE id = :id')->execute([':payer' => $payer, ':id' => $existing['id']]);
        return ozon_find_order((string) $existing['token']);
    }
    $count = db()->prepare("SELECT COUNT(*) FROM ozon_orders WHERE status = 'pending' AND phone = :phone AND created_at >= datetime('now', '-24 hours')");
    $count->execute([':phone' => $phone]);
    if ((int) $count->fetchColumn() >= 5) {
        json_response(['message' => 'Слишком много неоплаченных заявок. Оплатите или отмените предыдущую.'], 429);
    }

    $token = bin2hex(random_bytes(12));
    $stmt = db()->prepare('INSERT INTO ozon_orders (token, phone, kind, plan_id, plan_name, days, amount_kop, promo_code, payer)
        VALUES (:token, :phone, :kind, :plan_id, :plan_name, :days, :amount, :promo, :payer)');
    $stmt->execute([
        ':token' => $token, ':phone' => $phone, ':kind' => $kind, ':plan_id' => $planId,
        ':plan_name' => $name, ':days' => $days, ':amount' => $baseRub * 100, ':promo' => $promoCode, ':payer' => $payer,
    ]);
    return ozon_find_order($token);
}

// Выдать доступ по оплаченной заявке.
function ozon_fulfill(array $order, string $by): array
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
        invite_code = :code WHERE id = :id");
    $stmt->execute([':by' => $by, ':code' => $inviteCode, ':id' => $order['id']]);
    return ozon_find_order((string) $order['token']);
}

function ozon_admin_payload(): array
{
    ensure_ozon_schema();
    $orders = db()->query('SELECT * FROM ozon_orders ORDER BY id DESC LIMIT 150')->fetchAll();
    return [
        'enabled' => ozon_enabled(),
        'payUrl' => ozon_pay_url(),
        'orders' => array_map(static function (array $o): array {
            $pub = ozon_order_public($o);
            $pub['id'] = (int) $o['id'];
            $pub['confirmedBy'] = $o['confirmed_by'] ?? null;
            $pub['promoCode'] = $o['promo_code'] ?? null;
            return $pub;
        }, $orders),
    ];
}

function ozon_handle_routes(string $uri, string $method): void
{
    if (strpos($uri, '/api/ozon/') !== 0 && strpos($uri, '/api/admin/ozon') !== 0) {
        return;
    }
    ensure_ozon_schema();

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
        $payer = ozon_clean_payer((string) ($data['payer'] ?? ''));
        $order = ozon_create_order($phone, $kind, (string) ($data['plan_id'] ?? ''), isset($data['promoCode']) ? (string) $data['promoCode'] : null, $payer);
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

    // Клиент сообщает, что перевёл деньги
    if (preg_match('#^/api/ozon/orders/([a-f0-9]{24})/paid$#', $uri, $m) === 1 && $method === 'POST') {
        db()->prepare("UPDATE ozon_orders SET claimed_at = COALESCE(claimed_at, CURRENT_TIMESTAMP) WHERE token = :t AND status = 'pending'")
            ->execute([':t' => $m[1]]);
        $order = ozon_find_order($m[1]);
        if (!$order) {
            json_response(['message' => 'Заявка не найдена'], 404);
        }
        json_response(['order' => ozon_order_public($order, true)]);
    }

    if (preg_match('#^/api/ozon/orders/([a-f0-9]{24})/cancel$#', $uri, $m) === 1 && $method === 'POST') {
        db()->prepare("UPDATE ozon_orders SET status = 'cancelled' WHERE token = :t AND status = 'pending'")->execute([':t' => $m[1]]);
        json_response(['message' => 'Заявка отменена']);
    }

    if ($uri === '/api/admin/ozon' && $method === 'GET') {
        require_admin();
        json_response(ozon_admin_payload());
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
