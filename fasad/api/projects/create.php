<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();
$body = getJsonBody();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($body['original_image'])) {
    // Создание проекта
    $name = sanitize($body['name'] ?? 'Проект');
    $originalImage = (string)($body['original_image'] ?? '');
    $generatedImage = isset($body['generated_image']) ? (string)$body['generated_image'] : null;
    $design = $body['design'] ?? null;

    // Картинки — только файлы, загруженные через upload/original.php (или демо из assets)
    $imagePattern = '#^(uploads/(originals|generated)/img_[A-Za-z0-9_.]+|assets/[A-Za-z0-9_./-]+)$#';
    if (!preg_match($imagePattern, $originalImage) || strpos($originalImage, '..') !== false) {
        respondError('Неверное фото проекта');
    }
    if ($generatedImage !== null && !preg_match('#^uploads/generated/img_[A-Za-z0-9_.]+$#', $generatedImage)) {
        respondError('Неверный набросок');
    }
    // Разметка фасада хранится как есть, но с ограничением размера
    if ($design !== null && (!is_array($design) || strlen(json_encode($design)) > 100000)) {
        respondError('Неверная разметка');
    }

    $baseMaterialId = $body['base_material_id'] ?? null;
    $facadeMaterialId = $body['facade_material_id'] ?? null;
    $cornices = $body['cornices'] ?? [];

    $newProject = [
        'id' => getNextId($db['projects']),
        'user_id' => $userId,
        'name' => $name,
        'original_image' => $originalImage,
        'generated_image' => $generatedImage,
        'design' => $design,
        'status' => $generatedImage ? 'completed' : 'draft',
        'progress' => $generatedImage ? 100 : 0,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];

    $db['projects'][] = $newProject;
    $projectId = $newProject['id'];

    // Сохраняем материалы
    if ($baseMaterialId) {
        $db['project_materials'][] = [
            'id' => getNextId($db['project_materials']),
            'project_id' => $projectId,
            'material_id' => $baseMaterialId,
            'category' => 'base',
            'selected_variant' => null
        ];
    }
    if ($facadeMaterialId) {
        $db['project_materials'][] = [
            'id' => getNextId($db['project_materials']),
            'project_id' => $projectId,
            'material_id' => $facadeMaterialId,
            'category' => 'facade',
            'selected_variant' => null
        ];
    }

    // Камни из подбора фасада: по одной записи на включённую часть
    foreach (($design['parts'] ?? []) as $partKey => $part) {
        if (is_array($part) && !empty($part['on']) && !empty($part['stone'])) {
            $db['project_materials'][] = [
                'id' => getNextId($db['project_materials']),
                'project_id' => $projectId,
                'material_id' => (string)$part['stone'],
                'category' => (string)$partKey,
                'selected_variant' => isset($part['item']) ? (string)$part['item'] : null
            ];
        }
    }

    // Камни из разметки: по одной записи на зону
    foreach (($design['zones'] ?? []) as $zone) {
        if (!empty($zone['materialId']) && ($zone['type'] ?? '') !== 'opening') {
            $db['project_materials'][] = [
                'id' => getNextId($db['project_materials']),
                'project_id' => $projectId,
                'material_id' => (string)$zone['materialId'],
                'category' => (string)($zone['type'] ?? 'wall'),
                'selected_variant' => (string)($zone['pattern'] ?? '')
            ];
        }
    }

    // Сохраняем карнизы
    if (!empty($cornices)) {
        foreach ($cornices as $corniceId) {
            $db['project_cornices'][] = [
                'id' => getNextId($db['project_cornices']),
                'project_id' => $projectId,
                'cornice_id' => $corniceId,
                'position' => null,
                'variant' => null
            ];
        }
    }

    saveDB($db);
    respondSuccess(['id' => $projectId, 'name' => $name, 'status' => $newProject['status']]);

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

    saveDB($db);
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
