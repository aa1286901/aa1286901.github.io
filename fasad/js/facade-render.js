// === Отрисовка наброска фасада ===
// Всё считается в реальных миллиметрах: масштаб берётся из высоты стены, которую указал прораб.
// Зона (стена, цоколь, откос, мощение) — четырёхугольник с перспективой или многоугольник.
// Каждый пиксель зоны переводится в координаты стены, там вычисляется камень кладки,
// цвет берётся из текстуры камня, фаска даёт объём, а светотень берётся с размытого фото.
// Элементы (русты, колонны, замки, розетки...) — картинки изделий из каталога,
// перекрашенные в выбранный камень. Карнизы и наличники рисуются по профилю.

const PATTERNS = {
  running:     { name: 'Вперевязку' },
  third:       { name: 'Перевязка ⅓' },
  stack:       { name: 'Шов в шов' },
  random:      { name: 'Вразбежку' },
  mix:         { name: 'Микс форматов' },
  herringbone: { name: 'Ёлочка' },
  basket:      { name: 'Плетёнка' },
  chess:       { name: 'Шахматы', twoTone: true },
  diagonal:    { name: 'Диагональ' },
  rubble:      { name: 'Бут' },
  smooth:      { name: 'Без швов', noJoints: true },
};

// Форматы плитки из каталога «Камень Юг»: высота × длина, мм
const FORMATS = {
  '50x160':  { name: '50×160',  h: 50,  w: 160 },
  '80x160':  { name: '80×160',  h: 80,  w: 160 },
  '80x360':  { name: '80×360',  h: 80,  w: 360 },
  '160x160': { name: '160×160', h: 160, w: 160 },
  '160x360': { name: '160×360', h: 160, w: 360 },
  '300x600': { name: '300×600', h: 300, w: 600 },
  '350x750': { name: '350×750', h: 350, w: 750 },
};

// Фаска — как в каталоге: прямая, скошенная, скруглённая, четверть; плюс колотый край
const BEVELS = {
  straight: { name: 'Прямая' },
  chamfer:  { name: 'Скошенная' },
  round:    { name: 'Скруглённая' },
  rabbet:   { name: 'Четверть' },
  rustic:   { name: 'Колотая' },
};

const JOINTS = {
  light: { name: 'Светлый', color: [226, 220, 208] },
  grey:  { name: 'Серый',   color: [150, 145, 136] },
  dark:  { name: 'Тёмный',  color: [70, 64, 58] },
  none:  { name: 'Без шва', color: null },
};

const JOINT_WIDTHS = { 3: { name: '3 мм' }, 5: { name: '5 мм' }, 10: { name: '10 мм' } };

const ZONE_TYPES = {
  wall:    { name: 'Стена' },
  base:    { name: 'Цоколь' },
  reveal:  { name: 'Откос' },
  paving:  { name: 'Мощение' },
  opening: { name: 'Окно / дверь' }, // внутри проёма остаётся фото
};

const TEXEL_MM = 1.4; // сколько миллиметров камня в одном пикселе текстуры из каталога

const FacadeRender = {
  imageCache: {},

  // Загружает картинку (текстуру камня или изделие) в ImageData. Все файлы свои, поэтому canvas можно экспортировать
  loadImageData(src) {
    if (!src) return Promise.resolve(null);
    if (this.imageCache[src]) return this.imageCache[src];
    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, c.width, c.height));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
    this.imageCache[src] = promise;
    return promise;
  },

  // === Геометрия ===

  // Гомография: единичный квадрат (u,v) → четырёхугольник (углы по часовой от левого верхнего)
  homography(pts) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = pts;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = den ? (dx3 * dy2 - dx2 * dy3) / den : 0;
    const h = den ? (dx1 * dy3 - dx3 * dy1) / den : 0;
    return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h];
  },

  // Прямое отображение (u,v) → пиксель
  forward(pts) {
    const [a, b, c, d, e, f, g, h] = this.homography(pts);
    return (u, v) => {
      const w = g * u + h * v + 1;
      return [(a * u + b * v + c) / w, (d * u + e * v + f) / w];
    };
  },

  // Обратное отображение пиксель → (u,v)
  inverse(pts) {
    const [a, b, c, d, e, f, g, h] = this.homography(pts);
    const A = e - f * h, B = c * h - b, C = b * f - c * e;
    const D = f * g - d, E = a - c * g, F = c * d - a * f;
    const G = d * h - e * g, H = b * g - a * h, I = a * e - b * d;
    return (x, y) => {
      const w = G * x + H * y + I;
      return [(A * x + B * y + C) / w, (D * x + E * y + F) / w];
    };
  },

  dist(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  },

  pointInPolygon(x, y, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  },

  // Отображение зоны в (u,v) и её размеры в пикселях.
  // Четыре угла — перспектива; другое число углов (фронтон, Г-образная стена) — плоская сетка,
  // выровненная по самой длинной почти горизонтальной стороне
  zoneMapping(pts) {
    if (pts.length === 4) {
      return {
        inv: this.inverse(pts),
        inside: (u, v) => u >= 0 && u <= 1 && v >= 0 && v <= 1,
        w: (this.dist(pts[0], pts[1]) + this.dist(pts[3], pts[2])) / 2,
        h: (this.dist(pts[0], pts[3]) + this.dist(pts[1], pts[2])) / 2,
      };
    }
    let best = null;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const len = this.dist(p, q);
      const horizontal = Math.abs(q[1] - p[1]) < Math.abs(q[0] - p[0]);
      if (horizontal && (!best || len > best.len)) best = { p, q, len };
    });
    const angle = best ? Math.atan2(best.q[1] - best.p[1], best.q[0] - best.p[0]) : 0;
    const dir = angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle;
    const cos = Math.cos(dir), sin = Math.sin(dir);
    const rot = pts.map(([x, y]) => [x * cos + y * sin, -x * sin + y * cos]);
    const minU = Math.min(...rot.map(r => r[0])), maxU = Math.max(...rot.map(r => r[0]));
    const minV = Math.min(...rot.map(r => r[1])), maxV = Math.max(...rot.map(r => r[1]));
    const w = maxU - minU || 1, h = maxV - minV || 1;
    return {
      inv: (x, y) => [((x * cos + y * sin) - minU) / w, ((-x * sin + y * cos) - minV) / h],
      insidePx: (x, y) => this.pointInPolygon(x, y, pts),
      w, h,
    };
  },

  bounds(pts, W, H, pad = 0) {
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    return [
      Math.max(0, Math.floor(Math.min(...xs) - pad)), Math.min(W - 1, Math.ceil(Math.max(...xs) + pad)),
      Math.max(0, Math.floor(Math.min(...ys) - pad)), Math.min(H - 1, Math.ceil(Math.max(...ys) + pad)),
    ];
  },

  // Масштаб: пикселей фото на миллиметр. Берётся из первой стены с указанной высотой
  pxPerMm(design, W, H) {
    const ref = design.zones.find(z => z.type === 'wall' && z.heightM) || design.zones.find(z => z.heightM);
    if (ref) {
      const m = this.zoneMapping(ref.points);
      return m.h / (ref.heightM * 1000);
    }
    return H / 9000; // без мерки считаем, что фото по высоте ~9 м
  },

  // === Случайность и текстура ===

  hash(x, y) {
    let n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  },

  // Цвет камня в точке (мм); края текстуры отражаются — стыков не видно
  sampleStone(tex, xmm, ymm, out) {
    const tw = tex.width, th = tex.height;
    let tx = Math.abs(xmm / TEXEL_MM) % (2 * tw); if (tx >= tw) tx = 2 * tw - tx - 1;
    let ty = Math.abs(ymm / TEXEL_MM) % (2 * th); if (ty >= th) ty = 2 * th - ty - 1;
    const i = ((ty | 0) * tw + (tx | 0)) * 4;
    out[0] = tex.data[i]; out[1] = tex.data[i + 1]; out[2] = tex.data[i + 2];
    return out;
  },

  // === Кладка ===

  // Камень, в который попала точка (мм): id, координаты внутри камня и расстояния до четырёх краёв
  cell(pattern, x, y, bw, bh, cache) {
    const box = (id, lx, ly, w, h, tone = 0) => ({ id, lx, ly, dl: lx, dr: w - lx, dt: ly, db: h - ly, tone });

    if (pattern === 'rubble') {
      const s = Math.max(bw, bh) * 0.9;
      const cx = Math.floor(x / s), cy = Math.floor(y / s);
      let d1 = Infinity, d2 = Infinity, id = 0, lx = 0, ly = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const gx = cx + i, gy = cy + j;
          const px = (gx + 0.15 + 0.7 * this.hash(gx, gy)) * s;
          const py = (gy + 0.15 + 0.7 * this.hash(gy, gx + 7)) * s;
          const d = Math.hypot(x - px, y - py);
          if (d < d1) { d2 = d1; d1 = d; id = gx * 7919 + gy; lx = x - px; ly = y - py; }
          else if (d < d2) d2 = d;
        }
      }
      const e = (d2 - d1) / 2;
      // Для бута свет падает сверху-слева: верх камня светлее
      return { id, lx, ly, dl: e, dr: e, dt: ly < 0 ? e : e * 3, db: ly > 0 ? e : e * 3, tone: 0 };
    }

    if (pattern === 'diagonal') {
      const s = Math.SQRT1_2;
      const rx = (x + y) * s, ry = (y - x) * s;
      const c = Math.floor(rx / bh), r = Math.floor(ry / bh);
      return box(c * 10007 + r, rx - c * bh, ry - r * bh, bh, bh);
    }

    if (pattern === 'herringbone') {
      // Ёлочка 2:1: клетка u×u по диагональному индексу (a−c) mod 4 — половина лежачего или стоячего камня
      const u = bh;
      const a = Math.floor(x / u), c = Math.floor(y / u);
      const r = (((a - c) % 4) + 4) % 4;
      let bx, by, w, h;
      if (r === 0) { bx = a; by = c; w = 2; h = 1; }
      else if (r === 1) { bx = a - 1; by = c; w = 2; h = 1; }
      else if (r === 3) { bx = a; by = c; w = 1; h = 2; }
      else { bx = a; by = c - 1; w = 1; h = 2; }
      return box(bx * 10007 + by, x - bx * u, y - by * u, w * u, h * u);
    }

    if (pattern === 'basket') {
      // Плетёнка: квадраты 2×2 из пар камней, лёжа и стоя через один
      const u = bh, S = 2 * u;
      const qx = Math.floor(x / S), qy = Math.floor(y / S);
      const lx = x - qx * S, ly = y - qy * S;
      if (((qx + qy) & 1) === 0) {
        const r = Math.floor(ly / u);
        return box((qx * 2 + r) * 10007 + qy, lx, ly - r * u, S, u);
      }
      const c = Math.floor(lx / u);
      return box(qx * 20011 + qy * 2 + c, lx - c * u, ly, u, S);
    }

    // Ряды
    let row, rowY, rowH;
    if (pattern === 'mix' || pattern === 'random') {
      if (!cache.rows) cache.rows = [];
      const rows = cache.rows;
      let acc = rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].h : 0;
      while (acc <= y) {
        const h = pattern === 'mix' && this.hash(rows.length, 3) < 0.4 ? bh / 2 : bh;
        rows.push({ y: acc, h });
        acc += h;
      }
      let lo = 0, hi = rows.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (rows[mid].y <= y) lo = mid; else hi = mid - 1;
      }
      row = lo; rowY = rows[lo].y; rowH = rows[lo].h;
    } else {
      row = Math.floor(y / bh); rowY = row * bh; rowH = bh;
    }
    const ly = y - rowY;

    if (pattern === 'mix' || pattern === 'random') {
      // Длины камней в ряду случайные
      const key = 'r' + row;
      let edges = cache[key];
      if (!edges) {
        edges = [-bw * this.hash(row, 11)];
        cache[key] = edges;
      }
      while (edges[edges.length - 1] <= x) {
        edges.push(edges[edges.length - 1] + bw * (0.55 + 0.9 * this.hash(row, edges.length)));
      }
      let lo = 0, hi = edges.length - 2;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (edges[mid] <= x) lo = mid; else hi = mid - 1;
      }
      return box(row * 10007 + lo, x - edges[lo], ly, edges[lo + 1] - edges[lo], rowH);
    }

    const shift = pattern === 'stack' || pattern === 'chess' ? 0
      : pattern === 'third' ? (row % 3) * bw / 3
      : (row & 1) * bw / 2;
    const col = Math.floor((x + shift) / bw);
    const tone = pattern === 'chess' ? ((row + col) & 1) : 0;
    return box(row * 10007 + col, x + shift - col * bw, ly, bw, rowH, tone);
  },

  // Объём камня у края: свет сверху-слева, тень снизу-справа
  bevelShade(bevel, c, bwMm, id, x, y) {
    let { dl, dr, dt, db } = c;
    if (bevel === 'rustic') {
      // Колотый край: неровная граница и шероховатая поверхность
      const n = (this.hash(Math.floor(x / 9), Math.floor(y / 9) + id) - 0.5) * bwMm * 0.9;
      dl += n; dr -= n; dt += n; db -= n;
    }
    const m = Math.min(dl, dr, dt, db);
    let k = 1;
    if (m < bwMm) {
      const t = Math.max(0, m) / bwMm; // 0 у края, 1 — плоскость камня
      const lit = m === dt || m === dl ? 1 : -1;
      if (bevel === 'chamfer') k = 1 + lit * 0.22;
      else if (bevel === 'round') k = 1 + lit * 0.28 * (1 - t) * (1 - t);
      else if (bevel === 'rabbet') k = t < 0.5 ? 1 + lit * 0.3 : 1 - 0.08;
      else if (bevel === 'rustic') k = 1 + lit * 0.3 * (1 - t) - 0.1 * (1 - t);
      else k = t < 0.35 ? 1 + lit * 0.12 : 1;
    }
    if (bevel === 'rustic') k *= 0.92 + 0.16 * this.hash(Math.floor(x / 4) + id, Math.floor(y / 4));
    return k;
  },

  // === Освещение ===

  // Яркость фото, размытая до крупных пятен: тени и свет остаются, рисунок старой стены не проступает
  blurredLuma(src, W, H) {
    const n = W * H;
    const a = new Float32Array(n), b = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2];
    const r = Math.max(2, Math.round(Math.max(W, H) * 0.012));
    const pass = (from, to, len, count, stride, step) => {
      for (let k = 0; k < count; k++) {
        const base = k * stride;
        let sum = 0;
        for (let i = -r; i <= r; i++) sum += from[base + Math.min(len - 1, Math.max(0, i)) * step];
        for (let i = 0; i < len; i++) {
          to[base + i * step] = sum / (2 * r + 1);
          sum += from[base + Math.min(len - 1, i + r + 1) * step] - from[base + Math.max(0, i - r) * step];
        }
      }
    };
    for (let it = 0; it < 2; it++) { // два прохода коробочного размытия ≈ гауссово
      pass(a, b, W, H, W, 1);
      pass(b, a, H, W, 1, W);
    }
    return a;
  },

  averageLuma(luma, W, H, pts) {
    const [minX, maxX, minY, maxY] = this.bounds(pts, W, H);
    const step = Math.max(2, Math.floor((maxX - minX) / 60));
    let sum = 0, n = 0;
    for (let y = minY; y <= maxY; y += step) {
      for (let x = minX; x <= maxX; x += step) { sum += luma[y * W + x]; n++; }
    }
    return n ? sum / n : 128;
  },

  // Пишет цвет в результат с учётом светотени фото и прозрачности
  put(out, ctx, x, y, r, g, b, a = 1) {
    const i = (y * ctx.W + x) * 4;
    const light = Math.min(ctx.lightMax, Math.max(ctx.lightMin, ctx.lightBase + (1 - ctx.lightBase) * ctx.luma[y * ctx.W + x] / ctx.avg));
    r *= light; g *= light; b *= light;
    if (a >= 1) {
      out[i] = r; out[i + 1] = g; out[i + 2] = b;
    } else {
      out[i] += (r - out[i]) * a; out[i + 1] += (g - out[i + 1]) * a; out[i + 2] += (b - out[i + 2]) * a;
    }
  },

  lightCtx(luma, W, H, pts, base = 0.5, min = 0.45, max = 1.35) {
    return { luma, W, avg: this.averageLuma(luma, W, H, pts) || 1, lightBase: base, lightMin: min, lightMax: max };
  },

  // === Зоны облицовки ===

  renderZone(out, luma, W, H, zone, scale, cat) {
    const m = this.zoneMapping(zone.points);
    const hMm = zone.heightM ? zone.heightM * 1000 : m.h / scale;
    const wMm = m.w / m.h * hMm;
    const fmt = FORMATS[zone.format] || FORMATS['160x360'];
    const pattern = PATTERNS[zone.pattern] ? zone.pattern : 'running';
    const noJoints = PATTERNS[pattern].noJoints;
    const joint = noJoints ? null : (JOINTS[zone.joint] || JOINTS.grey).color;
    const jw = joint ? (+zone.jointMm || 5) : 0;
    const bevelMm = Math.min(18, fmt.h * 0.14);
    const tex1 = cat.textures[zone.materialId];
    const tex2 = cat.textures[zone.material2Id] || tex1;
    const fallback = [200, 190, 170];
    const ctx = this.lightCtx(luma, W, H, zone.points);
    const cache = {};
    const col = [0, 0, 0];
    const [minX, maxX, minY, maxY] = this.bounds(zone.points, W, H);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (m.insidePx && !m.insidePx(x + 0.5, y + 0.5)) continue;
        const [u, v] = m.inv(x + 0.5, y + 0.5);
        if (m.inside && !m.inside(u, v)) continue;
        const px = u * wMm, py = v * hMm;

        if (noJoints) {
          if (tex1) this.sampleStone(tex1, px, py, col); else col.splice(0, 3, ...fallback);
          this.put(out, ctx, x, y, col[0], col[1], col[2]);
          continue;
        }

        const c = this.cell(pattern, px, py, fmt.w, fmt.h, cache);
        if (joint && Math.min(c.dl, c.dr, c.dt, c.db) < jw / 2) {
          this.put(out, ctx, x, y, joint[0], joint[1], joint[2]);
          continue;
        }
        const rnd = this.hash(c.id, 17);
        const tex = c.tone ? tex2 : tex1;
        if (tex) this.sampleStone(tex, c.lx + rnd * 977, c.ly + this.hash(c.id, 29) * 991, col);
        else col.splice(0, 3, ...fallback);
        // Камни немного различаются по тону, у краёв — фаска
        const k = (0.93 + 0.14 * rnd) * this.bevelShade(zone.bevel || 'straight', c, bevelMm, c.id, px, py);
        this.put(out, ctx, x, y, col[0] * k, col[1] * k, col[2] * k);
      }
    }
  },

  // Проём: возвращаем исходные пиксели (окна и двери не облицовываются)
  restoreZone(out, src, W, H, pts) {
    const m = this.zoneMapping(pts);
    const [minX, maxX, minY, maxY] = this.bounds(pts, W, H);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (m.insidePx && !m.insidePx(x + 0.5, y + 0.5)) continue;
        const [u, v] = m.inv(x + 0.5, y + 0.5);
        if (m.inside && !m.inside(u, v)) continue;
        const i = (y * W + x) * 4;
        out[i] = src[i]; out[i + 1] = src[i + 1]; out[i + 2] = src[i + 2];
      }
    }
  },

  // === Профили (карниз, плинтус, подоконник, наличник, перила) ===

  // Яркость профиля в точке s (0 — верх, 1 — низ)
  profileShade(profile, s) {
    let acc = 0;
    for (let i = 0; i < profile.length; i++) {
      const [part, type] = profile[i];
      if (s <= acc + part || i === profile.length - 1) {
        const t = Math.min(1, Math.max(0, (s - acc) / part));
        switch (type) {
          case 'top': return 1.22;
          case 'under': return 0.55 + 0.1 * t;
          case 'convex': return 1.2 - 0.55 * t;    // вал: свет сверху, тень снизу
          case 'concave': return 0.62 + 0.55 * t;  // выкружка: тень сверху, свет снизу
          default: return 1.0;
        }
      }
      acc += part;
    }
    return 1;
  },

  // Полоса по профилю между линией p1–p2 (верх) и параллельной линией ниже на высоту профиля
  renderBand(out, luma, W, H, band, def, scale, cat, shadow = true) {
    const hPx = def.heightMm * scale * (band.scale || 1);
    const [x1, y1] = band.p1, [x2, y2] = band.p2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    if (ny < 0) { nx = -nx; ny = -ny; }
    const ext = def.kind === 'cornice' ? def.depthMm * scale * 0.25 : 0; // вынос карниза за край стены
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const a = [x1 - ux * ext, y1 - uy * ext], b = [x2 + ux * ext, y2 + uy * ext];
    const quad = [a, b, [b[0] + nx * hPx, b[1] + ny * hPx], [a[0] + nx * hPx, a[1] + ny * hPx]];
    this.renderProfileQuad(out, luma, W, H, quad, def, band.materialId, scale, cat);

    if (shadow && def.kind !== 'plinth') {
      // Падающая тень под выносом
      const sh = Math.min(def.depthMm * scale * 0.9, hPx * 1.2);
      const sq = [quad[3], quad[2], [quad[2][0] + nx * sh, quad[2][1] + ny * sh], [quad[3][0] + nx * sh, quad[3][1] + ny * sh]];
      this.darkenQuad(out, W, H, sq, 0.45);
    }
    return quad;
  },

  renderProfileQuad(out, luma, W, H, quad, def, materialId, scale, cat) {
    const inv = this.inverse(quad);
    const tex = cat.textures[materialId];
    const lenMm = this.dist(quad[0], quad[1]) / scale;
    const ctx = this.lightCtx(luma, W, H, quad, 0.7, 0.6, 1.25);
    const col = [0, 0, 0];
    const [minX, maxX, minY, maxY] = this.bounds(quad, W, H);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [u, v] = inv(x + 0.5, y + 0.5);
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        if (tex) this.sampleStone(tex, u * lenMm, v * def.heightMm + 300, col); else col.splice(0, 3, 230, 224, 210);
        const k = this.profileShade(def.profile, v);
        this.put(out, ctx, x, y, col[0] * k, col[1] * k, col[2] * k);
      }
    }
  },

  // Мягкое затемнение четырёхугольника (тень): сильнее у верхнего края
  darkenQuad(out, W, H, quad, strength) {
    const inv = this.inverse(quad);
    const [minX, maxX, minY, maxY] = this.bounds(quad, W, H);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [u, v] = inv(x + 0.5, y + 0.5);
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        const k = 1 - strength * (1 - v) * (1 - v);
        const i = (y * W + x) * 4;
        out[i] *= k; out[i + 1] *= k; out[i + 2] *= k;
      }
    }
  },

  // === Обрамление проёма: наличник, подоконник, замок ===

  renderOpeningDecor(out, luma, W, H, zone, scale, cat) {
    if (zone.points.length !== 4) return;
    const fwd = this.forward(zone.points);
    const m = this.zoneMapping(zone.points);
    const wMm = m.w / scale, hMm = m.h / scale;
    const frame = cat.bands[zone.frame];
    const sill = cat.bands[zone.sill];
    const mat = zone.decorMaterialId;

    if (frame) {
      // Наличник: четыре полосы вокруг проёма по профилю, углы на ус
      const fu = frame.heightMm / wMm, fv = frame.heightMm / hMm;
      const P = (u, v) => fwd(u, v);
      const sides = [
        [P(-fu, -fv), P(1 + fu, -fv), P(1, 0), P(0, 0)],          // верх
        [P(0, 1), P(1, 1), P(1 + fu, 1 + fv), P(-fu, 1 + fv)],    // низ
        [P(-fu, -fv), P(0, 0), P(0, 1), P(-fu, 1 + fv)],          // левая
        [P(1, 0), P(1 + fu, -fv), P(1 + fu, 1 + fv), P(1, 1)],    // правая
      ];
      // Для боковых сторон профиль идёт от внешнего края к проёму: поворачиваем четырёхугольник
      const rot = [
        sides[0],
        [sides[1][3], sides[1][2], sides[1][1], sides[1][0]],
        [sides[2][3], sides[2][0], sides[2][1], sides[2][2]],
        [sides[3][1], sides[3][2], sides[3][3], sides[3][0]],
      ];
      rot.forEach(q => this.renderProfileQuad(out, luma, W, H, q, frame, mat, scale, cat));
    }

    if (sill) {
      const over = (frame ? frame.heightMm : 0) + 60; // подоконник шире проёма
      const su = over / wMm;
      // Подоконник лежит по низу проёма и чуть заходит на наличник
      const top = (frame ? frame.heightMm : 0) / hMm * 0.3;
      this.renderBand(out, luma, W, H, { p1: fwd(-su, 1 + top), p2: fwd(1 + su, 1 + top), materialId: mat }, sill, scale, cat);
    }

    const ks = cat.sprites[zone.keystone];
    if (ks) {
      // Замок по центру над проёмом, нижний край заходит в проём
      const ku = ks.widthMm / wMm, kv = ks.heightMm / hMm;
      const bottom = kv * 0.25;
      const quad = [fwd(0.5 - ku / 2, bottom - kv), fwd(0.5 + ku / 2, bottom - kv), fwd(0.5 + ku / 2, bottom), fwd(0.5 - ku / 2, bottom)];
      this.renderSprite(out, luma, W, H, quad, ks, mat, scale, cat);
    }
  },

  // === Изделия-картинки (русты, колонны, замки, розетки...) ===

  // Картинка изделия, растянутая в четырёхугольник и перекрашенная в выбранный камень
  renderSprite(out, luma, W, H, quad, def, materialId, scale, cat) {
    const img = cat.images[def.image];
    if (!img) return;
    const inv = this.inverse(quad);
    const tex = cat.textures[materialId];
    const ctx = this.lightCtx(luma, W, H, quad, 0.75, 0.65, 1.2);
    const iw = img.width, ih = img.height, d = img.data;
    const col = [0, 0, 0];
    const [minX, maxX, minY, maxY] = this.bounds(quad, W, H);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [u, v] = inv(x + 0.5, y + 0.5);
        if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
        const i = (((v * ih) | 0) * iw + ((u * iw) | 0)) * 4;
        const a = d[i + 3] / 255;
        if (a < 0.04) continue;
        let r = d[i], g = d[i + 1], b = d[i + 2];
        if (tex) {
          // Объём берём с картинки, цвет и рисунок — с выбранного камня
          const shade = Math.min(1.45, (0.299 * r + 0.587 * g + 0.114 * b) / def.lumRef);
          this.sampleStone(tex, u * def.widthMm + 500, v * def.heightMm + 500, col);
          r = col[0] * shade; g = col[1] * shade; b = col[2] * shade;
        }
        this.put(out, ctx, x, y, r, g, b, a);
      }
    }
  },

  // Балюстрада: перила сверху, основание снизу, тумбы по краям и балясины между ними
  renderBalustrade(out, luma, W, H, item, scale, cat) {
    const q = item.points;
    const fwd = this.forward(q);
    const m = this.zoneMapping(q);
    const wMm = m.w / scale, hMm = m.h / scale;
    const rail = cat.bands[item.railId] || cat.bands['perila-p2'];
    const baluster = cat.sprites[item.balusterId] || Object.values(cat.sprites).find(s => s.group === 'baluster');
    const post = cat.sprites[item.postId];
    const railV = rail ? Math.min(0.3, rail.heightMm / hMm) : 0.15;
    const baseV = Math.min(0.2, 120 / hMm);
    const postU = post ? Math.min(0.25, post.widthMm / wMm) : 0;
    const sub = (u0, v0, u1, v1) => [fwd(u0, v0), fwd(u1, v0), fwd(u1, v1), fwd(u0, v1)];

    // Основание
    const baseDef = { heightMm: 120, profile: [[0.2, 'top'], [0.8, 'flat']] };
    this.renderProfileQuad(out, luma, W, H, sub(0, 1 - baseV, 1, 1), baseDef, item.materialId, scale, cat);

    // Балясины: ширина по пропорции картинки, шаг — с промежутком 0.6 ширины
    if (baluster) {
      const bh = 1 - railV - baseV;
      const bwMm = bh * hMm * baluster.w / baluster.h;
      const span = 1 - 2 * postU;
      const n = Math.max(1, Math.floor(span * wMm / (bwMm * 1.6)));
      const step = span / n, bu = bwMm / wMm;
      for (let k = 0; k < n; k++) {
        const cu = postU + step * (k + 0.5);
        this.renderSprite(out, luma, W, H, sub(cu - bu / 2, railV, cu + bu / 2, 1 - baseV), baluster, item.materialId, scale, cat);
      }
    }
    // Тумбы по краям
    if (post) {
      this.renderSprite(out, luma, W, H, sub(0, 0, postU, 1), post, item.materialId, scale, cat);
      this.renderSprite(out, luma, W, H, sub(1 - postU, 0, 1, 1), post, item.materialId, scale, cat);
    }
    // Перила
    if (rail) this.renderProfileQuad(out, luma, W, H, sub(postU, 0, 1 - postU, railV), rail, item.materialId, scale, cat);
  },

  // === Полная отрисовка ===

  // Загружает всё, что нужно для разметки: текстуры камней и картинки изделий
  async prepare(design, materials, elements) {
    const textures = {}, images = {};
    const matIds = new Set();
    design.zones.forEach(z => { matIds.add(z.materialId); matIds.add(z.material2Id); matIds.add(z.decorMaterialId); });
    design.bands.forEach(b => matIds.add(b.materialId));
    (design.items || []).forEach(i => matIds.add(i.materialId));
    await Promise.all([...matIds].filter(id => id && materials[id]).map(async id => {
      textures[id] = await this.loadImageData(materials[id].texture);
    }));
    const spriteIds = new Set();
    design.zones.forEach(z => z.keystone && spriteIds.add(z.keystone));
    (design.items || []).forEach(i => { [i.spriteId, i.balusterId, i.postId].forEach(s => s && spriteIds.add(s)); });
    if ((design.items || []).some(i => i.kind === 'balustrade')) {
      Object.values(elements.sprites).filter(s => s.group === 'baluster').slice(0, 1).forEach(s => spriteIds.add(s.id));
    }
    await Promise.all([...spriteIds].filter(id => elements.sprites[id]).map(async id => {
      const s = elements.sprites[id];
      images[s.image] = await this.loadImageData(s.image);
    }));
    return { textures, images, sprites: elements.sprites, bands: elements.bands };
  },

  // Фото + зоны + проёмы + обрамление + карнизы + изделия. Возвращает canvas с результатом
  async render(photoCanvas, design, materials, elements) {
    const W = photoCanvas.width, H = photoCanvas.height;
    const src = photoCanvas.getContext('2d').getImageData(0, 0, W, H).data;
    const outData = new ImageData(new Uint8ClampedArray(src), W, H);
    const out = outData.data;
    const luma = this.blurredLuma(src, W, H);
    const cat = await this.prepare(design, materials, elements);
    const scale = this.pxPerMm(design, W, H);

    // Сначала мощение и стены, потом цоколь и откосы — они ложатся поверх
    const order = { paving: 0, wall: 1, base: 2, reveal: 3 };
    design.zones
      .filter(z => z.type !== 'opening')
      .sort((a, b) => order[a.type] - order[b.type])
      .forEach(z => this.renderZone(out, luma, W, H, z, scale, cat));

    const openings = design.zones.filter(z => z.type === 'opening');
    openings.forEach(z => this.restoreZone(out, src, W, H, z.points));
    openings.forEach(z => this.renderOpeningDecor(out, luma, W, H, z, scale, cat));

    design.bands.forEach(b => {
      const def = cat.bands[b.bandId] || cat.bands.k1;
      this.renderBand(out, luma, W, H, b, def, scale, cat);
    });

    (design.items || []).forEach(item => {
      if (item.kind === 'balustrade') this.renderBalustrade(out, luma, W, H, item, scale, cat);
      else if (cat.sprites[item.spriteId]) this.renderSprite(out, luma, W, H, item.points, cat.sprites[item.spriteId], item.materialId, scale, cat);
    });

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.getContext('2d').putImageData(outData, 0, 0);
    return canvas;
  },
};
