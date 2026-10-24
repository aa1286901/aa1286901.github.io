<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();
$body = getJsonBody();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($body['original_image'])) {
    // Создание проекта
    $name = sanitize($body['name'] ?? 'Проект');
    $originalImage = $body['original_image'] ?? '';
    $baseMaterialId = $body['base_material_id'] ?? null;
    $facadeMaterialId = $body['facade_material_id'] ?? null;
    $cornices = $body['cornices'] ?? [];

    $newProject = [
        'id' => getNextId('projects'),
        'user_id' => $userId,
        'name' => $name,
        'original_image' => $originalImage,
        'generated_image' => null,
        'status' => 'draft',
        'progress' => 0,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];

    $db['projects'][] = $newProject;
    $projectId = $newProject['id'];

    // Сохраняем материалы
    if ($baseMaterialId) {
        $db['project_materials'][] = [
            'id' => getNextId('project_materials'),
            'project_id' => $projectId,
            'material_id' => $baseMaterialId,
            'category' => 'base',
            'selected_variant' => null
        ];
    }
    if ($facadeMaterialId) {
        $db['project_materials'][] = [
            'id' => getNextId('project_materials'),
            'project_id' => $projectId,
            'material_id' => $facadeMaterialId,
            'category' => 'facade',
            'selected_variant' => null
        ];
    }

    // Сохраняем карнизы
    if (!empty($cornices)) {
        foreach ($cornices as $corniceId) {
            $db['project_cornices'][] = [
                'id' => getNextId('project_cornices'),
                'project_id' => $projectId,
                'cornice_id' => $corniceId,
                'position' => null,
                'variant' => null
            ];
        }
    }

    saveDB();
    respondSuccess(['id' => $projectId, 'name' => $name, 'status' => 'draft']);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($body['projectId'])) {
    // Обновление статуса генерации
    $projectId = (int)$body['projectId'];
    $progress = (int)($body['progress'] ?? 0);
    $status = $body['status'] ?? null;

    // Проверяем принадлежность
    $projectIndex = null;
    foreach ($db['projects'] as $i => $project) {
        if ($project['id'] === $projectId) {
            $projectIndex = $i;
            break;
        }
    }

    if ($projectIndex === null || $db['projects'][$projectIndex]['user_id'] !== $userId) {
        respondError('Проект не найден', 404);
    }

    if ($status) {
        $db['projects'][$projectIndex]['status'] = $status;
    }
    if ($progress > 0) {
        $db['projects'][$projectIndex]['progress'] = $progress;
    }
    $db['projects'][$projectIndex]['updated_at'] = date('Y-m-d H:i:s');

    saveDB();
    respondSuccess(['project_id' => $projectId]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Список проектов
    $projects = array_filter($db['projects'], function($p) use ($userId) {
        return $p['user_id'] === $userId;
    });
    usort($projects, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    respondSuccess($projects);
}
