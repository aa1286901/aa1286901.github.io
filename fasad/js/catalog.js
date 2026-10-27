// === Каталог «Камень Юг» ===
// Прораб показывает заказчику оттенок камня, характеристики и плитку с фаской и без,
// отбитую и пиленую, разной толщины; во вкладке «Изделия» — изделия как в PDF-каталоге.

const STONE_KINDS = ['Все', 'Песчаник', 'Известняк', 'Ракушечник', 'Доломит', 'Сланец'];

// Разделы вкладки «Изделия» — как в PDF. sections — разделы data/catalog.json;
// skipTall — не показывать длинные собранные пилястры и колонны
const CATALOG_GROUPS = [
  { id: 'cornice', title: 'Карнизы', sections: ['cornice'] },
  { id: 'plinth', title: 'Плинтусы', sections: ['plinth'] },
  { id: 'dentil', title: 'Зубцы', sections: ['dentil'] },
  { id: 'keystone', title: 'Замки и консоли', sections: ['keystone', 'console'] },
  { id: 'balustrade', title: 'Балюстрада', sections: ['balustrade'] },
  { id: 'carved', title: 'Розетки, барельефы, панно', sections: ['carved'] },
  { id: 'capital', title: 'Капители и базы', sections: ['capital'] },
  { id: 'column', title: 'Пилястры и колонны', sections: ['pilaster', 'column'], skipTall: true },
  { id: 'rust', title: 'Русты', sections: ['rust'] },
];

const Catalog = {
  tab: 'stones',
  kind: 'Все',
  query: '',
  stone: null,          // камень на странице камня
  group: null,          // раздел изделий
  sectionStone: null,   // в каком камне показывать изделия раздела
  tile: { edge: 'chamfer', surface: 'sawn', format: '160x360', thickness: 20, layout: 'running', joint: 'light' },
  bound: false,

  // Все изделия раздела по одному — каждая картинка PDF отдельной карточкой
  groupEntries(group, catalog) {
    const out = [];
    group.sections.forEach(sid => {
      const sec = catalog.sections.find(s => s.id === sid);
      sec?.items.forEach(item => item.variants.forEach(v => {
        if (!(group.skipTall && v.tall)) out.push({ sid, item, v });
      }));
    });
    return out;
  },

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

    // Изделия: при поиске — сразу найденные изделия, иначе разделы
    if (q) {
      const found = CATALOG_GROUPS.flatMap(g => this.groupEntries(g, catalog))
        .filter(e => e.item.name.toLowerCase().includes(q) || (e.item.model || '').toLowerCase().includes(q));
      box.innerHTML = `<div class="product-grid">${found.map(e => this.productCard(e)).join('') || '<p class="catalog-empty">Ничего не найдено</p>'}</div>`;
      return;
    }
    box.innerHTML = `<div class="section-grid">${CATALOG_GROUPS.map(g => {
      const entries = this.groupEntries(g, catalog);
      return `
        <button class="section-tile" data-group="${g.id}">
          <img src="${entries[0]?.v.image || ''}" alt="" loading="lazy">
          <span class="section-tile__title">${esc(g.title)}</span>
          <span class="section-tile__count">${entries.length} ${plural(entries.length, 'изделие', 'изделия', 'изделий')}</span>
        </button>`;
    }).join('')}
    </div>`;
  },

  // Подпись как в PDF: название в две строки заглавными, ниже размер
  caption(item) {
    const name = item.name;
    if (item.model && name.endsWith(item.model)) {
      return [name.slice(0, -item.model.length).trim(), item.model];
    }
    const [first, ...rest] = name.split(' ');
    return [first, rest.join(' ')];
  },

  productCard({ sid, item, v }, recolor) {
    const [line1, line2] = this.caption(item);
    return `
      <button class="product-card" data-product="${sid}:${item.id}:${v.id}">
        <span class="product-card__img"><img src="${v.image}" ${recolor ? `data-recolor="${v.id}"` : ''} alt="" loading="lazy">${Viewer3D.profiles?.[v.id] ? '<span class="badge-3d">3D</span>' : ''}</span>
        <span class="product-card__name">${esc(line1)}${line2 ? `<br>${esc(line2)}` : ''}</span>
        <span class="product-card__size">${esc(v.size)}${/^\d|^D/.test(v.size) && v.size !== 'Под заказ' ? ' мм' : ''}</span>
      </button>`;
  },

  // === Страница камня ===
  async openStone(id) {
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
      <p class="stone-sub">${esc(s.type)}</p>

      <div class="stone-block stone-specs">
        <div class="stone-block__title">Характеристики</div>
        <p>${esc(s.description || '')}</p>
        <div class="spec-grid">${specRows.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
        <div class="spec-sizes"><span>Размеры плитки, мм</span>${s.sizes.map(x => `<i>${x.replace(/\*/g, '×')}</i>`).join('')}</div>
      </div>

      <div class="stone-block">
        <div class="stone-block__title">Плитка</div>
        <canvas class="tile-wall" id="tile-wall"></canvas>
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
          <canvas class="tile-slab" id="tile-slab"></canvas>
          <div class="opt-label">Раскладка и шов</div>
          <div class="catalog-chips">${Object.entries(LAYOUTS).map(([k, l]) => `
            <button class="catalog-chip${k === this.tile.layout ? ' active' : ''}" data-tile="layout" data-value="${k}">${l.name}</button>`).join('')}
          </div>
          <div class="catalog-chips">${Object.entries(JOINT_COLORS).map(([k, l]) => `
            <button class="catalog-chip${k === this.tile.joint ? ' active' : ''}" data-tile="joint" data-value="${k}">${l.name}</button>`).join('')}
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-full stone-cta" data-action="configure">Подобрать дизайн с этим камнем</button>`;

    this.renderTile();
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
  openGroup(id) {
    this.group = id;
    Router.navigateTo('section');
  },

  async renderSection() {
    const catalog = await Materials.getCatalog();
    await Viewer3D.getProfiles();
    const group = CATALOG_GROUPS.find(g => g.id === this.group);
    if (!group) return Router.navigateTo('catalog');
    const stones = await Materials.getStones();
    this.stones = stones;
    document.getElementById('section-title').textContent = group.title;
    const box = document.getElementById('section-content');
    const entries = this.groupEntries(group, catalog);
    box.innerHTML = `
      <div class="opt-label">Показать в камне</div>
      <div class="stone-strip">
        <button class="stone-dot${!this.sectionStone ? ' active' : ''}" data-section-stone="">
          <span class="stone-dot__none">Как в каталоге</span>
        </button>
        ${stones.map(s => `
          <button class="stone-dot${this.sectionStone?.id === s.id ? ' active' : ''}" data-section-stone="${s.id}" title="${esc(s.name)}">
            <img src="${s.texture}" alt=""><span>${esc(s.name)}</span>
          </button>`).join('')}
      </div>
      <div class="product-grid">${entries.map(e => this.productCard(e, !!this.sectionStone)).join('')}</div>`;
    if (this.sectionStone) StonePreview.recolorAll(box, this.sectionStone, catalog.variants);
  },

  // === Карточка изделия крупно, в любом камне ===
  async openProduct(key, stone) {
    const [sid, itemId, variantId] = key.split(':');
    const catalog = await Materials.getCatalog();
    const item = catalog.sections.find(s => s.id === sid)?.items.find(i => i.id === itemId);
    const variant = item?.variants.find(v => v.id === variantId) || item?.variants[0];
    if (!variant) return;
    const stones = await Materials.getStones();
    let current = stone || null;
    const [line1, line2] = this.caption(item);

    const profile = (await Viewer3D.getProfiles())[variant.id];
    // В 3D камень нужен всегда: «как в каталоге» — светлый кремовый, как на рендерах
    const baseStone = stones.find(s => s.id === 'akushinskiy-kremovyy') || stones[0];
    let mode = profile ? '3d' : 'photo';
    let view = null;

    showModal(`
      <div class="product-detail" id="product-detail">
        <div class="product-detail__img">
          <img id="product-img" src="${variant.image}" alt=""${profile ? ' hidden' : ''}>
          ${profile ? `
            <div class="product-3d" id="product-3d"><span class="product-3d__hint">Загрузка 3D…</span></div>
            <button class="view-3d active" data-view="3d" aria-pressed="true" title="3D — вкл./выкл.">3D</button>` : ''}
        </div>
        <div class="product-detail__name">${esc(line1)} ${esc(line2)}</div>
        <div class="product-detail__size" id="product-size"></div>
        <div class="opt-label">Камень</div>
        <div class="stone-strip">
          <button class="stone-dot" data-stone-pick=""><span class="stone-dot__none">Как в каталоге</span></button>
          ${stones.map(s => `
            <button class="stone-dot" data-stone-pick="${s.id}" title="${esc(s.name)}"><img src="${s.texture}" alt=""><span>${esc(s.name)}</span></button>`).join('')}
        </div>
      </div>`);
    const box = document.getElementById('product-detail');
    const img = document.getElementById('product-img');
    const view3d = document.getElementById('product-3d');

    const update = async () => {
      document.getElementById('product-size').textContent = `${variant.size} мм${current ? ` · ${current.name}` : ''}`;
      box.querySelectorAll('[data-stone-pick]').forEach(b => b.classList.toggle('active', b.dataset.stonePick === (current?.id || '')));
      if (view) view.setStone((current || baseStone).texture);
      if (current) {
        const c = await StonePreview.recolor(variant, current, 640);
        if (img.isConnected) img.src = c.toDataURL('image/webp', 0.92);
      } else {
        img.src = variant.image;
      }
    };
    const setMode = (m) => {
      mode = m;
      img.hidden = m !== 'photo';
      view3d.hidden = m !== '3d';
      const btn = box.querySelector('[data-view="3d"]');
      btn?.classList.toggle('active', m === '3d');
      btn?.setAttribute('aria-pressed', String(m === '3d'));
    };

    box.addEventListener('click', e => {
      const st = e.target.closest('[data-stone-pick]');
      if (st) { current = stones.find(x => x.id === st.dataset.stonePick) || null; return update(); }
      // Одна кнопка: горит — 3D, не горит — фото
      if (e.target.closest('[data-view="3d"]')) setMode(mode === '3d' ? 'photo' : '3d');
    });
    update();
    if (profile) {
      try {
        view = await Viewer3D.mount(view3d, profile, (current || baseStone).texture);
        view3d.querySelector('.product-3d__hint')?.remove();
      } catch (err) {
        console.error('3D:', err);
        view3d.remove();
        box.querySelector('.view-3d')?.remove();
        setMode('photo');
      }
    }
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
      const group = e.target.closest('[data-group]');
      if (group) return this.openGroup(group.dataset.group);
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
    document.getElementById('stone-back')?.addEventListener('click', () => Router.navigateTo('catalog'));
    document.getElementById('section-back')?.addEventListener('click', () => Router.navigateTo('catalog'));
  },
};

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

// Избранное в профиле открывает страницу камня
function showMaterialDetail(m) {
  Catalog.openStone(m.id);
}

function onScreenStone() {
  Catalog.renderStone();
}

function onScreenSection() {
  Catalog.renderSection();
}
