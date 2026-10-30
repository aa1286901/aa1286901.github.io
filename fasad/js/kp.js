// === Коммерческое предложение (КП) ===
// Три шага, как прораб думает на объекте:
// 1. Дом — размеры, какие стороны облицовываем (план сверху), углы, фронтоны, эркеры.
// 2. Окна и двери — типами («обычное 1,2×1,5 — 8 шт»), у типа отмечено, что на нём ставим.
// 3. Смета — всё посчитано, у строки видно «откуда цифра»; цены, запас, скидка, условия, контакты.
// PDF собирается прямо на телефоне в формате экрана: фото с водяным знаком, смета, итог, «Позвонить» / «Написать».

// Позиции сметы. part — узор подбора (строка есть, только если он выбран); op — проём (строка есть, если на
// каком-то типе окон её отметили); calc — строка есть, только когда посчиталось больше нуля.
// Цены — примерные, прораб ставит свои, они запоминаются
const KP_ITEMS = [
  { id: 'wall', group: 'Стены и цоколь', name: 'Плитка стен', unit: 'м²', m: 2200, w: 1600 },
  { id: 'gable', group: 'Стены и цоколь', name: 'Фронтоны', unit: 'м²', m: 2200, w: 1900, calc: true },
  { id: 'erker', group: 'Стены и цоколь', name: 'Эркер', unit: 'м²', m: 2200, w: 1900, calc: true },
  { id: 'base', group: 'Стены и цоколь', name: 'Плитка цоколя', unit: 'м²', m: 2600, w: 1800 },
  { id: 'corners', group: 'Стены и цоколь', name: 'Русты (Пилястры)', unit: 'п.м', m: 1800, w: 900, part: 'corners' },
  { id: 'topCornice', group: 'Карнизы', name: 'Венчающий карниз', unit: 'п.м', m: 2800, w: 900, part: 'topCornice' },
  { id: 'gableCornice', group: 'Карнизы', name: 'Карниз по фронтону', unit: 'п.м', m: 2400, w: 1100, calc: true },
  { id: 'floorCornice', group: 'Карнизы', name: 'Межэтажный пояс', unit: 'п.м', m: 2400, w: 900, part: 'floorCornice' },
  { id: 'baseCornice', group: 'Карнизы', name: 'Плинтус над цоколем', unit: 'п.м', m: 1600, w: 700, part: 'baseCornice' },
  { id: 'dentils', group: 'Карнизы', name: 'Зубцы под карнизом', unit: 'п.м', m: 1200, w: 700, part: 'dentils' },
  { id: 'frame', group: 'Окна и двери', name: 'Наличники', unit: 'п.м', m: 950, w: 600, part: 'frame', op: true },
  { id: 'windowCornice', group: 'Окна и двери', name: 'Сандрики (карнизы над окнами)', unit: 'п.м', m: 1400, w: 500, part: 'windowCornice', op: true },
  { id: 'sill', group: 'Окна и двери', name: 'Подоконники', unit: 'п.м', m: 1400, w: 500, part: 'sill', op: true },
  { id: 'keystone', group: 'Окна и двери', name: 'Замки над окнами', unit: 'шт', m: 1500, w: 500, part: 'keystone', op: true },
  { id: 'console', group: 'Окна и двери', name: 'Консоли под подоконники', unit: 'шт', m: 1200, w: 400, part: 'console', op: true },
  { id: 'reveals', group: 'Окна и двери', name: 'Откосы окон и двери', unit: 'п.м', m: 650, w: 450, op: true },
  { id: 'column', group: 'Колонны и балюстрада', name: 'Колонны или пилястры', unit: 'шт', m: 25000, w: 8000, part: 'column' },
  { id: 'capital', group: 'Колонны и балюстрада', name: 'Капители и базы', unit: 'шт', m: 9000, w: 2000, part: 'capital' },
  { id: 'balustrade', group: 'Колонны и балюстрада', name: 'Балюстрада', unit: 'п.м', m: 9500, w: 3000, parts: ['baluster', 'post', 'rail', 'finial'] },
];

// Дополнительные работы. lm / lw — как назвать строку, если это не материал или работа
const KP_EXTRAS = [
  { id: 'mesh', name: 'Армирующая сетка', sub: 'под плитку, с крепежом', unit: 'м²', m: 180, w: 90 },
  { id: 'scaffold', name: 'Леса', sub: 'монтаж, аренда на срок работ, демонтаж', unit: 'м²', m: 0, w: 220 },
  { id: 'glue', name: 'Клей, грунт, затирка', sub: 'расход на всю площадь', unit: 'м²', m: 350, w: 0 },
  { id: 'delivery', name: 'Доставка камня', sub: 'с карьера на объект', unit: 'рейс', m: 12500, w: 0, lm: 'Услуга' },
  { id: 'unload', name: 'Разгрузка и подъём', sub: 'на этажи', unit: 'объект', m: 0, w: 8000 },
  { id: 'food', name: 'Питание бригады', sub: 'на весь срок работ', unit: 'дн', m: 0, w: 1200, lw: 'Расход' },
  { id: 'trash', name: 'Вывоз мусора', sub: 'обрезки камня, упаковка', unit: 'объект', m: 0, w: 6000, lw: 'Услуга' },
];

const KP_TERMS = { payment: '50% на камень и леса, остаток — по этапам', guarantee: '5 лет на монтаж, камень — на весь срок службы', valid: 14 };

const kpRub = (n) => `${Math.round(n || 0).toLocaleString('ru-RU')} ₽`;
const kpNum = (n) => (Math.round((+n || 0) * 10) / 10).toLocaleString('ru-RU');
const kpUnit = (u, n) => (u === 'рейс' ? plural(Math.round(n), 'рейс', 'рейса', 'рейсов') : u);

// === Шаг 1–2: дом и проёмы ===
const KP_SIDES = { front: 'Фасад', right: 'Правая', back: 'Задняя', left: 'Левая' };
// Что ставим на проём — те же id, что у позиций сметы
const KP_OP_PARTS = [['frame', 'Наличник'], ['windowCornice', 'Сандрик'], ['sill', 'Подоконник'], ['keystone', 'Замок'], ['console', 'Консоли'], ['reveals', 'Откосы']];
const KP_OP_TYPES = {
  win: { name: 'Окно', kind: 'win', w: 1.2, h: 1.5 },
  big: { name: 'Окно большое', kind: 'win', w: 2.0, h: 1.8 },
  arch: { name: 'Окно арочное', kind: 'win', w: 1.2, h: 2.0, arch: true },
  door: { name: 'Дверь', kind: 'door', w: 1.0, h: 2.2 },
  gate: { name: 'Гараж / ворота', kind: 'door', w: 2.6, h: 2.3 },
};
const KP_ERKERS = [['rect', 'Прямой'], ['tri', 'Скошенный'], ['round', 'Полукруглый']];

// Площади, длины и количество по каждой позиции — из дома и проёмов. how — «откуда цифра» для строки сметы
function kpGeometry(md, baseOn) {
  const h = md.house, F = Math.max(1, +h.floors || 1), H = F * (+h.floorH || 0);
  const hb = baseOn ? (+h.plinth || 0) : 0;
  const n1 = v => kpNum(v);
  const sideLen = k => (k === 'front' || k === 'back' ? +h.len || 0 : +h.wid || 0);
  const sides = Object.keys(KP_SIDES).filter(k => h.sides[k]);
  const P = sides.reduce((a, k) => a + sideLen(k), 0);
  // Внешние углы — где сходятся две облицованные стороны, плюс углы эркеров
  const pairs = [['front', 'right'], ['right', 'back'], ['back', 'left'], ['left', 'front']];
  const houseCorners = pairs.filter(([a, b]) => h.sides[a] && h.sides[b]).length;
  const erkerCorners = md.erkers.reduce((a, e) => a + (e.shape === 'round' ? 0 : 2), 0);
  const corners = Math.max(0, houseCorners + erkerCorners + (+h.cornersAdj || 0));

  const q = {}, how = {};
  const add = (id, v, t) => { q[id] = (q[id] || 0) + v; (how[id] = how[id] || []).push(t); };
  let winArea = 0, doorWall = 0, doorPlinth = 0, doorW = 0, openings = 0;
  md.ops.forEach(o => {
    const n = +o.n || 0, w = +o.w || 0, oh = +o.h || 0;
    if (!n) return;
    openings += n;
    if (o.kind === 'door') {
      const low = Math.min(hb, oh);
      doorPlinth += w * low * n; doorWall += w * (oh - low) * n; doorW += w * n;
    } else winArea += w * oh * n;
    // Арка: верх по полуокружности вместо прямой
    const top = o.arch ? Math.PI * w / 2 : w, side = o.arch ? Math.max(0, oh - w / 2) : oh;
    if (o.frame) add('frame', (2 * side + top + 0.3) * n, `${n}×(2×${n1(side)}+${n1(top)}+0,3)`);
    if (o.windowCornice) add('windowCornice', (w + 0.4) * n, `${n}×(${n1(w)}+0,4)`);
    if (o.sill && o.kind === 'win') add('sill', (w + 0.2) * n, `${n}×(${n1(w)}+0,2)`);
    if (o.keystone) add('keystone', n, `${n}`);
    if (o.console && o.kind === 'win') add('console', 2 * n, `${n}×2`);
    if (o.reveals) add('reveals', (2 * side + top) * n, `${n}×(2×${n1(side)}+${n1(top)})`);
  });
  Object.keys(how).forEach(k => { how[k] = `${how[k].join(' + ')} = ${n1(q[k])}`; });

  // Эркер: стоит на стороне дома, добавляет боковые грани; полукруглый — длиннее по дуге
  let erkerArea = 0, erkerFront = 0, erkerExtra = 0;
  const erkHow = [];
  md.erkers.forEach(e => {
    const w = +e.w || 0, d = +e.d || 0, eh = Math.min(+e.floors || 1, F) * (+h.floorH || 0);
    const extra = e.shape === 'rect' ? 2 * d : e.shape === 'tri' ? 2 * Math.hypot(d, w / 4) - w / 2 : Math.PI * w / 2 - w;
    erkerArea += (w + extra) * eh; erkerFront += w * eh; erkerExtra += extra;
    erkHow.push(`(${n1(w)}+${n1(extra)})×${n1(eh)}`);
  });

  const walls = Math.max(0, P * (H - hb) - winArea - doorWall - erkerFront);
  const gable = (+md.gables.n || 0) * (+md.gables.base || 0) * (+md.gables.h || 0) / 2;
  const plinth = Math.max(0, P * hb - doorPlinth);
  const area = walls + gable + erkerArea + plinth;
  const kw = 1 + (+md.stock.wall || 0) / 100, kh = 1 + (+md.stock.hard || 0) / 100;
  const stock = p => (+p ? ` + запас ${p}%` : '');
  const slope = Math.hypot((+md.gables.base || 0) / 2, +md.gables.h || 0);
  const decor = (q.frame || 0) + (q.windowCornice || 0) + (q.sill || 0);
  const days = Math.max(1, Math.ceil(area / 7 + decor / 12));
  const order = walls * kw + (gable + erkerArea) * kh + plinth;

  Object.assign(q, {
    wall: walls * kw, gable: gable * kh, erker: erkerArea * kh, base: plinth, corners: corners * H,
    topCornice: P + erkerExtra, gableCornice: md.gables.cornice ? (+md.gables.n || 0) * 2 * slope : 0,
    floorCornice: (P + erkerExtra) * (F - 1), baseCornice: Math.max(0, P - doorW), dentils: P + erkerExtra,
    column: 2, capital: 2, balustrade: 6,
    mesh: area, glue: area, scaffold: F > 1 ? walls + gable + erkerArea : 0,
    delivery: Math.max(1, order / 120), unload: 1, food: +md.days || days, trash: 1,
  });
  Object.assign(how, {
    wall: `${n1(P)} м сторон × ${n1(H - hb)} м − окна ${n1(winArea)} − двери ${n1(doorWall)}${erkerFront ? ` − под эркером ${n1(erkerFront)}` : ''} = ${n1(walls)} м²${stock(md.stock.wall)}`,
    gable: `${md.gables.n} × ${n1(md.gables.base)} × ${n1(md.gables.h)} ÷ 2 = ${n1(gable)} м²${stock(md.stock.hard)}`,
    erker: `${erkHow.join(' + ')} = ${n1(erkerArea)} м²${stock(md.stock.hard)}`,
    base: `${n1(P)} м × ${n1(hb)} м − двери ${n1(doorPlinth)} = ${n1(plinth)} м²`,
    corners: `${corners} ${plural(corners, 'угол', 'угла', 'углов')} × ${n1(H)} м высоты`,
    topCornice: `${n1(P)} м сторон${erkerExtra ? ` + ${n1(erkerExtra)} м по эркерам` : ''}`,
    gableCornice: `${md.gables.n} × 2 ската × ${n1(slope)} м`,
    floorCornice: `${n1(P + erkerExtra)} м × ${F - 1}`,
    baseCornice: `${n1(P)} м − двери ${n1(doorW)} м`,
    dentils: `под венчающим карнизом, ${n1(P + erkerExtra)} м`,
    mesh: `вся площадь камня ${n1(area)} м²`, glue: `вся площадь камня ${n1(area)} м²`,
    scaffold: `стены, фронтоны и эркеры от 2 этажей`, delivery: `${n1(order)} м² с запасом ÷ 120 м² за рейс`,
    food: `срок ${+md.days || days} дн`,
  });
  return { P, H, F, walls, plinth, gable, erkerArea, area, winArea, openings, corners, houseCorners, erkerCorners, days, q, how };
}

// Старое КП (периметр, число окон и дверей) → дом и типы проёмов
function kpUpgradeModel(md, spec) {
  if (md.house) return md;
  const d = md.dims || {}, floors = Math.max(1, +d.floors || 2);
  const P = +d.perimeter || 44, len = Math.round(P * 0.3), wid = Math.max(1, Math.round(P / 2 - len));
  md.house = { len, wid, floors, floorH: +(((+d.height || floors * 3.2) / floors).toFixed(1)), plinth: d.plinth ?? 0.6,
    sides: { front: true, right: true, back: true, left: true }, cornersAdj: 0 };
  md.ops = kpDefaultOps(spec, +d.windows || floors * 4, d.doors ?? 1);
  delete md.dims;
  return md;
}

// Проёмы по умолчанию: что ставим на окна — как в подборе
function kpDefaultOps(spec, windows, doors) {
  const has = k => !!spec.parts?.[k]?.item;
  const parts = { frame: has('frame'), windowCornice: has('windowCornice'), sill: has('sill'), keystone: has('keystone'), console: has('console'), reveals: true };
  const ops = [{ ...KP_OP_TYPES.win, n: windows, ...parts }];
  if (doors) ops.push({ ...KP_OP_TYPES.door, n: doors, ...parts, sill: false, console: false });
  return ops;
}

const KP = {
  // Всё про КП одного проекта: модель хранится у проекта, контакты и цены — у прораба
  async open(projectId, variantId) {
    this.projectId = projectId;
    this.variantId = variantId;
    Router.navigateTo('kp');
  },

  async load() {
    const box = document.getElementById('kp-content');
    box.innerHTML = '<p class="configure-hint">Загрузка…</p>';
    const [pr, mine, saved, stones, catalog] = await Promise.all([
      Api.getProject(this.projectId), Api.kpProfile(), Api.projectKp(this.projectId),
      Materials.getStones(), Materials.getCatalog(),
    ]);
    this.project = pr.data;
    this.stones = stones;
    this.catalog = catalog;
    this.mine = mine.data || {};
    const vs = this.project.variants || [];
    const v = vs.find(x => x.id === this.variantId) || vs.find(x => x.generated_image) || vs[vs.length - 1];
    this.variant = v;
    this.spec = upgradeDesign(v?.design, stones);
    const b = this.spec.building || {};
    const floors = +b.floors || 2;
    const user = Auth.getUser() || {};
    const fresh = !saved.data;
    this.model = Object.assign({
      client: { name: '', object: `частный дом, ${floors} ${floors === 1 ? 'этаж' : floors < 5 ? 'этажа' : 'этажей'}` },
      house: { len: 12, wid: 10, floors, floorH: b.heightM ? +(b.heightM / floors).toFixed(1) : 3, plinth: this.spec.materials.base.on ? 0.6 : 0,
        sides: { front: true, right: true, back: true, left: true }, cornersAdj: 0 },
      gables: { n: 0, base: 10, h: 2.5, cornice: true },
      erkers: [],
      ops: kpDefaultOps(this.spec, floors * 4, 1),
      stock: { wall: 10, hard: 20 },
      rows: {}, custom: [], customExtras: [], discount: 0, days: null,
      terms: { ...KP_TERMS, ...(this.mine.terms || {}) },
      profile: { name: this.mine.profile?.name || user.name || '', company: '', phone: '', telegram: '', city: '', exp: '', ...(this.mine.profile || {}) },
    }, saved.data || {});
    kpUpgradeModel(this.model, this.spec);
    ['gables', 'stock'].forEach(k => { this.model[k] = this.model[k] || { n: 0, base: 10, h: 2.5, cornice: true, wall: 10, hard: 20 }; });
    this.model.erkers = this.model.erkers || [];
    this.model.profile = { ...this.model.profile, ...(this.mine.profile || {}) };
    this.model.customExtras = this.model.customExtras || [];
    // Новое КП — с первого шага; начатое — сразу смета
    this.step = fresh ? 1 : 3;
    this.render();
  },

  // Строки сметы: определение + выбранный узор + правки прораба
  rows() {
    const spec = this.spec, m = spec.materials;
    const ms = kpGeometry(this.model, m.base.on);
    const prices = this.mine.prices || {};
    const stoneName = id => this.stones.find(s => s.id === id)?.name || '';
    const out = [];
    for (const def of KP_ITEMS) {
      let sub = '', img = null, imgKind = 'stone';
      if (def.id === 'wall') {
        const s = this.stones.find(x => x.id === m.main.stone);
        sub = `${s?.name || ''} · ${m.main.format.replace('x', '×')}×${m.main.thickness} · ${SURFACE_NAMES[m.main.surface] || ''}`;
        img = s?.texture;
      } else if (def.id === 'base') {
        if (!m.base.on) continue;
        const s = this.stones.find(x => x.id === m.base.stone);
        sub = `${s?.name || ''} · ${m.base.format.replace('x', '×')}×${m.base.thickness} · ${SURFACE_NAMES[m.base.surface] || ''}`;
        img = s?.texture;
      } else if (def.id === 'reveals' || def.id === 'gable' || def.id === 'erker') {
        if (!(ms.q[def.id] > 0)) continue;
        sub = `${stoneName(m.main.stone)}${def.id === 'reveals' ? ' · пиленый' : ''}`;
        img = this.stones.find(x => x.id === m.main.stone)?.texture;
      } else if (def.calc) {
        if (!(ms.q[def.id] > 0)) continue;
        const key = 'topCornice';
        const v = this.catalog.variants[spec.parts[key]?.item];
        sub = v ? `${v.name} · ${stoneName(resolveStone(spec, spec.parts[key].stone))}` : stoneName(m.main.stone);
        img = v?.image; imgKind = 'product';
      } else {
        const keys = def.parts || [def.part];
        const key = keys.find(k => spec.parts[k]?.item);
        // Окна: строка есть, если на каком-то типе проёмов её отметили, даже без узора в подборе
        if (def.op && !(ms.q[def.id] > 0)) continue;
        if (!key && def.op) { out.push(this.row(def, '', null, 'stone', ms, prices)); continue; }
        if (!key) continue;
        const v = this.catalog.variants[spec.parts[key].item];
        sub = `${v?.name || ''}${v?.size ? ` · ${v.size}` : ''} · ${stoneName(resolveStone(spec, spec.parts[key].stone))}`;
        img = v?.image;
        imgKind = 'product';
      }
      out.push(this.row(def, sub, img, imgKind, ms, prices));
    }
    return { items: this.order('items', [...out.filter(r => !r.deleted), ...this.customs('custom')]), ms };
  },

  // Порядок позиций, который выставил прораб (стрелками ↑ ↓)
  order(section, list) {
    const ord = this.model.order?.[section] || [];
    const pos = id => { const i = ord.indexOf(id); return i < 0 ? 1e6 : i; };
    return list.map((r, i) => [r, i]).sort((a, b) => (pos(a[0].id) - pos(b[0].id)) || (a[1] - b[1])).map(x => x[0]);
  },

  // Правки прораба поверх позиции: название, подпись, единица, подписи цен, материал из каталога
  edited(r, o) {
    const out = { ...r };
    if (o.name) out.name = o.name;
    if (o.unit) out.unit = o.unit;
    if (o.lm) out.lm = o.lm;
    if (o.lw) out.lw = o.lw;
    if (o.mat) {
      const st = o.mat.kind === 'stone' ? this.stones.find(x => x.id === o.mat.id) : null;
      const v = o.mat.kind === 'product' ? this.catalog.variants[o.mat.id] : null;
      if (st) { out.img = st.texture; out.imgKind = 'stone'; out.sub = st.name; }
      if (v) { out.img = v.image; out.imgKind = 'product'; out.sub = `${v.name}${v.size ? ` · ${v.size}` : ''}`; }
    }
    if (o.sub != null && o.sub !== '') out.sub = o.sub;
    return out;
  },

  row(def, sub, img, imgKind, ms, prices) {
    const o = this.model.rows[def.id] || {};
    const p = prices[def.id] || {};
    const auto = Math.ceil((ms.q[def.id] || 0) - 1e-9);
    return this.edited({
      ...def, deleted: !!o.deleted, sub: def.sub || sub, img, imgKind, how: ms.how[def.id] || '',
      qty: o.manual ? +o.qty || 0 : auto, auto, manual: !!o.manual,
      m: +(o.m ?? p.m ?? def.m) || 0, w: +(o.w ?? p.w ?? def.w) || 0,
      on: o.on ?? !(def.id === 'scaffold' && ms.F < 2),
    }, o);
  },

  extras(ms) {
    const prices = this.mine.prices || {};
    return this.order('extras', [...KP_EXTRAS.map(def => this.row(def, def.sub, null, null, ms, prices)).filter(r => !r.deleted),
      ...this.customs('customExtras')]);
  },

  // Свои позиции прораба: в смете (custom) и в «Дополнительно» (customExtras)
  customs(list = 'custom') {
    return (this.model[list] || []).map(c => this.edited({ ...c, sub: '', img: null, unit: c.unit || 'шт', qty: +c.qty || 0, m: +c.m || 0, w: +c.w || 0,
      on: c.on !== false, custom: list, group: list === 'custom' ? 'Другие позиции' : 'Дополнительные работы' }, c));
  },

  totals() {
    const { items, ms } = this.rows();
    const extras = this.extras(ms);
    const all = [...items, ...extras].filter(r => r.on);
    let mat = 0, work = 0;
    all.forEach(r => { mat += r.qty * r.m; work += r.qty * r.w; });
    const sum = mat + work;
    const disc = Math.round(sum * (+this.model.discount || 0) / 100);
    return { items, extras, ms, mat, work, sum, disc, total: sum - disc };
  },

  // === Экран: три шага ===
  render(keepScroll) {
    const y = window.scrollY;
    const steps = ['Дом', 'Окна', 'Смета'];
    document.getElementById('kp-content').innerHTML = `
      <div class="kp-intro">
        <img src="${this.variant?.generated_image || this.project.original_image}" alt="">
        <div><b>${esc(this.project.name)}</b><small>Вариант ${(this.project.variants || []).indexOf(this.variant) + 1} · смета считается сама</small></div>
      </div>
      <nav class="flow-steps kp-steps">${steps.map((t, i) => `
        <button class="flow-step${i + 1 === this.step ? ' active' : ''}${i + 1 < this.step ? ' done' : ''}" data-kp-step="${i + 1}"><span>${i + 1}</span>${t}</button>`).join('')}</nav>
      ${this.step === 1 ? this.stepHouse() : this.step === 2 ? this.stepOps() : this.stepSmeta()}`;
    if (this.step === 3) {
      this.renderRows();
      document.querySelectorAll('#kp-content .kp-area').forEach(kpGrow);
    } else this.live();
    document.getElementById('kp-make').textContent = this.step < 3 ? `Далее — ${steps[this.step].toLowerCase()}` : 'Создать PDF';
    window.scrollTo(0, keepScroll ? y : 0);
  },

  field(path, label, type = 'text', extra = '') {
    const v = path.split('.').reduce((o, k) => o?.[k], this.model) ?? '';
    return type === 'textarea'
      ? `<label class="kp-field"><span>${label}</span><textarea class="input kp-area" rows="2" data-k="${path}" ${extra}>${esc(v)}</textarea></label>`
      : `<label class="kp-field"><span>${label}</span><input class="input" type="${type}" data-k="${path}" value="${esc(v)}" ${extra}></label>`;
  },

  // Строка «подпись — число»: число меняют кнопками − / + или вводом
  num(path, label, sub = '', unit = 'м', step = 0.1) {
    const v = path.split('.').reduce((o, k) => o?.[k], this.model);
    return `<div class="kpw-row"><label>${label}${sub ? `<small>${sub}</small>` : ''}</label>
      <input class="input kpw-num" type="number" inputmode="decimal" step="${step}" min="0" data-k="${path}" value="${v ?? ''}"><span class="kpw-unit">${unit}</span></div>`;
  },

  stepper(path, label, sub = '', id = '') {
    const v = path.split('.').reduce((o, k) => o?.[k], this.model);
    return `<div class="kpw-row"><label>${label}${sub ? `<small${id ? ` id="${id}-note"` : ''}>${sub}</small>` : ''}</label>
      <div class="kpw-stepper"><button data-dec="${path}" aria-label="Меньше">−</button><output${id ? ` id="${id}"` : ''}>${v}</output><button data-inc="${path}" aria-label="Больше">+</button></div></div>`;
  },

  // Шаг 1: заказчик, размеры, стороны на плане, фронтоны, эркеры
  stepHouse() {
    const md = this.model, g = kpGeometry(md, this.spec.materials.base.on);
    return `
      <section class="kp-card"><h3>Заказчик</h3>
        <div class="kp-grid">${this.field('client.name', 'Имя заказчика', 'text', 'placeholder="Например, Ахмед Гаджиев"')}${this.field('client.object', 'Объект')}</div>
      </section>
      <section class="kp-card"><h3>Размеры дома</h3>
        ${this.num('house.len', 'Длина', 'сторона с фасадом')}
        ${this.num('house.wid', 'Ширина')}
        ${this.stepper('house.floors', 'Этажей')}
        ${this.num('house.floorH', 'Высота этажа', 'с перекрытием')}
        ${this.spec.materials.base.on ? this.num('house.plinth', 'Цоколь', 'высота от земли') : ''}
      </section>
      <section class="kp-card"><h3>Что облицовываем <small>нажмите на сторону</small></h3>
        <div id="kpw-plan">${this.planSvg()}</div>
        <div class="kpw-legend"><span><i class="on"></i>в смете</span><span><i></i>не облицовываем</span><span><i class="dot"></i>угол с рустами</span></div>
        <div class="kpw-row"><label>Внешних углов<small id="kpw-corners-note">${this.cornerNote(g)}</small></label>
          <div class="kpw-stepper"><button data-dec="house.cornersAdj" aria-label="Меньше">−</button><output id="kpw-corners">${g.corners}</output><button data-inc="house.cornersAdj" aria-label="Больше">+</button></div></div>
      </section>
      <section class="kp-card"><h3>Фронтоны <small>треугольник под крышей</small></h3>
        ${this.stepper('gables.n', 'Сколько облицовываем')}
        ${md.gables.n ? `${this.num('gables.base', 'Ширина внизу', 'обычно ширина дома')}${this.num('gables.h', 'Высота до конька')}
          <div class="kpw-row"><label>Карниз по скатам</label><label class="switch"><input type="checkbox" data-k="gables.cornice" ${md.gables.cornice ? 'checked' : ''}><span></span></label></div>` : ''}
      </section>
      <section class="kp-card"><h3>Эркеры и выступы</h3>
        ${md.erkers.map((e, i) => `
          <div class="kpw-sub">
            <div class="kpw-sub__head"><b>Эркер ${i + 1}</b><button class="kpw-x" data-del-erker="${i}" aria-label="Удалить эркер">×</button></div>
            <div class="kpw-seg">${KP_ERKERS.map(([k, t]) => `<button class="${e.shape === k ? 'on' : ''}" data-erker-shape="${i}:${k}">${t}</button>`).join('')}</div>
            <div class="kpw-dims">
              <label>Ширина, м<input class="input kpw-num" type="number" inputmode="decimal" step="0.1" data-k="erkers.${i}.w" value="${e.w}"></label>
              <label>Выступ, м<input class="input kpw-num" type="number" inputmode="decimal" step="0.1" data-k="erkers.${i}.d" value="${e.d}"></label>
              <label>Этажей<input class="input kpw-num" type="number" inputmode="numeric" step="1" min="1" data-k="erkers.${i}.floors" value="${e.floors}"></label>
            </div>
          </div>`).join('')}
        <button class="kpw-chip kpw-chip--add" data-add-erker>＋ Добавить эркер</button>
      </section>`;
  },

  cornerNote(g) {
    const parts = [`${g.houseCorners} у дома`];
    if (g.erkerCorners) parts.push(`${g.erkerCorners} у эркеров`);
    const adj = +this.model.house.cornersAdj || 0;
    if (adj) parts.push(`${adj > 0 ? '+' : ''}${adj} вручную`);
    return parts.join(' · ');
  },

  // План сверху: фасад внизу; облицованные стороны — золотом, нажатие включает и выключает сторону
  planSvg() {
    const h = this.model.house, W = 300, sc = Math.min(200 / Math.max(1, +h.len || 1), 130 / Math.max(1, +h.wid || 1));
    const w = (+h.len || 1) * sc, d = (+h.wid || 1) * sc, x0 = (W - w) / 2, y0 = 26 + (130 - d) / 2;
    const on = k => !!h.sides[k];
    const sides = { back: [x0, y0, x0 + w, y0], right: [x0 + w, y0, x0 + w, y0 + d], front: [x0 + w, y0 + d, x0, y0 + d], left: [x0, y0 + d, x0, y0] };
    let erk = '', maxD = 0;
    const n = this.model.erkers.length;
    this.model.erkers.forEach((e, i) => {
      const ew = (+e.w || 0) * sc, ed = Math.max(4, (+e.d || 0) * sc), cx = x0 + w * (i + 1) / (n + 1), y = y0 + d;
      maxD = Math.max(maxD, ed);
      const path = e.shape === 'rect' ? `M${cx - ew / 2},${y}L${cx - ew / 2},${y + ed}L${cx + ew / 2},${y + ed}L${cx + ew / 2},${y}`
        : e.shape === 'tri' ? `M${cx - ew / 2},${y}L${cx - ew / 4},${y + ed}L${cx + ew / 4},${y + ed}L${cx + ew / 2},${y}`
          : `M${cx - ew / 2},${y}A${ew / 2},${ed} 0 0 0 ${cx + ew / 2},${y}`;
      erk += `<path d="${path}" class="kpw-plan__erker"/>`;
      if (e.shape !== 'round') {
        const k = e.shape === 'rect' ? 2 : 4;
        erk += `<circle cx="${cx - ew / k}" cy="${y + ed}" r="5" class="kpw-plan__dot"/><circle cx="${cx + ew / k}" cy="${y + ed}" r="5" class="kpw-plan__dot"/>`;
      }
    });
    const corners = [['front', 'right', x0 + w, y0 + d], ['right', 'back', x0 + w, y0], ['back', 'left', x0, y0], ['left', 'front', x0, y0 + d]];
    const label = (k, x, y, rot = 0) => `<text x="${x}" y="${y}" text-anchor="middle" class="${on(k) ? 'on' : ''}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${KP_SIDES[k]} · ${kpNum(k === 'front' || k === 'back' ? h.len : h.wid)} м</text>`;
    const H = y0 + d + maxD + 26;
    return `<svg class="kpw-plan" viewBox="0 0 ${W} ${Math.max(190, H)}" role="img" aria-label="План дома: нажмите на сторону">
      <rect x="${x0}" y="${y0}" width="${w}" height="${d}" class="kpw-plan__house"/>
      ${Object.entries(sides).map(([k, c]) => `<line x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" class="kpw-plan__side${on(k) ? ' on' : ''}"/>
        <line data-side="${k}" x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" class="kpw-plan__hit"/>`).join('')}
      ${erk}
      ${corners.filter(([a, b]) => on(a) && on(b)).map(([, , x, y]) => `<circle cx="${x}" cy="${y}" r="5" class="kpw-plan__dot"/>`).join('')}
      ${label('back', W / 2, y0 - 9)}${label('front', W / 2, y0 + d + maxD + 18)}${label('left', x0 - 11, y0 + d / 2, -90)}${label('right', x0 + w + 11, y0 + d / 2, 90)}
    </svg>`;
  },

  // Шаг 2: типы окон и дверей, у каждого — что на нём ставим
  stepOps() {
    const icon2 = o => (o.arch ? '<path d="M11 28V16a7 7 0 0 1 14 0v12z"/>' : o.kind === 'door'
      ? '<rect x="12" y="8" width="12" height="21"/><circle cx="21" cy="19" r="1.2"/>' : '<rect x="9" y="10" width="18" height="16"/><path d="M18 10v16M9 18h18"/>');
    return `
      <p class="configure-hint">Окна одного размера — одной строкой. Отметьте, что ставим на каждый тип: это сразу идёт в смету.</p>
      ${this.model.ops.map((o, i) => `
        <section class="kp-card kpw-op">
          <div class="kpw-sub__head"><svg class="kpw-op__icon" viewBox="0 0 36 36" aria-hidden="true">${icon2(o)}</svg>
            <input class="kpw-op__name" data-k="ops.${i}.name" value="${esc(o.name)}" aria-label="Название"><button class="kpw-x" data-del-op="${i}" aria-label="Удалить">×</button></div>
          <div class="kpw-dims">
            <label>Ширина, м<input class="input kpw-num" type="number" inputmode="decimal" step="0.1" data-k="ops.${i}.w" value="${o.w}"></label>
            <label>Высота, м<input class="input kpw-num" type="number" inputmode="decimal" step="0.1" data-k="ops.${i}.h" value="${o.h}"></label>
            <label>Штук<input class="input kpw-num" type="number" inputmode="numeric" step="1" min="0" data-k="ops.${i}.n" value="${o.n}"></label>
          </div>
          <div class="kpw-chips">${KP_OP_PARTS.filter(([k]) => o.kind === 'win' || (k !== 'sill' && k !== 'console')).map(([k, t]) => `
            <button class="kpw-chip${o[k] ? ' on' : ''}" data-op-part="${i}:${k}">${o[k] ? '✓ ' : ''}${t}</button>`).join('')}
            ${o.kind === 'win' ? `<button class="kpw-chip${o.arch ? ' on' : ''}" data-op-part="${i}:arch">${o.arch ? '✓ ' : ''}Арка сверху</button>` : ''}</div>
        </section>`).join('')}
      <section class="kp-card"><h3>Добавить тип</h3>
        <div class="kpw-chips">${[['win', 'Окно'], ['big', 'Большое окно'], ['arch', 'Арочное'], ['door', 'Дверь'], ['gate', 'Гараж / ворота']].map(([k, t]) => `
          <button class="kpw-chip kpw-chip--add" data-add-op="${k}">＋ ${t}</button>`).join('')}</div>
      </section>
      <section class="kp-card"><h3>Итого по проёмам</h3><dl class="kpw-sum" id="kpw-ops-sum"></dl></section>`;
  },

  // Шаг 3: смета, запас, условия, контакты
  stepSmeta() {
    const g = kpGeometry(this.model, this.spec.materials.base.on);
    return `
      <section class="kp-card"><h3>Площади</h3>
        <dl class="kpw-sum" id="kpw-areas"></dl>
        ${this.num('stock.wall', 'Запас: стены', 'подрезка и бой', '%', 1)}
        ${g.gable + g.erkerArea > 0 ? this.num('stock.hard', 'Запас: фронтоны, эркеры', 'много косых резов', '%', 1) : ''}
      </section>

      <section class="kp-card"><h3>Смета <small>материал и работа по каждой позиции</small></h3>
        <div id="kp-items"></div>
        <button class="btn btn-ghost btn-full kp-add" data-add="custom">＋ Своя позиция</button>
      </section>

      <section class="kp-card"><h3>Дополнительно <small>сетка, леса, доставка…</small></h3>
        <div id="kp-extras"></div>
        <button class="btn btn-ghost btn-full kp-add" data-add="customExtras">＋ Своя позиция</button>
      </section>

      <section class="kp-card"><h3>Условия</h3>
        <div class="kp-grid kp-grid--3">
          ${this.field('discount', 'Скидка, %', 'number', 'inputmode="decimal"')}
          ${this.field('days', 'Срок, дней', 'number', `inputmode="numeric" placeholder="${g.days}"`)}
          ${this.field('terms.valid', 'КП действует', 'number', 'inputmode="numeric"')}
        </div>
        <div class="kp-grid">${this.field('terms.payment', 'Оплата', 'textarea')}${this.field('terms.guarantee', 'Гарантия', 'textarea')}</div>
      </section>

      <section class="kp-card"><h3>Ваши данные <small>видит заказчик · запомнятся</small></h3>
        <div class="kp-grid">
          ${this.field('profile.name', 'Имя')}${this.field('profile.company', 'Бригада или компания', 'text', 'placeholder="Облицовка фасадов камнем"')}
          ${this.field('profile.phone', 'Телефон', 'tel', 'placeholder="+7 900 000-00-00"')}${this.field('profile.telegram', 'Telegram', 'text', 'placeholder="@username"')}
          ${this.field('profile.city', 'Город')}${this.field('profile.exp', 'Опыт', 'text', 'placeholder="12 лет"')}
        </div>
      </section>
      <p class="configure-hint">Цены, ваши данные и условия запомнятся для следующих КП.</p>`;
  },

  // Без перерисовки полей — пока прораб печатает: план, углы, итоги по проёмам, сумма внизу
  live() {
    const t = this.totals(), g = t.ms;
    const plan = document.getElementById('kpw-plan');
    if (plan) plan.innerHTML = this.planSvg();
    const c = document.getElementById('kpw-corners');
    if (c) { c.textContent = g.corners; document.getElementById('kpw-corners-note').textContent = this.cornerNote(g); }
    const ops = document.getElementById('kpw-ops-sum');
    if (ops) {
      const rows = [['Проёмов', `${g.openings} шт`], ['Площадь окон', `${kpNum(g.winArea)} м²`]];
      KP_OP_PARTS.forEach(([k, name]) => { if (g.q[k] > 0) rows.push([name, `${kpNum(Math.ceil(g.q[k] - 1e-9))} ${KP_ITEMS.find(d => d.id === k).unit}`]); });
      ops.innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
    }
    this.renderTotals(t);
  },

  rowHtml(r, kind) {
    const lm = r.lm || 'Материал', lw = r.lw || 'Работа';
    return `
      <div class="kp-row${r.on ? '' : ' off'}" data-row="${r.id}" data-kind="${kind}">
        <div class="kp-row__head">
          <label class="kp-check"><input type="checkbox" data-f="on" ${r.on ? 'checked' : ''}><span></span></label>
          ${r.img ? `<img class="kp-row__img${r.imgKind === 'product' ? ' kp-row__img--prod' : ''}" src="${r.img}" alt="">` : ''}
          <div class="kp-row__name"><b>${esc(r.name || 'Без названия')}</b>
            ${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</div>
          <b class="kp-row__sum" data-sum>${kpRub(r.qty * (r.m + r.w))}</b>
        </div>
        <div class="kp-row__inputs">
          <label><span>${esc(r.unit)}${r.manual ? ' <i data-reset title="Пересчитать по размерам">↺</i>' : ''}</span><input class="input" type="number" inputmode="decimal" data-f="qty" value="${r.qty}"></label>
          <label><span>${lm}, ₽</span><input class="input" type="number" inputmode="numeric" data-f="m" value="${r.m}"></label>
          <label><span>${lw}, ₽</span><input class="input" type="number" inputmode="numeric" data-f="w" value="${r.w}"></label>
        </div>
        ${r.how && !r.manual && !r.custom ? `<div class="kp-row__how">${esc(r.how)}</div>` : ''}
        <div class="kp-row__tools">
          <button data-edit>${icon('edit')}Изменить</button>
          <button data-move="-1" aria-label="Выше">↑</button>
          <button data-move="1" aria-label="Ниже">↓</button>
          <button data-del>${icon('trash')}Удалить</button>
        </div>
      </div>`;
  },

  renderRows(t = this.totals()) {
    // Удалённые позиции можно вернуть одной кнопкой
    const gone = (defs) => defs.filter(d => this.model.rows[d.id]?.deleted).length;
    const restore = (n, kind) => n ? `<button class="kp-restore" data-restore="${kind}">Вернуть удалённые (${n})</button>` : '';
    document.getElementById('kp-items').innerHTML = t.items.map(r => this.rowHtml(r, r.custom || 'item')).join('')
      + restore(gone(KP_ITEMS), 'items');
    document.getElementById('kp-extras').innerHTML = t.extras.map(r => this.rowHtml(r, r.custom || 'extra')).join('')
      + restore(gone(KP_EXTRAS), 'extras');
    this.renderTotals(t);
  },

  renderTotals(t = this.totals()) {
    const g = t.ms, areas = document.getElementById('kpw-areas');
    if (areas) {
      areas.innerHTML = [['Стены', g.walls], ['Фронтоны', g.gable], ['Эркеры', g.erkerArea], ['Цоколь', g.plinth]]
        .filter(([, v]) => v > 0).map(([a, v]) => `<dt>${a}</dt><dd>${kpNum(v)} м²</dd>`).join('')
        + `<dt class="big">Камня на фасад</dt><dd class="big">${kpNum(g.area)} м²</dd>`;
    }
    document.getElementById('kp-total').innerHTML = `<small>Под ключ${t.disc ? ` · скидка ${kpRub(t.disc)}` : ''}</small><b>${kpRub(t.total)}</b>`;
  },

  setPath(path, value) {
    const keys = path.split('.');
    let o = this.model;
    keys.slice(0, -1).forEach(k => { o = o[k] = o[k] || {}; });
    o[keys[keys.length - 1]] = value;
  },

  onInput(e) {
    const el = e.target;
    const num = el.type === 'number';
    const val = el.type === 'checkbox' ? el.checked : num ? (el.value === '' ? '' : +el.value) : el.value;
    if (el.dataset.k) {
      this.setPath(el.dataset.k, val);
      // Дом, проёмы, запас и срок меняют количества — пересчитаем, поля не трогаем
      if (this.step < 3) this.live();
      else if (/^(stock\.|days)/.test(el.dataset.k)) this.renderRows();
      else this.renderTotals();
      if (el.tagName === 'TEXTAREA') kpGrow(el);
    } else {
      const rowEl = el.closest('[data-row]');
      if (!rowEl) return;
      const id = rowEl.dataset.row, f = el.dataset.f;
      const list = rowEl.dataset.kind;
      if (list === 'custom' || list === 'customExtras') {
        const c = this.model[list].find(x => x.id === id);
        c[f] = val;
      } else {
        const o = this.model.rows[id] = this.model.rows[id] || {};
        o[f] = val;
        if (f === 'qty') o.manual = true;
      }
      if (f === 'on') rowEl.classList.toggle('off', !val);
      const r = this.findRow(id);
      if (r) rowEl.querySelector('[data-sum]').textContent = kpRub(r.qty * (r.m + r.w));
      this.renderTotals();
    }
    this.saveSoon();
  },

  findRow(id) {
    const t = this.totals();
    return [...t.items, ...t.extras].find(r => r.id === id);
  },

  // Шаги 1–2: стороны, кнопки − / +, эркеры, проёмы. Меняют состав экрана — перерисовка на месте
  onWizardClick(e) {
    const t = e.target.closest('[data-kp-step], [data-side], [data-inc], [data-dec], [data-add-erker], [data-del-erker], [data-erker-shape], [data-add-op], [data-del-op], [data-op-part]');
    if (!t) return false;
    const md = this.model, d = t.dataset;
    const done = (redraw) => { this.saveSoon(); redraw ? this.render(true) : this.live(); return true; };
    if (d.kpStep) { this.step = +d.kpStep; this.render(); return true; }
    if (d.side) {
      md.house.sides[d.side] = !md.house.sides[d.side];
      if (!Object.values(md.house.sides).some(Boolean)) md.house.sides[d.side] = true;  // хоть одна сторона
      return done();
    }
    if (d.inc || d.dec) {
      const path = d.inc || d.dec;
      const [lo, hi] = { 'house.floors': [1, 5], 'gables.n': [0, 4], 'house.cornersAdj': [-12, 12] }[path] || [0, 99];
      const cur = +path.split('.').reduce((o, k) => o[k], md) || 0;
      const next = Math.min(hi, Math.max(lo, cur + (d.inc ? 1 : -1)));
      this.setPath(path, next);
      // Фронтоны: поля размеров появляются и пропадают; этажи — эркер не выше дома
      if (path === 'gables.n' && (next === 0 || cur === 0)) return done(true);
      const out = t.parentElement.querySelector('output');
      if (out && path !== 'house.cornersAdj') out.textContent = next;
      return done();
    }
    if (d.addErker != null) { md.erkers.push({ shape: 'rect', w: 3, d: 1, floors: md.house.floors }); return done(true); }
    if (d.delErker) { md.erkers.splice(+d.delErker, 1); return done(true); }
    if (d.erkerShape) { const [i, k] = d.erkerShape.split(':'); md.erkers[+i].shape = k; return done(true); }
    if (d.addOp) {
      const parts = Object.fromEntries(KP_OP_PARTS.map(([k]) => [k, md.ops[0]?.[k] ?? k === 'reveals']));
      const type = KP_OP_TYPES[d.addOp];
      md.ops.push({ ...parts, ...type, n: 1, ...(type.kind === 'door' ? { sill: false, console: false } : {}) });
      return done(true);
    }
    if (d.delOp) { md.ops.splice(+d.delOp, 1); return done(true); }
    if (d.opPart) { const [i, k] = d.opPart.split(':'); md.ops[+i][k] = !md.ops[+i][k]; return done(true); }
    return false;
  },

  async onClick(e) {
    if (this.onWizardClick(e)) return;
    const rowEl = e.target.closest('[data-row]');
    const list = rowEl?.dataset.kind;
    const own = list === 'custom' || list === 'customExtras';
    const changed = () => { this.renderRows(); this.saveSoon(); };
    if (e.target.closest('[data-reset]') && rowEl) {
      e.preventDefault();
      delete this.model.rows[rowEl.dataset.row].manual;
      return changed();
    }
    // Правки позиции хранятся у неё самой (своя позиция) или в model.rows (встроенная)
    const target = () => own ? this.model[list].find(x => x.id === rowEl.dataset.row)
      : (this.model.rows[rowEl.dataset.row] = this.model.rows[rowEl.dataset.row] || {});
    if (e.target.closest('[data-edit]') && rowEl) {
      const saved = await this.editRow(this.findRow(rowEl.dataset.row), list === 'item' || list === 'custom');
      if (!saved) return;
      Object.assign(target(), saved);
      return changed();
    }
    const mv = e.target.closest('[data-move]');
    if (mv && rowEl) {
      const section = list === 'item' || list === 'custom' ? 'items' : 'extras';
      const t = this.totals();
      const ids = (section === 'items' ? t.items : t.extras).map(r => r.id);
      const i = ids.indexOf(rowEl.dataset.row), j = i + +mv.dataset.move;
      if (j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j], ids[i]];
      this.model.order = { ...(this.model.order || {}), [section]: ids };
      changed();
      document.querySelector(`[data-row="${ids[j]}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    if (e.target.closest('[data-del]') && rowEl) {
      if (own) this.model[list] = this.model[list].filter(c => c.id !== rowEl.dataset.row);
      else (this.model.rows[rowEl.dataset.row] = this.model.rows[rowEl.dataset.row] || {}).deleted = true;
      return changed();
    }
    const rs = e.target.closest('[data-restore]');
    if (rs) {
      (rs.dataset.restore === 'items' ? KP_ITEMS : KP_EXTRAS).forEach(d => { if (this.model.rows[d.id]) delete this.model.rows[d.id].deleted; });
      return changed();
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const name = await showPrompt('Новая позиция', '', 'Добавить', add.dataset.add === 'custom' ? 'Например, Сандрики над окнами' : 'Например, Аренда вышки');
      if (!name) return;
      this.model[add.dataset.add].push({ id: `c${Date.now()}`, name, unit: 'шт', qty: 1, m: 0, w: 0, on: true,
        ...(add.dataset.add === 'customExtras' ? { lm: 'Материал', lw: 'Работа' } : {}) });
      changed();
    }
  },

  // Окно «Изменить позицию»: название, подпись, материал из каталога, единица, как называются цены
  editRow(r, withMaterial) {
    const units = ['м²', 'п.м', 'шт', 'м³', 'кг', 'компл', 'рейс', 'объект', 'дн', 'час'];
    const labels = ['Материал', 'Работа', 'Услуга', 'Расход', 'Доставка', 'Аренда'];
    const sel = (id, list, cur) => `<select class="input" id="${id}">${[...new Set([cur, ...list])].map(u => `<option${u === cur ? ' selected' : ''}>${esc(u)}</option>`).join('')}</select>`;
    let mat = null;
    return new Promise((resolve) => {
      showModal(`
        <div class="kp-edit">
          <h3>Изменить позицию</h3>
          <label class="kp-field"><span>Название</span><input class="input" id="ke-name" value="${esc(r.name || '')}"></label>
          <label class="kp-field"><span>Подпись под названием</span><input class="input" id="ke-sub" value="${esc(r.sub || '')}" placeholder="Например, обрезки камня, упаковка"></label>
          ${withMaterial ? `<div class="kp-field"><span>Материал</span>
            <button class="kp-mat" id="ke-mat">${r.img ? `<img src="${r.img}" alt="">` : ''}<b>${esc(r.sub || 'Выбрать из каталога')}</b><i>Сменить</i></button></div>` : ''}
          <div class="kp-grid kp-grid--3">
            <label class="kp-field"><span>Единица</span>${sel('ke-unit', units, r.unit || 'шт')}</label>
            <label class="kp-field"><span>Первая цена</span>${sel('ke-lm', labels, r.lm || 'Материал')}</label>
            <label class="kp-field"><span>Вторая цена</span>${sel('ke-lw', labels, r.lw || 'Работа')}</label>
          </div>
          <div class="user-edit__actions">
            <button class="btn btn-secondary btn-full" id="ke-cancel">Отмена</button>
            <button class="btn btn-primary btn-full" id="ke-save">Сохранить</button>
          </div>
        </div>`);
      const done = (v) => { closeModal(); resolve(v); };
      document.getElementById('ke-cancel').addEventListener('click', () => done(null));
      document.getElementById('ke-mat')?.addEventListener('click', async () => {
        const picked = await kpPickMaterial(this.stones, this.catalog);
        if (!picked) return;
        mat = picked;
        const b = document.getElementById('ke-mat');
        b.innerHTML = `<img src="${picked.img}" alt=""><b>${esc(picked.label)}</b><i>Сменить</i>`;
        document.getElementById('ke-sub').value = picked.label;
      });
      document.getElementById('ke-save').addEventListener('click', () => done({
        name: document.getElementById('ke-name').value.trim() || r.name,
        sub: document.getElementById('ke-sub').value.trim(),
        unit: document.getElementById('ke-unit').value,
        lm: document.getElementById('ke-lm').value,
        lw: document.getElementById('ke-lw').value,
        ...(mat ? { mat: { kind: mat.kind, id: mat.id } } : {}),
      }));
    });
  },

  // Черновик КП у проекта — сохраняется сам
  saveSoon() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => Api.projectKp(this.projectId, this.model).catch(() => {}), 800);
  },

  // Свои цены, контакты и условия прораба — для следующих КП
  async rememberMine() {
    const prices = { ...(this.mine.prices || {}) };
    for (const [id, o] of Object.entries(this.model.rows)) {
      if (o.m != null || o.w != null) prices[id] = { m: o.m ?? prices[id]?.m, w: o.w ?? prices[id]?.w };
    }
    this.mine = { ...this.mine, prices, profile: this.model.profile, terms: this.model.terms };
    await Api.kpProfile({ prices, profile: this.model.profile, terms: this.model.terms });
  },

  // === PDF ===
  async makePdf() {
    const btn = document.getElementById('kp-make');
    if (!this.model.profile.phone) {
      showToast('Укажите свой телефон — заказчик позвонит по нему');
      document.querySelector('[data-k="profile.phone"]')?.focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Собираю PDF…';
    try {
      clearTimeout(this.saveTimer);
      const saved = await Api.projectKp(this.projectId, this.model, true);
      this.model.number = saved.data.number;
      await this.rememberMine();
      const file = await kpBuildPdf(this);
      this.showReady(file);
    } catch (e) {
      console.error(e);
      showToast(e.message || 'Не удалось собрать PDF');
    } finally {
      btn.disabled = false;
      btn.textContent = this.step < 3 ? 'Далее' : 'Создать PDF';
    }
  },

  // Отправить — отдельным нажатием: телефон разрешает «Поделиться» только сразу после нажатия
  showReady(file) {
    const url = URL.createObjectURL(file);
    showModal(`
      <div class="kp-ready">
        <div class="kp-ready__icon">PDF</div>
        <h3>КП готово</h3>
        <p>${esc(file.name)} · ${(file.size / 1024 / 1024).toFixed(1)} МБ</p>
        <button class="btn btn-primary btn-full" id="kp-share">${icon('share')}Отправить заказчику</button>
        <a class="btn btn-secondary btn-full" href="${url}" download="${esc(file.name)}" target="_blank">Открыть / скачать</a>
      </div>`);
    document.getElementById('kp-share').addEventListener('click', async () => {
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: file.name });
        else window.open(url, '_blank');
      } catch (e) { /* отменили — ничего */ }
    });
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('kp-content');
    box.addEventListener('input', e => this.onInput(e));
    box.addEventListener('change', e => { if (e.target.type === 'checkbox') this.onInput(e); });
    box.addEventListener('click', e => this.onClick(e));
    document.getElementById('kp-back').addEventListener('click', () => openProject(this.projectId, this.variant?.id));
    // Кнопка внизу: «Далее» на шагах 1–2, «Создать PDF» на смете
    document.getElementById('kp-make').addEventListener('click', () => {
      if (this.step < 3) { this.step++; this.saveSoon(); return this.render(); }
      this.makePdf();
    });
  },
};

// Выбор материала: весь каталог — камень и изделия по разделам. Вернёт { kind, id, img, label } или null
function kpPickMaterial(stones, catalog) {
  return new Promise((resolve) => {
    const tabs = [{ id: 'stone', title: 'Камень' }, ...catalog.sections.map(s => ({ id: s.id, title: s.title }))];
    const overlay = document.createElement('div');
    overlay.className = 'kp-pick';
    overlay.innerHTML = `
      <div class="kp-pick__head"><b>Материал из каталога</b><button class="viewer__btn" data-close aria-label="Закрыть">✕</button></div>
      <div class="kp-pick__tabs">${tabs.map((t, i) => `<button data-tab="${t.id}" class="${i ? '' : 'active'}">${esc(t.title)}</button>`).join('')}</div>
      <div class="kp-pick__grid" id="kp-pick-grid"></div>`;
    document.body.appendChild(overlay);
    const grid = overlay.querySelector('#kp-pick-grid');
    const show = (tab) => {
      overlay.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      const items = tab === 'stone'
        ? stones.map(s => ({ kind: 'stone', id: s.id, img: s.texture, label: s.name }))
        : (catalog.sections.find(s => s.id === tab)?.items || []).flatMap(it => it.variants.map(v => ({ kind: 'product', id: v.id, img: v.image, label: `${it.name}${v.size ? ` · ${v.size}` : ''}` })));
      grid.innerHTML = items.map((it, i) => `<button class="kp-pick__item${it.kind === 'product' ? ' prod' : ''}" data-i="${i}"><img src="${it.img}" alt="" loading="lazy"><span>${esc(it.label)}</span></button>`).join('');
      grid._items = items;
      grid.scrollTop = 0;
    };
    show('stone');
    const done = (v) => { overlay.remove(); resolve(v); };
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) return done(null);
      const t = e.target.closest('[data-tab]');
      if (t) return show(t.dataset.tab);
      const it = e.target.closest('[data-i]');
      if (it) done(grid._items[+it.dataset.i]);
    });
  });
}

function kpGrow(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

function onScreenKp() {
  if (!KP.projectId) return Router.navigateTo('projects');
  KP.bind();
  KP.load().catch(e => {
    document.getElementById('kp-content').innerHTML = `<p class="configure-hint">${esc(e.message || 'Не удалось загрузить')}</p>`;
  });
}

// === Сборка PDF: jsPDF рисует листы 390×844 (как экран телефона) векторно ===
// Текст — настоящий (шрифт Inter вшит): ровный, чёткий при увеличении, копируется. Фото — картинки
// с водяным знаком; скруглённые углы фото и значков запекаются в саму картинку.

const KPC = { ink: '#1f1b16', muted: '#857b6f', line: '#ebe4d9', paper: '#f7f4ef', card: '#ffffff', gold: '#c9a86a', goldD: '#a8843f',
  dark: '#2b2620', yellow: '#f3cd55', chip: '#f3ede3', sub: '#5a5249', green: '#2e7d32', promo: '#2f2821', promoBox: '#41382e' };
const KPW = 390, KPH = 844, KPM = 18, KPCW = 354;

function kpLoadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Не загрузилась библиотека PDF — проверьте интернет'));
    document.head.appendChild(s);
  });
}

function kpLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не загрузилось фото'));
    img.src = src;
  });
}

async function kpFontBase64(url) {
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let s = '';
  for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
  return btoa(s);
}

// Холст с картинкой ровно под рамку: cover — обрезать, contain — вписать; углы скруглены на цвете фона
function kpCanvas(w, h, scale = 3) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  const g = c.getContext('2d');
  g.scale(scale, scale);
  return { c, g };
}

function kpRoundClip(g, w, h, r) {
  g.beginPath();
  g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r);
  g.closePath();
  g.clip();
}

async function kpPicture(src, w, h, { r = 0, bg = KPC.paper, fill = '#ffffff', mode = 'cover', png = false } = {}) {
  if (!src) return null;
  try {
    const img = typeof src === 'string' ? await kpLoadImage(src) : src;
    const { c, g } = kpCanvas(w, h);
    if (!png) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
    if (r) kpRoundClip(g, w, h, r);
    g.fillStyle = fill;
    g.fillRect(0, 0, w, h);
    const s = mode === 'cover' ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height) * 0.9;
    g.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
    return png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
  } catch (e) {
    return null;
  }
}

// Фото 4:3 с водяным знаком «Fasad AI · имя · телефон» и плашкой «Сделано в Fasad AI»
async function kpWatermark(src, text, icon) {
  const img = await kpLoadImage(src);
  const W = 1200, H = 900;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const s = Math.max(W / img.width, H / img.height);
  g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(-28 * Math.PI / 180);
  g.font = `700 ${Math.round(W * 0.024)}px -apple-system, system-ui, sans-serif`;
  g.fillStyle = 'rgba(255,255,255,0.26)';
  const tw = g.measureText(text).width + 120;
  for (let y = -H * 1.2, k = 0; y < H * 1.2; y += W * 0.12, k++) {
    for (let x = -W * 1.4 - (k % 2) * tw / 2; x < W * 1.4; x += tw) g.fillText(text, x, y);
  }
  g.restore();
  // Плашка: одинаковый отступ 10 вокруг иконки, текст по центру по высоте, справа отступ как у иконки + 10
  const pad = 10, is = 44, bh = is + pad * 2, label = 'Сделано в Fasad AI';
  g.font = '700 26px -apple-system, system-ui, sans-serif';
  const bw = pad + is + 14 + g.measureText(label).width + pad + 12;
  const bx = W - bw - 24, by = H - bh - 24;
  g.save();
  g.fillStyle = 'rgba(30,26,22,0.72)';
  g.translate(bx, by);
  kpRoundClip(g, bw, bh, bh / 2);
  g.fillRect(0, 0, bw, bh);
  g.restore();
  if (icon) {
    g.save();
    g.translate(bx + pad, by + pad);
    kpRoundClip(g, is, is, is / 2);
    g.drawImage(icon, 0, 0, is, is);
    g.restore();
  }
  g.fillStyle = '#ffffff';
  g.textBaseline = 'middle';
  g.fillText(label, bx + pad + is + 14, by + bh / 2 + 1);
  return c;
}

// Карандаш PDF: шрифты, цвета, текст с переносом, плашки, карточки
class KpDraw {
  constructor(pdf) {
    this.pdf = pdf;
  }

  font(weight, size, color = KPC.ink) {
    this.pdf.setFont({ r: 'InterR', s: 'InterS', b: 'InterB' }[weight], 'normal');
    this.pdf.setFontSize(size);
    this.pdf.setTextColor(color);
    this.size = size;
  }

  // Разделители тысяч в рублях — обычный пробел (в шрифте нет узких пробелов)
  clean(t) {
    return String(t ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\u2212/g, '-');
  }

  lines(t, w) {
    return w ? this.pdf.splitTextToSize(this.clean(t), w) : [this.clean(t)];
  }

  // Текст от верхнего края; вернёт высоту
  text(t, x, y, { w, align = 'left', lh = 1.32, space = 0 } = {}) {
    const ls = this.lines(t, w);
    const ax = align === 'right' ? x + (w || 0) : align === 'center' ? x + (w || 0) / 2 : x;
    this.pdf.text(ls, ax, y, { baseline: 'top', align, lineHeightFactor: lh, charSpace: space });
    return ls.length * this.size * lh;
  }

  height(t, w, lh = 1.32) {
    return this.lines(t, w).length * this.size * lh;
  }

  width(t) {
    return this.pdf.getTextWidth(this.clean(t));
  }

  box(x, y, w, h, r, fill, stroke) {
    if (fill) this.pdf.setFillColor(fill);
    if (stroke) { this.pdf.setDrawColor(stroke); this.pdf.setLineWidth(1); }
    this.pdf.roundedRect(x, y, w, h, r, r, fill && stroke ? 'FD' : fill ? 'F' : 'S');
  }

  card(x, y, w, h) {
    this.box(x, y, w, h, 16, KPC.card, KPC.line);
  }

  hline(x, y, w, color = KPC.line) {
    this.pdf.setDrawColor(color);
    this.pdf.setLineWidth(1);
    this.pdf.line(x, y, x + w, y);
  }

  alpha(a, fn) {
    this.pdf.saveGraphicsState();
    this.pdf.setGState(new this.pdf.GState({ opacity: a }));
    fn();
    this.pdf.restoreGraphicsState();
  }

  // Тёмная плашка поверх фото
  chip(t, x, y) {
    this.font('b', 12, '#ffffff');
    const w = this.width(t) + 22;
    this.alpha(0.6, () => this.box(x, y, w, 24, 12, '#000000'));
    this.font('b', 12, '#ffffff');
    this.text(t, x + 11, y + 6);
  }

  // Кружок с цифрой или инициалами
  badge(t, cx, cy, r, fill, size) {
    this.pdf.setFillColor(fill);
    this.pdf.circle(cx, cy, r, 'F');
    this.font('b', size, '#ffffff');
    this.pdf.text(this.clean(t), cx, cy, { align: 'center', baseline: 'middle' });
  }

  image(data, x, y, w, h, fmt = 'JPEG') {
    if (data) this.pdf.addImage(data, fmt, x, y, w, h, undefined, 'FAST');
  }

  link(x, y, w, h, url) {
    this.pdf.link(x, y, w, h, { url });
  }
}

async function kpBuildPdf(kp) {
  if (!window.jspdf) await kpLoadScript('js/vendor/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'pt', format: [KPW, KPH], compress: true });
  const [fr, fs, fb] = await Promise.all(['Regular', 'SemiBold', 'Bold'].map(w => kpFontBase64(`assets/fonts/Inter-${w}.ttf`)));
  [['InterR', fr], ['InterS', fs], ['InterB', fb]].forEach(([n, d]) => { pdf.addFileToVFS(`${n}.ttf`, d); pdf.addFont(`${n}.ttf`, n, 'normal'); });

  const md = kp.model, pf = md.profile, t = kp.totals();
  const iconImg = await kpLoadImage('assets/kp-app-icon.png');
  const wm = `Fasad AI  ·  ${pf.name}  ·  ${pf.phone}`;
  const icon = await kpPicture(iconImg, 30, 30, { r: 8, png: true });
  const iconBig = await kpPicture(iconImg, 92, 92, { r: 24, png: true });
  const qr = await kpPicture('assets/kp-qr.png', 92, 92, { mode: 'contain', fill: '#ffffff', bg: '#ffffff' });
  const rows = t.items.filter(r => r.on);
  const extras = t.extras.filter(r => r.on);
  const thumbs = {};
  await Promise.all(rows.map(async r => {
    thumbs[r.id] = await kpPicture(r.img, 48, 38, { r: 8, bg: KPC.card, mode: r.imgKind === 'product' ? 'contain' : 'cover' });
  }));

  const d = new KpDraw(pdf);
  let y = 0, pageNo = 0;
  const bottom = KPH - 22;
  const newPage = (dark = false) => {
    if (pageNo++) pdf.addPage([KPW, KPH]);
    d.box(0, 0, KPW, KPH, 0, dark ? KPC.promo : KPC.paper);
    d.image(icon, KPM, 18, 30, 30, 'PNG');
    d.font('b', 15, dark ? '#ffffff' : KPC.ink);
    d.text('Fasad AI', KPM + 39, 25);
    y = 64;
  };
  const h2 = (title, small) => {
    d.font('b', 22);
    y += d.text(title, KPM, y);
    if (small) { d.font('r', 13, KPC.muted); y += d.text(small, KPM, y + 1) + 2; }
    y += 10;
  };
  const ensure = (h, title) => {
    if (y + h <= bottom + 8) return;
    newPage();
    h2(title, 'продолжение');
  };

  const date = new Date();
  const valid = new Date(date.getTime() + (+md.terms.valid || 14) * 864e5).toLocaleDateString('ru-RU');
  const num = `КП-${date.getFullYear()}-${String(kp.projectId).padStart(3, '0')}${md.number > 1 ? `-${md.number}` : ''}`;

  // 1. Обложка — без цены: заказчик сначала смотрит, за что платит
  newPage();
  d.font('b', 12, KPC.goldD);
  y += d.text('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', KPM, y, { space: 0.6 }) + 4;
  d.font('b', 27);
  y += d.text('Облицовка фасада натуральным камнем', KPM, y, { w: KPCW, lh: 1.12 }) + 8;
  if (md.client.name) {
    d.font('r', 13, KPC.muted);
    d.text('Заказчик: ', KPM, y);
    const lw = d.width('Заказчик: ');
    d.font('s', 13, KPC.ink);
    y += d.text(md.client.name, KPM + lw, y, { w: KPCW - lw });
  }
  d.font('r', 13, KPC.muted);
  y += d.text(`${md.client.object || ''} · ${num} от ${date.toLocaleDateString('ru-RU')}`, KPM, y, { w: KPCW }) + 12;
  // Сразу было и будет: заказчик видит результат на первом листе
  const ph = Math.min(236, (KPH - 14 - 78 - 14 - y - 8) / 2);
  const ph2 = await kpPicture(await kpWatermark(kp.variant?.generated_image || kp.project.original_image, wm, iconImg), KPCW, ph, { r: 16 });
  const pb2 = await kpPicture(await kpWatermark(kp.project.original_image, wm, iconImg), KPCW, ph, { r: 16 });
  d.image(ph2, KPM, y, KPCW, ph);
  d.chip('Так будет выглядеть ваш дом', KPM + 10, y + 10);
  y += ph + 8;
  d.image(pb2, KPM, y, KPCW, ph);
  d.chip('Сейчас', KPM + 10, y + 10);
  const py = KPH - 14 - 78;
  d.card(KPM, py, KPCW, 78);
  d.badge(initials(pf.name), KPM + 16 + 23, py + 39, 23, KPC.goldD, 17);
  d.font('b', 16);
  d.text(pf.name, KPM + 78, py + 20, { w: KPCW - 94 });
  d.font('r', 12.5, KPC.muted);
  d.text([pf.company, pf.city, pf.exp].filter(Boolean).join(' · '), KPM + 78, py + 42, { w: KPCW - 94 });

  // 4. Смета: карточка на позицию — материал, работа, итог
  const line = (label, calc, sum, yy, size = 13) => {
    d.hline(KPM + 14, yy, KPCW - 28);
    d.font('s', size, KPC.goldD);
    d.text(label, KPM + 14, yy + 7);
    d.font('r', size, KPC.muted);
    d.text(calc, KPM + 90, yy + 7, { w: 150 });
    d.font('s', size);
    d.text(sum, KPM + 14, yy + 7, { w: KPCW - 28, align: 'right' });
  };
  const posCard = (r) => {
    const qty = `${kpNum(r.qty)} ${kpUnit(r.unit, r.qty)}`;
    d.font('s', 12.5);
    const chipW = d.width(qty) + 18;
    const img = thumbs[r.id] ? 58 : 0;
    const tw = KPCW - 28 - img - chipW - 10;
    d.font('b', 15);
    const nameH = d.height(r.name || 'Позиция', tw, 1.2);
    d.font('r', 11.5);
    const subH = r.sub ? d.height(r.sub, tw, 1.3) : 0;
    const headH = Math.max(38, nameH + subH + 2);
    const nl = (r.m ? 1 : 0) + (r.w ? 1 : 0);
    const h = 12 + headH + 8 + nl * 30 + 4 + 34 + 12;
    return { h, draw: () => {
      d.card(KPM, y, KPCW, h);
      let yy = y + 12;
      if (img) d.image(thumbs[r.id], KPM + 14, yy + (headH - 38) / 2, 48, 38);
      const tx = KPM + 14 + img;
      d.font('b', 15);
      d.text(r.name || 'Позиция', tx, yy, { w: tw, lh: 1.2 });
      if (r.sub) { d.font('r', 11.5, KPC.muted); d.text(r.sub, tx, yy + nameH + 2, { w: tw, lh: 1.3 }); }
      d.box(KPM + KPCW - 14 - chipW, yy + (headH - 22) / 2, chipW, 22, 11, KPC.chip);
      d.font('s', 12.5);
      d.text(qty, KPM + KPCW - 14 - chipW, yy + (headH - 22) / 2 + 5, { w: chipW, align: 'center' });
      yy += headH + 8;
      if (r.m) { line(r.lm || 'Материал', `${kpNum(r.qty)} × ${kpRub(r.m)}`, kpRub(r.qty * r.m), yy); yy += 30; }
      if (r.w) { line(r.lw || 'Работа', `${kpNum(r.qty)} × ${kpRub(r.w)}`, kpRub(r.qty * r.w), yy); yy += 30; }
      yy += 4;
      d.box(KPM + 14, yy, KPCW - 28, 34, 10, KPC.chip);
      d.font('r', 13.5);
      d.text('Итого по позиции', KPM + 26, yy + 10);
      d.font('b', 15);
      d.text(kpRub(r.qty * (r.m + r.w)), KPM + 26, yy + 9, { w: KPCW - 52, align: 'right' });
    } };
  };
  if (rows.length) {
    newPage();
    h2('Смета', 'материал и работа по каждой позиции');
    for (const r of rows) {
      const c = posCard(r);
      ensure(c.h, 'Смета');
      c.draw();
      y += c.h + 10;
    }
  }

  // 5. Дополнительно — компактные карточки
  const extraSum = extras.reduce((s, r) => s + r.qty * (r.m + r.w), 0);
  if (extras.length) {
    newPage();
    h2('Дополнительно', 'без этого не обойтись');
    for (const r of extras) {
      const unit = kpUnit(r.unit, r.qty);
      const tw = KPCW - 28 - 110;
      d.font('r', 11.5);
      const subH = r.sub ? d.height(r.sub, tw, 1.3) : 0;
      const nl = (r.m ? 1 : 0) + (r.w ? 1 : 0);
      const h = 9 + 18 + subH + 4 + nl * 24 + 6;
      ensure(h, 'Дополнительно');
      d.card(KPM, y, KPCW, h);
      d.font('b', 14);
      d.text(r.name, KPM + 14, y + 10, { w: tw });
      d.text(kpRub(r.qty * (r.m + r.w)), KPM + 14, y + 10, { w: KPCW - 28, align: 'right' });
      if (r.sub) { d.font('r', 11.5, KPC.muted); d.text(r.sub, KPM + 14, y + 29, { w: tw, lh: 1.3 }); }
      let yy = y + 9 + 18 + subH + 4;
      if (r.m) { line(r.lm || 'Материал', `${kpNum(r.qty)} ${unit} × ${kpRub(r.m)}`, kpRub(r.qty * r.m), yy, 12); yy += 24; }
      if (r.w) { line(r.lw || 'Работа', `${kpNum(r.qty)} ${unit} × ${kpRub(r.w)}`, kpRub(r.qty * r.w), yy, 12); yy += 24; }
      y += h + 6;
    }
    ensure(44, 'Дополнительно');
    y += 4;
    d.box(KPM, y, KPCW, 40, 12, '#efe7da');
    d.font('b', 15);
    d.text('Дополнительные работы', KPM + 14, y + 12);
    d.text(kpRub(extraSum), KPM + 14, y + 12, { w: KPCW - 28, align: 'right' });
  }

  // 6. Итог
  const groups = {};
  rows.forEach(r => { groups[r.group] = (groups[r.group] || 0) + r.qty * (r.m + r.w); });
  if (extraSum) groups['Дополнительные работы'] = extraSum;
  const listCard = (pairs, opts = {}) => {
    const rh = opts.rh || 36;
    const h = pairs.length * rh + 12;
    d.card(KPM, y, KPCW, h);
    pairs.forEach(([a, b, color], i) => {
      const yy = y + 6 + i * rh;
      if (i) d.hline(KPM + 16, yy, KPCW - 32);
      d.font('r', 14.5, color || KPC.ink);
      d.text(a, KPM + 16, yy + (rh - 19) / 2, { w: 220 });
      d.font('s', 14.5, color || KPC.ink);
      d.text(b, KPM + 16, yy + (rh - 19) / 2, { w: KPCW - 32, align: 'right' });
    });
    y += h + 10;
  };
  const days = +md.days || t.ms.days;  // свой срок прораба или посчитанный по площади
  newPage();
  h2('Итог');
  listCard(Object.entries(groups).map(([g, v]) => [g, kpRub(v)]));
  [['Материалы и доставка', t.mat], ['Работы и услуги', t.work]].forEach(([l, v], i) => {
    const x = KPM + i * 182;
    d.card(x, y, 172, 56);
    d.font('r', 12, KPC.muted);
    d.text(l, x + 14, y + 11);
    d.font('b', 17);
    d.text(kpRub(v), x + 14, y + 29);
  });
  y += 66;
  listCard([['Всего', kpRub(t.sum)], ...(t.disc ? [[`Скидка ${kpNum(md.discount)}%`, `−${kpRub(t.disc)}`, KPC.green]] : [])]);
  d.box(KPM, y, KPCW, 112, 16, KPC.dark);
  d.font('r', 12, '#bdb3a6');
  d.text('Под ключ', KPM + 18, y + 16);
  d.font('b', 32, KPC.yellow);
  d.text(kpRub(t.total), KPM + 18, y + 34);
  d.font('r', 13, '#e3dbd0');
  d.text(`${kpNum(t.ms.area)} м² фасада · ${days} рабочих дней`, KPM + 18, y + 80);

  // 7. Сроки и оплата, кнопки связи
  newPage();
  h2('Сроки и оплата');
  const weeks = Math.max(2, Math.ceil(days / 5));
  const wall = 1 + Math.max(1, Math.ceil((weeks - 1) * 0.6));
  const tl = [['Неделя 1', 'поставка камня, леса, сетка'], [`Недели 2–${wall}`, 'стены, цоколь, углы'],
    [wall + 1 < weeks ? `Недели ${wall + 1}–${weeks}` : `Неделя ${weeks}`, 'окна, карнизы, откосы'], ['Сдача', 'уборка, вывоз мусора, приёмка']];
  d.card(KPM, y, KPCW, tl.length * 28 + 16);
  tl.forEach(([a, b], i) => {
    const yy = y + 12 + i * 28;
    d.pdf.setFillColor(KPC.gold);
    d.pdf.circle(KPM + 22, yy + 9, 5, 'F');
    d.font('s', 13.5);
    d.text(a, KPM + 36, yy + 1);
    d.font('r', 13.5, KPC.muted);
    d.text(b, KPM + 132, yy + 1, { w: KPCW - 148 });
  });
  y += tl.length * 28 + 26;
  const stages = [['Аванс на камень и леса', 0.5], ['После облицовки стен и цоколя', 0.3], ['После сдачи фасада', 0.2]];
  listCard(stages.map(([s, p]) => [`${Math.round(p * 100)}% · ${s}`, kpRub(t.total * p)]), { rh: 40 });
  const terms = [['Оплата', md.terms.payment || ''], ['Гарантия', md.terms.guarantee || ''], ['Предложение действует', `${+md.terms.valid || 14} дней, до ${valid}`]];
  d.font('r', 12);
  const th = terms.map(([, b]) => 22 + d.height(b, KPCW - 32, 1.3) + 10);
  d.card(KPM, y, KPCW, th.reduce((a, b) => a + b, 0) + 8);
  let ty = y + 8;
  terms.forEach(([a, b], i) => {
    if (i) d.hline(KPM + 16, ty, KPCW - 32);
    d.font('s', 14);
    d.text(a, KPM + 16, ty + 8);
    d.font('r', 12, KPC.muted);
    d.text(b, KPM + 16, ty + 27, { w: KPCW - 32, lh: 1.3 });
    ty += th[i];
  });
  y = ty + 18;
  const phone = pf.phone.replace(/[^\d+]/g, '');
  d.box(KPM, y, KPCW, 48, 14, KPC.goldD);
  d.font('b', 15, '#ffffff');
  d.text(`Позвонить: ${pf.phone}`, KPM, y + 15, { w: KPCW, align: 'center' });
  d.link(KPM, y, KPCW, 48, `tel:${phone}`);
  y += 57;
  const tg = pf.telegram ? pf.telegram.replace(/^@|https?:\/\/t\.me\//g, '') : '';
  if (tg) {
    d.box(KPM, y, KPCW, 48, 14, KPC.card, KPC.line);
    d.font('b', 15);
    d.text('Написать в Telegram', KPM, y + 15, { w: KPCW, align: 'center' });
    d.link(KPM, y, KPCW, 48, `https://t.me/${tg}`);
  }

  // 8. Реклама Fasad AI
  newPage(true);
  d.image(iconBig, (KPW - 92) / 2, 90, 92, 92, 'PNG');
  y = 200;
  d.font('b', 30, '#ffffff');
  y += d.text('Этот проект сделан', 0, y, { w: KPW, align: 'center', lh: 1.15 });
  const w1 = d.width('в ');
  d.font('b', 30, KPC.yellow);
  const w2 = d.width('Fasad AI');
  d.font('b', 30, '#ffffff');
  d.text('в ', (KPW - w1 - w2) / 2, y, { lh: 1.15 });
  d.font('b', 30, KPC.yellow);
  y += d.text('Fasad AI', (KPW - w1 - w2) / 2 + w1, y, { lh: 1.15 }) + 8;
  d.font('r', 14, '#d8cfc3');
  y += d.text('Фото дома → выбор камня → готовая картинка за 30 секунд', 30, y, { w: KPW - 60, align: 'center', lh: 1.4 }) + 16;
  ['Прорабам: покажите заказчику его дом в камне ещё до начала работ', 'Каталог дагестанского камня, карнизов, наличников, колонн и балюстрад',
    'ИИ рисует облицовку прямо на вашем фото — несколько вариантов', 'Коммерческое предложение со сметой — за пару минут'].forEach(s => {
    d.font('r', 14, '#ffffff');
    const h = d.height(s, KPCW - 28, 1.35) + 24;
    d.box(KPM, y, KPCW, h, 14, KPC.promoBox);
    d.font('r', 14, '#ffffff');
    d.text(s, KPM + 14, y + 12, { w: KPCW - 28, lh: 1.35 });
    y += h + 10;
  });
  const qy = KPH - 22 - 40 - 120;
  d.box(KPM, qy, KPCW, 120, 16, '#ffffff');
  d.image(qr, KPM + 14, qy + 14, 92, 92);
  d.font('b', 16);
  d.text('Попробуйте бесплатно', KPM + 120, qy + 16);
  d.font('r', 12.5, KPC.muted);
  d.text('Наведите камеру на код или откройте ahmedov.online/fasad', KPM + 120, qy + 38, { w: KPCW - 134, lh: 1.35 });
  d.font('b', 12, KPC.dark);
  const gw = d.width('3 генерации в подарок') + 20;
  d.box(KPM + 120, qy + 84, gw, 22, 11, KPC.yellow);
  d.font('b', 12, KPC.dark);
  d.text('3 генерации в подарок', KPM + 130, qy + 89);
  d.link(KPM, qy, KPCW, 120, 'https://ahmedov.online/fasad/');
  d.font('r', 11, '#a99f92');
  d.text('Визуализация создана ИИ и может немного отличаться от готового фасада. Фото защищены водяным знаком.', 30, KPH - 52, { w: KPW - 60, align: 'center', lh: 1.4 });

  // Номера листов
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    d.font('s', 11, i === total ? '#a99f92' : KPC.muted);
    d.text(`${i} / ${total}`, KPM, 27, { w: KPCW, align: 'right' });
  }

  const name = `КП ${md.client.name || kp.project.name || 'фасад'}.pdf`.replace(/[\\/:*?"<>|]/g, '');
  return new File([pdf.output('blob')], name, { type: 'application/pdf' });
}
