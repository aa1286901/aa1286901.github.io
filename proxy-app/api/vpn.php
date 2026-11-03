<?php

declare(strict_types=1);

// VPN-подписка: отдельный срок и личная ссылка для каждого клиента прокси.
// Ссылка /api/vpn/sub/{token} отдаёт список серверов, пока VPN оплачен.

// Тарифы VPN. Цены можно задать в .env: VPN_PRICE_90, VPN_PRICE_180, VPN_PRICE_360.
function vpn_plans_payload(): array
{
    $defaults = [90 => 390, 180 => 590, 360 => 890];
    $plans = [];
    foreach ($defaults as $days => $price) {
        $env = getenv('VPN_PRICE_' . $days);
        $amount = ($env !== false && trim((string) $env) !== '') ? (int) preg_replace('/\D+/', '', (string) $env) : $price;
        $plans[] = [
            'id' => 'vpn' . $days,
            'name' => $days . ' дней',
            'durationDays' => $days,
            'durationMonths' => intdiv($days, 30),
            'price' => $amount . ' ₽',
        ];
    }
    return $plans;
}

// Комплект «Прокси + VPN» на тот же срок со скидкой. Цены — COMBO_PRICE_90/180/360 в .env.
function combo_plans_payload(): array
{
    $defaults = [90 => 690, 180 => 990, 360 => 1490];
    $vpnByDays = [];
    foreach (vpn_plans_payload() as $v) {
        $vpnByDays[(int) $v['durationDays']] = (int) preg_replace('/\D+/', '', (string) $v['price']);
    }
    $out = [];
    foreach (plans_payload()['plans'] as $plan) {
        $days = (int) ($plan['durationDays'] ?? 0);
        if (!isset($defaults[$days], $vpnByDays[$days])) {
            continue;
        }
        $env = getenv('COMBO_PRICE_' . $days);
        $price = ($env !== false && trim((string) $env) !== '') ? (int) preg_replace('/\D+/', '', (string) $env) : $defaults[$days];
        $full = plan_price_amount($plan) + $vpnByDays[$days];
        if ($price <= 0 || $price >= $full) {
            continue;
        }
        $out[] = [
            'planId' => (int) $plan['id'],
            'name' => 'Прокси + VPN · ' . $days . ' дней',
            'durationDays' => $days,
            'amount' => $price,
            'price' => $price . ' ₽',
            'fullPrice' => $full . ' ₽',
            'save' => $full - $price,
        ];
    }
    return $out;
}

function combo_plan_by_id(int $planId): ?array
{
    foreach (combo_plans_payload() as $c) {
        if ($c['planId'] === $planId) {
            return $c;
        }
    }
    return null;
}

function vpn_upstream_url(): string
{
    $url = trim((string) (getenv('VPN_UPSTREAM_URL') ?: ''));
    return $url !== '' ? $url : 'https://ahmedov.online/vpn/';
}

function ensure_vpn_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;

    $pdo = db();
    $columns = [];
    foreach ($pdo->query('PRAGMA table_info(users)')->fetchAll() as $col) {
        $columns[(string) $col['name']] = true;
    }
    if (!isset($columns['vpn_expires_at'])) {
        $pdo->exec('ALTER TABLE users ADD COLUMN vpn_expires_at TEXT DEFAULT NULL');
    }
    if (!isset($columns['vpn_token'])) {
        $pdo->exec('ALTER TABLE users ADD COLUMN vpn_token TEXT DEFAULT NULL');
    }
    $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_vpn_token ON users(vpn_token)');
    // Когда администратор последний раз писал ушедшему клиенту (возврат клиентов)
    if (!isset($columns['winback_at'])) {
        $pdo->exec('ALTER TABLE users ADD COLUMN winback_at TEXT DEFAULT NULL');
    }
}

function vpn_public_base(): string
{
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'ahmedov.online');
    $scriptDir = dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
    $base = rtrim(dirname($scriptDir), '/');
    return ($https ? 'https' : 'http') . '://' . $host . $base;
}

function vpn_row_fields(string $phone): array
{
    $stmt = db()->prepare('SELECT vpn_expires_at, vpn_token FROM users WHERE phone = :phone LIMIT 1');
    $stmt->execute([':phone' => $phone]);
    $row = $stmt->fetch();
    return $row ?: ['vpn_expires_at' => null, 'vpn_token' => null];
}

function vpn_days_left(?string $expiresAt): ?int
{
    $expiresAt = trim((string) $expiresAt);
    if ($expiresAt === '') {
        return null;
    }
    $seconds = (new DateTimeImmutable($expiresAt))->getTimestamp() - time();
    return (int) ceil($seconds / 86400);
}

function vpn_is_active(?string $expiresAt): bool
{
    $expiresAt = trim((string) $expiresAt);
    if ($expiresAt === '') {
        return false;
    }
    return new DateTimeImmutable($expiresAt) > new DateTimeImmutable('now');
}

function vpn_payload(string $phone, bool $withLink = true): array
{
    $row = vpn_row_fields($phone);
    $active = vpn_is_active($row['vpn_expires_at'] ?? null);
    $payload = [
        'active' => $active,
        'expiresAt' => $row['vpn_expires_at'] ?? null,
        'daysLeft' => vpn_days_left($row['vpn_expires_at'] ?? null),
        'subUrl' => null,
    ];
    if ($active && $withLink && !empty($row['vpn_token'])) {
        $payload['subUrl'] = vpn_public_base() . '/api/vpn/sub/' . $row['vpn_token'];
    }
    return $payload;
}

function vpn_new_token(): string
{
    return bin2hex(random_bytes(16));
}

// Выдать, продлить или отключить VPN. $mode: 'set' (дней от сегодня), 'add' (прибавить), 'off'.
function vpn_update_user(string $phone, string $mode, int $days = 0, bool $resetToken = false): void
{
    $row = vpn_row_fields($phone);
    $token = (string) ($row['vpn_token'] ?? '');
    if ($token === '' || $resetToken) {
        $token = vpn_new_token();
    }

    $now = new DateTimeImmutable('now');
    $expires = $row['vpn_expires_at'] ?? null;
    if ($mode === 'off') {
        $expires = null;
    } elseif ($mode === 'set') {
        $expires = $days > 0 ? $now->modify('+' . $days . ' days')->format('Y-m-d H:i:s') : null;
    } elseif ($mode === 'add') {
        $base = $now;
        if (!empty($expires)) {
            $current = new DateTimeImmutable((string) $expires);
            if ($current > $base) {
                $base = $current;
            }
        }
        $expires = $base->modify('+' . max(1, $days) . ' days')->format('Y-m-d H:i:s');
    }

    $stmt = db()->prepare('UPDATE users SET vpn_expires_at = :exp, vpn_token = :token WHERE phone = :phone');
    $stmt->execute([':exp' => $expires, ':token' => $token, ':phone' => $phone]);
}

function vpn_fetch_upstream(): array
{
    static $memo = null;
    if ($memo !== null) {
        return $memo;
    }
    $cacheFile = dirname(__DIR__) . '/database/vpn_upstream_cache.json';
    if (is_file($cacheFile) && (time() - (int) filemtime($cacheFile)) < 600) {
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (is_array($cached) && !empty($cached['body']) && ($cached['url'] ?? '') === vpn_upstream_url()) {
            return $memo = $cached;
        }
    }

    $body = '';
    $headers = [];
    if (function_exists('curl_init')) {
        $ch = curl_init(vpn_upstream_url());
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_HEADERFUNCTION => static function ($ch, string $line) use (&$headers): int {
                $parts = explode(':', $line, 2);
                if (count($parts) === 2) {
                    $headers[strtolower(trim($parts[0]))] = trim($parts[1]);
                }
                return strlen($line);
            },
        ]);
        $result = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if (is_string($result) && $status >= 200 && $status < 300) {
            $body = $result;
        }
    } else {
        $result = @file_get_contents(vpn_upstream_url());
        if (is_string($result)) {
            $body = $result;
        }
    }

    $data = ['url' => vpn_upstream_url(), 'body' => $body, 'headers' => $headers];
    if ($body !== '') {
        @file_put_contents($cacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    } elseif (is_file($cacheFile)) {
        // Источник недоступен — отдаём последнюю сохранённую версию
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (is_array($cached) && ($cached['url'] ?? '') === vpn_upstream_url()) {
            return $memo = $cached;
        }
    }
    return $memo = $data;
}

// Заголовки источника, которые понимают Happ / Incy / v2RayTun — передаём клиенту как есть.
const VPN_PASS_HEADERS = [
    'profile-update-interval', 'subscription-auto-update-enable', 'subscription-auto-update-open-enable',
    'subscription-autoconnect', 'subscription-autoconnect-type', 'subscriptions-collapse', 'hide-settings',
    'support-url', 'profile-web-page-url', 'routing', 'announce', 'x-brand',
];

function vpn_stub_body(string $message): string
{
    // Одна «пустая» запись: приложение покажет её название в списке серверов, трафик никуда не пойдёт.
    return json_encode([[
        'remarks' => $message,
        'log' => ['loglevel' => 'none'],
        'outbounds' => [
            ['tag' => 'proxy', 'protocol' => 'blackhole', 'settings' => new stdClass()],
        ],
    ]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

// Happ/Incy (и похожие) понимают JSON-конфиги Xray; остальные приложения (Karing, Shadowrocket, V2RC…)
// ждут стандартную подписку — base64 со ссылками vless:// и hy2://. ?format=json|links — принудительно.
function vpn_wants_json(): bool
{
    $format = strtolower((string) ($_GET['format'] ?? ''));
    if ($format === 'json') {
        return true;
    }
    if ($format === 'links' || $format === 'base64') {
        return false;
    }
    return (bool) preg_match('/happ|incy|v2raytun|streisand/i', (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''));
}

function vpn_q(array $params): string
{
    $params = array_filter($params, static fn ($v) => $v !== null && $v !== '');
    return http_build_query($params, '', '&', PHP_QUERY_RFC3986);
}

// Один outbound Xray → ссылка vless:// или hy2://
function vpn_outbound_to_link(array $o, string $name): ?string
{
    $ss = (array) ($o['streamSettings'] ?? []);
    $net = (string) ($ss['network'] ?? 'tcp');
    $sec = (string) ($ss['security'] ?? 'none');
    $label = '#' . rawurlencode($name);
    if (($o['protocol'] ?? '') === 'vless') {
        $vn = $o['settings']['vnext'][0] ?? null;
        $user = $vn['users'][0] ?? null;
        if (!$vn || !$user || empty($user['id'])) {
            return null;
        }
        $q = ['encryption' => 'none', 'type' => $net, 'security' => $sec, 'flow' => $user['flow'] ?? ''];
        if ($sec === 'reality') {
            $r = (array) ($ss['realitySettings'] ?? []);
            $q += ['sni' => $r['serverName'] ?? '', 'pbk' => $r['publicKey'] ?? '', 'sid' => $r['shortId'] ?? '', 'fp' => $r['fingerprint'] ?? '', 'spx' => $r['spiderX'] ?? ''];
        } elseif ($sec === 'tls') {
            $t = (array) ($ss['tlsSettings'] ?? []);
            $q += ['sni' => $t['serverName'] ?? '', 'fp' => $t['fingerprint'] ?? '', 'alpn' => implode(',', (array) ($t['alpn'] ?? []))];
        }
        if ($net === 'ws') {
            $w = (array) ($ss['wsSettings'] ?? []);
            $q += ['path' => $w['path'] ?? '/', 'host' => $w['host'] ?? ($w['headers']['Host'] ?? '')];
        } elseif ($net === 'grpc') {
            $g = (array) ($ss['grpcSettings'] ?? []);
            $q += ['serviceName' => $g['serviceName'] ?? '', 'authority' => $g['authority'] ?? '', 'mode' => !empty($g['multiMode']) ? 'multi' : 'gun'];
        } elseif ($net === 'xhttp' || $net === 'splithttp') {
            $x = (array) ($ss['xhttpSettings'] ?? $ss['splithttpSettings'] ?? []);
            $q += ['path' => $x['path'] ?? '/', 'host' => $x['host'] ?? '', 'mode' => $x['mode'] ?? ''];
        } elseif ($net === 'httpupgrade') {
            $h = (array) ($ss['httpupgradeSettings'] ?? []);
            $q += ['path' => $h['path'] ?? '/', 'host' => $h['host'] ?? ''];
        }
        return 'vless://' . rawurlencode((string) $user['id']) . '@' . $vn['address'] . ':' . (int) $vn['port'] . '?' . vpn_q($q) . $label;
    }
    if (($o['protocol'] ?? '') === 'hysteria') {
        $set = (array) ($o['settings'] ?? []);
        $auth = (string) ($ss['hysteriaSettings']['auth'] ?? '');
        $t = (array) ($ss['tlsSettings'] ?? []);
        if (empty($set['address']) || $auth === '') {
            return null;
        }
        $q = ['sni' => $t['serverName'] ?? '', 'alpn' => implode(',', (array) ($t['alpn'] ?? [])), 'insecure' => !empty($t['allowInsecure']) ? '1' : ''];
        return 'hy2://' . rawurlencode($auth) . '@' . $set['address'] . ':' . (int) $set['port'] . '?' . vpn_q($q) . $label;
    }
    return null;
}

// JSON-конфиги Xray → base64-список ссылок (конфиги «АВТО» с несколькими серверами пропускаем — это дубли)
function vpn_json_to_links(string $body): ?string
{
    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        return null;
    }
    $links = [];
    foreach ($decoded as $cfg) {
        if (!is_array($cfg)) {
            continue;
        }
        $obs = array_values(array_filter((array) ($cfg['outbounds'] ?? []), static fn ($o) => is_array($o) && in_array($o['protocol'] ?? '', ['vless', 'hysteria'], true)));
        if (count($obs) !== 1) {
            continue;
        }
        $link = vpn_outbound_to_link($obs[0], trim((string) ($cfg['remarks'] ?? 'VPN')));
        if ($link !== null) {
            $links[$link] = true;
        }
    }
    return $links ? base64_encode(implode("\n", array_keys($links))) : null;
}

function vpn_send_stub(string $title, string $message, int $expireTs): never
{
    if (!vpn_wants_json()) {
        // Для обычных приложений — одна «пустая» запись с текстом, чтобы клиент увидел причину
        header('Content-Type: text/plain; charset=utf-8');
        header('Profile-Title: base64:' . base64_encode($title));
        header('Profile-Update-Interval: 1');
        header('Subscription-Userinfo: upload=0; download=0; total=0; expire=' . max(0, $expireTs));
        echo base64_encode('vless://00000000-0000-0000-0000-000000000000@127.0.0.1:1?encryption=none&type=tcp&security=none#' . rawurlencode($message));
        exit;
    }
    header('Content-Type: application/json; charset=utf-8');
    header('Profile-Title: base64:' . base64_encode($title));
    header('Profile-Update-Interval: 1');
    header('Announce: base64:' . base64_encode($message));
    header('Support-Url: https://t.me/ahmedov_ml');
    header('Profile-Web-Page-Url: https://ahmedov.online/proxy/app');
    header('Subscription-Userinfo: upload=0; download=0; total=0; expire=' . max(0, $expireTs));
    echo vpn_stub_body($message);
    exit;
}

function vpn_serve_subscription(string $token): never
{
    header_remove('Content-Type');
    $token = preg_replace('/[^a-f0-9]/', '', strtolower($token)) ?? '';
    $user = null;
    if ($token !== '') {
        $stmt = db()->prepare('SELECT phone, vpn_expires_at FROM users WHERE vpn_token = :token LIMIT 1');
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch() ?: null;
    }

    $title = 'VPN | ahmedov.proxy';
    if (!$user) {
        vpn_send_stub($title, '⛔ Подписка не найдена — откройте вкладку VPN в ahmedov.proxy', 0);
    }
    $expireTs = !empty($user['vpn_expires_at']) ? (new DateTimeImmutable((string) $user['vpn_expires_at']))->getTimestamp() : 0;
    if (!vpn_is_active($user['vpn_expires_at'] ?? null)) {
        vpn_send_stub($title, '⛔ Подписка VPN окончена — продлите в приложении ahmedov.proxy', $expireTs);
    }

    $upstream = vpn_fetch_upstream();
    if (($upstream['body'] ?? '') === '') {
        vpn_send_stub($title, '⏳ Список серверов обновляется — обновите подписку через минуту', $expireTs);
    }

    $headers = $upstream['headers'] ?? [];
    $body = (string) $upstream['body'];
    $contentType = $headers['content-type'] ?? 'text/plain; charset=utf-8';
    if (!vpn_wants_json()) {
        $links = vpn_json_to_links($body);
        if ($links !== null) {
            $body = $links;
            $contentType = 'text/plain; charset=utf-8';
        }
    }
    header('Content-Type: ' . $contentType);
    foreach (VPN_PASS_HEADERS as $name) {
        if (isset($headers[$name]) && $headers[$name] !== '') {
            header($name . ': ' . $headers[$name]);
        }
    }
    header('Profile-Title: ' . ($headers['profile-title'] ?? ('base64:' . base64_encode($title))));
    header("Content-Disposition: inline; filename*=utf-8''" . rawurlencode($title));
    header('Subscription-Userinfo: upload=0; download=0; total=0; expire=' . $expireTs);
    echo $body;
    exit;
}

// Список серверов для вкладки VPN: только названия, без ключей и адресов.
function vpn_server_list(): array
{
    $upstream = vpn_fetch_upstream();
    $body = trim((string) ($upstream['body'] ?? ''));
    $items = [];
    if ($body === '') {
        return $items;
    }

    $decoded = json_decode($body, true);
    if (!is_array($decoded)) {
        $maybe = base64_decode($body, true);
        if ($maybe !== false && str_contains($maybe, '://')) {
            $body = $maybe;
        }
    }

    if (is_array($decoded)) {
        foreach ($decoded as $entry) {
            if (!is_array($entry)) {
                continue;
            }
            $name = trim((string) ($entry['remarks'] ?? ''));
            if ($name === '') {
                continue;
            }
            $protocol = '';
            $network = '';
            foreach (($entry['outbounds'] ?? []) as $ob) {
                if (($ob['tag'] ?? '') === 'proxy') {
                    $protocol = (string) ($ob['protocol'] ?? '');
                    $network = (string) ($ob['streamSettings']['network'] ?? '');
                    break;
                }
            }
            $items[] = ['name' => $name, 'protocol' => $protocol, 'network' => $network];
        }
    } else {
        foreach (preg_split('/\r?\n/', $body) as $line) {
            $line = trim($line);
            if (!preg_match('#^([a-z0-9]+)://#i', $line, $m)) {
                continue;
            }
            $hash = strpos($line, '#');
            $name = $hash !== false ? rawurldecode(substr($line, $hash + 1)) : $m[1];
            $items[] = ['name' => trim($name), 'protocol' => strtolower($m[1]), 'network' => ''];
        }
    }

    $out = [];
    foreach ($items as $item) {
        $name = $item['name'];
        $isGroup = str_contains($name, '⬇');
        $isAuto = !$isGroup && (bool) preg_match('/авто/iu', $name);
        $cc = '';
        if (preg_match('/^([\x{1F1E6}-\x{1F1FF}]{2})/u', $name, $fm)) {
            $chars = preg_split('//u', $fm[1], -1, PREG_SPLIT_NO_EMPTY);
            foreach ($chars as $ch) {
                $cc .= chr(mb_ord($ch) - 0x1F1E6 + 65);
            }
        }
        $clean = trim((string) preg_replace('/^[\x{1F1E6}-\x{1F1FF}]{2}\s*/u', '', $name));
        $clean = trim(str_replace(['⬇️', '⬇'], '', $clean));
        $out[] = [
            'name' => $clean,
            'cc' => $cc,
            'protocol' => $item['protocol'],
            'network' => $item['network'],
            'group' => $isGroup,
            'auto' => $isAuto,
        ];
    }
    return $out;
}
