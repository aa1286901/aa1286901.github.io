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

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => false,
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
    if (!isset($_SESSION['user_id'])) {
        respondError('Не авторизован', 401);
    }
    return $_SESSION['user_id'];
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
