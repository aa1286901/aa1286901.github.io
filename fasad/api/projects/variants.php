<?php
// Варианты проекта: одно фото — несколько подборов и картинок к ним.
// POST { project_id, action }:
//   add      { design }       — новый вариант с подбором (картинка появится после генерации)
//   star     { variant_id }   — отметить «Выбран клиентом» (повторно — снять)
//   delete   { variant_id }   — удалить вариант (последний удалить нельзя)
//   generate { variant_id, prompt, refs, model? } — поставить генерацию картинки ИИ (refs — образцы камня и изделий)
//   poll                      — проверить идущие генерации, готовые картинки сохранить в проект
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../ai.php';
require_once __DIR__ . '/../wallet.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Метод не поддерживается', 405);
}

$body = getJsonBody();
$projectId = (int)($body['project_id'] ?? 0);
$action = (string)($body['action'] ?? '');
$db = getDB();

$index = null;
foreach ($db['projects'] as $i => $p) {
    if ($p['id'] === $projectId && $p['user_id'] === $userId) {
        $index = $i;
        break;
    }
}
if ($index === null) {
    respondError('Проект не найден', 404);
}

$project = &$db['projects'][$index];
$project['variants'] = projectVariants($project);
$variantId = (int)($body['variant_id'] ?? 0);
$found = null;
foreach ($project['variants'] as $vi => $v) {
    if ($v['id'] === $variantId) {
        $found = $vi;
        break;
    }
}

if ($action === 'add') {
    $design = $body['design'] ?? null;
    if (!is_array($design) || strlen(json_encode($design)) > 100000) {
        respondError('Неверный подбор');
    }
    if (count($project['variants']) >= 30) {
        respondError('В проекте уже 30 вариантов — удалите лишние');
    }
    $newId = 1;
    foreach ($project['variants'] as $v) {
        $newId = max($newId, $v['id'] + 1);
    }
    $project['variants'][] = [
        'id' => $newId,
        'design' => $design,
        'generated_image' => null,
        'created_at' => date('Y-m-d H:i:s'),
        'starred' => false,
    ];
    $project['design'] = $design;  // последний подбор — для списка проектов и старых экранов
} elseif ($action === 'star') {
    if ($found === null) respondError('Вариант не найден', 404);
    $on = empty($project['variants'][$found]['starred']);
    foreach ($project['variants'] as $vi => $v) {
        $project['variants'][$vi]['starred'] = $on && $vi === $found;
    }
} elseif ($action === 'delete') {
    if ($found === null) respondError('Вариант не найден', 404);
    if (count($project['variants']) < 2) respondError('Это единственный вариант — удалите проект целиком');
    array_splice($project['variants'], $found, 1);
} elseif ($action === 'generate') {
    if ($found === null) respondError('Вариант не найден', 404);
    if (($project['variants'][$found]['ai']['status'] ?? '') === 'processing') {
        respondError('Этот вариант уже рисуется');
    }
    $prompt = trim((string)($body['prompt'] ?? ''));
    if ($prompt === '' || mb_strlen($prompt) > 12000) respondError('Неверное задание для ИИ');
    // Образцы — только картинки самого приложения: фактуры камня и изделия каталога
    $refs = [];
    foreach ((array)($body['refs'] ?? []) as $ref) {
        if (is_string($ref) && preg_match('#^assets/(textures/stones|ai)/[a-z0-9-]+\.jpg$#', $ref)) $refs[] = $ref;
    }
    $cfg = aiConfig();
    $model = (string)($body['model'] ?? '');
    if (isset(AI_MODELS[$model])) $cfg['model'] = $model;  // выбор прораба: Nano Banana или GPT Image
    // Монеты списываются сразу; если ИИ не нарисует — вернутся (сбой запуска ничего не сохраняет)
    $user = &findUser($db, $userId);
    $charged = walletCharge($user, AI_MODELS[$cfg['model']]['coins']);
    if ($charged === null) respondError('Не хватает монет', 402);
    $meta = ['user' => $user['email'] ?? '', 'user_name' => $user['name'] ?? '', 'project' => $project['id'],
        'project_name' => $project['name'] ?? '', 'variant' => $project['variants'][$found]['id']];
    $project['variants'][$found]['ai'] = aiStart($cfg, $project['original_image'], $prompt, array_values(array_unique($refs)), $meta);
    $project['variants'][$found]['ai']['charged'] = $charged;
    unset($user);
} elseif ($action === 'poll') {
    $cfg = null;
    foreach ($project['variants'] as $vi => $v) {
        if (($v['ai']['status'] ?? '') !== 'processing') continue;
        $cfg = $cfg ?? aiConfig();
        aiPoll($cfg, $project['variants'][$vi]);
        $ai = &$project['variants'][$vi]['ai'];
        if ($ai['status'] === 'failed' && !empty($ai['charged'])) {
            $user = &findUser($db, $userId);
            walletRefund($user, $ai['charged']);
            $ai['charged'] = null;  // вернули — второй раз не вернуть
            unset($user);
        }
        unset($ai);
        if (!empty($project['variants'][$vi]['generated_image'])) {
            // Картинка последнего готового варианта — обложка проекта в списке
            $project['generated_image'] = $project['variants'][$vi]['generated_image'];
            $project['status'] = 'completed';
            $project['progress'] = 100;
        }
    }
} else {
    respondError('Неизвестное действие');
}

unset($project);
$me = &findUser($db, $userId);
walletSync($me);
saveDB($db);
respondSuccess(['variants' => $db['projects'][$index]['variants'], 'wallet' => walletPublic($me)]);
