<?php
require_once __DIR__ . '/../config.php';

$userId = requireAuth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['image'])) {
        respondError('Фото не загружено');
    }

    $file = $_FILES['image'];
    
    // Проверка ошибки загрузки
    if ($file['error'] !== UPLOAD_ERR_OK) {
        respondError('Ошибка загрузки файла');
    }

    // Проверка размера
    if ($file['size'] > MAX_FILE_SIZE) {
        respondError('Файл слишком большой. Максимум 10MB');
    }

    // Проверка MIME типа (не доверяем расширению)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, ALLOWED_TYPES)) {
        respondError('Разрешены только изображения JPG, PNG, WEBP');
    }

    // Определяем расширение по MIME
    $extMap = [
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    $ext = $extMap[$mime] ?? 'jpg';

    // Генерируем уникальное имя
    $filename = uniqid('img_', true) . '.' . $ext;
    // kind=generated — готовый набросок, иначе исходное фото
    $folder = ($_POST['kind'] ?? '') === 'generated' ? 'generated' : 'originals';
    $destination = ($folder === 'generated' ? UPLOAD_GENERATED : UPLOAD_ORIGINALS) . $filename;

    // Перемещаем файл
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respondError('Не удалось сохранить файл');
    }

    $url = 'uploads/' . $folder . '/' . $filename; // относительный путь: приложение живёт в подпапке
    respondSuccess(['url' => $url, 'filename' => $filename]);
}
