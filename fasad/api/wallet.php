<?php
// Монеты и тарифы.
// Серебряные монеты — из тарифа: каждый месяц снова становится столько, сколько даёт тариф (остаток не переносится).
// Золотые монеты — купленные пакеты: не сгорают. Генерация тратит сначала серебряные, потом золотые.
// Монеты списываются при запуске генерации и возвращаются, если ИИ не смог нарисовать.

const PLANS = [
    'free' => ['name' => 'Бесплатный', 'coins' => 3, 'price' => 0],
    'start' => ['name' => 'Старт', 'coins' => 10, 'price' => 345],
    'pro' => ['name' => 'Прораб', 'coins' => 30, 'price' => 690],
    'team' => ['name' => 'Бригада', 'coins' => 100, 'price' => 1990],
];

const PACKS = [
    ['coins' => 10, 'price' => 390],
    ['coins' => 30, 'price' => 890],
    ['coins' => 100, 'price' => 2490],
];

// Настройки, которые лежат только на хостинге (ключ ИИ, администраторы) — data/ai.php
function hostingConfig() {
    $file = DATA_DIR . 'ai.php';
    $cfg = file_exists($file) ? include $file : null;
    return is_array($cfg) ? $cfg : [];
}

function isAdmin($user) {
    $admins = array_map('strtolower', (array)(hostingConfig()['admins'] ?? []));
    return in_array(strtolower($user['email'] ?? ''), $admins, true);
}

function &findUser(&$db, $userId) {
    foreach ($db['users'] as $i => $u) {
        if ($u['id'] === $userId) return $db['users'][$i];
    }
    respondError('Пользователь не найден', 404);
}

function nextMonth($from) {
    return date('Y-m-d H:i:s', strtotime('+1 month', strtotime($from)));
}

// Кошелёк пользователя: создать при первом обращении, закончить истёкший тариф, обновить серебро за прошедшие месяцы
function walletSync(&$user) {
    $now = date('Y-m-d H:i:s');
    if (!isset($user['wallet']) || !is_array($user['wallet'])) {
        $user['wallet'] = ['plan' => 'free', 'plan_until' => null, 'silver' => PLANS['free']['coins'], 'gold' => 0, 'renew_at' => nextMonth($now)];
    }
    $w = &$user['wallet'];
    if (!isset(PLANS[$w['plan'] ?? ''])) $w['plan'] = 'free';
    if ($w['plan'] !== 'free' && !empty($w['plan_until']) && $w['plan_until'] <= $now) {
        // Тариф закончился — бесплатный, серебро как у бесплатного
        $w['plan'] = 'free';
        $w['plan_until'] = null;
        $w['silver'] = PLANS['free']['coins'];
        $w['renew_at'] = nextMonth($now);
    }
    while (($w['renew_at'] ?? '') <= $now) {
        $w['silver'] = PLANS[$w['plan']]['coins'];
        $w['renew_at'] = nextMonth($w['renew_at'] ?: $now);
    }
    unset($w);
}

// Списать монеты: сначала серебряные, потом золотые. null — не хватает
function walletCharge(&$user, $cost) {
    walletSync($user);
    $w = &$user['wallet'];
    if ($w['silver'] + $w['gold'] < $cost) return null;
    $silver = min($w['silver'], $cost);
    $gold = $cost - $silver;
    $w['silver'] -= $silver;
    $w['gold'] -= $gold;
    return ['silver' => $silver, 'gold' => $gold];
}

// Вернуть монеты неудачной генерации туда, откуда списали
function walletRefund(&$user, $charged) {
    walletSync($user);
    $w = &$user['wallet'];
    $w['silver'] = min(PLANS[$w['plan']]['coins'], $w['silver'] + (int)($charged['silver'] ?? 0));
    $w['gold'] += (int)($charged['gold'] ?? 0);
}

function walletPublic($user) {
    $w = $user['wallet'];
    $plan = PLANS[$w['plan']];
    return [
        'plan' => $w['plan'],
        'plan_name' => $plan['name'],
        'plan_coins' => $plan['coins'],
        'plan_until' => $w['plan_until'],
        'silver' => $w['silver'],
        'gold' => $w['gold'],
        'renew_at' => $w['renew_at'],
    ];
}
