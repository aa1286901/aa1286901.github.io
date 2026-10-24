<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();

$projectId = (int)($_GET['id'] ?? 0);

// Ищем проект
$project = null;
foreach ($db['projects'] as $p) {
    if ($p['id'] === $projectId && $p['user_id'] === $userId) {
        $project = $p;
        break;
    }
}

if (!$project) {
    respondError('Проект не найден', 404);
}

respondSuccess([
    'status' => $project['status'],
    'progress' => (int)$project['progress'],
    'generated_image' => $project['generated_image'] ?? null,
]);
