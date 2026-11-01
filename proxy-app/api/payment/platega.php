<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function platega_config(): array
{
    // Load .env explicitly if not already loaded
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

    $cfg = config();

    return [
        'merchant_id' => trim((string) getenv('PLATEGA_MERCHANT_ID')),
        'secret' => trim((string) getenv('PLATEGA_SECRET')),
        'api_base' => rtrim((string) (getenv('PLATEGA_API_BASE') ?: 'https://app.platega.io'), '/'),
        'currency' => trim((string) (getenv('PLATEGA_CURRENCY') ?: 'RUB')),
        'success_statuses' => ['PAID', 'SUCCESS', 'SUCCEEDED', 'COMPLETED', 'FINISHED', 'APPROVED'],
    ];
}

function platega_is_configured(): bool
{
    $cfg = platega_config();
    return $cfg['merchant_id'] !== '' && $cfg['secret'] !== '';
}

function platega_http_json(string $method, string $path, ?array $body = null): array
{
    $cfg = platega_config();
    if (!platega_is_configured()) {
        throw new RuntimeException('Platega credentials are not configured.');
    }

    $url = $cfg['api_base'] . $path;
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
        'X-MerchantId: ' . $cfg['merchant_id'],
        'X-Secret: ' . $cfg['secret'],
    ];
    $payload = $body !== null ? json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

    if (!function_exists('curl_init')) {
        throw new RuntimeException('cURL extension is required for Platega integration.');
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
    ]);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException($err !== '' ? $err : 'Platega request failed');
    }

    $decoded = json_decode((string) $raw, true);

    return [
        'status' => $status,
        'raw' => (string) $raw,
        'json' => is_array($decoded) ? $decoded : null,
    ];
}

function platega_extract_content(?array $payload): array
{
    if (!$payload) return [];
    // Ответ Platega приходит в корне, а не в content
    // Проверяем наличие ключей платёжного ответа в корне
    $rootKeys = ['transactionId', 'redirect', 'paymentMethod', 'status', 'merchantId'];
    foreach ($rootKeys as $key) {
        if (array_key_exists($key, $payload)) {
            return $payload; // Данные в корне
        }
    }
    // Если в корне нет, проверяем content
    return is_array($payload['content'] ?? null) ? $payload['content'] : $payload;
}

function platega_extract_token(?array $payload): string
{
    $content = platega_extract_content($payload);
    $candidates = [
        $content['token'] ?? null,
        $content['transactionToken'] ?? null,
        $content['transactionId'] ?? null,
        $content['id'] ?? null,
        $content['uuid'] ?? null,
        $payload['token'] ?? null,
        $payload['transactionToken'] ?? null,
        $payload['transactionId'] ?? null,
        $payload['id'] ?? null,
        $payload['uuid'] ?? null,
    ];

    foreach ($candidates as $value) {
        $token = trim((string) $value);
        if ($token !== '') {
            return $token;
        }
    }

    return '';
}

function platega_extract_payment_id(?array $payload): string
{
    $content = platega_extract_content($payload);
    $candidates = [
        $content['paymentId'] ?? null,
        $content['transactionId'] ?? null,
        $content['id'] ?? null,
        $content['uuid'] ?? null,
        $payload['paymentId'] ?? null,
        $payload['transactionId'] ?? null,
        $payload['id'] ?? null,
        $payload['uuid'] ?? null,
    ];

    foreach ($candidates as $value) {
        $id = trim((string) $value);
        if ($id !== '') {
            return $id;
        }
    }

    return '';
}

function platega_extract_order_id(?array $payload): string
{
    $content = platega_extract_content($payload);
    $candidates = [
        $content['orderId'] ?? null,
        $content['merchantOrderId'] ?? null,
        $payload['orderId'] ?? null,
        $payload['merchantOrderId'] ?? null,
    ];

    foreach ($candidates as $value) {
        $id = trim((string) $value);
        if ($id !== '') {
            return $id;
        }
    }

    return '';
}

function platega_extract_qr_url(?array $payload): string
{
    $content = platega_extract_content($payload);
    $candidates = [
        $content['qrData'] ?? null,
        $content['qrUrl'] ?? null,
        $content['sbpQrUrl'] ?? null,
        $content['paymentUrl'] ?? null,
        $content['paymentLink'] ?? null,
        $content['redirect'] ?? null,
        $content['url'] ?? null,
        $content['link'] ?? null,
        $content['redirectUrl'] ?? null,
        $payload['qrData'] ?? null,
        $payload['qrUrl'] ?? null,
        $payload['sbpQrUrl'] ?? null,
        $payload['paymentUrl'] ?? null,
        $payload['paymentLink'] ?? null,
        $payload['redirect'] ?? null,
        $payload['url'] ?? null,
        $payload['link'] ?? null,
        $payload['redirectUrl'] ?? null,
    ];

    foreach ($candidates as $value) {
        $url = trim((string) $value);
        if ($url !== '') {
            return $url;
        }
    }

    return '';
}

function platega_status_label(?array $payload): string
{
    if (!$payload) return 'pending';

    $content = platega_extract_content($payload);
    $candidates = [
        $content['status'] ?? null,
        $content['paymentStatus'] ?? null,
        $content['state'] ?? null,
        $content['transactionState'] ?? null,
        $payload['status'] ?? null,
        $payload['paymentStatus'] ?? null,
        $payload['state'] ?? null,
        $payload['transactionState'] ?? null,
    ];

    foreach ($candidates as $value) {
        $status = strtolower(trim((string) $value));
        if ($status !== '') {
            return $status;
        }
    }

    return 'pending';
}

function platega_is_paid(?array $payload): bool
{
    if (!$payload) return false;

    $cfg = platega_config();
    $content = platega_extract_content($payload);
    $candidates = [
        $content['status'] ?? null,
        $content['paymentStatus'] ?? null,
        $content['state'] ?? null,
        $content['transactionState'] ?? null,
        $payload['status'] ?? null,
        $payload['paymentStatus'] ?? null,
        $payload['state'] ?? null,
        $payload['transactionState'] ?? null,
    ];

    foreach ($candidates as $value) {
        $normalized = strtoupper(trim((string) $value));
        if ($normalized !== '' && in_array($normalized, $cfg['success_statuses'], true)) {
            return true;
        }
    }

    return false;
}

function platega_create_payment(int $amount, string $currency, string $description, string $returnUrl = '', string $failUrl = '', string $payload = ''): array
{
    $body = [
        'command' => 'create_transaction',
        'paymentMethod' => 2,
        'paymentDetails' => [
            'amount' => $amount,
            'currency' => $currency !== '' ? $currency : platega_config()['currency'],
        ],
        'description' => $description,
    ];

    if ($returnUrl !== '') {
        $body['return'] = $returnUrl;
    }
    if ($failUrl !== '') {
        $body['failedUrl'] = $failUrl;
    }
    if ($payload !== '') {
        $body['payload'] = $payload;
    }

    return platega_http_json('POST', '/transaction/process', $body);
}

function platega_get_payment(string $transactionId): array
{
    return platega_http_json('GET', '/transaction/' . rawurlencode($transactionId));
}

function platega_get_sbp_qr_url(string $transactionId, string $merchantId): string
{
    // Platega SBP payment page with QR code (official supported method for merchants)
    // Direct QR code (https://qr.nspk.ru/...) requires Bearer token not available via merchant API
    return "https://pay.platega.io/sbp-qr?id=" . rawurlencode($transactionId) . "&mh=" . rawurlencode($merchantId);
}

function platega_normalize_payment_payload(?array $payload): array
{
    $token = platega_extract_token($payload);
    $paymentId = platega_extract_payment_id($payload);
    $orderId = platega_extract_order_id($payload);
    $qrUrl = platega_extract_qr_url($payload);
    $status = platega_status_label($payload);

    if ($token === '') {
        $token = $paymentId !== '' ? $paymentId : ($orderId !== '' ? $orderId : '');
    }
    if ($paymentId === '') {
        $paymentId = $token;
    }

    return [
        'success' => $payload !== null,
        'status' => $status,
        'content' => [
            'token' => $token,
            'paymentId' => $paymentId,
            'orderId' => $orderId,
            'qrData' => $qrUrl,
            'status' => $status,
        ],
        'raw' => $payload,
    ];
}
