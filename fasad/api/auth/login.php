<?php
require_once __DIR__ . '/../config.php';

$body = getJsonBody();
$email = sanitize($body['email'] ?? '');
$password = $body['password'] ?? '';

if (empty($email) || empty($password)) {
    respondError('Введите email и пароль');
}

$db = getDB();

// Ищем пользователя
$user = null;
foreach ($db['users'] as $u) {
    if ($u['email'] === $email) {
        $user = $u;
        break;
    }
}

if (!$user || !password_verify($password, $user['password_hash'])) {
    respondError('Неверный email или пароль');
}

$_SESSION['user_id'] = $user['id'];
respondSuccess([
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email']
]);
