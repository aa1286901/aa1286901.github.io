<?php

declare(strict_types=1);

// «Приведи друга»: новый клиент, оплативший по реферальной ссылке, закрепляется за пригласившим.
// За каждую подтверждённую оплату прокси (или комплекта) этого друга пригласивший получает +REF_REWARD_DAYS дней прокси.

function ref_reward_days(): int
{
    $env = getenv('REF_REWARD_DAYS');
    $days = ($env !== false && trim((string) $env) !== '') ? (int) $env : 10;
    return max(1, $days);
}

function ensure_ref_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;
    $pdo = db();
    $cols = array_column($pdo->query('PRAGMA table_info(users)')->fetchAll(), 'name');
    if (!in_array('ref_code', $cols, true)) {
        $pdo->exec('ALTER TABLE users ADD COLUMN ref_code TEXT DEFAULT NULL');
    }
    if (!in_array('referred_by', $cols, true)) {
        $pdo->exec('ALTER TABLE users ADD COLUMN referred_by TEXT DEFAULT NULL');
    }
    $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_ref_code ON users(ref_code)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS referral_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inviter_phone TEXT NOT NULL,
        friend_phone TEXT NOT NULL,
        order_id INTEGER NOT NULL UNIQUE,
        days INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_ref_rewards_inviter ON referral_rewards(inviter_phone)');
}

function ref_clean_code(string $code): string
{
    return strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $code));
}

// Постоянный код клиента (создаётся при первом обращении)
function ref_code_for(string $phone): string
{
    ensure_ref_schema();
    $stmt = db()->prepare('SELECT ref_code FROM users WHERE phone = :p LIMIT 1');
    $stmt->execute([':p' => $phone]);
    $code = (string) ($stmt->fetchColumn() ?: '');
    if ($code !== '') {
        return $code;
    }
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for ($try = 0; $try < 20; $try++) {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        try {
            $upd = db()->prepare('UPDATE users SET ref_code = :c WHERE phone = :p AND ref_code IS NULL');
            $upd->execute([':c' => $code, ':p' => $phone]);
            return $code;
        } catch (PDOException $e) {
            continue; // такой код уже занят
        }
    }
    return '';
}

function ref_inviter_by_code(string $code): ?string
{
    ensure_ref_schema();
    $code = ref_clean_code($code);
    if ($code === '') {
        return null;
    }
    $stmt = db()->prepare('SELECT phone FROM users WHERE ref_code = :c LIMIT 1');
    $stmt->execute([':c' => $code]);
    $phone = $stmt->fetchColumn();
    return $phone ? (string) $phone : null;
}

function ref_mask_phone(string $phone): string
{
    $d = preg_replace('/\D/', '', $phone);
    return '+7 ' . substr($d, 0, 1) . '•• ••• ' . substr($d, -4, 2) . ' ' . substr($d, -2);
}

// Вызывается после подтверждения оплаты прокси/комплекта.
// $wasNew — клиента не было в базе до этой оплаты.
function ref_after_paid_order(array $order, bool $wasNew): void
{
    ensure_ref_schema();
    $kind = (string) $order['kind'];
    if ($kind !== 'proxy' && $kind !== 'combo') {
        return;
    }
    $friend = normalize_phone((string) $order['phone']);

    // Закрепляем нового клиента за пригласившим
    if ($wasNew && !empty($order['ref_code'])) {
        $inviter = ref_inviter_by_code((string) $order['ref_code']);
        if ($inviter && $inviter !== $friend) {
            db()->prepare('UPDATE users SET referred_by = :i WHERE phone = :f AND referred_by IS NULL')
                ->execute([':i' => $inviter, ':f' => $friend]);
        }
    }

    $stmt = db()->prepare('SELECT referred_by FROM users WHERE phone = :p LIMIT 1');
    $stmt->execute([':p' => $friend]);
    $inviterPhone = (string) ($stmt->fetchColumn() ?: '');
    if ($inviterPhone === '' || $inviterPhone === $friend) {
        return;
    }
    $inviterUser = find_user($inviterPhone);
    if (!$inviterUser) {
        return;
    }
    $days = ref_reward_days();
    try {
        db()->prepare('INSERT INTO referral_rewards (inviter_phone, friend_phone, order_id, days) VALUES (:i, :f, :o, :d)')
            ->execute([':i' => $inviterPhone, ':f' => $friend, ':o' => (int) $order['id'], ':d' => $days]);
    } catch (PDOException $e) {
        return; // за эту оплату награда уже начислена
    }
    save_user([
        'phone' => $inviterPhone,
        'subscription_type' => (string) ($inviterUser['subscription_type'] ?? ''),
        'expires_at' => build_extended_expires_at($inviterUser, $days),
        'is_active' => (int) ($inviterUser['is_active'] ?? 1) === 1,
        'balance' => (int) ($inviterUser['balance'] ?? 0),
        'regenerate_invite' => false,
    ]);
}

// Для кабинета клиента
function ref_payload(string $phone): array
{
    ensure_ref_schema();
    $code = ref_code_for($phone);
    $friends = db()->prepare('SELECT COUNT(*) FROM users WHERE referred_by = :p');
    $friends->execute([':p' => $phone]);
    $rows = db()->prepare('SELECT friend_phone, days, created_at FROM referral_rewards WHERE inviter_phone = :p ORDER BY id DESC');
    $rows->execute([':p' => $phone]);
    $rewards = $rows->fetchAll();
    return [
        'code' => $code,
        'link' => $code !== '' ? vpn_public_base() . '/payment?ref=' . $code : '',
        'rewardDays' => ref_reward_days(),
        'friends' => (int) $friends->fetchColumn(),
        'payments' => count($rewards),
        'daysEarned' => array_sum(array_map(static fn ($r) => (int) $r['days'], $rewards)),
        'history' => array_map(static fn ($r) => [
            'friend' => ref_mask_phone((string) $r['friend_phone']),
            'days' => (int) $r['days'],
            'at' => (string) $r['created_at'],
        ], array_slice($rewards, 0, 20)),
    ];
}

// Для админки: сколько друзей привёл и сколько дней получил каждый клиент
function ref_admin_stats(): array
{
    ensure_ref_schema();
    $out = [];
    foreach (db()->query('SELECT referred_by AS p, COUNT(*) AS n FROM users WHERE referred_by IS NOT NULL GROUP BY referred_by')->fetchAll() as $r) {
        $out[(string) $r['p']]['friends'] = (int) $r['n'];
    }
    foreach (db()->query('SELECT inviter_phone AS p, SUM(days) AS d, COUNT(*) AS n FROM referral_rewards GROUP BY inviter_phone')->fetchAll() as $r) {
        $out[(string) $r['p']]['days'] = (int) $r['d'];
        $out[(string) $r['p']]['payments'] = (int) $r['n'];
    }
    return $out;
}

function ref_handle_routes(string $uri, string $method): void
{
    if ($uri === '/api/ref/check' && $method === 'GET') {
        $inviter = ref_inviter_by_code((string) ($_GET['code'] ?? ''));
        json_response(['valid' => $inviter !== null]);
    }
}
