// === Коммерческое предложение (КП) ===
// Прораб заполняет заказчика и размеры дома — количество считается само, цены материала и работы
// по каждой позиции можно поправить. PDF собирается прямо на телефоне в формате экрана:
// фото с водяным знаком, смета по позициям, итог в конце, кнопки «Позвонить» / «Написать», реклама Fasad AI.

// Позиции сметы. part — узор подбора (строка есть, только если он выбран); цены — примерные, прораб ставит свои
const KP_ITEMS = [
  { id: 'wall', group: 'Стены и цоколь', name: 'Плитка стен', unit: 'м²', m: 2200, w: 1600 },
  { id: 'base', group: 'Стены и цоколь', name: 'Плитка цоколя', unit: 'м²', m: 2600, w: 1800 },
  { id: 'corners', group: 'Стены и цоколь', name: 'Русты на углах', unit: 'п.м', m: 1800, w: 900, part: 'corners' },
  { id: 'topCornice', group: 'Карнизы', name: 'Венчающий карниз', unit: 'п.м', m: 2800, w: 900, part: 'topCornice' },
  { id: 'floorCornice', group: 'Карнизы', name: 'Межэтажный пояс', unit: 'п.м', m: 2400, w: 900, part: 'floorCornice' },
  { id: 'baseCornice', group: 'Карнизы', name: 'Плинтус над цоколем', unit: 'п.м', m: 1600, w: 700, part: 'baseCornice' },
  { id: 'dentils', group: 'Карнизы', name: 'Зубцы под карнизом', unit: 'п.м', m: 1200, w: 700, part: 'dentils' },
  { id: 'frame', group: 'Окна и двери', name: 'Наличники', unit: 'п.м', m: 950, w: 600, part: 'frame' },
  { id: 'sill', group: 'Окна и двери', name: 'Подоконники', unit: 'п.м', m: 1400, w: 500, part: 'sill' },
  { id: 'keystone', group: 'Окна и двери', name: 'Замки над окнами', unit: 'шт', m: 1500, w: 500, part: 'keystone' },
  { id: 'console', group: 'Окна и двери', name: 'Консоли под подоконники', unit: 'шт', m: 1200, w: 400, part: 'console' },
  { id: 'reveals', group: 'Окна и двери', name: 'Откосы окон и двери', unit: 'п.м', m: 650, w: 450 },
  { id: 'column', group: 'Колонны и балюстрада', name: 'Колонны или пилястры', unit: 'шт', m: 25000, w: 8000, part: 'column' },
  { id: 'capital', group: 'Колонны и балюстрада', name: 'Капители и базы', unit: 'шт', m: 9000, w: 2000, part: 'capital' },
  { id: 'balustrade', group: 'Колонны и балюстрада', name: 'Балюстрада', unit: 'п.м', m: 9500, w: 3000, parts: ['baluster', 'post', 'rail', 'finial'] },
];

// Дополнительные работы. lm / lw — как назвать строку, если это не материал или работа
const KP_EXTRAS = [
  { id: 'mesh', name: 'Армирующая сетка', sub: 'под плитку, с крепежом', unit: 'м²', m: 180, w: 90 },
  { id: 'scaffold', name: 'Леса', sub: 'монтаж, аренда на срок работ, демонтаж', unit: 'м²', m: 0, w: 220 },
  { id: 'glue', name: 'Клей, грунт, затирка', sub: 'расход на всю площадь', unit: 'м²', m: 350, w: 0 },
  { id: 'delivery', name: 'Доставка камня', sub: 'с карьера на объект', unit: 'рейс', m: 12500, w: 0, lm: 'Услуга' },
  { id: 'unload', name: 'Разгрузка и подъём', sub: 'на этажи', unit: 'объект', m: 0, w: 8000 },
  { id: 'food', name: 'Питание бригады', sub: 'на весь срок работ', unit: 'дн', m: 0, w: 1200, lw: 'Расход' },
  { id: 'trash', name: 'Вывоз мусора', sub: 'обрезки камня, упаковка', unit: 'объект', m: 0, w: 6000, lw: 'Услуга' },
];

// «Если понадобится» — цены за единицу, в итог не входят
const KP_OPTIONS = [
  { id: 'erker', name: 'Эркер — облицовка', sub: 'сложная геометрия, подрезка · за м²', price: '+40% к цене стен' },
  { id: 'arch', name: 'Арка над входом', sub: 'камень и монтаж · за шт', price: 'от 45 000 ₽' },
  { id: 'porch', name: 'Колонна у входа', sub: 'с базой и капителью · за шт', price: 'от 38 000 ₽' },
  { id: 'belt', name: 'Межэтажный пояс', sub: 'карниз между этажами · за п.м', price: '3 300 ₽' },
  { id: 'balcony', name: 'Балюстрада балкона', sub: 'балясины, перила, тумбы · за п.м', price: 'от 9 500 ₽' },
];

const KP_TERMS = { payment: '50% на камень и леса, остаток — по этапам', guarantee: '5 лет на монтаж, камень — на весь срок службы', valid: 14 };

const kpRub = (n) => `${Math.round(n || 0).toLocaleString('ru-RU')} ₽`;
const kpNum = (n) => (Math.round((+n || 0) * 10) / 10).toLocaleString('ru-RU');
const kpUnit = (u, n) => (u === 'рейс' ? plural(Math.round(n), 'рейс', 'рейса', 'рейсов') : u);

// Площади и длины по размерам дома
function kpMeasures(d, baseOn) {
  const P = +d.perimeter || 0, H = +d.height || 0, N = +d.windows || 0, D = +d.doors || 0, F = Math.max(1, +d.floors || 1);
  const hb = baseOn ? (+d.plinth || 0) : 0;
  const plinth = Math.ceil(P * hb);
  const walls = Math.max(0, Math.ceil(P * H - N * 1.2 * 1.5 - D * 0.9 * 2.1 - P * hb));
  return { P, H, N, D, F, walls, plinth, area: walls + plinth };
}

// Количество по позиции — из размеров дома
function kpAutoQty(id, ms, days) {
  const { P, H, N, D, F, walls, plinth, area } = ms;
  return Math.ceil({
    wall: walls, base: plinth, corners: 4 * H,
    topCornice: P, floorCornice: P * (F - 1), baseCornice: P, dentils: P,
    frame: N * 5.4 + D * 5.1, sill: N * 1.4, keystone: N, console: N * 2, reveals: N * 4.2 + D * 5.1,
    column: 2, capital: 2, balustrade: 6,
    mesh: area, scaffold: F > 1 ? walls : 0, glue: area, delivery: Math.max(1, Math.ceil(area / 120)),
    unload: 1, food: days, trash: 1,
  }[id] || 0);
}

const KP = {
  // Всё про КП одного проекта: модель хранится у проекта, контакты и цены — у прораба
  async open(projectId, variantId) {
    this.projectId = projectId;
    this.variantId = variantId;
    Router.navigateTo('kp');
  },

  async load() {
    const box = document.getElementById('kp-content');
    box.innerHTML = '<p class="configure-hint">Загрузка…</p>';
    const [pr, mine, saved, stones, catalog] = await Promise.all([
      Api.getProject(this.projectId), Api.kpProfile(), Api.projectKp(this.projectId),
      Materials.getStones(), Materials.getCatalog(),
    ]);
    this.project = pr.data;
    this.stones = stones;
    this.catalog = catalog;
    this.mine = mine.data || {};
    const vs = this.project.variants || [];
    const v = vs.find(x => x.id === this.variantId) || vs.find(x => x.generated_image) || vs[vs.length - 1];
    this.variant = v;
    this.spec = upgradeDesign(v?.design, stones);
    const b = this.spec.building || {};
    const floors = +b.floors || 2;
    const user = Auth.getUser() || {};
    this.model = Object.assign({
      client: { name: '', object: `частный дом, ${floors} ${floors === 1 ? 'этаж' : floors < 5 ? 'этажа' : 'этажей'}` },
      dims: { floors, height: +b.heightM || +(floors * 3.2).toFixed(1), perimeter: 36, windows: floors * 4, doors: 1, plinth: 0.6 },
      rows: {}, custom: [], options: {}, discount: 0, days: 35,
      terms: { ...KP_TERMS, ...(this.mine.terms || {}) },
      profile: { name: this.mine.profile?.name || user.name || '', company: '', phone: '', telegram: '', city: '', exp: '', ...(this.mine.profile || {}) },
    }, saved.data || {});
    this.model.profile = { ...this.model.profile, ...(this.mine.profile || {}) };
    this.render();
  },

  // Строки сметы: определение + выбранный узор + правки прораба
  rows() {
    const spec = this.spec, m = spec.materials;
    const ms = kpMeasures(this.model.dims, m.base.on);
    const prices = this.mine.prices || {};
    const stoneName = id => this.stones.find(s => s.id === id)?.name || '';
    const out = [];
    for (const def of KP_ITEMS) {
      let sub = '', img = null, imgKind = 'stone';
      if (def.id === 'wall') {
        const s = this.stones.find(x => x.id === m.main.stone);
        sub = `${s?.name || ''} · ${m.main.format.replace('x', '×')}×${m.main.thickness} · ${SURFACE_NAMES[m.main.surface] || ''}`;
        img = s?.texture;
      } else if (def.id === 'base') {
        if (!m.base.on) continue;
        const s = this.stones.find(x => x.id === m.base.stone);
        sub = `${s?.name || ''} · ${m.base.format.replace('x', '×')}×${m.base.thickness} · ${SURFACE_NAMES[m.base.surface] || ''}`;
        img = s?.texture;
      } else if (def.id === 'reveals') {
        sub = `${stoneName(m.main.stone)} · пиленый`;
        img = this.stones.find(x => x.id === m.main.stone)?.texture;
      } else {
        const keys = def.parts || [def.part];
        const key = keys.find(k => spec.parts[k]?.item);
        if (!key) continue;
        const v = this.catalog.variants[spec.parts[key].item];
        sub = `${v?.name || ''}${v?.size ? ` · ${v.size}` : ''} · ${stoneName(resolveStone(spec, spec.parts[key].stone))}`;
        img = v?.image;
        imgKind = 'product';
      }
      out.push(this.row(def, sub, img, imgKind, ms, prices));
    }
    return { items: out, ms };
  },

  row(def, sub, img, imgKind, ms, prices) {
    const o = this.model.rows[def.id] || {};
    const p = prices[def.id] || {};
    const auto = kpAutoQty(def.id, ms, +this.model.days || 0);
    return {
      ...def, sub: def.sub || sub, img, imgKind,
      qty: o.manual ? +o.qty || 0 : auto, auto, manual: !!o.manual,
      m: +(o.m ?? p.m ?? def.m) || 0, w: +(o.w ?? p.w ?? def.w) || 0,
      on: o.on ?? !(def.id === 'scaffold' && ms.F < 2),
    };
  },

  extras(ms) {
    const prices = this.mine.prices || {};
    return KP_EXTRAS.map(def => this.row(def, def.sub, null, null, ms, prices));
  },

  customs() {
    return this.model.custom.map(c => ({ ...c, unit: c.unit || 'шт', qty: +c.qty || 0, m: +c.m || 0, w: +c.w || 0, on: c.on !== false, custom: true, group: 'Другое' }));
  },

  totals() {
    const { items, ms } = this.rows();
    const extras = this.extras(ms);
    const all = [...items, ...this.customs(), ...extras].filter(r => r.on);
    let mat = 0, work = 0;
    all.forEach(r => { mat += r.qty * r.m; work += r.qty * r.w; });
    const sum = mat + work;
    const disc = Math.round(sum * (+this.model.discount || 0) / 100);
    return { items, extras, ms, mat, work, sum, disc, total: sum - disc };
  },

  // === Экран редактора ===
  render() {
    const md = this.model, pf = md.profile, t = this.totals();
    const field = (path, label, type = 'text', extra = '') => `
      <label class="kp-field"><span>${label}</span><input class="input" type="${type}" data-k="${path}" value="${esc(path.split('.').reduce((o, k) => o?.[k], md) ?? '')}" ${extra}></label>`;
    document.getElementById('kp-content').innerHTML = `
      <div class="kp-intro">
        <img src="${this.variant?.generated_image || this.project.original_image}" alt="">
        <div><b>${esc(this.project.name)}</b><small>Вариант ${(this.project.variants || []).indexOf(this.variant) + 1} · заполните — смета посчитается сама</small></div>
      </div>

      <section class="kp-card"><h3>Заказчик</h3>
        <div class="kp-grid">${field('client.name', 'Имя заказчика', 'text', 'placeholder="Например, Ахмед Гаджиев"')}${field('client.object', 'Объект')}</div>
      </section>

      <section class="kp-card"><h3>Размеры дома</h3>
        <div class="kp-grid kp-grid--3">
          ${field('dims.floors', 'Этажей', 'number', 'inputmode="numeric" min="1"')}
          ${field('dims.height', 'Высота стен, м', 'number', 'inputmode="decimal" step="0.1"')}
          ${field('dims.perimeter', 'Периметр, м', 'number', 'inputmode="decimal"')}
          ${field('dims.windows', 'Окон', 'number', 'inputmode="numeric"')}
          ${field('dims.doors', 'Дверей', 'number', 'inputmode="numeric"')}
          ${field('dims.plinth', 'Цоколь, м', 'number', 'inputmode="decimal" step="0.1"')}
        </div>
        <p class="kp-measure" id="kp-measure"></p>
      </section>

      <section class="kp-card"><h3>Смета <small>материал и работа по каждой позиции</small></h3>
        <div id="kp-items"></div>
        <button class="btn btn-ghost btn-full kp-add" id="kp-add">＋ Своя позиция</button>
      </section>

      <section class="kp-card"><h3>Дополнительно <small>сетка, леса, доставка…</small></h3><div id="kp-extras"></div></section>

      <section class="kp-card"><h3>Если понадобится <small>в итог не входит</small></h3>
        <div class="kp-opts">${KP_OPTIONS.map(o => {
          const s = md.options[o.id] || {};
          return `<label class="kp-opt"><input type="checkbox" data-opt="${o.id}" data-f="on" ${s.on !== false ? 'checked' : ''}>
            <span><b>${o.name}</b><small>${o.sub}</small></span>
            <input class="input" data-opt="${o.id}" data-f="price" value="${esc(s.price ?? o.price)}"></label>`;
        }).join('')}</div>
      </section>

      <section class="kp-card"><h3>Условия</h3>
        <div class="kp-grid kp-grid--3">
          ${field('discount', 'Скидка, %', 'number', 'inputmode="decimal"')}
          ${field('days', 'Срок, раб. дней', 'number', 'inputmode="numeric"')}
          ${field('terms.valid', 'КП действует, дней', 'number', 'inputmode="numeric"')}
        </div>
        <div class="kp-grid">${field('terms.payment', 'Оплата')}${field('terms.guarantee', 'Гарантия')}</div>
      </section>

      <section class="kp-card"><h3>Ваши данные <small>видит заказчик · запомнятся</small></h3>
        <div class="kp-grid">
          ${field('profile.name', 'Имя')}${field('profile.company', 'Бригада или компания', 'text', 'placeholder="Облицовка фасадов камнем"')}
          ${field('profile.phone', 'Телефон', 'tel', 'placeholder="+7 900 000-00-00"')}${field('profile.telegram', 'Telegram', 'text', 'placeholder="@username"')}
          ${field('profile.city', 'Город')}${field('profile.exp', 'Опыт', 'text', 'placeholder="12 лет"')}
        </div>
      </section>
      <p class="configure-hint">Цены, ваши данные и условия запомнятся для следующих КП.</p>`;
    this.renderRows(t);
  },

  rowHtml(r, kind) {
    const lm = r.lm || 'Материал', lw = r.lw || 'Работа';
    return `
      <div class="kp-row${r.on ? '' : ' off'}" data-row="${r.id}" data-kind="${kind}">
        <div class="kp-row__head">
          <label class="kp-check"><input type="checkbox" data-f="on" ${r.on ? 'checked' : ''}><span></span></label>
          <div class="kp-row__name">${r.custom ? `<input class="input kp-row__title" data-f="name" value="${esc(r.name)}" placeholder="Название позиции">` : `<b>${esc(r.name)}</b>`}
            ${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</div>
          <b class="kp-row__sum" data-sum>${kpRub(r.qty * (r.m + r.w))}</b>
        </div>
        <div class="kp-row__inputs">
          <label><span>${esc(r.unit)}${r.manual ? ' <i data-reset title="Пересчитать по размерам">↺</i>' : ''}</span><input class="input" type="number" inputmode="decimal" data-f="qty" value="${r.qty}"></label>
          <label><span>${lm}, ₽</span><input class="input" type="number" inputmode="numeric" data-f="m" value="${r.m}"></label>
          <label><span>${lw}, ₽</span><input class="input" type="number" inputmode="numeric" data-f="w" value="${r.w}"></label>
        </div>
        ${r.custom ? '<button class="kp-row__del" data-del>Убрать позицию</button>' : ''}
      </div>`;
  },

  renderRows(t = this.totals()) {
    document.getElementById('kp-items').innerHTML = [...t.items, ...this.customs()].map(r => this.rowHtml(r, r.custom ? 'custom' : 'item')).join('');
    document.getElementById('kp-extras').innerHTML = t.extras.map(r => this.rowHtml(r, 'extra')).join('');
    this.renderTotals(t);
  },

  renderTotals(t = this.totals()) {
    document.getElementById('kp-measure').textContent = `Стены ${t.ms.walls} м²${this.spec.materials.base.on ? ` · цоколь ${t.ms.plinth} м²` : ''} · периметр ${kpNum(t.ms.P)} м`;
    document.getElementById('kp-total').innerHTML = `<small>Под ключ${t.disc ? ` · скидка ${kpRub(t.disc)}` : ''}</small><b>${kpRub(t.total)}</b>`;
  },

  setPath(path, value) {
    const keys = path.split('.');
    let o = this.model;
    keys.slice(0, -1).forEach(k => { o = o[k] = o[k] || {}; });
    o[keys[keys.length - 1]] = value;
  },

  onInput(e) {
    const el = e.target;
    const num = el.type === 'number';
    const val = el.type === 'checkbox' ? el.checked : num ? (el.value === '' ? '' : +el.value) : el.value;
    if (el.dataset.k) {
      this.setPath(el.dataset.k, val);
      // Размеры и срок меняют количества — перерисуем строки, поля размеров не трогаем
      if (/^(dims\.|days)/.test(el.dataset.k)) this.renderRows();
      else this.renderTotals();
    } else if (el.dataset.opt) {
      const o = this.model.options[el.dataset.opt] = this.model.options[el.dataset.opt] || {};
      o[el.dataset.f] = val;
    } else {
      const rowEl = el.closest('[data-row]');
      if (!rowEl) return;
      const id = rowEl.dataset.row, f = el.dataset.f;
      if (rowEl.dataset.kind === 'custom') {
        const c = this.model.custom.find(x => x.id === id);
        c[f] = val;
      } else {
        const o = this.model.rows[id] = this.model.rows[id] || {};
        o[f] = val;
        if (f === 'qty') o.manual = true;
      }
      if (f === 'on') rowEl.classList.toggle('off', !val);
      const r = this.findRow(id);
      if (r) rowEl.querySelector('[data-sum]').textContent = kpRub(r.qty * (r.m + r.w));
      this.renderTotals();
    }
    this.saveSoon();
  },

  findRow(id) {
    const t = this.totals();
    return [...t.items, ...t.extras, ...this.customs()].find(r => r.id === id);
  },

  onClick(e) {
    const rowEl = e.target.closest('[data-row]');
    if (e.target.closest('[data-reset]') && rowEl) {
      e.preventDefault();
      delete this.model.rows[rowEl.dataset.row].manual;
      this.renderRows();
      this.saveSoon();
    }
    if (e.target.closest('[data-del]') && rowEl) {
      this.model.custom = this.model.custom.filter(c => c.id !== rowEl.dataset.row);
      this.renderRows();
      this.saveSoon();
    }
    if (e.target.closest('#kp-add')) {
      this.model.custom.push({ id: `c${Date.now()}`, name: '', unit: 'шт', qty: 1, m: 0, w: 0, on: true });
      this.renderRows();
      document.querySelector('#kp-items [data-kind="custom"]:last-child .kp-row__title')?.focus();
    }
  },

  // Черновик КП у проекта — сохраняется сам
  saveSoon() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => Api.projectKp(this.projectId, this.model).catch(() => {}), 800);
  },

  // Свои цены, контакты и условия прораба — для следующих КП
  async rememberMine() {
    const prices = { ...(this.mine.prices || {}) };
    for (const [id, o] of Object.entries(this.model.rows)) {
      if (o.m != null || o.w != null) prices[id] = { m: o.m ?? prices[id]?.m, w: o.w ?? prices[id]?.w };
    }
    this.mine = { ...this.mine, prices, profile: this.model.profile, terms: this.model.terms };
    await Api.kpProfile({ prices, profile: this.model.profile, terms: this.model.terms });
  },

  // === PDF ===
  async makePdf() {
    const btn = document.getElementById('kp-make');
    if (!this.model.profile.phone) {
      showToast('Укажите свой телефон — заказчик позвонит по нему');
      document.querySelector('[data-k="profile.phone"]')?.focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Собираю PDF…';
    try {
      clearTimeout(this.saveTimer);
      const saved = await Api.projectKp(this.projectId, this.model, true);
      this.model.number = saved.data.number;
      await this.rememberMine();
      const file = await kpBuildPdf(this);
      this.showReady(file);
    } catch (e) {
      console.error(e);
      showToast(e.message || 'Не удалось собрать PDF');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Создать PDF';
    }
  },

  // Отправить — отдельным нажатием: телефон разрешает «Поделиться» только сразу после нажатия
  showReady(file) {
    const url = URL.createObjectURL(file);
    showModal(`
      <div class="kp-ready">
        <div class="kp-ready__icon">PDF</div>
        <h3>КП готово</h3>
        <p>${esc(file.name)} · ${(file.size / 1024 / 1024).toFixed(1)} МБ</p>
        <button class="btn btn-primary btn-full" id="kp-share">${icon('share')}Отправить заказчику</button>
        <a class="btn btn-secondary btn-full" href="${url}" download="${esc(file.name)}" target="_blank">Открыть / скачать</a>
      </div>`);
    document.getElementById('kp-share').addEventListener('click', async () => {
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: file.name });
        else window.open(url, '_blank');
      } catch (e) { /* отменили — ничего */ }
    });
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const box = document.getElementById('kp-content');
    box.addEventListener('input', e => this.onInput(e));
    box.addEventListener('change', e => { if (e.target.type === 'checkbox') this.onInput(e); });
    box.addEventListener('click', e => this.onClick(e));
    document.getElementById('kp-back').addEventListener('click', () => openProject(this.projectId, this.variant?.id));
    document.getElementById('kp-make').addEventListener('click', () => this.makePdf());
  },
};

function onScreenKp() {
  if (!KP.projectId) return Router.navigateTo('projects');
  KP.bind();
  KP.load().catch(e => {
    document.getElementById('kp-content').innerHTML = `<p class="configure-hint">${esc(e.message || 'Не удалось загрузить')}</p>`;
  });
}

// === Сборка PDF: листы в формате экрана телефона ===

function kpLoadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Не загрузилась библиотека PDF — проверьте интернет'));
    document.head.appendChild(s);
  });
}

function kpLoadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не загрузилось фото'));
    img.src = src;
  });
}

// Картинка ровно под рамку: cover — обрезать, contain — вписать на белом (html2canvas не умеет object-fit)
async function kpFit(src, w, h, mode = 'cover') {
  if (!src) return null;
  try {
    const img = await kpLoadImage(src);
    const c = document.createElement('canvas');
    c.width = w * 2; c.height = h * 2;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, c.width, c.height);
    const s = mode === 'cover' ? Math.max(c.width / img.width, c.height / img.height) : Math.min(c.width / img.width, c.height / img.height) * 0.92;
    const dw = img.width * s, dh = img.height * s;
    g.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    return c.toDataURL('image/jpeg', 0.86);
  } catch (e) {
    return null;
  }
}

// Фото 4:3 с водяным знаком «Fasad AI · имя · телефон» по диагонали и плашкой «Сделано в Fasad AI»
async function kpWatermark(src, text, icon) {
  const img = await kpLoadImage(src);
  const W = 1200, H = 900;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const s = Math.max(W / img.width, H / img.height);
  g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(-28 * Math.PI / 180);
  g.font = `700 ${Math.round(W * 0.024)}px -apple-system, system-ui, sans-serif`;
  g.fillStyle = 'rgba(255,255,255,0.26)';
  const tw = g.measureText(text).width + 120;
  for (let y = -H * 1.2, k = 0; y < H * 1.2; y += W * 0.12, k++) {
    for (let x = -W * 1.4 - (k % 2) * tw / 2; x < W * 1.4; x += tw) g.fillText(text, x, y);
  }
  g.restore();
  // Плашка в углу
  const bh = 64, label = 'Сделано в Fasad AI';
  g.font = `700 26px -apple-system, system-ui, sans-serif`;
  const bw = 64 + 24 + g.measureText(label).width + 26;
  const bx = W - bw - 22, by = H - bh - 22;
  g.fillStyle = 'rgba(30,26,22,0.72)';
  g.beginPath();
  g.roundRect ? g.roundRect(bx, by, bw, bh, bh / 2) : g.rect(bx, by, bw, bh);
  g.fill();
  if (icon) g.drawImage(icon, bx + 10, by + 8, 48, 48);
  g.fillStyle = '#ffffff';
  g.fillText(label, bx + 70, by + 42);
  return c.toDataURL('image/jpeg', 0.86);
}

async function kpBuildPdf(kp) {
  if (!window.jspdf) await kpLoadScript('js/vendor/jspdf.umd.min.js');
  if (!window.html2canvas) await kpLoadScript('js/vendor/html2canvas.min.js');
  const md = kp.model, pf = md.profile, t = kp.totals();
  const icon = await kpLoadImage('icon-192.png');
  const wm = `Fasad AI  ·  ${pf.name}  ·  ${pf.phone}`;
  const after = kp.variant?.generated_image ? await kpWatermark(kp.variant.generated_image, wm, icon) : null;
  const before = await kpWatermark(kp.project.original_image, wm, icon);
  const iconUrl = 'icon-192.png';
  const rows = [...t.items, ...kp.customs()].filter(r => r.on);
  const extras = t.extras.filter(r => r.on);
  const thumbs = {};
  await Promise.all(rows.map(async r => { thumbs[r.id] = await kpFit(r.img, 48, 38, r.imgKind === 'product' ? 'contain' : 'cover'); }));
  const pages = kpPages(kp, { after: after || before, before, thumbs, rows, extras, t, iconUrl });

  const host = document.createElement('div');
  host.className = 'kpdoc';
  host.innerHTML = pages.join('');
  document.body.appendChild(host);
  try {
    await Promise.all([...host.querySelectorAll('img')].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'pt', format: [390, 844], compress: true });
    const els = [...host.querySelectorAll('.kpp')];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: null, logging: false, useCORS: true });
      if (i) pdf.addPage([390, 844]);
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.84), 'JPEG', 0, 0, 390, 844);
      // Кнопки «Позвонить» / «Написать» и QR-ссылка нажимаются прямо в PDF
      const box = el.getBoundingClientRect();
      el.querySelectorAll('[data-link]').forEach(a => {
        const r = a.getBoundingClientRect();
        pdf.link(r.left - box.left, r.top - box.top, r.width, r.height, { url: a.dataset.link });
      });
    }
    const name = `КП ${md.client.name || kp.project.name || 'фасад'}.pdf`.replace(/[\\/:*?"<>|]/g, '');
    return new File([pdf.output('blob')], name, { type: 'application/pdf' });
  } finally {
    host.remove();
  }
}

// Кружок с цифрой или инициалами — SVG: html2canvas сдвигает обычный текст в кружках
function kpBadge(text, size, font, fill) {
  const id = `g${Math.random().toString(36).slice(2, 8)}`;
  const bg = fill === 'gradient'
    ? `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9a86a"/><stop offset="1" stop-color="#a8843f"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="url(#${id})"/>`
    : `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${fill}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;display:block">${bg}
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${font}" font-weight="800" font-family="-apple-system, system-ui, sans-serif">${esc(text)}</text></svg>`;
}

// Листы КП (разметка повторяет утверждённый образец)
function kpPages(kp, { after, before, thumbs, rows, extras, t, iconUrl }) {
  const md = kp.model, pf = md.profile;
  const date = new Date();
  const dstr = date.toLocaleDateString('ru-RU');
  const valid = new Date(date.getTime() + (+md.terms.valid || 14) * 864e5).toLocaleDateString('ru-RU');
  const num = `КП-${date.getFullYear()}-${String(kp.projectId).padStart(3, '0')}${md.number > 1 ? `-${md.number}` : ''}`;
  const pages = [];
  const page = (body, cls = '') => `<section class="kpp ${cls}"><div class="kpp__bar"><img src="${iconUrl}" alt=""><b>Fasad AI</b><span>{N} / {T}</span></div>${body}</section>`;
  const initialsPf = initials(pf.name);

  pages.push(page(`
    <div class="kpp__eyebrow">Коммерческое предложение</div>
    <h1>Облицовка фасада натуральным камнем</h1>
    <p class="kpp__meta">${md.client.name ? `Заказчик: <b>${esc(md.client.name)}</b><br>` : ''}${esc(md.client.object || '')} · ${num} от ${dstr}</p>
    <div class="kpp__photo"><img src="${after}" alt=""><span class="kpp__chip">Так будет выглядеть ваш дом</span></div>
    <div class="kpp__card kpp__toc">${['Было и будет', 'Материалы', 'Смета по каждой позиции', 'Итог, сроки и оплата'].map((s, i) => `<div>${kpBadge(i + 1, 22, 12, '#c9a86a')}${s}</div>`).join('')}</div>
    <div class="kpp__card kpp__pro">${kpBadge(initialsPf, 46, 17, 'gradient')}<div><b>${esc(pf.name)}</b><span>${esc([pf.company, pf.city, pf.exp].filter(Boolean).join(' · '))}</span></div></div>`));

  pages.push(page(`
    <h2>Было и будет</h2>
    <div class="kpp__stack">
      <div class="kpp__photo"><img src="${before}" alt=""><span class="kpp__chip">Сейчас</span></div>
      <div class="kpp__photo"><img src="${after}" alt=""><span class="kpp__chip">После облицовки</span></div>
    </div>`));

  const mats = rows.filter(r => r.img && !r.custom).slice(0, 6);
  if (mats.length) {
    pages.push(page(`
      <h2>Материалы</h2>
      <div class="kpp__stack">${mats.map(r => `
        <div class="kpp__card kpp__mat">${thumbs[r.id] ? `<img src="${thumbs[r.id]}" alt="">` : ''}<div><small>${esc(r.group)}</small><b>${esc(r.name)}</b><span>${esc(r.sub || '')}</span></div></div>`).join('')}</div>
      <p class="kpp__lead">Натуральный камень дагестанских карьеров: не выгорает, не боится мороза, служит десятилетиями.</p>`));
  }

  const posCard = (r) => `
    <div class="kpp__pos">
      <div class="kpp__pos-head">${thumbs[r.id] ? `<img src="${thumbs[r.id]}" alt="">` : ''}<div><b>${esc(r.name || 'Позиция')}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</div><em>${kpNum(r.qty)} ${esc(kpUnit(r.unit, r.qty))}</em></div>
      ${r.m ? `<div class="kpp__line"><span>${r.lm || 'Материал'}</span><span>${kpNum(r.qty)} × ${kpRub(r.m)}</span><b>${kpRub(r.qty * r.m)}</b></div>` : ''}
      ${r.w ? `<div class="kpp__line"><span>${r.lw || 'Работа'}</span><span>${kpNum(r.qty)} × ${kpRub(r.w)}</span><b>${kpRub(r.qty * r.w)}</b></div>` : ''}
      <div class="kpp__pos-sum"><span>Итого по позиции</span><b>${kpRub(r.qty * (r.m + r.w))}</b></div>
    </div>`;
  for (let i = 0; i < rows.length; i += 3) {
    pages.push(page(`<h2>Смета<small>${i ? 'продолжение' : 'материал и работа по каждой позиции'}</small></h2>
      <div class="kpp__stack">${rows.slice(i, i + 3).map(posCard).join('')}</div>`));
  }

  const extraCard = (r) => `
    <div class="kpp__pos kpp__pos--mini">
      <div class="kpp__pos-head"><div><b>${esc(r.name)}</b><small>${esc(r.sub || '')}</small></div><em>${kpRub(r.qty * (r.m + r.w))}</em></div>
      ${r.m ? `<div class="kpp__line"><span>${r.lm || 'Материал'}</span><span>${kpNum(r.qty)} ${esc(kpUnit(r.unit, r.qty))} × ${kpRub(r.m)}</span><b>${kpRub(r.qty * r.m)}</b></div>` : ''}
      ${r.w ? `<div class="kpp__line"><span>${r.lw || 'Работа'}</span><span>${kpNum(r.qty)} ${esc(kpUnit(r.unit, r.qty))} × ${kpRub(r.w)}</span><b>${kpRub(r.qty * r.w)}</b></div>` : ''}
    </div>`;
  const extraSum = extras.reduce((s, r) => s + r.qty * (r.m + r.w), 0);
  for (let i = 0; i < extras.length; i += 5) {
    const last = i + 5 >= extras.length;
    pages.push(page(`<h2>Дополнительно<small>${i ? 'продолжение' : 'без этого не обойтись'}</small></h2>
      <div class="kpp__stack kpp__stack--tight">${extras.slice(i, i + 5).map(extraCard).join('')}</div>
      ${last ? `<div class="kpp__subtotal"><span>Дополнительные работы</span><span>${kpRub(extraSum)}</span></div>` : ''}`));
  }

  const opts = KP_OPTIONS.filter(o => (md.options[o.id] || {}).on !== false);
  if (opts.length) {
    pages.push(page(`<h2>Если понадобится<small>в итог не входит</small></h2>
      <div class="kpp__card kpp__rows">${opts.map(o => `<div class="kpp__row"><div><b>${o.name}</b><small>${o.sub}</small></div><span class="kpp__sum">${esc((md.options[o.id] || {}).price ?? o.price)}</span></div>`).join('')}</div>
      <p class="kpp__lead">Эркеры, арки и колонны считаются отдельно — они требуют подрезки камня по месту. Точную цену назову после замера.</p>`));
  }

  // Итог по разделам
  const groups = {};
  rows.forEach(r => { groups[r.group] = (groups[r.group] || 0) + r.qty * (r.m + r.w); });
  if (extraSum) groups['Дополнительные работы'] = extraSum;
  const days = +md.days || 0;
  pages.push(page(`<h2>Итог</h2>
    <div class="kpp__card kpp__rows">${Object.entries(groups).map(([g, v]) => `<div class="kpp__row"><span>${esc(g)}</span><b>${kpRub(v)}</b></div>`).join('')}</div>
    <div class="kpp__split"><div><small>Материалы и доставка</small><b>${kpRub(t.mat)}</b></div><div><small>Работы и услуги</small><b>${kpRub(t.work)}</b></div></div>
    <div class="kpp__card kpp__rows" style="margin-top:10px">
      <div class="kpp__row"><span>Всего</span><b>${kpRub(t.sum)}</b></div>
      ${t.disc ? `<div class="kpp__row kpp__disc"><span>Скидка ${kpNum(md.discount)}%</span><b>−${kpRub(t.disc)}</b></div>` : ''}
    </div>
    <div class="kpp__total"><small>Под ключ</small><b>${kpRub(t.total)}</b><div>${t.ms.area} м² фасада · ${days} рабочих дней</div></div>`));

  // Сроки по неделям и оплата по этапам
  const weeks = Math.max(2, Math.ceil(days / 5));
  const wall = 1 + Math.max(1, Math.ceil((weeks - 1) * 0.6));
  const tl = [['Неделя 1', 'поставка камня, леса, сетка'], [`Недели 2–${wall}`, 'стены, цоколь, углы'],
    [wall + 1 < weeks ? `Недели ${wall + 1}–${weeks}` : `Неделя ${weeks}`, 'окна, карнизы, откосы'], ['Сдача', 'уборка, вывоз мусора, приёмка']];
  const stages = [['Аванс на камень и леса', 0.5], ['После облицовки стен и цоколя', 0.3], ['После сдачи фасада', 0.2]];
  const tg = pf.telegram ? pf.telegram.replace(/^@|https?:\/\/t\.me\//g, '') : '';
  pages.push(page(`<h2>Сроки и оплата</h2>
    <div class="kpp__card kpp__timeline">${tl.map(([a, b]) => `<div><i></i><b>${a}</b><span>${b}</span></div>`).join('')}</div>
    <div class="kpp__card kpp__rows" style="margin-top:10px">${stages.map(([s, p]) => `<div class="kpp__row"><b>${Math.round(p * 100)}% · ${s}</b><span class="kpp__sum">${kpRub(t.total * p)}</span></div>`).join('')}</div>
    <div class="kpp__card kpp__rows" style="margin-top:10px">
      <div class="kpp__row"><div><b>Оплата</b><small>${esc(md.terms.payment || '')}</small></div></div>
      <div class="kpp__row"><div><b>Гарантия</b><small>${esc(md.terms.guarantee || '')}</small></div></div>
      <div class="kpp__row"><div><b>Предложение действует</b><small>${+md.terms.valid || 14} дней, до ${valid}</small></div></div>
    </div>
    <div class="kpp__btns">
      <span class="kpp__btn kpp__btn--gold" data-link="tel:${esc(pf.phone.replace(/[^\d+]/g, ''))}">Позвонить: ${esc(pf.phone)}</span>
      ${tg ? `<span class="kpp__btn" data-link="https://t.me/${esc(tg)}">Написать в Telegram</span>` : ''}
    </div>`));

  pages.push(page(`
    <img class="kpp__promo-icon" src="${iconUrl}" alt="">
    <h1>Этот проект сделан<br>в <em>Fasad AI</em></h1>
    <p class="kpp__lead">Фото дома → выбор камня → готовая картинка за 30 секунд</p>
    <div class="kpp__perks">
      <div><b>Прорабам:</b> покажите заказчику его дом в камне ещё до начала работ</div>
      <div>Каталог дагестанского камня, карнизов, наличников, колонн и балюстрад</div>
      <div>ИИ рисует облицовку прямо на вашем фото — несколько вариантов</div>
      <div>Коммерческое предложение со сметой — за пару минут</div>
    </div>
    <div class="kpp__qr" data-link="https://ahmedov.online/fasad/"><img src="assets/kp-qr.png" alt=""><div><b>Попробуйте бесплатно</b><span>Наведите камеру на код или откройте ahmedov.online/fasad</span><em>3 генерации в подарок</em></div></div>
    <p class="kpp__note">Визуализация создана ИИ и может немного отличаться от готового фасада. Фото защищены водяным знаком.</p>`, 'kpp--promo'));

  return pages.map((p, i) => p.replace('{N}', i + 1).replace('{T}', pages.length));
}
