<?php
// Конфигурация приложения — JSON-хранилище (без MySQL)

define('DATA_DIR', __DIR__ . '/../data/');
define('DATABASE', DATA_DIR . 'database.json');
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
function getDB() {
    static $db = null;
    if ($db === null) {
        if (!file_exists(DATABASE)) {
            // Создаём пустую базу
            $db = [
                'users' => [],
                'projects' => [],
                'project_materials' => [],
                'project_cornices' => [],
                'user_favorites' => [],
                'meta' => ['version' => '1.0', 'created_at' => date('Y-m-d H:i:s')]
            ];
            saveDB();
        } else {
            $content = file_get_contents(DATABASE);
            $db = json_decode($content, true) ?? [];
        }
    }
    return $db;
}

function saveDB() {
    global $db;
    file_put_contents(DATABASE, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function getNextId($table, $key = 'id') {
    $db = getDB();
    if (empty($db[$table])) return 1;
    $max = 0;
    foreach ($db[$table] as $item) {
        if (isset($item[$key]) && $item[$key] > $max) {
            $max = $item[$key];
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

function ensureUploadDirs() {
    foreach ([UPLOAD_ORIGINALS, UPLOAD_GENERATED] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}
