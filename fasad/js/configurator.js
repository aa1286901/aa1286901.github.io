// === Подбор фасада ===
// Прораб сфотографировал дом и по частям выбирает из каталога: основная плитка, цоколь,
// карнизы, обрамление окон, зубцы, русты, колонны, балюстрада. Итог — спецификация,
// по которой потом будет работать ИИ-генерация.

const DEFAULT_MAIN_STONE = 'akushinskiy-kremovyy';
const DEFAULT_DECOR_STONE = 'akushinskiy-belyy';

const EDGE_NAMES = { none: 'без фаски', chamfer: 'фаска скос', convex: 'фаска скруглённая', concave: 'фаска вогнутая', rabbet: 'фаска четверть' };
const SURFACE_NAMES = { sawn: 'пиленая', split: 'отбитая' };

// Части фасада. type: tile — плитка; item — одно изделие из разделов; windows, columns, balustrade — составные
const PARTS = [
  { key: 'main', title: 'Основная плитка', icon: 'wall', type: 'tile', required: true,
    defaults: { stone: DEFAULT_MAIN_STONE, format: '300x600', thickness: 20, edge: 'chamfer', surface: 'sawn', layout: 'running', joint: 'light' } },
  { key: 'base', title: 'Цоколь', icon: 'base', type: 'tile',
    defaults: { stone: 'mekeginskiy', format: '300x600', thickness: 25, edge: 'chamfer', surface: 'split', layout: 'running', joint: 'grey' } },
  { key: 'topCornice', title: 'Верхний карниз', icon: 'cornice', type: 'item', sections: ['cornice'],
    defaults: { item: 'cornice-karniz-venchayuschiy-k-11-160-360-160' } },
  { key: 'floorCornice', title: 'Межэтажный карниз', icon: 'cornice', type: 'item', sections: ['cornice'],
    defaults: { item: 'cornice-karniz-mezhetazhnyy-k-26-160-360-80' } },
  { key: 'baseCornice', title: 'Цокольный карниз / плинтус', icon: 'plinth', type: 'item', sections: ['plinth', 'cornice'] },
  { key: 'windows', title: 'Обрамление окон', icon: 'opening', type: 'windows' },
  { key: 'dentils', title: 'Зубцы', icon: 'dentil', type: 'item', sections: ['dentil'] },
  { key: 'corners', title: 'Углы дома — русты', icon: 'rust', type: 'item', sections: ['rust'],
    defaults: { item: 'rust-rusty-standartnye-160-360-35' } },
  { key: 'columns', title: 'Колонны и пилястры', icon: 'column', type: 'columns' },
  { key: 'balustrade', title: 'Балюстрада', icon: 'balustrade', type: 'balustrade' },
];

// Что входит в обрамление окна: поле, раздел каталога и фильтр по названию
const WINDOW_SLOTS = [
  { field: 'frame', title: 'Наличник', section: 'window', match: /^Наличник/ },
  { field: 'keystone', title: 'Замок / клин', section: 'keystone' },
  { field: 'sill', title: 'Подоконник', section: 'window', match: /^Подоконник/ },
  { field: 'console', title: 'Консоли', section: 'console' },
];

const Configurator = {
  spec: null,
  open: 'main',         // раскрытая часть
  bound: false,

  newSpec(mainStone) {
    const parts = {};
    PARTS.forEach(p => {
      parts[p.key] = { on: !!p.required || ['topCornice', 'windows'].includes(p.key), stone: DEFAULT_DECOR_STONE, ...(p.defaults || {}) };
    });
    parts.windows = { ...parts.windows, frame: null, keystone: null, sill: null, console: null };
    if (mainStone) parts.main.stone = mainStone;
    return { version: 3, parts, building: { floors: null, heightM: null } };
  },

  // Из страницы камня: «Подобрать фасад с этим камнем»
  startWithStone(stoneId) {
    this.spec = this.newSpec(stoneId);
    ProjectFlow.setState('design', this.spec);
    Router.navigateTo(ProjectFlow.getState('originalPhoto') ? 'configure' : 'photo');
    if (!ProjectFlow.getState('originalPhoto')) showToast('Сфотографируйте дом или выберите фото — камень уже выбран');
  },

  async render() {
    if (!ProjectFlow.getState('originalPhoto')) return Router.navigateTo('photo');
    this.bind();
    const draft = ProjectFlow.getState('design');
    this.spec = draft?.version === 3 ? draft : (this.spec?.version === 3 ? this.spec : this.newSpec());
    ProjectFlow.setState('design', this.spec);
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    this.stones = stones;
    this.catalog = catalog;
    await this.fillDefaults();

    document.getElementById('configure-photo').src = ProjectFlow.getState('originalPhoto');
    const box = document.getElementById('configure-parts');
    box.innerHTML = PARTS.map(p => this.partCard(p)).join('') + this.buildingCard();
    this.afterRender();
  },

  // Изделие по умолчанию — первое из раздела, если в каталоге нет нужного
  async fillDefaults() {
    const firstOf = (sections, match) => {
      for (const sid of sections) {
        const sec = this.catalog.sections.find(s => s.id === sid);
        const item = sec?.items.find(i => !match || match.test(i.name));
        if (item) return item.variants[0].id;
      }
      return null;
    };
    PARTS.forEach(p => {
      const part = this.spec.parts[p.key];
      if (p.type === 'item' && !this.catalog.variants[part.item]) part.item = firstOf(p.sections);
      if (p.type === 'columns' && !this.catalog.variants[part.item]) part.item = firstOf(['column']);
      if (p.type === 'balustrade') {
        if (!this.catalog.variants[part.baluster]) part.baluster = firstOf(['balustrade'], /^Балясина/);
        if (!this.catalog.variants[part.post]) part.post = firstOf(['balustrade'], /^Тумба/);
        if (!this.catalog.variants[part.rail]) part.rail = firstOf(['balustrade'], /^Перила/);
      }
    });
  },

  stone(id) {
    return this.stones.find(s => s.id === id) || this.stones[0];
  },

  variant(id) {
    return id ? this.catalog.variants[id] : null;
  },

  // Короткое описание выбора части — видно, не раскрывая карточку
  summary(p) {
    const part = this.spec.parts[p.key];
    if (!part.on) return 'как на фото';
    const st = this.stone(part.stone)?.name || '';
    if (p.type === 'tile') {
      return `${st}, ${part.format.replace('x', '×')}×${part.thickness}, ${EDGE_NAMES[part.edge]}, ${SURFACE_NAMES[part.surface]}`;
    }
    if (p.type === 'windows') {
      const parts = WINDOW_SLOTS.map(s => this.variant(part[s.field])?.name).filter(Boolean);
      return parts.length ? `${parts.join(', ')} · ${st}` : 'выберите элементы';
    }
    if (p.type === 'balustrade') return `${this.variant(part.baluster)?.name || ''} · ${st}`;
    const v = this.variant(part.item);
    return v ? `${v.name}${v.size ? ' ' + v.size : ''} · ${st}` : st;
  },

  partCard(p) {
    const part = this.spec.parts[p.key];
    const open = this.open === p.key;
    return `
      <section class="part${open ? ' open' : ''}${part.on ? '' : ' off'}" data-part="${p.key}">
        <header class="part__head" data-toggle-open="${p.key}">
          <span class="part__icon">${icon(p.icon)}</span>
          <span class="part__text">
            <span class="part__title">${p.title}</span>
            <span class="part__summary">${esc(this.summary(p))}</span>
          </span>
          ${p.required ? '' : `<label class="switch" data-stop><input type="checkbox" data-switch="${p.key}" ${part.on ? 'checked' : ''}><span></span></label>`}
        </header>
        ${open && part.on ? `<div class="part__body">${this.partBody(p)}</div>` : ''}
      </section>`;
  },

  stoneStrip(field, current) {
    return `
      <div class="stone-strip">${this.stones.map(s => `
        <button class="stone-dot${s.id === current ? ' active' : ''}" data-set="${field}" data-value="${s.id}">
          <img src="${s.texture}" alt=""><span>${esc(s.name)}</span>
        </button>`).join('')}
      </div>`;
  },

  chips(field, options, current) {
    return `<div class="catalog-chips">${options.map(([value, label, iconHtml]) => `
      <button class="catalog-chip${iconHtml ? ' catalog-chip--icon' : ''}${String(value) === String(current) ? ' active' : ''}" data-set="${field}" data-value="${value}">${iconHtml || ''}${label}</button>`).join('')}</div>`;
  },

  // Сетка изделий в выбранном камне; withNone — можно выбрать «нет»
  itemGrid(field, sections, current, match, withNone) {
    const cards = [];
    sections.forEach(sid => {
      const sec = this.catalog.sections.find(s => s.id === sid);
      sec?.items.filter(i => !match || match.test(i.name)).forEach(item => item.variants.forEach(v => {
        cards.push(`
          <button class="pick${v.id === current ? ' active' : ''}" data-set="${field}" data-value="${v.id}">
            <span class="pick__img"><img src="${v.image}" data-recolor="${v.id}" alt="" loading="lazy"></span>
            <span class="pick__name">${esc(item.name)}</span>
            <span class="pick__size">${esc(v.size)}${v.look ? ` · вид ${v.look}` : ''}</span>
          </button>`);
      }));
    });
    return `<div class="pick-strip">
      ${withNone ? `<button class="pick${!current ? ' active' : ''}" data-set="${field}" data-value=""><span class="pick__img pick__none">—</span><span class="pick__name">Нет</span></button>` : ''}
      ${cards.join('')}
    </div>`;
  },

  partBody(p) {
    const part = this.spec.parts[p.key];
    const t = this.catalog.tile;
    if (p.type === 'tile') {
      const st = this.stone(part.stone);
      return `
        <div class="opt-label">Камень: <b>${esc(st?.name)}</b></div>
        ${this.stoneStrip('stone', part.stone)}
        <canvas class="part-preview" data-preview="${p.key}"></canvas>
        <div class="opt-label">Фаска</div>
        ${this.chips('edge', t.edges.map(e => [e.id, e.name, edgeIcon(e.id)]), part.edge)}
        <div class="opt-label">Поверхность</div>
        ${this.chips('surface', t.surfaces.map(e => [e.id, e.name]), part.surface)}
        <div class="opt-label">Формат, мм</div>
        ${this.chips('format', (st?.formats || t.formats).map(f => [f, f.replace('x', '×')]), part.format)}
        <div class="opt-label">Толщина, мм</div>
        ${this.chips('thickness', (st?.thickness || t.thickness).map(f => [f, String(f)]), part.thickness)}
        <canvas class="part-slab" data-slab="${p.key}"></canvas>
        <div class="opt-label">Раскладка</div>
        ${this.chips('layout', Object.entries(LAYOUTS).map(([k, l]) => [k, l.name]), part.layout)}
        <div class="opt-label">Шов</div>
        ${this.chips('joint', Object.entries(JOINT_COLORS).map(([k, l]) => [k, l.name]), part.joint)}`;
    }
    if (p.type === 'windows') {
      return WINDOW_SLOTS.map(slot => `
        <div class="opt-label">${slot.title}</div>
        ${this.itemGrid(slot.field, [slot.section], part[slot.field], slot.match, true)}`).join('') + `
        <div class="opt-label">Камень обрамления: <b>${esc(this.stone(part.stone)?.name)}</b></div>
        ${this.stoneStrip('stone', part.stone)}`;
    }
    if (p.type === 'columns') {
      return `
        <div class="opt-label">Колонна или пилястра</div>
        ${this.itemGrid('item', ['column', 'pilaster'], part.item)}
        <div class="opt-label">Капитель и база</div>
        ${this.itemGrid('capital', ['capital'], part.capital, null, true)}
        <div class="opt-label">Камень: <b>${esc(this.stone(part.stone)?.name)}</b></div>
        ${this.stoneStrip('stone', part.stone)}`;
    }
    if (p.type === 'balustrade') {
      return `
        <div class="opt-label">Балясина</div>
        ${this.itemGrid('baluster', ['balustrade'], part.baluster, /^Балясина/)}
        <div class="opt-label">Тумба</div>
        ${this.itemGrid('post', ['balustrade'], part.post, /^Тумба/, true)}
        <div class="opt-label">Перила</div>
        ${this.itemGrid('rail', ['balustrade'], part.rail, /^Перила/)}
        <div class="opt-label">Навершие</div>
        ${this.itemGrid('finial', ['balustrade'], part.finial, /^Навершие/, true)}
        <div class="opt-label">Камень: <b>${esc(this.stone(part.stone)?.name)}</b></div>
        ${this.stoneStrip('stone', part.stone)}`;
    }
    return `
      <div class="opt-label">Модель</div>
      ${this.itemGrid('item', p.sections, part.item)}
      <div class="opt-label">Камень: <b>${esc(this.stone(part.stone)?.name)}</b></div>
      ${this.stoneStrip('stone', part.stone)}`;
  },

  buildingCard() {
    const b = this.spec.building;
    const open = this.open === 'building';
    return `
      <section class="part${open ? ' open' : ''}" data-part="building">
        <header class="part__head" data-toggle-open="building">
          <span class="part__icon">${icon('fit')}</span>
          <span class="part__text">
            <span class="part__title">Размер здания</span>
            <span class="part__summary">${b.floors || b.heightM ? [b.floors ? `${b.floors} ${plural(b.floors, 'этаж', 'этажа', 'этажей')}` : '', b.heightM ? `высота ${b.heightM} м` : ''].filter(Boolean).join(', ') : 'по желанию — помогает соблюсти размер плитки'}</span>
          </span>
        </header>
        ${open ? `<div class="part__body">
          <div class="stepper-row"><span>Этажей</span>
            <div class="editor-stepper"><button data-step="floors" data-d="-1">−</button><span>${b.floors || '—'}</span><button data-step="floors" data-d="1">+</button></div></div>
          <div class="stepper-row"><span>Высота фасада, м</span>
            <div class="editor-stepper"><button data-step="heightM" data-d="-0.5">−</button><span>${b.heightM || '—'}</span><button data-step="heightM" data-d="0.5">+</button></div></div>
        </div>` : ''}
      </section>`;
  },

  // Образцы и перекраска изделий в раскрытой карточке
  afterRender() {
    const key = this.open;
    const p = PARTS.find(x => x.key === key);
    const card = document.querySelector(`.part[data-part="${key}"]`);
    if (!p || !card) return;
    const part = this.spec.parts[key];
    const stone = this.stone(part.stone);
    if (p.type === 'tile') {
      const c = card.querySelector('[data-preview]');
      const s = card.querySelector('[data-slab]');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c) {
        c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(150 * dpr);
        StonePreview.renderWall(c, { ...part, stone, spanMm: 1400 });
      }
      if (s) {
        s.width = Math.round(s.clientWidth * dpr); s.height = Math.round(150 * dpr);
        StonePreview.renderSlab(s, { ...part, stone });
      }
    }
    StonePreview.recolorAll(card, stone, this.catalog.variants);
    card.querySelectorAll('.active').forEach(el => {
      const strip = el.parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    });
  },

  redrawPart(key) {
    const p = PARTS.find(x => x.key === key);
    const card = document.querySelector(`.part[data-part="${key}"]`);
    if (!card) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = key === 'building' ? this.buildingCard() : this.partCard(p);
    card.replaceWith(tmp.firstElementChild);
    this.afterRender();
  },

  save() {
    ProjectFlow.setState('design', this.spec);
  },

  onClick(e) {
    if (e.target.closest('[data-stop]')) return;
    const head = e.target.closest('[data-toggle-open]');
    if (head) {
      const key = head.dataset.toggleOpen;
      const prev = this.open;
      this.open = prev === key ? null : key;
      if (prev && prev !== key) this.redrawPart(prev);
      this.redrawPart(key);
      document.querySelector(`.part[data-part="${key}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    const set = e.target.closest('[data-set]');
    if (set) {
      const key = set.closest('.part').dataset.part;
      const part = this.spec.parts[key];
      const field = set.dataset.set;
      let value = set.dataset.value;
      if (field === 'thickness') value = +value;
      part[field] = value || null;
      // Новый камень может не выпускаться в выбранном формате или толщине
      if (field === 'stone' && PARTS.find(p => p.key === key).type === 'tile') {
        const st = this.stone(value);
        if (!st.formats.includes(part.format)) part.format = st.formats[0];
        if (!st.thickness.includes(part.thickness)) part.thickness = st.thickness[0];
      }
      this.save();
      return this.redrawPart(key);
    }
    const step = e.target.closest('[data-step]');
    if (step) {
      const b = this.spec.building;
      const f = step.dataset.step, d = parseFloat(step.dataset.d);
      const base = b[f] || (f === 'floors' ? 0 : 3);
      b[f] = Math.max(0, Math.round((base + d) * 10) / 10) || null;
      this.save();
      return this.redrawPart('building');
    }
  },

  onChange(e) {
    const sw = e.target.closest('[data-switch]');
    if (!sw) return;
    const key = sw.dataset.switch;
    this.spec.parts[key].on = sw.checked;
    if (sw.checked) this.open = key;
    this.save();
    this.redrawPart(key);
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('configure-parts');
    box.addEventListener('click', e => this.onClick(e));
    box.addEventListener('change', e => this.onChange(e));
    document.getElementById('configure-back').addEventListener('click', () => Router.navigateTo('photo'));
    document.getElementById('configure-done').addEventListener('click', () => Router.navigateTo('spec'));
  },
};

// === Спецификация: что из чего на фасаде ===

// Строки спецификации: [значок, часть, что выбрано, подробности, картинка]
function specLines(spec, stones, catalog) {
  const stoneName = id => stones.find(s => s.id === id)?.name || '';
  const lines = [];
  PARTS.forEach(p => {
    const part = spec.parts?.[p.key];
    if (!part?.on) return;
    if (p.type === 'tile') {
      lines.push([p.icon, p.title, stoneName(part.stone),
        `${part.format.replace('x', '×')}×${part.thickness} мм, ${EDGE_NAMES[part.edge]}, ${SURFACE_NAMES[part.surface]}, ${LAYOUTS[part.layout]?.name.toLowerCase()}, ${JOINT_COLORS[part.joint]?.name.toLowerCase()}`,
        stones.find(s => s.id === part.stone)?.texture]);
    } else if (p.type === 'windows') {
      WINDOW_SLOTS.forEach(slot => {
        const v = catalog.variants[part[slot.field]];
        if (v) lines.push(['opening', slot.title, v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id]);
      });
    } else if (p.type === 'balustrade') {
      ['baluster', 'post', 'rail', 'finial'].forEach(f => {
        const v = catalog.variants[part[f]];
        if (v) lines.push(['balustrade', 'Балюстрада', v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id]);
      });
    } else {
      [part.item, part.capital].forEach(id => {
        const v = catalog.variants[id];
        if (v) lines.push([p.icon, p.title, v.name, `${v.size} мм, ${stoneName(part.stone)}`, v.image, v.id]);
      });
    }
  });
  const b = spec.building || {};
  if (b.floors || b.heightM) lines.push(['fit', 'Здание', [b.floors ? `${b.floors} эт.` : '', b.heightM ? `${b.heightM} м` : ''].filter(Boolean).join(', '), '', null]);
  return lines;
}

// Текст спецификации — для отправки заказчику и как основа задания для ИИ
function specText(spec, stones, catalog) {
  return specLines(spec, stones, catalog).map(([, part, value, details]) => `• ${part}: ${value}${details ? ` (${details})` : ''}`).join('\n');
}

function specHtml(spec, stones, catalog) {
  return specLines(spec, stones, catalog).map(([ic, part, value, details, img, vid]) => `
    <div class="spec-line">
      <span class="spec-line__img">${img ? `<img src="${img}" ${vid ? `data-recolor="${vid}"` : ''} alt="">` : icon(ic)}</span>
      <span class="spec-line__text">
        <span class="spec-line__part">${esc(part)}</span>
        <span class="spec-line__value">${esc(value)}</span>
        ${details ? `<span class="spec-line__details">${esc(details)}</span>` : ''}
      </span>
    </div>`).join('');
}

const Spec = {
  bound: false,

  async render() {
    const spec = ProjectFlow.getState('design');
    if (!spec || spec.version !== 3) return Router.navigateTo('configure');
    this.bind();
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    document.getElementById('spec-photo').src = ProjectFlow.getState('originalPhoto');
    const box = document.getElementById('spec-list');
    box.innerHTML = specHtml(spec, stones, catalog);
    // Изделия в спецификации — в своём камне
    for (const el of box.querySelectorAll('img[data-recolor]')) {
      const v = catalog.variants[el.dataset.recolor];
      const p = PARTS.find(x => spec.parts[x.key] && Object.values(spec.parts[x.key]).includes(v.id));
      const stone = stones.find(s => s.id === spec.parts[p?.key]?.stone);
      if (stone) StonePreview.recolor(v, stone, 160).then(c => { if (el.isConnected) el.src = c.toDataURL('image/webp', 0.9); });
    }
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

  bind() {
    if (this.bound) return;
    this.bound = true;
    document.getElementById('spec-back').addEventListener('click', () => Router.navigateTo('configure'));
    document.getElementById('spec-edit').addEventListener('click', () => Router.navigateTo('configure'));
    document.getElementById('spec-share').addEventListener('click', () => this.share());
    document.getElementById('spec-save').addEventListener('click', () => this.saveProject());
    document.getElementById('spec-generate').addEventListener('click', () => showToast('Генерацию ИИ подключим на следующем этапе'));
  },
};

// Список материалов в карточке сохранённого проекта
function summarizeDesign(design, stones, catalog) {
  if (design?.version === 3) return specHtml(design, stones, catalog);
  return '';
}

function onScreenConfigure() {
  Configurator.render();
}

function onScreenSpec() {
  Spec.render();
}
