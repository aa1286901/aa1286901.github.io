<?php
// Временная проверка: доходят ли запросы с хостинга до kie.ai (без ключа, ничего не тратит).
// Ожидаемо: api.kie.ai отвечает 401 «Unauthorized», файловые домены открываются.
header('Content-Type: application/json; charset=utf-8');

$targets = [
    'api' => 'https://api.kie.ai/api/v1/jobs/recordInfo?taskId=check',
    'upload' => 'https://kieai.redpandaai.co/api/file-base64-upload',
    'results' => 'https://tempfile.aiquickdraw.com/',
    'results_static' => 'https://static.aiquickdraw.com/',
    'site' => 'https://kie.ai/',
];

$out = [
    'php' => PHP_VERSION,
    'curl' => function_exists('curl_init'),
    'allow_url_fopen' => (bool)ini_get('allow_url_fopen'),
    'max_execution_time' => ini_get('max_execution_time'),
    'checks' => [],
];

foreach ($targets as $name => $url) {
    $host = parse_url($url, PHP_URL_HOST);
    $row = ['host' => $host, 'ip' => gethostbyname($host)];
    if ($out['curl']) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_FOLLOWLOCATION => false,
        ]);
        $body = curl_exec($ch);
        $row['http'] = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $row['time'] = round(curl_getinfo($ch, CURLINFO_TOTAL_TIME), 2);
        $row['error'] = curl_error($ch) ?: null;
        $row['body'] = is_string($body) ? mb_substr(strip_tags($body), 0, 160) : null;
        curl_close($ch);
    }
    $out['checks'][$name] = $row;
}

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
