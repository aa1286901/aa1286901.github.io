// === Редактор разметки фасада ===
// Прораб ставит на фото зоны облицовки (стена, цоколь, откос, мощение), проёмы с наличниками,
// карнизы и изделия из каталога (русты, колонны, пилястры, балюстрады, замки, розетки...).
// Все координаты хранятся в пикселях уменьшенного фото, размеры камня — в миллиметрах.

const EDITOR_MAX_SIDE = 1600;   // итоговый набросок
const PREVIEW_MAX_SIDE = 800;   // быстрый предпросмотр во время правок
const SVG_NS = 'http://www.w3.org/2000/svg';
const HISTORY_LIMIT = 50;

const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s ?? '').replace(/[&"<>]/g, c => `&#${c.charCodeAt(0)};`);

// Что можно добавить на фасад: значок, название и как создаётся
const ADD_MENU = [
  { title: 'Облицовка', items: [
    { key: 'wall', icon: 'wall', name: 'Стена' },
    { key: 'base', icon: 'base', name: 'Цоколь' },
    { key: 'reveal', icon: 'reveal', name: 'Откос' },
    { key: 'paving', icon: 'paving', name: 'Мощение' },
  ] },
  { title: 'Проёмы', items: [
    { key: 'opening', icon: 'opening', name: 'Окно / дверь' },
  ] },
  { title: 'Карнизы и пояса', items: [
    { key: 'band:cornice', icon: 'cornice', name: 'Карниз' },
    { key: 'band:plinth', icon: 'plinth', name: 'Плинтус' },
    { key: 'band:sill', icon: 'sill', name: 'Подоконник' },
  ] },
  { title: 'Изделия', items: [
    { key: 'sprite:rust', icon: 'rust', name: 'Русты' },
    { key: 'sprite:pilaster', icon: 'pilaster', name: 'Пилястра' },
    { key: 'sprite:column', icon: 'column', name: 'Колонна' },
    { key: 'balustrade', icon: 'balustrade', name: 'Балюстрада' },
    { key: 'sprite:keystone', icon: 'keystone', name: 'Замок' },
    { key: 'sprite:console', icon: 'console', name: 'Консоль' },
    { key: 'sprite:rosette', icon: 'rosette', name: 'Розетка' },
    { key: 'sprite:barelief', icon: 'barelief', name: 'Барельеф' },
    { key: 'sprite:panel', icon: 'panel', name: 'Панно' },
    { key: 'sprite:finial', icon: 'finial', name: 'Навершие' },
    { key: 'sprite:capital', icon: 'capital', name: 'Капитель' },
  ] },
];

const GROUP_INFO = {
  rust: { icon: 'rust', name: 'Русты' },
  pilaster: { icon: 'pilaster', name: 'Пилястра' },
  column: { icon: 'column', name: 'Колонна' },
  keystone: { icon: 'keystone', name: 'Замок' },
  console: { icon: 'console', name: 'Консоль' },
  rosette: { icon: 'rosette', name: 'Розетка' },
  barelief: { icon: 'barelief', name: 'Барельеф' },
  panel: { icon: 'panel', name: 'Панно' },
  finial: { icon: 'finial', name: 'Навершие' },
  capital: { icon: 'capital', name: 'Капитель' },
  baluster: { icon: 'balustrade', name: 'Балясина' },
  post: { icon: 'balustrade', name: 'Тумба' },
};

const BAND_INFO = {
  cornice: { icon: 'cornice', name: 'Карниз' },
  plinth: { icon: 'plinth', name: 'Плинтус' },
  sill: { icon: 'sill', name: 'Подоконник' },
};

const ZONE_ICONS = { wall: 'wall', base: 'base', reveal: 'reveal', paving: 'paving', opening: 'opening' };
const DEFAULT_STONE = 'akushinskiy-kremovyy';
const DEFAULT_DECOR_STONE = 'akushinskiy-belyy';

// Каталог изделий из data/elements.json
const Elements = {
  data: null,
  async load() {
    if (this.data) return this.data;
    const res = await fetch('data/elements.json');
    const raw = await res.json();
    this.data = {
      sprites: Object.fromEntries(raw.sprites.map(s => [s.id, s])),
      bands: Object.fromEntries(raw.bands.map(b => [b.id, b])),
      spriteList: raw.sprites,
      bandList: raw.bands,
    };
    return this.data;
  },
};

const Editor = {
  photo: null,          // canvas с фото (EDITOR_MAX_SIDE)
  preview: null,        // canvas с фото (PREVIEW_MAX_SIDE)
  design: null,
  selectedId: null,
  selectedHandle: null,
  materials: {},
  materialList: [],
  elements: null,
  lastChoice: {},       // последние настройки для каждого типа: новая зона сразу с тем же камнем
  history: [],
  future: [],
  zoom: { k: 1, x: 0, y: 0 },
  pointers: new Map(),
  hidden: false,
  renderTimer: null,
  renderToken: 0,
  bound: false,

  async open() {
    const photo = ProjectFlow.getState('originalPhoto');
    if (!photo) {
      Router.navigateTo('photo');
      return;
    }

    this.bind();
    await this.loadCatalog();

    const img = await this.loadImage(photo);
    this.photo = this.scaleToCanvas(img, EDITOR_MAX_SIDE);
    this.preview = this.scaleToCanvas(img, PREVIEW_MAX_SIDE);

    // Фото храним уже уменьшенным: так черновик помещается в память телефона
    if (photo.startsWith('data:') && photo.length > 600000) {
      ProjectFlow.setState('originalPhoto', this.photo.toDataURL('image/jpeg', 0.88));
    }

    const draft = ProjectFlow.getState('design');
    this.design = draft && draft.w === this.photo.width
      ? this.migrate(draft)
      : { version: 2, w: this.photo.width, h: this.photo.height, zones: [], bands: [], items: [] };
    this.selectedId = null;
    this.history = [];
    this.future = [];

    const canvas = document.getElementById('editor-canvas');
    canvas.width = this.preview.width;
    canvas.height = this.preview.height;
    document.getElementById('editor-overlay').setAttribute('viewBox', `0 0 ${this.photo.width} ${this.photo.height}`);
    // Фото занимает не больше ~52% высоты экрана, чтобы панель выбора камня была видна
    const ratio = this.photo.width / this.photo.height;
    const stage = document.getElementById('editor-stage');
    stage.style.aspectRatio = `${this.photo.width} / ${this.photo.height}`;
    stage.style.width = `min(100%, calc(52vh * ${ratio.toFixed(4)}))`;
    this.setZoom(1, 0, 0);

    this.drawOverlay();
    this.renderPanel();
    this.updateToolbar();
    this.scheduleRender(0);
  },

  async loadCatalog() {
    if (this.materialList.length) return;
    const [all, elements] = await Promise.all([Materials.getAll(), Elements.load()]);
    all.forEach(m => { this.materials[m.id] = m; });
    this.materialList = all.filter(m => m.active !== false && m.texture);
    this.elements = elements;
  },

  // Разметка из первой версии редактора: узоры и карнизы назывались иначе
  migrate(d) {
    if (d.version === 2) return d;
    const patterns = { sawn: 'running', split: 'random', big: 'running', tile: 'stack' };
    const formats = { s: '80x360', m: '160x360', l: '350x750' };
    const bandStones = { white: 'akushinskiy-belyy', cream: 'akushinskiy-kremovyy', sand: 'altinskiy-zhyoltyy', grey: 'morskoy-seryy' };
    return {
      version: 2, w: d.w, h: d.h,
      zones: d.zones.map(z => ({
        ...z,
        pattern: patterns[z.pattern] || z.pattern,
        format: z.pattern === 'big' ? '350x750' : (formats[z.size] || '160x360'),
        bevel: z.pattern === 'split' ? 'rustic' : 'chamfer',
        jointMm: 5,
      })),
      bands: d.bands.map(b => ({ id: b.id, p1: b.p1, p2: b.p2, bandId: b.type === 'belt' ? 'k6' : 'k1', materialId: bandStones[b.color] || DEFAULT_DECOR_STONE })),
      items: [],
    };
  },

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  scaleToCanvas(img, maxSide) {
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  },

  // === Предпросмотр ===
  scheduleRender(delay = 250) {
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => this.renderPreview(), delay);
  },

  async renderPreview() {
    const token = ++this.renderToken;
    const k = this.preview.width / this.photo.width;
    const result = await FacadeRender.render(this.preview, this.scaleDesign(this.design, k), this.materials, this.elements);
    if (token !== this.renderToken) return; // пока считали, разметку уже поменяли
    this.lastPreview = result;
    this.showOriginal(this.showingOriginal);
  },

  scaleDesign(design, k) {
    const sp = p => [p[0] * k, p[1] * k];
    return {
      ...design,
      zones: design.zones.map(z => ({ ...z, points: z.points.map(sp) })),
      bands: design.bands.map(b => ({ ...b, p1: sp(b.p1), p2: sp(b.p2) })),
      items: (design.items || []).map(i => ({ ...i, points: i.points.map(sp) })),
    };
  },

  pxPerMm() {
    return FacadeRender.pxPerMm(this.design, this.design.w, this.design.h);
  },

  // === История: отменить / повторить ===
  snapshot() {
    return JSON.stringify(this.design);
  },

  commit(before) {
    if (before === this.snapshot()) return;
    this.history.push(before);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    this.future = [];
    this.updateToolbar();
  },

  undo() {
    if (!this.history.length) return;
    this.future.push(this.snapshot());
    this.design = JSON.parse(this.history.pop());
    if (!this.findItem(this.selectedId)) this.selectedId = null;
    this.afterChange();
  },

  redo() {
    if (!this.future.length) return;
    this.history.push(this.snapshot());
    this.design = JSON.parse(this.future.pop());
    if (!this.findItem(this.selectedId)) this.selectedId = null;
    this.afterChange();
  },

  // Любое изменение разметки: запоминаем для отмены, сохраняем черновик, перерисовываем
  change(fn) {
    const before = this.snapshot();
    fn();
    this.commit(before);
    this.afterChange();
  },

  afterChange() {
    ProjectFlow.setState('design', this.design);
    this.drawOverlay();
    this.renderPanel();
    this.updateToolbar();
    this.scheduleRender();
  },

  updateToolbar() {
    const set = (id, on) => { const b = document.getElementById(id); if (b) b.disabled = !on; };
    set('editor-undo', this.history.length);
    set('editor-redo', this.future.length);
    set('editor-copy', !!this.selectedId);
    document.getElementById('editor-hide')?.classList.toggle('active', this.hidden);
  },

  // === Добавление элементов ===

  // Центр видимой части фото — туда ставится новый элемент
  viewCenter() {
    const { k, x, y } = this.zoom;
    const { w, h } = this.design;
    return [Math.min(w, Math.max(0, w / 2 - x / 100 * w / k)), Math.min(h, Math.max(0, h / 2 - y / 100 * h / k))];
  },

  rectAround(cx, cy, w, h) {
    return [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
  },

  add(key) {
    this.closeSheet();
    const [kind, group] = key.split(':');
    if (ZONE_TYPES[kind]) return this.addZone(kind);
    if (kind === 'band') return this.addBand(group);
    if (kind === 'balustrade') return this.addBalustrade();
    if (kind === 'sprite') return this.addSprite(group);
  },

  addZone(type) {
    const { w, h } = this.design;
    const sizes = {
      wall:    [0.2, 0.25, 0.8, 0.7],
      base:    [0.15, 0.72, 0.85, 0.86],
      reveal:  [0.44, 0.35, 0.5, 0.6],
      paving:  [0.05, 0.86, 0.95, 0.98],
      opening: [0.42, 0.38, 0.58, 0.58],
    };
    const [x1, y1, x2, y2] = sizes[type];
    const zone = {
      id: 'z' + Date.now(),
      type,
      points: [[x1 * w, y1 * h], [x2 * w, y1 * h], [x2 * w, y2 * h], [x1 * w, y2 * h]],
    };
    const firstWall = type === 'wall' && !this.design.zones.some(z => z.type === 'wall');
    if (type === 'opening') {
      Object.assign(zone, { frame: 'nal-gladkiy', keystone: 'none', sill: 'k37', decorMaterialId: DEFAULT_DECOR_STONE }, this.lastChoice.opening || {});
    } else {
      const defaults = {
        wall:   { pattern: 'running', format: '160x360', bevel: 'chamfer' },
        base:   { pattern: 'random', format: '300x600', bevel: 'rustic' },
        reveal: { pattern: 'smooth', format: '350x750', bevel: 'straight' },
        paving: { pattern: 'herringbone', format: '80x160', bevel: 'chamfer' },
      }[type];
      const wallChoice = this.lastChoice.wall || {};
      Object.assign(zone, {
        materialId: wallChoice.materialId || DEFAULT_STONE,
        joint: 'grey',
        jointMm: 5,
        ...defaults,
        ...(this.lastChoice[type] || {}),
        heightM: firstWall ? 6 : null,
      });
    }
    this.change(() => this.design.zones.push(zone));
    this.select(zone.id);
    if (firstWall) showToast('Поставьте углы на углы стены и укажите её высоту в метрах — по ней считается размер камня');
  },

  addBand(kind) {
    const def = this.elements.bandList.find(b => b.kind === kind);
    const { w, h } = this.design;
    const y = kind === 'plinth' ? 0.7 : kind === 'sill' ? 0.6 : 0.28;
    const span = kind === 'sill' ? [0.4, 0.6] : [0.15, 0.85];
    const last = this.lastChoice['band:' + kind] || {};
    const band = {
      id: 'b' + Date.now(),
      bandId: last.bandId || def.id,
      materialId: last.materialId || DEFAULT_DECOR_STONE,
      p1: [span[0] * w, y * h],
      p2: [span[1] * w, y * h],
    };
    this.change(() => this.design.bands.push(band));
    this.select(band.id);
  },

  // Размер изделия по каталогу (мм) с учётом масштаба фото
  spriteSize(def) {
    const s = this.pxPerMm();
    const { w, h } = this.design;
    let pw = def.widthMm * s, ph = def.heightMm * s;
    if (['rust', 'pilaster', 'column'].includes(def.group)) {
      // Вертикальные элементы — на высоту стены, ширина по каталогу
      const wall = this.design.zones.find(z => z.type === 'wall');
      ph = wall ? FacadeRender.zoneMapping(wall.points).h : h * 0.5;
      pw = Math.max(def.widthMm * s, ph * def.w / def.h * 0.6);
    }
    const k = Math.min(1, (w * 0.9) / pw, (h * 0.9) / ph);
    pw *= k; ph *= k;
    const min = Math.max(w, h) * 0.04;
    if (pw < min && ph < min) { const f = min / Math.max(pw, ph); pw *= f; ph *= f; }
    return [pw, ph];
  },

  addSprite(group) {
    const last = this.lastChoice['sprite:' + group] || {};
    const def = this.elements.sprites[last.spriteId] || this.elements.spriteList.find(s => s.group === group);
    const [pw, ph] = this.spriteSize(def);
    const [cx, cy] = this.viewCenter();
    const item = {
      id: 'i' + Date.now(),
      kind: 'sprite',
      group,
      spriteId: def.id,
      materialId: last.materialId || DEFAULT_DECOR_STONE,
      points: this.rectAround(cx, cy, pw, ph),
    };
    this.change(() => this.design.items.push(item));
    this.select(item.id);
  },

  addBalustrade() {
    const s = this.pxPerMm();
    const { w, h } = this.design;
    const [cx, cy] = this.viewCenter();
    const pw = Math.min(w * 0.6, 3000 * s), ph = Math.min(h * 0.3, 1000 * s);
    const last = this.lastChoice.balustrade || {};
    const item = {
      id: 'i' + Date.now(),
      kind: 'balustrade',
      balusterId: last.balusterId || 'balyasina-b1',
      postId: last.postId || 'tumba-kv',
      railId: 'perila-p2',
      materialId: last.materialId || DEFAULT_DECOR_STONE,
      points: this.rectAround(cx, cy, pw, Math.max(ph, h * 0.08)),
    };
    this.change(() => this.design.items.push(item));
    this.select(item.id);
  },

  findItem(id) {
    if (!id || !this.design) return null;
    return this.design.zones.find(z => z.id === id)
      || this.design.bands.find(b => b.id === id)
      || (this.design.items || []).find(i => i.id === id);
  },

  select(id) {
    this.selectedId = id;
    this.selectedHandle = null;
    this.drawOverlay();
    this.renderPanel();
    this.updateToolbar();
  },

  removeSelected() {
    const id = this.selectedId;
    this.selectedId = null;
    this.change(() => {
      this.design.zones = this.design.zones.filter(z => z.id !== id);
      this.design.bands = this.design.bands.filter(b => b.id !== id);
      this.design.items = this.design.items.filter(i => i.id !== id);
    });
  },

  duplicateSelected() {
    const item = this.findItem(this.selectedId);
    if (!item) return;
    const copy = JSON.parse(JSON.stringify(item));
    const dx = this.design.w * 0.05, dy = this.design.h * 0.04;
    copy.id = item.id[0] + Date.now();
    if (copy.heightM) copy.heightM = null; // масштаб задаёт только оригинал
    if (copy.points) copy.points = copy.points.map(([x, y]) => [x + dx, y + dy]);
    else { copy.p1 = [copy.p1[0], copy.p1[1] + dy]; copy.p2 = [copy.p2[0], copy.p2[1] + dy]; }
    this.change(() => {
      if (copy.type) this.design.zones.push(copy);
      else if (copy.p1) this.design.bands.push(copy);
      else this.design.items.push(copy);
    });
    this.select(copy.id);
    showToast('Копия добавлена — перетащите её на место');
  },

  updateSelected(patch) {
    const item = this.findItem(this.selectedId);
    if (!item) return;
    this.change(() => Object.assign(item, patch));
    this.rememberChoice(item);
  },

  // Новые элементы того же типа сразу получают последние настройки
  rememberChoice(item) {
    if (item.type === 'opening') {
      this.lastChoice.opening = { frame: item.frame, keystone: item.keystone, sill: item.sill, decorMaterialId: item.decorMaterialId };
    } else if (item.type) {
      this.lastChoice[item.type] = { materialId: item.materialId, material2Id: item.material2Id, pattern: item.pattern, format: item.format, bevel: item.bevel, joint: item.joint, jointMm: item.jointMm };
    } else if (item.p1) {
      const kind = this.elements.bands[item.bandId]?.kind;
      this.lastChoice['band:' + kind] = { bandId: item.bandId, materialId: item.materialId };
    } else if (item.kind === 'balustrade') {
      this.lastChoice.balustrade = { balusterId: item.balusterId, postId: item.postId, materialId: item.materialId };
    } else {
      this.lastChoice['sprite:' + item.group] = { spriteId: item.spriteId, materialId: item.materialId };
    }
  },

  // Угол многоугольника: добавить посередине самой длинной стороны / убрать выбранный
  addPoint() {
    const z = this.findItem(this.selectedId);
    if (!z?.points || !z.type) return;
    let best = 0, len = -1;
    z.points.forEach((p, i) => {
      const d = FacadeRender.dist(p, z.points[(i + 1) % z.points.length]);
      if (d > len) { len = d; best = i; }
    });
    const a = z.points[best], b = z.points[(best + 1) % z.points.length];
    this.change(() => z.points.splice(best + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]));
    this.selectedHandle = best + 1;
    this.drawOverlay();
    showToast('Новый угол добавлен — перетащите его');
  },

  removePoint() {
    const z = this.findItem(this.selectedId);
    if (!z?.points || z.points.length <= 3) return;
    const idx = this.selectedHandle ?? z.points.length - 1;
    this.change(() => z.points.splice(idx, 1));
    this.selectedHandle = null;
    this.drawOverlay();
  },

  // === Слой разметки (SVG поверх фото) ===
  drawOverlay() {
    const svg = document.getElementById('editor-overlay');
    if (!svg || !this.design) return;
    svg.innerHTML = '';
    if (this.hidden) return;
    const base = Math.max(this.design.w, this.design.h);
    const r = base * 0.02 / this.zoom.k;       // ручки остаются одного размера на экране при увеличении
    const stroke = base * 0.0035 / this.zoom.k;
    const badge = base * 0.03 / this.zoom.k;

    const el = (name, attrs, parent = svg) => {
      const e = document.createElementNS(SVG_NS, name);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      parent.appendChild(e);
      return e;
    };
    const centroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

    // Значок типа в центре элемента — по нему видно, что это за зона
    const drawBadge = (p, iconName, id, selected) => {
      const g = el('g', { 'data-select': id, class: 'editor-badge' + (selected ? ' selected' : '') });
      el('circle', { cx: p[0], cy: p[1], r: badge, 'data-select': id }, g);
      el('use', { href: `#i-${iconName}`, x: p[0] - badge * 0.62, y: p[1] - badge * 0.62, width: badge * 1.24, height: badge * 1.24, 'pointer-events': 'none' }, g);
    };

    const shape = (pts, id, selected, dashed) => {
      el('polygon', {
        points: pts.map(p => p.join(',')).join(' '),
        class: 'editor-shape' + (selected ? ' selected' : ''),
        'stroke-width': selected ? stroke * 1.5 : stroke,
        'stroke-dasharray': dashed ? `${stroke * 4} ${stroke * 3}` : 'none',
        'data-select': id,
      });
    };

    this.design.zones.forEach(z => shape(z.points, z.id, z.id === this.selectedId, z.type === 'opening'));
    (this.design.items || []).forEach(i => shape(i.points, i.id, i.id === this.selectedId, true));
    this.design.bands.forEach(b => {
      el('line', { x1: b.p1[0], y1: b.p1[1], x2: b.p2[0], y2: b.p2[1], stroke: 'transparent', 'stroke-width': r * 2, 'data-select': b.id });
      el('line', {
        x1: b.p1[0], y1: b.p1[1], x2: b.p2[0], y2: b.p2[1],
        class: 'editor-shape' + (b.id === this.selectedId ? ' selected' : ''),
        'stroke-width': b.id === this.selectedId ? stroke * 1.5 : stroke, 'pointer-events': 'none',
      });
    });

    // Значки поверх всех контуров
    this.design.zones.forEach(z => drawBadge(centroid(z.points), ZONE_ICONS[z.type], z.id, z.id === this.selectedId));
    (this.design.items || []).forEach(i => drawBadge(centroid(i.points), i.kind === 'balustrade' ? 'balustrade' : (GROUP_INFO[i.group]?.icon || 'panel'), i.id, i.id === this.selectedId));
    this.design.bands.forEach(b => {
      const kind = this.elements.bands[b.bandId]?.kind || 'cornice';
      drawBadge([(b.p1[0] + b.p2[0]) / 2, (b.p1[1] + b.p2[1]) / 2], BAND_INFO[kind]?.icon || 'cornice', b.id, b.id === this.selectedId);
    });

    // Ручки выбранного элемента
    const sel = this.findItem(this.selectedId);
    if (sel?.points) sel.points.forEach((p, i) => this.drawHandle(el, p, r, stroke, `${sel.id}:${i}`, i === this.selectedHandle));
    if (sel?.p1) {
      this.drawHandle(el, sel.p1, r, stroke, `${sel.id}:p1`);
      this.drawHandle(el, sel.p2, r, stroke, `${sel.id}:p2`);
    }
  },

  drawHandle(el, p, r, stroke, key, active) {
    // Невидимая большая область для пальца и видимая точка
    el('circle', { cx: p[0], cy: p[1], r: r * 1.9, fill: 'transparent', 'data-handle': key });
    el('circle', { cx: p[0], cy: p[1], r, class: 'editor-handle' + (active ? ' active' : ''), 'stroke-width': stroke, 'pointer-events': 'none' });
  },

  // === Масштаб фото: щипок двумя пальцами, колесо, кнопки ===
  setZoom(k, x, y) {
    k = Math.min(6, Math.max(1, k));
    // Не даём увести фото за край
    const max = (k - 1) * 50;
    this.zoom = { k, x: Math.min(max, Math.max(-max, x)), y: Math.min(max, Math.max(-max, y)) };
    const zoomEl = document.getElementById('editor-zoom');
    if (zoomEl) zoomEl.style.transform = `translate(${this.zoom.x}%, ${this.zoom.y}%) scale(${k})`;
    this.drawOverlay();
  },

  // cx, cy — точка экрана (0..1), которая остаётся на месте
  zoomBy(f, cx = 0.5, cy = 0.5) {
    const { k, x, y } = this.zoom;
    const nk = Math.min(6, Math.max(1, k * f));
    const px = (cx - 0.5) * 100, py = (cy - 0.5) * 100;
    this.setZoom(nk, px - (px - x) * nk / k, py - (py - y) * nk / k);
  },

  // === Перетаскивание ===
  toImageCoords(e) {
    const rect = document.getElementById('editor-overlay').getBoundingClientRect();
    return [
      Math.min(this.design.w, Math.max(0, (e.clientX - rect.left) / rect.width * this.design.w)),
      Math.min(this.design.h, Math.max(0, (e.clientY - rect.top) / rect.height * this.design.h)),
    ];
  },

  onPointerDown(e) {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      // Второй палец — начинаем масштабирование, начатое перетаскивание отменяем
      if (this.drag?.before) this.cancelDrag();
      this.drag = null;
      this.hideLoupe();
      const [a, b] = [...this.pointers.values()];
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: { ...this.zoom }, mid: [(a.x + b.x) / 2, (a.y + b.y) / 2] };
      return;
    }

    const target = e.target.closest('[data-handle], [data-select]');
    const handle = target?.getAttribute('data-handle');
    if (handle) {
      e.preventDefault();
      const [id, idx] = handle.split(':');
      this.drag = { id, idx, before: this.snapshot() };
      if (idx !== 'p1' && idx !== 'p2') this.selectedHandle = +idx;
      this.showLoupe(e);
      return;
    }
    const sel = target?.getAttribute('data-select');
    if (sel) {
      // Перетаскивание всего элемента
      e.preventDefault();
      if (sel !== this.selectedId) this.select(sel);
      this.drag = { id: sel, idx: 'all', start: this.toImageCoords(e), orig: JSON.parse(JSON.stringify(this.findItem(sel))), before: this.snapshot(), moved: false };
      return;
    }
    // Пустое место: при увеличении — сдвиг фото, без сдвига — снять выбор
    this.drag = { pan: true, x: e.clientX, y: e.clientY, zoom: { ...this.zoom }, moved: false };
  },

  onPointerMove(e) {
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pinch && this.pointers.size === 2) {
      e.preventDefault();
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = document.getElementById('editor-stage').getBoundingClientRect();
      const mid = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      const z = this.pinch.zoom;
      const nk = Math.min(6, Math.max(1, z.k * d / this.pinch.d));
      const px = ((this.pinch.mid[0] - rect.left) / rect.width - 0.5) * 100;
      const py = ((this.pinch.mid[1] - rect.top) / rect.height - 0.5) * 100;
      const dx = (mid[0] - this.pinch.mid[0]) / rect.width * 100, dy = (mid[1] - this.pinch.mid[1]) / rect.height * 100;
      this.setZoom(nk, px - (px - z.x) * nk / z.k + dx, py - (py - z.y) * nk / z.k + dy);
      return;
    }
    if (!this.drag) return;
    e.preventDefault();

    if (this.drag.pan) {
      const rect = document.getElementById('editor-stage').getBoundingClientRect();
      const dx = (e.clientX - this.drag.x) / rect.width * 100, dy = (e.clientY - this.drag.y) / rect.height * 100;
      if (Math.hypot(dx, dy) > 1) this.drag.moved = true;
      if (this.zoom.k > 1) this.setZoom(this.zoom.k, this.drag.zoom.x + dx, this.drag.zoom.y + dy);
      return;
    }

    const item = this.findItem(this.drag.id);
    if (!item) return;
    const p = this.toImageCoords(e);
    if (this.drag.idx === 'all') {
      const dx = p[0] - this.drag.start[0], dy = p[1] - this.drag.start[1];
      if (Math.hypot(dx, dy) > 3) this.drag.moved = true;
      if (item.points) item.points = this.drag.orig.points.map(q => [q[0] + dx, q[1] + dy]);
      else { item.p1 = [this.drag.orig.p1[0] + dx, this.drag.orig.p1[1] + dy]; item.p2 = [this.drag.orig.p2[0] + dx, this.drag.orig.p2[1] + dy]; }
    } else if (this.drag.idx === 'p1' || this.drag.idx === 'p2') {
      item[this.drag.idx] = p;
      this.showLoupe(e, p);
    } else {
      item.points[+this.drag.idx] = p;
      this.showLoupe(e, p);
    }
    this.drawOverlay();
  },

  onPointerUp(e) {
    this.pointers.delete(e.pointerId);
    if (this.pinch) {
      if (this.pointers.size < 2) this.pinch = null;
      return;
    }
    const drag = this.drag;
    this.drag = null;
    this.hideLoupe();
    if (!drag) return;
    if (drag.pan) {
      if (!drag.moved && this.selectedId) this.select(null);
      return;
    }
    if (drag.idx !== 'all' || drag.moved) {
      this.commit(drag.before);
      this.afterChange();
    }
  },

  cancelDrag() {
    if (this.drag?.before) this.design = JSON.parse(this.drag.before);
    this.drag = null;
    this.drawOverlay();
  },

  // === Лупа: увеличенный участок фото над пальцем, чтобы точно попасть в угол ===
  showLoupe(e, p) {
    const loupe = document.getElementById('editor-loupe');
    const stage = document.getElementById('editor-stage');
    if (!loupe || !stage) return;
    p = p || this.toImageCoords(e);
    const size = 120, zoom = 2.5;
    const ctx = loupe.getContext('2d');
    loupe.width = size;
    loupe.height = size;
    const svgRect = document.getElementById('editor-overlay').getBoundingClientRect();
    const k = (svgRect.width / this.design.w) * zoom;
    const src = size / k;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(this.photo, p[0] - src / 2, p[1] - src / 2, src, src, 0, 0, size, size);
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2 - 14); ctx.lineTo(size / 2, size / 2 + 14);
    ctx.moveTo(size / 2 - 14, size / 2); ctx.lineTo(size / 2 + 14, size / 2);
    ctx.stroke();
    const stageRect = stage.getBoundingClientRect();
    const x = e.clientX - stageRect.left, y = e.clientY - stageRect.top;
    loupe.style.left = `${Math.min(stageRect.width - size, Math.max(0, x - size / 2))}px`;
    loupe.style.top = `${y - size - 40 < 0 ? y + 40 : y - size - 40}px`;
    loupe.hidden = false;
  },

  hideLoupe() {
    const loupe = document.getElementById('editor-loupe');
    if (loupe) loupe.hidden = true;
  },

  // === Меню «Добавить» ===
  openSheet() {
    const content = document.getElementById('editor-sheet-content');
    content.innerHTML = ADD_MENU.map(section => `
      <div class="editor-sheet__section">${section.title}</div>
      <div class="editor-sheet__grid">
        ${section.items.map(it => `
          <button class="editor-sheet__item" data-add="${it.key}">
            ${icon(it.icon)}<span>${it.name}</span>
          </button>`).join('')}
      </div>`).join('');
    document.getElementById('editor-sheet').hidden = false;
  },

  closeSheet() {
    document.getElementById('editor-sheet').hidden = true;
  },

  // === Панель настроек выбранного элемента ===
  chips(field, options, current) {
    return `<div class="editor-chips">${Object.entries(options).map(([key, o]) => `
      <button class="editor-chip${String(key) === String(current) ? ' active' : ''}" data-field="${field}" data-value="${esc(key)}">${o.icon ? icon(o.icon) : ''}${esc(o.name)}</button>`).join('')}</div>`;
  },

  // Лента камней с поиском; field — какое поле элемента меняет выбор
  stonePicker(field, current, label = 'Камень') {
    const query = (this.materialQuery || '').toLowerCase();
    const list = this.materialList.filter(m => !query || m.name.toLowerCase().includes(query) || (m.type || '').toLowerCase().includes(query));
    const m = this.materials[current];
    return `
      <div class="editor-panel__label">${label}${m ? `: <b>${esc(m.name)}</b>` : ''}</div>
      ${m?.description ? `<p class="editor-stone-info">${esc(m.type)} · морозостойкость ${esc(m.specs?.frost || '—')} · ${esc(m.description)}</p>` : ''}
      <input class="input editor-search" type="search" placeholder="Поиск: название или порода" value="${esc(this.materialQuery)}">
      <div class="editor-materials">
        ${list.map(s => `
          <button class="editor-material${s.id === current ? ' active' : ''}" data-stone-field="${field}" data-material="${s.id}">
            <img src="${s.texture}" alt="" loading="lazy">
            <span>${esc(s.name)}</span>
          </button>`).join('') || '<p class="editor-panel__hint">Ничего не найдено</p>'}
      </div>`;
  },

  modelPicker(field, list, current, withNone) {
    return `<div class="editor-models">
      ${withNone ? `<button class="editor-model${!current || current === 'none' ? ' active' : ''}" data-field="${field}" data-value="none"><span class="editor-model__none">—</span><span>Нет</span></button>` : ''}
      ${list.map(s => `
        <button class="editor-model${s.id === current ? ' active' : ''}" data-field="${field}" data-value="${s.id}">
          <img src="${s.image}" alt="" loading="lazy"><span>${esc(s.name)}</span>
        </button>`).join('')}
    </div>`;
  },

  bandPicker(kind, current) {
    const list = this.elements.bandList.filter(b => b.kind === kind);
    return `<div class="editor-chips">${list.map(b => `
      <button class="editor-chip${b.id === current ? ' active' : ''}" data-field="bandId" data-value="${b.id}">
        <span class="editor-profile" style="${this.profileCss(b)}"></span>${esc(b.name)}
      </button>`).join('')}</div>`;
  },

  // Мини-образец профиля: те же светлые и тёмные полосы, что на наброске
  profileCss(def) {
    let acc = 0;
    const stops = [];
    def.profile.forEach(([part, type]) => {
      const k = FacadeRender.profileShade([[1, type]], 0.5);
      const c = Math.round(Math.min(255, 200 * k));
      const color = `rgb(${c},${c - 6},${c - 18})`;
      stops.push(`${color} ${Math.round(acc * 100)}%`, `${color} ${Math.round((acc + part) * 100)}%`);
      acc += part;
    });
    return `background: linear-gradient(${stops.join(',')})`;
  },

  title(iconName, name, extra = '') {
    return `<div class="editor-panel__title">${icon(iconName)}<span>${esc(name)}</span>${extra}
      <button class="btn btn-ghost editor-remove" data-action="remove">${icon('trash')}Удалить</button></div>`;
  },

  renderPanel() {
    const panel = document.getElementById('editor-panel');
    if (!panel) return;
    const item = this.findItem(this.selectedId);

    if (!item) {
      const empty = !(this.design?.zones.length || this.design?.items?.length || this.design?.bands.length);
      panel.innerHTML = `
        <div class="editor-panel__empty">
          ${icon(empty ? 'plus' : 'wall')}
          <p>${empty
            ? 'Нажмите «Добавить» и выберите «Стена». Углы рамки перетащите на углы стены — лупа поможет попасть точно. Двумя пальцами фото можно увеличить.'
            : 'Нажмите на значок на фото, чтобы выбрать камень, узор или модель изделия.'}</p>
        </div>`;
      return;
    }

    let html = '';
    if (item.type === 'opening') {
      const asOptions = kind => ({ none: { name: 'Нет' }, ...Object.fromEntries(this.elements.bandList.filter(b => b.kind === kind).map(b => [b.id, { name: b.name }])) });
      html = this.title('opening', 'Окно / дверь') + `
        <p class="editor-panel__hint">Внутри проёма фото остаётся как есть. Поставьте углы по краям окна или двери.</p>
        <div class="editor-panel__label">Наличник</div>
        ${this.chips('frame', asOptions('surround'), item.frame || 'none')}
        <div class="editor-panel__label">Подоконник</div>
        ${this.chips('sill', asOptions('sill'), item.sill || 'none')}
        <div class="editor-panel__label">Замок над проёмом</div>
        ${this.modelPicker('keystone', this.elements.spriteList.filter(s => s.group === 'keystone'), item.keystone, true)}
        ${this.stonePicker('decorMaterialId', item.decorMaterialId, 'Камень обрамления')}
        ${this.pointButtons(item)}`;
    } else if (item.type) {
      const pattern = PATTERNS[item.pattern] || PATTERNS.running;
      const types = {};
      ['wall', 'base', 'reveal', 'paving'].forEach(t => { types[t] = { name: ZONE_TYPES[t].name, icon: ZONE_ICONS[t] }; });
      html = this.title(ZONE_ICONS[item.type], ZONE_TYPES[item.type].name) + `
        ${this.chips('type', types, item.type)}
        ${this.heightControl(item)}
        ${this.stonePicker('materialId', item.materialId)}
        <div class="editor-panel__label">Узор кладки</div>
        ${this.chips('pattern', PATTERNS, item.pattern)}
        ${pattern.twoTone ? this.stonePicker('material2Id', item.material2Id || item.materialId, 'Второй камень') : ''}
        <div class="editor-panel__label">Формат плитки, мм</div>
        ${this.chips('format', FORMATS, item.format)}
        ${pattern.noJoints ? '' : `
          <div class="editor-panel__label">Фаска</div>
          ${this.chips('bevel', BEVELS, item.bevel)}
          <div class="editor-panel__label">Шов</div>
          ${this.chips('joint', JOINTS, item.joint)}
          ${item.joint === 'none' ? '' : this.chips('jointMm', JOINT_WIDTHS, item.jointMm || 5)}`}
        ${this.pointButtons(item)}`;
    } else if (item.p1) {
      const def = this.elements.bands[item.bandId];
      const kind = def?.kind || 'cornice';
      html = this.title(BAND_INFO[kind].icon, def?.name || 'Карниз', def ? `<small>${def.heightMm}×${def.depthMm} мм</small>` : '') + `
        <p class="editor-panel__hint">Линия — верхний край. Концы линии перетащите на края стены.</p>
        <div class="editor-panel__label">Вид</div>
        ${this.chips('kind', BAND_INFO, kind)}
        <div class="editor-panel__label">Модель</div>
        ${this.bandPicker(kind, item.bandId)}
        ${this.stonePicker('materialId', item.materialId)}`;
    } else if (item.kind === 'balustrade') {
      html = this.title('balustrade', 'Балюстрада') + `
        <p class="editor-panel__hint">Рамка — от верха перил до низа основания. Балясины расставятся сами.</p>
        <div class="editor-panel__label">Балясина</div>
        ${this.modelPicker('balusterId', this.elements.spriteList.filter(s => s.group === 'baluster'), item.balusterId)}
        <div class="editor-panel__label">Тумбы по краям</div>
        ${this.modelPicker('postId', this.elements.spriteList.filter(s => s.group === 'post'), item.postId, true)}
        ${this.stonePicker('materialId', item.materialId)}`;
    } else {
      const def = this.elements.sprites[item.spriteId];
      const info = GROUP_INFO[item.group] || GROUP_INFO.panel;
      html = this.title(info.icon, def?.name || info.name, def ? `<small>${def.widthMm}×${def.heightMm} мм</small>` : '') + `
        <div class="editor-panel__label">Модель</div>
        ${this.modelPicker('spriteId', this.elements.spriteList.filter(s => s.group === item.group), item.spriteId)}
        <button class="btn btn-secondary editor-fit" data-action="fit">${icon('fit')}Размер по каталогу</button>
        ${this.stonePicker('materialId', item.materialId)}`;
    }
    panel.innerHTML = html;

    // Выбранный камень и модель — в зоне видимости ленты
    panel.querySelectorAll('.editor-material.active, .editor-model.active').forEach(el => {
      const strip = el.parentElement;
      strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    });

    const search = panel.querySelector('.editor-search');
    search?.addEventListener('input', () => {
      this.materialQuery = search.value;
      const pos = search.selectionStart;
      this.renderPanel();
      const again = document.querySelector('#editor-panel .editor-search');
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  },

  // Высота зоны в метрах: по ней считается настоящий размер камня
  heightControl(item) {
    const isScale = item.heightM != null;
    return `
      <div class="editor-height">
        <div>
          <div class="editor-panel__label">Высота зоны, м</div>
          <p class="editor-panel__hint">${isScale ? 'По этой высоте считается размер камня на фото' : 'Не задана — размер берётся по высоте стены'}</p>
        </div>
        <div class="editor-stepper">
          <button data-action="height" data-step="-0.1" aria-label="Меньше">−</button>
          <span>${isScale ? item.heightM.toFixed(1) : '—'}</span>
          <button data-action="height" data-step="0.1" aria-label="Больше">+</button>
        </div>
      </div>`;
  },

  pointButtons(item) {
    return `
      <div class="editor-points">
        <button class="btn btn-secondary" data-action="add-point">${icon('point-add')}Добавить угол</button>
        <button class="btn btn-secondary" data-action="remove-point" ${item.points.length <= 3 ? 'disabled' : ''}>${icon('point-remove')}Убрать угол</button>
      </div>
      <p class="editor-panel__hint">Больше углов — для фронтона, эркера или стены сложной формы.${item.points.length === 4 ? ' С четырьмя углами учитывается перспектива.' : ''}</p>`;
  },

  onPanelClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const item = this.findItem(this.selectedId);
    if (!item) return;
    const action = btn.dataset.action;
    if (action === 'remove') return this.removeSelected();
    if (action === 'add-point') return this.addPoint();
    if (action === 'remove-point') return this.removePoint();
    if (action === 'height') {
      const current = item.heightM ?? (FacadeRender.zoneMapping(item.points).h / this.pxPerMm() / 1000);
      const next = Math.max(0.2, Math.round((current + parseFloat(btn.dataset.step)) * 10) / 10);
      return this.updateSelected({ heightM: next });
    }
    if (action === 'fit') return this.fitSprite(item);
    if (btn.dataset.material) {
      return this.updateSelected({ [btn.dataset.stoneField]: btn.dataset.material });
    }
    if (btn.dataset.field) {
      const field = btn.dataset.field;
      let value = btn.dataset.value;
      if (field === 'jointMm') value = +value;
      if (field === 'kind') {
        // Смена вида полосы: берём первую модель этого вида
        const def = this.elements.bandList.find(b => b.kind === value);
        return this.updateSelected({ bandId: def.id });
      }
      if (field === 'type' && value === item.type) return;
      return this.updateSelected({ [field]: value });
    }
  },

  // Возвращает изделию пропорции и размер по каталогу, центр остаётся на месте
  fitSprite(item) {
    const def = this.elements.sprites[item.spriteId];
    if (!def) return;
    const [pw, ph] = this.spriteSize(def);
    const c = [item.points.reduce((s, p) => s + p[0], 0) / 4, item.points.reduce((s, p) => s + p[1], 0) / 4];
    this.updateSelected({ points: this.rectAround(c[0], c[1], pw, ph) });
  },

  // Удержание кнопки «До» показывает исходное фото
  showOriginal(on) {
    this.showingOriginal = on;
    const ctx = document.getElementById('editor-canvas').getContext('2d');
    ctx.drawImage(on || !this.lastPreview ? this.preview : this.lastPreview, 0, 0);
  },

  async finish() {
    const filled = this.design.zones.some(z => z.type !== 'opening') || this.design.bands.length || this.design.items.length;
    if (!filled) {
      showToast('Добавьте хотя бы одну стену или элемент');
      return;
    }
    const btn = document.getElementById('editor-done');
    btn.disabled = true;
    btn.textContent = 'Рисую…';
    try {
      const result = await FacadeRender.render(this.photo, this.design, this.materials, this.elements);
      ProjectFlow.state.sketch = result.toDataURL('image/jpeg', 0.9);
      Router.navigateTo('sketch');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Готово';
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;

    const svg = document.getElementById('editor-overlay');
    svg.addEventListener('pointerdown', e => this.onPointerDown(e));
    window.addEventListener('pointermove', e => this.onPointerMove(e), { passive: false });
    window.addEventListener('pointerup', e => this.onPointerUp(e));
    window.addEventListener('pointercancel', e => this.onPointerUp(e));
    document.getElementById('editor-stage').addEventListener('wheel', e => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      this.zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
    }, { passive: false });

    document.getElementById('editor-add').addEventListener('click', () => this.openSheet());
    document.getElementById('editor-sheet').addEventListener('click', e => {
      if (e.target.closest('[data-close]')) return this.closeSheet();
      const btn = e.target.closest('[data-add]');
      if (btn) this.add(btn.dataset.add);
    });
    document.getElementById('editor-undo').addEventListener('click', () => this.undo());
    document.getElementById('editor-redo').addEventListener('click', () => this.redo());
    document.getElementById('editor-copy').addEventListener('click', () => this.duplicateSelected());
    document.getElementById('editor-hide').addEventListener('click', () => {
      this.hidden = !this.hidden;
      this.drawOverlay();
      this.updateToolbar();
    });
    document.getElementById('editor-zoom-in').addEventListener('click', () => this.zoomBy(1.5));
    document.getElementById('editor-zoom-out').addEventListener('click', () => this.zoomBy(1 / 1.5));
    document.getElementById('editor-zoom-fit').addEventListener('click', () => this.setZoom(1, 0, 0));

    document.getElementById('editor-panel').addEventListener('click', e => this.onPanelClick(e));
    document.getElementById('editor-back').addEventListener('click', () => Router.navigateTo('photo'));
    document.getElementById('editor-done').addEventListener('click', () => this.finish());

    const before = document.getElementById('editor-before');
    before.addEventListener('pointerdown', () => this.showOriginal(true));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => before.addEventListener(ev, () => this.showOriginal(false)));
  },
};

// === Экран: Разметка ===
function onScreenEditor() {
  Editor.open();
}

// === Экран: Набросок (результат) ===
const Sketch = {
  bound: false,

  open() {
    const sketch = ProjectFlow.state.sketch;
    if (!sketch || !Editor.photo) {
      Router.navigateTo(ProjectFlow.getState('originalPhoto') ? 'editor' : 'photo');
      return;
    }
    this.bind();
    document.getElementById('sketch-after').src = sketch;
    document.getElementById('sketch-before').src = Editor.photo.toDataURL('image/jpeg', 0.88);
    document.getElementById('sketch-slider').value = 50;
    this.setSplit(50);
    document.getElementById('sketch-summary').innerHTML = summarizeDesign(ProjectFlow.getState('design'), Editor.materials, Editor.elements);
  },

  setSplit(value) {
    document.getElementById('sketch-before-wrap').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    document.getElementById('sketch-divider').style.left = `${value}%`;
  },

  async blob() {
    const res = await fetch(ProjectFlow.state.sketch);
    return res.blob();
  },

  async share() {
    const blob = await this.blob();
    const file = new File([blob], 'fasad-nabrosok.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Набросок фасада', text: 'Набросок фасада — Fasad AI' });
      } catch (e) {
        if (e.name !== 'AbortError') showToast('Не удалось поделиться');
      }
    } else {
      downloadImage(ProjectFlow.state.sketch, 'fasad-nabrosok.jpg');
    }
  },

  async saveProject() {
    if (!Auth.isLoggedIn()) {
      showAuthModal();
      showToast('Войдите, чтобы сохранить проект');
      return;
    }
    const btn = document.getElementById('sketch-save');
    btn.disabled = true;
    try {
      const original = await (await fetch(Editor.photo.toDataURL('image/jpeg', 0.88))).blob();
      const up1 = await Api.uploadImage(new File([original], 'original.jpg', { type: 'image/jpeg' }));
      const up2 = await Api.uploadImage(new File([await this.blob()], 'sketch.jpg', { type: 'image/jpeg' }), 'generated');
      const now = new Date();
      const project = await Api.createProject({
        name: `Фасад ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
        original_image: up1.data.url,
        generated_image: up2.data.url,
        design: ProjectFlow.getState('design'),
      });
      ProjectFlow.clearDraft();
      showToast('Проект сохранён');
      openProject(project.data.id);
    } catch (e) {
      if ((e.message || '').includes('Не авторизован')) {
        Auth._user = null;
        showAuthModal();
      }
      showToast(e.message || 'Не удалось сохранить проект');
    } finally {
      btn.disabled = false;
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const slider = document.getElementById('sketch-slider');
    slider.addEventListener('input', () => this.setSplit(slider.value));
    document.getElementById('sketch-back').addEventListener('click', () => Router.navigateTo('editor'));
    document.getElementById('sketch-edit').addEventListener('click', () => Router.navigateTo('editor'));
    document.getElementById('sketch-share').addEventListener('click', () => this.share());
    document.getElementById('sketch-download').addEventListener('click', () => downloadImage(ProjectFlow.state.sketch, 'fasad-nabrosok.jpg'));
    document.getElementById('sketch-save').addEventListener('click', () => this.saveProject());
  },
};

function onScreenSketch() {
  Sketch.open();
}

// Список материалов и изделий для экрана результата и карточки проекта
function summarizeDesign(design, materials, elements) {
  if (!design || !design.zones) return '';
  const row = (iconName, label, value, details = '') => `
    <div class="project-details__item">
      <span class="project-details__label">${icon(iconName)}${esc(label)}</span>
      <span class="project-details__value">${esc(value)}${details ? `<br><small>${esc(details)}</small>` : ''}</span>
    </div>`;
  const oldPatterns = { sawn: 'running', split: 'random', big: 'running', tile: 'stack' };
  const rows = [];
  design.zones.forEach(z => {
    if (z.type === 'opening') {
      const parts = [elements?.bands[z.frame]?.name, elements?.bands[z.sill]?.name, elements?.sprites[z.keystone]?.name].filter(Boolean);
      if (parts.length) rows.push(row('opening', 'Обрамление', parts.join(', '), materials[z.decorMaterialId]?.name || ''));
      return;
    }
    const pattern = PATTERNS[z.pattern] || PATTERNS[oldPatterns[z.pattern]];
    const smooth = pattern?.noJoints;
    const details = [
      pattern?.name,
      FORMATS[z.format] ? FORMATS[z.format].name + ' мм' : null,
      smooth || !BEVELS[z.bevel] ? null : `фаска ${BEVELS[z.bevel].name.toLowerCase()}`,
      smooth || !JOINTS[z.joint] || z.joint === 'none' ? null : `шов ${JOINTS[z.joint].name.toLowerCase()}${z.jointMm ? ' ' + z.jointMm + ' мм' : ''}`,
    ].filter(Boolean).join(', ');
    rows.push(row(ZONE_ICONS[z.type] || 'wall', ZONE_TYPES[z.type]?.name || 'Зона', materials[z.materialId]?.name || 'Камень', details));
  });
  (design.bands || []).forEach(b => {
    const def = elements?.bands[b.bandId];
    const info = BAND_INFO[def?.kind] || BAND_INFO.cornice;
    rows.push(row(info.icon, info.name, def?.name || info.name, materials[b.materialId]?.name || ''));
  });
  (design.items || []).forEach(i => {
    if (i.kind === 'balustrade') {
      rows.push(row('balustrade', 'Балюстрада', elements?.sprites[i.balusterId]?.name || 'Балясины', materials[i.materialId]?.name || ''));
    } else {
      const info = GROUP_INFO[i.group] || GROUP_INFO.panel;
      rows.push(row(info.icon, info.name, elements?.sprites[i.spriteId]?.name || info.name, materials[i.materialId]?.name || ''));
    }
  });
  return rows.join('');
}
