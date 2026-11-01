<?php

declare(strict_types=1);

function config(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    $root = dirname(__DIR__);
    $envFile = $root . '/.env';
    if (is_file($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (strpos($trimmed, '#') === 0 || strpos($trimmed, '=') === false) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (getenv($key) === false) {
                putenv($key . '=' . $value);
            }
        }
    }

    $dbPath = getenv('DB_PATH') ?: 'database/app.db';
    $rawAdminPhone = (string) (getenv('ADMIN_PHONE') ?: '9000010203');
    $adminDigits = preg_replace('/\D+/', '', $rawAdminPhone) ?? '';
    if (strlen($adminDigits) === 11 && ($adminDigits[0] === '7' || $adminDigits[0] === '8')) {
        $adminDigits = substr($adminDigits, 1, 10);
    }
    if (strlen($adminDigits) !== 10) {
        $adminDigits = '9000010203';
    }

    $rawAdminInvite = (string) (getenv('ADMIN_INVITE_CODE') ?: '0010203');
    $adminInviteDigits = preg_replace('/\D+/', '', $rawAdminInvite) ?? '';
    if ($adminInviteDigits === '') {
        $adminInviteDigits = '0010203';
    }

    $frontendOriginRaw = trim((string) (getenv('FRONTEND_ORIGIN') ?: '*'));
    $frontendOrigins = array_values(array_filter(array_map('trim', explode(',', $frontendOriginRaw))));
    if (count($frontendOrigins) === 0) {
        $frontendOrigins = ['*'];
    }

    $config = [
        'jwt_secret' => getenv('JWT_SECRET') ?: 'dev-secret',
        'jwt_ttl' => (int) (getenv('JWT_TTL_SECONDS') ?: 2592000),
        'frontend_origin' => $frontendOrigins[0],
        'frontend_origins' => $frontendOrigins,
        'admin_key' => getenv('ADMIN_KEY') ?: 'dev-admin-key',
        'admin_phone' => $adminDigits,
        'admin_invite_code' => $adminInviteDigits,
        'support_url' => getenv('SUPPORT_URL') ?: 'https://wa.me/79634150424',
        'db_path' => realpath($root . '/' . $dbPath) ?: ($root . '/database/app.db'),
        'payment_api_base' => rtrim((string) (getenv('PAYMENT_API_BASE') ?: ''), '/'),
        'payment_account_id' => (string) (getenv('PAYMENT_ACCOUNT_ID') ?: ''),
        'payment_receipt_email' => (string) (getenv('PAYMENT_RECEIPT_EMAIL') ?: ''),
        'payment_client_type' => (string) (getenv('PAYMENT_CLIENT_TYPE') ?: 'MOBILE'),
        'payment_channel' => (string) (getenv('PAYMENT_CHANNEL') ?: 'SBP'),
    ];

    return $config;
}
