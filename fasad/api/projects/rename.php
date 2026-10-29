<?php
// Переименовать проект. POST { project_id, name }
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respondError('Метод не поддерживается', 405);

$body = getJsonBody();
$projectId = (int)($body['project_id'] ?? 0);
$name = trim(sanitize($body['name'] ?? ''));
if ($name === '' || mb_strlen($name) > 80) respondError('Название — от 1 до 80 символов');

$db = getDB();
foreach ($db['projects'] as $i => $p) {
    if ($p['id'] === $projectId && $p['user_id'] === $userId) {
        $db['projects'][$i]['name'] = $name;
        $db['projects'][$i]['updated_at'] = date('Y-m-d H:i:s');
        saveDB($db);
        respondSuccess(['id' => $projectId, 'name' => $name]);
    }
}
respondError('Проект не найден', 404);
