(function () {
  'use strict';
  const D = window.DATA;
  const DEMO = !!window.DEMO;
  // В демо «сегодня» зафиксировано, чтобы сроки сборов выглядели правдоподобно
  const TODAY = DEMO ? new Date('2026-11-09T12:00:00') : new Date();

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    news: '<path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    back: '<path d="m15 6-6 6 6 6"/>', next: '<path d="m9 6 6 6-6 6"/>', check: '<path d="m5 12 5 5L20 7"/>'
  };
  const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
  const rub = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const short = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace('.', ',') + ' млн ₽' : Math.round(n / 1000) + ' тыс. ₽';
  const pct = c => Math.min(100, Math.round(c.raised / c.goal * 100));
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const MONTHS_PREP = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
  const parse = s => new Date(s.replace(' ', 'T') + (s.length <= 10 ? 'T12:00:00' : ':00'));
  const day = s => { const d = parse(s); return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()]; };
  const dayTime = s => { const d = parse(s); return day(s) + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const monthName = key => { const [y, m] = key.split('-'); return MONTHS_NOM[+m - 1] + ' ' + y; };
  const ago = s => {
    const min = Math.round((TODAY - parse(s)) / 60000);
    if (min < 60) return Math.max(1, min) + ' мин назад';
    if (min < 60 * 24) return Math.round(min / 60) + ' ч назад';
    if (min < 60 * 48) return 'вчера';
    return day(s);
  };
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  const deadline = c => {
    if (!/^\d{4}-/.test(c.deadline)) return c.deadline;
    const days = Math.ceil((parse(c.deadline) - TODAY) / 864e5);
    return days > 0 ? days + ' ' + plural(days, 'день', 'дня', 'дней') : 'сегодня';
  };
  const camp = id => D.campaigns.find(c => c.id === id);
  const campName = id => (id && camp(id)) ? camp(id).title : 'Общий фонд';
  const reportIncome = r => r.online + r.boxes + r.cash;
  const reportOut = r => r.out.reduce((a, o) => a + o[2], 0);

  /* ---------- state & routing ---------- */
  const S = { month: D.reports[0].month, d: null };
  const TABS = [['#/', 'Главная', 'home'], ['#/otchety', 'Отчёты', 'doc'], ['#/obyavleniya', 'Объявления', 'news'], ['#/o-fonde', 'О фонде', 'info']];
  const view = $('view');

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    let html, tab = '#/', title = D.fund.name;
    if (page === 'sbor' && camp(arg)) { html = detail(camp(arg)); title = camp(arg).title; }
    else if (page === 'zavershennye') { html = completed(); title = 'Завершённые сборы'; }
    else if (page === 'otchety') { html = reports(); tab = '#/otchety'; title = 'Отчёты'; }
    else if (page === 'obyavleniya') { html = news(); tab = '#/obyavleniya'; title = 'Объявления'; }
    else if (page === 'o-fonde') { html = about(); tab = '#/o-fonde'; title = 'О фонде'; }
    else html = home();
    $('nav').innerHTML = TABS.map(([href, l, i]) => `<a href="${href}" ${tab === href ? 'aria-current="page"' : ''}>${ic(i)}${l}</a>`).join('');
    view.innerHTML = html;
    document.title = title === D.fund.name ? title : title + ' · ' + D.fund.name;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------- views ---------- */
  const item = c => `<a class="item" href="#/sbor/${c.id}">
    ${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ''}
    <div class="t"><span>${esc(c.title)}</span><em class="n ${c.status === 'done' ? 'done-mark' : ''}">${c.status === 'done' ? 'собран' : pct(c) + '%'}</em></div>
    <div class="bar"><i style="width:${pct(c)}%"></i></div>
    <div class="s n"><span><b>${rub(c.raised)}</b> из ${rub(c.goal)}</span><span>${deadline(c)}</span></div>
  </a>`;

  const upcoming = () => D.news.filter(n => parse(n.date) >= TODAY).sort((a, b) => parse(a.date) - parse(b.date));

  function home() {
    const r = D.reports.find(x => x.month === D.currentMonth) || D.reports[0];
    const m = +r.month.split('-')[1] - 1;
    const active = D.campaigns.filter(c => c.status === 'active');
    const doneCount = D.campaigns.length - active.length;
    return `<div class="label">Собрано в ${MONTHS_PREP[m]}</div>
    <div class="total n">${rub(reportIncome(r))}</div>
    <div class="sub">онлайн, ящики для садаки и наличные</div>
    <button class="btn" data-donate="">Пожертвовать</button>
    <div class="h2"><b>Сборы</b>${doneCount ? `<a href="#/zavershennye">Завершённые · ${doneCount}</a>` : ''}</div>
    <div>${active.map(item).join('')}</div>
    <div class="h2"><b>Ближайшее</b><a href="#/obyavleniya">Все</a></div>
    <div>${upcoming().slice(0, 3).map(n => `<div class="row"><span>${esc(n.title)}<small>${dayTime(n.date)}${n.place ? ' · ' + esc(n.place) : ''}</small></span></div>`).join('') || '<div class="empty">Пока ничего не запланировано</div>'}</div>
    ${installBlock()}`;
  }

  function completed() {
    const list = D.campaigns.filter(c => c.status === 'done');
    return `<a class="back" href="#/">${ic('back')}Главная</a>
    <h1>Завершённые сборы</h1>
    <div>${list.map(item).join('') || '<div class="empty">Пока нет завершённых сборов</div>'}</div>`;
  }

  function detail(c) {
    const done = c.status === 'done';
    const dons = D.donations.filter(d => d[0] === c.id).slice(0, 5);
    const spentSum = c.spent.reduce((a, s) => a + s[2], 0);
    return `<a class="back" href="${done ? '#/zavershennye' : '#/'}">${ic('back')}Назад</a>
    <h1 style="margin-bottom:12px">${esc(c.title)}</h1>
    <div class="big n">${rub(c.raised)}</div>
    <div class="label n">из ${rub(c.goal)}</div>
    <div class="bar thick"><i style="width:${pct(c)}%"></i></div>
    <div class="facts n">
      <div><b>${pct(c)}%</b>собрано</div>
      <div><b>${c.donors}</b>${plural(c.donors, 'человек', 'человека', 'человек')}</div>
      <div><b>${deadline(c)}</b>${done ? 'статус' : /^\d{4}-/.test(c.deadline) ? 'осталось' : 'срок'}</div>
    </div>
    ${done ? '' : `<button class="btn" data-donate="${c.id}">Пожертвовать</button>`}
    <p class="p">${esc(c.text)}</p>
    <div class="h2"><b>Потрачено</b><span class="n">${rub(spentSum)}</span></div>
    <div>${c.spent.map(s => `<div class="row"><span>${esc(s[0])}<small>${day(s[1])} · чек в отчёте</small></span><b class="minus n">−${rub(s[2])}</b></div>`).join('')}</div>
    ${dons.length ? `<div class="h2"><b>Последние пожертвования</b></div>
    <div>${dons.map(d => `<div class="row"><span>${esc(d[1])}<small>${ago(d[2])}</small></span><b class="plus n">+${rub(d[3])}</b></div>`).join('')}</div>` : ''}`;
  }

  function reports() {
    const list = D.reports, i = list.findIndex(r => r.month === S.month), r = list[i];
    const older = list[i + 1], newer = list[i - 1];
    const inc = reportIncome(r), out = reportOut(r);
    const boxRows = D.boxes.map(b => {
      const last = b.history[0];
      return `<details class="box"><summary><span>${esc(b.place)}<small>${b.goes ? campName(b.goes) : 'Общий фонд'} · вскрыт ${day(last[0])}</small></span><b class="n">${rub(last[1])}</b></summary>
        <div class="hist">${b.history.map(h => `<div><span>${day(h[0])}<small>${esc(h[2])}</small></span><b class="n">${rub(h[1])}</b></div>`).join('')}</div></details>`;
    }).join('');
    return `<h1>Отчёты</h1>
    <div class="month">
      <button data-month="${older ? older.month : ''}" ${older ? '' : 'disabled'} aria-label="Предыдущий месяц">${ic('back')}</button>
      <b>${monthName(r.month)}${r.partial ? ' <span class="muted" style="font-weight:600">· идёт</span>' : ''}</b>
      <button data-month="${newer ? newer.month : ''}" ${newer ? '' : 'disabled'} aria-label="Следующий месяц">${ic('next')}</button>
    </div>
    <div class="kpis n">
      <div>Пришло<b class="plus">${short(inc)}</b></div>
      <div>Потрачено<b class="minus">${short(out)}</b></div>
      <div>Остаток<b>${short(r.balance)}</b></div>
    </div>
    <div class="h2"><b>Откуда</b><span class="n">${rub(inc)}</span></div>
    <div>
      <div class="row"><span>Онлайн</span><b class="n">${rub(r.online)}</b></div>
      <div class="row"><span>Ящики для садаки</span><b class="n">${rub(r.boxes)}</b></div>
      <div class="row"><span>Наличными в фонд</span><b class="n">${rub(r.cash)}</b></div>
    </div>
    <div class="h2"><b>Куда</b><span class="n">${rub(out)}</span></div>
    <div>${r.out.map(o => `<div class="row"><span>${esc(campName(o[0]))}<small>${esc(o[1])}</small></span><b class="minus n">−${rub(o[2])}</b></div>`).join('')}</div>
    <div class="h2"><b>Ящики</b><span>следующее вскрытие: ${esc(D.nextBoxOpening)}</span></div>
    <div>${boxRows}</div>
    <div class="note">Нажмите на ящик, чтобы увидеть все вскрытия. Ящики вскрывает комиссия из 3 человек, сумма публикуется в тот же день.</div>`;
  }

  function news() {
    const list = D.news.slice().sort((a, b) => parse(b.date) - parse(a.date));
    const up = list.filter(n => parse(n.date) >= TODAY).reverse(), past = list.filter(n => parse(n.date) < TODAY);
    const card = (n, isPast) => `<div class="news-item ${isPast ? 'past' : ''}"><div class="k">${esc(n.type)}</div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p>
      <div class="w">${isPast ? day(n.date) : dayTime(n.date)}${n.place ? ' · ' + esc(n.place) : ''}</div></div>`;
    return `<h1>Объявления</h1>
    ${up.length ? `<div class="h2" style="margin-top:0"><b>Скоро</b></div><div>${up.map(n => card(n, false)).join('')}</div>` : ''}
    ${past.length ? `<div class="h2"><b>Прошедшие</b></div><div>${past.map(n => card(n, true)).join('')}</div>` : ''}`;
  }

  function about() {
    return `<h1>О фонде</h1>
    ${D.fund.about.map(p => `<p class="p" style="margin-top:0;margin-bottom:12px;color:var(--ink)">${esc(p)}</p>`).join('')}
    <div class="h2"><b>Контакты</b></div>
    <div>${D.fund.contacts.map(c => `<div class="row"><span>${esc(c[1])}<small>${esc(c[0])}</small></span><b class="n">${esc(c[2])}</b></div>`).join('')}</div>
    <div class="h2"><b>Ящики для садаки</b></div>
    <div>${D.boxes.map(b => `<div class="row"><span>${esc(b.place)}<small>Идёт на: ${esc(campName(b.goes))}</small></span></div>`).join('')}</div>
    <div class="h2"><b>Реквизиты</b></div>
    <p class="p" style="margin-top:4px">${esc(D.fund.requisites)}</p>
    ${installBlock(true)}`;
  }

  /* ---------- install as app ---------- */
  let installEvt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function installBlock(always) {
    if (standalone()) return '';
    if (installEvt) return `<div class="install"><span><b>Установить приложение</b>Иконка фонда на экране телефона</span><button data-install>Установить</button></div>`;
    if (isIOS || always) return `<div class="install"><span><b>Как приложение</b>${isIOS ? 'Нажмите «Поделиться», затем «На экран Домой»' : 'В меню браузера выберите «Установить приложение» или «Добавить на главный экран»'}</span></div>`;
    return '';
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; route(); });

  /* ---------- donate sheet ---------- */
  const sheet = $('sheet'), scrim = $('scrim');
  const sum = () => S.d.custom ? (parseInt(S.d.custom, 10) || 0) : S.d.amt;
  function openD(id) {
    S.d = { camp: id || '', amt: 1000, custom: '', type: 'sadaka', done: false, fromCamp: !!id };
    drawD(); scrim.classList.add('on'); sheet.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeD() { scrim.classList.remove('on'); sheet.classList.remove('on'); document.body.style.overflow = ''; }
  function drawD() {
    const d = S.d, c = d.camp ? camp(d.camp) : null;
    if (d.done) {
      sheet.innerHTML = `<div class="grab"></div><div class="ok"><div class="c">${ic('check')}</div>
        <h3>Джазакаллаху хайран</h3>
        <p class="n">${rub(sum())} · ${c ? esc(c.title) : 'Куда нужнее всего'}${DEMO ? '<br>Это демо: оплата будет подключена позже' : ''}</p>
        <button class="btn" data-close>Готово</button></div>`;
      return;
    }
    const opts = [['', 'Куда нужнее']].concat(D.campaigns.filter(x => x.status === 'active').map(x => [x.id, x.title]));
    sheet.innerHTML = `<div class="grab"></div>
      <h3>Пожертвование</h3>
      <div class="to">${c ? esc(c.title) : 'Правление направит туда, где нужнее всего'}</div>
      ${d.fromCamp ? '' : `<div class="choose">${opts.map(o => `<button data-dcamp="${o[0]}" aria-pressed="${d.camp === o[0]}">${esc(o[1])}</button>`).join('')}</div>`}
      <div class="amts n">${[500, 1000, 3000, 5000].map(a => `<button data-amt="${a}" aria-pressed="${!d.custom && d.amt === a}">${a.toLocaleString('ru-RU')}</button>`).join('')}</div>
      <label class="inp"><input id="amt" inputmode="numeric" autocomplete="off" placeholder="Другая сумма" value="${d.custom}" aria-label="Другая сумма"><span class="muted">₽</span></label>
      <div class="seg"><button data-type="sadaka" aria-pressed="${d.type === 'sadaka'}">Садака</button><button data-type="zakat" aria-pressed="${d.type === 'zakat'}">Закят</button></div>
      <div class="hint">${d.type === 'zakat' ? 'Закят идёт только на помощь нуждающимся' : ''}</div>
      <button class="btn n" data-pay>Оплатить · ${rub(sum())}</button>`;
  }
  function pay() {
    const amount = sum();
    if (amount < 10) { toast('Минимальная сумма — 10 ₽'); return; }
    const c = S.d.camp ? camp(S.d.camp) : null;
    // Демо: учитываем пожертвование только в памяти страницы
    if (c) { c.raised += amount; c.donors += 1; D.donations.unshift([c.id, 'Вы', fmtNow(), amount]); }
    const r = D.reports.find(x => x.month === D.currentMonth); if (r) r.online += amount;
    S.d.done = true; drawD(); route();
  }
  const fmtNow = () => { const t = TODAY; const p = n => String(n).padStart(2, '0'); return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`; };

  let toastT;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---------- events ---------- */
  document.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if ('donate' in d) openD(d.donate);
    else if ('close' in d) closeD();
    else if ('month' in d) { if (d.month) { S.month = d.month; route(); } }
    else if ('install' in d && installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; route(); }
    else if (S.d && sheet.contains(b)) {
      if ('dcamp' in d) { S.d.camp = d.dcamp; if (S.d.type === 'zakat' && !(camp(d.dcamp) || {}).zakat) S.d.type = 'sadaka'; drawD(); }
      else if ('amt' in d) { S.d.amt = +d.amt; S.d.custom = ''; drawD(); }
      else if ('type' in d) { S.d.type = d.type; if (d.type === 'zakat') { S.d.camp = 'need'; } drawD(); }
      else if ('pay' in d) pay();
    }
  });
  scrim.addEventListener('click', closeD);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('on')) closeD(); });
  sheet.addEventListener('input', e => {
    if (e.target.id !== 'amt') return;
    S.d.custom = e.target.value.replace(/\D/g, '').slice(0, 7); e.target.value = S.d.custom;
    sheet.querySelectorAll('[data-amt]').forEach(x => x.setAttribute('aria-pressed', !S.d.custom && +x.dataset.amt === S.d.amt));
    sheet.querySelector('[data-pay]').textContent = 'Оплатить · ' + rub(sum());
  });

  if (DEMO) $('demo-bar').hidden = false;
  route();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
