<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $materialId = (int)($body['materialId'] ?? 0);

    $pdo = getDB();
    $stmt = $pdo->prepare('DELETE FROM user_favorites WHERE user_id = ? AND material_id = ?');
    $stmt->execute([$userId, $materialId]);

    respondSuccess(null, 'Удалено из избранного');
}
