// === Образцы камня: плитка с фаской и толщиной, изделия в выбранном камне ===
// Всё рисуется прямо на телефоне из фото фактуры камня из каталога — без интернета и без ИИ.

const LAYOUTS = {
  running: { name: 'Вперевязку' },
  stack:   { name: 'Шов в шов' },
  random:  { name: 'Вразбежку' },
};

const JOINT_COLORS = {
  light: { name: 'Светлый шов', color: [226, 220, 208] },
  grey:  { name: 'Серый шов',   color: [150, 145, 136] },
  dark:  { name: 'Тёмный шов',  color: [70, 64, 58] },
};

const TEXEL_MM = 1.4; // мм камня в одном пикселе фото фактуры из каталога

const StonePreview = {
  cache: {},

  // Фото фактуры камня в ImageData (свои файлы, поэтому canvas можно сохранить)
  loadData(src) {
    if (!src) return Promise.resolve(null);
    if (!this.cache[src]) {
      this.cache[src] = new Promise((resolve) => {
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
    }
    return this.cache[src];
  },

  hash(x, y) {
    let n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >>> 13)) * 1274126177;
    n = n ^ (n >>> 16);
    return (n >>> 0) / 4294967296;
  },

  // Цвет камня в точке (мм) со сглаживанием; края фото отражаются, поэтому стыков не видно
  sample(tex, xmm, ymm, out) {
    const tw = tex.width, th = tex.height, d = tex.data;
    const wrap = (v, n) => { v = Math.abs(v) % (2 * n); return v >= n ? 2 * n - v - 1 : v; };
    const fx = Math.abs(xmm / TEXEL_MM), fy = Math.abs(ymm / TEXEL_MM);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    const i00 = (wrap(y0, th) * tw + wrap(x0, tw)) * 4, i10 = (wrap(y0, th) * tw + wrap(x0 + 1, tw)) * 4;
    const i01 = (wrap(y0 + 1, th) * tw + wrap(x0, tw)) * 4, i11 = (wrap(y0 + 1, th) * tw + wrap(x0 + 1, tw)) * 4;
    for (let c = 0; c < 3; c++) {
      const top = d[i00 + c] + (d[i10 + c] - d[i00 + c]) * ax;
      const bot = d[i01 + c] + (d[i11 + c] - d[i01 + c]) * ax;
      out[c] = top + (bot - top) * ay;
    }
    return out;
  },

  // Плавный шум для отбитой поверхности и неровного края
  noise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = this.hash(xi + seed, yi), b = this.hash(xi + 1 + seed, yi);
    const c = this.hash(xi + seed, yi + 1), e = this.hash(xi + 1 + seed, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + e) * sx * sy;
  },

  // Камень, в который попала точка (мм), и расстояния до его краёв
  cell(layout, x, y, bw, bh, cache) {
    const row = Math.floor(y / bh);
    const ly = y - row * bh;
    if (layout === 'random') {
      const key = 'r' + row;
      let edges = cache[key];
      if (!edges) edges = cache[key] = [-bw * this.hash(row, 11)];
      while (edges[edges.length - 1] <= x) edges.push(edges[edges.length - 1] + bw * (0.55 + 0.9 * this.hash(row, edges.length)));
      let i = 0;
      while (edges[i + 1] <= x) i++;
      const lx = x - edges[i], w = edges[i + 1] - edges[i];
      return { id: row * 10007 + i, dl: lx, dr: w - lx, dt: ly, db: bh - ly };
    }
    const shift = layout === 'stack' ? 0 : (row & 1) * bw / 2;
    const col = Math.floor((x + shift) / bw);
    const lx = x + shift - col * bw;
    return { id: row * 10007 + col, dl: lx, dr: bw - lx, dt: ly, db: bh - ly };
  },

  // Объём кромки: свет сверху-слева. Профили — как значки фасок в каталоге
  edgeShade(edge, c, bev, split, id, x, y) {
    let { dl, dr, dt, db } = c;
    if (split) {
      // Отбитая кромка: неровный край
      const n = (this.noise(x / 9, y / 9, id) - 0.5) * bev * 1.1;
      dl += n; dr -= n; dt += n; db -= n;
    }
    const m = Math.min(dl, dr, dt, db);
    const lit = m === dt || m === dl ? 1 : -1;
    let k = 1;
    if (m < bev) {
      const t = Math.max(0, m) / bev; // 0 у края, 1 — лицевая плоскость
      if (edge === 'chamfer') k = 1 + lit * 0.24;
      else if (edge === 'convex') k = t < 0.12 ? 0.8 : 1 + lit * 0.32 * (1 - t) * (1 - t);
      else if (edge === 'concave') k = t < 0.12 ? 0.8 : 1 - lit * 0.28 * (1 - t);
      else if (edge === 'rabbet') k = t < 0.5 ? (lit > 0 ? 0.86 : 0.7) : (t < 0.58 ? 1.15 : 1);
      else k = t < 0.12 ? 0.82 : 1;
      if (split) k = k * 0.95 + lit * 0.12 * (1 - t);
    }
    if (split) k *= 0.88 + 0.16 * this.noise(x / 6, y / 6, id) + 0.08 * this.noise(x / 2.5, y / 2.5, id + 7); // шероховатая поверхность
    return k;
  },

  /**
   * Участок облицовки: W×H px, по горизонтали spanMm миллиметров.
   * opts: stone, format '160x360', edge, surface 'sawn'|'split', layout, joint
   */
  async renderWall(canvas, opts) {
    const tex = await this.loadData(opts.stone?.texture);
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, H);
    const d = img.data;
    const [fh, fw] = (opts.format || '160x360').split('x').map(Number);
    const spanMm = opts.spanMm || fw * 3.2;
    const mmPerPx = spanMm / W;
    const joint = (JOINT_COLORS[opts.joint] || JOINT_COLORS.light).color;
    const jw = 4;
    const bev = Math.min(16, fh * 0.16);
    const split = opts.surface === 'split';
    const cache = {};
    const col = [200, 190, 170];
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const x = px * mmPerPx, y = py * mmPerPx;
        const c = this.cell(opts.layout || 'running', x, y, fw, fh, cache);
        const i = (py * W + px) * 4;
        if (Math.min(c.dl, c.dr, c.dt, c.db) < jw / 2) {
          d[i] = joint[0]; d[i + 1] = joint[1]; d[i + 2] = joint[2]; d[i + 3] = 255;
          continue;
        }
        const rnd = this.hash(c.id, 17);
        if (tex) this.sample(tex, c.dl + rnd * 977, c.dt + this.hash(c.id, 29) * 991, col);
        const k = (0.94 + 0.12 * rnd) * this.edgeShade(opts.edge || 'none', c, bev, split, c.id, x, y);
        d[i] = col[0] * k; d[i + 1] = col[1] * k; d[i + 2] = col[2] * k; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  },

  // Одна плитка в объёме: видно лицевую сторону, торец и толщину
  async renderSlab(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const [fh, fw] = (opts.format || '160x360').split('x').map(Number);
    const t = opts.thickness || 20;
    // Масштаб: плитка занимает ~70% ширины
    const s = Math.min(W * 0.62 / fw, H * 0.55 / fh);
    const fwPx = fw * s, fhPx = fh * s, tPx = Math.max(3, t * s * 1.6); // толщину немного утрируем, чтобы разница 10/25 мм была заметна
    const dx = tPx * 0.9, dy = -tPx * 0.55;
    const x0 = (W - fwPx - dx) / 2, y0 = (H - fhPx - dy) / 2 + 4;

    // Лицевая сторона — тот же рисунок, что и в образце облицовки
    const face = document.createElement('canvas');
    face.width = Math.round(fwPx);
    face.height = Math.round(fhPx);
    await this.renderWall(face, { ...opts, layout: 'stack', spanMm: fw * 1.0001 });

    const tex = await this.loadData(opts.stone?.texture);
    const side = (k) => {
      const c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      const cx = c.getContext('2d');
      if (tex) {
        const t2 = document.createElement('canvas');
        t2.width = tex.width; t2.height = tex.height;
        t2.getContext('2d').putImageData(tex, 0, 0);
        cx.drawImage(t2, 0, 0, 64, 64);
      }
      cx.fillStyle = `rgba(0,0,0,${1 - k})`;
      cx.fillRect(0, 0, 64, 64);
      return ctx.createPattern(c, 'repeat');
    };

    // Тень под плиткой
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(x0 + fwPx / 2 + dx / 2, y0 + fhPx + 8, fwPx * 0.55, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Верхний торец
    ctx.fillStyle = side(0.92);
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx, y0 + dy); ctx.lineTo(x0 + fwPx + dx, y0 + dy); ctx.lineTo(x0 + fwPx, y0);
    ctx.closePath(); ctx.fill();
    // Правый торец
    ctx.fillStyle = side(0.68);
    ctx.beginPath();
    ctx.moveTo(x0 + fwPx, y0); ctx.lineTo(x0 + fwPx + dx, y0 + dy); ctx.lineTo(x0 + fwPx + dx, y0 + fhPx + dy); ctx.lineTo(x0 + fwPx, y0 + fhPx);
    ctx.closePath(); ctx.fill();
    // Лицевая сторона
    ctx.drawImage(face, x0, y0, fwPx, fhPx);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, fwPx - 1, fhPx - 1);

    // Размерная линия толщины
    ctx.strokeStyle = '#8a7a5c';
    ctx.fillStyle = '#5c5246';
    ctx.font = '600 13px -apple-system, system-ui, sans-serif';
    ctx.beginPath();
    ctx.moveTo(x0 + fwPx + 6, y0 + fhPx + 10); ctx.lineTo(x0 + fwPx + dx + 6, y0 + fhPx + dy + 10);
    ctx.stroke();
    ctx.fillText(`${t} мм`, x0 + fwPx + dx + 10, y0 + fhPx + dy + 18);
    ctx.fillText(`${fh}×${fw}`, x0, y0 + fhPx + 24);
  },

  // Картинка изделия из каталога, перекрашенная в выбранный камень: объём с фото, цвет и рисунок — камня
  async recolor(variant, stone, maxSide = 260) {
    const [tex, src] = await Promise.all([this.loadData(stone?.texture), this.loadData(variant.image)]);
    const k = Math.min(1, maxSide / Math.max(variant.w, variant.h));
    const W = Math.max(1, Math.round(variant.w * k)), H = Math.max(1, Math.round(variant.h * k));
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    if (!src) return c;
    const ctx = c.getContext('2d');
    const out = ctx.createImageData(W, H);
    const col = [0, 0, 0];
    const mmPerPx = 2.2 / k; // крупность рисунка камня на изделии
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const si = (Math.min(src.height - 1, (y / k) | 0) * src.width + Math.min(src.width - 1, (x / k) | 0)) * 4;
        const o = (y * W + x) * 4;
        const a = src.data[si + 3];
        if (!a) continue;
        const lum = 0.299 * src.data[si] + 0.587 * src.data[si + 1] + 0.114 * src.data[si + 2];
        const shade = Math.min(1.45, lum / variant.lumRef);
        if (tex) this.sample(tex, x * mmPerPx + 300, y * mmPerPx + 300, col);
        else { col[0] = src.data[si]; col[1] = src.data[si + 1]; col[2] = src.data[si + 2]; }
        out.data[o] = col[0] * shade; out.data[o + 1] = col[1] * shade; out.data[o + 2] = col[2] * shade; out.data[o + 3] = a;
      }
    }
    ctx.putImageData(out, 0, 0);
    return c;
  },

  // Подставляет перекрашенные картинки во все <img data-recolor="variantId"> внутри контейнера
  async recolorAll(container, stone, variants) {
    const imgs = [...container.querySelectorAll('img[data-recolor]')];
    for (const img of imgs) {
      const v = variants[img.dataset.recolor];
      if (!v) continue;
      const token = (img.dataset.token = String(Math.random()));
      const c = await this.recolor(v, stone);
      if (img.dataset.token === token && img.isConnected) img.src = c.toDataURL('image/webp', 0.9);
    }
  },
};

// Значок профиля фаски — как в каталоге «Камень Юг»
function edgeIcon(id) {
  const paths = {
    none: 'M4 4h16v16H4z',
    chamfer: 'M4 4h10l6 6v10H4z',
    convex: 'M4 4h9a5 5 0 015 5v1h2v10H4z',
    concave: 'M4 4h9a5 5 0 005 5h2v11H4z',
    rabbet: 'M4 4h9v6h7v10H4z',
  };
  return `<svg class="edge-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[id] || paths.none}"/></svg>`;
}
