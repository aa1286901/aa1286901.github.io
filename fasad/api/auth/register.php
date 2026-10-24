<?php
require_once __DIR__ . '/../config.php';

$body = getJsonBody();
$name = sanitize($body['name'] ?? '');
$email = sanitize($body['email'] ?? '');
$password = $body['password'] ?? '';

if (empty($name) || empty($email) || empty($password)) {
    respondError('Заполните все поля');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respondError('Неверный формат email');
}

if (strlen($password) < 6) {
    respondError('Пароль должен быть не менее 6 символов');
}

$db = getDB();

// Проверяем существующего пользователя
foreach ($db['users'] as $user) {
    if ($user['email'] === $email) {
        respondError('Пользователь с таким email уже существует');
    }
}

// Создаём пользователя
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$newUser = [
    'id' => getNextId('users'),
    'name' => $name,
    'email' => $email,
    'password_hash' => $passwordHash,
    'avatar' => '',
    'created_at' => date('Y-m-d H:i:s'),
    'updated_at' => date('Y-m-d H:i:s')
];

$db['users'][] = $newUser;
saveDB();

$_SESSION['user_id'] = $newUser['id'];

respondSuccess([
    'id' => $newUser['id'],
    'name' => $newUser['name'],
    'email' => $newUser['email']
]);
