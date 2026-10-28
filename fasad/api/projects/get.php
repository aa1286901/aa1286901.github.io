<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();
$projectId = (int)($_GET['id'] ?? 0);

// Ищем проект
$project = null;
foreach ($db['projects'] as $p) {
    if ($p['id'] === $projectId) {
        $project = $p;
        break;
    }
}

if (!$project || $project['user_id'] !== $userId) {
    respondError('Проект не найден', 404);
}

// Получаем материалы проекта
$materials = array_filter($db['project_materials'], function($m) use ($projectId) {
    return $m['project_id'] === $projectId;
});

// Получаем карнизы проекта
$cornices = array_filter($db['project_cornices'], function($c) use ($projectId) {
    return $c['project_id'] === $projectId;
});

$project['variants'] = projectVariants($project);
$project['materials'] = $materials;
$project['cornices'] = $cornices;

respondSuccess($project);
