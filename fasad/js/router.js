const Router = {
  currentScreen: 'home',

  init() {
    // Предотвращаем стандартное поведение для всех <a> с href="#..."
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const screen = link.getAttribute('href').slice(1);
        this.navigateTo(screen);
      }
    });

    window.addEventListener('popstate', (e) => {
      const screen = e.state?.screen || 'home';
      this.navigateTo(screen, false);
    });
  },

  navigateTo(screen, pushState = true) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Показываем нужный
    const target = document.querySelector(`.screen[data-screen="${screen}"]`);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screen;
    }

    // Обновляем навигацию
    this.updateNav(screen);

    // Прокрутка наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Push state
    if (pushState) {
      history.pushState({ screen }, '', `#${screen}`);
    }

    // Вызываем обработчики экрана
    const screenHandler = window[`onScreen${screen.charAt(0).toUpperCase() + screen.slice(1)}`];
    if (screenHandler) screenHandler();
  },

  updateNav(screen) {
    document.querySelectorAll('.bottom-nav__item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.screen === screen) {
        item.classList.add('active');
      }
    });
  },

  getScreenFromHash() {
    const hash = window.location.hash.slice(1);
    return hash || 'home';
  }
};
