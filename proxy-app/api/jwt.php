<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function b64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string
{
    $padding = 4 - (strlen($data) % 4);
    if ($padding < 4) {
        $data .= str_repeat('=', $padding);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function jwt_sign(array $payload): string
{
    $cfg = config();
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $h = b64url_encode(json_encode($header, JSON_UNESCAPED_SLASHES) ?: '{}');
    $p = b64url_encode(json_encode($payload, JSON_UNESCAPED_SLASHES) ?: '{}');
    $sig = hash_hmac('sha256', $h . '.' . $p, $cfg['jwt_secret'], true);
    $s = b64url_encode($sig);
    return $h . '.' . $p . '.' . $s;
}

function jwt_verify(string $token): ?array
{
    $cfg = config();
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    [$h, $p, $s] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', $h . '.' . $p, $cfg['jwt_secret'], true));
    if (!hash_equals($expected, $s)) {
        return null;
    }
    $payload = json_decode(b64url_decode($p), true);
    if (!is_array($payload)) {
        return null;
    }
    if (($payload['exp'] ?? 0) < time()) {
        return null;
    }
    return $payload;
}
