// === Подбор фасада: три экрана ===
// 1. Материалы — плитка стен и цоколя, из какого камня изделия.
// 2. Узоры — модели карнизов, плинтусов, окон, углов, колонн; карточки уже в камне своей группы.
// 3. Итог — размер здания и спецификация (экран spec).

const DEFAULT_MAIN_STONE = 'akushinskiy-kremovyy';
const DEFAULT_DECOR_STONE = 'akushinskiy-belyy';

const EDGE_NAMES = { none: 'без фаски', chamfer: 'фаска скос', convex: 'фаска скруглённая', concave: 'фаска вогнутая', rabbet: 'фаска четверть' };
const SURFACE_NAMES = { sawn: 'пиленая', split: 'отбитая' };

const TILE_DEFAULTS = {
  main: { stone: DEFAULT_MAIN_STONE, format: '300x600', thickness: 20, edge: 'chamfer', surface: 'sawn', layout: 'running', joint: 'light' },
  base: { stone: 'mekeginskiy', format: '300x600', thickness: 25, edge: 'chamfer', surface: 'split', layout: 'running', joint: 'grey' },
};

// Группы изделий: из какого камня делать. Значение: 'main' — как стены, 'base' — как цоколь, иначе id камня
const STONE_GROUPS = [
  { key: 'cornice', title: 'Карнизы, плинтусы, зубцы', icon: 'cornice' },
  { key: 'windows', title: 'Окна: наличники, подоконники, замки', icon: 'opening' },
  { key: 'corners', title: 'Углы дома — русты', icon: 'rust' },
  { key: 'columns', title: 'Колонны и балюстрада', icon: 'column' },
];

// Узоры: часть фасада → разделы каталога, из которых выбирают. def — модель по умолчанию (по названию)
const PATTERN_GROUPS = [
  { group: 'cornice', title: 'Карнизы и пояса', rows: [
    { key: 'topCornice', title: 'Венчающий карниз', sections: ['cornice'], def: /венчающий К-11/i },
    { key: 'floorCornice', title: 'Межэтажный карниз', sections: ['cornice', 'plinth'], def: /межэтажный К-26/i },
    { key: 'baseCornice', title: 'Плинтус над цоколем', sections: ['plinth', 'cornice'], def: /^Плинтус П-15/ },
    { key: 'dentils', title: 'Зубцы под карнизом', sections: ['dentil'] },
  ] },
  { group: 'windows', title: 'Окна', rows: [
    { key: 'frame', title: 'Наличник', sections: ['cornice', 'plinth'], def: /^Карниз К-12$/ },
    { key: 'sill', title: 'Подоконник', sections: ['cornice', 'plinth'], def: /^Карниз К-37$/ },
    { key: 'keystone', title: 'Замок над окном', sections: ['keystone'], def: /^Замок простой/ },
    { key: 'console', title: 'Консоли под подоконник', sections: ['console'] },
  ] },
  { group: 'corners', title: 'Углы дома', rows: [
    { key: 'corners', title: 'Русты', sections: ['rust'], def: /^Русты стандартные/ },
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
const PATTERN_ROWS = PATTERN_GROUPS.flatMap(g => g.rows.map(r => ({ ...r, group: g.group })));

const Configurator = {
  spec: null,
  step: 1,
  otherOpen: {},   // для каких групп раскрыт выбор «другой камень»
  bound: false,

  newSpec(mainStone) {
    const spec = {
      version: 4,
      materials: {
        main: { ...TILE_DEFAULTS.main },
        base: { on: true, ...TILE_DEFAULTS.base },
        groups: { cornice: DEFAULT_DECOR_STONE, windows: DEFAULT_DECOR_STONE, corners: DEFAULT_DECOR_STONE, columns: DEFAULT_DECOR_STONE },
      },
      parts: Object.fromEntries(PATTERN_ROWS.map(r => [r.key, null])),
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
    if (draft?.version === 4) this.spec = draft;
    else if (this.spec?.version !== 4) { this.spec = this.newSpec(); this.step = 1; }
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
        if (item) { this.spec.parts[r.key] = item.variants[0].id; break; }
      }
    });
    this.spec.filled = true;
  },

  stone(id) {
    return this.stones.find(s => s.id === id) || this.stones[0];
  },

  // Камень группы изделий: как стены, как цоколь или свой
  groupStone(group) {
    const m = this.spec.materials, v = m.groups[group];
    if (v === 'main') return this.stone(m.main.stone);
    if (v === 'base') return this.stone(m.base.on ? m.base.stone : m.main.stone);
    return this.stone(v);
  },

  save() {
    ProjectFlow.setState('design', this.spec);
  },

  draw() {
    document.getElementById('configure-title').textContent = this.step === 1 ? 'Материалы' : 'Узоры';
    document.getElementById('configure-steps').innerHTML = flowSteps(this.step);
    document.getElementById('configure-hint').textContent = this.step === 1
      ? 'Из чего фасад: плитка стен и цоколя, камень для карнизов, окон, углов и колонн.'
      : 'Выберите модели. Карточки уже в камне своей группы, «Нет» — части не будет.';
    document.getElementById('configure-prev').hidden = this.step === 1;
    document.getElementById('configure-next').textContent = this.step === 1 ? 'Далее — узоры' : 'Далее — итог';
    const box = document.getElementById('configure-parts');
    box.innerHTML = this.step === 1 ? this.materialsHtml() : this.patternsHtml();
    this.afterDraw(box);
  },

  // === Экран 1: материалы ===
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
      </section>
      <section class="cfg-block">
        <h3 class="cfg-block__title">${icon('cornice')} Камень изделий</h3>
        ${STONE_GROUPS.map(g => this.groupStoneHtml(g)).join('')}
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

  groupStoneHtml(g) {
    const m = this.spec.materials, v = m.groups[g.key];
    const own = v !== 'main' && v !== 'base';
    const open = own || this.otherOpen[g.key];
    const opts = [['main', 'Как стены'], ...(m.base.on ? [['base', 'Как цоколь']] : []), ['other', 'Другой камень']];
    return `
      <div class="cfg-group">
        <div class="cfg-group__head"><span>${g.title}</span><b>${esc(this.groupStone(g.key)?.name)}</b></div>
        <div class="catalog-chips">${opts.map(([val, label]) => `
          <button class="catalog-chip${(val === 'other' ? own : v === val) ? ' active' : ''}" data-group-stone="${g.key}" data-value="${val}">${label}</button>`).join('')}</div>
        ${open ? this.stoneStrip(`group:${g.key}`, own ? v : null) : ''}
      </div>`;
  },

  // === Экран 2: узоры ===
  patternsHtml() {
    return PATTERN_GROUPS.map(g => `
      <section class="cfg-block" data-group="${g.group}">
        <h3 class="cfg-block__title">${g.title}
          <button class="cfg-stone" data-goto-materials title="Изменить камень">
            <img src="${this.groupStone(g.group)?.texture}" alt="">${esc(this.groupStone(g.group)?.name)}</button></h3>
        ${g.rows.map(r => this.rowHtml(r)).join('')}
      </section>`).join('');
  },

  rowHtml(r) {
    const current = this.spec.parts[r.key];
    const v = current ? this.catalog.variants[current] : null;
    const cards = [];
    r.sections.forEach(sid => {
      const sec = this.catalog.sections.find(s => s.id === sid);
      sec?.items.filter(i => !r.match || r.match.test(i.name)).forEach(item => item.variants.forEach(vv => {
        if (r.skipTall && vv.tall) return;
        cards.push(`
          <button class="pick${vv.id === current ? ' active' : ''}" data-part="${r.key}" data-value="${vv.id}">
            <span class="pick__img"><img src="${vv.image}" data-recolor="${vv.id}" alt="" loading="lazy"></span>
            <span class="pick__name">${esc(item.name)}</span>
            <span class="pick__size">${esc(vv.size)}${vv.look ? ` · вид ${vv.look}` : ''}</span>
          </button>`);
      }));
    });
    return `
      <div class="cfg-row">
        <div class="cfg-row__head"><span>${r.title}</span><b>${v ? esc(`${v.name} ${v.size}`) : 'Нет'}</b></div>
        <div class="pick-strip">
          <button class="pick${!current ? ' active' : ''}" data-part="${r.key}" data-value=""><span class="pick__img pick__none">—</span><span class="pick__name">Нет</span></button>
          ${cards.join('')}
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

  // Образцы плитки, перекраска изделий в камень группы, выбранное — в середину ленты
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
    box.querySelectorAll('[data-group]').forEach(sec => StonePreview.recolorAll(sec, this.groupStone(sec.dataset.group), this.catalog.variants, 240));
    box.querySelectorAll('.active').forEach(el => {
      const strip = el.parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    });
  },

  // Перерисовать экран, сохранив прокрутку страницы и лент
  redraw() {
    const box = document.getElementById('configure-parts');
    const strips = [...box.querySelectorAll('.pick-strip, .stone-strip')].map(s => s.scrollLeft);
    const y = window.scrollY;
    box.innerHTML = this.step === 1 ? this.materialsHtml() : this.patternsHtml();
    this.afterDraw(box);
    box.querySelectorAll('.pick-strip, .stone-strip').forEach((s, i) => { if (strips[i] != null) s.scrollLeft = strips[i]; });
    window.scrollTo(0, y);
  },

  goStep(n) {
    if (n === 3) {
      this.save();
      return Router.navigateTo('spec');
    }
    this.step = n;
    this.draw();
    window.scrollTo(0, 0);
  },

  onClick(e) {
    if (e.target.closest('[data-goto-materials]')) return this.goStep(1);
    const pick = e.target.closest('[data-part]');
    if (pick) {
      this.spec.parts[pick.dataset.part] = pick.dataset.value || null;
      this.save();
      return this.redraw();
    }
    const gs = e.target.closest('[data-group-stone]');
    if (gs) {
      const g = gs.dataset.groupStone, val = gs.dataset.value;
      if (val === 'other') this.otherOpen[g] = true;
      else { this.spec.materials.groups[g] = val; this.otherOpen[g] = false; }
      this.save();
      return this.redraw();
    }
    const set = e.target.closest('[data-set]');
    if (set) {
      const [kind, key, field] = set.dataset.set.split(':');
      const value = set.dataset.value;
      if (kind === 'group') {
        this.spec.materials.groups[key] = value;
      } else {
        const part = this.spec.materials[key];
        part[field] = field === 'thickness' ? +value : value;
        // Новый камень может не выпускаться в выбранном формате или толщине
        if (field === 'stone') {
          const st = this.stone(value);
          if (!st.formats.includes(part.format)) part.format = st.formats[0];
          if (!st.thickness.includes(part.thickness)) part.thickness = st.thickness[0];
        }
      }
      this.save();
      return this.redraw();
    }
  },

  onChange(e) {
    if (!e.target.matches('[data-base-on]')) return;
    const m = this.spec.materials;
    m.base.on = e.target.checked;
    // Без цоколя «как цоколь» теряет смысл — такие группы берут камень стен
    if (!m.base.on) Object.keys(m.groups).forEach(g => { if (m.groups[g] === 'base') m.groups[g] = 'main'; });
    this.save();
    this.redraw();
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('configure-parts');
    box.addEventListener('click', e => this.onClick(e));
    box.addEventListener('change', e => this.onChange(e));
    document.getElementById('configure-back').addEventListener('click', () => (this.step > 1 ? this.goStep(this.step - 1) : Router.navigateTo('photo')));
    document.getElementById('configure-prev').addEventListener('click', () => this.goStep(this.step - 1));
    document.getElementById('configure-next').addEventListener('click', () => this.goStep(this.step + 1));
    document.getElementById('configure-steps').addEventListener('click', e => {
      const b = e.target.closest('[data-flow-step]');
      if (b) this.goStep(+b.dataset.flowStep);
    });
  },
};

// Полоса шагов подбора: 1 Материалы · 2 Узоры · 3 Итог
function flowSteps(current) {
  return ['Материалы', 'Узоры', 'Итог'].map((t, i) => `
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
const ROW_ICONS = { topCornice: 'cornice', floorCornice: 'cornice', baseCornice: 'plinth', dentils: 'dentil', frame: 'opening', sill: 'opening',
  keystone: 'opening', console: 'opening', corners: 'rust', column: 'column', capital: 'column', baluster: 'balustrade', post: 'balustrade', rail: 'balustrade', finial: 'balustrade' };

function tileDetails(part) {
  return `${part.format.replace('x', '×')}×${part.thickness} мм, ${EDGE_NAMES[part.edge]}, ${SURFACE_NAMES[part.surface]}, ${LAYOUTS[part.layout]?.name.toLowerCase()}, ${JOINT_COLORS[part.joint]?.name.toLowerCase()}`;
}

// Строки спецификации: [значок, часть, что выбрано, подробности, картинка, id изделия, id камня]
function specLines(spec, stones, catalog) {
  const stoneById = id => stones.find(s => s.id === id);
  const lines = [];
  if (spec?.version === 4) {
    const m = spec.materials;
    const groupStone = g => (m.groups[g] === 'main' ? m.main.stone : m.groups[g] === 'base' ? (m.base.on ? m.base.stone : m.main.stone) : m.groups[g]);
    lines.push(['wall', 'Стены — плитка', stoneById(m.main.stone)?.name || '', tileDetails(m.main), stoneById(m.main.stone)?.texture]);
    if (m.base.on) lines.push(['base', 'Цоколь', stoneById(m.base.stone)?.name || '', tileDetails(m.base), stoneById(m.base.stone)?.texture]);
    PATTERN_ROWS.forEach(r => {
      const v = catalog.variants[spec.parts[r.key]];
      const sid = groupStone(r.group);
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
    if (!spec || spec.version !== 4) return Router.navigateTo('configure');
    this.bind();
    document.getElementById('spec-steps').innerHTML = flowSteps(3);
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    document.getElementById('spec-photo').src = ProjectFlow.getState('originalPhoto');
    this.drawBuilding(spec);
    const box = document.getElementById('spec-list');
    box.innerHTML = specHtml(spec, stones, catalog);
    recolorSpec(box, stones, catalog);
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

  async saveProject() {
    if (!Auth.isLoggedIn()) {
      showAuthModal();
      showToast('Войдите, чтобы сохранить проект');
      return;
    }
    const btn = document.getElementById('spec-save');
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
    document.getElementById('spec-generate').addEventListener('click', () => showToast('Генерацию ИИ подключим на следующем этапе'));
  },
};

// Список материалов в карточке сохранённого проекта
function summarizeDesign(design, stones, catalog) {
  if (design?.version === 3 || design?.version === 4) return specHtml(design, stones, catalog);
  return '';
}

function onScreenConfigure() {
  Configurator.render();
}

function onScreenSpec() {
  Spec.render();
}
