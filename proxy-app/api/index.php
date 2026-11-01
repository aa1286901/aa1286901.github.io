<?php

declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/payment/platega.php';

function array_keys_recursive(array $array): array
{
    $result = [];
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $result[$key] = array_keys_recursive($value);
        } else {
            $result[] = $key;
        }
    }
    return $result;
}

send_cors_headers();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$scriptDir = dirname($scriptName);
$baseDir = dirname($scriptDir);
if ($baseDir !== '/' && strpos($uri, $baseDir) === 0) {
    $uri = substr($uri, strlen($baseDir));
    $uri = $uri === '' ? '/' : $uri;
}

if (strpos($uri, '/index.php') === 0) {
    $uri = substr($uri, strlen('/index.php'));
    $uri = $uri === '' ? '/' : $uri;
}

if (strpos($uri, '/proxy/api') === 0) {
    $uri = substr($uri, strlen('/proxy'));
    $uri = $uri === '' ? '/' : $uri;
}

// debug helper removed — diagnostics completed

function plans_payload(): array
{
    $m3 = 3 * 30;
    $m6 = 6 * 30;
    $m12 = 12 * 30;
    $plans = [
        [
            'id' => 301,
            'name' => $m3 . ' дней',
            'durationMonths' => 3,
            'durationDays' => $m3,
            'price' => '490 ₽',
            'benefits' => ['Telegram + WhatsApp прокси', 'Мгновенная активация', 'Безлимитный трафик'],
        ],
        [
            'id' => 302,
            'name' => $m6 . ' дней',
            'durationMonths' => 6,
            'durationDays' => $m6,
            'price' => '690 ₽',
            'benefits' => ['Бесплатное переключение серверов', 'Низкая задержка', 'Поддержка 24/7'],
        ],
        [
            'id' => 303,
            'name' => $m12 . ' дней',
            'durationMonths' => 12,
            'durationDays' => $m12,
            'price' => '990 ₽',
            'benefits' => ['Максимальная выгода', 'Zero logs / приватность', 'Подключение в 1 клик'],
        ],
    ];

    return [
        'plans' => $plans,
        'supportUrl' => config()['support_url'],
    ];
}

function payment_banks_payload(): array
{
    return [
        ['id' => 'sber', 'name' => 'СберБанк', 'icon' => 'fa-solid fa-building-columns'],
        ['id' => 'tbank', 'name' => 'Т-Банк', 'icon' => 'fa-solid fa-credit-card'],
        ['id' => 'vtb', 'name' => 'ВТБ', 'icon' => 'fa-solid fa-landmark'],
        ['id' => 'alfabank', 'name' => 'Альфа-Банк', 'icon' => 'fa-solid fa-a'],
        ['id' => 'gazprombank', 'name' => 'Газпромбанк', 'icon' => 'fa-solid fa-g'],
        ['id' => 'other', 'name' => 'Другой банк', 'icon' => 'fa-solid fa-mobile-screen-button'],
    ];
}

function payment_configured(): bool
{
    return platega_is_configured();
}

function plan_by_id(int $planId): ?array
{
    foreach (plans_payload()['plans'] as $plan) {
        if ((int) ($plan['id'] ?? 0) === $planId) {
            return $plan;
        }
    }
    return null;
}

function plan_price_amount(array $plan): int
{
    $digits = preg_replace('/\D+/', '', (string) ($plan['price'] ?? '')) ?? '0';
    return (int) $digits;
}

function promo_code_data(string $code): ?array
{
    $value = trim($code);
    if ($value === '') {
        return null;
    }

    $stmt = db()->prepare('SELECT id, code, plan_id, discount_amount, price_label, is_active FROM promo_codes WHERE UPPER(code) = UPPER(:code) LIMIT 1');
    $stmt->execute([':code' => $value]);
    $row = $stmt->fetch();
    if (!$row) return null;
    if (((int) ($row['is_active'] ?? 0)) !== 1) return null;

    $plan = plan_by_id((int) ($row['plan_id'] ?? 0));
    $name = $plan ? ($plan['name'] ?? '') : '';
    $amount = (int) ($row['discount_amount'] ?? 0);

    return [
        'id' => (int) ($row['id'] ?? 0),
        'code' => (string) ($row['code'] ?? ''),
        'planId' => (int) ($row['plan_id'] ?? 0),
        'amount' => $amount,
        'priceLabel' => (string) ($row['price_label'] ?? ''),
        'name' => $name,
    ];
}

function payment_status_is_paid(?array $json): bool
{
    return platega_is_paid($json);
}

function payment_status_label(?array $json): string
{
    return platega_status_label($json);
}

function ensure_payments_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;

    $pdo = db();
    $pdo->exec('
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      plan_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      provider_token TEXT NOT NULL UNIQUE,
      provider_payment_id TEXT,
      provider_order_id TEXT,
      provider_bank_id TEXT,
      provider_qr_url TEXT,
      status TEXT NOT NULL DEFAULT "created",
      provider_payload_json TEXT,
      invite_code TEXT,
      subscription_type TEXT,
      expires_at TEXT,
      paid_at TEXT,
      fulfilled_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_payments_provider_token ON payments(provider_token)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_payments_phone_created ON payments(phone, created_at DESC)');
}

function ensure_promo_schema(): void
{
        static $ensured = false;
        if ($ensured) return;
        $ensured = true;

        $pdo = db();
        $pdo->exec('
        CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            plan_id INTEGER NOT NULL,
            discount_amount INTEGER NOT NULL DEFAULT 0,
            price_label TEXT DEFAULT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');

        $pdo->exec('CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code)');
}

    ensure_promo_schema();
function find_payment_by_token(string $token): ?array
{
    ensure_payments_schema();
    $stmt = db()->prepare(
        'SELECT id, phone, plan_id, plan_name, duration_days, amount, provider_token, provider_payment_id,
                provider_order_id, provider_bank_id, provider_qr_url, status, provider_payload_json,
                invite_code, subscription_type, expires_at, paid_at, fulfilled_at, created_at, updated_at
         FROM payments
         WHERE provider_token = :token
         LIMIT 1'
    );
    $stmt->execute([':token' => $token]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function map_payment_order_row(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'phone' => (string) $row['phone'],
        'displayPhone' => display_phone((string) $row['phone']),
        'planId' => (int) $row['plan_id'],
        'planName' => (string) $row['plan_name'],
        'durationDays' => (int) $row['duration_days'],
        'amount' => (int) $row['amount'],
        'token' => (string) $row['provider_token'],
        'paymentId' => (string) ($row['provider_payment_id'] ?? ''),
        'orderId' => (string) ($row['provider_order_id'] ?? ''),
        'qrUrl' => (string) ($row['provider_qr_url'] ?? ''),
        'status' => (string) ($row['status'] ?? 'pending'),
        'inviteCode' => (string) ($row['invite_code'] ?? ''),
        'subscriptionType' => (string) ($row['subscription_type'] ?? ''),
        'expiresAt' => (string) ($row['expires_at'] ?? ''),
        'paidAt' => $row['paid_at'] ?? null,
        'fulfilledAt' => $row['fulfilled_at'] ?? null,
    ];
}

function store_created_payment(string $phone, array $plan, int $amount, string $bankId, array $content, array $providerPayload): array
{
    ensure_payments_schema();
    $stmt = db()->prepare(
        'INSERT INTO payments (
            phone, plan_id, plan_name, duration_days, amount, provider_token, provider_payment_id,
            provider_order_id, provider_bank_id, provider_qr_url, status, provider_payload_json, created_at, updated_at
         ) VALUES (
            :phone, :plan_id, :plan_name, :duration_days, :amount, :provider_token, :provider_payment_id,
            :provider_order_id, :provider_bank_id, :provider_qr_url, :status, :provider_payload_json, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         )'
    );
    $stmt->execute([
        ':phone' => $phone,
        ':plan_id' => (int) $plan['id'],
        ':plan_name' => (string) $plan['name'],
        ':duration_days' => (int) ($plan['durationDays'] ?? 0),
        ':amount' => $amount,
        ':provider_token' => (string) ($content['token'] ?? ''),
        ':provider_payment_id' => (string) ($content['paymentId'] ?? ''),
        ':provider_order_id' => (string) ($content['orderId'] ?? ''),
        ':provider_bank_id' => $bankId,
        ':provider_qr_url' => (string) ($content['qrData'] ?? ''),
        ':status' => payment_status_label($providerPayload),
        ':provider_payload_json' => json_encode($providerPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    $row = find_payment_by_token((string) ($content['token'] ?? ''));
    if (!$row) {
        throw new RuntimeException('Не удалось сохранить платёж.');
    }
    return $row;
}

function update_payment_provider_snapshot(string $token, array $providerPayload): array
{
    ensure_payments_schema();
    $status = payment_status_label($providerPayload);
    $content = is_array($providerPayload['content'] ?? null) ? $providerPayload['content'] : [];
    $stmt = db()->prepare(
        'UPDATE payments
         SET status = :status,
             provider_payload_json = :provider_payload_json,
             provider_payment_id = COALESCE(NULLIF(:provider_payment_id, ""), provider_payment_id),
             provider_order_id = COALESCE(NULLIF(:provider_order_id, ""), provider_order_id),
             provider_qr_url = COALESCE(NULLIF(:provider_qr_url, ""), provider_qr_url),
             paid_at = CASE
                 WHEN :is_paid = 1 AND paid_at IS NULL THEN CURRENT_TIMESTAMP
                 ELSE paid_at
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE provider_token = :token'
    );
    $stmt->execute([
        ':status' => $status,
        ':provider_payload_json' => json_encode($providerPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':provider_payment_id' => (string) ($content['paymentId'] ?? ''),
        ':provider_order_id' => (string) ($content['orderId'] ?? ''),
        ':provider_qr_url' => (string) ($content['qrData'] ?? ''),
        ':is_paid' => payment_status_is_paid($providerPayload) ? 1 : 0,
        ':token' => $token,
    ]);

    $row = find_payment_by_token($token);
    if (!$row) {
        throw new RuntimeException('Платёж не найден после обновления.');
    }
    return $row;
}

function build_extended_expires_at(?array $existingUser, int $durationDays): string
{
    $base = new DateTimeImmutable('now');
    if ($existingUser) {
        $existingExpires = trim((string) ($existingUser['expires_at'] ?? ''));
        if ($existingExpires !== '') {
            $existingDate = new DateTimeImmutable($existingExpires);
            if ($existingDate > $base) {
                $base = $existingDate;
            }
        }
    }

    if ($durationDays !== 0) {
        $modifier = ($durationDays > 0 ? '+' : '') . $durationDays . ' days';
        $base = $base->modify($modifier);
    }

    return $base->format('Y-m-d H:i:s');
}

function fulfill_payment(array $paymentRow): array
{
    if (!empty($paymentRow['fulfilled_at'])) {
        $user = find_user((string) $paymentRow['phone']);
        return [
            'user' => $user ? [
                'phone' => (string) $user['phone'],
                'displayPhone' => display_phone((string) $user['phone']),
            ] : [
                'phone' => (string) $paymentRow['phone'],
                'displayPhone' => display_phone((string) $paymentRow['phone']),
            ],
            'subscription' => $user ? user_subscription_payload($user) : [
                'type' => (string) ($paymentRow['subscription_type'] ?? ''),
                'expiresAt' => (string) ($paymentRow['expires_at'] ?? ''),
                'daysLeft' => 0,
                'supportUrl' => config()['support_url'],
            ],
            'inviteCode' => (string) ($paymentRow['invite_code'] ?? ''),
        ];
    }

    $phone = normalize_phone((string) $paymentRow['phone']);
    if ($phone === '') {
        throw new RuntimeException('Не указан номер телефона для выдачи доступа.');
    }

    $existing = find_user($phone);
    $durationDays = (int) ($paymentRow['duration_days'] ?? 0);
    $expiresAt = build_extended_expires_at($existing, $durationDays);
    $subscriptionType = normalize_subscription_type_to_days((string) ($paymentRow['plan_name'] ?? ($durationDays . ' дней')));
    $saved = save_user([
        'phone' => $phone,
        'subscription_type' => $subscriptionType,
        'expires_at' => $expiresAt,
        'is_active' => true,
        'balance' => $existing ? (int) ($existing['balance'] ?? 0) : 0,
        'regenerate_invite' => true,
    ]);

    $freshUser = find_user($phone);
    if (!$freshUser) {
        throw new RuntimeException('Не удалось загрузить пользователя после выдачи доступа.');
    }

    $inviteCode = (string) ($saved['inviteCode'] ?? $freshUser['invite_code'] ?? '');
    $stmt = db()->prepare(
        'UPDATE payments
         SET status = :status,
             invite_code = :invite_code,
             subscription_type = :subscription_type,
             expires_at = :expires_at,
             fulfilled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE provider_token = :token'
    );
    $stmt->execute([
        ':status' => 'fulfilled',
        ':invite_code' => $inviteCode,
        ':subscription_type' => $subscriptionType,
        ':expires_at' => $expiresAt,
        ':token' => (string) $paymentRow['provider_token'],
    ]);

    return [
        'user' => [
            'phone' => $phone,
            'displayPhone' => display_phone($phone),
        ],
        'subscription' => user_subscription_payload($freshUser),
        'inviteCode' => $inviteCode,
    ];
}

function normalize_subscription_type_to_days(string $value): string
{
    $normalized = preg_replace('/\s+/u', ' ', trim($value)) ?? '';
    if ($normalized === '') {
        return '30 дней';
    }

    if (preg_match('/^(\d+)\s*(?:д|дн|дня|дней)\b/iu', $normalized, $m) === 1) {
        return ((int) $m[1]) . ' дней';
    }

    if (preg_match('/^(\d+)\s*(?:мес|месяц|месяца|месяцев)\b/iu', $normalized, $m) === 1) {
        return (((int) $m[1]) * 30) . ' дней';
    }

    return $normalized;
}

function find_user(string $phone): ?array
{
    $stmt = db()->prepare(
        'SELECT id, phone, subscription_type, expires_at, is_active, COALESCE(balance, 0) AS balance,
                invite_code, invite_code_hash, invite_issued_at, invite_used_at, created_at
         FROM users
         WHERE phone = :phone
         LIMIT 1'
    );
    $stmt->execute([':phone' => $phone]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function user_subscription_payload(array $user): array
{
    $expiresAt = new DateTimeImmutable($user['expires_at']);
    $now = new DateTimeImmutable('now');
    $days = (int) $now->diff($expiresAt)->format('%r%a');
    $daysLeft = $days;

    return [
        'type' => normalize_subscription_type_to_days((string) ($user['subscription_type'] ?? '')),
        'expiresAt' => $user['expires_at'],
        'daysLeft' => $daysLeft,
        'supportUrl' => config()['support_url'],
    ];
}

function require_auth(): array
{
    $token = bearer_token();
    if (!$token) {
        json_response(['message' => 'Unauthorized'], 401);
    }

    $payload = jwt_verify($token);
    if (!$payload) {
        json_response(['message' => 'Invalid token'], 401);
    }

    return $payload;
}

function require_admin(): array
{
    $auth = require_auth();
    $role = (string) ($auth['role'] ?? 'user');
    $phone = normalize_phone((string) ($auth['sub'] ?? ''));
    $isAdminPhone = ($phone !== '' && $phone === config()['admin_phone']);
    if ($role !== 'admin' && !$isAdminPhone) {
        json_response(['message' => 'Forbidden'], 403);
    }
    return $auth;
}

function require_active_subscription_user(array $auth): array
{
    $role = (string) ($auth['role'] ?? 'user');
    $phone = normalize_phone((string) ($auth['sub'] ?? ''));
    if ($role === 'admin' || ($phone !== '' && $phone === config()['admin_phone'])) {
        return $auth;
    }

    $user = find_user($phone);
    if (!$user) {
        json_response(['message' => 'User not found'], 401);
    }

    $isActive = ((int) ($user['is_active'] ?? 0)) === 1;
    $expiresAt = new DateTimeImmutable((string) $user['expires_at']);
    if (!$isActive || $expiresAt <= new DateTimeImmutable('now')) {
        json_response(['message' => 'Подписка не активна. Войдите заново.'], 401);
    }

    return $user;
}

function tcp_ping_ms(string $host, int $port, float $timeoutSeconds = 0.45): ?int
{
    $start = microtime(true);
    $errno = 0;
    $errstr = '';
    $socket = @fsockopen($host, $port, $errno, $errstr, $timeoutSeconds);
    if (!$socket) {
        return null;
    }
    fclose($socket);
    $elapsed = (int) round((microtime(true) - $start) * 1000);
    return max($elapsed, 1);
}

function measure_proxy_ping(string $host, int $port, int $attempts = 1, float $timeoutSeconds = 0.45): array
{
    $samples = [];
    for ($i = 0; $i < $attempts; $i++) {
        $ping = tcp_ping_ms($host, $port, $timeoutSeconds);
        if ($ping !== null) {
            $samples[] = $ping;
        }
    }

    if (count($samples) === 0) {
        return [
            'reachable' => false,
            'ping' => null,
        ];
    }

    sort($samples, SORT_NUMERIC);
    $median = $samples[(int) floor(count($samples) / 2)];
    return [
        'reachable' => true,
        'ping' => (int) $median,
    ];
}

function proxy_probe_targets(array $row): array
{
    $host = trim((string) ($row['host'] ?? ''));
    $port = (int) ($row['port'] ?? 0);

    if ($host !== '' && $port > 0) {
        return [['host' => $host, 'port' => $port]];
    }

    return [];
}

function measure_proxy_targets(array $targets, string $network = ''): array
{
    if (count($targets) === 0) {
        return ['reachable' => false, 'ping' => null];
    }

    $network = strtolower(trim($network));
    $attempts = 1;
    $timeout = 0.45;
    $retryAttempts = 1;
    $retryTimeout = 0.9;

    // WhatsApp proxies can be slower to accept first TCP handshake.
    // Keep a fast first probe, then confirm failures with a slower retry.
    if ($network === 'whatsapp') {
        $attempts = 2;
        $timeout = 0.8;
        $retryAttempts = 2;
        $retryTimeout = 1.5;
    }

    $pings = [];
    foreach ($targets as $target) {
        $host = (string) $target['host'];
        $port = (int) $target['port'];
        $result = measure_proxy_ping($host, $port, $attempts, $timeout);
        if (!$result['reachable']) {
            $result = measure_proxy_ping($host, $port, $retryAttempts, $retryTimeout);
        }
        if ($result['reachable']) {
            $pings[] = (int) $result['ping'];
        }
    }

    if (count($pings) === 0) {
        return ['reachable' => false, 'ping' => null];
    }

    sort($pings, SORT_NUMERIC);
    return ['reachable' => true, 'ping' => $pings[0]];
}

function is_proxy_ping_stale(array $row, int $ttlSeconds): bool
{
    $checked = trim((string) ($row['last_checked_at'] ?? ''));
    if ($checked === '') {
        return true;
    }
    $ts = strtotime($checked);
    if ($ts === false) {
        return true;
    }
    return (time() - $ts) > $ttlSeconds;
}

function refresh_proxy_pings(array $rows): array
{
    if (count($rows) === 0) {
        return $rows;
    }

    $update = db()->prepare(
        'UPDATE proxies
         SET ping_ms = :ping_ms,
             is_reachable = :is_reachable,
             last_checked_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );

    foreach ($rows as $index => $row) {
        $targets = proxy_probe_targets($row);
        $result = measure_proxy_targets($targets, (string) ($row['network'] ?? ''));
        $ping = $result['reachable'] ? (int) $result['ping'] : (int) $row['ping_ms'];

        $update->execute([
            ':id' => (int) $row['id'],
            ':ping_ms' => $ping,
            ':is_reachable' => $result['reachable'] ? 1 : 0,
        ]);

        $rows[$index]['ping_ms'] = $ping;
        $rows[$index]['is_reachable'] = $result['reachable'] ? 1 : 0;
        $rows[$index]['last_checked_at'] = gmdate('Y-m-d H:i:s');
    }

    return $rows;
}

function with_proxy_refresh_lock(string $network, callable $runner): void
{
    $safeNetwork = preg_replace('/[^a-z0-9_-]/i', '', $network) ?: 'proxy';
    $lockPath = sys_get_temp_dir() . '/ahmedov_proxy_ping_' . $safeNetwork . '.lock';
    $handle = @fopen($lockPath, 'c');
    if (!$handle) {
        return;
    }

    if (!@flock($handle, LOCK_EX | LOCK_NB)) {
        fclose($handle);
        return;
    }

    try {
        $runner();
    } finally {
        @flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function refresh_proxy_pings_by_network(string $network): void
{
    if (!in_array($network, ['telegram', 'whatsapp'], true)) {
        return;
    }

    with_proxy_refresh_lock($network, static function () use ($network): void {
        $stmt = db()->prepare(
            'SELECT id, network, name, host, port, ping_ms, is_reachable, last_checked_at, connect_url, is_active, sort_order
             FROM proxies
             WHERE network = :network AND is_active = 1
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute([':network' => $network]);
        $rows = $stmt->fetchAll();
        refresh_proxy_pings($rows);
    });
}

function schedule_proxy_refresh(array $networks): ?string
{
    $valid = [];
    foreach ($networks as $network) {
        if (in_array($network, ['telegram', 'whatsapp'], true)) {
            $valid[$network] = true;
        }
    }
    if (count($valid) === 0) {
        return null;
    }

    $requestedAt = gmdate('Y-m-d H:i:s');
    static $queue = [];
    foreach (array_keys($valid) as $network) {
        $queue[$network] = true;
    }

    static $registered = false;
    if (!$registered) {
        $registered = true;
        register_shutdown_function(static function () use (&$queue): void {
            if (count($queue) === 0) {
                return;
            }

            @ignore_user_abort(true);
            if (function_exists('fastcgi_finish_request')) {
                @fastcgi_finish_request();
            } else {
                @ob_end_flush();
                @flush();
            }

            $networks = array_keys($queue);
            $queue = [];
            foreach ($networks as $network) {
                refresh_proxy_pings_by_network((string) $network);
            }
        });
    }

    return $requestedAt;
}

function map_proxy_row(array $row, bool $withLivePing = false): array
{
    $fallbackPing = (int) $row['ping_ms'];
    $isReachable = ((int) ($row['is_reachable'] ?? 1)) === 1;
    $isRecommended = ((int) ($row['is_recommended'] ?? 0)) === 1;
    $livePing = null;
    if ($withLivePing) {
        $livePing = $isReachable ? $fallbackPing : null;
    }

    return [
        'id' => (int) $row['id'],
        'network' => $row['network'],
        'name' => $row['name'],
        'host' => $row['host'],
        'port' => (int) $row['port'],
        'ping' => $isReachable ? ($livePing ?? $fallbackPing) : null,
        'isReachable' => $isReachable,
        'isRecommended' => $isRecommended,
        'isLivePing' => $withLivePing,
        'lastCheckedAt' => $row['last_checked_at'] ?? null,
        'connectUrl' => $row['connect_url'],
        'isActive' => ((int) $row['is_active']) === 1,
        'sortOrder' => (int) $row['sort_order'],
    ];
}

function map_user_admin_row(array $row): array
{
    $expiresAt = new DateTimeImmutable($row['expires_at']);
    $now = new DateTimeImmutable('now');
    $days = (int) $now->diff($expiresAt)->format('%r%a');

    return [
        'id' => (int) $row['id'],
        'phone' => $row['phone'],
        'displayPhone' => display_phone((string) $row['phone']),
        'subscriptionType' => normalize_subscription_type_to_days((string) ($row['subscription_type'] ?? '')),
        'expiresAt' => $row['expires_at'],
        'daysLeft' => $days,
        'isActive' => ((int) $row['is_active']) === 1,
        'balance' => (int) ($row['balance'] ?? 0),
        'inviteCode' => (string) ($row['invite_code'] ?? ''),
        'hasInvite' => !empty($row['invite_code']),
        'inviteIssuedAt' => $row['invite_issued_at'] ?? null,
        'inviteUsedAt' => $row['invite_used_at'] ?? null,
        'createdAt' => (string) ($row['created_at'] ?? ''),
    ];
}

function build_expires_at_from_request(array $data): string
{
    $expiresAt = trim((string) ($data['expires_at'] ?? ''));
    if ($expiresAt !== '') {
        return $expiresAt;
    }

    $durationDays = null;
    if (array_key_exists('duration_days', $data)) {
        $durationDays = (int) $data['duration_days'];
    } elseif (array_key_exists('duration_months', $data)) {
        // Backward compatibility for old clients sending months.
        $durationDays = (int) $data['duration_months'] * 30;
    } else {
        $durationDays = 30;
    }

    $date = new DateTimeImmutable('now');
    if ($durationDays !== 0) {
        $modifier = ($durationDays > 0 ? '+' : '') . $durationDays . ' days';
        $date = $date->modify($modifier);
    }
    return $date->format('Y-m-d H:i:s');
}

function invite_code_hash(string $code): string
{
    return hash('sha256', strtoupper(trim($code)) . '|' . config()['jwt_secret']);
}

function generate_invite_code(int $length = 8): string
{
    $alphabet = '0123456789';
    $max = strlen($alphabet) - 1;
    $buf = '';
    for ($i = 0; $i < $length; $i++) {
        $buf .= $alphabet[random_int(0, $max)];
    }
    return $buf;
}

function issue_auth_token(string $phone, string $role): array
{
    $payload = [
        'sub' => $phone,
        'role' => $role,
        'exp' => time() + config()['jwt_ttl'],
        'iat' => time(),
    ];
    return [
        'token' => jwt_sign($payload),
        'role' => $role,
    ];
}

function save_user(array $data): array
{
    $phone = normalize_phone((string) ($data['phone'] ?? ''));
    if ($phone === '') {
        json_response(['message' => 'Phone is required'], 422);
    }

    $subscriptionType = normalize_subscription_type_to_days((string) ($data['subscription_type'] ?? '30 дней'));
    if ($subscriptionType === '') {
        $subscriptionType = '30 дней';
    }

    $expiresAt = build_expires_at_from_request($data);
    $isActive = isset($data['is_active']) ? ((int) (bool) $data['is_active']) : 1;
    $balance = max(0, (int) ($data['balance'] ?? 0));
    $existing = find_user($phone);
    $isCreate = $existing === null;
    $hasExistingInvite = !empty($existing['invite_code'] ?? '');
    $regenerateInvite = array_key_exists('regenerate_invite', $data) ? ((bool) $data['regenerate_invite']) : ($isCreate || !$hasExistingInvite);

    $inviteCode = null;
    $inviteCodeStored = $existing['invite_code'] ?? null;
    $inviteHash = $existing['invite_code_hash'] ?? null;
    $inviteIssuedAt = $existing['invite_issued_at'] ?? null;
    $inviteUsedAt = $existing['invite_used_at'] ?? null;
    if ($regenerateInvite) {
        $inviteCode = generate_invite_code(8);
        $inviteCodeStored = $inviteCode;
        $inviteHash = invite_code_hash($inviteCode);
        $inviteIssuedAt = gmdate('Y-m-d H:i:s');
        $inviteUsedAt = null;
    }

    $stmt = db()->prepare(
        'INSERT INTO users (phone, subscription_type, expires_at, is_active, balance, invite_code, invite_code_hash, invite_issued_at, invite_used_at, created_at)
         VALUES (:phone, :type, :expires_at, :is_active, :balance, :invite_code, :invite_code_hash, :invite_issued_at, :invite_used_at, CURRENT_TIMESTAMP)
         ON CONFLICT(phone) DO UPDATE SET
           subscription_type = excluded.subscription_type,
           expires_at = excluded.expires_at,
           is_active = excluded.is_active,
           balance = excluded.balance,
           invite_code = excluded.invite_code,
           invite_code_hash = excluded.invite_code_hash,
           invite_issued_at = excluded.invite_issued_at,
           invite_used_at = excluded.invite_used_at'
    );

    $stmt->execute([
        ':phone' => $phone,
        ':type' => $subscriptionType,
        ':expires_at' => $expiresAt,
        ':is_active' => $isActive,
        ':balance' => $balance,
        ':invite_code' => $inviteCodeStored,
        ':invite_code_hash' => $inviteHash,
        ':invite_issued_at' => $inviteIssuedAt,
        ':invite_used_at' => $inviteUsedAt,
    ]);

    $saved = find_user($phone);
    if (!$saved) {
        json_response(['message' => 'Unable to load saved user'], 500);
    }

    return [
        'user' => map_user_admin_row($saved),
        'inviteCode' => $inviteCode,
    ];
}

if ($uri === '/api/health' && $method === 'GET') {
    json_response(['status' => 'ok']);
}

if ($uri === '/api/plans' && $method === 'GET') {
    json_response(array_merge(plans_payload(), [
        'banks' => payment_banks_payload(),
        'paymentEnabled' => payment_configured(),
    ]));
}

// public promo lookup endpoint (client-side promo validation)
if ($uri === '/api/promo' && $method === 'GET') {
    $code = trim((string) ($_GET['code'] ?? ''));
    if ($code === '') {
        json_response(['message' => 'Code required'], 422);
    }
    $promo = promo_code_data($code);
    if (!$promo) {
        json_response(['message' => 'Promo not found'], 404);
    }
    json_response(['promo' => $promo]);
}

if ($uri === '/api/payments/sbp' && $method === 'POST') {
    if (!payment_configured()) {
        json_response(['message' => 'Платежный провайдер не настроен.'], 503);
    }

    $data = read_json_body();
    $promoCode = trim((string) ($data['promoCode'] ?? $data['promo_code'] ?? ''));
    $promoData = $promoCode !== '' ? promo_code_data($promoCode) : null;
    if ($promoCode !== '' && !$promoData) {
        json_response(['message' => 'Промокод недействителен.'], 422);
    }

    $planId = $promoData['planId'] ?? (int) ($data['planId'] ?? $data['plan_id'] ?? 0);
    $plan = plan_by_id($planId);
    if (!$plan) {
        json_response(['message' => 'Тариф не найден.'], 422);
    }

    $amount = $promoData['amount'] ?? plan_price_amount($plan);
    if ($amount <= 0) {
        json_response(['message' => 'Некорректная сумма тарифа.'], 422);
    }

    $phone = normalize_phone((string) ($data['phone'] ?? ''));
    if ($phone === '') {
        json_response(['message' => 'Укажите корректный номер телефона.'], 422);
    }
    $bankId = trim((string) ($data['bankId'] ?? $data['bank_id'] ?? ''));
    $comment = trim((string) ($data['comment'] ?? ''));
    if ($promoData) {
        $comment = 'Промокод ' . $promoData['code'] . ' / ' . ($plan['name'] ?? '3 месяца');
    }
    if ($comment === '') {
        $comment = 'ahmedov.proxy / ' . ($plan['name'] ?? 'Прокси');
        if ($phone !== '') {
            $comment .= ' / +' . '7' . $phone;
        }
    }

    try {
        $providerResponse = platega_create_payment(
            $amount,
            'RUB',
            $comment,
            '',
            '',
            json_encode([
                'phone' => $phone,
                'planId' => $planId,
                'promoCode' => $promoData['code'] ?? null,
                'bankId' => $bankId,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    } catch (Throwable $e) {
        json_response([
            'message' => 'Не удалось создать платеж в Platega.',
            'details' => $e->getMessage(),
        ], 502);
    }

    $payload = $providerResponse['json'];
    $normalizedPayload = platega_normalize_payment_payload($payload);
    $content = is_array($normalizedPayload['content'] ?? null) ? $normalizedPayload['content'] : [];
    
    // Ensure token exists (fallback if Platega doesn't return one)
    if (($content['token'] ?? '') === '') {
        $fallbackToken = bin2hex(random_bytes(16));
        $normalizedPayload['content']['token'] = $fallbackToken;
        $content['token'] = $fallbackToken;
    }
    // Ensure paymentId exists
    if (($content['paymentId'] ?? '') === '') {
        $normalizedPayload['content']['paymentId'] = $content['token'];
        $content['paymentId'] = $content['token'];
    }
    // Ensure orderId exists
    if (($content['orderId'] ?? '') === '') {
        $normalizedPayload['content']['orderId'] = $content['token'];
        $content['orderId'] = $content['token'];
    }

    // Check if payment creation was successful
    if (($providerResponse['status'] < 200 || $providerResponse['status'] >= 300) || ($content['paymentId'] ?? '') === '') {
        $debugInfo = [
            'status' => $providerResponse['status'],
            'raw' => $providerResponse['raw'] ?? '',
            'payload_keys' => array_keys_recursive($payload ?? []),
        ];
        json_response([
            'message' => $payload['message'] ?? $payload['error'] ?? 'Не удалось создать платеж.',
            'providerStatus' => $providerResponse['status'],
            'debug' => $debugInfo,
        ], 502);
    }

    // Generate Platega SBP payment page URL (official supported method)
    $transactionId = $content['paymentId'];
    $merchantId = platega_config()['merchant_id'] ?? '';
    $paymentPageUrl = "https://pay.platega.io/sbp-qr?id=" . rawurlencode($transactionId) . "&mh=" . rawurlencode($merchantId);
    
    $content['qrData'] = $paymentPageUrl;
    $normalizedPayload['content']['qrData'] = $paymentPageUrl;

    $storedPayment = store_created_payment($phone, $plan, $amount, $bankId, $content, $normalizedPayload);
    json_response([
        'success' => true,
        'payment' => [
            'planId' => $planId,
            'planName' => $plan['name'],
            'amount' => $amount,
            'promoCode' => $promoData['code'] ?? null,
            'phone' => $phone,
            'bankId' => $bankId,
            'token' => (string) ($content['token'] ?? ''),
            'paymentId' => (string) ($content['paymentId'] ?? ''),
            'orderId' => (string) ($content['orderId'] ?? ''),
            'qrUrl' => (string) ($content['qrData'] ?? ''),
            'status' => (string) ($storedPayment['status'] ?? 'pending'),
        ],
        'order' => map_payment_order_row($storedPayment),
    ]);
}

if (preg_match('#^/api/payments/sbp/([^/]+)$#', $uri, $matches) === 1 && $method === 'GET') {
    if (!payment_configured()) {
        json_response(['message' => 'Платежный провайдер не настроен.'], 503);
    }

    $token = trim((string) urldecode($matches[1]));
    if ($token === '') {
        json_response(['message' => 'Токен платежа обязателен.'], 422);
    }

    $storedPayment = find_payment_by_token($token);
    if (!$storedPayment) {
        json_response(['message' => 'Платёж не найден.'], 404);
    }

    $providerLookupId = trim((string) ($storedPayment['provider_payment_id'] ?? ''));
    if ($providerLookupId === '') {
        $providerLookupId = $token;
    }

    try {
        $providerResponse = platega_get_payment($providerLookupId);
    } catch (Throwable $e) {
        json_response([
            'message' => 'Не удалось получить статус платежа в Platega.',
            'details' => $e->getMessage(),
        ], 502);
    }

    $payload = $providerResponse['json'];
    if (($providerResponse['status'] < 200 || $providerResponse['status'] >= 300) || !is_array($payload)) {
        json_response([
            'message' => 'Не удалось получить статус платежа.',
            'providerStatus' => $providerResponse['status'],
        ], 502);
    }

    $normalizedPayload = platega_normalize_payment_payload($payload);
    $normalizedPayload['content']['token'] = $token;
    if (($normalizedPayload['content']['paymentId'] ?? '') === '') {
        $normalizedPayload['content']['paymentId'] = $providerLookupId;
    }

    $storedPayment = update_payment_provider_snapshot($token, $normalizedPayload);
    $fulfillment = null;
    if (payment_status_is_paid($normalizedPayload)) {
        $fulfillment = fulfill_payment($storedPayment);
        $storedPayment = find_payment_by_token($token) ?: $storedPayment;
    }

    json_response([
        'success' => true,
        'isPaid' => payment_status_is_paid($normalizedPayload),
        'payment' => $normalizedPayload['content'] ?? null,
        'order' => map_payment_order_row($storedPayment),
        'fulfillment' => $fulfillment,
        'raw' => $payload,
    ]);
}

// allow cancelling a pending payment locally (marks status = cancelled)
if (preg_match('#^/api/payments/sbp/([^/]+)$#', $uri, $matches) === 1 && $method === 'DELETE') {
    $token = trim((string) urldecode($matches[1]));
    if ($token === '') {
        json_response(['message' => 'Токен платежа обязателен.'], 422);
    }
    $storedPayment = find_payment_by_token($token);
    if (!$storedPayment) {
        json_response(['message' => 'Платёж не найден.'], 404);
    }

    $stmt = db()->prepare('UPDATE payments SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE provider_token = :token');
    $stmt->execute([':status' => 'cancelled', ':token' => $token]);

    json_response(['success' => true]);
}

if ($uri === '/api/auth/phone' && $method === 'POST') {
    $data = read_json_body();
    $phone = normalize_phone((string) ($data['phone'] ?? ''));

    if ($phone === '') {
        json_response(array_merge([
            'status' => 'inactive',
            'message' => 'Некорректный номер телефона.',
        ], plans_payload()), 200);
    }

    if ($phone === config()['admin_phone']) {
        json_response([
            'status' => 'invite_required',
            'message' => 'Введите invite-код администратора.',
            'inviteAvailable' => true,
            'user' => [
                'phone' => $phone,
                'displayPhone' => display_phone($phone),
            ],
        ], 200);
    }

    {
        $user = find_user($phone);
        if (!$user) {
            json_response(array_merge([
                'status' => 'inactive',
                'message' => 'Подписка не найдена. Выберите тариф.',
            ], plans_payload()), 200);
        }

        $isActive = ((int) $user['is_active']) === 1;
        $expiresAt = new DateTimeImmutable($user['expires_at']);
        $now = new DateTimeImmutable('now');

        if (!$isActive || $expiresAt <= $now) {
            json_response(array_merge([
                'status' => 'inactive',
                'message' => 'Подписка не активна или уже завершена.',
            ], plans_payload()), 200);
        }

        json_response([
            'status' => 'invite_required',
            'message' => 'Введите одноразовый invite-код.',
            'inviteAvailable' => !empty($user['invite_code']),
            'user' => [
                'phone' => $phone,
                'displayPhone' => display_phone($phone),
            ],
        ], 200);
    }
}

if ($uri === '/api/auth/invite' && $method === 'POST') {
    $data = read_json_body();
    $phone = normalize_phone((string) ($data['phone'] ?? ''));
    $code = preg_replace('/\D+/', '', (string) ($data['invite_code'] ?? '')) ?? '';

    if ($phone === '' || $code === '') {
        json_response(['message' => 'Введите номер и invite-код.'], 422);
    }

    if ($phone === config()['admin_phone']) {
        if (!hash_equals((string) config()['admin_invite_code'], $code)) {
            json_response(['message' => 'Неверный invite-код администратора.'], 403);
        }

        $session = issue_auth_token($phone, 'admin');
        json_response([
            'status' => 'active',
            'token' => $session['token'],
            'role' => $session['role'],
            'user' => [
                'phone' => $phone,
                'displayPhone' => display_phone($phone),
            ],
        ]);
    }

    $user = find_user($phone);
    if (!$user) {
        json_response(['message' => 'Пользователь не найден.'], 404);
    }

    $isActive = ((int) $user['is_active']) === 1;
    $expiresAt = new DateTimeImmutable($user['expires_at']);
    if (!$isActive || $expiresAt <= new DateTimeImmutable('now')) {
        json_response(['message' => 'Подписка не активна.'], 403);
    }

    $storedCode = preg_replace('/\D+/', '', (string) ($user['invite_code'] ?? '')) ?? '';
    if ($storedCode === '') {
        json_response(['message' => 'Invite-код не выдан. Запросите код у администратора.'], 403);
    }

    if (!hash_equals($storedCode, $code)) {
        json_response(['message' => 'Неверный invite-код.'], 403);
    }

    // Просто помечаем invite-код как использованный, НЕ генерируем новый
    $burn = db()->prepare(
        'UPDATE users
         SET invite_used_at = CURRENT_TIMESTAMP
         WHERE phone = :phone'
    );
    $burn->execute([
        ':phone' => $phone,
    ]);

    $session = issue_auth_token($phone, 'user');
    json_response([
        'status' => 'active',
        'token' => $session['token'],
        'role' => $session['role'],
        'user' => [
            'phone' => $phone,
            'displayPhone' => display_phone($phone),
        ],
        'subscription' => user_subscription_payload($user),
    ]);
}

if ($uri === '/api/auth/me' && $method === 'GET') {
    $auth = require_auth();
    $phone = (string) ($auth['sub'] ?? '');
    $role = (string) ($auth['role'] ?? 'user');
    if ($role !== 'admin' && normalize_phone($phone) === config()['admin_phone']) {
        $role = 'admin';
    }

    $response = [
        'role' => $role,
        'user' => [
            'phone' => $phone,
            'displayPhone' => display_phone($phone),
        ],
    ];

    if ($role !== 'admin') {
        $user = require_active_subscription_user($auth);
        $response['subscription'] = user_subscription_payload($user);
    }

    json_response($response);
}

if ($uri === '/api/proxies' && $method === 'GET') {
    require_active_subscription_user(require_auth());
    $network = $_GET['network'] ?? '';
    if (!in_array($network, ['telegram', 'whatsapp'], true)) {
        json_response(['message' => 'Invalid network'], 422);
    }

    $stmt = db()->prepare(
        'SELECT id, network, name, host, port, ping_ms, is_reachable, last_checked_at, connect_url, is_active, COALESCE(is_recommended, 0) as is_recommended, sort_order
         FROM proxies
         WHERE is_active = 1 AND network = :network
         ORDER BY 
            CASE WHEN COALESCE(is_recommended, 0) = 1 THEN 0 ELSE 1 END ASC,
            sort_order ASC, 
            id ASC'
    );
    $stmt->execute([':network' => $network]);
    $rows = $stmt->fetchAll();

    $items = array_map(static function (array $row): array {
        return map_proxy_row($row, false);
    }, $rows);

    json_response([
        'proxies' => $items,
        'refreshed' => false,
        'refreshQueued' => false,
        'refreshRequestedAt' => null,
    ]);
}

if ($uri === '/api/admin/users' && $method === 'GET') {
    require_admin();

    $stmt = db()->query(
        'SELECT id, phone, subscription_type, expires_at, is_active, COALESCE(balance, 0) AS balance,
                invite_code, invite_code_hash, invite_issued_at, invite_used_at, created_at
         FROM users
         ORDER BY datetime(created_at) DESC, id DESC'
    );
    $users = array_map(static function (array $row): array {
        return map_user_admin_row($row);
    }, $stmt->fetchAll());

    json_response(['users' => $users]);
}

if ($uri === '/api/admin/users' && $method === 'POST') {
    require_admin();
    $saved = save_user(read_json_body());
    json_response([
        'message' => 'User saved',
        'user' => $saved['user'],
        'inviteCode' => $saved['inviteCode'],
    ], 201);
}

if (preg_match('#^/api/admin/users/([^/]+)$#', $uri, $matches) === 1) {
    require_admin();
    $phone = normalize_phone(urldecode((string) $matches[1]));
    if ($phone === '') {
        json_response(['message' => 'Invalid phone'], 422);
    }

    if ($method === 'PATCH') {
        $existing = find_user($phone);
        if (!$existing) {
            json_response(['message' => 'User not found'], 404);
        }

        $data = read_json_body();
        $payload = [
            'phone' => $phone,
            'subscription_type' => $data['subscription_type'] ?? $existing['subscription_type'],
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : ((int) $existing['is_active']) === 1,
            'balance' => $data['balance'] ?? (int) ($existing['balance'] ?? 0),
        ];

        if (array_key_exists('expires_at', $data)) {
            $payload['expires_at'] = $data['expires_at'];
        } elseif (array_key_exists('duration_days', $data)) {
            $payload['duration_days'] = $data['duration_days'];
        } elseif (array_key_exists('duration_months', $data)) {
            $payload['duration_months'] = $data['duration_months'];
        } else {
            $payload['expires_at'] = $existing['expires_at'];
        }

        $saved = save_user($payload);
        json_response([
            'message' => 'User updated',
            'user' => $saved['user'],
            'inviteCode' => $saved['inviteCode'],
        ]);
    }

    if ($method === 'DELETE') {
        $stmt = db()->prepare('DELETE FROM users WHERE phone = :phone');
        $stmt->execute([':phone' => $phone]);
        json_response(['message' => 'User deleted']);
    }
}

if ($uri === '/api/admin/proxies' && $method === 'GET') {
    require_admin();
    $network = $_GET['network'] ?? 'all';
    if (!in_array($network, ['all', 'telegram', 'whatsapp'], true)) {
        json_response(['message' => 'Invalid network'], 422);
    }

    if ($network === 'all') {
        $stmt = db()->query(
            'SELECT id, network, name, host, port, ping_ms, is_reachable, last_checked_at, connect_url, is_active, COALESCE(is_recommended, 0) as is_recommended, sort_order
             FROM proxies
             ORDER BY network ASC, sort_order ASC, id ASC'
        );
        $rows = $stmt->fetchAll();
    } else {
        $stmt = db()->prepare(
            'SELECT id, network, name, host, port, ping_ms, is_reachable, last_checked_at, connect_url, is_active, COALESCE(is_recommended, 0) as is_recommended, sort_order
             FROM proxies
             WHERE network = :network
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute([':network' => $network]);
        $rows = $stmt->fetchAll();
    }

    $items = array_map(static function (array $row): array {
        return map_proxy_row($row, false);
    }, $rows);

    json_response([
        'proxies' => $items,
        'refreshed' => false,
        'refreshQueued' => false,
        'refreshRequestedAt' => null,
    ]);
}

if ($uri === '/api/admin/proxies' && $method === 'POST') {
    require_admin();
    $data = read_json_body();
    $network = (string) ($data['network'] ?? '');
    $name = trim((string) ($data['name'] ?? ''));
    $host = trim((string) ($data['host'] ?? ''));
    $port = (int) ($data['port'] ?? 0);
    $ping = max(1, (int) ($data['ping_ms'] ?? 50));
    $connectUrl = trim((string) ($data['connect_url'] ?? ''));
    $isActive = isset($data['is_active']) ? ((int) (bool) $data['is_active']) : 1;
    $isRecommended = isset($data['is_recommended']) ? ((int) (bool) $data['is_recommended']) : 0;
    $sortOrder = (int) ($data['sort_order'] ?? 100);

    if (!in_array($network, ['telegram', 'whatsapp'], true) || $name === '' || $host === '' || $port <= 0 || $connectUrl === '') {
        json_response(['message' => 'Invalid proxy payload'], 422);
    }

    // Если ставим recommended = 1, снимаем с других серверов этой сети
    if ($isRecommended) {
        db()->prepare('UPDATE proxies SET is_recommended = 0 WHERE network = :network')->execute([':network' => $network]);
    }

    $stmt = db()->prepare(
        'INSERT INTO proxies (network, name, host, port, ping_ms, connect_url, is_active, is_recommended, sort_order)
         VALUES (:network, :name, :host, :port, :ping, :url, :is_active, COALESCE(:is_recommended, 0), :sort_order)'
    );
    $stmt->execute([
        ':network' => $network,
        ':name' => $name,
        ':host' => $host,
        ':port' => $port,
        ':ping' => $ping,
        ':url' => $connectUrl,
        ':is_active' => $isActive,
        ':is_recommended' => $isRecommended,
        ':sort_order' => $sortOrder,
    ]);

    $id = (int) db()->lastInsertId();
    $select = db()->prepare('SELECT id, network, name, host, port, ping_ms, connect_url, is_active, COALESCE(is_recommended, 0) as is_recommended, sort_order FROM proxies WHERE id = :id LIMIT 1');
    $select->execute([':id' => $id]);
    $proxy = $select->fetch();
    if (!$proxy) {
        json_response(['message' => 'Unable to load saved proxy'], 500);
    }

    json_response(['message' => 'Proxy created', 'proxy' => map_proxy_row($proxy)], 201);
}

if (preg_match('#^/api/admin/proxies/(\d+)$#', $uri, $matches) === 1) {
    require_admin();
    $proxyId = (int) $matches[1];
    if ($proxyId <= 0) {
        json_response(['message' => 'Invalid proxy id'], 422);
    }

    if ($method === 'PATCH') {
        $select = db()->prepare('SELECT id, network, name, host, port, ping_ms, connect_url, is_active, COALESCE(is_recommended, 0) as is_recommended, sort_order FROM proxies WHERE id = :id LIMIT 1');
        $select->execute([':id' => $proxyId]);
        $existing = $select->fetch();
        if (!$existing) {
            json_response(['message' => 'Proxy not found'], 404);
        }

        $data = read_json_body();
        $network = array_key_exists('network', $data) ? (string) $data['network'] : $existing['network'];
        if (!in_array($network, ['telegram', 'whatsapp'], true)) {
            json_response(['message' => 'Invalid network'], 422);
        }

        $isRecommended = array_key_exists('is_recommended', $data) ? ((int) (bool) $data['is_recommended']) : (int) ($existing['is_recommended'] ?? 0);
        
        // Если ставим recommended = 1, снимаем с других серверов этой сети
        if ($isRecommended) {
            db()->prepare('UPDATE proxies SET is_recommended = 0 WHERE network = :network AND id != :id')
                ->execute([':network' => $network, ':id' => $proxyId]);
        }

        $stmt = db()->prepare(
            'UPDATE proxies
             SET network = :network,
                 name = :name,
                 host = :host,
                 port = :port,
                 ping_ms = :ping,
                 connect_url = :url,
                 is_active = :is_active,
                 is_recommended = COALESCE(:is_recommended, 0),
                 sort_order = :sort_order
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $proxyId,
            ':network' => $network,
            ':name' => trim((string) ($data['name'] ?? $existing['name'])),
            ':host' => trim((string) ($data['host'] ?? $existing['host'])),
            ':port' => max(1, (int) ($data['port'] ?? $existing['port'])),
            ':ping' => max(1, (int) ($data['ping_ms'] ?? $existing['ping_ms'])),
            ':url' => trim((string) ($data['connect_url'] ?? $existing['connect_url'])),
            ':is_active' => array_key_exists('is_active', $data) ? ((int) (bool) $data['is_active']) : (int) $existing['is_active'],
            ':is_recommended' => $isRecommended,
            ':sort_order' => array_key_exists('sort_order', $data) ? (int) $data['sort_order'] : (int) $existing['sort_order'],
        ]);

        $select->execute([':id' => $proxyId]);
        $updated = $select->fetch();
        if (!$updated) {
            json_response(['message' => 'Proxy not found after update'], 404);
        }

        json_response(['message' => 'Proxy updated', 'proxy' => map_proxy_row($updated)]);
    }

    if ($method === 'DELETE') {
        $stmt = db()->prepare('DELETE FROM proxies WHERE id = :id');
        $stmt->execute([':id' => $proxyId]);
        json_response(['message' => 'Proxy deleted']);
    }

    
}

// admin promo codes endpoints (top-level)
if ($uri === '/api/admin/promo-codes' && $method === 'GET') {
    try {
        require_admin();
        $stmt = db()->query('SELECT id, code, plan_id, discount_amount, price_label, is_active, created_at FROM promo_codes ORDER BY datetime(created_at) DESC, id DESC');
        $rows = $stmt->fetchAll();
        json_response(['promoCodes' => $rows]);
    } catch (Throwable $e) {
        json_response(['message' => 'Server error', 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
}

if ($uri === '/api/admin/promo-codes' && $method === 'POST') {
    try {
        require_admin();
        $data = read_json_body();
        $code = strtoupper(trim((string) ($data['code'] ?? '')));
        $planId = (int) ($data['plan_id'] ?? 0);
        $discount = max(0, (int) ($data['discount_amount'] ?? 0));
        $label = trim((string) ($data['price_label'] ?? '')) ?: null;
        $isActive = isset($data['is_active']) ? ((int) (bool) $data['is_active']) : 1;

        if ($code === '' || $planId <= 0) {
            json_response(['message' => 'Invalid promo payload'], 422);
        }

        $stmt = db()->prepare('INSERT INTO promo_codes (code, plan_id, discount_amount, price_label, is_active) VALUES (:code, :plan_id, :discount, :label, :is_active)');
        $stmt->execute([':code' => $code, ':plan_id' => $planId, ':discount' => $discount, ':label' => $label, ':is_active' => $isActive]);
        $id = (int) db()->lastInsertId();
        $select = db()->prepare('SELECT id, code, plan_id, discount_amount, price_label, is_active, created_at FROM promo_codes WHERE id = :id LIMIT 1');
        $select->execute([':id' => $id]);
        $row = $select->fetch();
        json_response(['message' => 'Promo created', 'promo' => $row], 201);
    } catch (Throwable $e) {
        json_response(['message' => 'Server error', 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
}

if (preg_match('#^/api/admin/promo-codes/(\d+)$#', $uri, $m) === 1) {
    try {
        require_admin();
        $promoId = (int) $m[1];
        if ($promoId <= 0) json_response(['message' => 'Invalid promo id'], 422);

        if ($method === 'PATCH') {
            $select = db()->prepare('SELECT id, code, plan_id, discount_amount, price_label, is_active FROM promo_codes WHERE id = :id LIMIT 1');
            $select->execute([':id' => $promoId]);
            $existing = $select->fetch();
            if (!$existing) json_response(['message' => 'Promo not found'], 404);

            $data = read_json_body();
            $code = array_key_exists('code', $data) ? strtoupper(trim((string) $data['code'])) : $existing['code'];
            $planId = array_key_exists('plan_id', $data) ? (int) $data['plan_id'] : (int) $existing['plan_id'];
            $discount = array_key_exists('discount_amount', $data) ? max(0, (int) $data['discount_amount']) : (int) $existing['discount_amount'];
            $label = array_key_exists('price_label', $data) ? trim((string) $data['price_label']) : $existing['price_label'];
            $isActive = array_key_exists('is_active', $data) ? ((int) (bool) $data['is_active']) : (int) $existing['is_active'];

            $stmt = db()->prepare('UPDATE promo_codes SET code = :code, plan_id = :plan_id, discount_amount = :discount, price_label = :label, is_active = :is_active WHERE id = :id');
            $stmt->execute([':id' => $promoId, ':code' => $code, ':plan_id' => $planId, ':discount' => $discount, ':label' => $label, ':is_active' => $isActive]);

            $select->execute([':id' => $promoId]);
            $updated = $select->fetch();
            json_response(['message' => 'Promo updated', 'promo' => $updated]);
        }

        if ($method === 'DELETE') {
            $stmt = db()->prepare('DELETE FROM promo_codes WHERE id = :id');
            $stmt->execute([':id' => $promoId]);
            json_response(['message' => 'Promo deleted']);
        }
    } catch (Throwable $e) {
        json_response(['message' => 'Server error', 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
}

if ($uri === '/api/admin/add-user' && $method === 'POST') {
    $adminKey = $_SERVER['HTTP_X_ADMIN_KEY'] ?? '';
    if (!hash_equals(config()['admin_key'], $adminKey)) {
        json_response(['message' => 'Forbidden'], 403);
    }
    $saved = save_user(read_json_body());
    json_response([
        'message' => 'User saved',
        'user' => $saved['user'],
        'inviteCode' => $saved['inviteCode'],
    ], 201);
}

json_response(['message' => 'Not found'], 404);

// Просто помечаем как использованный, НЕ генерируем новый
$burn = db()->prepare(
    'UPDATE users
     SET invite_used_at = CURRENT_TIMESTAMP
     WHERE phone = :phone'
);
$burn->execute([':phone' => $phone]);