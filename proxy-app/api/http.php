<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function send_cors_headers(): void
{
    $cfg = config();
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = $cfg['frontend_origins'] ?? [$cfg['frontend_origin']];

    if (in_array('*', $allowed, true)) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin !== '' && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } else {
        header('Access-Control-Allow-Origin: ' . ($allowed[0] ?? '*'));
    }

    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Key');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Content-Type: application/json; charset=utf-8');
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function normalize_phone(string $input): string
{
    $digits = preg_replace('/\D+/', '', $input) ?? '';
    if (strlen($digits) === 11 && ($digits[0] === '7' || $digits[0] === '8')) {
        return substr($digits, 1, 10);
    }
    if (strlen($digits) === 10) {
        return $digits;
    }
    return '';
}

function display_phone(string $phone10): string
{
    $digits = preg_replace('/\D+/', '', $phone10) ?? '';
    if (strlen($digits) !== 10) {
        return '+7 --- --- -- --';
    }

    return sprintf('+7 %s %s %s %s', substr($digits, 0, 3), substr($digits, 3, 3), substr($digits, 6, 2), substr($digits, 8, 2));
}
