<?php
// Журнал запросов к kie.ai — только администраторам.
// GET — последние задачи: кто рисовал, модель, задание, картинки, ответ kie.ai, кредиты и время
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$adminId = requireAuth();
$db = getDB();
if (!isAdmin(findUser($db, $adminId))) respondError('Нет доступа', 403);

respondSuccess(['entries' => aiLogRead(), 'max' => AI_LOG_MAX]);
