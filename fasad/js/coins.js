// === Монеты и тарифы ===
// Серебряные монеты — из тарифа, каждый месяц обновляются. Золотые — купленные пакеты, не сгорают.
// 1 монета = 1 генерация (Nano Banana); ChatGPT Image — 2 монеты. Сначала тратятся серебряные.

const coin = (kind) => `<span class="coin coin--${kind}" aria-hidden="true"></span>`;

function coinsWord(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return 'монет';
  if (b === 1) return 'монета';
  if (b >= 2 && b <= 4) return 'монеты';
  return 'монет';
}

const rub = (n) => `${n.toLocaleString('ru-RU')} ₽`;

const Wallet = {
  data: null,    // остаток: { plan, plan_name, plan_coins, plan_until, silver, gold, renew_at }
  info: null,    // тарифы, пакеты, цена моделей

  async load() {
    if (!Auth.isLoggedIn()) return null;
    try {
      const res = await Api.getWallet();
      this.info = res.data;
      this.set(res.data.wallet);
    } catch (e) {
      // Без сети покажем то, что знали
    }
    return this.data;
  },

  set(w) {
    if (!w) return;
    this.data = w;
    AiChoice.render();
  },

  // Генерация упёрлась в монеты — предложить тарифы и пакеты
  handleError(e) {
    if (!(e?.message || '').includes('Не хватает монет')) return false;
    showConfirm('Не хватает монет', 'Монеты этого месяца закончились. Выберите тариф или докупите золотые монеты — 1 монета = 1 генерация.', 'Открыть тарифы')
      .then(ok => ok && Router.navigateTo('coins'));
    return true;
  },

  // Короткий остаток: серебряные и золотые
  chip() {
    const w = this.data;
    if (!w) return '';
    return `<button class="wallet-chip" data-open-coins aria-label="Монеты и тариф">
      ${coin('silver')}<b>${w.silver}</b>${w.gold ? `${coin('gold')}<b>${w.gold}</b>` : ''}</button>`;
  },
};

document.addEventListener('click', e => {
  if (e.target.closest('[data-open-coins]')) Router.navigateTo('coins');
});

// === Экран «Монеты и тариф» ===
const CoinsScreen = {
  async render() {
    const box = document.getElementById('coins-content');
    if (!Auth.isLoggedIn()) return showInlineAuth('coins-content');
    if (!Wallet.info) box.innerHTML = '<p class="configure-hint">Загрузка…</p>';
    await Wallet.load();
    if (!Wallet.info) {
      box.innerHTML = '<p class="configure-hint">Не удалось загрузить монеты — проверьте интернет.</p>';
      return;
    }
    const { wallet: w, plans, packs } = Wallet.info;
    const renew = formatShortDate(w.renew_at);
    const best = 'pro';
    box.innerHTML = `
      <div class="balance">
        <div class="balance__row">
          ${coin('silver')}<div class="balance__text"><b>${w.silver} ${coinsWord(w.silver)}</b>
            <span>Серебряные — тариф «${esc(w.plan_name)}», ${w.plan_coins} в месяц. Обновятся ${renew}</span></div>
        </div>
        <div class="balance__row">
          ${coin('gold')}<div class="balance__text"><b>${w.gold} ${coinsWord(w.gold)}</b>
            <span>Золотые — купленные, не сгорают</span></div>
        </div>
        ${w.plan_until ? `<p class="balance__until">Тариф действует до ${formatShortDate(w.plan_until)}</p>` : ''}
      </div>

      <div class="coins-help">
        <p><b>${coin('silver')} 1 монета = 1 генерация фасада.</b> Nano Banana рисует за 1 монету, ChatGPT Image — за 2.</p>
        <p>Сначала тратятся серебряные монеты тарифа, потом золотые. Если ИИ не смог нарисовать — монеты возвращаются.</p>
      </div>

      <h3 class="section-title coins-title">Тарифы</h3>
      <div class="plans">
        ${plans.map(p => `
          <div class="plan${p.id === w.plan ? ' plan--current' : ''}${p.id === best ? ' plan--best' : ''}">
            ${p.id === best ? '<span class="plan__badge">Выгодно</span>' : ''}
            <div class="plan__head"><b>${esc(p.name)}</b>
              <span class="plan__price">${p.price ? `${rub(p.price)}<small>/мес</small>` : 'Бесплатно'}</span></div>
            <div class="plan__coins">${coin('silver')}${p.coins} ${coinsWord(p.coins)} в месяц</div>
            <div class="plan__note">${p.price ? `${(p.price / p.coins).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ₽ за генерацию` : 'Чтобы попробовать'}</div>
            ${p.id === w.plan ? '<span class="plan__mine">Ваш тариф</span>'
              : p.price ? `<button class="btn btn-${p.id === best ? 'primary' : 'secondary'} plan__btn" data-buy="plan" data-id="${p.id}">Подключить</button>` : ''}
          </div>`).join('')}
      </div>

      <h3 class="section-title coins-title">Золотые монеты</h3>
      <p class="coins-sub">Если монеты тарифа закончились раньше времени. Не сгорают.</p>
      <div class="packs">
        ${packs.map(p => `
          <button class="pack" data-buy="pack" data-id="${p.coins}">
            ${coin('gold')}<b>+${p.coins}</b>
            <span class="pack__price">${rub(p.price)}</span>
            <small>${(p.price / p.coins).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} ₽ за монету</small>
          </button>`).join('')}
      </div>`;
  },

  async onClick(e) {
    const buy = e.target.closest('[data-buy]');
    if (buy) {
      showToast('Оплата появится скоро. Пока напишите нам — подключим вручную');
      return;
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    document.getElementById('coins-content').addEventListener('click', e => this.onClick(e));
    document.getElementById('coins-back').addEventListener('click', () => history.length > 1 ? history.back() : Router.navigateTo('profile'));
  },
};

function formatShortDate(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T'));
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function onScreenCoins() {
  CoinsScreen.bind();
  CoinsScreen.render();
}
