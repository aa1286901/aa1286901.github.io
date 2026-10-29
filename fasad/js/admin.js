// === Администратор: пользователи, их тарифы и монеты, баланс ИИ (kie.ai) ===
// Виден только администраторам (email в настройках хостинга); сервер всё равно проверяет права сам.

const AdminScreen = {
  users: [],
  plans: [],
  query: '',

  async render() {
    const box = document.getElementById('admin-content');
    box.innerHTML = `
      <div class="kie" id="admin-kie"><p class="configure-hint">Баланс ИИ…</p></div>
      <div class="admin-sum" id="admin-sum"></div>
      <div class="admin-tools">
        <input class="input" type="search" id="admin-search" placeholder="Поиск: имя или email" value="${esc(this.query)}">
        <button class="btn btn-primary" id="admin-add">＋ Добавить</button>
      </div>
      <div class="users" id="admin-users"><p class="configure-hint">Загрузка…</p></div>`;
    this.loadKie();
    try {
      const res = await Api.adminUsers();
      this.users = res.data.users;
      this.plans = res.data.plans;
      this.renderList();
    } catch (e) {
      document.getElementById('admin-users').innerHTML = `<p class="configure-hint">${esc(e.message || 'Не удалось загрузить')}</p>`;
    }
  },

  async loadKie() {
    const el = document.getElementById('admin-kie');
    try {
      const k = (await Api.adminKie()).data;
      const low = k.left.nano < 20;
      el.innerHTML = `
        <div class="kie__head">${icon('sparkle')}<span>Баланс ИИ · kie.ai</span>
          <button class="kie__refresh" id="admin-kie-refresh" aria-label="Обновить">↻</button></div>
        <div class="kie__credits"><b>${k.credits.toLocaleString('ru-RU')}</b> кредитов <small>≈ $${k.usd}</small></div>
        <div class="kie__left${low ? ' kie__left--low' : ''}">Хватит примерно на ${k.left.nano} картинок Nano Banana или ${k.left.gpt} GPT Image</div>
        ${low ? '<p class="kie__warn">Пора пополнить: когда кредиты kie.ai кончатся, генерации перестанут проходить даже у пользователей с монетами.</p>' : ''}
        <a class="btn btn-secondary btn-full kie__top" href="https://kie.ai/" target="_blank" rel="noopener">Пополнить на kie.ai</a>`;
    } catch (e) {
      el.innerHTML = `<div class="kie__head">${icon('sparkle')}<span>Баланс ИИ · kie.ai</span>
        <button class="kie__refresh" id="admin-kie-refresh" aria-label="Обновить">↻</button></div>
        <p class="kie__warn">${esc(e.message || 'Не удалось узнать баланс')}</p>`;
    }
  },

  renderList() {
    const q = this.query.trim().toLowerCase();
    const list = this.users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const count = id => this.users.filter(u => u.wallet.plan === id).length;
    document.getElementById('admin-sum').innerHTML = `
      <div class="admin-sum__item"><b>${this.users.length}</b><span>${plural(this.users.length, 'пользователь', 'пользователя', 'пользователей')}</span></div>
      ${this.plans.map(p => `<div class="admin-sum__item"><b>${count(p.id)}</b><span>${esc(p.name)}</span></div>`).join('')}`;
    document.getElementById('admin-users').innerHTML = list.length ? list.map(u => `
      <button class="user" data-user="${u.id}">
        <span class="user__avatar">${esc(initials(u.name))}</span>
        <span class="user__main">
          <b>${esc(u.name)}${u.is_admin ? ' <em>админ</em>' : ''}</b>
          <small>${esc(u.email)}</small>
          <small>${u.projects} ${plural(u.projects, 'проект', 'проекта', 'проектов')} · ${u.images} ${plural(u.images, 'картинка', 'картинки', 'картинок')} · с ${formatShortDate(u.created_at)}</small>
        </span>
        <span class="user__side">
          <span class="user__plan user__plan--${u.wallet.plan}">${esc(u.wallet.plan_name)}</span>
          <span class="user__coins">${coin('silver')}${u.wallet.silver}${coin('gold')}${u.wallet.gold}</span>
        </span>
      </button>`).join('') : '<p class="configure-hint">Никого не нашлось.</p>';
  },

  monthsOptions() {
    return [1, 3, 6, 12].map(m => `<option value="${m}">${m} мес.</option>`).join('');
  },

  // Карточка пользователя: тариф и точное число монет
  openUser(id) {
    const u = this.users.find(x => x.id === id);
    if (!u) return;
    const w = u.wallet;
    showModal(`
      <div class="user-edit">
        <div class="user-edit__head">
          <span class="user__avatar">${esc(initials(u.name))}</span>
          <div><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div>
        </div>
        <p class="user-edit__now">Сейчас: тариф «${esc(w.plan_name)}»${w.plan_until ? ` до ${formatShortDate(w.plan_until)}` : ''} ·
          ${coin('silver')}${w.silver} ${coin('gold')}${w.gold}</p>

        <label class="user-edit__label">Тариф</label>
        <div class="admin-box__row">
          <select class="input" id="ue-plan"><option value="">Не менять</option>
            ${this.plans.map(p => `<option value="${p.id}">${esc(p.name)} · ${p.coins}</option>`).join('')}</select>
          <select class="input" id="ue-months">${this.monthsOptions()}</select>
        </div>

        <div class="user-edit__coins">
          <label><span>${coin('silver')} Серебряные</span><input class="input" type="number" min="0" inputmode="numeric" id="ue-silver" value="${w.silver}"></label>
          <label><span>${coin('gold')} Золотые</span><input class="input" type="number" min="0" inputmode="numeric" id="ue-gold" value="${w.gold}"></label>
        </div>
        <div class="user-edit__quick">
          ${[10, 30, 100].map(n => `<button class="btn btn-secondary" data-add-gold="${n}">+${n} ${coin('gold')}</button>`).join('')}
        </div>

        <div class="user-edit__actions">
          <button class="btn btn-secondary btn-full" id="ue-cancel">Отмена</button>
          <button class="btn btn-primary btn-full" id="ue-save">Сохранить</button>
        </div>
      </div>`);
    const gold = document.getElementById('ue-gold');
    document.querySelectorAll('[data-add-gold]').forEach(b => b.addEventListener('click', () => {
      gold.value = (+gold.value || 0) + +b.dataset.addGold;
    }));
    document.getElementById('ue-cancel').addEventListener('click', closeModal);
    document.getElementById('ue-save').addEventListener('click', () => this.save({
      action: 'update',
      user_id: u.id,
      plan: document.getElementById('ue-plan').value,
      months: +document.getElementById('ue-months').value,
      silver: document.getElementById('ue-silver').value,
      gold: gold.value,
    }, 'Сохранено'));
  },

  // Новый пользователь: имя, email, пароль и сразу тариф или монеты
  openCreate() {
    showModal(`
      <div class="user-edit">
        <h3>Новый пользователь</h3>
        <input class="input" id="uc-name" placeholder="Имя">
        <input class="input" type="email" id="uc-email" placeholder="Email">
        <input class="input" type="text" id="uc-password" placeholder="Пароль (не меньше 6 символов)" autocomplete="off">
        <label class="user-edit__label">Тариф</label>
        <div class="admin-box__row">
          <select class="input" id="uc-plan">${this.plans.map(p => `<option value="${p.id}">${esc(p.name)} · ${p.coins}</option>`).join('')}</select>
          <select class="input" id="uc-months">${this.monthsOptions()}</select>
        </div>
        <label class="user-edit__coins user-edit__coins--one"><span>${coin('gold')} Золотые монеты в подарок</span>
          <input class="input" type="number" min="0" inputmode="numeric" id="uc-gold" placeholder="0"></label>
        <div class="user-edit__actions">
          <button class="btn btn-secondary btn-full" id="uc-cancel">Отмена</button>
          <button class="btn btn-primary btn-full" id="uc-save">Добавить</button>
        </div>
      </div>`);
    document.getElementById('uc-cancel').addEventListener('click', closeModal);
    document.getElementById('uc-save').addEventListener('click', () => this.save({
      action: 'create',
      name: document.getElementById('uc-name').value.trim(),
      email: document.getElementById('uc-email').value.trim(),
      password: document.getElementById('uc-password').value,
      plan: document.getElementById('uc-plan').value,
      months: +document.getElementById('uc-months').value,
      gold: document.getElementById('uc-gold').value,
    }, 'Пользователь добавлен'));
  },

  async save(data, done) {
    const btn = document.querySelector('.user-edit .btn-primary');
    btn.disabled = true;
    try {
      const res = await Api.adminUsers(data);
      this.users = res.data.users;
      closeModal();
      showToast(done);
      this.renderList();
      // Себе поменял — обновить свои монеты
      if (data.user_id === Auth.getUser()?.id) Wallet.load();
    } catch (e) {
      showToast(e.message || 'Не получилось');
      btn.disabled = false;
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('admin-content');
    box.addEventListener('click', e => {
      const u = e.target.closest('[data-user]');
      if (u) return this.openUser(+u.dataset.user);
      if (e.target.closest('#admin-add')) return this.openCreate();
      if (e.target.closest('#admin-kie-refresh')) return this.loadKie();
    });
    box.addEventListener('input', e => {
      if (e.target.id !== 'admin-search') return;
      this.query = e.target.value;
      this.renderList();
    });
    document.getElementById('admin-back').addEventListener('click', () => Router.navigateTo('profile'));
  },
};

function onScreenAdmin() {
  if (!Auth.isLoggedIn()) return showInlineAuth('admin-content');
  AdminScreen.bind();
  AdminScreen.render();
}
