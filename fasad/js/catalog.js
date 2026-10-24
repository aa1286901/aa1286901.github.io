// === Структура каталога: камень по породам (каталог «Камень Юг») ===
const CATALOG_STRUCTURE = ['Песчаник', 'Известняк', 'Ракушечник', 'Доломит', 'Сланец', 'Камень'].map(type => ({
  title: type === 'Камень' ? 'Натуральный камень' : type,
  subtitle: 'Дагестанский камень',
  filter: (m) => m.category === 'stone' && m.active !== false && (m.type || 'Камень') === type,
}));

// Изделия из камня: группы из data/elements.json
const CATALOG_PRODUCT_GROUPS = [
  ['rust', 'Русты'], ['pilaster', 'Пилястры'], ['column', 'Колонны'], ['baluster', 'Балясины'], ['post', 'Тумбы'],
  ['finial', 'Навершия'], ['keystone', 'Замки'], ['console', 'Консоли'], ['capital', 'Капители'],
  ['rosette', 'Розетки'], ['barelief', 'Барельефы'], ['panel', 'Панно'],
];

async function renderCatalog(filter = 'all', searchQuery = '') {
  const container = document.getElementById('catalog-sections');
  if (!container) return;

  container.innerHTML = '<div class="skeleton" style="height: 300px;"></div>'.repeat(3);

  let materials = (await Materials.getAll()).filter(m => m.active !== false);
  const elements = await Elements.load();
  let products = elements.spriteList;

  // Поиск
  if (searchQuery) {
    products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    materials = materials.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (materials.length === 0 && products.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🏗️</div>
        <div class="empty-state__title">Материалы не найдены</div>
        <div class="empty-state__text">Попробуйте изменить поисковый запрос</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  // Рендерим основные секции по породам
  for (const section of CATALOG_STRUCTURE) {
    const sectionMaterials = materials.filter(section.filter);
    if (sectionMaterials.length === 0) continue;

    const sectionEl = createCatalogSection(section, sectionMaterials);
    container.appendChild(sectionEl);
  }

  // Изделия из камня
  for (const [group, title] of CATALOG_PRODUCT_GROUPS) {
    const items = products.filter(p => p.group === group);
    if (items.length === 0) continue;
    container.appendChild(createCatalogSection({ title, subtitle: 'Изделия из натурального камня' }, items, true));
  }

  // Если ни одна секция не подошла
  if (container.children.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🏗️</div>
        <div class="empty-state__title">Материалы не найдены</div>
        <div class="empty-state__text">Попробуйте изменить поисковый запрос</div>
      </div>
    `;
  }
}

function createCatalogSection(section, materials, isProduct = false) {
  const sectionEl = document.createElement('div');
  sectionEl.className = 'catalog-section';

  // Заголовок секции
  const header = document.createElement('div');
  header.className = 'catalog-section__header';
  header.innerHTML = `
    <div>
      <div class="catalog-section__title">${section.title}</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 2px;">${section.subtitle}</div>
    </div>
    <div class="catalog-section__count">${materials.length} шт.</div>
  `;
  sectionEl.appendChild(header);

  // Горизонтальный скролл
  const scrollEl = document.createElement('div');
  scrollEl.className = 'catalog-section__scroll';

  const listEl = document.createElement('div');
  listEl.className = 'catalog-section__list';

  materials.forEach(material => {
    const card = createCatalogSectionCard(material, isProduct);
    listEl.appendChild(card);
  });

  scrollEl.appendChild(listEl);
  sectionEl.appendChild(scrollEl);

  return sectionEl;
}

function createCatalogSectionCard(material, isProduct) {
  const card = document.createElement('div');
  card.className = 'catalog-section__card' + (isProduct ? ' catalog-section__card--product' : '');
  card.innerHTML = `
    <div class="catalog-section__card-image">
      <img src="${material.image}" alt="${material.name}" loading="lazy">
    </div>
    <div class="catalog-section__card-name">${material.name}</div>
  `;

  card.addEventListener('click', () => {
    if (isProduct) showProductDetail(material);
    else showMaterialDetail(material);
  });

  return card;
}

// Карточка камня: фактура, порода, описание, характеристики и размеры плитки
function showMaterialDetail(m) {
  const specs = m.specs || {};
  const rows = [
    ['Плотность', specs.density], ['Пористость', specs.porosity], ['Водопоглощение', specs.absorption],
    ['Огнеупорность', specs.fire], ['Предел прочности', specs.strength], ['Морозостойкость', specs.frost],
  ].filter(([, v]) => v);
  showModal(`
    <div class="material-detail">
      <div class="material-detail__image"><img src="${m.texture || m.image}" alt="${m.name}"></div>
      <div class="material-detail__name">${m.name}</div>
      <div class="material-detail__type">${m.type || ''}</div>
      <div class="material-detail__description">${m.description || ''}</div>
      ${rows.length ? `<div class="material-detail__specs">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}
      ${m.sizes?.length ? `<div class="material-detail__sizes"><span>Размеры плитки, мм</span>${m.sizes.map(x => `<i>${x.replace(/\*/g, '×')}</i>`).join('')}</div>` : ''}
      <button class="btn btn-primary btn-full" id="material-fav-btn">В избранное</button>
    </div>
  `);
  document.getElementById('material-fav-btn')?.addEventListener('click', async () => {
    try {
      await Api.addFavorite(m.id);
      showToast('Добавлено в избранное');
    } catch (e) {
      showToast(e.message || 'Войдите, чтобы добавлять в избранное');
    }
  });
}

function showProductDetail(p) {
  showModal(`
    <div class="material-detail">
      <div class="material-detail__image material-detail__image--product"><img src="${p.image}" alt="${p.name}"></div>
      <div class="material-detail__name">${p.name}</div>
      <div class="material-detail__type">${p.widthMm}×${p.heightMm} мм · любой камень из каталога</div>
      <div class="material-detail__description">Добавляется на фасад в разметке: «Добавить» → «Изделия».</div>
    </div>
  `);
}
