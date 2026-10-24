<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();
$db = getDB();

// Список проектов пользователя
$projects = array_filter($db['projects'], function($p) use ($userId) {
    return $p['user_id'] === $userId;
});
usort($projects, function($a, $b) {
    return strtotime($b['created_at']) - strtotime($a['created_at']);
});

respondSuccess($projects);

