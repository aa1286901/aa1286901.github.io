<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $projectId = (int)($body['projectId'] ?? 0);
    $materials = $body['materials'] ?? [];
    $cornices = $body['cornices'] ?? [];

    // Проверяем принадлежность проекта
    $pdo = getDB();
    $stmt = $pdo->prepare('SELECT user_id FROM projects WHERE id = ?');
    $stmt->execute([$projectId]);
    $project = $stmt->fetch();

    if (!$project || $project['user_id'] !== $userId) {
        respondError('Проект не найден', 404);
    }

    // Обновляем статус проекта
    $stmt = $pdo->prepare('UPDATE projects SET status = ? WHERE id = ?');
    $stmt->execute(['processing', $projectId]);

    // Сохраняем материалы
    foreach ($materials as $mat) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO project_materials (project_id, material_id, category) VALUES (?, ?, ?)');
        $stmt->execute([$projectId, $mat['material_id'], $mat['category']]);
    }

    // Сохраняем карнизы
    foreach ($cornices as $corniceId) {
        $stmt = $pdo->prepare('INSERT IGNORE INTO project_cornices (project_id, cornice_id) VALUES (?, ?)');
        $stmt->execute([$projectId, $corniceId]);
    }

    respondSuccess(['project_id' => $projectId, 'status' => 'processing']);
}
