// === Main App ===
const App = {
  async init() {
    // Фикс для iOS viewport height
    this.fixIOSViewport();
    
    // Регистрируем Service Worker для кэширования
    if ('serviceWorker' in navigator) {
      try {
        // Без автоматической перезагрузки при обновлении: страница, скрипты и стили
        // всегда берутся из сети, а перезагрузка могла оборвать выбор фото или разметку
        await navigator.serviceWorker.register('sw.js');
      } catch (err) {
        console.warn('[App] Ошибка регистрации SW:', err);
      }
    }
    
    Router.init();
    
    const user = await Auth.init();
    
    // Если есть черновик проекта - предложить продолжить
    if (ProjectFlow.hasDraft()) {
      this.showDraftPrompt();
    }

    // Навигация
    this.bindNavigation();
    this.bindButtons();

    // Маршрут
    const screen = Router.getScreenFromHash();
    Router.navigateTo(screen, false);
  },

  showDraftPrompt() {
    showModal(`
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">📐</div>
        <h3 style="margin-bottom: 8px;">Есть незавершённый проект</h3>
        <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: 24px;">
          Вы размечали фасад. Продолжить?
        </p>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary btn-full" id="draft-skip">Начать заново</button>
          <button class="btn btn-primary btn-full" id="draft-continue">Продолжить</button>
        </div>
      </div>
    `);

    document.getElementById('draft-continue')?.addEventListener('click', () => {
      closeModal();
      const draft = ProjectFlow.loadDraft();
      if (draft.originalPhoto) {
        ProjectFlow.setState('originalPhoto', draft.originalPhoto);
        ProjectFlow.setState('design', draft.design || null);
        Router.navigateTo('editor');
      }
    });

    document.getElementById('draft-skip')?.addEventListener('click', () => {
      closeModal();
      ProjectFlow.clearDraft();
    });
  },

  bindNavigation() {
    document.querySelectorAll('.bottom-nav__item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        Router.navigateTo(screen);
      });
    });
  },

  bindButtons() {
    // Кнопка "Создать проект" на главной
    document.querySelector('.hero__cta')?.addEventListener('click', () => {
      Router.navigateTo('photo');
    });

    // Быстрая история
    document.querySelector('.quick-history__card')?.addEventListener('click', () => {
      Router.navigateTo('projects');
    });
  },

  // Фикс для iOS viewport height (Dynamic Island, home indicator)
  fixIOSViewport() {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    
    // Фикс для iOS при повороте экрана
    window.addEventListener('orientationchange', setVh, { passive: true });
    
    // Фикс для iOS при показе/скрытии адресной строки
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setVh, 100);
    }, { passive: true });
  },
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
