<?php
// Коммерческое предложение проекта: заказчик, размеры дома, строки сметы, скидка, условия.
// GET ?project_id — сохранённое; POST { project_id, kp } — сохранить (номер КП растёт при каждом создании PDF)
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();
$body = $_SERVER['REQUEST_METHOD'] === 'POST' ? getJsonBody() : [];
$projectId = (int)($body['project_id'] ?? $_GET['project_id'] ?? 0);

foreach ($db['projects'] as $i => $p) {
    if ($p['id'] !== $projectId || $p['user_id'] !== $userId) continue;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $kp = $body['kp'] ?? null;
        if (!is_array($kp) || strlen(json_encode($kp)) > 100000) respondError('Неверные данные КП');
        $kp['number'] = (int)($p['kp']['number'] ?? 0) + (!empty($body['issue']) ? 1 : 0);
        $kp['updated_at'] = date('Y-m-d H:i:s');
        $db['projects'][$i]['kp'] = $kp;
        saveDB($db);
        respondSuccess($kp);
    }
    respondSuccess($p['kp'] ?? null);
}
respondError('Проект не найден', 404);
