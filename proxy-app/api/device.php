<?php

declare(strict_types=1);

// Одна активная сессия клиента и данные об устройстве.
// session_id — номер последнего входа: токен с другим номером больше не принимается.
// device_json — что удалось узнать об устройстве (присылает приложение после входа).

function ensure_device_schema(): void
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
    foreach (['session_id', 'login_at', 'device_json', 'device_at', 'device_ip'] as $name) {
        if (!isset($columns[$name])) {
            $pdo->exec("ALTER TABLE users ADD COLUMN {$name} TEXT DEFAULT NULL");
        }
    }
}

function is_admin_auth(array $auth): bool
{
    $phone = normalize_phone((string) ($auth['sub'] ?? ''));
    return ((string) ($auth['role'] ?? 'user')) === 'admin' || ($phone !== '' && $phone === config()['admin_phone']);
}

/** Новый вход клиента: выдаём номер сессии, старые входы перестают работать. */
function session_start_for(string $phone): string
{
    $sid = bin2hex(random_bytes(12));
    db()->prepare('UPDATE users SET session_id = :sid, login_at = CURRENT_TIMESTAMP WHERE phone = :phone')
        ->execute([':sid' => $sid, ':phone' => $phone]);
    return $sid;
}

/** Токен клиента действителен, только если это последний вход. Старые токены без номера живут до первого нового входа. */
function session_check(array $auth): void
{
    if (is_admin_auth($auth)) {
        return;
    }
    $phone = normalize_phone((string) ($auth['sub'] ?? ''));
    if ($phone === '') {
        return;
    }
    $stmt = db()->prepare('SELECT session_id FROM users WHERE phone = :phone LIMIT 1');
    $stmt->execute([':phone' => $phone]);
    $current = (string) ($stmt->fetchColumn() ?: '');
    if ($current === '') {
        return;
    }
    if (!hash_equals($current, (string) ($auth['sid'] ?? ''))) {
        json_response([
            'message' => 'Выполнен вход на другом устройстве. Личный кабинет может быть открыт только на одном устройстве — войдите снова, если это вы.',
            'code' => 'session_replaced',
        ], 401);
    }
}

function client_ip(): string
{
    // Заголовкам прокси верим только если сам запрос пришёл с внутреннего адреса (прокси хостинга),
    // иначе клиент мог бы подставить любой IP.
    $remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $isPublic = $remote !== '' && filter_var($remote, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    if ($isPublic) {
        return $remote;
    }
    foreach ([
        (string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? ''),
        trim(explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))[0]),
        (string) ($_SERVER['HTTP_X_REAL_IP'] ?? ''),
    ] as $ip) {
        if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }
    return $remote;
}

/** Оставляем только известные поля и обрезаем длину — данные приходят от клиента. */
function device_clean(array $in): array
{
    $str = [
        'os', 'osVersion', 'model', 'modelCode', 'brand', 'browser', 'browserVersion', 'app',
        'screen', 'language', 'languages', 'timezone', 'theme', 'connection', 'ua', 'arch',
    ];
    $out = [];
    foreach ($str as $k) {
        if (isset($in[$k]) && (is_string($in[$k]) || is_numeric($in[$k]))) {
            $v = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string) $in[$k]) ?? '');
            if ($v !== '') {
                $out[$k] = mb_substr($v, 0, $k === 'ua' ? 400 : 120);
            }
        }
    }
    foreach (['memory', 'cores', 'touchPoints'] as $k) {
        if (isset($in[$k]) && is_numeric($in[$k])) {
            $out[$k] = max(0, min(1024, (float) $in[$k]));
        }
    }
    foreach (['standalone', 'touch'] as $k) {
        if (isset($in[$k])) {
            $out[$k] = (bool) $in[$k];
        }
    }
    return $out;
}

function device_save(string $phone, array $data): void
{
    $clean = device_clean($data);
    db()->prepare('UPDATE users SET device_json = :j, device_at = CURRENT_TIMESTAMP, device_ip = :ip WHERE phone = :phone')
        ->execute([
            ':j' => json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':ip' => client_ip(),
            ':phone' => $phone,
        ]);
}

function device_admin_fields(array $row): array
{
    $dev = json_decode((string) ($row['device_json'] ?? ''), true);
    return [
        'device' => is_array($dev) ? $dev : null,
        'deviceAt' => $row['device_at'] ?? null,
        'deviceIp' => $row['device_ip'] ?? null,
        'loginAt' => $row['login_at'] ?? null,
    ];
}
