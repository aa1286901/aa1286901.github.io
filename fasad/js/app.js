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
    
    // Навигация
    this.bindNavigation();
    this.bindButtons();

    // Маршрут
    const screen = Router.getScreenFromHash();
    Router.navigateTo(screen, false);
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
    document.getElementById('hero-create')?.addEventListener('click', () => {
      Router.navigateTo('photo');
    });

    // «Создать проект» в истории проектов
    document.getElementById('projects-create')?.addEventListener('click', () => {
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
