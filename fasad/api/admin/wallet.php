<?php
// Ручное управление монетами, пока не подключена оплата. Только для администраторов (список — в data/ai.php на хостинге).
// GET ?email=...  — посмотреть кошелёк
// POST { email, plan?, months?, gold? } — включить тариф на N месяцев и/или начислить золотые монеты
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$adminId = requireAuth();
$db = getDB();
if (!isAdmin(findUser($db, $adminId))) respondError('Нет доступа', 403);

$body = $_SERVER['REQUEST_METHOD'] === 'POST' ? getJsonBody() : $_GET;
$email = strtolower(trim((string)($body['email'] ?? '')));
$target = null;
foreach ($db['users'] as $i => $u) {
    if (strtolower($u['email']) === $email) {
        $target = $i;
        break;
    }
}
if ($target === null) respondError('Пользователь с таким email не найден', 404);
$user = &$db['users'][$target];
walletSync($user);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $plan = (string)($body['plan'] ?? '');
    if ($plan !== '') {
        if (!isset(PLANS[$plan])) respondError('Неизвестный тариф');
        $months = max(1, min(24, (int)($body['months'] ?? 1)));
        $now = date('Y-m-d H:i:s');
        $user['wallet']['plan'] = $plan;
        $user['wallet']['plan_until'] = $plan === 'free' ? null : date('Y-m-d H:i:s', strtotime("+$months month"));
        $user['wallet']['silver'] = PLANS[$plan]['coins'];
        $user['wallet']['renew_at'] = nextMonth($now);
    }
    $gold = (int)($body['gold'] ?? 0);
    if ($gold !== 0) {
        $user['wallet']['gold'] = max(0, $user['wallet']['gold'] + max(-1000, min(1000, $gold)));
    }
}
saveDB($db);
respondSuccess(['name' => $user['name'], 'email' => $user['email'], 'wallet' => walletPublic($user)]);
