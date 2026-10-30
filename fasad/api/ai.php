<?php
// Генерация фасада ИИ через kie.ai.
// Ключ и модель лежат только на хостинге: data/ai.php (в GitHub его нет, деплой его не трогает):
//   <?php return ['key' => '...', 'model' => 'nano-banana-2-1'];
// Nano Banana рисует в 1K, GPT Image 2 — в 2K (GPT Image 2.5 в 2K на kie.ai падал)
// Задача ИИ идёт 30–90 секунд: generate ставит её в очередь, poll забирает готовую картинку к себе.

define('AI_CONFIG', DATA_DIR . 'ai.php');
define('KIE_API', 'https://api.kie.ai/api/v1/');

// Модели kie.ai: поле со ссылками на картинки, допустимое число картинок, цена генерации в монетах
// и разрешение (по умолчанию 1K)
const AI_MODELS = [
    'nano-banana-2-1' => ['images' => 'image_input', 'max' => 10, 'coins' => 1],
    'nano-banana-2' => ['images' => 'image_input', 'max' => 10, 'coins' => 1],
    'nano-banana-pro' => ['images' => 'image_input', 'max' => 8, 'coins' => 3],
    'gpt-image-2-5-sunburst-image-to-image' => ['images' => 'input_urls', 'max' => 16, 'coins' => 2],
    'gpt-image-2-5-flare-image-to-image' => ['images' => 'input_urls', 'max' => 16, 'coins' => 2],
    'gpt-image-2-image-to-image' => ['images' => 'input_urls', 'max' => 16, 'coins' => 2, 'resolution' => '2K'],
    'gpt-image/1.5-image-to-image' => ['images' => 'input_urls', 'max' => 16, 'coins' => 2],
];

function aiConfig() {
    $cfg = includeFresh(AI_CONFIG);
    if (!is_array($cfg) || empty($cfg['key'])) {
        respondError('Генерация ИИ ещё не подключена', 501);
    }
    $cfg['model'] = isset(AI_MODELS[$cfg['model'] ?? '']) ? $cfg['model'] : 'nano-banana-2-1';
    return $cfg;
}

// Адрес приложения снаружи — по нему kie.ai скачивает фото и образцы камня
function publicUrl($cfg) {
    if (!empty($cfg['public_url'])) return rtrim($cfg['public_url'], '/') . '/';
    $https = ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
    $root = dirname(dirname(dirname($_SERVER['SCRIPT_NAME'])));  // /fasad/api/projects/x.php → /fasad
    return ($https ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . rtrim($root, '/') . '/';
}

function kieCall($cfg, $path, $body = null) {
    // api_url в настройках — только для проверки на подставном сервере
    $ch = curl_init(($cfg['api_url'] ?? KIE_API) . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $cfg['key'], 'Content-Type: application/json'],
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
    $raw = curl_exec($ch);
    curl_close($ch);
    $res = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($res)) {
        respondError('Сервис ИИ не отвечает, попробуйте позже', 502);
    }
    // Ошибки kie.ai приходят с HTTP 200 и своим кодом внутри
    $code = (int)($res['code'] ?? 0);
    if ($code === 402) respondError('На балансе kie.ai закончились кредиты', 402);
    if ($code === 401) respondError('Ключ kie.ai не подходит', 502);
    if ($code === 429) respondError('Слишком много генераций сразу, попробуйте через минуту', 429);
    if ($code !== 200) respondError('Сервис ИИ: ' . ($res['msg'] ?? 'ошибка'), 502);
    return $res['data'] ?? null;
}

// Поставить задачу: фото проекта + образцы камня и изделий, задание — текстом
function aiStart($cfg, $originalImage, $prompt, $refs) {
    $base = publicUrl($cfg);
    $model = AI_MODELS[$cfg['model']];
    $urls = array_slice(array_merge([$originalImage], $refs), 0, $model['max']);
    $urls = array_map(fn($p) => $base . $p, $urls);
    // Пропорции — как у фото
    $input = ['prompt' => $prompt, $model['images'] => $urls, 'resolution' => $model['resolution'] ?? '1K', 'aspect_ratio' => 'auto'];
    if (str_starts_with($cfg['model'], 'nano-banana')) $input['output_format'] = 'jpg';
    // GPT Image — пропорции фото явно
    if (str_starts_with($cfg['model'], 'gpt-image')) $input['aspect_ratio'] = aiAspect(__DIR__ . '/../' . $originalImage);
    // GPT Image 1.5: только 1:1, 3:2, 2:3, без разрешения, зато с качеством
    if ($cfg['model'] === 'gpt-image/1.5-image-to-image') {
        $input['aspect_ratio'] = aiAspect(__DIR__ . '/../' . $originalImage, ['1:1', '3:2', '2:3']);
        $input['quality'] = 'high';
        unset($input['resolution']);
    }
    $data = kieCall($cfg, 'jobs/createTask', ['model' => $cfg['model'], 'input' => $input]);
    if (empty($data['taskId'])) respondError('Сервис ИИ не принял задачу', 502);
    return [
        'task_id' => (string)$data['taskId'],
        'model' => $cfg['model'],
        'status' => 'processing',
        'started_at' => date('Y-m-d H:i:s'),
        'error' => null,
    ];
}

// Ближайшие к фото пропорции из тех, что умеет GPT Image
function aiAspect($file, $allowed = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16', '21:9']) {
    $size = @getimagesize($file);
    if (!$size || !$size[1]) return in_array('4:3', $allowed, true) ? '4:3' : '3:2';
    $r = $size[0] / $size[1];
    $best = '1:1';
    foreach ($allowed as $a) {
        [$w, $h] = explode(':', $a);
        if (abs(log($r / ($w / $h))) < abs(log($r / (explode(':', $best)[0] / explode(':', $best)[1])))) $best = $a;
    }
    return $best;
}

// Проверить задачу; готовую картинку скачать к себе (kie.ai хранит её всего 14 дней)
function aiPoll($cfg, &$variant) {
    $ai = &$variant['ai'];
    $data = kieCall($cfg, 'jobs/recordInfo?taskId=' . urlencode($ai['task_id']));
    $state = $data['state'] ?? '';
    if ($state === 'fail') {
        $ai['status'] = 'failed';
        $ai['error'] = aiErrorText($data['failMsg'] ?? '');
        // Ответ kie.ai как есть — чтобы по проекту было видно настоящую причину сбоя
        $ai['fail_raw'] = trim(($data['failCode'] ?? '') . ' ' . ($data['failMsg'] ?? ''));
        return;
    }
    if ($state !== 'success') {
        // Зависшую задачу через 10 минут считаем неудачной
        if (time() - strtotime($ai['started_at']) > 600) {
            $ai['status'] = 'failed';
            $ai['error'] = 'ИИ не ответил за 10 минут — попробуйте ещё раз';
        }
        return;
    }
    $result = json_decode($data['resultJson'] ?? '', true);
    $url = $result['resultUrls'][0] ?? null;
    $img = $url ? aiDownload($url) : null;
    if (!$img) {
        $ai['status'] = 'failed';
        $ai['error'] = 'Не удалось скачать картинку от ИИ';
        return;
    }
    $variant['generated_image'] = $img;
    $ai['status'] = 'done';
}

function aiDownload($url) {
    if (!preg_match('#^https://[a-z0-9.-]+/#i', $url)) return null;
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 60, CURLOPT_FOLLOWLOCATION => true]);
    $bytes = curl_exec($ch);
    $type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    if (!is_string($bytes) || strlen($bytes) < 1000) return null;
    $ext = str_contains((string)$type, 'png') ? 'png' : (str_contains((string)$type, 'webp') ? 'webp' : 'jpg');
    $name = uniqid('img_', true) . '.' . $ext;
    if (file_put_contents(UPLOAD_GENERATED . $name, $bytes) === false) return null;
    return 'uploads/generated/' . $name;
}

function aiErrorText($msg) {
    if (stripos($msg, 'inappropriate') !== false || stripos($msg, 'sensitive') !== false) {
        return 'ИИ отклонил фото (сработал фильтр) — попробуйте другое фото или ещё раз';
    }
    if (stripos($msg, 'credit') !== false || stripos($msg, 'balance') !== false) return 'На балансе kie.ai закончились кредиты';
    if ($msg === '' || stripos($msg, 'internal') !== false || stripos($msg, 'response exception') !== false) {
        return 'ИИ не смог нарисовать — попробуйте ещё раз или выберите другую модель';
    }
    $msg = trim(explode('|', $msg)[0]);  // kie.ai дублирует текст по-китайски после «|»
    return "ИИ не смог нарисовать: $msg — попробуйте ещё раз";
}
