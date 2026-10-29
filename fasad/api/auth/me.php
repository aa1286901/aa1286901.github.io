<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../wallet.php';

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
    // Хеш пароля наружу не отдаём
    respondSuccess([
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'avatar' => $user['avatar'] ?? '',
        'created_at' => $user['created_at'] ?? null,
        'wallet' => isset($user['wallet']) ? walletPublic($user) : null,
        'is_admin' => isAdmin($user),
    ]);
} else {
    respondSuccess(null);
}
