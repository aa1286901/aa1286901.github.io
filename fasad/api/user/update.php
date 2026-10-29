<?php
// Изменить своё имя в профиле. POST { name }
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../wallet.php';

$userId = requireAuth();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respondError('Метод не поддерживается', 405);

$body = getJsonBody();
$name = trim(sanitize($body['name'] ?? ''));
if ($name === '' || mb_strlen($name) > 60) respondError('Имя — от 1 до 60 символов');

$db = getDB();
$user = &findUser($db, $userId);
$user['name'] = $name;
$user['updated_at'] = date('Y-m-d H:i:s');
unset($user);
saveDB($db);
respondSuccess(['name' => $name]);
