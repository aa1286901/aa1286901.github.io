<?php
// Баланс kie.ai (кредиты ИИ) — только администраторам
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$adminId = requireAuth();
$db = getDB();
if (!isAdmin(findUser($db, $adminId))) respondError('Нет доступа', 403);

$cfg = aiConfig();
$credits = (float)kieCall($cfg, 'chat/credit');
// Сколько картинок 1K хватит: столько кредитов kie.ai стоит одна (по прайсу kie.ai)
$per = ['nano' => 4, 'gpt' => 6];
respondSuccess([
    'credits' => $credits,
    'usd' => round($credits * 0.005, 2),
    'left' => array_map(fn($c) => (int)floor($credits / $c), $per),
]);
