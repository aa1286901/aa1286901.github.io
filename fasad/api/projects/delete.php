<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $projectId = (int)($_GET['id'] ?? 0);
    $db = getDB();

    // Ищем проект пользователя
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

    // Удаляем проект вместе с его материалами и карнизами
    $notThisProject = function($row) use ($projectId) {
        return $row['project_id'] !== $projectId;
    };
    $db['projects'] = array_values(array_filter($db['projects'], function($p) use ($projectId) {
        return $p['id'] !== $projectId;
    }));
    $db['project_materials'] = array_values(array_filter($db['project_materials'], $notThisProject));
    $db['project_cornices'] = array_values(array_filter($db['project_cornices'], $notThisProject));
    saveDB($db);

    // Удаляем загруженные фото проекта (только из папки uploads)
    foreach (['original_image' => UPLOAD_ORIGINALS, 'generated_image' => UPLOAD_GENERATED] as $field => $dir) {
        $image = $project[$field] ?? '';
        if (is_string($image) && preg_match('#(^|/)uploads/(originals|generated)/([A-Za-z0-9_.]+)$#', $image, $m)) {
            $file = $dir . $m[3];
            if (is_file($file)) {
                unlink($file);
            }
        }
    }

    respondSuccess(null, 'Проект удалён');
}
