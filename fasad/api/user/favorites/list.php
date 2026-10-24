<?php
require_once __DIR__ . '/../../config.php';

$userId = requireAuth();
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $favorites = array_filter($db['user_favorites'], function($f) use ($userId) {
        return $f['user_id'] === $userId;
    });
    usort($favorites, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    respondSuccess($favorites);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $materialId = $body['materialId'] ?? '';

    $db['user_favorites'] = array_filter($db['user_favorites'], function($f) use ($userId, $materialId) {
        return !($f['user_id'] === $userId && $f['material_id'] === $materialId);
    });
    $db['user_favorites'] = array_values($db['user_favorites']);
    saveDB($db);

    respondSuccess(null, 'Удалено из избранного');
}
