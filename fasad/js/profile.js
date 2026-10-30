// === Профиль: кто я, мои монеты и тариф, проекты; для администратора — пользователи и баланс ИИ ===

const chevron = '<svg class="profile-menu__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';

function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function menuItem(id, iconSvg, text, extra = '', attrs = '') {
  return `<div class="profile-menu__item" id="${id}" ${attrs}>
    <span class="profile-menu__icon">${iconSvg}</span>
    <span class="profile-menu__text">${text}</span>${extra}${chevron}</div>`;
}

const PROFILE_ICONS = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  ai: icon('sparkle'),
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

async function renderProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  const user = Auth.getUser();
  if (!user) {
    showInlineAuth('profile-content');
    return;
  }

  try {
    const [w, projects, favorites] = await Promise.all([
      Wallet.load(),
      Api.listProjects().then(r => r.data || []).catch(e => { if ((e.message || '').includes('Не авторизован')) throw e; return []; }),
      Api.listFavorites().then(r => r.data || []).catch(e => { if ((e.message || '').includes('Не авторизован')) throw e; return []; }),
    ]);
    const images = projects.reduce((n, p) => n + ((p.variants || []).filter(v => v.generated_image).length || (p.generated_image ? 1 : 0)), 0);
    const admin = !!Wallet.info?.is_admin;
    const planLine = w ? (w.plan_until ? `до ${formatShortDate(w.plan_until)}` : w.plan === 'free' ? `${w.plan_coins} монеты каждый месяц` : '') : '';

    container.innerHTML = `
      <div class="page-header"><h2 class="page-header__title">Профиль</h2></div>

      <div class="me">
        <div class="me__avatar">${esc(initials(user.name))}</div>
        <div class="me__text">
          <button class="me__name" id="profile-rename" aria-label="Изменить имя"><b>${esc(user.name)}</b>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>
          <span>${esc(user.email)}</span>
          ${admin ? '<em class="me__badge">Администратор</em>' : ''}
        </div>
      </div>

      ${w ? `
      <div class="wallet-card" data-open-coins>
        <div class="wallet-card__top">
          <div><small>Тариф</small><b>${esc(w.plan_name)}</b>${planLine ? `<span>${planLine}</span>` : ''}</div>
          <button class="wallet-card__btn" data-open-coins>${w.plan === 'free' ? 'Выбрать тариф' : 'Пополнить'}</button>
        </div>
        <div class="wallet-card__coins">
          <div class="wallet-card__coin">${coin('silver')}<div><b>${w.silver}</b><small>из тарифа</small></div></div>
          <div class="wallet-card__coin">${coin('gold')}<div><b>${w.gold}</b><small>купленные</small></div></div>
        </div>
        <p class="wallet-card__hint">1 монета = 1 генерация · обновление ${formatShortDate(w.renew_at)}</p>
      </div>` : ''}

      <div class="profile-stats profile-stats--3">
        <div class="profile-stat"><div class="profile-stat__number">${projects.length}</div><div class="profile-stat__label">${plural(projects.length, 'проект', 'проекта', 'проектов')}</div></div>
        <div class="profile-stat"><div class="profile-stat__number">${images}</div><div class="profile-stat__label">${plural(images, 'картинка ИИ', 'картинки ИИ', 'картинок ИИ')}</div></div>
        <div class="profile-stat"><div class="profile-stat__number">${favorites.length}</div><div class="profile-stat__label">в избранном</div></div>
      </div>

      ${admin ? `
      <h3 class="profile-section">Администратор</h3>
      <div class="profile-menu">
        ${menuItem('profile-admin', PROFILE_ICONS.users, 'Пользователи', '<span class="profile-menu__value" id="profile-admin-count"></span>')}
        ${menuItem('profile-kie', PROFILE_ICONS.ai, 'Баланс ИИ (kie.ai)', '<span class="profile-menu__value" id="profile-kie-credits">…</span>')}
      </div>` : ''}

      <h3 class="profile-section">Приложение</h3>
      <div class="profile-menu">
        ${menuItem('profile-favorites', PROFILE_ICONS.heart, 'Избранные материалы', favorites.length ? `<span class="profile-menu__value">${favorites.length}</span>` : '')}
        ${menuItem('profile-tips', PROFILE_ICONS.camera, 'Как сфотографировать дом')}
        ${menuItem('profile-help', PROFILE_ICONS.help, 'Помощь и поддержка')}
        ${menuItem('profile-about', PROFILE_ICONS.info, 'О приложении')}
      </div>

      <button class="btn btn-ghost btn-full profile-logout" id="profile-logout">${PROFILE_ICONS.logout}Выйти из аккаунта</button>
    `;

    document.getElementById('profile-rename')?.addEventListener('click', async () => {
      const name = await showPrompt('Ваше имя', user.name, 'Сохранить', 'Как вас зовут');
      if (!name || name === user.name) return;
      try {
        await Api.updateProfile({ name });
        user.name = name;
        showToast('Имя сохранено');
        renderProfile();
      } catch (err) {
        showToast(err.message || 'Не удалось сохранить имя');
      }
    });
    const go = (id, screen) => document.getElementById(id)?.addEventListener('click', () => Router.navigateTo(screen));
    go('profile-favorites', 'favorites');
    go('profile-tips', 'tips');
    go('profile-help', 'help');
    go('profile-about', 'about');
    go('profile-admin', 'admin');
    go('profile-kie', 'admin');
    document.getElementById('profile-logout')?.addEventListener('click', async () => {
      const ok = await showConfirm('Выйти', 'Вы уверены, что хотите выйти?', 'Выйти');
      if (ok) {
        await Auth.logout();
        showToast('Вы вышли из аккаунта');
        Router.navigateTo('home');
      }
    });
    if (admin) {
      // Цифры администратора — без ожидания, когда придут
      Api.adminKie().then(r => {
        const el = document.getElementById('profile-kie-credits');
        if (el) el.textContent = `${r.data.credits} кр.`;
      }).catch(() => {
        const el = document.getElementById('profile-kie-credits');
        if (el) el.textContent = '—';
      });
      Api.adminUsers().then(r => {
        const el = document.getElementById('profile-admin-count');
        if (el) el.textContent = r.data.users.length;
      }).catch(() => {});
    }
  } catch (e) {
    if ((e.message || '').includes('Не авторизован')) {
      Auth._user = null;
      showInlineAuth('profile-content');
      return;
    }
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__title">Ошибка загрузки</div>
        <div class="empty-state__text">${esc(e.message || 'Попробуйте обновить страницу')}</div>
        <button class="btn btn-primary" onclick="renderProfile()">Обновить</button>
      </div>
    `;
  }
}

// === Помощь и поддержка ===
const HELP_FAQ = [
  ['Как сделать фасад?', 'На главной нажмите «Создать фасад», сфотографируйте дом или выберите фото из галереи. Затем выберите плитку для стен и цоколя, узоры (карнизы, наличники, русты) и нажмите «Сгенерировать фасад» — ИИ нарисует облицовку прямо на вашем фото.'],
  ['Что такое монеты?', '1 монета = 1 генерация фасада. Серебряные монеты дают тарифы, каждый месяц их снова столько, сколько в тарифе. Золотые — купленные пакеты, они не сгорают. Сначала тратятся серебряные, потом золотые. Nano Banana рисует за 1 монету, GPT Image 2.5 — за 2.'],
  ['ИИ не нарисовал — монеты пропали?', 'Нет. Если ИИ не смог нарисовать, монеты возвращаются автоматически. Попробуйте ещё раз или выберите другую модель.'],
  ['Какое фото лучше?', 'Дневное фото без резких теней, дом целиком в кадре, снято с уровня глаз и по возможности прямо. Чем меньше машин и деревьев перед фасадом, тем точнее результат.'],
  ['Как показать заказчику?', 'Откройте проект: «До и после» показывает разницу, «Увеличить» — на весь экран. «Скачать» сохраняет картинку, кнопка «Поделиться» вверху отправляет её в мессенджер.'],
  ['Как сделать несколько вариантов?', 'В проекте нажмите «Изменить и сгенерировать» — поменяйте камень или узоры, и это сохранится новым вариантом. Все варианты видны в ленте «Варианты».'],
];

const SUPPORT_LINKS = {
  telegram: (v) => [`https://t.me/${v.replace(/^@|https?:\/\/t\.me\//g, '')}`, 'Telegram'],
  whatsapp: (v) => [`https://wa.me/${v.replace(/\D/g, '')}`, 'WhatsApp'],
  phone: (v) => [`tel:${v.replace(/[^\d+]/g, '')}`, 'Позвонить'],
  email: (v) => [`mailto:${v}`, 'Написать на почту'],
};

async function onScreenHelp() {
  const box = document.getElementById('help-content');
  box.innerHTML = `
    <div class="faq">${HELP_FAQ.map(([q, a], i) => `
      <details class="faq__item"${i ? '' : ' open'}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
    <h3 class="profile-section">Связаться с нами</h3>
    <div class="support" id="support-links"><p class="configure-hint">Загрузка…</p></div>`;
  let links = {};
  try { links = (await Api.getSupport()).data || {}; } catch (e) { /* без сети */ }
  const el = document.getElementById('support-links');
  const items = Object.entries(links).filter(([k]) => SUPPORT_LINKS[k]).map(([k, v]) => {
    const [href, label] = SUPPORT_LINKS[k](v);
    return `<a class="btn btn-secondary btn-full" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
  });
  el.innerHTML = items.length ? items.join('') : '<p class="configure-hint">Контакты поддержки скоро появятся здесь.</p>';
}

// === О приложении ===
function onScreenAbout() {
  const v = document.querySelector('script[src*="coins.js"]')?.src.match(/v=([a-z0-9]+)/i)?.[1] || '';
  document.getElementById('about-content').innerHTML = `
    <div class="about">
      <img class="about__logo" src="app-icon-192.png" alt="Fasad AI">
      <h2>Fasad</h2>
      <p class="about__lead">Приложение для прорабов: покажите заказчику его дом в натуральном камне ещё до начала работ.</p>
      <ul class="about__list">
        <li>Каталог камня и изделий — плитка, карнизы, наличники, русты, колонны, балюстрады</li>
        <li>Подбор фасада в три шага: плитка, узоры, итог со спецификацией</li>
        <li>ИИ рисует облицовку прямо на фото дома — несколько вариантов в одном проекте</li>
        <li>«До и после», просмотр на весь экран, отправка заказчику</li>
      </ul>
      <p class="about__ver">Версия ${esc(v)}</p>
    </div>`;
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
          showMaterialDetail(m);
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
