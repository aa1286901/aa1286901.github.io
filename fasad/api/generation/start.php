<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $projectId = (int)($body['projectId'] ?? 0);
    $db = getDB();

    // Проверяем принадлежность проекта
    $projectIndex = null;
    foreach ($db['projects'] as $i => $p) {
        if ($p['id'] === $projectId && $p['user_id'] === $userId) {
            $projectIndex = $i;
            break;
        }
    }

    if ($projectIndex === null) {
        respondError('Проект не найден', 404);
    }

    $project = &$db['projects'][$projectIndex];

    if (isset($body['progress'])) {
        // Обновление прогресса (mock-генерация)
        $project['progress'] = max(0, min(100, (int)$body['progress']));
    } elseif (isset($body['status'])) {
        if (!in_array($body['status'], ['processing', 'completed', 'failed'], true)) {
            respondError('Неверный статус');
        }
        $project['status'] = $body['status'];
        if ($body['status'] === 'completed') {
            $project['progress'] = 100;
        }
    } else {
        // Старт генерации. Материалы и карнизы уже сохранены при создании проекта
        $project['status'] = 'processing';
        $project['progress'] = 0;
    }

    $project['updated_at'] = date('Y-m-d H:i:s');
    unset($project);
    saveDB($db);

    respondSuccess([
        'project_id' => $projectId,
        'status' => $db['projects'][$projectIndex]['status'],
        'progress' => $db['projects'][$projectIndex]['progress'],
    ]);
}
