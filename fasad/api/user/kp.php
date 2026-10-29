<?php
// Данные прораба для коммерческого предложения: контакты, свои цены, условия. Запоминаются для следующих КП.
// GET — что сохранено; POST { profile?, prices?, terms? } — дополнить
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../wallet.php';

$userId = requireAuth();
$db = getDB();
$user = &findUser($db, $userId);
$kp = is_array($user['kp'] ?? null) ? $user['kp'] : [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    if (strlen(json_encode($body)) > 50000) respondError('Слишком много данных');
    foreach (['profile', 'prices', 'terms'] as $k) {
        if (isset($body[$k]) && is_array($body[$k])) $kp[$k] = $body[$k];
    }
    $user['kp'] = $kp;
    saveDB($db);
}
respondSuccess($kp + ['name' => $user['name']]);
