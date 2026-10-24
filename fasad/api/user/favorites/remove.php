<?php
require_once __DIR__ . '/../../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $materialId = (string)($body['materialId'] ?? '');

    $db = getDB();
    $db['user_favorites'] = array_values(array_filter($db['user_favorites'], function($f) use ($userId, $materialId) {
        return !($f['user_id'] === $userId && $f['material_id'] === $materialId);
    }));
    saveDB($db);

    respondSuccess(null, 'Удалено из избранного');
}
