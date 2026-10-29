<?php
// Контакты поддержки — задаются на хостинге (data/ai.php → support), в GitHub их нет
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/wallet.php';

$s = (array)(hostingConfig()['support'] ?? []);
$out = [];
foreach (['telegram', 'whatsapp', 'phone', 'email'] as $k) {
    if (!empty($s[$k]) && is_string($s[$k])) $out[$k] = $s[$k];
}
respondSuccess($out);
