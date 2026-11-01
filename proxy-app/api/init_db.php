<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/config.php';

$pdo = db();

function seed_invite_code(int $length = 8): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $max = strlen($alphabet) - 1;
    $buf = '';
    for ($i = 0; $i < $length; $i++) {
        $buf .= $alphabet[random_int(0, $max)];
    }
    return $buf;
}

$pdo->exec('
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  subscription_type TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  balance INTEGER NOT NULL DEFAULT 0,
  invite_code TEXT,
  invite_code_hash TEXT,
  invite_issued_at TEXT,
  invite_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)');

$pdo->exec('
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL,
  price TEXT NOT NULL,
  benefits_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
)');

$pdo->exec('
CREATE TABLE IF NOT EXISTS proxies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network TEXT NOT NULL,
  name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  ping_ms INTEGER NOT NULL,
  is_reachable INTEGER NOT NULL DEFAULT 1,
  last_checked_at TEXT,
  connect_url TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_recommended INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 100
)');

$pdo->exec('
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  plan_id INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  provider_token TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT,
  provider_order_id TEXT,
  provider_bank_id TEXT,
  provider_qr_url TEXT,
  status TEXT NOT NULL DEFAULT "created",
  provider_payload_json TEXT,
  invite_code TEXT,
  subscription_type TEXT,
  expires_at TEXT,
  paid_at TEXT,
  fulfilled_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)');

$userColumns = $pdo->query("PRAGMA table_info(users)")->fetchAll();
$hasUserBalance = false;
$hasInviteCode = false;
$hasInviteCodeHash = false;
$hasInviteIssuedAt = false;
$hasInviteUsedAt = false;
foreach ($userColumns as $column) {
    if (($column['name'] ?? '') === 'balance') {
        $hasUserBalance = true;
    }
    if (($column['name'] ?? '') === 'invite_code') {
        $hasInviteCode = true;
    }
    if (($column['name'] ?? '') === 'invite_code_hash') {
        $hasInviteCodeHash = true;
    }
    if (($column['name'] ?? '') === 'invite_issued_at') {
        $hasInviteIssuedAt = true;
    }
    if (($column['name'] ?? '') === 'invite_used_at') {
        $hasInviteUsedAt = true;
    }
}
if (!$hasUserBalance) {
    $pdo->exec('ALTER TABLE users ADD COLUMN balance INTEGER NOT NULL DEFAULT 0');
}
if (!$hasInviteCode) {
    $pdo->exec('ALTER TABLE users ADD COLUMN invite_code TEXT');
}
if (!$hasInviteCodeHash) {
    $pdo->exec('ALTER TABLE users ADD COLUMN invite_code_hash TEXT');
}
if (!$hasInviteIssuedAt) {
    $pdo->exec('ALTER TABLE users ADD COLUMN invite_issued_at TEXT');
}
if (!$hasInviteUsedAt) {
    $pdo->exec('ALTER TABLE users ADD COLUMN invite_used_at TEXT');
}

$rowsWithoutInvite = $pdo->query("SELECT id FROM users WHERE COALESCE(invite_code, '') = ''")->fetchAll();
if ($rowsWithoutInvite) {
    $updateInvite = $pdo->prepare(
        'UPDATE users
         SET invite_code = :invite_code,
             invite_code_hash = :invite_code_hash,
             invite_issued_at = COALESCE(invite_issued_at, CURRENT_TIMESTAMP)
         WHERE id = :id'
    );
    $secret = config()['jwt_secret'];
    foreach ($rowsWithoutInvite as $row) {
        $code = seed_invite_code(8);
        $hash = hash('sha256', strtoupper($code) . '|' . $secret);
        $updateInvite->execute([
            ':id' => (int) $row['id'],
            ':invite_code' => $code,
            ':invite_code_hash' => $hash,
        ]);
    }
}

$pdo->exec('CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)');
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_proxies_network_active_sort ON proxies(network, is_active, sort_order)');
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_payments_provider_token ON payments(provider_token)');
$pdo->exec('CREATE INDEX IF NOT EXISTS idx_payments_phone_created ON payments(phone, created_at DESC)');

$proxyColumns = $pdo->query("PRAGMA table_info(proxies)")->fetchAll();
$hasProxyReachability = false;
$hasProxyLastChecked = false;
$hasProxyRecommended = false;
foreach ($proxyColumns as $column) {
    if (($column['name'] ?? '') === 'is_reachable') {
        $hasProxyReachability = true;
    }
    if (($column['name'] ?? '') === 'last_checked_at') {
        $hasProxyLastChecked = true;
    }
    if (($column['name'] ?? '') === 'is_recommended') {
        $hasProxyRecommended = true;
    }
}
if (!$hasProxyReachability) {
    $pdo->exec('ALTER TABLE proxies ADD COLUMN is_reachable INTEGER NOT NULL DEFAULT 1');
}
if (!$hasProxyLastChecked) {
    $pdo->exec('ALTER TABLE proxies ADD COLUMN last_checked_at TEXT');
}
if (!$hasProxyRecommended) {
    $pdo->exec('ALTER TABLE proxies ADD COLUMN is_recommended INTEGER NOT NULL DEFAULT 0');
}
$pdo->exec("UPDATE proxies SET last_checked_at = COALESCE(last_checked_at, CURRENT_TIMESTAMP), is_reachable = COALESCE(is_reachable, 1), is_recommended = COALESCE(is_recommended, 0)");

$plansCount = (int) $pdo->query('SELECT COUNT(*) FROM plans')->fetchColumn();
if ($plansCount === 0) {
    $insertPlan = $pdo->prepare(
        'INSERT INTO plans (name, duration_months, price, benefits_json, is_active) VALUES (:name, :months, :price, :benefits, 1)'
    );

    $seedPlans = [
        ['1 месяц', 1, '1 900 ₽', ['Полный доступ', 'Telegram + WhatsApp', 'Поддержка 24/7']],
        ['3 месяца', 3, '4 900 ₽', ['Экономия по цене', 'EU серверы', 'Быстрая выдача']],
        ['6 месяцев', 6, '8 900 ₽', ['Максимальная выгода', 'Приоритетная поддержка', 'Стабильный доступ']],
    ];

    foreach ($seedPlans as [$name, $months, $price, $benefits]) {
        $insertPlan->execute([
            ':name' => $name,
            ':months' => $months,
            ':price' => $price,
            ':benefits' => json_encode($benefits, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }
}

$proxyCount = (int) $pdo->query('SELECT COUNT(*) FROM proxies')->fetchColumn();
if ($proxyCount === 0) {
    $insertProxy = $pdo->prepare(
        'INSERT INTO proxies (network, name, host, port, ping_ms, connect_url, is_active, sort_order)
         VALUES (:network, :name, :host, :port, :ping, :url, 1, :sort)'
    );

    $tgSecret = urlencode('ee000000000000000000000000000000');
    $seed = [
        ['telegram', 'TG London', 'tg5.proxy.coffee', 443, 42, "https://t.me/proxy?server=149.154.175.50&port=443&secret={$tgSecret}", 10],
        ['telegram', 'TG Paris', 'tg6.proxy.coffee', 443, 48, "https://t.me/proxy?server=149.154.167.40&port=443&secret={$tgSecret}", 20],
        ['telegram', 'TG Stockholm', 'tg4.proxy.coffee', 443, 54, "https://t.me/proxy?server=149.154.175.53&port=443&secret={$tgSecret}", 30],
        ['whatsapp', 'WA London', 'wa5.proxy.coffee', 1080, 38, 'https://wa.me/?text=' . urlencode("Подключите WA London\nwa5.proxy.coffee:1080"), 10],
        ['whatsapp', 'WA Paris', 'wa6.proxy.coffee', 1080, 45, 'https://wa.me/?text=' . urlencode("Подключите WA Paris\nwa6.proxy.coffee:1080"), 20],
        ['whatsapp', 'WA Helsinki', 'wa3.proxy.coffee', 1080, 57, 'https://wa.me/?text=' . urlencode("Подключите WA Helsinki\nwa3.proxy.coffee:1080"), 30],
    ];

    foreach ($seed as [$network, $name, $host, $port, $ping, $url, $sort]) {
        $insertProxy->execute([
            ':network' => $network,
            ':name' => $name,
            ':host' => $host,
            ':port' => $port,
            ':ping' => $ping,
            ':url' => $url,
            ':sort' => $sort,
        ]);
    }
}

$userCount = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
if ($userCount === 0) {
    $stmt = $pdo->prepare(
        'INSERT INTO users (phone, subscription_type, expires_at, is_active, balance, invite_code, invite_code_hash, invite_issued_at, invite_used_at, created_at)
         VALUES (:phone, :type, :expires, 1, 0, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP)'
    );

    $stmt->execute([
        ':phone' => '9999999999',
        ':type' => '3 месяца',
        ':expires' => (new DateTimeImmutable('+90 days'))->format('Y-m-d H:i:s'),
    ]);
}

// promo_codes table: stores admin-managed promo codes
$pdo->exec('
CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    plan_id INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    price_label TEXT DEFAULT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)');

$promoCount = (int) $pdo->query('SELECT COUNT(*) FROM promo_codes')->fetchColumn();
if ($promoCount === 0) {
        $insertPromo = $pdo->prepare(
                'INSERT INTO promo_codes (code, plan_id, discount_amount, price_label, is_active) VALUES (:code, :plan_id, :discount, :label, 1)'
        );
        // seed example promo codes
        $insertPromo->execute([':code' => 'ASTANA', ':plan_id' => 301, ':discount' => 150, ':label' => '150 ₽']);
        $insertPromo->execute([':code' => 'ASTANA90', ':plan_id' => 301, ':discount' => 90, ':label' => '90 ₽']);
}

echo "Database initialized at: " . config()['db_path'] . PHP_EOL;
