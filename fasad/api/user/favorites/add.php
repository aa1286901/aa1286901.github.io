<?php
require_once __DIR__ . '/../../config.php';

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $materialId = $body['materialId'] ?? '';

    // Проверяем, не добавлен ли уже
    foreach ($db['user_favorites'] as $fav) {
        if ($fav['user_id'] === $userId && $fav['material_id'] === $materialId) {
            respondError('Уже в избранном');
        }
    }

    $db['user_favorites'][] = [
        'id' => getNextId($db['user_favorites']),
        'user_id' => $userId,
        'material_id' => $materialId,
        'created_at' => date('Y-m-d H:i:s')
    ];
    saveDB($db);

    respondSuccess(['id' => end($db['user_favorites'])['id']]);
}
