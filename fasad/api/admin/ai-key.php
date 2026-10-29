<?php
// Ключ kie.ai — меняет администратор прямо в приложении (например, при переходе на другой аккаунт kie.ai).
// GET — какой ключ стоит (только последние 4 символа)
// POST { key } — проверить ключ запросом баланса и сохранить в data/ai.php (остальные настройки остаются)
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$adminId = requireAuth();
$db = getDB();
if (!isAdmin(findUser($db, $adminId))) respondError('Нет доступа', 403);

$cfg = hostingConfig();
$mask = fn($k) => $k ? '••••' . substr($k, -4) : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $key = trim((string)(getJsonBody()['key'] ?? ''));
    if (!preg_match('/^[A-Za-z0-9_\-]{16,128}$/', $key)) respondError('Это не похоже на ключ kie.ai');
    // Сначала спросим баланс новым ключом: нерабочий ключ не сохраняем
    $credits = (float)kieCall(['key' => $key] + $cfg, 'chat/credit');
    $cfg['key'] = $key;
    $cfg['key_changed_at'] = date('Y-m-d H:i:s');
    if (!writeConfig(AI_CONFIG, $cfg)) {
        respondError('Не удалось сохранить ключ', 500);
    }
    respondSuccess(['key' => $mask($key), 'credits' => $credits, 'changed_at' => $cfg['key_changed_at']]);
}

respondSuccess(['key' => $mask($cfg['key'] ?? ''), 'changed_at' => $cfg['key_changed_at'] ?? null]);
