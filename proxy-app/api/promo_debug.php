<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

// Require admin key to view/use this debug page
$provided = $_GET['key'] ?? ($_POST['key'] ?? ($_SERVER['HTTP_X_ADMIN_KEY'] ?? ''));
if (!is_string($provided) || !hash_equals((string) config()['admin_key'], (string) $provided)) {
  http_response_code(403);
  echo "Forbidden: admin key required";
  exit;
}

// Optional admin init action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'init_db') {
    // Only allow if correct admin key provided
    $provided = $_POST['key'] ?? '';
    if (!hash_equals((string) config()['admin_key'], (string) $provided)) {
        http_response_code(403);
        echo "Forbidden\n";
        exit;
    }
    // Include init script
    ob_start();
    try {
        require __DIR__ . '/init_db.php';
    } catch (Throwable $e) {
        echo "Error: " . $e->getMessage();
    }
    $out = ob_get_clean();
    echo nl2br(htmlspecialchars($out, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    exit;
}

$dbPath = config()['db_path'] ?? 'database/app.db';
$pdo = db();
$promoRows = [];
try {
    $stmt = $pdo->query('SELECT id, code, plan_id, discount_amount, price_label, is_active, created_at FROM promo_codes ORDER BY id DESC');
    $promoRows = $stmt->fetchAll();
} catch (Throwable $e) {
    $promoRows = [];
}

?><!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Promo Debug</title>
  <style>
    body{font-family:system-ui,Arial;margin:18px;color:#111}
    input,select,textarea,button{font:inherit}
    .box{border:1px solid #ddd;padding:12px;margin-bottom:12px;border-radius:6px}
    pre{background:#f7f7f8;padding:8px;border-radius:4px;overflow:auto}
    label{display:block;margin:6px 0;font-weight:600}
  </style>
</head>
<body>
  <h2>Promo debug / диагностика</h2>
  <div class="box">
    <div><strong>DB path:</strong> <?php echo htmlspecialchars((string)$dbPath); ?></div>
    <div style="margin-top:6px;"><strong>Promo rows:</strong> <?php echo count($promoRows); ?></div>
    <details style="margin-top:8px;"><summary>Список в таблице promo_codes (последние 50)</summary>
      <pre><?php echo htmlspecialchars(json_encode($promoRows ?: [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); ?></pre>
    </details>
  </div>

  <div class="box">
    <h3>Server-side actions</h3>
    <form method="post" onsubmit="return confirm('Run DB init and seeds?');">
      <input type="hidden" name="action" value="init_db" />
      <label>Admin key (required to run init): <input name="key" style="width:60%" /></label>
      <button type="submit">Run init_db.php (create tables / seed)</button>
    </form>
  </div>

  <div class="box">
    <h3>API тестер</h3>
    <label>Admin JWT (Authorization Bearer): <input id="adminToken" style="width:80%" placeholder="Введите админский JWT" /></label>

    <label>Проверить промокод (публичный):</label>
    <input id="checkCode" placeholder="ASTANA" /> <button id="btnCheck">Проверить</button>

    <div style="margin-top:8px">
      <button id="btnList">GET /admin/promo-codes</button>
      <button id="btnCreate">POST /admin/promo-codes (create)</button>
      <button id="btnUpdate">PATCH /admin/promo-codes/{id} (update sample)</button>
      <button id="btnDelete">DELETE /admin/promo-codes/{id} (delete sample)</button>
    </div>

    <div style="margin-top:10px">
      <label>Sample create JSON (body):</label>
      <textarea id="createBody" rows="4" style="width:100%">{"code":"TEST123","plan_id":301,"discount_amount":100,"price_label":"100 ₽","is_active":1}</textarea>
    </div>

    <div style="margin-top:10px">
      <label>ID for update/delete sample:</label>
      <input id="sampleId" placeholder="enter id e.g. 1" />
    </div>

    <div style="margin-top:12px">
      <strong>Response:</strong>
      <pre id="result">-</pre>
    </div>
  </div>

  <script>
    const base = './'; // current folder: /proxy/api/
    const result = document.getElementById('result');
    const adminTokenEl = document.getElementById('adminToken');

    function show(v){ result.textContent = typeof v === 'string' ? v : JSON.stringify(v, null, 2); }

    document.getElementById('btnCheck').addEventListener('click', async ()=>{
      const code = document.getElementById('checkCode').value.trim();
      if(!code) return show('Введите код');
      try{
        const r = await fetch(base + 'promo?code=' + encodeURIComponent(code));
        const json = await r.text();
        show(r.status + '\n' + json);
      }catch(e){ show('Error: ' + e.message); }
    });

    document.getElementById('btnList').addEventListener('click', async ()=>{
      try{
        const headers = {};
        const t = adminTokenEl.value.trim(); if(t) headers['Authorization'] = 'Bearer ' + t;
        const r = await fetch(base + 'admin/promo-codes', { headers });
        const txt = await r.text(); show(r.status + '\n' + txt);
      }catch(e){ show('Error: ' + e.message); }
    });

    document.getElementById('btnCreate').addEventListener('click', async ()=>{
      try{
        const headers = {'Content-Type':'application/json'};
        const t = adminTokenEl.value.trim(); if(t) headers['Authorization'] = 'Bearer ' + t;
        const body = document.getElementById('createBody').value;
        const r = await fetch(base + 'admin/promo-codes', { method: 'POST', headers, body });
        const txt = await r.text(); show(r.status + '\n' + txt);
      }catch(e){ show('Error: ' + e.message); }
    });

    document.getElementById('btnUpdate').addEventListener('click', async ()=>{
      const id = document.getElementById('sampleId').value.trim(); if(!id) return show('Введите id');
      try{
        const headers = {'Content-Type':'application/json'};
        const t = adminTokenEl.value.trim(); if(t) headers['Authorization'] = 'Bearer ' + t;
        const body = prompt('Введите JSON для PATCH', '{"is_active":0}');
        const r = await fetch(base + 'admin/promo-codes/' + encodeURIComponent(id), { method: 'PATCH', headers, body });
        const txt = await r.text(); show(r.status + '\n' + txt);
      }catch(e){ show('Error: ' + e.message); }
    });

    document.getElementById('btnDelete').addEventListener('click', async ()=>{
      const id = document.getElementById('sampleId').value.trim(); if(!id) return show('Введите id');
      if(!confirm('Удалить промокод id=' + id + '?')) return;
      try{
        const headers = {};
        const t = adminTokenEl.value.trim(); if(t) headers['Authorization'] = 'Bearer ' + t;
        const r = await fetch(base + 'admin/promo-codes/' + encodeURIComponent(id), { method: 'DELETE', headers });
        const txt = await r.text(); show(r.status + '\n' + txt);
      }catch(e){ show('Error: ' + e.message); }
    });
  </script>
</body>
</html>
