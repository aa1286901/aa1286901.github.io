<?php
require_once __DIR__ . '/../config.php';

forgetUser();
session_destroy();
setcookie('PHPSESSID', '', time() - 3600, '/');
respondSuccess(null, 'Вы вышли из аккаунта');
