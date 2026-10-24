// === Структура каталога: секции по породам камня ===
const CATALOG_STRUCTURE = [
  {
    title: 'Известняк',
    subtitle: 'Дагестанский',
    filter: (m) => m.name.toLowerCase().includes('известняк')
  },
  {
    title: 'Песчаник',
    subtitle: 'Дагестанский',
    filter: (m) => m.name.toLowerCase().includes('песчаник')
  },
  {
    title: 'Ракушечник',
    subtitle: 'Дагестанский',
    filter: (m) => m.name.toLowerCase().includes('ракушечник')
  },
  {
    title: 'Доломит',
    subtitle: 'Дагестанский',
    filter: (m) => m.name.toLowerCase().includes('доломит')
  },
  {
    title: 'Иранский камень',
    subtitle: 'Гохаре',
    filter: (m) => m.name.toLowerCase().includes('гохар') || m.name.toLowerCase().includes('иранский')
  },
  {
    title: 'Гранит',
    subtitle: 'Натуральный',
    filter: (m) => m.name.toLowerCase().includes('гранит') || m.name.toLowerCase().includes('габбр') || m.name.toLowerCase().includes('лабродар')
  },
  {
    title: 'Сланец',
    subtitle: 'Натуральный',
    filter: (m) => m.name.toLowerCase().includes('сланец')
  }
];

// fallback: материалы которые не попали ни в одну секцию
const CATALOG_EXTRA_SECTIONS = [
  {
    title: 'Натуральный камень',
    subtitle: 'Дагестанский',
    filter: (m) => m.category === 'stone' && !m.name.toLowerCase().includes('известняк') && !m.name.toLowerCase().includes('песчаник') && !m.name.toLowerCase().includes('ракушечник') && !m.name.toLowerCase().includes('доломит') && !m.name.toLowerCase().includes('гранит') && !m.name.toLowerCase().includes('сланец')
  },
  {
    title: 'Цокольная плитка',
    subtitle: 'Синтетическая',
    filter: (m) => m.category === 'base'
  },
  {
    title: 'Плитка и клинкер',
    subtitle: 'Синтетическая',
    filter: (m) => m.category === 'tile' && !m.name.toLowerCase().includes('известняк') && !m.name.toLowerCase().includes('гранит')
  },
  {
    title: 'Декоративные элементы',
    subtitle: 'Металл',
    filter: (m) => m.category === 'element'
  }
];

async function renderCatalog(filter = 'all', searchQuery = '') {
  const container = document.getElementById('catalog-sections');
  if (!container) return;

  container.innerHTML = '<div class="skeleton" style="height: 300px;"></div>'.repeat(3);

  let materials = await Materials.getAll();
  
  // Поиск
  if (searchQuery) {
    materials = materials.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (materials.length === 0) {
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

  // Рендерим дополнительные секции (не-камень)
  for (const section of CATALOG_EXTRA_SECTIONS) {
    const sectionMaterials = materials.filter(section.filter);
    if (sectionMaterials.length === 0) continue;

    const sectionEl = createCatalogSection(section, sectionMaterials);
    container.appendChild(sectionEl);
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

function createCatalogSection(section, materials) {
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
    const card = createCatalogSectionCard(material);
    listEl.appendChild(card);
  });

  scrollEl.appendChild(listEl);
  sectionEl.appendChild(scrollEl);

  return sectionEl;
}

function createCatalogSectionCard(material) {
  const card = document.createElement('div');
  card.className = 'catalog-section__card';
  card.innerHTML = `
    <div class="catalog-section__card-image">
      <img src="${material.image}" alt="${material.name}" loading="lazy">
    </div>
    <div class="catalog-section__card-name">${material.name}</div>
  `;

  card.addEventListener('click', () => {
    Router.navigateTo(`material-${material.id}`);
  });

  return card;
}

// === Старая функция (для совместимости) ===
async function renderCatalogOld(filter = 'all', searchQuery = '') {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="skeleton" style="height: 200px;"></div>'.repeat(4);

  let materials = await Materials.getAll();
  
  if (filter !== 'all') {
    materials = materials.filter(m => m.category === filter);
  }

  if (searchQuery) {
    materials = materials.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (materials.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🏗️</div>
        <div class="empty-state__title">Материалы не найдены</div>
        <div class="empty-state__text">Попробуйте изменить фильтр или поисковый запрос</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  materials.forEach(material => {
    const card = renderCatalogCard(material, (m) => {
      Router.navigateTo(`material-${m.id}`);
    });
    grid.appendChild(card);
  });
}

function renderMaterialDetail(material) {
  const container = document.getElementById('material-detail-content');
  if (!container || !material) return;

  container.innerHTML = `
    <div class="material-detail">
      <div class="material-detail__image">
        <img src="${material.image}" alt="${material.name}">
      </div>
      <div class="material-detail__name">${material.name}</div>
      <div class="material-detail__type">${material.type || material.category || ''}</div>
      <div class="material-detail__description">${material.description || 'Натуральный камень высокого качества.'}</div>
      <button class="btn btn-primary btn-full" id="material-fav-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        <span id="fav-btn-text">В избранное</span>
      </button>
    </div>
  `;

  // Избранное
  const favBtn = document.getElementById('material-fav-btn');
  const favText = document.getElementById('fav-btn-text');
  
  favBtn.addEventListener('click', async () => {
    try {
      if (favText.textContent === 'В избранном') {
        await Api.removeFavorite(material.id);
        favText.textContent = 'В избранное';
        showToast('Удалено из избранного');
      } else {
        await Api.addFavorite(material.id);
        favText.textContent = 'В избранном';
        showToast('Добавлено в избранное');
      }
    } catch (e) {
      showToast(e.message || 'Ошибка');
    }
  });
}
