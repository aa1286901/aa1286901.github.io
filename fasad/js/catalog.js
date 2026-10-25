// === Каталог «Камень Юг» ===
// Прораб показывает заказчику: оттенок камня, плитку с фаской и без, отбитую и пиленую,
// толщину, карнизы, замки, наличники и другие изделия — сразу в выбранном камне.

const STONE_KINDS = ['Все', 'Песчаник', 'Известняк', 'Ракушечник', 'Доломит', 'Сланец'];

// Изделия, которые показываются на странице камня «из этого камня»
const STONE_PAGE_SECTIONS = ['cornice', 'window', 'keystone', 'dentil', 'plinth', 'rust', 'console'];

const Catalog = {
  tab: 'stones',
  kind: 'Все',
  query: '',
  stone: null,          // камень на странице камня
  section: null,        // раздел изделий
  sectionStone: null,   // в каком камне показывать изделия раздела
  tile: { edge: 'chamfer', surface: 'sawn', format: '160x360', thickness: 20, layout: 'running', joint: 'light' },
  bound: false,

  async render() {
    this.bind();
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    this.stones = stones;
    this.catalog = catalog;
    document.querySelectorAll('.catalog-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === this.tab));
    const box = document.getElementById('catalog-sections');
    const q = this.query.toLowerCase();

    if (this.tab === 'stones') {
      const list = stones.filter(s => (this.kind === 'Все' || s.type === this.kind) && (!q || s.name.toLowerCase().includes(q)));
      box.innerHTML = `
        <div class="catalog-chips">${STONE_KINDS.map(k => `
          <button class="catalog-chip${k === this.kind ? ' active' : ''}" data-kind="${k}">${k}</button>`).join('')}
        </div>
        <div class="stone-grid">${list.map(s => `
          <button class="stone-card" data-stone="${s.id}">
            <img src="${s.texture}" alt="" loading="lazy">
            <span class="stone-card__name">${esc(s.name)}</span>
            <span class="stone-card__meta">${esc(s.type)} · ${esc(s.specs?.frost || '')}</span>
          </button>`).join('') || '<p class="catalog-empty">Ничего не найдено</p>'}
        </div>`;
      return;
    }

    // Изделия: разделы плитками, при поиске — сразу найденные изделия
    if (q) {
      const found = [];
      catalog.sections.forEach(s => s.items.forEach(item => {
        if (item.name.toLowerCase().includes(q) || (item.model || '').toLowerCase().includes(q)) found.push([s, item]);
      }));
      box.innerHTML = `<div class="product-grid">${found.map(([s, item]) => this.productCard(s, item)).join('') || '<p class="catalog-empty">Ничего не найдено</p>'}</div>`;
      return;
    }
    box.innerHTML = `<div class="section-grid">${catalog.sections.map(s => `
      <button class="section-tile" data-section="${s.id}">
        <img src="${s.items[0]?.variants[0]?.image || ''}" alt="" loading="lazy">
        <span class="section-tile__title">${esc(s.title)}</span>
        <span class="section-tile__count">${s.items.length} ${plural(s.items.length, 'вид', 'вида', 'видов')}</span>
      </button>`).join('')}
    </div>`;
  },

  productCard(section, item, recolor) {
    const v = item.variants[0];
    const sizes = [...new Set(item.variants.map(x => x.size))];
    return `
      <button class="product-card" data-product="${section.id}:${item.id}">
        <span class="product-card__img"><img src="${v.image}" ${recolor ? `data-recolor="${v.id}"` : ''} alt="" loading="lazy"></span>
        <span class="product-card__name">${esc(item.name)}</span>
        <span class="product-card__size">${sizes.length > 1 ? `${sizes.length} ${plural(sizes.length, 'размер', 'размера', 'размеров')}` : esc(v.size)}${item.variants.length > sizes.length ? ' · несколько видов' : ''}</span>
      </button>`;
  },

  // === Страница камня ===
  async openStone(id) {
    await Materials.getCatalog();
    this.stone = (await Materials.getStones()).find(s => s.id === id);
    if (!this.stone) return;
    if (!this.stone.formats.includes(this.tile.format)) this.tile.format = this.stone.formats.includes('160x360') ? '160x360' : this.stone.formats[0];
    if (!this.stone.thickness.includes(this.tile.thickness)) this.tile.thickness = this.stone.thickness[0];
    Router.navigateTo('stone');
  },

  async renderStone() {
    const s = this.stone;
    if (!s) return Router.navigateTo('catalog');
    const catalog = await Materials.getCatalog();
    this.catalog = catalog;
    const box = document.getElementById('stone-content');
    const specs = s.specs || {};
    const specRows = [['Плотность', specs.density], ['Пористость', specs.porosity], ['Водопоглощение', specs.absorption],
      ['Огнеупорность', specs.fire], ['Предел прочности', specs.strength], ['Морозостойкость', specs.frost]].filter(r => r[1]);
    const t = catalog.tile;

    box.innerHTML = `
      <div class="stone-hero">
        <img class="stone-hero__texture" src="${s.texture}" alt="Фактура камня ${esc(s.name)}">
        <img class="stone-hero__slab" src="${s.slab}" alt="Плитка ${esc(s.name)}">
      </div>
      <h1 class="stone-title">${esc(s.name)}</h1>
      <p class="stone-sub">${esc(s.type)} · морозостойкость ${esc(specs.frost || '—')}</p>

      <div class="stone-block">
        <div class="stone-block__title">Плитка</div>
        <canvas class="tile-wall" id="tile-wall"></canvas>
        <canvas class="tile-slab" id="tile-slab"></canvas>
        <div class="stone-opts">
          <div class="opt-label">Фаска</div>
          <div class="catalog-chips">${t.edges.map(e => `
            <button class="catalog-chip catalog-chip--icon${e.id === this.tile.edge ? ' active' : ''}" data-tile="edge" data-value="${e.id}">${edgeIcon(e.id)}${e.name}</button>`).join('')}
          </div>
          <div class="opt-label">Поверхность</div>
          <div class="catalog-chips">${t.surfaces.map(e => `
            <button class="catalog-chip${e.id === this.tile.surface ? ' active' : ''}" data-tile="surface" data-value="${e.id}">${e.name}</button>`).join('')}
          </div>
          <div class="opt-label">Формат, мм</div>
          <div class="catalog-chips">${s.formats.map(f => `
            <button class="catalog-chip${f === this.tile.format ? ' active' : ''}" data-tile="format" data-value="${f}">${f.replace('x', '×')}</button>`).join('')}
          </div>
          <div class="opt-label">Толщина, мм</div>
          <div class="catalog-chips">${s.thickness.map(f => `
            <button class="catalog-chip${f === this.tile.thickness ? ' active' : ''}" data-tile="thickness" data-value="${f}">${f}</button>`).join('')}
          </div>
          <div class="opt-label">Раскладка и шов</div>
          <div class="catalog-chips">${Object.entries(LAYOUTS).map(([k, l]) => `
            <button class="catalog-chip${k === this.tile.layout ? ' active' : ''}" data-tile="layout" data-value="${k}">${l.name}</button>`).join('')}
          </div>
          <div class="catalog-chips">${Object.entries(JOINT_COLORS).map(([k, l]) => `
            <button class="catalog-chip${k === this.tile.joint ? ' active' : ''}" data-tile="joint" data-value="${k}">${l.name}</button>`).join('')}
          </div>
        </div>
      </div>

      ${STONE_PAGE_SECTIONS.map(id => {
        const sec = catalog.sections.find(x => x.id === id);
        if (!sec) return '';
        return `
          <div class="stone-block">
            <div class="stone-block__title">${esc(sec.title)} <small>из этого камня</small></div>
            <div class="product-strip">${sec.items.map(item => this.productCard(sec, item, true)).join('')}</div>
          </div>`;
      }).join('')}

      <details class="stone-specs">
        <summary>Характеристики</summary>
        <p>${esc(s.description || '')}</p>
        <div class="spec-grid">${specRows.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
        <div class="spec-sizes"><span>Размеры, мм</span>${s.sizes.map(x => `<i>${x.replace(/\*/g, '×')}</i>`).join('')}</div>
      </details>

      <button class="btn btn-primary btn-full stone-cta" data-action="configure">Подобрать фасад с этим камнем</button>`;

    this.renderTile();
    StonePreview.recolorAll(box, s, catalog.variants);
  },

  async renderTile() {
    const wall = document.getElementById('tile-wall');
    const slab = document.getElementById('tile-slab');
    if (!wall || !this.stone) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = (c, h) => {
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(h * dpr);
    };
    size(wall, 210);
    size(slab, 170);
    const opts = { stone: this.stone, ...this.tile };
    const [, fw] = this.tile.format.split('x').map(Number);
    await StonePreview.renderWall(wall, { ...opts, spanMm: Math.max(fw * 3.2, 1100) });
    await StonePreview.renderSlab(slab, opts);
  },

  // === Раздел изделий ===
  async openSection(id) {
    this.section = id;
    Router.navigateTo('section');
  },

  async renderSection() {
    const catalog = await Materials.getCatalog();
    const sec = catalog.sections.find(s => s.id === this.section);
    if (!sec) return Router.navigateTo('catalog');
    const stones = await Materials.getStones();
    document.getElementById('section-title').textContent = sec.title;
    const box = document.getElementById('section-content');
    box.innerHTML = `
      <div class="opt-label">Показать в камне</div>
      <div class="stone-strip">
        <button class="stone-dot${!this.sectionStone ? ' active' : ''}" data-section-stone="">
          <span class="stone-dot__none">Как в каталоге</span>
        </button>
        ${stones.map(s => `
          <button class="stone-dot${this.sectionStone?.id === s.id ? ' active' : ''}" data-section-stone="${s.id}">
            <img src="${s.texture}" alt=""><span>${esc(s.name)}</span>
          </button>`).join('')}
      </div>
      <div class="product-grid">${sec.items.map(item => this.productCard(sec, item, !!this.sectionStone)).join('')}</div>`;
    if (this.sectionStone) StonePreview.recolorAll(box, this.sectionStone, catalog.variants);
  },

  // === Карточка изделия: варианты размеров и камень ===
  async openProduct(key, stone) {
    const [sid, itemId] = key.split(':');
    const catalog = await Materials.getCatalog();
    const item = catalog.sections.find(s => s.id === sid)?.items.find(i => i.id === itemId);
    if (!item) return;
    const stones = await Materials.getStones();
    let variant = item.variants[0];
    let current = stone || null;

    showModal(`<div class="product-detail" id="product-detail"></div>`);
    const box = document.getElementById('product-detail');
    const draw = async () => {
      box.innerHTML = `
        <div class="product-detail__img"><img id="product-img" src="${variant.image}" alt=""></div>
        <div class="product-detail__name">${esc(item.name)}</div>
        <div class="product-detail__size">${esc(variant.size)} мм${current ? ` · ${esc(current.name)}` : ''}</div>
        ${item.variants.length > 1 ? `<div class="catalog-chips product-detail__variants">${item.variants.map(v => `
          <button class="catalog-chip${v.id === variant.id ? ' active' : ''}" data-variant="${v.id}">${esc(v.size)}${v.look ? ` · вид ${v.look}` : ''}</button>`).join('')}</div>` : ''}
        <div class="opt-label">Камень</div>
        <div class="stone-strip">
          <button class="stone-dot${!current ? ' active' : ''}" data-stone-pick=""><span class="stone-dot__none">Как в каталоге</span></button>
          ${stones.map(s => `
            <button class="stone-dot${current?.id === s.id ? ' active' : ''}" data-stone-pick="${s.id}"><img src="${s.texture}" alt=""><span>${esc(s.name)}</span></button>`).join('')}
        </div>`;
      box.querySelector('.stone-dot.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
      if (current) {
        const c = await StonePreview.recolor(variant, current, 520);
        const img = document.getElementById('product-img');
        if (img) img.src = c.toDataURL('image/webp', 0.92);
      }
    };
    box.addEventListener('click', e => {
      const v = e.target.closest('[data-variant]');
      if (v) { variant = item.variants.find(x => x.id === v.dataset.variant); draw(); }
      const st = e.target.closest('[data-stone-pick]');
      if (st) { current = stones.find(x => x.id === st.dataset.stonePick) || null; draw(); }
    });
    draw();
  },

  bind() {
    if (this.bound) return;
    this.bound = true;

    document.querySelector('.catalog-tabs')?.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (b) { this.tab = b.dataset.tab; this.render(); }
    });
    let timer;
    document.getElementById('catalog-search-input')?.addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => { this.query = e.target.value.trim(); this.render(); }, 250);
    });
    document.getElementById('catalog-sections')?.addEventListener('click', e => {
      const kind = e.target.closest('[data-kind]');
      if (kind) { this.kind = kind.dataset.kind; return this.render(); }
      const stone = e.target.closest('[data-stone]');
      if (stone) return this.openStone(stone.dataset.stone);
      const sec = e.target.closest('[data-section]');
      if (sec) return this.openSection(sec.dataset.section);
      const prod = e.target.closest('[data-product]');
      if (prod) return this.openProduct(prod.dataset.product);
    });
    document.getElementById('stone-content')?.addEventListener('click', e => {
      const t = e.target.closest('[data-tile]');
      if (t) {
        const field = t.dataset.tile;
        this.tile[field] = field === 'thickness' ? +t.dataset.value : t.dataset.value;
        t.parentElement.querySelectorAll('.catalog-chip').forEach(c => c.classList.toggle('active', c === t));
        return this.renderTile();
      }
      const prod = e.target.closest('[data-product]');
      if (prod) return this.openProduct(prod.dataset.product, this.stone);
      if (e.target.closest('[data-action="configure"]')) return Configurator.startWithStone(this.stone.id);
    });
    document.getElementById('section-content')?.addEventListener('click', e => {
      const st = e.target.closest('[data-section-stone]');
      if (st) {
        this.sectionStone = this.stones?.find(s => s.id === st.dataset.sectionStone) || null;
        return this.renderSection();
      }
      const prod = e.target.closest('[data-product]');
      if (prod) return this.openProduct(prod.dataset.product, this.sectionStone);
    });
    document.getElementById('stone-back')?.addEventListener('click', () => history.length > 1 ? history.back() : Router.navigateTo('catalog'));
    document.getElementById('section-back')?.addEventListener('click', () => Router.navigateTo('catalog'));
  },
};

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// Совместимость: избранное в профиле открывает карточку камня
function showMaterialDetail(m) {
  Catalog.openStone(m.id);
}

function onScreenStone() {
  Catalog.renderStone();
}

function onScreenSection() {
  Catalog.renderSection();
}
