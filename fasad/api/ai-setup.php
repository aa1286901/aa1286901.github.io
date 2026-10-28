<?php
// Установка ключа kie.ai на хостинг, минуя GitHub: принимается только ключ с этим отпечатком (sha256).
// POST { key, model?, resolution? } → пишет data/ai.php. Новый ключ — новый отпечаток в этом файле.
require_once __DIR__ . '/config.php';

const AI_KEY_SHA256 = 'b37d6f28bcdca54567bdf9d2451281a66be7bbeb45ad1fdf1da10c91cc7ab1bf';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respondError('Метод не поддерживается', 405);
$body = getJsonBody();
$key = (string)($body['key'] ?? '');
if (!hash_equals(AI_KEY_SHA256, hash('sha256', $key))) respondError('Неверный ключ', 403);

$cfg = [
    'key' => $key,
    'model' => (string)($body['model'] ?? 'nano-banana-2-1'),
    'resolution' => (string)($body['resolution'] ?? '2K'),
];
if (file_put_contents(DATA_DIR . 'ai.php', '<?php return ' . var_export($cfg, true) . ";\n") === false) {
    respondError('Не удалось сохранить ключ', 500);
}
respondSuccess(['model' => $cfg['model'], 'resolution' => $cfg['resolution']]);
