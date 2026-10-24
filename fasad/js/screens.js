// === Логика экранов ===

// === Экран: Главная ===
function onScreenHome() {
  Works.render();
}

// === Экран: Фото ===
function onScreenPhoto() {
  showPhotoPreview();

  // Кнопки привязываем один раз: экран открывается много раз
  const bindOnce = (id, handler) => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('click', handler);
    }
  };
  bindOnce('photo-camera', () => Camera.pick(true));
  bindOnce('photo-album', () => Camera.pick(false));
  bindOnce('camera-area', () => { if (!ProjectFlow.getState('originalPhoto')) Camera.pick(false); });
  bindOnce('photo-back', () => Router.navigateTo('home'));
  bindOnce('photo-tips', () => Router.navigateTo('tips'));
  // Продолжить — сразу к разметке, фото загружается на сервер только при сохранении проекта
  bindOnce('photo-continue', () => {
    if (!ProjectFlow.getState('originalPhoto')) {
      showToast('Сначала сфотографируйте дом или выберите фото');
      return;
    }
    Router.navigateTo('editor');
  });
}

// Превью выбранного фото и доступность кнопки «Продолжить»
function showPhotoPreview() {
  const photo = ProjectFlow.getState('originalPhoto');
  const area = document.getElementById('camera-area');
  const continueBtn = document.getElementById('photo-continue');
  if (!area || !continueBtn) return;
  continueBtn.disabled = !photo;
  continueBtn.style.opacity = photo ? '1' : '0.5';
  if (photo) {
    area.innerHTML = `<img class="preview" src="${photo}" alt="Фото фасада">`;
    area.classList.add('has-photo');
  } else {
    area.classList.remove('has-photo');
  }
}

// === Экран: Проект (результат) ===
let currentProjectId = null;

function openProject(id) {
  currentProjectId = id;
  Router.navigateTo('project');
}

async function onScreenProject() {
  if (currentProjectId) {
    await loadProjectPage(currentProjectId);
  } else {
    Router.navigateTo('projects');
  }
}

async function loadProjectPage(projectId) {
  const projectImage = document.getElementById('project-image');
  const projectDetails = document.getElementById('project-details');

  try {
    const project = await Api.getProject(projectId);
    const data = project.data;
    const img = data.generated_image || data.original_image;

    if (projectImage) projectImage.src = img;

    if (projectDetails) {
      const all = await Materials.getAll();
      const materials = Object.fromEntries(all.map(m => [m.id, m]));
      let rows = summarizeDesign(data.design, materials, await Elements.load());
      if (!rows) {
        // Старые проекты без разметки: просто список материалов
        const zoneNames = { base: 'Цоколь', facade: 'Стена' };
        rows = Object.values(data.materials || {}).map(m => `
          <div class="project-details__item">
            <span class="project-details__label">${zoneNames[m.category] || 'Материал'}</span>
            <span class="project-details__value">${materials[m.material_id]?.name || m.material_id}</span>
          </div>`).join('');
      }
      projectDetails.innerHTML = rows + `
        <div class="project-details__item">
          <span class="project-details__label">Дата</span>
          <span class="project-details__value">${formatFullDate(data.created_at)}</span>
        </div>`;
    }

    // onclick вместо addEventListener: при каждом открытии проекта обработчик заменяется, а не копится
    document.getElementById('project-back').onclick = () => Router.navigateTo('projects');
    document.getElementById('project-save').onclick = () => showToast('Проект уже сохранён');
    document.getElementById('project-download').onclick = () => downloadImage(img, `fasad-project-${projectId}.jpg`);
    document.getElementById('project-share').onclick = () => shareProject(data.name, img);

  } catch (e) {
    console.error('Load project error:', e);
    showToast('Не удалось загрузить проект');
  }
}

// === Экран: Проекты (история) ===
function onScreenProjects() {
  // Проверяем авторизацию
  if (!Auth.isLoggedIn()) {
    showInlineAuth('projects-list');
    return;
  }
  loadProjectsList();
}

async function loadProjectsList() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  list.innerHTML = '<div class="skeleton" style="height: 100px; margin-bottom: 12px;"></div>'.repeat(3);

  try {
    const data = await Api.listProjects();
    const projects = data.data || [];

    if (projects.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📐</div>
          <div class="empty-state__title">Здесь пока нет проектов</div>
          <div class="empty-state__text">Создайте свой первый дизайн фасада</div>
          <button class="btn btn-primary" onclick="Router.navigateTo('photo')">Создать проект</button>
        </div>
      `;
      return;
    }

    list.innerHTML = '';
    projects.forEach(project => {
      const card = renderProjectCard(project, (p) => {
        openProject(p.id);
      });
      
      // Удаление
      const deleteBtn = card.querySelector('[data-delete]');
      deleteBtn?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = await showConfirm('Удалить проект?', 'Это действие нельзя отменить.');
        if (ok) {
          try {
            await Api.deleteProject(project.id);
            showToast('Проект удалён');
            loadProjectsList();
          } catch (err) {
            showToast('Не удалось удалить проект');
          }
        }
      });
      
      list.appendChild(card);
    });
  } catch (e) {
    if (e.message && e.message.includes('Не авторизован')) {
      Auth._user = null;
      showInlineAuth('projects-list');
      return;
    }
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Ошибка загрузки</div>
        <button class="btn btn-primary" onclick="loadProjectsList()">Попробовать снова</button>
      </div>
    `;
  }
}

// === Экран: Каталог ===
function onScreenCatalog() {
  const searchInput = document.getElementById('catalog-search-input');
  
  renderCatalog();

  // Поиск с debounce
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderCatalog('all', e.target.value);
    }, 300);
  });
}


// === Экран: Профиль ===
function onScreenProfile() {
  // Проверяем авторизацию
  if (!Auth.isLoggedIn()) {
    showInlineAuth('profile-content');
    return;
  }
  renderProfile();
}

// === Экран: Избранное ===
function onScreenFavorites() {
  renderFavorites();
  
  document.getElementById('fav-back')?.addEventListener('click', () => {
    Router.navigateTo('profile');
  });
}

// === Экран: Советы ===
function onScreenTips() {
  document.getElementById('tips-back')?.addEventListener('click', () => {
    Router.navigateTo('photo');
  });
}

// === Авторизация ===
function bindAuth() {
  // Кнопка "Попробовать без регистрации"
  document.getElementById('auth-demo')?.addEventListener('click', () => {
    Router.navigateTo('photo');
  });

  // Форма входа
  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    try {
      await Auth.login(email, password);
      showToast('Вы вошли в аккаунт');
      Router.navigateTo('home');
    } catch (err) {
      showToast(err.message || 'Неверный email или пароль');
    }
  });

  // Регистрация
  document.getElementById('auth-register')?.addEventListener('click', () => {
    showModal(`
      <h3 style="margin-bottom: 16px;">Регистрация</h3>
      <form id="register-form" style="display: flex; flex-direction: column; gap: 12px;">
        <input class="input" type="text" id="reg-name" placeholder="Ваше имя" required>
        <input class="input" type="email" id="reg-email" placeholder="Email" required>
        <input class="input" type="password" id="reg-password" placeholder="Пароль" required minlength="6">
        <button class="btn btn-primary btn-full" type="submit">Зарегистрироваться</button>
      </form>
    `);

    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      
      try {
        await Auth.register(name, email, password);
        closeModal();
        showToast('Регистрация успешна!');
        Router.navigateTo('home');
      } catch (err) {
        showToast(err.message || 'Ошибка регистрации');
      }
    });
  });
}

// === Глобальная форма входа (для 401) ===
window.showAuthModal = function() {
  // Не показываем модалку если она уже открыта
  if (document.querySelector('.modal-overlay')) return;
  
  showModal(`
    <h3 style="margin-bottom: 8px;">Вход в аккаунт</h3>
    <p style="color: #777; font-size: 14px; margin-bottom: 16px;">Войдите чтобы получить доступ к проектам</p>
    <form id="auth-modal-form" style="display: flex; flex-direction: column; gap: 12px;">
      <input class="input" type="email" id="auth-modal-email" placeholder="Email" required>
      <input class="input" type="password" id="auth-modal-password" placeholder="Пароль" required>
      <button class="btn btn-primary btn-full" type="submit">Войти</button>
    </form>
    <div style="margin-top: 16px; padding: 12px; background: #f9f7f4; border-radius: 12px; font-size: 13px; color: #555;">
      <strong>Демо-доступ:</strong><br>
      Email: magomed@fasad.ai<br>
      Пароль: demo123
    </div>
  `);

  document.getElementById('auth-modal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-modal-email').value;
    const password = document.getElementById('auth-modal-password').value;
    
    try {
      await Auth.login(email, password);
      closeModal();
      showToast('Вы вошли в аккаунт');
      // Перезагружаем страницу чтобы обновить данные
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      showToast(err.message || 'Неверный email или пароль');
    }
  });
};

bindAuth();

// === Inline форма входа (прямо в экране) ===
function showInlineAuth(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = `
    <div class="auth-inline">
      <div class="auth-inline__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <h3 style="margin-bottom: 4px;">Вход в аккаунт</h3>
      <p class="body-text-large" style="margin-bottom: var(--spacing-lg); color: var(--color-text-secondary); font-size: var(--font-size-sm);">Войдите, чтобы видеть свои проекты</p>
      <form class="auth-inline__form" id="inline-auth-form">
        <input class="input" type="email" id="inline-auth-email" placeholder="Email" required autocomplete="email">
        <input class="input" type="password" id="inline-auth-password" placeholder="Пароль" required autocomplete="current-password">
        <button class="btn btn-primary btn-full" type="submit" id="inline-auth-submit">Войти</button>
      </form>
      <div style="margin-top: 16px; padding: 16px; background: #f7f4ef; border-radius: 16px; font-size: 13px; color: #777; line-height: 1.6;">
        <strong>Демо-доступ:</strong><br>
        Email: magomed@fasad.ai<br>
        Пароль: demo123
      </div>
    </div>
  `;

  const form = document.getElementById('inline-auth-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('inline-auth-email').value;
    const password = document.getElementById('inline-auth-password').value;
    const btn = document.getElementById('inline-auth-submit');
    
    btn.textContent = 'Вхожу...';
    btn.disabled = true;

    try {
      await Auth.login(email, password);
      showToast('Вы вошли в аккаунт');
      clearInlineAuth(targetId);
      // Перезагружаем экран после входа
      setTimeout(() => {
        Router.navigateTo(Router.currentScreen);
      }, 300);
    } catch (err) {
      showToast(err.message || 'Неверный email или пароль');
      btn.textContent = 'Войти';
      btn.disabled = false;
    }
  });
}

function clearInlineAuth(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;
  container.innerHTML = '<div class="skeleton" style="height: 100px; margin-bottom: 12px;"></div>'.repeat(3);
}

// === Авторизация на главной ===
function bindHomeAuth() {
  // Добавляем кнопку входа в профиль если не авторизован
  // (обрабатывается в renderProfile)
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  bindAuth();
  bindHomeAuth();
});
