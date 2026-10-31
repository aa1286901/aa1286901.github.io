// === КП: дом сверху и стены ===
// Главный экран КП — дом сверху и его размеры. Нажатие на стену открывает её карточку:
// вид стены спереди (как на чертеже: камень с настоящей фактурой и швами, цоколь, карнизы, русты, окна
// с наличниками) и две вкладки — «Окна и элементы» (окна, двери, эркер, фронтон) и «Облицовка»
// (камень, цоколь и изделия именно этой стены). Всё, что меняют, сразу видно на рисунке и в смете.

const KP_WALLS = { front: 'Фасад', right: 'Правая', back: 'Задняя', left: 'Левая' };
const KP_WALL_ORDER = ['front', 'right', 'back', 'left'];
const KP_NEIGHBORS = { front: ['left', 'right'], back: ['left', 'right'], left: ['front', 'back'], right: ['front', 'back'] };
const KP_OP_TYPES = {
  win: { name: 'Окно', kind: 'win', w: 1.2, h: 1.5 },
  big: { name: 'Большое окно', kind: 'win', w: 2.0, h: 1.8 },
  arch: { name: 'Арочное окно', kind: 'win', w: 1.2, h: 2.0, arch: true },
  door: { name: 'Дверь', kind: 'door', w: 1.0, h: 2.2 },
  gate: { name: 'Ворота / гараж', kind: 'door', w: 2.6, h: 2.3 },
};
const KP_ERKERS = [['rect', 'Прямой'], ['tri', 'Скошенный'], ['round', 'Полукруглый']];
// Изделия облицовки стены — ключи узоров подбора (PATTERN_ROWS)
const KP_FINISH = [['topCornice', 'Венчающий карниз'], ['dentils', 'Зубцы под карнизом'], ['floorCornice', 'Межэтажный пояс'],
  ['baseCornice', 'Плинтус над цоколем'], ['corners', 'Русты на углах'], ['frame', 'Наличники'], ['windowCornice', 'Сандрики'],
  ['sill', 'Подоконники'], ['keystone', 'Замки'], ['console', 'Консоли']];
// Позиции сметы, которые считаются по стенам (у каждой стены может быть свой камень и свои изделия)
const KP_BY_WALL = ['wall', 'gable', 'erker', 'base', 'reveals', 'corners', 'topCornice', 'gableCornice', 'floorCornice',
  'baseCornice', 'dentils', 'frame', 'windowCornice', 'sill', 'keystone', 'console'];
const KP_STONE_ROWS = { wall: 'main', gable: 'main', erker: 'main', reveals: 'main', base: 'base' };

const kpWallLen = (md, k) => (k === 'front' || k === 'back' ? +md.house.len || 0 : +md.house.wid || 0);
// Площадь проёма — до сотых: 1,5 × 1,5 = 2,25
const kpArea = (n) => (Math.round((+n || 0) * 100) / 100).toLocaleString('ru-RU');
const kpMm = (size, i = 0) => (parseFloat(String(size || '').split(/[×x]/)[i]) || 0) / 1000;

function kpNewWall(ops = []) {
  return { on: true, plinth: null, ops, erker: null, gable: null, finish: { main: null, base: null, parts: {}, reveals: true } };
}

// Новый дом: по 2 окна на этаж с фасада и сзади, по одному сбоку, входная дверь на фасаде
function kpDefaultWalls(floors) {
  const wins = (n) => Array.from({ length: floors }, (_, i) => ({ ...KP_OP_TYPES.win, n, where: String(i + 1) }));
  return { front: kpNewWall([...wins(2), { ...KP_OP_TYPES.door, n: 1, where: '1' }]), right: kpNewWall(wins(1)), back: kpNewWall(wins(2)), left: kpNewWall(wins(1)) };
}

// Узор по умолчанию для части, которую на стене включили, а в подборе её нет
function kpDefaultItem(key, catalog) {
  const r = PATTERN_ROWS.find(x => x.key === key);
  if (!r) return null;
  for (const sid of r.sections) {
    const items = (catalog.sections.find(s => s.id === sid)?.items || []).filter(i => !r.match || r.match.test(i.name));
    const it = (r.def && items.find(i => r.def.test(i.name))) || items[0];
    if (it) return it.variants[0].id;
  }
  return null;
}

// Чем облицованы стены — как в подборе: камень, цоколь, изделия. Своё у стены задаётся уже в смете
function kpFinish(md, spec) {
  const m = spec.materials;
  const main = m.main.stone, base = m.base.on ? m.base.stone : main;
  const parts = {};
  KP_FINISH.forEach(([key]) => {
    const item = spec.parts?.[key]?.item || null;
    if (!item) { parts[key] = null; return; }
    const ps = spec.parts[key].stone ?? 'main';
    parts[key] = { item, stone: ps === 'main' ? main : ps === 'base' ? base : ps };
  });
  return { main, base, parts, reveals: true, tile: m.main, baseTile: m.base };
}

// Одна стена. Высота этажа — от верха цоколя до межэтажного пояса, цоколь — отдельно снизу:
//   основная плитка = длина × этажи × высота этажа − окна − двери (выше цоколя) + боковины эркера;
//   цоколь = длина × высота цоколя − двери (в зоне цоколя) + боковины эркера в цоколе.
// where у проёма — этаж ('1', '2'…), 'erker' или 'gable'
function kpWallCalc(md, k, baseOn, fin) {
  const h = md.house, wl = md.walls[k], F = Math.max(1, +h.floors || 1), fh = +h.floorH || 0, Hm = F * fh;
  const L = kpWallLen(md, k), hb = baseOn ? +h.plinth || 0 : 0;
  const r = { k, L, Hm, hb, H: Hm + hb, on: !!wl.on, fin, wall: 0, gable: 0, erker: 0, plinth: 0,
    mainGross: L * Hm, plinthGross: L * hb, win: 0, doorMain: 0, doorPlinth: 0, doorW: 0, erkerWin: 0,
    erkerMain: 0, erkerPlinth: 0, erkerExtra: 0, erkerCorners: 0, gableGross: 0, gableWin: 0,
    corners: 0, slope: 0, openings: 0, q: {} };
  if (!wl.on) return r;
  const P = fin.parts, add = (id, v) => { if (v > 0) r.q[id] = (r.q[id] || 0) + v; };
  wl.ops.forEach(o => {
    const n = +o.n || 0, w = +o.w || 0, oh = +o.h || 0;
    if (!n) return;
    r.openings += n;
    const a = w * oh * n;
    if (o.where === 'gable') r.gableWin += a;
    else if (o.where === 'erker') r.erkerWin += a;
    else if (o.kind === 'door' && String(o.where) === '1') {
      // Дверь первого этажа — от земли: нижняя часть в цоколе, остальное — в основной плитке
      const low = Math.min(hb, oh);
      r.doorPlinth += w * low * n; r.doorMain += w * (oh - low) * n; r.doorW += w * n;
    } else r.win += a;
    // Арка: верх по полуокружности вместо прямой
    const top = o.arch ? Math.PI * w / 2 : w, side = o.arch ? Math.max(0, oh - w / 2) : oh;
    if (P.frame) add('frame', (2 * side + top + 0.3) * n);
    if (P.windowCornice) add('windowCornice', (w + 0.4) * n);
    if (P.sill && o.kind === 'win') add('sill', (w + 0.2) * n);
    if (P.keystone) add('keystone', n);
    if (P.console && o.kind === 'win') add('console', 2 * n);
    if (fin.reveals) add('reveals', (2 * side + top) * n);
  });
  // Эркер: лицевая грань уже в длине стены, добавляются боковины (у скошенного и полукруглого — по развёртке)
  const e = wl.erker;
  if (e) {
    const w = Math.min(+e.w || 0, L), dd = +e.d || 0, eh = Math.min(+e.floors || 1, F) * fh;
    r.erkerExtra = e.shape === 'rect' ? 2 * dd : e.shape === 'tri' ? 2 * Math.hypot(dd, w / 4) - w / 2 : Math.PI * w / 2 - w;
    r.erkerMain = r.erkerExtra * eh;
    r.erkerPlinth = r.erkerExtra * hb;
    r.erkerCorners = e.shape === 'round' ? 0 : 2;
  }
  if (wl.gable) {
    r.gableGross = L * (+wl.gable.h || 0) / 2;
    r.gable = Math.max(0, r.gableGross - r.gableWin);
    r.slope = wl.gable.cornice ? 2 * Math.hypot(L / 2, +wl.gable.h || 0) : 0;
  }
  r.wall = Math.max(0, r.mainGross + r.erkerMain - r.win - r.doorMain - r.erkerWin);
  r.plinth = Math.max(0, r.plinthGross + r.erkerPlinth - r.doorPlinth);
  // Русты: угол дома делят две стены — по половине; углы эркера — целиком. Высота — от цоколя до карниза
  const ends = KP_NEIGHBORS[k].filter(n => md.walls[n].on).length * 0.5;
  r.corners = P.corners ? ends + r.erkerCorners : 0;
  Object.assign(r.q, { wall: r.wall, gable: r.gable, base: r.plinth });
  if (P.corners) add('corners', r.corners * Hm);
  if (P.topCornice) add('topCornice', L + r.erkerExtra);
  if (P.dentils) add('dentils', L + r.erkerExtra);
  if (P.floorCornice) add('floorCornice', (L + r.erkerExtra) * (F - 1));
  if (P.baseCornice && hb) add('baseCornice', Math.max(0, L + r.erkerExtra - r.doorW));
  add('gableCornice', r.slope);
  return r;
}

// Весь дом: сумма по стенам. Позиции по стенам смета берёт из perWall, общие — из q
function kpGeometry(md, baseOn, finOf) {
  const F = Math.max(1, +md.house.floors || 1), Hm = F * (+md.house.floorH || 0);
  const H = Hm + (baseOn ? +md.house.plinth || 0 : 0);
  const perWall = KP_WALL_ORDER.map(k => kpWallCalc(md, k, baseOn, finOf(k)));
  const on = perWall.filter(w => w.on);
  const sum = f => on.reduce((a, w) => a + w[f], 0);
  const wallA = sum('wall'), gable = sum('gable'), erkerArea = sum('erker'), plinth = sum('plinth');
  const area = wallA + gable + erkerArea + plinth;
  const kw = 1 + (+md.stock.wall || 0) / 100, kh = 1 + (+md.stock.hard || 0) / 100;
  const decor = on.reduce((a, w) => a + (w.q.frame || 0) + (w.q.windowCornice || 0) + (w.q.sill || 0), 0);
  const days = Math.max(1, Math.ceil(area / 7 + decor / 12));
  const order = wallA * kw + (gable + erkerArea) * kh + plinth;
  const q = {
    column: 2, capital: 2, balustrade: 6,
    mesh: area, glue: area, scaffold: F > 1 ? wallA + gable + erkerArea : 0,
    delivery: Math.max(1, order / 120), unload: 1, food: +md.days || days, trash: 1,
  };
  const how = {
    mesh: `вся площадь камня ${kpNum(area)} м²`, glue: `вся площадь камня ${kpNum(area)} м²`,
    scaffold: 'основная плитка и фронтоны от 2 этажей', delivery: `${kpNum(order)} м² с запасом ÷ 120 м² за рейс`,
    food: `срок ${+md.days || days} дн`,
  };
  return { H, Hm, F, P: sum('L'), walls: wallA, plinth, gable, erkerArea, area, openings: sum('openings'),
    corners: Math.round(sum('corners')), days, q, how, perWall, kw, kh };
}

// Прежние КП → стены с облицовкой. Цепочка: периметр → дом → общие окна → стены с отметками → облицовка стен
function kpUpgradeModel(md, spec, catalog) {
  if (!md.house) {
    const d = md.dims || {}, floors = Math.max(1, +d.floors || 2);
    const P = +d.perimeter || 44, len = Math.round(P * 0.3), wid = Math.max(1, Math.round(P / 2 - len));
    md.house = { len, wid, floors, floorH: +(((+d.height || floors * 3.2) / floors).toFixed(1)), plinth: d.plinth ?? 0.6,
      sides: { front: true, right: true, back: true, left: true } };
    md.ops = [{ ...KP_OP_TYPES.win, n: +d.windows || floors * 4 }];
    if (+d.doors !== 0) md.ops.push({ ...KP_OP_TYPES.door, n: d.doors ?? 1 });
    delete md.dims;
  }
  if (!md.walls) {
    const h = md.house, sides = h.sides || { front: true, right: true, back: true, left: true };
    const first = (md.ops || [])[0] || {};
    md.walls = {};
    KP_WALL_ORDER.forEach(k => { md.walls[k] = { ...kpNewWall(), on: !!sides[k], decor: { ...first } }; });
    // Окна — по облицованным стенам пропорционально длине, двери и эркер — на фасад, фронтоны — на боковые
    const onWalls = KP_WALL_ORDER.filter(k => sides[k]);
    const total = onWalls.reduce((a, k) => a + kpWallLen(md, k), 0) || 1;
    (md.ops || []).forEach(o => {
      const t = { kind: o.kind, name: o.name, w: o.w, h: o.h, arch: !!o.arch };
      if (o.kind === 'door') { md.walls.front.ops.push({ ...t, n: +o.n || 0, where: '1' }); return; }
      let left = +o.n || 0;
      onWalls.forEach((k, i) => {
        const n = i === onWalls.length - 1 ? left : Math.round((+o.n || 0) * kpWallLen(md, k) / total);
        left -= n;
        if (n > 0) md.walls[k].ops.push({ ...t, n, where: '1' });
      });
    });
    (md.erkers || []).slice(0, 1).forEach(e => { md.walls.front.erker = { ...e }; });
    ['right', 'left'].slice(0, +md.gables?.n || 0).forEach(k => { md.walls[k].gable = { h: +md.gables.h || 2.5, cornice: md.gables.cornice !== false }; });
    delete md.ops; delete md.erkers; delete md.gables; delete h.sides;
  }
  // Отметки «что ставим на окна» → изделия облицовки стены
  KP_WALL_ORDER.forEach(k => {
    const wl = md.walls[k];
    if (wl.finish) return;
    const d = wl.decor || {};
    wl.finish = { main: null, base: null, parts: {}, reveals: d.reveals !== false };
    ['frame', 'windowCornice', 'sill', 'keystone', 'console'].forEach(key => {
      if (!(key in d)) return;
      if (!d[key]) wl.finish.parts[key] = null;
      else if (!spec.parts?.[key]?.item) wl.finish.parts[key] = kpDefaultItem(key, catalog);
    });
    delete wl.decor;
  });
  delete md.house.cornersAdj;
  return md;
}

Object.assign(KP, {
  geo() {
    return kpGeometry(this.model, this.spec.materials.base.on, k => kpFinish(this.model, this.spec, k));
  },

  stone(id) {
    return this.stones.find(s => s.id === id) || this.stones[0];
  },

  // Материал строки сметы на стене: ключ (по нему строки делятся), подпись, картинка
  rowMat(defId, fin) {
    const stoneName = id => this.stone(id)?.name || '';
    const sk = KP_STONE_ROWS[defId];
    if (sk) {
      const id = fin[sk], s = this.stone(id), t = sk === 'base' ? fin.baseTile : fin.tile;
      const sub = defId === 'wall' || defId === 'base' ? `${s.name} · ${t.format.replace('x', '×')}×${t.thickness} · ${SURFACE_NAMES[t.surface] || ''}`
        : `${s.name}${defId === 'reveals' ? ' · пиленый' : ''}`;
      return { key: id, sub, img: s.texture, kind: 'stone' };
    }
    const p = fin.parts[defId === 'gableCornice' ? 'topCornice' : defId];
    if (!p) return { key: fin.main, sub: stoneName(fin.main), img: this.stone(fin.main)?.texture, kind: 'stone' };
    const v = this.catalog.variants[p.item];
    return { key: `${p.item}|${p.stone}`, sub: `${v?.name || ''}${v?.size ? ` · ${v.size}` : ''} · ${stoneName(p.stone)}`, img: v?.image, kind: 'product' };
  },

  // Строки сметы: позиции по стенам (разный камень или изделие на стенах — разные строки) + общие
  rows() {
    const spec = this.spec, g = this.geo(), prices = this.mine.prices || {};
    const fin0 = kpFinish(this.model, spec, null);
    const stoneName = id => this.stone(id)?.name || '';
    const out = [];
    for (const def of KP_ITEMS) {
      if (KP_BY_WALL.includes(def.id)) {
        const groups = new Map();
        g.perWall.filter(r => r.on && r.q[def.id] > 0).forEach(r => {
          const mat = this.rowMat(def.id, r.fin);
          const gr = groups.get(mat.key) || { mat, qty: 0, how: [] };
          gr.qty += r.q[def.id];
          gr.how.push(`${KP_WALLS[r.k]} ${kpNum(r.q[def.id])}`);
          groups.set(mat.key, gr);
        });
        const key0 = this.rowMat(def.id, fin0).key;
        const k = def.id === 'wall' ? g.kw : def.id === 'gable' || def.id === 'erker' ? g.kh : 1;
        const pct = def.id === 'wall' ? this.model.stock.wall : k > 1 ? this.model.stock.hard : 0;
        // Строка с камнем и изделиями подбора — первой, свои варианты стен — следом
        for (const [key, gr] of [...groups].sort((a, b) => (a[0] === key0 ? -1 : b[0] === key0 ? 1 : 0))) {
          const id = key === key0 ? def.id : `${def.id}~${key}`;
          const how = `${gr.how.join(' + ')} = ${kpNum(gr.qty)}${+pct ? ` + запас ${pct}%` : ''}`;
          out.push(this.row({ ...def, id, base: def.id }, gr.mat.sub, gr.mat.img, gr.mat.kind, gr.qty * k, how, prices));
        }
        continue;
      }
      // Колонны, капители, балюстрада — из подбора, на дом целиком
      const keys = def.parts || [def.part];
      const key = keys.find(x => spec.parts[x]?.item);
      if (!key) continue;
      const v = this.catalog.variants[spec.parts[key].item];
      out.push(this.row(def, `${v?.name || ''}${v?.size ? ` · ${v.size}` : ''} · ${stoneName(resolveStone(spec, spec.parts[key].stone))}`,
        v?.image, 'product', g.q[def.id] || 0, '', prices));
    }
    return { items: this.order('items', [...out.filter(r => !r.deleted), ...this.customs('custom')]), ms: g };
  },

  row(def, sub, img, imgKind, qty, how, prices) {
    const o = this.model.rows[def.id] || {};
    const p = prices[def.id] || prices[def.base] || {};
    const auto = Math.ceil((qty || 0) - 1e-9);
    return this.edited({
      ...def, deleted: !!o.deleted, sub: def.sub || sub, img, imgKind, how,
      qty: o.manual ? +o.qty || 0 : auto, auto, manual: !!o.manual,
      m: +(o.m ?? p.m ?? def.m) || 0, w: +(o.w ?? p.w ?? def.w) || 0,
      on: o.on ?? !(def.id === 'scaffold' && this.model.house.floors < 2),
    }, o);
  },

  extras(ms) {
    const prices = this.mine.prices || {};
    return this.order('extras', [...KP_EXTRAS.map(def => this.row(def, def.sub, null, null, ms.q[def.id], ms.how[def.id] || '', prices)).filter(r => !r.deleted),
      ...this.customs('customExtras')]);
  },

  // === Главный экран: дом сверху и размеры; смета — отдельной страницей по кнопке внизу ===
  render(keepScroll) {
    const y = window.scrollY;
    document.getElementById('kp-content').innerHTML = this.step === 1 ? this.houseHtml() : `
      <button class="kp-backlink" data-kp-step="1">‹ Дом и стены</button>
      ${this.stepSmeta()}`;
    if (this.step === 2) {
      this.renderRows();
      document.querySelectorAll('#kp-content .kp-area').forEach(kpGrow);
    } else this.live();
    document.getElementById('kp-make').textContent = this.step === 1 ? 'Смета и PDF' : 'Создать PDF';
    window.scrollTo(0, keepScroll ? y : 0);
  },

  houseHtml() {
    const g = this.geo();
    return `
      <div class="kp-intro">
        <img src="${this.variant?.generated_image || this.project.original_image}" alt="">
        <div><b>${esc(this.project.name)}</b><small>Нажмите на стену — окна, двери, эркер, фронтон</small></div>
      </div>
      <section class="kp-card kph-plan-card">
        <div class="kph-plan" id="kpw-plan">${this.planSvg(g)}</div>
        <div class="kpw-walls" id="kpw-wall-list">${this.wallListHtml(g)}</div>
      </section>
      <section class="kp-card"><h3>Размеры дома</h3>
        ${this.num('house.len', 'Длина', 'фасад и задняя стена')}
        ${this.num('house.wid', 'Ширина', 'боковые стены')}
        ${this.stepper('house.floors', 'Этажей')}
        ${this.num('house.floorH', 'Высота этажа', 'от цоколя до межэтажного пояса')}
        ${this.spec.materials.base.on ? this.num('house.plinth', 'Высота цоколя', 'от земли') : ''}
        <p class="kph-height" id="kph-height">${this.heightNote(g)}</p>
      </section>`;
  },

  heightNote(g) {
    const hb = g.H - g.Hm;
    return `Высота стен ${kpNum(g.H)} м = ${g.F} × ${kpNum(this.model.house.floorH)} м${hb ? ` + цоколь ${kpNum(hb)} м` : ''}`;
  },

  wallNote(r) {
    const wl = this.model.walls[r.k];
    if (!wl.on) return 'не облицовываем';
    const parts = [r.openings ? `${r.openings} ${plural(r.openings, 'проём', 'проёма', 'проёмов')}` : 'без окон'];
    if (wl.erker) parts.push('эркер');
    if (wl.gable) parts.push('фронтон');
    parts.push(`${kpNum(r.wall + r.gable + r.plinth)} м²`);
    return parts.join(' · ');
  },

  wallListHtml(g) {
    return g.perWall.map(r => `
      <button class="kpw-wallbtn${r.on ? '' : ' off'}" data-open-wall="${r.k}">
        <span class="kpw-wallbtn__sw" style="background-image:url('${this.stone(r.fin.main).texture}')"></span>
        <span class="kpw-wallbtn__name"><b>${KP_WALLS[r.k]}</b><small>${kpNum(r.L)} м</small></span>
        <span class="kpw-wallbtn__note">${this.wallNote(r)}</span><i aria-hidden="true">›</i>
      </button>`).join('');
  },

  // План сверху как на чертеже: стены толщиной и цветом своего камня, размерные линии, эркеры, углы с рустами
  planSvg(g) {
    const md = this.model, h = md.house, W = 320, Hh = 250;
    const sc = Math.min(200 / Math.max(1, +h.len || 1), 140 / Math.max(1, +h.wid || 1));
    const w = (+h.len || 1) * sc, d = (+h.wid || 1) * sc, x0 = (W - w) / 2, y0 = 46 + (140 - d) / 2, t = 9;
    const on = k => !!md.walls[k].on;
    const fin = Object.fromEntries(g.perWall.map(r => [r.k, r.fin]));
    const col = k => this.stone(fin[k].main).color || '#d8cbb3';
    const seg = { back: [x0, y0, x0 + w, y0], right: [x0 + w, y0, x0 + w, y0 + d], front: [x0 + w, y0 + d, x0, y0 + d], left: [x0, y0 + d, x0, y0] };
    const out = { back: [0, -1], right: [1, 0], front: [0, 1], left: [-1, 0] };
    let erk = '';
    const ed = {};
    KP_WALL_ORDER.forEach(k => {
      const e = md.walls[k].erker;
      ed[k] = 0;
      if (!e || !on(k)) return;
      const [a, b, c, dd] = seg[k], cx = (a + c) / 2, cy = (b + dd) / 2, [ox, oy] = out[k];
      const ew = Math.min(+e.w || 0, kpWallLen(md, k)) * sc / 2, dep = Math.max(5, (+e.d || 0) * sc);
      ed[k] = dep;
      const al = ox === 0 ? [1, 0] : [0, 1];
      const p = (u, v) => `${cx + al[0] * u + ox * v},${cy + al[1] * u + oy * v}`;
      const path = e.shape === 'rect' ? `M${p(-ew, 0)}L${p(-ew, dep)}L${p(ew, dep)}L${p(ew, 0)}`
        : e.shape === 'tri' ? `M${p(-ew, 0)}L${p(-ew / 2, dep)}L${p(ew / 2, dep)}L${p(ew, 0)}`
          : `M${p(-ew, 0)}C${p(-ew, dep * 1.33)} ${p(ew, dep * 1.33)} ${p(ew, 0)}`;
      erk += `<path d="${path}" class="kph-erker" style="stroke:${col(k)}" data-open-wall="${k}"/>`;
    });
    const corner = (x, y) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" class="kph-rust"/>`;
    const corners = [['front', 'right', x0 + w, y0 + d], ['right', 'back', x0 + w, y0], ['back', 'left', x0, y0], ['left', 'front', x0, y0 + d]]
      .filter(([a, b]) => on(a) && on(b) && (fin[a].parts.corners || fin[b].parts.corners)).map(([, , x, y]) => corner(x, y)).join('');
    // Размерные линии: длина — сверху, ширина — слева
    const dimY = y0 - 22 - ed.back, dimX = x0 - 24 - ed.left;
    const tick = (x, y) => `<path d="M${x - 4},${y + 4}L${x + 4},${y - 4}" class="kph-dim"/>`;
    const labels = { back: [W / 2, y0 + 18], front: [W / 2, y0 + d - 10], left: [x0 + 16, y0 + d / 2], right: [x0 + w - 16, y0 + d / 2] };
    return `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Дом сверху: нажмите на стену">
      <defs><pattern id="kph-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="kph-hatch"/></pattern></defs>
      <rect x="${x0}" y="${y0}" width="${w}" height="${d}" fill="url(#kph-hatch)" class="kph-floor"/>
      ${KP_WALL_ORDER.map(k => { const c = seg[k]; return `<line x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" class="kph-wall${on(k) ? '' : ' off'}" style="${on(k) ? `stroke:${col(k)}` : ''};stroke-width:${t}"/>
        <line data-open-wall="${k}" x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" class="kph-hit"/>`; }).join('')}
      ${erk}${corners}
      <line x1="${x0}" x2="${x0 + w}" y1="${dimY}" y2="${dimY}" class="kph-dim"/>${tick(x0, dimY)}${tick(x0 + w, dimY)}
      <text x="${W / 2}" y="${dimY - 6}" text-anchor="middle" class="kph-dimtxt">${kpNum(h.len)} м</text>
      <line x1="${dimX}" x2="${dimX}" y1="${y0}" y2="${y0 + d}" class="kph-dim"/>${tick(dimX, y0)}${tick(dimX, y0 + d)}
      <text x="${dimX - 6}" y="${y0 + d / 2}" text-anchor="middle" class="kph-dimtxt" transform="rotate(-90 ${dimX - 6} ${y0 + d / 2})">${kpNum(h.wid)} м</text>
      ${KP_WALL_ORDER.map(k => { const [x, y] = labels[k]; const rot = k === 'left' ? -90 : k === 'right' ? 90 : 0;
        return `<text x="${x}" y="${y}" text-anchor="middle" data-open-wall="${k}" class="kph-label${on(k) ? '' : ' off'}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${KP_WALLS[k]}</text>`; }).join('')}
      <text x="${W / 2}" y="${y0 + d + 26 + ed.front}" text-anchor="middle" class="kph-front">▲ вход · фасад</text>
    </svg>`;
  },

  // === Карточка стены ===
  openWall(k) {
    this.wallK = k;
    showModal(`<div class="kpw-wall" id="kpw-wall">${this.wallHtml(k)}</div>`);
    const box = document.getElementById('kpw-wall');
    box.closest('.modal-sheet').classList.add('kpw-sheet');
    box.addEventListener('input', e => this.onWallInput(e));
    box.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') this.onWallInput(e, true); });
    box.addEventListener('click', e => this.onWallClick(e));
  },

  wallHtml(k) {
    const md = this.model, wl = md.walls[k];
    const r = kpWallCalc(md, k, this.spec.materials.base.on, kpFinish(md, this.spec));
    this.wallOpen = this.wallOpen || { ops: true, erker: false, gable: false };
    return `
      <div class="kpw-wall__top">
        <div class="kpw-wall__head">
          <div><h3>${KP_WALLS[k]}</h3><small>${kpNum(r.L)} × ${kpNum(r.H)} м</small></div>
          <label class="kpw-wall__on"><span>Облицовываем</span><span class="switch"><input type="checkbox" data-wk="on" ${wl.on ? 'checked' : ''}><span></span></span></label>
        </div>
        <div class="kpw-elev" id="kpw-elev">${this.elevSvg(k)}</div>
        ${wl.on ? `<div class="kph-tiles" id="kph-tiles">${this.tilesHtml(r)}</div>` : ''}
      </div>
      ${wl.on ? `
        ${this.secHtml('ops', 'Окна и двери', this.opsNote(r), this.secOps(k, r))}
        ${this.secHtml('erker', 'Эркер', wl.erker ? `+${kpNum(r.erkerMain + r.erkerPlinth)} м² боковин` : 'нет', this.secErker(k, r))}
        ${this.secHtml('gable', 'Фронтон', wl.gable ? `${kpNum(r.gable)} м²` : 'нет', this.secGable(k, r))}
        <div class="kpw-wall__sec"><h4>Скопировать эту стену</h4>
          <div class="kpw-chips">${KP_WALL_ORDER.filter(x => x !== k).map(x => `<button class="kpw-chip" data-wa="copy:${x}">→ ${KP_WALLS[x]}</button>`).join('')}</div>
          <p class="configure-hint">Окна, двери, эркер и фронтон станут такими же.</p>
        </div>`
      : '<p class="configure-hint">Эта стена не попадёт в смету. Включите «Облицовываем», чтобы добавить окна.</p>'}
      <button class="btn btn-primary btn-full kpw-wall__done" data-wa="done">Готово</button>`;
  },

  // Остаток плитки по стене: основная и цоколь — всегда на виду, под рисунком
  tilesHtml(r) {
    const base = r.hb ? `<div><small>Цоколь</small><b>${kpNum(r.plinth)} м²</b></div>` : '';
    const gable = r.gableGross ? `<div><small>Фронтон</small><b>${kpNum(r.gable)} м²</b></div>` : '';
    return `<div><small>Основная</small><b>${kpNum(r.wall)} м²</b></div>${base}${gable}`;
  },

  opsNote(r) {
    const n = r.openings;
    return n ? `${n} ${plural(n, 'проём', 'проёма', 'проёмов')} · ${kpNum(r.win + r.doorMain + r.doorPlinth + r.erkerWin + r.gableWin)} м²` : 'нет';
  },

  // Выдвижной блок карточки стены
  secHtml(id, title, note, body) {
    const open = this.wallOpen[id];
    return `<div class="kph-sec${open ? ' open' : ''}">
      <button class="kph-sec__head" data-wa="sec:${id}" aria-expanded="${open}"><b>${title}</b><span data-sec-note="${id}">${note}</span><i aria-hidden="true">›</i></button>
      ${open ? `<div class="kph-sec__body">${body}</div>` : ''}
    </div>`;
  },

  opRow(o, i, where) {
    const a = (+o.w || 0) * (+o.h || 0), n = +o.n || 0;
    const numIn = (path, val, label, step = 0.1) => `<label>${label}<input class="input kpw-num" type="number" inputmode="decimal" step="${step}" min="0" data-wk="${path}" value="${val ?? ''}"></label>`;
    return `
      <div class="kpw-oprow">
        <div class="kpw-oprow__head"><b>${esc(o.name || 'Окно')}</b>
          <select class="input kpw-where" data-wk="ops.${i}.where" aria-label="Где">${where.map(([v, t]) => `<option value="${v}"${String(o.where) === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
          <button class="kpw-x" data-wa="del-op:${i}" aria-label="Удалить">×</button></div>
        <div class="kpw-dims">${numIn(`ops.${i}.w`, o.w, 'Ширина, м')}${numIn(`ops.${i}.h`, o.h, 'Высота, м')}${numIn(`ops.${i}.n`, o.n, 'Штук', 1)}</div>
        <p class="kph-area" data-op-area="${i}">${kpArea(o.w)} × ${kpArea(o.h)} = ${kpArea(a)} м²${n > 1 ? ` × ${n} = <b>${kpArea(a * n)} м²</b>` : ''}</p>
      </div>`;
  },

  wherePlaces(k) {
    const md = this.model, wl = md.walls[k], F = Math.max(1, +md.house.floors || 1);
    return [...Array.from({ length: F }, (_, i) => [String(i + 1), `${i + 1} этаж`]),
      ...(wl.erker ? [['erker', 'Эркер']] : []), ...(wl.gable ? [['gable', 'Фронтон']] : [])];
  },

  // Окна и двери стены (кроме окон фронтона — они в своём блоке) и расчёт: сколько плитки остаётся
  secOps(k, r) {
    const wl = this.model.walls[k], where = this.wherePlaces(k);
    const rows = wl.ops.map((o, i) => (o.where === 'gable' ? '' : this.opRow(o, i, where))).join('');
    return `
      ${rows || '<p class="configure-hint">Окон нет — добавьте ниже</p>'}
      <div class="kpw-chips">${Object.entries(KP_OP_TYPES).map(([t, o]) => `<button class="kpw-chip kpw-chip--add" data-wa="add-op:${t}">＋ ${o.name}</button>`).join('')}</div>
      <div class="kph-calc" id="kph-calc-ops">${this.calcOps(r)}</div>`;
  },

  calcOps(r) {
    const n1 = kpNum, lines = [];
    let main = `${n1(r.L)} × ${n1(r.Hm)} = ${n1(r.mainGross)} м²`;
    if (r.win) main += ` − окна ${n1(r.win)}`;
    if (r.doorMain) main += ` − двери ${n1(r.doorMain)}`;
    if (r.erkerMain) main += ` + эркер ${n1(r.erkerMain)}`;
    if (r.erkerWin) main += ` − окна эркера ${n1(r.erkerWin)}`;
    lines.push(`<div><span>Основная плитка</span><small>${main}</small><b>${n1(r.wall)} м²</b></div>`);
    if (r.hb) {
      let base = `${n1(r.L)} × ${n1(r.hb)} = ${n1(r.plinthGross)} м²`;
      if (r.doorPlinth) base += ` − двери ${n1(r.doorPlinth)}`;
      if (r.erkerPlinth) base += ` + эркер ${n1(r.erkerPlinth)}`;
      lines.push(`<div><span>Цоколь</span><small>${base}</small><b>${n1(r.plinth)} м²</b></div>`);
    }
    return lines.join('');
  },

  secErker(k, r) {
    const wl = this.model.walls[k];
    if (!wl.erker) return '<button class="kpw-chip kpw-chip--add" data-wa="add-erker">＋ Эркер на этой стене</button>';
    const numIn = (path, val, label, step = 0.1) => `<label>${label}<input class="input kpw-num" type="number" inputmode="decimal" step="${step}" min="0" data-wk="${path}" value="${val ?? ''}"></label>`;
    return `
      <div class="kpw-seg">${KP_ERKERS.map(([sh, t]) => `<button class="${wl.erker.shape === sh ? 'on' : ''}" data-wa="erker-shape:${sh}">${t}</button>`).join('')}</div>
      <div class="kpw-dims">${numIn('erker.w', wl.erker.w, 'Ширина, м')}${numIn('erker.d', wl.erker.d, 'Выступ, м')}${numIn('erker.floors', wl.erker.floors, 'Этажей', 1)}</div>
      <div class="kph-calc" id="kph-calc-erker">${this.calcErker(r)}</div>
      <p class="configure-hint">Лицевая сторона эркера уже входит в длину стены — добавляются только боковины. Окна в эркере: в «Окна и двери» выберите «Эркер».</p>
      <button class="kpw-link" data-wa="del-erker">Убрать эркер</button>`;
  },

  calcErker(r) {
    const n1 = kpNum, e = this.model.walls[r.k].erker || {};
    const how = e.shape === 'rect' ? `2 × ${n1(e.d)} м` : e.shape === 'tri' ? 'скошенные грани' : 'по дуге';
    return `<div><span>К основной плитке</span><small>боковины ${how} = ${n1(r.erkerExtra)} м × ${n1(r.Hm ? Math.min(+e.floors || 1, Math.max(1, +this.model.house.floors || 1)) * (+this.model.house.floorH || 0) : 0)} м</small><b>+${n1(r.erkerMain)} м²</b></div>`
      + (r.hb ? `<div><span>К цоколю</span><small>${n1(r.erkerExtra)} м × ${n1(r.hb)} м</small><b>+${n1(r.erkerPlinth)} м²</b></div>` : '');
  },

  // Фронтон: площадь, окна во фронтоне, карниз по скатам
  secGable(k, r) {
    const wl = this.model.walls[k];
    if (!wl.gable) return '<button class="kpw-chip kpw-chip--add" data-wa="add-gable">＋ Фронтон над стеной</button>';
    const where = this.wherePlaces(k);
    const numIn = (path, val, label) => `<label>${label}<input class="input kpw-num" type="number" inputmode="decimal" step="0.1" min="0" data-wk="${path}" value="${val ?? ''}"></label>`;
    const wins = wl.ops.map((o, i) => (o.where === 'gable' ? this.opRow(o, i, where) : '')).join('');
    return `
      <div class="kpw-dims">${numIn('gable.h', wl.gable.h, 'Высота до конька, м')}</div>
      <div class="kph-sub"><b>Окна во фронтоне</b>${wins || '<p class="configure-hint">Нет</p>'}
        <button class="kpw-chip kpw-chip--add" data-wa="add-gable-op">＋ Окно во фронтоне</button></div>
      <div class="kpw-row"><label>Венчающий карниз по скатам<small id="kph-slope">${wl.gable.cornice ? `${kpNum(r.slope)} п.м` : 'выключен'}</small></label>
        <span class="switch"><input type="checkbox" data-wk="gable.cornice" ${wl.gable.cornice ? 'checked' : ''}><span></span></span></div>
      <div class="kph-calc" id="kph-calc-gable">${this.calcGable(r)}</div>
      <button class="kpw-link" data-wa="del-gable">Убрать фронтон</button>`;
  },

  calcGable(r) {
    const n1 = kpNum, h = +this.model.walls[r.k].gable?.h || 0;
    return `<div><span>Плитка фронтона</span><small>${n1(r.L)} × ${n1(h)} ÷ 2 = ${n1(r.gableGross)} м²${r.gableWin ? ` − окна ${n1(r.gableWin)}` : ''}</small><b>${n1(r.gable)} м²</b></div>`;
  },

  onWallInput(e, structural) {
    const el = e.target, path = el.dataset.wk;
    if (!path) return;
    const wl = this.model.walls[this.wallK];
    const val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (el.value === '' ? (path === 'plinth' ? null : '') : +el.value) : el.value;
    const keys = path.split('.');
    let o = wl;
    keys.slice(0, -1).forEach(k => { o = o[k]; });
    o[keys[keys.length - 1]] = val;
    this.saveSoon();
    // Включили стену, перенесли окно во фронтон или из него — меняется состав карточки
    if (structural && (path === 'on' || path.endsWith('.where'))) return this.redrawWall();
    this.refreshWall();
  },

  // Рисунок стены, остатки плитки и площади окон — без перерисовки полей, пока печатают
  refreshWall() {
    const k = this.wallK, wl = this.model.walls[k];
    const r = kpWallCalc(this.model, k, this.spec.materials.base.on, kpFinish(this.model, this.spec));
    const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };
    set('#kpw-elev', this.elevSvg(k));
    set('#kph-tiles', this.tilesHtml(r));
    set('#kph-calc-ops', this.calcOps(r));
    set('#kph-calc-erker', this.calcErker(r));
    set('#kph-calc-gable', this.calcGable(r));
    set('[data-sec-note="ops"]', this.opsNote(r));
    set('[data-sec-note="erker"]', wl.erker ? `+${kpNum(r.erkerMain + r.erkerPlinth)} м² боковин` : 'нет');
    set('[data-sec-note="gable"]', wl.gable ? `${kpNum(r.gable)} м²` : 'нет');
    set('#kph-slope', wl.gable?.cornice ? `${kpNum(r.slope)} п.м` : 'выключен');
    wl.ops.forEach((o, i) => {
      const a = (+o.w || 0) * (+o.h || 0), n = +o.n || 0;
      set(`[data-op-area="${i}"]`, `${kpArea(o.w)} × ${kpArea(o.h)} = ${kpArea(a)} м²${n > 1 ? ` × ${n} = <b>${kpArea(a * n)} м²</b>` : ''}`);
    });
    this.live();
  },

  redrawWall() {
    const box = document.getElementById('kpw-wall');
    if (!box) return;
    const sheet = box.closest('.modal-sheet'), y = sheet?.scrollTop || 0;
    box.innerHTML = this.wallHtml(this.wallK);
    if (sheet) sheet.scrollTop = y;
    this.live();
  },

  onWallClick(e) {
    const b = e.target.closest('[data-wa]');
    if (!b) return;
    const [act, arg] = b.dataset.wa.split(':');
    const md = this.model, k = this.wallK, wl = md.walls[k], F = Math.max(1, +md.house.floors || 1);
    if (act === 'done') { closeModal(); return this.render(true); }
    if (act === 'sec') { this.wallOpen[arg] = !this.wallOpen[arg]; return this.redrawWall(); }
    if (act === 'add-gable-op') wl.ops.push({ ...KP_OP_TYPES.arch, n: 1, where: 'gable' });
    if (act === 'add-op') {
      // Новое окно — на этаж, где окон меньше всего; дверь и ворота — на первый
      const count = f => wl.ops.filter(o => String(o.where) === String(f)).reduce((a, o) => a + (+o.n || 0), 0);
      const floor = arg === 'door' || arg === 'gate' ? 1 : Array.from({ length: F }, (_, i) => i + 1).sort((a, c) => count(a) - count(c))[0];
      wl.ops.push({ ...KP_OP_TYPES[arg], n: 1, where: String(floor) });
    }
    if (act === 'del-op') wl.ops.splice(+arg, 1);
    if (act === 'add-erker') { wl.erker = { shape: 'rect', w: Math.min(3, kpWallLen(md, k)), d: 1, floors: F }; this.wallOpen.erker = true; }
    if (act === 'del-erker') { wl.erker = null; wl.ops.forEach(o => { if (o.where === 'erker') o.where = '1'; }); }
    if (act === 'erker-shape') wl.erker.shape = arg;
    if (act === 'add-gable') { wl.gable = { h: 2.5, cornice: true }; this.wallOpen.gable = true; }
    if (act === 'del-gable') { wl.gable = null; wl.ops = wl.ops.filter(o => o.where !== 'gable'); }
    if (act === 'copy') {
      md.walls[arg] = { ...JSON.parse(JSON.stringify(wl)), on: true };
      showToast(`${KP_WALLS[arg]}: как ${KP_WALLS[k].toLowerCase()}`);
    }
    this.saveSoon();
    this.redrawWall();
  },

  // === Вид на стену спереди: чертёж с фактурой камня ===
  elevSvg(k) {
    const md = this.model, wl = md.walls[k], fin = kpFinish(md, this.spec);
    const r = kpWallCalc(md, k, this.spec.materials.base.on, fin);
    // Высота стены = этажи над цоколем + цоколь; этаж f начинается на высоте цоколя
    const F = Math.max(1, +md.house.floors || 1), fh = +md.house.floorH || 3, L = Math.max(1, r.L), H = F * fh + r.hb;
    const gh = wl.gable ? Math.max(0, +wl.gable.h || 0) : 0, eave = 0.45, roof = 0.28;
    // Слева — размер высоты, справа — отметки уровней; стена — между ними
    const W = 340, padL = 34, padR = 42, s = Math.min((W - padL - padR) / (L + 2 * eave), 210 / (H + gh + roof + 0.2));
    const x0 = padL + (W - padL - padR - L * s) / 2, xR = x0 + L * s, yG = 14 + (gh + roof + 0.15) * s + H * s, yT = yG - H * s, ex = x0 + L * s / 2;
    const P = fin.parts, hb = r.hb;
    const st = id => this.stone(id);
    const mainS = st(fin.main), baseS = st(fin.base);
    const partCol = key => (P[key] ? st(P[key].stone).color : mainS.color) || '#d9cdb8';
    const id = `e${k}`;
    const joints = (pid, tile, color) => {
      const [th, tw] = tile.format.split('x').map(v => (+v || 300) / 1000 * s);
      const c = JOINT_COLORS[tile.joint]?.color || [200, 194, 182];
      const stroke = `rgba(${c.join(',')},0.9)`;
      if (th < 2.2) return `<pattern id="${pid}" width="${Math.max(4, tw)}" height="${Math.max(4, th * 2)}" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="none"/></pattern>`;
      const stack = tile.layout === 'stack';
      return `<pattern id="${pid}" width="${tw}" height="${th * 2}" patternUnits="userSpaceOnUse">
        <path d="M0,0H${tw}M0,${th}H${tw}M0,0V${th}M${stack ? 0 : tw / 2},${th}V${th * 2}" stroke="${stroke}" stroke-width="${Math.max(0.6, s * 0.008)}" fill="none"/></pattern>`;
    };
    const tex = (pid, stone) => {
      const size = 1.4 * s;
      return `<pattern id="${pid}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
        <rect width="${size}" height="${size}" fill="${stone.color || '#d9cdb8'}"/>
        <image href="${stone.texture}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" opacity="0.85"/></pattern>`;
    };
    // Камень: цвет + фактура + швы + лёгкая светотень сверху вниз
    const stoneFill = (shape, tp, jp, extra = '') => `${shape.replace('/>', ` fill="url(#${tp})"${extra}/>`)}${shape.replace('/>', ` fill="url(#${jp})"/>`)}${shape.replace('/>', ` fill="url(#${id}-shade)"/>`)}`;
    const defs = `<defs>
      ${tex(`${id}-tm`, mainS)}${tex(`${id}-tb`, baseS)}
      ${joints(`${id}-jm`, fin.tile, mainS.color)}${joints(`${id}-jb`, { ...fin.baseTile, format: fin.baseTile.format || fin.tile.format }, baseS.color)}
      <linearGradient id="${id}-shade" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="1" stop-color="#000" stop-opacity="0.10"/></linearGradient>
      <linearGradient id="${id}-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.45"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/></linearGradient>
      <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f8796"/><stop offset="0.48" stop-color="#3d5260"/><stop offset="0.52" stop-color="#4c6371"/><stop offset="1" stop-color="#2a3943"/></linearGradient>
      <linearGradient id="${id}-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b3f2a"/><stop offset="0.5" stop-color="#7a5638"/><stop offset="1" stop-color="#4f3624"/></linearGradient>
      <linearGradient id="${id}-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.22"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.08"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>
      <pattern id="${id}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#b8b2a8" stroke-width="1"/></pattern>
    </defs>`;
    let g = '';
    // Крыша: свес над стеной или скаты над фронтоном
    if (gh) {
      const yA = yT - gh * s, k2 = gh / (L / 2), dx = eave * s, dy = eave * k2 * s;
      g += `<path d="M${x0 - dx},${yT + dy}L${ex},${yA - roof * s}L${xR + dx},${yT + dy}L${xR + dx},${yT + dy + roof * s}L${ex},${yA}L${x0 - dx},${yT + dy + roof * s}Z" class="kph-e-roof"/>`;
    } else {
      g += `<rect x="${x0 - eave * s}" y="${yT - roof * s}" width="${L * s + 2 * eave * s}" height="${roof * s}" class="kph-e-roof"/>`;
      g += `<rect x="${x0}" y="${yT}" width="${L * s}" height="${0.12 * s}" fill="#000" opacity="0.18"/>`;
    }
    if (!wl.on) {
      g += `<rect x="${x0}" y="${yT}" width="${L * s}" height="${H * s}" fill="url(#${id}-hatch)" stroke="#b8b2a8"/>`;
      if (gh) g += `<path d="M${x0},${yT}L${xR},${yT}L${ex},${yT - gh * s}Z" fill="url(#${id}-hatch)" stroke="#b8b2a8"/>`;
    } else {
      g += stoneFill(`<rect x="${x0}" y="${yT}" width="${L * s}" height="${H * s - hb * s}"/>`, `${id}-tm`, `${id}-jm`);
      if (gh) g += stoneFill(`<path d="M${x0},${yT + 0.5}L${xR},${yT + 0.5}L${ex},${yT - gh * s}Z"/>`, `${id}-tm`, `${id}-jm`);
      if (hb) g += stoneFill(`<rect x="${x0}" y="${yG - hb * s}" width="${L * s}" height="${hb * s}"/>`, `${id}-tb`, `${id}-jb`);
    }
    // Эркер: выступ — своей гранью, с тенью на стене и карнизом сверху
    const e = wl.erker, ew = e ? Math.min(+e.w || 0, L) * s : 0, ef = e ? Math.min(+e.floors || 1, F) : 0, eTop = yG - hb * s - ef * fh * s;
    if (e && wl.on) {
      const ex0 = ex - ew / 2;
      g += `<rect x="${ex0 + 0.2 * s}" y="${eTop + 0.1 * s}" width="${ew}" height="${yG - eTop - 0.1 * s}" fill="#000" opacity="0.22"/>`;
      g += stoneFill(`<rect x="${ex0}" y="${eTop}" width="${ew}" height="${yG - eTop - hb * s}"/>`, `${id}-tm`, `${id}-jm`);
      if (hb) g += stoneFill(`<rect x="${ex0}" y="${yG - hb * s}" width="${ew}" height="${hb * s}"/>`, `${id}-tb`, `${id}-jb`);
      g += `<rect x="${ex0}" y="${eTop}" width="${ew}" height="${yG - eTop}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="0.8"/>`;
      if (e.shape === 'round') g += `<rect x="${ex0}" y="${eTop}" width="${ew}" height="${yG - eTop}" fill="url(#${id}-cyl)"/>`;
      else {
        const side = e.shape === 'tri' ? ew / 4 : Math.min(ew / 6, 0.18 * s);
        g += `<rect x="${ex0}" y="${eTop}" width="${side}" height="${yG - eTop}" fill="#000" opacity="0.14"/><rect x="${ex0 + ew - side}" y="${eTop}" width="${side}" height="${yG - eTop}" fill="#000" opacity="0.2"/>`;
      }
      g += `<rect x="${ex0 - 0.08 * s}" y="${eTop - 0.18 * s}" width="${ew + 0.16 * s}" height="${0.18 * s}" fill="${partCol('topCornice')}"/><rect x="${ex0 - 0.08 * s}" y="${eTop - 0.18 * s}" width="${ew + 0.16 * s}" height="${0.18 * s}" fill="url(#${id}-band)"/>`;
    }
    // Карнизы и пояса — полосы своей высоты с бликом сверху и тенью снизу
    const band = (y, h, x1, x2, key) => `<rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="${partCol(key)}"/><rect x="${x1}" y="${y}" width="${x2 - x1}" height="${h}" fill="url(#${id}-band)"/><rect x="${x1}" y="${y + h}" width="${x2 - x1}" height="${Math.max(1, h * 0.25)}" fill="#000" opacity="0.15"/>`;
    const bh = key => Math.max(0.12, Math.min(0.35, kpMm(this.catalog.variants[P[key]?.item]?.size, 0) || 0.16)) * s;
    if (wl.on) {
      if (P.floorCornice) for (let f = 1; f < F; f++) g += band(yG - hb * s - f * fh * s - bh('floorCornice') / 2, bh('floorCornice') * 0.7, x0 - 0.05 * s, xR + 0.05 * s, 'floorCornice');
      if (P.baseCornice && hb) g += band(yG - hb * s - bh('baseCornice') * 0.6, bh('baseCornice') * 0.6, x0 - 0.03 * s, xR + 0.03 * s, 'baseCornice');
      if (P.topCornice) g += band(yT, bh('topCornice'), x0 - 0.08 * s, xR + 0.08 * s, 'topCornice');
      if (P.dentils) {
        const y = yT + (P.topCornice ? bh('topCornice') : 0) + 1, dw = 0.1 * s, gap = 0.1 * s;
        for (let x = x0 + gap; x < xR - dw; x += dw + gap) g += `<rect x="${x}" y="${y}" width="${dw}" height="${0.12 * s}" fill="${partCol('dentils')}"/><rect x="${x}" y="${y}" width="${dw}" height="${0.12 * s}" fill="url(#${id}-band)"/>`;
      }
      if (gh && wl.gable.cornice) g += `<path d="M${x0},${yT}L${ex},${yT - gh * s}L${xR},${yT}" fill="none" stroke="${partCol('topCornice')}" stroke-width="${0.14 * s}" stroke-linejoin="round"/><path d="M${x0},${yT + 0.07 * s}L${ex},${yT - gh * s + 0.07 * s}L${xR},${yT + 0.07 * s}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="${0.04 * s}"/>`;
      // Русты на углах: блоки через один — длинный, короткий
      if (P.corners) {
        const rs = this.catalog.variants[P.corners.item]?.size, bhR = Math.max(0.2, kpMm(rs, 0) || 0.3) * s, long = Math.max(0.3, kpMm(rs, 1) || 0.45) * s;
        const ends = KP_NEIGHBORS[k].map((n, i) => (md.walls[n].on ? (i === 0 ? 'L' : 'R') : null)).filter(Boolean);
        const xs = [];
        // Слева — та соседняя стена, что видна слева, если стоять лицом к этой
        const leftN = { front: 'left', back: 'right', left: 'back', right: 'front' }[k], rightN = { front: 'right', back: 'left', left: 'front', right: 'back' }[k];
        if (md.walls[leftN].on && ends.length) xs.push(['L', x0]);
        if (md.walls[rightN].on && ends.length) xs.push(['R', xR]);
        if (e && e.shape !== 'round') xs.push(['L', ex - ew / 2], ['R', ex + ew / 2]);
        xs.forEach(([side, x]) => {
          const top = x === x0 || x === xR ? yT + (P.topCornice ? bh('topCornice') : 0) : eTop;
          for (let y = yG - hb * s, i = 0; y - bhR > top - 0.5; y -= bhR, i++) {
            const w2 = i % 2 ? long * 0.65 : long, bx = side === 'L' ? x : x - w2;
            g += `<rect x="${bx}" y="${y - bhR + 0.6}" width="${w2}" height="${bhR - 1.2}" fill="${partCol('corners')}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/><rect x="${bx}" y="${y - bhR + 0.6}" width="${w2}" height="${bhR - 1.2}" fill="url(#${id}-band)" opacity="0.6"/>`;
          }
        });
      }
    }
    // Окна и двери на своих местах
    const win = (o, cx, yb) => {
      const w = (+o.w || 0) * s, h = (+o.h || 0) * s, x = cx - w / 2, y = yb - h, fw = 0.12 * s, door = o.kind === 'door';
      const arch = o.arch && !door, rr = w / 2;
      const outline = (d) => (arch ? `M${x - d},${yb}L${x - d},${y + rr}A${rr + d},${rr + d} 0 0 1 ${x + w + d},${y + rr}L${x + w + d},${yb}Z` : `M${x - d},${yb + (door ? 0 : 0)}L${x - d},${y - d}L${x + w + d},${y - d}L${x + w + d},${yb}Z`);
      let out = '';
      if (wl.on && P.windowCornice && !arch) {
        const cy = y - (P.frame ? fw : 0) - 0.16 * s;
        out += `<path d="M${x - fw - 0.16 * s},${cy + 0.16 * s}L${x - fw - 0.1 * s},${cy}L${x + w + fw + 0.1 * s},${cy}L${x + w + fw + 0.16 * s},${cy + 0.16 * s}Z" fill="${partCol('windowCornice')}"/><path d="M${x - fw - 0.16 * s},${cy + 0.16 * s}L${x - fw - 0.1 * s},${cy}L${x + w + fw + 0.1 * s},${cy}L${x + w + fw + 0.16 * s},${cy + 0.16 * s}Z" fill="url(#${id}-band)"/>`;
      }
      if (wl.on && P.frame) out += `<path d="${outline(fw)}" fill="${partCol('frame')}"/><path d="${outline(fw)}" fill="url(#${id}-band)" opacity="0.5"/>`;
      // Откос — тень в проёме
      out += `<path d="${outline(0)}" fill="#1f262b"/>`;
      if (door) {
        out += `<rect x="${x + 0.04 * s}" y="${y + 0.04 * s}" width="${w - 0.08 * s}" height="${h - 0.04 * s}" fill="url(#${id}-wood)"/>`;
        const pw = w - 0.24 * s, ph = (h - 0.36 * s) / 2;
        out += `<rect x="${x + 0.12 * s}" y="${y + 0.14 * s}" width="${pw}" height="${ph}" fill="none" stroke="rgba(0,0,0,0.35)"/><rect x="${x + 0.12 * s}" y="${y + 0.22 * s + ph}" width="${pw}" height="${ph}" fill="none" stroke="rgba(0,0,0,0.35)"/>`;
        out += `<circle cx="${x + w - 0.14 * s}" cy="${yb - h * 0.48}" r="${Math.max(1, 0.03 * s)}" fill="#d9c08a"/>`;
      } else {
        const ins = 0.05 * s;
        const glass = arch ? `M${x + ins},${yb - ins}L${x + ins},${y + rr}A${rr - ins},${rr - ins} 0 0 1 ${x + w - ins},${y + rr}L${x + w - ins},${yb - ins}Z`
          : `M${x + ins},${yb - ins}L${x + ins},${y + ins}L${x + w - ins},${y + ins}L${x + w - ins},${yb - ins}Z`;
        out += `<path d="${glass}" fill="url(#${id}-glass)" stroke="#f4f2ee" stroke-width="${Math.max(1, 0.05 * s)}"/>`;
        if (w > 0.8 * s) out += `<line x1="${cx}" x2="${cx}" y1="${arch ? y + rr * 0.15 : y + ins}" y2="${yb - ins}" stroke="#f4f2ee" stroke-width="${Math.max(1, 0.05 * s)}"/>`;
        if (h > 1.4 * s && !arch) out += `<line x1="${x + ins}" x2="${x + w - ins}" y1="${y + h * 0.3}" y2="${y + h * 0.3}" stroke="#f4f2ee" stroke-width="${Math.max(1, 0.04 * s)}"/>`;
        out += `<path d="M${x + w * 0.15},${yb - ins}L${x + w * 0.55},${y + ins + (arch ? rr * 0.4 : 0)}" stroke="#fff" stroke-opacity="0.12" stroke-width="${w * 0.12}"/>`;
        if (wl.on && P.sill) out += `<rect x="${x - 0.1 * s}" y="${yb}" width="${w + 0.2 * s}" height="${0.07 * s}" fill="${partCol('sill')}"/><rect x="${x - 0.1 * s}" y="${yb}" width="${w + 0.2 * s}" height="${0.07 * s}" fill="url(#${id}-band)"/><rect x="${x - 0.08 * s}" y="${yb + 0.07 * s}" width="${w + 0.16 * s}" height="${0.03 * s}" fill="#000" opacity="0.2"/>`;
        if (wl.on && P.console) [x + w * 0.12, x + w * 0.88].forEach(c => { out += `<path d="M${c - 0.05 * s},${yb + 0.07 * s}h${0.1 * s}v${0.08 * s}l${-0.05 * s},${0.08 * s}l${-0.05 * s},${-0.08 * s}Z" fill="${partCol('console')}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>`; });
      }
      if (wl.on && P.keystone) {
        const ky = (arch ? y : y) - (P.frame ? fw : 0) - 0.04 * s, kw = 0.22 * s;
        out += `<path d="M${cx - kw / 2},${ky}L${cx + kw / 2},${ky}L${cx + kw * 0.36},${ky + 0.3 * s}L${cx - kw * 0.36},${ky + 0.3 * s}Z" fill="${partCol('keystone')}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>`;
      }
      return out;
    };
    // n проёмов по участкам стены: каждому участку — по его длине, внутри — поровну, мимо краёв
    const spread = (n, segs) => {
      const lens = segs.map(([a1, b1]) => Math.max(0, b1 - a1)), total = lens.reduce((a, v) => a + v, 0) || 1;
      const cnt = lens.map(v => Math.floor(n * v / total));
      for (let left = n - cnt.reduce((a, v) => a + v, 0); left > 0; left--) {
        const i = lens.map((v, j) => [v / (cnt[j] + 1), j]).sort((a, b) => b[0] - a[0])[0][1];
        cnt[i]++;
      }
      return segs.flatMap(([a1], j) => Array.from({ length: cnt[j] }, (_, i) => a1 + (i + 0.5) * lens[j] / cnt[j]));
    };
    const sillH = (o) => (o.kind === 'door' ? 0 : Math.max(0.1, Math.min(0.9, fh - (+o.h || 0) - 0.35)));
    const margin = 0.5 * s;
    for (let f = 1; f <= F; f++) {
      const list = wl.ops.filter(o => String(o.where) === String(f) || (f === F && +o.where > F)).flatMap(o => Array(Math.min(20, +o.n || 0)).fill(o));
      const yb = yG - hb * s - (f - 1) * fh * s;
      const segs = e && f <= ef ? [[x0 + margin, ex - ew / 2 - 0.3 * s], [ex + ew / 2 + 0.3 * s, xR - margin]] : [[x0 + margin, xR - margin]];
      // Дверь первого этажа — от земли, окна — от пола этажа
      spread(list.length, segs).forEach((cx, i) => { const o = list[i]; g += win(o, cx, o.kind === 'door' && f === 1 ? yG : yb - sillH(o) * s); });
    }
    if (e) {
      const list = wl.ops.filter(o => o.where === 'erker').flatMap(o => Array(Math.min(12, +o.n || 0)).fill(o));
      const per = Math.ceil(list.length / ef) || 1;
      for (let f = 1; f <= ef; f++) {
        const part = list.slice((f - 1) * per, f * per), yb = yG - hb * s - (f - 1) * fh * s;
        spread(part.length, [[ex - ew / 2 + 0.2 * s, ex + ew / 2 - 0.2 * s]]).forEach((cx, i) => { g += win(part[i], cx, yb - sillH(part[i]) * s); });
      }
    }
    if (gh) {
      const list = wl.ops.filter(o => o.where === 'gable').flatMap(o => Array(Math.min(4, +o.n || 0)).fill(o));
      spread(list.length, [[ex - L * s / 7, ex + L * s / 7]]).forEach((cx, i) => { g += win(list[i], cx, yT - 0.35 * s); });
    }
    // Земля, размеры и отметки уровней — как на чертеже
    g += `<rect x="${x0 - 30}" y="${yG}" width="${L * s + 60}" height="6" fill="url(#${id}-hatch)"/><line x1="${x0 - 30}" x2="${xR + 30}" y1="${yG}" y2="${yG}" class="kph-e-ground"/>`;
    const dy = yG + 20, tick = (x, y) => `<path d="M${x - 4},${y + 4}L${x + 4},${y - 4}" class="kph-e-dim"/>`;
    g += `<line x1="${x0}" x2="${xR}" y1="${dy}" y2="${dy}" class="kph-e-dim"/>${tick(x0, dy)}${tick(xR, dy)}<text x="${ex}" y="${dy - 4}" text-anchor="middle" class="kph-e-txt">${kpNum(L)} м</text>`;
    const dx = x0 - 22 - eave * s;
    g += `<line x1="${dx}" x2="${dx}" y1="${yT}" y2="${yG}" class="kph-e-dim"/>${tick(dx, yT)}${tick(dx, yG)}<text x="${dx - 5}" y="${(yT + yG) / 2}" text-anchor="middle" class="kph-e-txt" transform="rotate(-90 ${dx - 5} ${(yT + yG) / 2})">${kpNum(H)} м</text>`;
    // Отметки: земля, верх цоколя, этажи
    const levels = [0, ...(hb ? [hb] : []), ...Array.from({ length: F }, (_, i) => hb + (i + 1) * fh)];
    let lastY = Infinity;
    levels.forEach(v => {
      const y = yG - v * s, lx = xR + eave * s + 6;
      g += `<path d="M${lx},${y}l4,-5h-8z" class="kph-e-mark"/>`;
      // Подписи не налезают друг на друга: близкую к предыдущей пропускаем
      if (lastY - y >= 14 || v === levels[levels.length - 1]) {
        g += `<text x="${lx + 6}" y="${y + 3}" class="kph-e-lvl">${v ? '+' : '±'}${v.toFixed(2).replace('.', ',')}</text>`;
        lastY = y;
      }
    });
    if (!wl.on) g += `<text x="${ex}" y="${(yT + yG) / 2}" text-anchor="middle" class="kph-e-off">не облицовываем</text>`;
    return `<svg viewBox="0 0 ${W} ${yG + 30}" role="img" aria-label="Стена ${KP_WALLS[k]} спереди">${defs}${g}</svg>`;
  },

  // Без перерисовки полей — пока прораб печатает: план, стены, сумма внизу
  live() {
    const t = this.totals(), g = t.ms;
    const plan = document.getElementById('kpw-plan');
    if (plan) plan.innerHTML = this.planSvg(g);
    const list = document.getElementById('kpw-wall-list');
    if (list) list.innerHTML = this.wallListHtml(g);
    const hh = document.getElementById('kph-height');
    if (hh) hh.textContent = this.heightNote(g);
    this.renderTotals(t);
  },

  onWizardClick(e) {
    const t = e.target.closest('[data-kp-step], [data-open-wall], [data-inc], [data-dec]');
    if (!t) return false;
    const md = this.model, d = t.dataset;
    if (d.kpStep) { this.step = +d.kpStep; this.render(); return true; }
    if (d.openWall) { this.openWall(d.openWall); return true; }
    const path = d.inc || d.dec;
    const cur = +path.split('.').reduce((o, k) => o[k], md) || 0;
    const next = Math.min(5, Math.max(1, cur + (d.inc ? 1 : -1)));
    this.setPath(path, next);
    // Окна выше последнего этажа — на последний
    KP_WALL_ORDER.forEach(k => md.walls[k].ops.forEach(o => { if (+o.where > next) o.where = String(next); }));
    const out = t.parentElement.querySelector('output');
    if (out) out.textContent = next;
    this.saveSoon();
    this.live();
    return true;
  },
});
