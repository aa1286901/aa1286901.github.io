// === Логика экранов ===

// === Экран: Главная ===
function onScreenHome() {
  // Главная страница — ничего дополнительно не нужно
}

// === Экран: Фото ===
function onScreenPhoto() {
  const cameraArea = document.getElementById('camera-area');
  const continueBtn = document.getElementById('photo-continue');
  const backBtn = document.getElementById('photo-back');
  const tipsBtn = document.getElementById('photo-tips');

  // Запускаем камеру
  if (cameraArea && !cameraArea.querySelector('video') && !cameraArea.querySelector('img')) {
    Camera.startCamera(cameraArea);
  }

  // Проверка наличия фото для кнопки "Продолжить"
  checkPhotoForContinue();

  // Продолжить
  continueBtn?.addEventListener('click', async () => {
    const photo = ProjectFlow.getState('originalPhoto');
    if (!photo) {
      showToast('Сначала сфотографируйте дом');
      return;
    }

    // Загружаем фото на сервер
    try {
      const fileInput = cameraArea?.querySelector('input[type="file"]');
      if (ProjectFlow.getState('originalImageFile')) {
        const uploadData = await Api.uploadImage(ProjectFlow.getState('originalImageFile'));
        ProjectFlow.setState('originalPhoto', uploadData.data.url);
      }

      Router.navigateTo('design');
    } catch (e) {
      showToast('Не удалось загрузить фотографию. Попробуйте ещё раз.');
    }
  });

  // Назад
  backBtn?.addEventListener('click', () => Router.navigateTo('home'));

  // Советы
  tipsBtn?.addEventListener('click', () => Router.navigateTo('tips'));

  // Слушаем изменения фото
  const checkInterval = setInterval(() => {
    if (ProjectFlow.getState('originalPhoto')) {
      checkPhotoForContinue();
      clearInterval(checkInterval);
    }
  }, 500);
}

function checkPhotoForContinue() {
  const continueBtn = document.getElementById('photo-continue');
  const photo = ProjectFlow.getState('originalPhoto');
  
  if (photo) {
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    
    // Показываем превью
    const cameraArea = document.getElementById('camera-area');
    if (cameraArea && !cameraArea.querySelector('img.preview')) {
      Camera.stopCamera();
      cameraArea.innerHTML = `<img class="preview" src="${photo}" alt="Превью" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-xl);">`;
      
      // Добавляем кнопки поверх превью
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-end;padding:20px;gap:12px;';
      overlay.innerHTML = `
        <button class="btn btn-secondary" id="rephoto-btn" style="background:rgba(255,255,255,0.9);font-size:var(--font-size-sm);padding:10px 20px;min-height:44px;">📷 Переснять</button>
      `;
      cameraArea.style.position = 'relative';
      cameraArea.appendChild(overlay);
      
      document.getElementById('rephoto-btn')?.addEventListener('click', () => {
        overlay.remove();
        Camera.startCamera(cameraArea);
        ProjectFlow.setState('originalPhoto', null);
        const cb = document.getElementById('photo-continue');
        cb.disabled = true;
        cb.style.opacity = '0.5';
      });
    }
  }
}

// === Экран: Генерация ===
function onScreenGenerating() {
  // Генерация запускается из startGeneration(), ничего дополнительно не нужно
}

// === Экран: Дизайн ===
function onScreenDesign() {
  loadDesignMaterials();
  setupDesignNavigation();
}

async function loadDesignMaterials() {
  const baseCarousel = document.getElementById('base-material-carousel');
  const facadeCarousel = document.getElementById('facade-material-carousel');
  const cornicesCarousel = document.getElementById('cornices-carousel');

  if (!baseCarousel || !facadeCarousel || !cornicesCarousel) return;

  // Загружаем материалы
  const [baseMaterials, facadeMaterials] = await Promise.all([
    Materials.getByCategory('stone'),
    Materials.getByCategory('stone'),
  ]);

  // Загружаем карнизы
  let cornices = [];
  try {
    const cornicesData = await Materials.getCornices();
    cornices = cornicesData;
  } catch (e) {
    console.warn('No cornices data');
  }

  // Рендерим цоколь
  baseMaterials.forEach(mat => {
    const card = renderMaterialCard(mat, false);
    card.addEventListener('click', () => {
      // Сброс предыдущего
      baseCarousel.querySelectorAll('.material-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      ProjectFlow.setState('selectedBaseMaterial', mat);
      updateSelectionSummary();
    });
    baseCarousel.appendChild(card);
  });

  // Рендерим основную плитку
  facadeMaterials.forEach(mat => {
    const card = renderMaterialCard(mat, false);
    card.addEventListener('click', () => {
      facadeCarousel.querySelectorAll('.material-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      ProjectFlow.setState('selectedFacadeMaterial', mat);
      updateSelectionSummary();
    });
    facadeCarousel.appendChild(card);
  });

  // Рендерим карнизы (множественный выбор)
  cornices.forEach((cornice, i) => {
    const card = renderMaterialCard(cornice, false);
    card.addEventListener('click', () => {
      const isSelected = card.classList.contains('selected');
      card.classList.toggle('selected');
      
      if (isSelected) {
        ProjectFlow.state.selectedCornices = ProjectFlow.state.selectedCornices.filter(id => id !== cornice.id);
      } else {
        ProjectFlow.state.selectedCornices.push(cornice.id);
      }
      ProjectFlow.saveDraft();
      updateSelectionSummary();
    });
    cornicesCarousel.appendChild(card);
  });

  // Восстанавливаем выбор из черновика
  const draft = ProjectFlow.loadDraft();
  if (draft) {
    if (draft.selectedBaseMaterial) {
      baseCarousel.querySelectorAll('.material-card').forEach((c, i) => {
        if (baseMaterials[i]?.id === draft.selectedBaseMaterial.id) c.classList.add('selected');
      });
    }
    if (draft.selectedFacadeMaterial) {
      facadeCarousel.querySelectorAll('.material-card').forEach((c, i) => {
        if (facadeMaterials[i]?.id === draft.selectedFacadeMaterial.id) c.classList.add('selected');
      });
    }
    if (draft.selectedCornices) {
      cornicesCarousel.querySelectorAll('.material-card').forEach((c, i) => {
        if (draft.selectedCornices.includes(cornices[i]?.id)) c.classList.add('selected');
      });
    }
    updateSelectionSummary();
  }

  // Кнопка генерации
  setupGenerateButton();
}

function updateSelectionSummary() {
  const base = ProjectFlow.getState('selectedBaseMaterial');
  const facade = ProjectFlow.getState('selectedFacadeMaterial');
  const cornices = ProjectFlow.getState('selectedCornices') || [];

  const selBase = document.getElementById('sel-base');
  const selFacade = document.getElementById('sel-facade');
  const selCornices = document.getElementById('sel-cornices');

  if (selBase) selBase.textContent = base ? base.name : 'Не выбран';
  if (selFacade) selFacade.textContent = facade ? facade.name : 'Не выбрана';
  if (selCornices) selCornices.textContent = `${cornices.length} элементов`;

  setupGenerateButton();
}

function setupGenerateButton() {
  // Удаляем старую кнопку если есть
  const oldBar = document.querySelector('.generate-bar');
  if (oldBar) oldBar.remove();

  const isValid = ProjectFlow.isValid();
  const bar = document.createElement('div');
  bar.className = 'generate-bar';
  bar.innerHTML = `
    <button class="btn btn-primary btn-full" ${!isValid ? 'disabled' : ''}>
      ${isValid ? 'Сгенерировать дизайн' : 'Выберите материалы для генерации'}
    </button>
  `;

  if (isValid) {
    bar.querySelector('button').addEventListener('click', startGeneration);
  }

  const designScreen = document.querySelector('[data-screen="design"]');
  if (designScreen) {
    designScreen.appendChild(bar);
  } else {
    document.body.appendChild(bar);
  }
}

async function startGeneration() {
  if (!ProjectFlow.isValid()) {
    showToast('Выберите материал для цоколя и основную плитку');
    return;
  }

  const photo = ProjectFlow.getState('originalPhoto');
  
  // Переходим на экран генерации
  Router.navigateTo('generating');

  // Показываем превью
  const genImg = document.getElementById('gen-preview-img');
  if (genImg) genImg.src = photo;

  // Показываем теги
  const genInfo = document.getElementById('gen-info');
  if (genInfo) {
    const base = ProjectFlow.getState('selectedBaseMaterial');
    const facade = ProjectFlow.getState('selectedFacadeMaterial');
    genInfo.innerHTML = `
      <span class="generating-info__tag">Цоколь: ${base?.name || ''}</span>
      <span class="generating-info__tag">Плитка: ${facade?.name || ''}</span>
    `;
  }

  // Запускаем генерацию
  try {
    // Создаём проект
    const projectData = {
      name: `Проект ${new Date().getDate()}.${new Date().getMonth()+1}.${new Date().getFullYear()}`,
      original_image: photo,
      base_material_id: ProjectFlow.getState('selectedBaseMaterial')?.id,
      facade_material_id: ProjectFlow.getState('selectedFacadeMaterial')?.id,
      cornices: ProjectFlow.getState('selectedCornices') || [],
    };

    const project = await Api.createProject(projectData);
    const projectId = project.data.id;
    ProjectFlow.setState('projectId', projectId);

    // Запускаем mock generation
    GenerationService.start(projectId, 
      [
        { material_id: projectData.base_material_id, category: 'base' },
        { material_id: projectData.facade_material_id, category: 'facade' }
      ],
      projectData.cornices
    );

    // Мониторим статус
    monitorGeneration(projectId);

  } catch (e) {
    console.error('Generation error:', e);
    showToast('Не удалось создать проект. Попробуйте ещё раз.');
    Router.navigateTo('design');
  }
}

async function monitorGeneration(projectId) {
  const percentEl = document.getElementById('gen-percent');
  const progressEl = document.getElementById('gen-progress');
  const spinnerEl = document.getElementById('gen-spinner');

  const checkInterval = setInterval(async () => {
    try {
      const status = await Api.getGenerationStatus(projectId);
      const progress = status.data?.progress || 0;
      const genStatus = status.data?.status || 'processing';

      if (percentEl) percentEl.textContent = `${progress}%`;
      if (progressEl) progressEl.style.width = `${progress}%`;

      if (genStatus === 'completed') {
        clearInterval(checkInterval);
        if (spinnerEl) spinnerEl.style.display = 'none';
        
        // Переходим к результату
        setTimeout(() => {
          Router.navigateTo('project');
          loadProjectPage(projectId);
        }, 500);
      } else if (genStatus === 'failed') {
        clearInterval(checkInterval);
        showToast('Не удалось создать дизайн. Попробуйте снова.');
        Router.navigateTo('design');
      }
    } catch (e) {
      console.warn('Status check error:', e);
    }
  }, 1000);
}

// === Экран: Проект (результат) ===
async function onScreenProject() {
  const projectId = Router.currentScreen.replace('project-', '');
  if (projectId && projectId !== 'project') {
    await loadProjectPage(projectId);
  }
}

async function loadProjectPage(projectId) {
  const projectImage = document.getElementById('project-image');
  const projectDetails = document.getElementById('project-details');
  const projectBack = document.getElementById('project-back');
  const projectSave = document.getElementById('project-save');
  const projectDownload = document.getElementById('project-download');
  const projectShare = document.getElementById('project-share');

  try {
    const project = await Api.getProject(projectId);
    const data = project.data;

    if (projectImage) projectImage.src = data.generated_image || data.original_image;

    if (projectDetails) {
      const baseMat = await Materials.getById(data.base_material_id);
      const facadeMat = await Materials.getById(data.facade_material_id);
      
      projectDetails.innerHTML = `
        <div class="project-details__item">
          <span class="project-details__label">Цоколь</span>
          <span class="project-details__value">${baseMat?.name || 'Не указан'}</span>
        </div>
        <div class="project-details__item">
          <span class="project-details__label">Плитка</span>
          <span class="project-details__value">${facadeMat?.name || 'Не указана'}</span>
        </div>
        <div class="project-details__item">
          <span class="project-details__label">Карнизы</span>
          <span class="project-details__value">${data.cornices?.length || 0} элементов</span>
        </div>
        <div class="project-details__item">
          <span class="project-details__label">Дата</span>
          <span class="project-details__value">${formatFullDate(data.created_at)}</span>
        </div>
      `;
    }

    if (projectBack) {
      projectBack.addEventListener('click', () => Router.navigateTo('projects'));
    }

    if (projectSave) {
      projectSave.addEventListener('click', async () => {
        showToast('Проект сохранён');
      });
    }

    if (projectDownload) {
      projectDownload.addEventListener('click', () => {
        const img = data.generated_image || data.original_image;
        downloadImage(img, `fasad-project-${projectId}.png`);
      });
    }

    if (projectShare) {
      projectShare.addEventListener('click', () => {
        const img = data.generated_image || data.original_image;
        shareProject(data.name, img);
      });
    }

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
        Router.navigateTo(`project-${p.id}`);
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

// === Экран: Главная ===
function onScreenHome() {
  // Главная — ничего дополнительно не нужно
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

// === Навигация дизайна ===
function setupDesignNavigation() {
  document.getElementById('design-back')?.addEventListener('click', () => {
    Router.navigateTo('photo');
  });
}

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
