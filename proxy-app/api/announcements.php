<?php

declare(strict_types=1);

// Объявления и реклама в кабинете клиента: карусель баннеров на главной.

const ANN_TAGS = ['', 'Объявление', 'Реклама', 'Акция', 'Новое'];
const ANN_ACTIONS = ['none', 'link', 'pay', 'combo', 'vpn', 'referral'];

function ensure_ann_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;
    db()->exec('CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT NOT NULL DEFAULT "",
        title TEXT NOT NULL,
        text TEXT NOT NULL DEFAULT "",
        action TEXT NOT NULL DEFAULT "none",
        button_text TEXT NOT NULL DEFAULT "",
        url TEXT NOT NULL DEFAULT "",
        color TEXT NOT NULL DEFAULT "#5B3FD6",
        image_url TEXT NOT NULL DEFAULT "",
        ends_at TEXT DEFAULT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort INTEGER NOT NULL DEFAULT 0,
        clicks INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');
}

function ann_row(array $r, bool $admin = false): array
{
    $out = [
        'id' => (int) $r['id'],
        'tag' => (string) $r['tag'],
        'title' => (string) $r['title'],
        'text' => (string) $r['text'],
        'action' => (string) $r['action'],
        'buttonText' => (string) $r['button_text'],
        'url' => (string) $r['url'],
        'color' => (string) $r['color'],
        'imageUrl' => (string) $r['image_url'],
    ];
    if ($admin) {
        $out += [
            'endsAt' => $r['ends_at'] ?: null,
            'isActive' => (int) $r['is_active'] === 1,
            'sort' => (int) $r['sort'],
            'clicks' => (int) $r['clicks'],
            'createdAt' => (string) $r['created_at'],
        ];
    }
    return $out;
}

function ann_clean(array $d): array
{
    $str = static fn ($v, int $max) => mb_substr(trim((string) preg_replace('/\s+/u', ' ', (string) $v)), 0, $max);
    $title = $str($d['title'] ?? '', 80);
    if ($title === '') {
        json_response(['message' => 'Введите заголовок'], 422);
    }
    $action = in_array($d['action'] ?? 'none', ANN_ACTIONS, true) ? (string) $d['action'] : 'none';
    $url = trim((string) ($d['url'] ?? ''));
    if ($action === 'link' && !preg_match('#^(https?://|tel:|mailto:)\S+$#i', $url)) {
        json_response(['message' => 'Ссылка должна начинаться с https:// (или tel:)'], 422);
    }
    $color = preg_match('/^#[0-9a-f]{6}$/i', (string) ($d['color'] ?? '')) ? (string) $d['color'] : '#5B3FD6';
    $image = trim((string) ($d['imageUrl'] ?? ''));
    if ($image !== '' && !preg_match('#^https?://\S+$#i', $image)) {
        $image = '';
    }
    $ends = trim((string) ($d['endsAt'] ?? ''));
    $ends = preg_match('/^\d{4}-\d{2}-\d{2}$/', $ends) ? $ends : null;
    return [
        ':tag' => in_array($d['tag'] ?? '', ANN_TAGS, true) ? (string) $d['tag'] : '',
        ':title' => $title,
        ':text' => $str($d['text'] ?? '', 160),
        ':action' => $action,
        ':button' => $action === 'none' ? '' : ($str($d['buttonText'] ?? '', 30) ?: 'Подробнее'),
        ':url' => $action === 'link' ? $url : '',
        ':color' => $color,
        ':image' => $image,
        ':ends' => $ends,
        ':active' => !empty($d['isActive']) ? 1 : 0,
    ];
}

// Картинка приходит как data:image/...;base64 (уменьшенная в браузере), сохраняем в uploads/ann/
function ann_save_image(string $dataUrl): string
{
    if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#', $dataUrl, $m)) {
        json_response(['message' => 'Нужна картинка JPG, PNG или WebP'], 422);
    }
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) > 1_500_000) {
        json_response(['message' => 'Картинка слишком большая'], 422);
    }
    $info = @getimagesizefromstring($bin);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$info['mime'] ?? ''] ?? null;
    if (!$info || !$ext) {
        json_response(['message' => 'Файл не похож на картинку'], 422);
    }
    $dir = dirname(__DIR__) . '/uploads/ann';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        json_response(['message' => 'Не удалось сохранить картинку'], 500);
    }
    $ht = dirname(__DIR__) . '/uploads/.htaccess';
    if (!is_file($ht)) {
        file_put_contents($ht, "Options -Indexes\n<FilesMatch \"\\.(php|phtml|phar|pl|py|cgi|sh)$\">\n  Require all denied\n</FilesMatch>\n");
    }
    $name = bin2hex(random_bytes(10)) . '.' . $ext;
    file_put_contents($dir . '/' . $name, $bin);
    return vpn_public_base() . '/uploads/ann/' . $name;
}

function ann_handle_routes(string $uri, string $method): void
{
    if (strpos($uri, '/api/announcements') !== 0 && strpos($uri, '/api/admin/announcements') !== 0) {
        return;
    }
    ensure_ann_schema();

    if ($uri === '/api/announcements' && $method === 'GET') {
        $rows = db()->query("SELECT * FROM announcements WHERE is_active = 1 AND (ends_at IS NULL OR ends_at >= date('now', '+3 hours'))
            ORDER BY sort ASC, id DESC LIMIT 10")->fetchAll();
        json_response(['items' => array_map(static fn ($r) => ann_row($r), $rows)]);
    }
    if (preg_match('#^/api/announcements/(\d+)/click$#', $uri, $m) === 1 && $method === 'POST') {
        db()->prepare('UPDATE announcements SET clicks = clicks + 1 WHERE id = :id')->execute([':id' => (int) $m[1]]);
        json_response(['ok' => true]);
    }

    require_admin();
    if ($uri === '/api/admin/announcements' && $method === 'GET') {
        $rows = db()->query('SELECT * FROM announcements ORDER BY sort ASC, id DESC')->fetchAll();
        json_response(['items' => array_map(static fn ($r) => ann_row($r, true), $rows)]);
    }
    if ($uri === '/api/admin/announcements/upload' && $method === 'POST') {
        json_response(['url' => ann_save_image((string) (read_json_body()['image'] ?? ''))]);
    }
    if ($uri === '/api/admin/announcements' && $method === 'POST') {
        $data = read_json_body();
        $p = ann_clean($data);
        $id = (int) ($data['id'] ?? 0);
        if ($id > 0) {
            $p[':id'] = $id;
            db()->prepare('UPDATE announcements SET tag=:tag, title=:title, text=:text, action=:action, button_text=:button, url=:url,
                color=:color, image_url=:image, ends_at=:ends, is_active=:active WHERE id=:id')->execute($p);
        } else {
            $p[':sort'] = (int) db()->query('SELECT COALESCE(MIN(sort), 0) - 1 FROM announcements')->fetchColumn();
            db()->prepare('INSERT INTO announcements (tag, title, text, action, button_text, url, color, image_url, ends_at, is_active, sort)
                VALUES (:tag, :title, :text, :action, :button, :url, :color, :image, :ends, :active, :sort)')->execute($p);
        }
        json_response(['ok' => true]);
    }
    if (preg_match('#^/api/admin/announcements/(\d+)/(toggle|move)$#', $uri, $m) === 1 && $method === 'POST') {
        $id = (int) $m[1];
        if ($m[2] === 'toggle') {
            db()->prepare('UPDATE announcements SET is_active = 1 - is_active WHERE id = :id')->execute([':id' => $id]);
        } else {
            // Переставляем: пересчитываем порядок целиком
            $dir = (int) (read_json_body()['dir'] ?? 0) < 0 ? -1 : 1;
            $ids = array_map('intval', db()->query('SELECT id FROM announcements ORDER BY sort ASC, id DESC')->fetchAll(PDO::FETCH_COLUMN));
            $i = array_search($id, $ids, true);
            if ($i !== false && isset($ids[$i + $dir])) {
                [$ids[$i], $ids[$i + $dir]] = [$ids[$i + $dir], $ids[$i]];
            }
            $st = db()->prepare('UPDATE announcements SET sort = :s WHERE id = :id');
            foreach ($ids as $pos => $aid) {
                $st->execute([':s' => $pos, ':id' => $aid]);
            }
        }
        json_response(['ok' => true]);
    }
    if (preg_match('#^/api/admin/announcements/(\d+)$#', $uri, $m) === 1 && $method === 'DELETE') {
        db()->prepare('DELETE FROM announcements WHERE id = :id')->execute([':id' => (int) $m[1]]);
        json_response(['ok' => true]);
    }
    json_response(['message' => 'Not found'], 404);
}
