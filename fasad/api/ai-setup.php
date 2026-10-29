<?php
// Настройки хостинга мимо GitHub: принимается только ключ kie.ai с этим отпечатком (sha256).
// POST { key, model?, resolution?, admins? } → дополняет data/ai.php (что не передано — остаётся как было).
// admins — email администраторов: они начисляют монеты и включают тарифы вручную.
// support — контакты поддержки { telegram, whatsapp, phone, email } для экрана «Помощь».
require_once __DIR__ . '/config.php';

const AI_KEY_SHA256 = 'b37d6f28bcdca54567bdf9d2451281a66be7bbeb45ad1fdf1da10c91cc7ab1bf';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respondError('Метод не поддерживается', 405);
$body = getJsonBody();
$key = (string)($body['key'] ?? '');
if (!hash_equals(AI_KEY_SHA256, hash('sha256', $key))) respondError('Неверный ключ', 403);

$file = DATA_DIR . 'ai.php';
$cfg = file_exists($file) ? include $file : [];
$cfg = (is_array($cfg) ? $cfg : []) + ['model' => 'nano-banana-2-1', 'resolution' => '2K'];
$cfg['key'] = $key;
if (isset($body['model'])) $cfg['model'] = (string)$body['model'];
if (isset($body['resolution'])) $cfg['resolution'] = (string)$body['resolution'];
if (isset($body['support'])) $cfg['support'] = array_map('strval', (array)$body['support']);  // контакты поддержки
if (isset($body['admins'])) {
    $cfg['admins'] = array_values(array_filter(array_map(fn($e) => strtolower(trim((string)$e)), (array)$body['admins'])));
}
if (file_put_contents($file, '<?php return ' . var_export($cfg, true) . ";\n") === false) {
    respondError('Не удалось сохранить ключ', 500);
}
respondSuccess(['model' => $cfg['model'], 'resolution' => $cfg['resolution'], 'admins' => $cfg['admins'] ?? []]);
