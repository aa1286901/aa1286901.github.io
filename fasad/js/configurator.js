// === Подбор фасада: три экрана ===
// 1. Плитка — стены и цоколь: камень, фаска, поверхность, формат, толщина.
// 2. Узоры и материалы — у каждой части свой узор (изделие из каталога) и свой камень, выбор в окне сеткой.
// 3. Итог — размер здания и спецификация (экран spec).

const DEFAULT_MAIN_STONE = 'akushinskiy-kremovyy';
const DEFAULT_DECOR_STONE = 'akushinskiy-belyy';

const EDGE_NAMES = { none: 'без фаски', chamfer: 'фаска скос', convex: 'фаска скруглённая', concave: 'фаска вогнутая', rabbet: 'фаска четверть' };
const SURFACE_NAMES = { sawn: 'пиленая', split: 'отбитая' };

const TILE_DEFAULTS = {
  main: { stone: DEFAULT_MAIN_STONE, format: '300x600', thickness: 20, edge: 'chamfer', surface: 'sawn', layout: 'running', joint: 'light' },
  base: { stone: 'mekeginskiy', format: '300x600', thickness: 25, edge: 'chamfer', surface: 'split', layout: 'running', joint: 'grey' },
};

// Узоры: часть фасада → разделы каталога, из которых выбирают. def — модель по умолчанию (по названию)
const PATTERN_GROUPS = [
  { group: 'cornice', title: 'Карнизы и пояса', rows: [
    { key: 'topCornice', title: 'Венчающий карниз', sections: ['cornice'], def: /венчающий К-11/i },
    { key: 'floorCornice', title: 'Межэтажный карниз', sections: ['cornice', 'plinth'], def: /межэтажный К-26/i },
    { key: 'baseCornice', title: 'Плинтус над цоколем', sections: ['plinth', 'cornice'], def: /^Плинтус П-15/ },
    { key: 'dentils', title: 'Зубцы под карнизом', sections: ['dentil'] },
    { key: 'corners', title: 'Русты (Пилястры)', sections: ['rust'], def: /^Русты стандартные/ },
  ] },
  { group: 'windows', title: 'Окна', rows: [
    { key: 'frame', title: 'Наличник', sections: ['cornice', 'plinth'], def: /^Карниз К-12$/ },
    { key: 'windowCornice', title: 'Карниз над окном', sections: ['cornice', 'plinth'] },
    { key: 'sill', title: 'Подоконник', sections: ['cornice', 'plinth'], def: /^Карниз К-37$/ },
    { key: 'keystone', title: 'Замок над окном', sections: ['keystone'], def: /^Замок простой/ },
    { key: 'console', title: 'Консоли под подоконник', sections: ['console'] },
  ] },
  { group: 'columns', title: 'Колонны и балюстрада', rows: [
    { key: 'column', title: 'Колонна или пилястра', sections: ['column', 'pilaster'], skipTall: true },
    { key: 'capital', title: 'Капитель и база', sections: ['capital'] },
    { key: 'baluster', title: 'Балясина', sections: ['balustrade'], match: /^Балясина/ },
    { key: 'post', title: 'Тумба', sections: ['balustrade'], match: /^Тумба/ },
    { key: 'rail', title: 'Перила', sections: ['balustrade'], match: /^Перила/ },
    { key: 'finial', title: 'Навершие', sections: ['balustrade'], match: /^Навершие/ },
  ] },
];
const PATTERN_ROWS = PATTERN_GROUPS.flatMap(g => g.rows);

const Configurator = {
  spec: null,
  step: 1,
  bound: false,

  newSpec(mainStone) {
    const spec = {
      version: 5,
      materials: {
        main: { ...TILE_DEFAULTS.main },
        base: { on: true, ...TILE_DEFAULTS.base },
      },
      // У каждой части свой узор (изделие) и свой камень: 'main' — как стены, 'base' — как цоколь, иначе id камня.
      // Новый подбор — как стены: какой камень ни выбери для стен, узоры будут из него же
      parts: Object.fromEntries(PATTERN_ROWS.map(r => [r.key, { item: null, stone: 'main' }])),
      building: { floors: null, heightM: null },
      filled: false,  // модели по умолчанию ещё не подставлены
    };
    if (mainStone) spec.materials.main.stone = mainStone;
    return spec;
  },

  // Из страницы камня: «Подобрать дизайн с этим камнем»
  startWithStone(stoneId) {
    this.spec = this.newSpec(stoneId);
    this.step = 1;
    ProjectFlow.setState('design', this.spec);
    Router.navigateTo(ProjectFlow.getState('originalPhoto') ? 'configure' : 'photo');
    if (!ProjectFlow.getState('originalPhoto')) showToast('Сфотографируйте дом или выберите фото — камень уже выбран');
  },

  async render() {
    if (!ProjectFlow.getState('originalPhoto')) return Router.navigateTo('photo');
    this.bind();
    const draft = ProjectFlow.getState('design');
    if (draft?.version === 5) this.spec = draft;
    else if (this.spec?.version !== 5) { this.spec = this.newSpec(); this.step = 1; ProjectFlow.setState('step', 1); }
    addMissingParts(this.spec);
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    this.stones = stones;
    this.catalog = catalog;
    this.fillDefaults();
    this.save();
    document.getElementById('configure-photo').src = ProjectFlow.getState('originalPhoto');
    this.draw();
  },

  // Модели по умолчанию — по названию из каталога, один раз для нового подбора
  fillDefaults() {
    if (this.spec.filled) return;
    PATTERN_ROWS.forEach(r => {
      if (!r.def) return;
      for (const sid of r.sections) {
        const item = this.catalog.sections.find(s => s.id === sid)?.items.find(i => r.def.test(i.name));
        if (item) { this.spec.parts[r.key].item = item.variants[0].id; break; }
      }
    });
    this.spec.filled = true;
  },

  stone(id) {
    return this.stones.find(s => s.id === id) || this.stones[0];
  },

  // Камень части: как стены, как цоколь или свой
  partStone(key) {
    return this.stone(resolveStone(this.spec, this.spec.parts[key].stone));
  },

  save() {
    ProjectFlow.setState('design', this.spec);
  },

  draw() {
    document.getElementById('configure-title').textContent = this.step === 1 ? 'Плитка' : 'Узоры и материалы';
    document.getElementById('configure-steps').innerHTML = flowSteps(this.step);
    document.getElementById('configure-hint').textContent = this.step === 1
      ? 'Плитка стен и цоколя: камень, фаска, поверхность, формат, толщина.'
      : 'Для каждой части выберите узор и камень. «Нет» в узоре — части не будет.';
    document.getElementById('configure-prev').hidden = this.step === 1;
    document.getElementById('configure-next').textContent = this.step === 1 ? 'Далее — узоры' : 'Далее — итог';
    this.redraw(true);
  },

  // === Экран 1: плитка ===
  materialsHtml() {
    const m = this.spec.materials;
    return `
      <section class="cfg-block" data-tile="main">
        <h3 class="cfg-block__title">${icon('wall')} Стены — плитка</h3>
        ${this.tileHtml('main')}
      </section>
      <section class="cfg-block" data-tile="base">
        <h3 class="cfg-block__title">${icon('base')} Цоколь
          <label class="switch"><input type="checkbox" data-base-on ${m.base.on ? 'checked' : ''}><span></span></label></h3>
        ${m.base.on ? this.tileHtml('base') : '<p class="cfg-off">Без цоколя из камня</p>'}
      </section>`;
  },

  tileHtml(key) {
    const part = this.spec.materials[key];
    const t = this.catalog.tile;
    const st = this.stone(part.stone);
    return `
      <div class="opt-label">Камень: <b>${esc(st?.name)}</b></div>
      ${this.stoneStrip(`tile:${key}:stone`, part.stone)}
      <canvas class="part-preview" data-preview="${key}"></canvas>
      <div class="opt-label">Фаска</div>
      ${this.chips(`tile:${key}:edge`, t.edges.map(e => [e.id, e.name, edgeIcon(e.id)]), part.edge)}
      <div class="opt-label">Поверхность</div>
      ${this.chips(`tile:${key}:surface`, t.surfaces.map(e => [e.id, e.name]), part.surface)}
      <div class="opt-label">Формат, мм</div>
      ${this.chips(`tile:${key}:format`, (st?.formats || t.formats).map(f => [f, f.replace('x', '×')]), part.format)}
      <div class="opt-label">Толщина, мм</div>
      ${this.chips(`tile:${key}:thickness`, (st?.thickness || t.thickness).map(f => [f, String(f)]), part.thickness)}
      <canvas class="part-slab" data-slab="${key}"></canvas>
      <div class="opt-label">Раскладка</div>
      ${this.chips(`tile:${key}:layout`, Object.entries(LAYOUTS).map(([k, l]) => [k, l.name]), part.layout)}
      <div class="opt-label">Шов</div>
      ${this.chips(`tile:${key}:joint`, Object.entries(JOINT_COLORS).map(([k, l]) => [k, l.name]), part.joint)}`;
  },

  // === Экран 2: у каждой части — кнопки «Узор» и «Материал» ===
  patternsHtml() {
    return PATTERN_GROUPS.map(g => `
      <section class="cfg-block">
        <h3 class="cfg-block__title">${g.title}</h3>
        ${g.rows.map(r => this.rowHtml(r)).join('')}
      </section>`).join('');
  },

  rowHtml(r) {
    const part = this.spec.parts[r.key];
    const v = part.item ? this.catalog.variants[part.item] : null;
    const st = this.partStone(r.key);
    return `
      <div class="cfg-row" data-row="${r.key}">
        <div class="cfg-row__title">${r.title}</div>
        <div class="cfg-pair">
          <button class="cfg-choice" data-open-pattern="${r.key}">
            <span class="cfg-choice__img">${v ? `<img src="${v.image}" data-recolor="${v.id}" alt="">` : '<span class="pick__none">—</span>'}</span>
            <span class="cfg-choice__text"><small>Узор</small><b>${v ? esc(v.name) : 'Нет'}</b>${v ? `<small>${esc(v.size)} мм</small>` : ''}</span>
          </button>
          <button class="cfg-choice" data-open-stone="${r.key}" ${v ? '' : 'disabled'}>
            <span class="cfg-choice__img"><img class="cover" src="${st?.texture}" alt=""></span>
            <span class="cfg-choice__text"><small>Материал</small><b>${esc(st?.name)}</b>${stoneNote(part.stone)}</span>
          </button>
        </div>
      </div>`;
  },

  stoneStrip(field, current) {
    return `
      <div class="stone-strip">${this.stones.map(s => `
        <button class="stone-dot${s.id === current ? ' active' : ''}" data-set="${field}" data-value="${s.id}" title="${esc(s.name)}">
          <img src="${s.texture}" alt=""><span>${esc(s.name)}</span>
        </button>`).join('')}
      </div>`;
  },

  chips(field, options, current) {
    return `<div class="catalog-chips">${options.map(([value, label, iconHtml]) => `
      <button class="catalog-chip${iconHtml ? ' catalog-chip--icon' : ''}${String(value) === String(current) ? ' active' : ''}" data-set="${field}" data-value="${value}">${iconHtml || ''}${label}</button>`).join('')}</div>`;
  },

  // === Окно выбора: сетка по 3 в ряд, выбор применяется кнопкой «Сохранить» ===
  openPicker(kind, key) {
    const r = PATTERN_ROWS.find(x => x.key === key);
    const part = this.spec.parts[key];
    let chosen = kind === 'stone' ? part.stone : part.item;
    const cells = kind === 'stone' ? this.stoneCells() : this.patternCells(r);
    showModal(`
      <div class="picker" id="picker">
        <div class="picker__head"><b>${kind === 'stone' ? 'Материал' : 'Узор'}</b><span>${r.title}</span></div>
        <div class="picker__grid">${cells.map(c => `
          <button class="picker__cell${String(c.value) === String(chosen ?? '') ? ' active' : ''}" data-value="${c.value}">
            <span class="picker__img${c.cover ? ' picker__img--cover' : ''}">${c.img ? `<img src="${c.img}" ${c.recolor ? `data-recolor="${c.recolor}"` : ''} alt="" loading="lazy">` : '<span class="pick__none">—</span>'}</span>
            <span class="picker__name">${esc(c.name)}</span>${c.note ? `<span class="picker__note">${esc(c.note)}</span>` : ''}
          </button>`).join('')}</div>
        <div class="picker__bar">
          ${kind === 'stone' ? '<button class="btn btn-secondary" data-picker-all>Для всех изделий</button>' : ''}
          <button class="btn btn-primary" data-picker-save>Сохранить</button>
        </div>
      </div>`);
    const box = document.getElementById('picker');
    if (kind === 'pattern') StonePreview.recolorAll(box, this.partStone(key), this.catalog.variants, 240);
    box.querySelector('.picker__cell.active')?.scrollIntoView({ block: 'center' });
    box.addEventListener('click', e => {
      const cell = e.target.closest('.picker__cell');
      if (cell) {
        chosen = cell.dataset.value;
        box.querySelectorAll('.picker__cell').forEach(c => c.classList.toggle('active', c === cell));
        return;
      }
      const all = e.target.closest('[data-picker-all]');
      if (!e.target.closest('[data-picker-save]') && !all) return;
      if (kind === 'pattern') part.item = chosen || null;
      else if (all) Object.values(this.spec.parts).forEach(p => { p.stone = chosen; });
      else part.stone = chosen;
      this.save();
      closeModal();
      this.redraw();
      if (all) showToast('Камень выбран для всех изделий');
    });
  },

  stoneCells() {
    const m = this.spec.materials;
    const cells = [{ value: 'main', name: 'Как стены', note: this.stone(m.main.stone)?.name, img: this.stone(m.main.stone)?.texture, cover: true }];
    if (m.base.on) cells.push({ value: 'base', name: 'Как цоколь', note: this.stone(m.base.stone)?.name, img: this.stone(m.base.stone)?.texture, cover: true });
    return cells.concat(this.stones.map(s => ({ value: s.id, name: s.name, img: s.texture, cover: true })));
  },

  patternCells(r) {
    const cells = [{ value: '', name: 'Нет' }];
    r.sections.forEach(sid => {
      const sec = this.catalog.sections.find(s => s.id === sid);
      sec?.items.filter(i => !r.match || r.match.test(i.name)).forEach(item => item.variants.forEach(v => {
        if (r.skipTall && v.tall) return;
        cells.push({ value: v.id, name: item.name, note: `${v.size}${v.look ? ` · вид ${v.look}` : ''}`, img: v.image, recolor: v.id });
      }));
    });
    return cells;
  },

  // Образцы плитки и изделия в камне своей части
  afterDraw(box) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    box.querySelectorAll('[data-preview]').forEach(c => {
      const part = this.spec.materials[c.dataset.preview];
      c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(150 * dpr);
      StonePreview.renderWall(c, { ...part, stone: this.stone(part.stone), spanMm: 1400 });
    });
    box.querySelectorAll('[data-slab]').forEach(c => {
      const part = this.spec.materials[c.dataset.slab];
      c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(150 * dpr);
      StonePreview.renderSlab(c, { ...part, stone: this.stone(part.stone) });
    });
    box.querySelectorAll('[data-row]').forEach(row => StonePreview.recolorAll(row, this.partStone(row.dataset.row), this.catalog.variants, 240));
    box.querySelectorAll('.stone-strip .active').forEach(el => {
      const strip = el.parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    });
  },

  // Перерисовать экран; без top — сохранить прокрутку страницы и лент образцов
  redraw(top) {
    const box = document.getElementById('configure-parts');
    const strips = [...box.querySelectorAll('.stone-strip')].map(s => s.scrollLeft);
    const y = window.scrollY;
    box.innerHTML = this.step === 1 ? this.materialsHtml() : this.patternsHtml();
    this.afterDraw(box);
    if (top) return;
    box.querySelectorAll('.stone-strip').forEach((s, i) => { if (strips[i] != null) s.scrollLeft = strips[i]; });
    window.scrollTo(0, y);
  },

  goStep(n) {
    ProjectFlow.setState('step', n);  // черновик на главной покажет, где остановились
    if (n === 3) {
      this.save();
      return Router.navigateTo('spec');
    }
    this.step = n;
    this.draw();
    window.scrollTo(0, 0);
  },

  onClick(e) {
    const pat = e.target.closest('[data-open-pattern]');
    if (pat) return this.openPicker('pattern', pat.dataset.openPattern);
    const st = e.target.closest('[data-open-stone]');
    if (st) return this.openPicker('stone', st.dataset.openStone);
    const set = e.target.closest('[data-set]');
    if (set) {
      const [, key, field] = set.dataset.set.split(':');
      const value = set.dataset.value;
      const part = this.spec.materials[key];
      part[field] = field === 'thickness' ? +value : value;
      // Новый камень может не выпускаться в выбранном формате или толщине
      if (field === 'stone') {
        const s = this.stone(value);
        if (!s.formats.includes(part.format)) part.format = s.formats[0];
        if (!s.thickness.includes(part.thickness)) part.thickness = s.thickness[0];
      }
      this.save();
      return this.redraw();
    }
  },

  onChange(e) {
    if (!e.target.matches('[data-base-on]')) return;
    this.spec.materials.base.on = e.target.checked;
    this.save();
    this.redraw();
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('configure-parts');
    box.addEventListener('click', e => this.onClick(e));
    box.addEventListener('change', e => this.onChange(e));
    document.getElementById('configure-back').addEventListener('click', () => {
      if (this.step > 1) return this.goStep(this.step - 1);
      const edit = ProjectFlow.getState('editProject');
      if (!edit) return Router.navigateTo('photo');
      // Правка варианта: назад — в проект, без сохранения
      ProjectFlow.clearDraft();
      openProject(edit.projectId, edit.variantId);
    });
    document.getElementById('configure-prev').addEventListener('click', () => this.goStep(this.step - 1));
    document.getElementById('configure-next').addEventListener('click', () => this.goStep(this.step + 1));
    document.getElementById('configure-steps').addEventListener('click', e => {
      const b = e.target.closest('[data-flow-step]');
      if (b) this.goStep(+b.dataset.flowStep);
    });
  },
};

// Части, которых не было, когда подбор сохраняли (например, карниз над окном) — пустые, камень как стены
function addMissingParts(spec) {
  PATTERN_ROWS.forEach(r => { if (!spec.parts[r.key]) spec.parts[r.key] = { item: null, stone: 'main' }; });
  return spec;
}

// Камень части: 'main' — как стены, 'base' — как цоколь (без цоколя — как стены), иначе id камня
function resolveStone(spec, value) {
  const m = spec.materials;
  if (value === 'main') return m.main.stone;
  if (value === 'base') return m.base.on ? m.base.stone : m.main.stone;
  return value;
}

function stoneNote(value) {
  return value === 'main' ? '<small>как стены</small>' : value === 'base' ? '<small>как цоколь</small>' : '';
}

// Полоса шагов подбора: 1 Плитка · 2 Узоры · 3 Итог
function flowSteps(current) {
  return ['Плитка', 'Узоры', 'Итог'].map((t, i) => `
    <button class="flow-step${i + 1 === current ? ' active' : ''}${i + 1 < current ? ' done' : ''}" data-flow-step="${i + 1}">
      <span>${i + 1}</span>${t}</button>`).join('');
}

// === Спецификация: что из чего на фасаде ===

// Части старого подбора (проекты, сохранённые до трёх экранов)
const PARTS_V3 = [
  { key: 'main', title: 'Основная плитка', icon: 'wall', type: 'tile' },
  { key: 'base', title: 'Цоколь', icon: 'base', type: 'tile' },
  { key: 'topCornice', title: 'Верхний карниз', icon: 'cornice' },
  { key: 'floorCornice', title: 'Межэтажный карниз', icon: 'cornice' },
  { key: 'baseCornice', title: 'Цокольный карниз / плинтус', icon: 'plinth' },
  { key: 'windows', title: 'Обрамление окон', icon: 'opening', type: 'windows' },
  { key: 'dentils', title: 'Зубцы', icon: 'dentil' },
  { key: 'corners', title: 'Углы дома — русты', icon: 'rust' },
  { key: 'columns', title: 'Колонны и пилястры', icon: 'column' },
  { key: 'balustrade', title: 'Балюстрада', icon: 'balustrade', type: 'balustrade' },
];
// Группа камня частей в подборе версии 4
const V4_GROUPS = { topCornice: 'cornice', floorCornice: 'cornice', baseCornice: 'cornice', dentils: 'cornice', frame: 'windows', windowCornice: 'windows', sill: 'windows',
  keystone: 'windows', console: 'windows', corners: 'corners', column: 'columns', capital: 'columns', baluster: 'columns', post: 'columns', rail: 'columns', finial: 'columns' };
const ROW_ICONS = { topCornice: 'cornice', floorCornice: 'cornice', baseCornice: 'plinth', dentils: 'dentil', frame: 'opening', windowCornice: 'cornice', sill: 'opening',
  keystone: 'opening', console: 'opening', corners: 'rust', column: 'column', capital: 'column', baluster: 'balustrade', post: 'balustrade', rail: 'balustrade', finial: 'balustrade' };

function tileDetails(part) {
  return `${part.format.replace('x', '×')}×${part.thickness} мм, ${EDGE_NAMES[part.edge]}, ${SURFACE_NAMES[part.surface]}, ${LAYOUTS[part.layout]?.name.toLowerCase()}, ${JOINT_COLORS[part.joint]?.name.toLowerCase()}`;
}

// Строки спецификации: [значок, часть, что выбрано, подробности, картинка, id изделия, id камня]
function specLines(spec, stones, catalog) {
  const stoneById = id => stones.find(s => s.id === id);
  const lines = [];
  if (spec?.version === 5) {
    const m = spec.materials;
    lines.push(['wall', 'Стены — плитка', stoneById(m.main.stone)?.name || '', tileDetails(m.main), stoneById(m.main.stone)?.texture]);
    if (m.base.on) lines.push(['base', 'Цоколь', stoneById(m.base.stone)?.name || '', tileDetails(m.base), stoneById(m.base.stone)?.texture]);
    PATTERN_ROWS.forEach(r => {
      const part = spec.parts[r.key];
      const v = catalog.variants[part?.item];
      const sid = resolveStone(spec, part?.stone);
      if (v) lines.push([ROW_ICONS[r.key], r.title, v.name, `${v.size} мм, ${stoneById(sid)?.name || ''}`, v.image, v.id, sid]);
    });
  } else if (spec?.version === 4) {
    // Подбор с камнем по группам (недолго был на сайте)
    const m = spec.materials;
    const groupStone = g => (m.groups[g] === 'main' ? m.main.stone : m.groups[g] === 'base' ? (m.base.on ? m.base.stone : m.main.stone) : m.groups[g]);
    lines.push(['wall', 'Стены — плитка', stoneById(m.main.stone)?.name || '', tileDetails(m.main), stoneById(m.main.stone)?.texture]);
    if (m.base.on) lines.push(['base', 'Цоколь', stoneById(m.base.stone)?.name || '', tileDetails(m.base), stoneById(m.base.stone)?.texture]);
    PATTERN_ROWS.forEach(r => {
      const v = catalog.variants[spec.parts[r.key]];
      const sid = groupStone(V4_GROUPS[r.key]);
      if (v) lines.push([ROW_ICONS[r.key], r.title, v.name, `${v.size} мм, ${stoneById(sid)?.name || ''}`, v.image, v.id, sid]);
    });
  } else {
    const stoneName = id => stoneById(id)?.name || '';
    PARTS_V3.forEach(p => {
      const part = spec?.parts?.[p.key];
      if (!part?.on) return;
      if (p.type === 'tile') {
        lines.push([p.icon, p.title, stoneName(part.stone), tileDetails(part), stoneById(part.stone)?.texture]);
      } else if (p.type === 'windows') {
        [['frame', 'Наличник'], ['keystone', 'Замок / клин'], ['sill', 'Подоконник'], ['console', 'Консоли']].forEach(([f, t]) => {
          const v = catalog.variants[part[f]];
          if (v) lines.push(['opening', t, v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id, part.stone]);
        });
      } else if (p.type === 'balustrade') {
        ['baluster', 'post', 'rail', 'finial'].forEach(f => {
          const v = catalog.variants[part[f]];
          if (v) lines.push(['balustrade', 'Балюстрада', v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id, part.stone]);
        });
      } else {
        [part.item, part.capital].forEach(id => {
          const v = catalog.variants[id];
          if (v) lines.push([p.icon, p.title, v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id, part.stone]);
        });
      }
    });
  }
  const b = spec?.building || {};
  if (b.floors || b.heightM) lines.push(['fit', 'Здание', [b.floors ? `${b.floors} эт.` : '', b.heightM ? `${b.heightM} м` : ''].filter(Boolean).join(', '), '', null]);
  return lines;
}

// Текст спецификации — для отправки заказчику и как основа задания для ИИ
function specText(spec, stones, catalog) {
  return specLines(spec, stones, catalog).map(([, part, value, details]) => `• ${part}: ${value}${details ? ` (${details})` : ''}`).join('\n');
}

function specHtml(spec, stones, catalog) {
  return specLines(spec, stones, catalog).map(([ic, part, value, details, img, vid, sid]) => `
    <div class="spec-line">
      <span class="spec-line__img">${img ? `<img src="${img}" ${vid ? `data-recolor="${vid}" data-stone="${sid || ''}"` : ''} alt="">` : icon(ic)}</span>
      <span class="spec-line__text">
        <span class="spec-line__part">${esc(part)}</span>
        <span class="spec-line__value">${esc(value)}</span>
        ${details ? `<span class="spec-line__details">${esc(details)}</span>` : ''}
      </span>
    </div>`).join('');
}

// Изделия в спецификации — в своём камне
function recolorSpec(box, stones, catalog) {
  for (const el of box.querySelectorAll('img[data-recolor]')) {
    const v = catalog.variants[el.dataset.recolor];
    const stone = stones.find(s => s.id === el.dataset.stone);
    if (v && stone) StonePreview.recolor(v, stone, 160).then(c => { if (el.isConnected) el.src = c.toDataURL('image/webp', 0.9); });
  }
}

const Spec = {
  bound: false,

  async render() {
    const spec = ProjectFlow.getState('design');
    if (!spec || spec.version !== 5) return Router.navigateTo('configure');
    this.bind();
    document.getElementById('spec-steps').innerHTML = flowSteps(3);
    const edit = ProjectFlow.getState('editProject');
    document.getElementById('spec-save').textContent = edit ? 'Сохранить вариант' : 'Сохранить в проекты';
    this.renderCost();
    Wallet.load();
    AiChoice.render();
    document.getElementById('spec-edit-note').hidden = !edit;
    if (edit) document.getElementById('spec-edit-note').textContent = `Новый вариант проекта «${edit.name || 'Проект'}». Прежние варианты останутся.`;
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    document.getElementById('spec-photo').src = ProjectFlow.getState('originalPhoto');
    this.drawBuilding(spec);
    const box = document.getElementById('spec-list');
    box.innerHTML = specHtml(spec, stones, catalog);
    recolorSpec(box, stones, catalog);
  },

  // Текст главной кнопки с ценой генерации в монетах
  renderCost() {
    const btn = document.getElementById('spec-generate');
    if (!btn) return;
    btn.innerHTML = `${ProjectFlow.getState('editProject') ? 'Сохранить и сгенерировать' : 'Сгенерировать фасад'} ${AiChoice.costHtml()}`;
  },

  // Размер здания — для расчёта количества плитки и изделий
  drawBuilding(spec) {
    const b = spec.building;
    document.getElementById('spec-building').innerHTML = `
      <div class="stepper-row"><span>Этажей</span>
        <div class="editor-stepper"><button data-step="floors" data-d="-1">−</button><span>${b.floors || '—'}</span><button data-step="floors" data-d="1">+</button></div></div>
      <div class="stepper-row"><span>Высота фасада, м</span>
        <div class="editor-stepper"><button data-step="heightM" data-d="-0.5">−</button><span>${b.heightM || '—'}</span><button data-step="heightM" data-d="0.5">+</button></div></div>`;
  },

  async share() {
    const spec = ProjectFlow.getState('design');
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    const text = `Фасад — подбор материалов\n${specText(spec, stones, catalog)}`;
    try {
      const blob = await (await fetch(ProjectFlow.getState('originalPhoto'))).blob();
      const file = new File([blob], 'fasad.jpg', { type: blob.type || 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file], text })) {
        await navigator.share({ files: [file], text, title: 'Подбор фасада' });
        return;
      }
      if (navigator.share) {
        await navigator.share({ text, title: 'Подбор фасада' });
        return;
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Спецификация скопирована');
    } catch {
      showToast('Не удалось поделиться');
    }
  },

  // Правка проекта: подбор сохраняется новым вариантом, generate — сразу запросить картинку
  async saveVariant(generate) {
    const edit = ProjectFlow.getState('editProject');
    const btn = document.getElementById(generate ? 'spec-generate' : 'spec-save');
    btn.disabled = true;
    try {
      const res = await Api.projectVariant(edit.projectId, 'add', { design: ProjectFlow.getState('design') });
      const vs = res.data.variants;
      const newId = vs[vs.length - 1].id;
      ProjectFlow.clearDraft();
      showToast(`Сохранён вариант ${vs.length}`);
      if (generate) {
        try {
          await ProjectPage.generate(edit.projectId, newId, vs[vs.length - 1].design);
        } catch (e) {
          if (!Wallet.handleError(e)) showToast(`Вариант сохранён. ${e.message}`);
        }
      }
      openProject(edit.projectId, newId);
    } catch (e) {
      if ((e.message || '').includes('Не авторизован')) {
        Auth._user = null;
        showAuthModal();
      }
      showToast(e.message || 'Не удалось сохранить вариант');
    } finally {
      btn.disabled = false;
    }
  },

  // Новый проект; generate — сразу отдать первый вариант ИИ
  async saveProject(generate = false) {
    if (ProjectFlow.getState('editProject')) return this.saveVariant(generate);
    if (!Auth.isLoggedIn()) {
      showAuthModal();
      showToast('Войдите, чтобы сохранить проект');
      return;
    }
    const btn = document.getElementById(generate ? 'spec-generate' : 'spec-save');
    btn.disabled = true;
    try {
      const photo = await (await fetch(ProjectFlow.getState('originalPhoto'))).blob();
      const up = await Api.uploadImage(new File([photo], 'original.jpg', { type: photo.type || 'image/jpeg' }));
      const now = new Date();
      const project = await Api.createProject({
        name: `Фасад ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
        original_image: up.data.url,
        design: ProjectFlow.getState('design'),
      });
      const design = ProjectFlow.getState('design');
      ProjectFlow.clearDraft();
      showToast('Проект сохранён');
      if (generate) {
        try {
          await ProjectPage.generate(project.data.id, 1, design);  // у нового проекта вариант 1
        } catch (e) {
          if (!Wallet.handleError(e)) showToast(`Проект сохранён. ${e.message}`);
        }
      }
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

  onStep(e) {
    const step = e.target.closest('[data-step]');
    if (!step) return;
    const spec = ProjectFlow.getState('design');
    const b = spec.building;
    const f = step.dataset.step, d = parseFloat(step.dataset.d);
    const base = b[f] || (f === 'floors' ? 0 : 3);
    b[f] = Math.max(0, Math.round((base + d) * 10) / 10) || null;
    ProjectFlow.setState('design', spec);
    this.drawBuilding(spec);  // сразу, чтобы быстрые нажатия не терялись
    this.render();
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const toConfigure = (n) => { Configurator.step = n; Router.navigateTo('configure'); };
    document.getElementById('spec-back').addEventListener('click', () => toConfigure(2));
    document.getElementById('spec-edit').addEventListener('click', () => toConfigure(2));
    document.getElementById('spec-steps').addEventListener('click', e => {
      const b = e.target.closest('[data-flow-step]');
      if (b && +b.dataset.flowStep < 3) toConfigure(+b.dataset.flowStep);
    });
    document.getElementById('spec-building').addEventListener('click', e => this.onStep(e));
    document.getElementById('spec-share').addEventListener('click', () => this.share());
    document.getElementById('spec-save').addEventListener('click', () => this.saveProject());
    document.getElementById('spec-generate').addEventListener('click', () => this.saveProject(true));
  },
};

// Список материалов в карточке сохранённого проекта
function summarizeDesign(design, stones, catalog) {
  if ([3, 4, 5].includes(design?.version)) return specHtml(design, stones, catalog);
  return '';
}

function onScreenConfigure() {
  Configurator.render();
}

function onScreenSpec() {
  Spec.render();
}
