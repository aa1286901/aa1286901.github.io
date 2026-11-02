<?php

declare(strict_types=1);

// Push-уведомления администратору (Web Push, VAPID + aes128gcm) без сторонних библиотек.
// Ключи VAPID создаются один раз и хранятся в базе (таблица app_settings).

function ensure_push_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;
    db()->exec('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    db()->exec('CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
}

function push_b64e(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function push_b64d(string $data): string
{
    $data = strtr($data, '-_', '+/');
    return (string) base64_decode($data . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

// Открытый ключ EC P-256 в «сыром» виде: 0x04 || X || Y
function push_raw_public_key($key): string
{
    $d = openssl_pkey_get_details($key);
    return "\x04" . str_pad($d['ec']['x'], 32, "\0", STR_PAD_LEFT) . str_pad($d['ec']['y'], 32, "\0", STR_PAD_LEFT);
}

function push_public_key_from_raw(string $raw)
{
    $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $raw;
    $pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
    return openssl_pkey_get_public($pem);
}

function push_new_ec_key()
{
    return openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
}

function push_vapid(): array
{
    ensure_push_schema();
    $row = db()->query("SELECT value FROM app_settings WHERE key = 'vapid'")->fetch();
    if ($row) {
        $v = json_decode((string) $row['value'], true);
        if (is_array($v) && !empty($v['private']) && !empty($v['public'])) {
            return $v;
        }
    }
    $key = push_new_ec_key();
    openssl_pkey_export($key, $pem);
    $v = ['private' => $pem, 'public' => push_b64e(push_raw_public_key($key))];
    db()->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('vapid', :v)")->execute([':v' => json_encode($v)]);
    return $v;
}

// Подпись ES256: DER → r||s (по 32 байта)
function push_der_to_raw(string $der): string
{
    $pos = 2;
    if (ord($der[1]) & 0x80) {
        $pos += ord($der[1]) & 0x7f;
    }
    $out = '';
    for ($i = 0; $i < 2; $i++) {
        $pos++; // 0x02
        $len = ord($der[$pos++]);
        $int = substr($der, $pos, $len);
        $pos += $len;
        $out .= str_pad(ltrim($int, "\0"), 32, "\0", STR_PAD_LEFT);
    }
    return $out;
}

function push_vapid_header(string $endpoint): string
{
    $v = push_vapid();
    $p = parse_url($endpoint);
    $aud = $p['scheme'] . '://' . $p['host'];
    $header = push_b64e(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
    $claims = push_b64e(json_encode(['aud' => $aud, 'exp' => time() + 12 * 3600, 'sub' => 'mailto:admin@ahmedov.online']));
    openssl_sign($header . '.' . $claims, $sig, $v['private'], OPENSSL_ALGO_SHA256);
    $jwt = $header . '.' . $claims . '.' . push_b64e(push_der_to_raw($sig));
    return 'vapid t=' . $jwt . ', k=' . $v['public'];
}

// Шифрование содержимого по RFC 8291 (aes128gcm)
function push_encrypt(string $payload, string $uaPublicB64, string $authB64): string
{
    $uaPublic = push_b64d($uaPublicB64);
    $authSecret = push_b64d($authB64);
    $local = push_new_ec_key();
    $asPublic = push_raw_public_key($local);
    $shared = openssl_pkey_derive(push_public_key_from_raw($uaPublic), $local, 32);
    if ($shared === false) {
        throw new RuntimeException('ECDH failed');
    }
    $prkKey = hash_hmac('sha256', $shared, $authSecret, true);
    $ikm = hash_hmac('sha256', "WebPush: info\0" . $uaPublic . $asPublic . "\x01", $prkKey, true);
    $salt = random_bytes(16);
    $prk = hash_hmac('sha256', $ikm, $salt, true);
    $cek = substr(hash_hmac('sha256', "Content-Encoding: aes128gcm\0\x01", $prk, true), 0, 16);
    $nonce = substr(hash_hmac('sha256', "Content-Encoding: nonce\0\x01", $prk, true), 0, 12);
    $cipher = openssl_encrypt($payload . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    return $salt . pack('N', 4096) . chr(strlen($asPublic)) . $asPublic . $cipher . $tag;
}

function push_send_one(array $sub, string $payload): int
{
    $body = push_encrypt($payload, (string) $sub['p256dh'], (string) $sub['auth']);
    $ch = curl_init((string) $sub['endpoint']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . push_vapid_header((string) $sub['endpoint']),
            'Content-Encoding: aes128gcm',
            'Content-Type: application/octet-stream',
            'TTL: 86400',
            'Urgency: high',
        ],
    ]);
    curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code;
}

// Отправить уведомление всем подписанным устройствам администратора
function push_notify_admins(string $title, string $body, string $url = '', string $tag = 'payments'): int
{
    if (!function_exists('curl_init') || !function_exists('openssl_pkey_derive')) {
        return 0;
    }
    ensure_push_schema();
    $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url, 'tag' => $tag], JSON_UNESCAPED_UNICODE);
    $sent = 0;
    foreach (db()->query('SELECT * FROM push_subscriptions')->fetchAll() as $sub) {
        try {
            $code = push_send_one($sub, (string) $payload);
        } catch (Throwable $e) {
            $code = 0;
        }
        if ($code === 404 || $code === 410) {
            db()->prepare('DELETE FROM push_subscriptions WHERE id = :id')->execute([':id' => $sub['id']]);
        } elseif ($code >= 200 && $code < 300) {
            $sent++;
        }
    }
    return $sent;
}

function push_handle_routes(string $uri, string $method): void
{
    if (strpos($uri, '/api/admin/push') !== 0) {
        return;
    }
    require_admin();
    ensure_push_schema();
    if ($uri === '/api/admin/push' && $method === 'GET') {
        $count = (int) db()->query('SELECT COUNT(*) FROM push_subscriptions')->fetchColumn();
        json_response(['publicKey' => push_vapid()['public'], 'devices' => $count]);
    }
    if ($uri === '/api/admin/push/subscribe' && $method === 'POST') {
        $sub = read_json_body()['subscription'] ?? null;
        $endpoint = (string) ($sub['endpoint'] ?? '');
        $p256dh = (string) ($sub['keys']['p256dh'] ?? '');
        $auth = (string) ($sub['keys']['auth'] ?? '');
        if (!preg_match('#^https://#', $endpoint) || $p256dh === '' || $auth === '') {
            json_response(['message' => 'Неверная подписка'], 422);
        }
        db()->prepare('INSERT OR REPLACE INTO push_subscriptions (endpoint, p256dh, auth) VALUES (:e, :p, :a)')
            ->execute([':e' => $endpoint, ':p' => $p256dh, ':a' => $auth]);
        json_response(['ok' => true]);
    }
    if ($uri === '/api/admin/push/unsubscribe' && $method === 'POST') {
        $endpoint = (string) (read_json_body()['endpoint'] ?? '');
        db()->prepare('DELETE FROM push_subscriptions WHERE endpoint = :e')->execute([':e' => $endpoint]);
        json_response(['ok' => true]);
    }
    if ($uri === '/api/admin/push/test' && $method === 'POST') {
        $sent = push_notify_admins('Уведомления работают ✅', 'Так будут приходить новые оплаты клиентов.', '', 'test');
        json_response(['sent' => $sent, 'message' => $sent ? 'Уведомление отправлено' : 'Не удалось отправить — включите уведомления заново']);
    }
    json_response(['message' => 'Not found'], 404);
}
