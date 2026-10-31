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
        <div class="kie__left${low ? ' kie__left--low' : ''}">Хватит примерно на ${k.left.nano} картинок Nano Banana или ${k.left.gpt} ChatGPT Image</div>
        ${low ? '<p class="kie__warn">Пора пополнить: когда кредиты kie.ai кончатся, генерации перестанут проходить даже у пользователей с монетами.</p>' : ''}
        <div class="kie__btns">
          <button class="btn btn-secondary" data-open-ailog>Журнал запросов</button>
          <a class="btn btn-secondary" href="https://kie.ai/" target="_blank" rel="noopener">Пополнить</a>
        </div>
        ${this.keyRow()}`;
    } catch (e) {
      el.innerHTML = `<div class="kie__head">${icon('sparkle')}<span>Баланс ИИ · kie.ai</span>
        <button class="kie__refresh" id="admin-kie-refresh" aria-label="Обновить">↻</button></div>
        <p class="kie__warn">${esc(e.message || 'Не удалось узнать баланс')}</p>
        <button class="btn btn-secondary btn-full kie__top" data-open-ailog>Журнал запросов</button>
        ${this.keyRow()}`;
    }
    this.loadKey();
  },

  // Ключ kie.ai: видно только последние 4 символа; сменить — при переходе на другой аккаунт kie.ai
  keyRow() {
    return `<div class="kie__key"><span>Ключ API: <b id="admin-key-mask">…</b></span>
      <button class="btn btn-ghost kie__key-btn" id="admin-key-change">Сменить ключ</button></div>`;
  },

  async loadKey() {
    try {
      const k = (await Api.adminAiKey()).data;
      const el = document.getElementById('admin-key-mask');
      if (el) el.textContent = k.key || 'не задан';
    } catch (e) { /* баланс уже показал ошибку */ }
  },

  async changeKey() {
    const key = await showPrompt('Новый ключ kie.ai', '', 'Проверить и сохранить', 'Вставьте ключ со страницы kie.ai/api-key');
    if (!key) return;
    try {
      const res = await Api.adminAiKey(key);
      showToast(`Ключ сохранён · на балансе ${res.data.credits.toLocaleString('ru-RU')} кредитов`);
      this.loadKie();
    } catch (e) {
      showToast(e.message || 'Ключ не подошёл');
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
      if (e.target.closest('#admin-key-change')) return this.changeKey();
      if (e.target.closest('[data-open-ailog]')) return Router.navigateTo('ailog');
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

// === Журнал запросов к ИИ: каждая генерация — что отправили в kie.ai и что он ответил ===
const AI_LOG_MODELS = { 'nano-banana-2-1': 'Nano Banana', 'gpt-image-2-image-to-image': 'ChatGPT Image' };
// Запрос или ответ kie.ai целиком — раскрывающимся блоком (старые записи журнала их не хранят)
function aiLogJson(title, data) {
  if (data == null || data === '') return '';
  let text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  // resultJson и param kie.ai присылает строкой с JSON внутри — раскрыть для чтения
  try {
    const o = typeof data === 'string' ? null : JSON.parse(JSON.stringify(data));
    if (o?.data?.resultJson) { o.data.resultJson = JSON.parse(o.data.resultJson); text = JSON.stringify(o, null, 2); }
  } catch (e) { /* оставить как есть */ }
  return `<details class="ailog-d__json"><summary>${title}</summary><pre class="ailog-d__prompt">${esc(text)}</pre></details>`;
}

const AI_LOG_STATUS = { processing: ['рисует', 'wait'], done: ['готово', 'ok'], failed: ['ошибка', 'err'], start_error: ['не принят', 'err'] };
const aiLogFailed = x => x.status === 'failed' || x.status === 'start_error';

const AiLogScreen = {
  entries: [],
  onlyErrors: false,

  async render() {
    const box = document.getElementById('ailog-content');
    box.innerHTML = '<p class="configure-hint">Загрузка…</p>';
    try {
      this.entries = (await Api.adminAiLog()).data.entries;
      this.draw();
    } catch (e) {
      box.innerHTML = `<p class="configure-hint">${esc(e.message || 'Не удалось загрузить журнал')}</p>`;
    }
  },

  draw() {
    const all = this.entries;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const day = all.filter(x => (x.at || '').startsWith(today));
    const credits = day.reduce((a, x) => a + (+x.credits || 0), 0);
    const list = this.onlyErrors ? all.filter(aiLogFailed) : all;
    document.getElementById('ailog-content').innerHTML = `
      <div class="admin-sum ailog-sum">
        <div class="admin-sum__item"><b>${day.length}</b><span>запросов сегодня</span></div>
        <div class="admin-sum__item"><b>${day.filter(aiLogFailed).length}</b><span>ошибок сегодня</span></div>
        <div class="admin-sum__item"><b>${kpNum(credits)}</b><span>кредитов сегодня</span></div>
      </div>
      <div class="ai-pick__seg ailog-filter">
        <button class="${this.onlyErrors ? '' : 'active'}" data-ailog-filter="all"><b>Все · ${all.length}</b></button>
        <button class="${this.onlyErrors ? 'active' : ''}" data-ailog-filter="err"><b>Ошибки · ${all.filter(aiLogFailed).length}</b></button>
      </div>
      <div class="ailog">${list.length ? list.map(x => this.rowHtml(x)).join('') : '<p class="configure-hint">Запросов пока нет. Журнал пишется с момента обновления приложения.</p>'}</div>`;
  },

  rowHtml(x) {
    const [label, cls] = AI_LOG_STATUS[x.status] || [x.status, 'wait'];
    const secs = x.cost_ms ? Math.round(x.cost_ms / 1000) : (x.finished_at && x.at ? Math.round((parseDate(x.finished_at) - parseDate(x.at)) / 1000) : null);
    return `
      <button class="ailog__row" data-ailog="${esc(x.id)}">
        <span class="ailog__top"><b>${esc(AI_LOG_MODELS[x.model] || x.model || '—')}</b><span class="ailog__pill ailog__pill--${cls}">${label}</span></span>
        <span class="ailog__meta">${esc(formatDateTime(x.at))} · ${esc(x.user_name || x.user || '')}${secs != null ? ` · ${secs} с` : ''}${x.credits ? ` · ${kpNum(x.credits)} кр.` : ''}</span>
        ${aiLogFailed(x) ? `<span class="ailog__err">${esc(x.response || '')}</span>` : ''}
      </button>`;
  },

  open(id) {
    const x = this.entries.find(e => e.id === id);
    if (!x) return;
    const [label, cls] = AI_LOG_STATUS[x.status] || [x.status, 'wait'];
    const row = (k, v) => (v == null || v === '' ? '' : `<div class="ailog-d__row"><span>${k}</span><b>${v}</b></div>`);
    showModal(`
      <div class="ailog-d">
        <h3 class="sheet-title">${esc(AI_LOG_MODELS[x.model] || x.model)} <span class="ailog__pill ailog__pill--${cls}">${label}</span></h3>
        ${row('Ответ kie.ai', esc(x.response || (x.status === 'processing' ? 'ещё рисует' : '')))}
        ${row('Отправлено', esc(formatDateTime(x.at)))}
        ${row('Завершено', x.finished_at ? esc(formatDateTime(x.finished_at)) : '')}
        ${row('Время у kie.ai', x.cost_ms ? `${Math.round(x.cost_ms / 1000)} с` : '')}
        ${row('Кредитов', x.credits != null ? kpNum(x.credits) : '')}
        ${row('Пользователь', esc([x.user_name, x.user].filter(Boolean).join(' · ')))}
        ${row('Проект', esc(`${x.project_name || ''} · №${x.project ?? '—'}, вариант ${x.variant ?? '—'}`))}
        ${row('Модель', esc(x.model || ''))}
        ${row('Размер', esc([x.resolution, x.aspect].filter(Boolean).join(' · ')))}
        ${row('ID задачи', `<code>${esc(x.id)}</code>`)}
        ${x.result ? `<a class="ailog-d__result" href="${esc(x.result)}" target="_blank" rel="noopener"><img src="${esc(x.result)}" alt="Результат"></a>` : ''}
        <div class="ailog-d__label">Картинки в запросе · ${(x.images || []).length}</div>
        <div class="ailog-d__imgs">${(x.images || []).map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Картинка ${i + 1}" loading="lazy"><span>${i + 1}</span></a>`).join('')}</div>
        <div class="ailog-d__label">Задание (промпт)</div>
        <pre class="ailog-d__prompt">${esc(x.prompt || '')}</pre>
        <button class="btn btn-secondary btn-full" data-ailog-copy>Скопировать задание</button>
        ${aiLogJson('Запрос в kie.ai (createTask)', x.request)}
        ${aiLogJson('Ответ kie.ai на запрос', x.start_response)}
        ${aiLogJson('Ответ kie.ai с результатом (recordInfo)', x.result_response)}
      </div>`);
    document.querySelector('[data-ailog-copy]').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(x.prompt || ''); showToast('Задание скопировано'); } catch (e) { showToast('Не удалось скопировать'); }
    });
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    document.getElementById('ailog-content').addEventListener('click', e => {
      const f = e.target.closest('[data-ailog-filter]');
      if (f) { this.onlyErrors = f.dataset.ailogFilter === 'err'; return this.draw(); }
      const r = e.target.closest('[data-ailog]');
      if (r) this.open(r.dataset.ailog);
    });
    document.getElementById('ailog-back').addEventListener('click', () => Router.navigateTo('admin'));
    document.getElementById('ailog-refresh').addEventListener('click', () => this.render());
  },
};

function onScreenAilog() {
  if (!Auth.isLoggedIn()) return showInlineAuth('ailog-content');
  AiLogScreen.bind();
  AiLogScreen.render();
}
