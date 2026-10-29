<?php
// Кабинет администратора: все пользователи, их тарифы и монеты. Администраторы — email в data/ai.php на хостинге.
// GET — список пользователей
// POST { action: 'update', user_id, plan?, months?, silver?, gold? } — тариф на N месяцев и/или точное число монет
// POST { action: 'create', name, email, password, plan?, months?, gold? } — добавить пользователя
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$adminId = requireAuth();
$db = getDB();
if (!isAdmin(findUser($db, $adminId))) respondError('Нет доступа', 403);

// Включить тариф: серебро — сразу по тарифу, обновление через месяц
function setPlan(&$user, $plan, $months) {
    if (!isset(PLANS[$plan])) respondError('Неизвестный тариф');
    $months = max(1, min(24, (int)$months));
    $user['wallet']['plan'] = $plan;
    $user['wallet']['plan_until'] = $plan === 'free' ? null : date('Y-m-d H:i:s', strtotime("+$months month"));
    $user['wallet']['silver'] = PLANS[$plan]['coins'];
    $user['wallet']['renew_at'] = nextMonth(date('Y-m-d H:i:s'));
}

function setCoins(&$user, $body) {
    if (isset($body['silver']) && $body['silver'] !== '') $user['wallet']['silver'] = max(0, min(10000, (int)$body['silver']));
    if (isset($body['gold']) && $body['gold'] !== '') $user['wallet']['gold'] = max(0, min(100000, (int)$body['gold']));
}

function userRow($db, $u) {
    $projects = 0;
    $images = 0;
    foreach ($db['projects'] as $p) {
        if ($p['user_id'] !== $u['id']) continue;
        $projects++;
        foreach (projectVariants($p) as $v) if (!empty($v['generated_image'])) $images++;
    }
    return [
        'id' => $u['id'],
        'name' => $u['name'],
        'email' => $u['email'],
        'created_at' => $u['created_at'] ?? null,
        'is_admin' => isAdmin($u),
        'projects' => $projects,
        'images' => $images,
        'wallet' => walletPublic($u),
    ];
}

$body = getJsonBody();
$action = $_SERVER['REQUEST_METHOD'] === 'POST' ? (string)($body['action'] ?? '') : 'list';

if ($action === 'update') {
    $user = &findUser($db, (int)($body['user_id'] ?? 0));
    walletSync($user);
    if (!empty($body['plan'])) setPlan($user, (string)$body['plan'], $body['months'] ?? 1);
    setCoins($user, $body);
    $user['updated_at'] = date('Y-m-d H:i:s');
    unset($user);
} elseif ($action === 'create') {
    $name = sanitize($body['name'] ?? '');
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = (string)($body['password'] ?? '');
    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) respondError('Укажите имя и правильный email');
    if (strlen($password) < 6) respondError('Пароль — не меньше 6 символов');
    foreach ($db['users'] as $u) {
        if (strtolower($u['email']) === $email) respondError('Пользователь с таким email уже есть');
    }
    $new = [
        'id' => getNextId($db['users']),
        'name' => $name,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'avatar' => '',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
    ];
    walletSync($new);
    if (!empty($body['plan'])) setPlan($new, (string)$body['plan'], $body['months'] ?? 1);
    setCoins($new, $body);
    $db['users'][] = $new;
} elseif ($action !== 'list') {
    respondError('Неизвестное действие');
}

$rows = [];
foreach ($db['users'] as $i => $u) {
    walletSync($db['users'][$i]);
    $rows[] = userRow($db, $db['users'][$i]);
}
saveDB($db);
usort($rows, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));
respondSuccess(['users' => $rows, 'plans' => array_map(fn($id, $p) => ['id' => $id] + $p, array_keys(PLANS), PLANS)]);
