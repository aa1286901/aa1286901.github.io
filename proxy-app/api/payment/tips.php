<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function tips_config(): array
{
    return [
        'api_base' => rtrim((string) (getenv('TIPS_API_BASE') ?: 'https://pay-api.tips.tips'), '/'),
        'socket_id' => trim((string) getenv('TIPS_SOCKET_ID')),
    ];
}

function tips_http_json(string $method, string $path, ?array $body = null, string $socketId = ''): array
{
    $cfg = tips_config();
    $url = $cfg['api_base'] . $path;
    
    $headers = [
        'Accept: application/json, text/plain, */*',
        'Content-Type: application/json',
        'Origin: https://tips.tips',
        'Referer: https://tips.tips/',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Fetch-Site: same-site',
        'Sec-Fetch-Mode: cors',
        'Sec-Fetch-Dest: empty',
        'Connection: keep-alive',
    ];
    
    if ($socketId !== '') {
        $headers[] = 'X-Socket-Id: ' . $socketId;
    }
    
    $payload = $body !== null ? json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

    if (!function_exists('curl_init')) {
        throw new RuntimeException('cURL extension is required.');
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    }

    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        throw new RuntimeException($err !== '' ? $err : 'Tips request failed');
    }

    $decoded = json_decode((string) $raw, true);

    return [
        'status' => $status,
        'raw' => (string) $raw,
        'json' => is_array($decoded) ? $decoded : null,
    ];
}

function tips_create_payment(array $data): array
{
    return tips_http_json('POST', '/tips/codes/pay', $data);
}

function tips_normalize_payment_response(array $response): array
{
    $json = $response['json'] ?? [];
    
    return [
        'success' => ($response['status'] ?? 0) >= 200 && ($response['status'] ?? 0) < 300,
        'status' => $response['status'] ?? 0,
        'content' => [
            'paymentId' => $json['id'] ?? $json['payment_id'] ?? '',
            'qrUrl' => $json['qr_url'] ?? $json['payment_url'] ?? '',
            'data' => $json,
        ],
        'raw' => $response,
    ];
}