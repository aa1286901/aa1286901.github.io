<?php
// Конфигурация приложения — JSON-хранилище (без MySQL)

define('DATA_DIR', __DIR__ . '/../data/');
define('DATABASE', DATA_DIR . 'db.php');
define('DB_LOCK', DATA_DIR . 'db.lock');
define('DB_GUARD', "<?php http_response_code(404); exit; ?>\n");
define('LEGACY_DATABASE', DATA_DIR . 'database.json'); // старая публичная база, переносится автоматически
define('SEED_DATABASE', DATA_DIR . 'seed.json');        // демо-данные для новой установки
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_ORIGINALS', UPLOAD_DIR . 'originals/');
define('UPLOAD_GENERATED', UPLOAD_DIR . 'generated/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp']);

// Session. Сама сессия на хостинге живёт недолго, поэтому вход держит ещё и долгий токен
// «запомнить меня» (кука fasad_remember на год): по нему сессия восстанавливается сама.
define('REMEMBER_COOKIE', 'fasad_remember');
define('REMEMBER_DAYS', 365);
define('IS_HTTPS', ($_SERVER['HTTPS'] ?? '') === 'on' || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.gc_maxlifetime', (string)(30 * 86400));
    session_set_cookie_params([
        'lifetime' => 30 * 86400,
        'path' => '/',
        'secure' => IS_HTTPS,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://ahmedov.online',
    'https://www.ahmedov.online',
    'http://localhost',
    'http://localhost:8000',
];

$is_allowed = in_array($origin, $allowed_origins) || empty($origin);

header('Content-Type: application/json');
if ($is_allowed) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($is_allowed) {
        header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
        header('Access-Control-Allow-Credentials: true');
    }
    http_response_code(200);
    exit;
}

// === JSON-хранилище (замена MySQL) ===
// База лежит в data/db.php: первая строка — PHP-заглушка, поэтому при прямом
// запросе файла сервер выполняет её и ничего не отдаёт. .htaccess не нужен (сервер — nginx).
// Весь запрос держит эксклюзивную блокировку, чтобы параллельные запросы не затирали друг друга.

function emptyDB() {
    return [
        'users' => [],
        'projects' => [],
        'project_materials' => [],
        'project_cornices' => [],
        'user_favorites' => [],
        'meta' => ['version' => '1.0', 'created_at' => date('Y-m-d H:i:s')]
    ];
}

function lockDB() {
    static $lock = null;
    if ($lock === null) {
        $lock = fopen(DB_LOCK, 'c');
        if (!$lock || !flock($lock, LOCK_EX)) {
            respondError('База данных недоступна', 500);
        }
    }
}

function readJsonDB($path) {
    $content = file_get_contents($path);
    if (str_starts_with($content, '<?php')) {
        $content = substr($content, strpos($content, "\n") + 1);
    }
    $data = json_decode($content, true);
    if ($data === null && trim($content) !== 'null' && trim($content) !== '') {
        // Файл повреждён — не перезаписываем его, чтобы не потерять данные
        respondError('База данных повреждена', 500);
    }
    return is_array($data) ? array_merge(emptyDB(), $data) : emptyDB();
}

function getDB() {
    lockDB();
    if (file_exists(DATABASE)) {
        return readJsonDB(DATABASE);
    }
    // Первый запуск: переносим старую публичную database.json или берём демо-данные
    if (file_exists(LEGACY_DATABASE)) {
        $db = readJsonDB(LEGACY_DATABASE);
        saveDB($db);
        unlink(LEGACY_DATABASE);
    } elseif (file_exists(SEED_DATABASE)) {
        $db = readJsonDB(SEED_DATABASE);
        saveDB($db);
    } else {
        $db = emptyDB();
        saveDB($db);
    }
    return $db;
}

function saveDB($db) {
    lockDB();
    $json = json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $tmp = DATABASE . '.tmp';
    if ($json === false || file_put_contents($tmp, DB_GUARD . $json) === false || !rename($tmp, DATABASE)) {
        respondError('Не удалось сохранить данные', 500);
    }
}

// Настройки хостинга (data/ai.php) читаем мимо opcache: после смены ключа сразу нужен новый
function includeFresh($file) {
    if (!file_exists($file)) return null;
    if (function_exists('opcache_invalidate')) opcache_invalidate($file, true);
    return include $file;
}

function writeConfig($file, $cfg) {
    $ok = file_put_contents($file, '<?php return ' . var_export($cfg, true) . ";\n") !== false;
    if ($ok && function_exists('opcache_invalidate')) opcache_invalidate($file, true);
    return $ok;
}

function getNextId($rows) {
    $max = 0;
    foreach ($rows as $item) {
        if (isset($item['id']) && $item['id'] > $max) {
            $max = $item['id'];
        }
    }
    return $max + 1;
}

function respondSuccess($data = null, $message = 'OK') {
    $response = ['success' => true, 'message' => $message];
    if ($data !== null) $response['data'] = $data;
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

function respondError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

function requireAuth() {
    $userId = currentUserId();
    if ($userId === null) {
        respondError('Не авторизован', 401);
    }
    return $userId;
}

// Кто вошёл: из сессии, а если она истекла — по токену «запомнить меня»
function currentUserId() {
    if (isset($_SESSION['user_id'])) return $_SESSION['user_id'];
    $cookie = (string)($_COOKIE[REMEMBER_COOKIE] ?? '');
    if (!preg_match('/^(\d+)\.([a-f0-9]{64})$/', $cookie, $m)) return null;
    $db = getDB();
    $hash = hash('sha256', $m[2]);
    foreach ($db['users'] as $i => $u) {
        if ($u['id'] !== (int)$m[1]) continue;
        foreach ($u['remember'] ?? [] as $j => $t) {
            if (!hash_equals($t['hash'], $hash) || $t['expires'] < date('Y-m-d H:i:s')) continue;
            session_regenerate_id(true);
            $_SESSION['user_id'] = $u['id'];
            // Пользуется — продлеваем ещё на год
            $db['users'][$i]['remember'][$j]['expires'] = date('Y-m-d H:i:s', strtotime('+' . REMEMBER_DAYS . ' days'));
            saveDB($db);
            setRememberCookie("{$u['id']}.{$m[2]}");
            return $u['id'];
        }
    }
    setRememberCookie('');  // токен устарел или отозван
    return null;
}

function setRememberCookie($value) {
    setcookie(REMEMBER_COOKIE, $value, [
        'expires' => $value === '' ? time() - 3600 : time() + REMEMBER_DAYS * 86400,
        'path' => '/',
        'secure' => IS_HTTPS,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

// После входа или регистрации: новый токен на это устройство (у каждого до 10 устройств)
function rememberUser(&$db, $userId) {
    $token = bin2hex(random_bytes(32));
    $now = date('Y-m-d H:i:s');
    foreach ($db['users'] as $i => $u) {
        if ($u['id'] !== $userId) continue;
        $tokens = array_values(array_filter($u['remember'] ?? [], fn($t) => $t['expires'] > $now));
        $tokens[] = ['hash' => hash('sha256', $token), 'expires' => date('Y-m-d H:i:s', strtotime('+' . REMEMBER_DAYS . ' days')), 'created_at' => $now];
        $db['users'][$i]['remember'] = array_slice($tokens, -10);
    }
    saveDB($db);
    setRememberCookie("$userId.$token");
}

// Выход: отозвать токен этого устройства
function forgetUser() {
    $cookie = (string)($_COOKIE[REMEMBER_COOKIE] ?? '');
    if (preg_match('/^(\d+)\.([a-f0-9]{64})$/', $cookie, $m)) {
        $db = getDB();
        $hash = hash('sha256', $m[2]);
        foreach ($db['users'] as $i => $u) {
            if ($u['id'] !== (int)$m[1]) continue;
            $db['users'][$i]['remember'] = array_values(array_filter($u['remember'] ?? [], fn($t) => !hash_equals($t['hash'], $hash)));
        }
        saveDB($db);
    }
    setRememberCookie('');
}

// Варианты проекта. У проектов, сохранённых до вариантов, единственный вариант — их подбор и картинка
function projectVariants($project) {
    if (!empty($project['variants']) && is_array($project['variants'])) {
        return $project['variants'];
    }
    return [[
        'id' => 1,
        'design' => $project['design'] ?? null,
        'generated_image' => $project['generated_image'] ?? null,
        'created_at' => $project['created_at'] ?? date('Y-m-d H:i:s'),
        'starred' => false,
    ]];
}

function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Создаём директории
ensureUploadDirs();

// Старая публичная database.json переносится при первом же запросе к API
if (file_exists(LEGACY_DATABASE) && !file_exists(DATABASE)) {
    getDB();
}

function ensureUploadDirs() {
    foreach ([UPLOAD_ORIGINALS, UPLOAD_GENERATED] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}
