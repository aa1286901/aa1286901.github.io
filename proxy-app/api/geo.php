<?php

declare(strict_types=1);

// Страна, город и оператор по IP — без сторонних сервисов.
// Базы DB-IP Lite (CC BY 4.0, https://db-ip.com) скачиваются на сервер раз в месяц
// и читаются здесь собственным читателем формата MaxMind DB (.mmdb).

final class MmdbReader
{
    private $fh;
    private int $nodeCount;
    private int $recordSize;
    private int $ipVersion;
    private int $nodeBytes;
    private int $treeSize;
    private int $dataStart;
    private int $ipv4Start = 0;

    public function __construct(string $path)
    {
        $fh = @fopen($path, 'rb');
        if (!$fh) {
            throw new RuntimeException('Cannot open ' . $path);
        }
        $this->fh = $fh;
        $size = filesize($path) ?: 0;
        $tailLen = min($size, 128 * 1024);
        fseek($fh, $size - $tailLen);
        $tail = (string) fread($fh, $tailLen);
        $pos = strrpos($tail, "\xAB\xCD\xEFMaxMind.com");
        if ($pos === false) {
            throw new RuntimeException('Not an mmdb file');
        }
        $metaOffset = $size - $tailLen + $pos + 14;
        $meta = $this->decode($metaOffset, $metaOffset)[0];
        $this->nodeCount = (int) $meta['node_count'];
        $this->recordSize = (int) $meta['record_size'];
        $this->ipVersion = (int) $meta['ip_version'];
        $this->nodeBytes = intdiv($this->recordSize * 2, 8);
        $this->treeSize = $this->nodeCount * $this->nodeBytes;
        $this->dataStart = $this->treeSize + 16;
        if ($this->ipVersion === 6) {
            $node = 0;
            for ($i = 0; $i < 96 && $node < $this->nodeCount; $i++) {
                $node = $this->readNode($node, 0);
            }
            $this->ipv4Start = $node;
        }
    }

    public function __destruct()
    {
        if (is_resource($this->fh)) {
            fclose($this->fh);
        }
    }

    public function get(string $ip): ?array
    {
        $packed = @inet_pton($ip);
        if ($packed === false) {
            return null;
        }
        $bits = strlen($packed) * 8;
        if ($bits === 128 && $this->ipVersion === 4) {
            return null;
        }
        $node = ($bits === 32 && $this->ipVersion === 6) ? $this->ipv4Start : 0;
        for ($i = 0; $i < $bits && $node < $this->nodeCount; $i++) {
            $bit = (ord($packed[$i >> 3]) >> (7 - ($i & 7))) & 1;
            $node = $this->readNode($node, $bit);
        }
        if ($node <= $this->nodeCount) {
            return null;
        }
        $offset = $this->dataStart + ($node - $this->nodeCount - 16);
        $value = $this->decode($offset, $this->dataStart)[0];
        return is_array($value) ? $value : null;
    }

    private function read(int $offset, int $len): string
    {
        if ($len <= 0) {
            return '';
        }
        fseek($this->fh, $offset);
        return (string) fread($this->fh, $len);
    }

    private function readNode(int $node, int $index): int
    {
        $b = $this->read($node * $this->nodeBytes, $this->nodeBytes);
        switch ($this->recordSize) {
            case 24:
                $s = substr($b, $index * 3, 3);
                return (ord($s[0]) << 16) | (ord($s[1]) << 8) | ord($s[2]);
            case 28:
                if ($index === 0) {
                    return ((ord($b[3]) & 0xF0) << 20) | (ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2]);
                }
                return ((ord($b[3]) & 0x0F) << 24) | (ord($b[4]) << 16) | (ord($b[5]) << 8) | ord($b[6]);
            case 32:
                return unpack('N', substr($b, $index * 4, 4))[1];
        }
        throw new RuntimeException('Unsupported record size');
    }

    /** @return array{0:mixed,1:int} значение и смещение после него */
    private function decode(int $offset, int $base): array
    {
        $ctrl = ord($this->read($offset, 1));
        $offset++;
        $type = $ctrl >> 5;
        if ($type === 1) { // указатель
            $ss = ($ctrl >> 3) & 0x3;
            $vbits = $ctrl & 0x7;
            $b = $this->read($offset, $ss + 1);
            $offset += $ss + 1;
            if ($ss === 0) {
                $p = ($vbits << 8) | ord($b[0]);
            } elseif ($ss === 1) {
                $p = (($vbits << 16) | (ord($b[0]) << 8) | ord($b[1])) + 2048;
            } elseif ($ss === 2) {
                $p = (($vbits << 24) | (ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2])) + 526336;
            } else {
                $p = unpack('N', $b)[1];
            }
            return [$this->decode($base + $p, $base)[0], $offset];
        }
        if ($type === 0) {
            $type = 7 + ord($this->read($offset, 1));
            $offset++;
        }
        $size = $ctrl & 0x1F;
        if ($size >= 29) {
            $n = $size - 28;
            $b = $this->read($offset, $n);
            $offset += $n;
            if ($n === 1) {
                $size = 29 + ord($b[0]);
            } elseif ($n === 2) {
                $size = 285 + ((ord($b[0]) << 8) | ord($b[1]));
            } else {
                $size = 65821 + ((ord($b[0]) << 16) | (ord($b[1]) << 8) | ord($b[2]));
            }
        }
        switch ($type) {
            case 2: // строка
            case 4: // байты
                return [$this->read($offset, $size), $offset + $size];
            case 3: // double
                return [unpack('E', $this->read($offset, 8))[1], $offset + 8];
            case 15: // float
                return [unpack('G', $this->read($offset, 4))[1], $offset + 4];
            case 5: case 6: case 9: case 10: case 8: // целые
                $v = 0;
                foreach (str_split($this->read($offset, $size)) as $ch) {
                    if ($ch === '') {
                        continue;
                    }
                    $v = ($v << 8) | ord($ch);
                }
                return [$v, $offset + $size];
            case 7: // словарь
                $map = [];
                for ($i = 0; $i < $size; $i++) {
                    [$k, $offset] = $this->decode($offset, $base);
                    [$v, $offset] = $this->decode($offset, $base);
                    $map[(string) $k] = $v;
                }
                return [$map, $offset];
            case 11: // массив
                $arr = [];
                for ($i = 0; $i < $size; $i++) {
                    [$v, $offset] = $this->decode($offset, $base);
                    $arr[] = $v;
                }
                return [$arr, $offset];
            case 14: // логическое
                return [$size !== 0, $offset];
        }
        return [null, $offset];
    }
}

function geo_dir(): string
{
    return __DIR__ . '/../database/geo';
}

function geo_reader(string $kind): ?MmdbReader
{
    static $cache = [];
    if (array_key_exists($kind, $cache)) {
        return $cache[$kind];
    }
    $path = geo_dir() . "/{$kind}.mmdb";
    try {
        $cache[$kind] = is_file($path) ? new MmdbReader($path) : null;
    } catch (Throwable $e) {
        $cache[$kind] = null;
    }
    return $cache[$kind];
}

/** Понятное название оператора по названию сети из базы. */
function geo_operator_name(string $org): string
{
    $map = [
        '/megafon/i' => 'МегаФон', '/mobile telesystems|\bmts\b/i' => 'МТС', '/vimpelcom|beeline/i' => 'Билайн',
        '/tele2|t2 mobile/i' => 'T2 (Tele2)', '/rostelecom/i' => 'Ростелеком', '/er-telecom/i' => 'Дом.ру',
        '/yota|scartel/i' => 'Yota', '/mgts|moscow city telephone/i' => 'МГТС', '/tattelecom/i' => 'Таттелеком',
        '/ufanet/i' => 'Уфанет', '/k-telecom|motiv/i' => 'Мотив', '/win mobile|k-telecom/i' => 'Win Mobile',
        '/sber/i' => 'СберМобайл', '/tinkoff|t-mobile llc/i' => 'Т-Мобайл', '/akado/i' => 'Акадо',
        '/netbynet|wifire/i' => 'Wifire', '/kazakhtelecom/i' => 'Казахтелеком', '/beltelecom/i' => 'Белтелеком',
        '/ucell/i' => 'Ucell', '/kcell/i' => 'Kcell',
    ];
    foreach ($map as $re => $name) {
        if (preg_match($re, $org)) {
            return $name;
        }
    }
    return $org;
}

function geo_country_ru(string $cc, string $fallback): string
{
    if ($cc !== '' && class_exists('Locale')) {
        $n = Locale::getDisplayRegion('-' . $cc, 'ru');
        if ($n !== '' && $n !== $cc) {
            return $n;
        }
    }
    return $fallback;
}

/** Что известно об IP: страна, регион, город, оператор. Пусто, если баз ещё нет. */
function geo_lookup(string $ip): array
{
    $out = [];
    $city = geo_reader('city');
    if ($city) {
        $r = $city->get($ip) ?? [];
        $cc = (string) ($r['country']['iso_code'] ?? '');
        $out['cc'] = $cc;
        $out['country'] = geo_country_ru($cc, (string) ($r['country']['names']['en'] ?? ''));
        $out['region'] = (string) ($r['subdivisions'][0]['names']['ru'] ?? $r['subdivisions'][0]['names']['en'] ?? '');
        $out['city'] = (string) ($r['city']['names']['ru'] ?? $r['city']['names']['en'] ?? '');
    }
    $asn = geo_reader('asn');
    if ($asn) {
        $r = $asn->get($ip) ?? [];
        $org = (string) ($r['autonomous_system_organization'] ?? '');
        $out['asn'] = (int) ($r['autonomous_system_number'] ?? 0);
        $out['org'] = $org;
        $out['operator'] = $org !== '' ? geo_operator_name($org) : '';
    }
    return array_filter($out, static fn ($v) => $v !== '' && $v !== 0);
}

function geo_status(): array
{
    $meta = json_decode((string) @file_get_contents(geo_dir() . '/meta.json'), true);
    return [
        'ready' => is_file(geo_dir() . '/city.mmdb') && is_file(geo_dir() . '/asn.mmdb'),
        'month' => is_array($meta) ? ($meta['month'] ?? null) : null,
        'updatedAt' => is_array($meta) ? ($meta['updatedAt'] ?? null) : null,
    ];
}

/** Скачивает свежие базы DB-IP Lite (город ~60 МБ, оператор ~5 МБ в архиве). */
function geo_update(): array
{
    @set_time_limit(600);
    @ignore_user_abort(true);
    $dir = geo_dir();
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        return ['ok' => false, 'message' => 'Не удалось создать папку для баз.'];
    }
    $months = [date('Y-m'), date('Y-m', strtotime('first day of last month'))];
    $done = null;
    foreach ($months as $month) {
        $ok = true;
        foreach (['city', 'asn'] as $kind) {
            $url = "https://download.db-ip.com/free/dbip-{$kind}-lite-{$month}.mmdb.gz";
            $gz = "{$dir}/{$kind}.mmdb.gz.part";
            $fh = fopen($gz, 'wb');
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_FILE => $fh, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 500, CURLOPT_FAILONERROR => true]);
            $res = curl_exec($ch);
            curl_close($ch);
            fclose($fh);
            if (!$res || filesize($gz) < 1000000) {
                @unlink($gz);
                $ok = false;
                break;
            }
            $in = gzopen($gz, 'rb');
            $tmp = "{$dir}/{$kind}.mmdb.part";
            $out = fopen($tmp, 'wb');
            while (!gzeof($in)) {
                fwrite($out, (string) gzread($in, 1 << 20));
            }
            gzclose($in);
            fclose($out);
            @unlink($gz);
            try {
                new MmdbReader($tmp);
            } catch (Throwable $e) {
                @unlink($tmp);
                $ok = false;
                break;
            }
            rename($tmp, "{$dir}/{$kind}.mmdb");
        }
        if ($ok) {
            $done = $month;
            break;
        }
    }
    if ($done === null) {
        return ['ok' => false, 'message' => 'Не удалось скачать базы DB-IP.'] + geo_status();
    }
    file_put_contents("{$dir}/meta.json", json_encode(['month' => $done, 'updatedAt' => date('Y-m-d H:i:s')]));
    return ['ok' => true] + geo_status();
}

// ---------- журнал заходов клиентов ----------

function ensure_visits_schema(): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;
    db()->exec('CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip TEXT, cc TEXT, country TEXT, region TEXT, city TEXT, asn INTEGER, org TEXT, operator TEXT
    )');
    db()->exec('CREATE INDEX IF NOT EXISTS idx_visits_phone ON visits(phone, id)');
}

/** Записываем заход: не чаще раза в 3 часа с того же IP, храним последние 50 на клиента. */
function visit_log(string $phone): void
{
    if ($phone === '') {
        return;
    }
    ensure_visits_schema();
    $ip = client_ip();
    $last = db()->prepare("SELECT ip, at FROM visits WHERE phone = :p ORDER BY id DESC LIMIT 1");
    $last->execute([':p' => $phone]);
    $row = $last->fetch();
    if ($row && $row['ip'] === $ip && strtotime((string) $row['at'] . ' UTC') > time() - 3 * 3600) {
        return;
    }
    $g = geo_lookup($ip);
    db()->prepare('INSERT INTO visits (phone, ip, cc, country, region, city, asn, org, operator)
        VALUES (:p, :ip, :cc, :country, :region, :city, :asn, :org, :op)')->execute([
        ':p' => $phone, ':ip' => $ip, ':cc' => $g['cc'] ?? null, ':country' => $g['country'] ?? null,
        ':region' => $g['region'] ?? null, ':city' => $g['city'] ?? null, ':asn' => $g['asn'] ?? null,
        ':org' => $g['org'] ?? null, ':op' => $g['operator'] ?? null,
    ]);
    db()->prepare('DELETE FROM visits WHERE phone = :p AND id NOT IN (SELECT id FROM visits WHERE phone = :p ORDER BY id DESC LIMIT 50)')
        ->execute([':p' => $phone]);
}

function visit_row(array $r): array
{
    return [
        'at' => $r['at'], 'ip' => $r['ip'], 'cc' => $r['cc'], 'country' => $r['country'], 'region' => $r['region'],
        'city' => $r['city'], 'operator' => $r['operator'], 'org' => $r['org'],
    ];
}

/** Последний заход каждого клиента — для карточек в списке. */
function visits_last_by_phone(): array
{
    ensure_visits_schema();
    $rows = db()->query('SELECT v.* FROM visits v JOIN (SELECT phone, MAX(id) mid FROM visits GROUP BY phone) t ON v.id = t.mid')->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $out[(string) $r['phone']] = visit_row($r);
    }
    return $out;
}

function visits_for(string $phone, int $limit = 10): array
{
    ensure_visits_schema();
    $st = db()->prepare('SELECT * FROM visits WHERE phone = :p ORDER BY id DESC LIMIT ' . max(1, min(50, $limit)));
    $st->execute([':p' => $phone]);
    return array_map('visit_row', $st->fetchAll());
}
