<?php
// Монеты пользователя, тарифы, пакеты и цена моделей в монетах
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$userId = requireAuth();
$db = getDB();
$user = &findUser($db, $userId);
walletSync($user);
saveDB($db);

$plans = [];
foreach (PLANS as $id => $p) $plans[] = ['id' => $id] + $p;
respondSuccess([
    'wallet' => walletPublic($user),
    'plans' => $plans,
    'packs' => PACKS,
    'models' => array_map(fn($m) => $m['coins'], AI_MODELS),
    'is_admin' => isAdmin($user),
]);
