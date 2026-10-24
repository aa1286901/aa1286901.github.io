<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $projectId = (int)($_GET['id'] ?? 0);
    
    $pdo = getDB();
    
    // Проверяем принадлежность
    $stmt = $pdo->prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?');
    $stmt->execute([$projectId, $userId]);
    
    if (!$stmt->fetch()) {
        respondError('Проект не найден', 404);
    }
    
    // Удаляем проект
    $stmt = $pdo->prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
    $stmt->execute([$projectId, $userId]);
    
    respondSuccess(null, 'Проект удалён');
}
