<?php
require_once __DIR__ . '/../config.php';

// me.php — безопасный endpoint, не требует авторизации
// Возвращает данные пользователя если авторизован, null если нет

if (!isset($_SESSION['user_id'])) {
    respondSuccess(null);
}

$userId = $_SESSION['user_id'];
$db = getDB();

// Ищем пользователя
$user = null;
foreach ($db['users'] as $u) {
    if ($u['id'] === $userId) {
        $user = $u;
        break;
    }
}

if ($user) {
    $user['avatar'] = $user['avatar'] ?? '';
    respondSuccess($user);
} else {
    respondSuccess(null);
}
