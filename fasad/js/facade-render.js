// === Отрисовка наброска фасада ===
// Зона — четырёхугольник на фото (углы по часовой: верх-лево, верх-право, низ-право, низ-лево).
// Каждый пиксель зоны переводится обратно в «плоские» координаты стены (гомография),
// там вычисляется узор кладки, а цвет камня берётся из текстуры материала.
// Яркость исходного фото сохраняется, поэтому тени и освещение остаются на месте.

const PATTERNS = {
  sawn:        { name: 'Пиленый',      blockW: 2.2, blockH: 1,   bevel: 0.15 },
  split:       { name: 'Колотый',      blockW: 2.0, blockH: 1,   bevel: 0.45, random: true },
  big:         { name: 'Крупный блок', blockW: 3.2, blockH: 1.6, bevel: 0.2 },
  tile:        { name: 'Плитка',       blockW: 1,   blockH: 1,   bevel: 0.1, stack: true },
  herringbone: { name: 'Ёлочка',       blockW: 2,   blockH: 0.9, bevel: 0.15, herringbone: true },
  rubble:      { name: 'Бут',          blockW: 1.6, blockH: 1.6, bevel: 0.5, voronoi: true },
  smooth:      { name: 'Без швов',     blockW: 4,   blockH: 4,   bevel: 0, noJoints: true },
};

const STONE_SIZES = {
  s: { name: 'Мелкий',  k: 0.022 },
  m: { name: 'Средний', k: 0.034 },
  l: { name: 'Крупный', k: 0.05 },
};

const JOINTS = {
  light: { name: 'Светлый', color: [226, 220, 208] },
  grey:  { name: 'Серый',   color: [150, 145, 136] },
  dark:  { name: 'Тёмный',  color: [70, 64, 58] },
  none:  { name: 'Без шва', color: null },
};

const ZONE_TYPES = {
  wall:    { name: 'Стена',  stroke: '#c9a86a' },
  base:    { name: 'Цоколь', stroke: '#8d6e4a' },
  reveal:  { name: 'Откос',  stroke: '#5b8fb9' },
  opening: { name: 'Проём',  stroke: '#e53935' }, // окно/дверь: остаётся как на фото
};

const BAND_COLORS = {
  white: { name: 'Белый',     color: [242, 239, 232] },
  cream: { name: 'Кремовый',  color: [226, 212, 182] },
  sand:  { name: 'Песочный',  color: [201, 176, 132] },
  grey:  { name: 'Серый',     color: [165, 162, 156] },
};

const BAND_TYPES = {
  cornice: { name: 'Карниз', thickness: 0.035, shadow: 0.9 },
  belt:    { name: 'Пояс',   thickness: 0.018, shadow: 0.5 },
};

const FacadeRender = {
  textureCache: {},

  // Загружает текстуру материала в ImageData (локальный файл, поэтому canvas не «загрязняется»)
  async loadTexture(material) {
    const src = material?.texture;
    if (!src) return null;
    if (this.textureCache[src]) return this.textureCache[src];
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
    this.textureCache[src] = promise;
    return promise;
  },

  // Гомография: единичный квадрат (u,v) → четырёхугольник. Возвращает обратное отображение пиксель → (u,v)
  inverseHomography(pts) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = pts;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = den ? (dx3 * dy2 - dx2 * dy3) / den : 0;
    const h = den ? (dx1 * dy3 - dx3 * dy1) / den : 0;
    const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0;
    const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
    // Обратная матрица 3x3 для [[a,b,c],[d,e,f],[g,h,1]]
    const A = e - f * h, B = c * h - b, C = b * f - c * e;
    const D = f * g - d, E = a - c * g, F = c * d - a * f;
    const G = d * h - e * g, H = b * g - a * h, I = a * e - b * d;
    return (x, y) => {
      const w = G * x + H * y + I;
      return [(A * x + B * y + C) / w, (D * x + E * y + F) / w];
    };
  },

  // Детерминированный «случай» по целым координатам блока
  hash(x, y) {
    let n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  },

  // Возвращает блок, в который попала точка: id для случайностей, локальные координаты и расстояние до шва
  patternCell(p, x, y, bw, bh, rowCache) {
    if (p.voronoi) {
      const cx = Math.floor(x / bw), cy = Math.floor(y / bh);
      let d1 = Infinity, d2 = Infinity, id = 0, lx = 0, ly = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const gx = cx + i, gy = cy + j;
          const px = (gx + 0.15 + 0.7 * this.hash(gx, gy)) * bw;
          const py = (gy + 0.15 + 0.7 * this.hash(gy, gx + 7)) * bh;
          const d = Math.hypot(x - px, y - py);
          if (d < d1) { d2 = d1; d1 = d; id = gx * 7919 + gy; lx = x - px; ly = y - py; }
          else if (d < d2) d2 = d;
        }
      }
      return { id, lx, ly, edge: (d2 - d1) / 2 };
    }

    if (p.herringbone) {
      // Ёлочка из камней 2:1. Каждая клетка u×u по диагональному индексу (a−b) mod 4
      // относится к левой/правой половине лежачего камня или к верхней/нижней стоячего
      const u = bh;
      const a = Math.floor(x / u), c = Math.floor(y / u);
      const r = (((a - c) % 4) + 4) % 4;
      let bx, by, w, h;
      if (r === 0) { bx = a; by = c; w = 2; h = 1; }
      else if (r === 1) { bx = a - 1; by = c; w = 2; h = 1; }
      else if (r === 3) { bx = a; by = c; w = 1; h = 2; }
      else { bx = a; by = c - 1; w = 1; h = 2; }
      const lx = x - bx * u, ly = y - by * u;
      return { id: bx * 10007 + by, lx, ly, edge: Math.min(lx, w * u - lx, ly, h * u - ly) };
    }

    // Ряды: обычная перевязка, колотый камень со случайной длиной, плитка шов в шов
    let rowH = bh, rowY = Math.floor(y / bh) * bh, row = Math.floor(y / bh);
    if (p.random) {
      // Высота рядов случайная: ищем ряд по накопленной высоте
      if (!rowCache.rows) rowCache.rows = [];
      const rows = rowCache.rows;
      let acc = rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].h : 0;
      while (acc <= y) {
        const h = bh * (0.7 + 0.6 * this.hash(rows.length, 3));
        rows.push({ y: acc, h });
        acc += h;
      }
      let lo = 0, hi = rows.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (rows[mid].y <= y) lo = mid; else hi = mid - 1;
      }
      row = lo; rowY = rows[lo].y; rowH = rows[lo].h;
    }
    const ly = y - rowY;

    let bx, blockW, col;
    if (p.random) {
      // Длины камней в ряду случайные
      const key = 'r' + row;
      let edges = rowCache[key];
      if (!edges) {
        edges = [-bw * this.hash(row, 11)];
        rowCache[key] = edges;
      }
      while (edges[edges.length - 1] <= x) {
        edges.push(edges[edges.length - 1] + bw * (0.6 + 0.9 * this.hash(row, edges.length)));
      }
      let lo = 0, hi = edges.length - 2;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (edges[mid] <= x) lo = mid; else hi = mid - 1;
      }
      col = lo; bx = edges[lo]; blockW = edges[lo + 1] - edges[lo];
    } else {
      const offset = p.stack ? 0 : (row & 1) * bw / 2;
      col = Math.floor((x + offset) / bw);
      bx = col * bw - offset;
      blockW = bw;
    }
    const lx = x - bx;
    return { id: row * 10007 + col, lx, ly, edge: Math.min(lx, blockW - lx, ly, rowH - ly) };
  },

  // Яркость фото, размытая до крупных пятен: тени и освещение остаются,
  // а рисунок старой стены (швы, кирпичи) сквозь новый камень не проступает
  blurredLuma(src, W, H) {
    const n = W * H;
    let a = new Float32Array(n), b = new Float32Array(n);
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

  // Средняя яркость фото внутри зоны (по сетке точек) — для сохранения светотени
  averageLuma(luma, W, pts) {
    let sum = 0, n = 0;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs))), maxX = Math.min(W - 1, Math.ceil(Math.max(...xs)));
    const minY = Math.max(0, Math.floor(Math.min(...ys))), maxY = Math.min(luma.length / W - 1, Math.ceil(Math.max(...ys)));
    const step = Math.max(2, Math.floor((maxX - minX) / 60));
    for (let y = minY; y <= maxY; y += step) {
      for (let x = minX; x <= maxX; x += step) {
        sum += luma[y * W + x];
        n++;
      }
    }
    return n ? sum / n : 128;
  },

  // Заливает одну зону узором с текстурой
  renderZone(out, luma, W, H, zone, material, texture) {
    const p = PATTERNS[zone.pattern] || PATTERNS.sawn;
    const pts = zone.points;
    const inv = this.inverseHomography(pts);

    // Размеры зоны «в пикселях стены», чтобы блоки не растягивались вместе с перспективой
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const zoneW = (dist(pts[0], pts[1]) + dist(pts[3], pts[2])) / 2;
    const zoneH = (dist(pts[0], pts[3]) + dist(pts[1], pts[2])) / 2;
    const unit = Math.max(W, H) * (STONE_SIZES[zone.size] || STONE_SIZES.m).k;
    const bw = unit * p.blockW, bh = unit * p.blockH;
    const joint = p.noJoints ? null : (JOINTS[zone.joint] || JOINTS.grey).color;
    const jw = joint ? Math.max(1, unit * 0.07) : 0;
    const bevelW = unit * 0.3;

    const base = material?.color ? [1, 3, 5].map(i => parseInt(material.color.slice(i, i + 2), 16)) : [200, 190, 170];
    const tex = texture;
    const texScale = tex ? tex.width / (unit * 3.2) : 1;
    const avg = this.averageLuma(luma, W, pts);
    const rowCache = {};

    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs))), maxX = Math.min(W - 1, Math.ceil(Math.max(...xs)));
    const minY = Math.max(0, Math.floor(Math.min(...ys))), maxY = Math.min(H - 1, Math.ceil(Math.max(...ys)));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [u, v] = inv(x + 0.5, y + 0.5);
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        const px = u * zoneW, py = v * zoneH;
        const cell = this.patternCell(p, px, py, bw, bh, rowCache);
        let r, g, b;

        if (joint && cell.edge < jw / 2) {
          [r, g, b] = joint;
        } else {
          const rnd = this.hash(cell.id, 17);
          if (tex) {
            // Каждый камень берёт свой участок текстуры, края отражаются — без видимых стыков
            let tx = (cell.lx + rnd * 997) * texScale, ty = (cell.ly + this.hash(cell.id, 29) * 991) * texScale;
            const tw = tex.width, th = tex.height;
            tx = Math.abs(tx) % (2 * tw); if (tx >= tw) tx = 2 * tw - tx - 1;
            ty = Math.abs(ty) % (2 * th); if (ty >= th) ty = 2 * th - ty - 1;
            const ti = ((ty | 0) * tw + (tx | 0)) * 4;
            r = tex.data[ti]; g = tex.data[ti + 1]; b = tex.data[ti + 2];
          } else {
            [r, g, b] = base;
          }
          // Камни немного различаются по тону, у краёв — фаска/скол
          let k = 0.92 + 0.16 * rnd;
          if (p.bevel && cell.edge < bevelW) {
            k *= 1 - p.bevel * 0.35 * (1 - cell.edge / bevelW);
          }
          r *= k; g *= k; b *= k;
        }

        // Светотень исходного фото
        const i = (y * W + x) * 4;
        const light = Math.min(1.35, Math.max(0.45, 0.5 + 0.5 * luma[y * W + x] / (avg || 1)));
        out[i] = Math.min(255, r * light);
        out[i + 1] = Math.min(255, g * light);
        out[i + 2] = Math.min(255, b * light);
      }
    }
  },

  // Проём: возвращаем исходные пиксели фото (окна, двери не облицовываются)
  restoreZone(out, src, W, H, pts) {
    const inv = this.inverseHomography(pts);
    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const minX = Math.max(0, Math.floor(Math.min(...xs))), maxX = Math.min(W - 1, Math.ceil(Math.max(...xs)));
    const minY = Math.max(0, Math.floor(Math.min(...ys))), maxY = Math.min(H - 1, Math.ceil(Math.max(...ys)));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const [u, v] = inv(x + 0.5, y + 0.5);
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        const i = (y * W + x) * 4;
        out[i] = src[i]; out[i + 1] = src[i + 1]; out[i + 2] = src[i + 2];
      }
    }
  },

  // Карниз или пояс: полоса между двумя точками с бликом сверху и тенью снизу
  drawBand(ctx, band, W, H) {
    const t = BAND_TYPES[band.type] || BAND_TYPES.cornice;
    const [r, g, b] = (BAND_COLORS[band.color] || BAND_COLORS.white).color;
    const thick = Math.max(W, H) * t.thickness * (band.scale || 1);
    const [x1, y1] = band.p1, [x2, y2] = band.p2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    // Нормаль направлена «вниз» по изображению
    let nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
    if (ny < 0) { nx = -nx; ny = -ny; }

    const quad = (o1, o2) => {
      ctx.beginPath();
      ctx.moveTo(x1 + nx * o1, y1 + ny * o1);
      ctx.lineTo(x2 + nx * o1, y2 + ny * o1);
      ctx.lineTo(x2 + nx * o2, y2 + ny * o2);
      ctx.lineTo(x1 + nx * o2, y1 + ny * o2);
      ctx.closePath();
    };
    const grad = (o1, o2, stops) => {
      const gr = ctx.createLinearGradient(x1 + nx * o1, y1 + ny * o1, x1 + nx * o2, y1 + ny * o2);
      stops.forEach(([pos, col]) => gr.addColorStop(pos, col));
      return gr;
    };
    const shade = (k, a = 1) => `rgba(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)},${a})`;

    // Падающая тень под карнизом
    const sh = thick * 0.9 * t.shadow;
    quad(thick / 2, thick / 2 + sh);
    ctx.fillStyle = grad(thick / 2, thick / 2 + sh, [[0, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fill();

    // Тело карниза: профиль из светлой полки, выноса и затенённого низа
    quad(-thick / 2, thick / 2);
    ctx.fillStyle = grad(-thick / 2, thick / 2, [
      [0, shade(1.08)], [0.18, shade(1.0)], [0.22, shade(0.82)], [0.3, shade(0.98)],
      [0.62, shade(0.92)], [0.7, shade(0.72)], [1, shade(0.6)],
    ]);
    ctx.fill();
  },

  // Полная отрисовка: фото + зоны + проёмы + карнизы. Возвращает canvas с результатом
  async render(photoCanvas, design, materials) {
    const W = photoCanvas.width, H = photoCanvas.height;
    const pctx = photoCanvas.getContext('2d');
    const srcData = pctx.getImageData(0, 0, W, H);
    const src = srcData.data;
    const outData = new ImageData(new Uint8ClampedArray(src), W, H);
    const luma = this.blurredLuma(src, W, H);

    const fills = design.zones.filter(z => z.type !== 'opening');
    const textures = await Promise.all(fills.map(z => this.loadTexture(materials[z.materialId])));
    // Сначала стены, потом цоколь и откосы — они ложатся поверх
    const order = { wall: 0, base: 1, reveal: 2 };
    fills
      .map((z, i) => [z, textures[i]])
      .sort((a, b) => order[a[0].type] - order[b[0].type])
      .forEach(([z, tex]) => this.renderZone(outData.data, luma, W, H, z, materials[z.materialId], tex));

    design.zones.filter(z => z.type === 'opening').forEach(z => this.restoreZone(outData.data, src, W, H, z.points));

    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const ctx = out.getContext('2d');
    ctx.putImageData(outData, 0, 0);
    design.bands.forEach(b => this.drawBand(ctx, b, W, H));
    return out;
  },
};
