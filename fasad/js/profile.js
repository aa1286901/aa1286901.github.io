async function renderProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  const user = Auth.getUser();
  if (!user) {
    showInlineAuth('profile-content');
    return;
  }

  try {
    let projectCount = 0;
    let favoriteCount = 0;
    
    try {
      const projects = await Api.listProjects();
      projectCount = projects.data?.length || 0;
    } catch (e) {
      if (e.message && e.message.includes('Не авторизован')) {
        Auth._user = null;
        showInlineAuth('profile-content');
        return;
      }
    }
    
    try {
      const favorites = await Api.listFavorites();
      favoriteCount = favorites.data?.length || 0;
    } catch (e) {
      if (e.message && e.message.includes('Не авторизован')) {
        Auth._user = null;
        showInlineAuth('profile-content');
        return;
      }
    }

    container.innerHTML = `
      <div class="profile-header">
        <h2 class="page-header__title" style="width: 100%;">Профиль</h2>
      </div>

      <div class="profile-header">
        <div class="profile-header__avatar">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="profile-header__name">${user.name}</div>
        <div class="profile-header__role">Профессионал</div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat__number">${projectCount}</div>
          <div class="profile-stat__label">Проектов создано</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat__number">${favoriteCount}</div>
          <div class="profile-stat__label">Материалов сохранено</div>
        </div>
      </div>

      <div class="profile-menu">
        <div class="profile-menu__item" id="profile-favorites">
          <svg class="profile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span class="profile-menu__text">Избранные материалы</span>
          <svg class="profile-menu__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="profile-menu__item" id="profile-premium">
          <svg class="profile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span class="profile-menu__text">Premium</span>
          <svg class="profile-menu__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="profile-menu__item" id="profile-help">
          <svg class="profile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span class="profile-menu__text">Помощь и поддержка</span>
          <svg class="profile-menu__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="profile-menu__item" id="profile-about">
          <svg class="profile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span class="profile-menu__text">О приложении</span>
          <svg class="profile-menu__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="profile-menu__item danger" id="profile-logout">
          <svg class="profile-menu__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span class="profile-menu__text">Выйти</span>
        </div>
      </div>
    `;

    // Events
    document.getElementById('profile-favorites')?.addEventListener('click', () => {
      Router.navigateTo('favorites');
    });
    document.getElementById('profile-logout')?.addEventListener('click', async () => {
      const ok = await showConfirm('Выйти', 'Вы уверены, что хотите выйти?');
      if (ok) {
        await Auth.logout();
        showToast('Вы вышли из аккаунта');
        Router.navigateTo('home');
      }
    });
  } catch (e) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Ошибка загрузки</div>
        <div class="empty-state__text">${e.message || 'Попробуйте обновить страницу'}</div>
        <button class="btn btn-primary" onclick="renderProfile()">Обновить</button>
      </div>
    `;
  }
}

async function renderFavorites() {
  const container = document.getElementById('favorites-content');
  if (!container) return;

  // Проверяем авторизацию
  if (!Auth.isLoggedIn()) {
    showInlineAuth('favorites-content');
    return;
  }

  try {
    const data = await Api.listFavorites();
    const favorites = data.data || [];

    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">❤️</div>
          <div class="empty-state__title">Пока пусто</div>
          <div class="empty-state__text">Добавляйте материалы из каталога в избранное</div>
          <button class="btn btn-primary" onclick="Router.navigateTo('catalog')">Открыть каталог</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    for (const fav of favorites) {
      const material = await Materials.getById(fav.material_id);
      if (material) {
        const card = renderCatalogCard(material, (m) => {
          Router.navigateTo(`material-${m.id}`);
        });
        container.appendChild(card);
      }
    }
  } catch (e) {
    if (e.message && e.message.includes('Не авторизован')) {
      Auth._user = null;
      showInlineAuth('favorites-content');
      return;
    }
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Ошибка загрузки</div>
        <button class="btn btn-primary" onclick="renderFavorites()">Попробовать снова</button>
      </div>
    `;
  }
}
