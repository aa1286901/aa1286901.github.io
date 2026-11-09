(function () {
  'use strict';
  const D = window.DATA;
  const DEMO = !!window.DEMO;
  // В демо «сегодня» зафиксировано, чтобы сроки сборов выглядели правдоподобно
  const TODAY = DEMO ? new Date('2026-11-09T12:00:00') : new Date();

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    news: '<path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8C19.5 15.4 12 20 12 20z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>',
    family: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13.5 20a4 4 0 0 1 8 0"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    back: '<path d="m15 6-6 6 6 6"/>', next: '<path d="m9 6 6 6-6 6"/>', check: '<path d="m5 12 5 5L20 7"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    box: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V5h6v3M10 13h4"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>', up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    fire: '<path d="M12 21c-4 0-7-2.8-7-6.6 0-3.4 2.4-5.4 4-7.4.3 1.8 1.2 3 2.4 3.6C11 7.4 12.4 4.6 15 3c-.5 3 1 5 2.4 6.9 1 1.3 1.6 2.8 1.6 4.5 0 3.8-3 6.6-7 6.6z"/>'
  };
  const ic = (n, s = 20) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const rub = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const short = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace('.', ',') + ' млн ₽' : Math.round(n / 1000) + ' тыс. ₽';
  const pct = c => Math.min(100, Math.round(c.raised / c.goal * 100));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const MG = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MN = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const parse = s => new Date(s.replace(' ', 'T') + (s.length <= 10 ? 'T12:00:00' : ':00'));
  const day = s => { const d = parse(s); return d.getDate() + ' ' + MG[d.getMonth()]; };
  const dayTime = s => { const d = parse(s); return day(s) + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const monthName = k => { const [y, m] = k.split('-'); return MN[+m - 1] + ' ' + y; };
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };
  const ago = s => {
    const min = Math.round((TODAY - parse(s)) / 60000);
    if (min < 60) return Math.max(1, min) + ' мин назад';
    if (min < 1440) return Math.round(min / 60) + ' ч назад';
    if (min < 2880) return 'вчера';
    return day(s);
  };
  const daysLeft = c => /^\d{4}-/.test(c.deadline) ? Math.max(0, Math.ceil((parse(c.deadline) - TODAY) / 864e5)) : null;
  const deadlineText = c => { const d = daysLeft(c); return d === null ? (c.status === 'done' ? 'Завершён' : 'Постоянно') : d + ' ' + plural(d, 'день', 'дня', 'дней'); };
  const camp = id => D.campaigns.find(c => c.id === id);
  const campName = id => (id && camp(id)) ? camp(id).title : 'Общий фонд';
  const inc = r => r.online + r.boxes + r.cash;
  const outSum = r => r.out.reduce((a, o) => a + o[2], 0);
  const CATS = ['Все'].concat([...new Set(D.campaigns.map(c => c.cat))]);

  /* ---------- state & routing ---------- */
  const S = { month: D.reports[0].month, cat: 'Все', seg: 'active', tab: 'about', d: null };
  const view = $('view');
  const NAV = [['#/', 'Главная', 'home'], ['#/sbory', 'Сборы', 'layers'], ['donate', 'Помочь', 'heart'], ['#/novosti', 'Новости', 'news'], ['#/otchety', 'Отчёты', 'doc']];

  function route(keepScroll) {
    const [page, arg] = location.hash.replace(/^#\/?/, '').split('/');
    let html, cur = '#/', title = '';
    if (page === 'sbor' && camp(arg)) { html = detail(camp(arg)); cur = '#/sbory'; title = camp(arg).title; }
    else if (page === 'sbory') { html = list(); cur = '#/sbory'; title = 'Сборы'; }
    else if (page === 'otchety') { html = reports(); cur = '#/otchety'; title = 'Отчёты'; }
    else if (page === 'novosti') { html = news(); cur = '#/novosti'; title = 'Новости'; }
    else if (page === 'o-fonde') { html = about(); cur = ''; title = 'О фонде'; }
    else html = home();
    $('bnav').innerHTML = NAV.map(([h, l, i]) => h === 'donate'
      ? `<button class="fab" data-donate=""><span>${ic(i, 26)}</span>${l}</button>`
      : `<a href="${h}" ${cur === h ? 'aria-current="page"' : ''}>${ic(i, 24)}${l}</a>`).join('');
    $('dnav').innerHTML = NAV.filter(n => n[0] !== 'donate').map(([h, l]) => `<a href="${h}" ${cur === h ? 'aria-current="page"' : ''}>${l}</a>`).join('')
      + `<a class="cta" href="#" data-donate="">Помочь</a>`;
    view.innerHTML = html;
    document.title = title ? title + ' · Фонд Сагасидейбук' : 'Фонд Сагасидейбук';
    if (!keepScroll) window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => { S.tab = 'about'; route(); });

  /* ---------- pieces ---------- */
  function card(c) {
    const d = daysLeft(c), done = c.status === 'done';
    return `<article class="card camp">
      <a class="ph" href="#/sbor/${c.id}"><img src="${c.photo}" alt="" loading="lazy">
        <span class="pill l ${c.tag ? 'hot' : ''}">${c.tag ? ic('fire', 14) + esc(c.tag) : esc(c.cat)}</span>
        <span class="pill r">${done ? ic('check', 14) + 'Собрано' : ic('clock', 14) + deadlineText(c)}</span></a>
      <div class="body">
        <a href="#/sbor/${c.id}"><h3>${esc(c.title)}</h3></a>
        <div class="helped">${ic('users', 17)}${c.donors.toLocaleString('ru-RU')} ${plural(c.donors, 'человек помог', 'человека помогли', 'человек помогли')}</div>
        <div class="prog"><i style="width:${pct(c)}%"></i></div>
        <div class="amounts n"><div>Собрано<b>${rub(c.raised)}</b></div><div>Цель<b>${rub(c.goal)}</b></div></div>
        ${done ? `<a class="btn line block sm" href="#/sbor/${c.id}">Смотреть отчёт</a>` : `<div class="actions"><button class="share" data-share="${c.id}" aria-label="Поделиться">${ic('share')}</button><button class="btn main" data-donate="${c.id}">${ic('heart')}Помочь</button></div>`}
      </div></article>`;
  }
  function newsCard(n, past) {
    return `<article class="card ncard ${n.photo ? '' : 'noimg'}">
      ${n.photo ? `<img src="${n.photo}" alt="" loading="lazy">` : ''}
      <div class="b"><span class="k">${esc(n.type)}</span><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p>
        <div class="w">${ic('cal', 16)}${past ? day(n.date) : dayTime(n.date)}${n.place ? ' · ' + esc(n.place) : ''}</div></div></article>`;
  }
  const upcoming = () => D.news.filter(n => parse(n.date) >= TODAY).sort((a, b) => parse(a.date) - parse(b.date));
  const boxesTotal = () => D.boxes.reduce((a, b) => a + b.history[0][1], 0);

  /* ---------- pages ---------- */
  function home() {
    const st = D.fund.stats, active = D.campaigns.filter(c => c.status === 'active');
    const r = D.reports.find(x => x.month === D.currentMonth) || D.reports[0];
    return `
    <section class="hero"><img src="${D.fund.photo}" alt="Селение в горах">
      <div class="in">${DEMO ? '<span class="demo" style="justify-self:start">Демо-версия</span>' : ''}
        <h1>Помогаем своим — вместе</h1>
        <p>Фонд селения Сагасидейбук: помощь нуждающимся семьям, мечеть, медресе и благоустройство селения.</p>
        <button class="btn white" data-donate="">${ic('heart')}Пожертвовать</button></div></section>
    <div class="stats n">
      <div class="card stat"><span class="ic">${ic('coins')}</span><b>${short(st.raisedTotal)}</b><span>собрано за всё время</span></div>
      <div class="card stat"><span class="ic">${ic('family')}</span><b>${st.families}</b><span>семьям помогли</span></div>
      <div class="card stat"><span class="ic">${ic('users')}</span><b>${st.donors.toLocaleString('ru-RU')}</b><span>человек помогают</span></div>
    </div>

    <section class="sec"><div class="sec-h"><h2>Им нужна ваша помощь</h2><a href="#/sbory">Все сборы</a></div>
      <div class="grid">${active.slice(0, 3).map(card).join('')}</div></section>

    <section class="sec"><div class="boxes">
      <small>Ящики для садаки · последнее вскрытие</small>
      <div class="big n">${rub(boxesTotal())}</div>
      <div class="row2">${ic('cal')}<span>Следующее вскрытие — <b>${esc(D.nextBoxOpening)}</b>. Прийти может любой житель.</span></div>
      <a href="#/otchety">Где стоят ящики и кто вскрывал ${ic('next', 16)}</a></div></section>

    <section class="sec"><div class="sec-h"><h2>Как помочь</h2></div>
      <div class="steps">
        <div class="card step"><span class="k">1</span><b>Выберите сбор</b><span>Или «Куда нужнее» — решит правление фонда</span></div>
        <div class="card step"><span class="k">2</span><b>Пожертвуйте</b><span>Через СБП или картой, от 100 ₽</span></div>
        <div class="card step"><span class="k">3</span><b>Получите отчёт</b><span>Каждый расход с чеком — в разделе «Отчёты»</span></div>
      </div></section>

    <section class="sec"><div class="sec-h"><h2>Ближайшие события</h2><a href="#/novosti">Все</a></div>
      <div class="hscroll">${upcoming().slice(0, 3).map(n => newsCard(n)).join('')}</div></section>

    <section class="sec"><div class="card trust">
      <div style="display:flex;gap:12px;align-items:center"><span class="stat" style="padding:0"><span class="ic">${ic('shield')}</span></span>
        <div><b style="font-size:17px">Всё прозрачно</b><div class="muted" style="font-size:13.5px">Отчёт за ${monthName(r.month).toLowerCase()}</div></div></div>
      <div class="t3 n"><div>Пришло<b class="plus">${short(inc(r))}</b></div><div>Потрачено<b class="minus">${short(outSum(r))}</b></div><div>Остаток<b>${short(r.balance)}</b></div></div>
      <a class="btn line block sm" href="#/otchety">Открыть отчёты</a></div></section>
    ${installBlock()}`;
  }

  function list() {
    const src = D.campaigns.filter(c => c.status === S.seg && (S.cat === 'Все' || c.cat === S.cat));
    const na = D.campaigns.filter(c => c.status === 'active').length, nd = D.campaigns.length - na;
    return `<h1>Сборы</h1>
    <div class="seg"><button data-seg="active" aria-pressed="${S.seg === 'active'}">Активные · ${na}</button><button data-seg="done" aria-pressed="${S.seg === 'done'}">Завершённые · ${nd}</button></div>
    <div class="chips">${CATS.map(c => `<button class="chip" data-cat="${c}" aria-pressed="${S.cat === c}">${c}</button>`).join('')}</div>
    <div class="grid">${src.map(card).join('') || '<div class="card empty">В этой категории пока нет сборов</div>'}</div>`;
  }

  function detail(c) {
    const done = c.status === 'done';
    const dons = D.donations.filter(d => d[0] === c.id);
    const spent = c.spent.reduce((a, s) => a + s[2], 0);
    const tabs = [['about', 'О сборе'], ['spent', 'Расходы'], ['donors', 'Помогли']];
    let body;
    if (S.tab === 'spent') body = `<div class="list">${c.spent.map(s => `<div class="li"><span class="ic">${ic('up')}</span><span class="tx">${esc(s[0])}<small>${day(s[1])} · чек в отчёте</small></span><b class="v minus n">−${rub(s[2])}</b></div>`).join('')}</div><p class="muted" style="font-size:13.5px">Всего потрачено: <b class="n" style="color:var(--ink)">${rub(spent)}</b></p>`;
    else if (S.tab === 'donors') body = dons.length ? `<div class="list">${dons.map(d => `<div class="li"><span class="ic in">${ic('heart')}</span><span class="tx">${esc(d[1])}<small>${ago(d[2])}</small></span><b class="v plus n">+${rub(d[3])}</b></div>`).join('')}</div>` : '<div class="empty">Пока нет пожертвований онлайн</div>';
    else body = `<p class="prose">${esc(c.text)}</p>`;
    return `
    <div class="dhero"><img src="${c.photo}" alt="">
      <div class="bar"><a href="#/sbory" aria-label="Назад">${ic('back')}</a><button data-share="${c.id}" aria-label="Поделиться">${ic('share')}</button></div></div>
    <div class="dsheet"><div class="dhead"><span class="tagline">${esc(c.cat)}</span>
        <h1 class="dtitle">${esc(c.title)}</h1></div>
      <div class="dgrid">
      <div>
        <div class="tabs" role="tablist">${tabs.map(t => `<button role="tab" data-tab="${t[0]}" aria-selected="${S.tab === t[0]}">${t[1]}</button>`).join('')}</div>
        ${body}
      </div>
      <div class="dside"><div class="card money">
        <div class="muted" style="font-size:13px">Собрано</div>
        <div class="big n">${rub(c.raised)}</div>
        <div class="prog"><i style="width:${pct(c)}%"></i></div>
        <div class="amounts n" style="font-size:13px"><span>${pct(c)}% от цели</span><span>цель ${rub(c.goal)}</span></div>
        <div class="facts n"><div><b>${c.donors}</b>помогли</div><div><b>${deadlineText(c)}</b>${daysLeft(c) !== null ? 'осталось' : 'срок'}</div><div><b>${short(spent)}</b>потрачено</div></div>
        ${done ? '' : `<button class="btn main block" data-donate="${c.id}">${ic('heart')}Помочь</button>`}
      </div></div>
    </div></div><div class="dspacer"></div>
    ${done ? '' : `<div class="sticky-cta"><button class="btn main" data-donate="${c.id}">${ic('heart')}Помочь сбору</button></div>`}`;
  }

  function donut(parts) {
    const total = parts.reduce((a, p) => a + p[1], 0), R = 46, C = 2 * Math.PI * R;
    let off = 0;
    return `<svg viewBox="0 0 120 120" role="img" aria-label="Источники поступлений"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--soft)" stroke-width="16"/>` +
      parts.map(p => { const len = C * p[1] / total, s = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${p[2]}" stroke-width="16" stroke-dasharray="${Math.max(0, len - 2)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`; off += len; return s; }).join('') +
      `<text x="60" y="56" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="Onest,sans-serif">всего</text><text x="60" y="72" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ink)" font-family="Onest,sans-serif">${short(total).replace(' ₽', '')}</text></svg>`;
  }

  function reports() {
    const L = D.reports, i = L.findIndex(r => r.month === S.month), r = L[i], older = L[i + 1], newer = L[i - 1];
    const parts = [['Онлайн', r.online, 'var(--g1)'], ['Ящики для садаки', r.boxes, 'var(--gold)'], ['Наличными', r.cash, '#7AA7D9']];
    return `<div class="narrow"><h1>Отчёты</h1>
    <div class="mpick"><button data-month="${older ? older.month : ''}" ${older ? '' : 'disabled'} aria-label="Предыдущий месяц">${ic('back')}</button>
      <b>${monthName(r.month)}${r.partial ? ' · идёт' : ''}</b>
      <button data-month="${newer ? newer.month : ''}" ${newer ? '' : 'disabled'} aria-label="Следующий месяц">${ic('next')}</button></div>
    <div class="sum n"><div><small>Поступило за месяц</small><div class="big">${rub(inc(r))}</div></div>
      <div class="two"><div>Потрачено<b>${rub(outSum(r))}</b></div><div>Остаток на счёте<b>${rub(r.balance)}</b></div></div></div>
    </div>
    <div class="rgrid narrow">
      <div><div class="sec-h" style="margin-top:8px"><h2>Откуда</h2></div>
        <div class="card donut n">${donut(parts)}<div class="legend">${parts.map(p => `<div><i style="background:${p[2]}"></i><span>${p[0]}</span><b>${rub(p[1])}</b></div>`).join('')}</div></div></div>
      <div><div class="sec-h" style="margin-top:8px"><h2>Куда</h2></div>
        <div class="card listcard"><div class="list">${r.out.map(o => { const c = camp(o[0]); return `<div class="li"><span class="ic">${c ? `<img src="${c.photo}" alt="">` : ic('up')}</span><span class="tx">${esc(campName(o[0]))}<small>${esc(o[1])}</small></span><b class="v minus n">−${rub(o[2])}</b></div>`; }).join('')}</div></div></div>
    </div>
    <div class="narrow">
      <section class="sec"><div class="sec-h" style="margin-bottom:4px"><h2>Ящики для садаки</h2></div><p class="muted" style="font-size:13.5px;margin:0 0 14px">Следующее вскрытие: ${esc(D.nextBoxOpening)}</p>
        <div class="card listcard">${D.boxes.map(b => `<details class="bx"><summary><span class="ic" style="width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:#FCF3E3;color:var(--gold);flex:none">${ic('box')}</span>
          <span class="tx" style="flex:1;min-width:0;font-weight:600;font-size:14.5px">${esc(b.place)}<small style="display:block;font-weight:500;color:var(--muted);font-size:12.5px">${esc(campName(b.goes))} · ${day(b.history[0][0])}</small></span>
          <b class="n">${rub(b.history[0][1])}</b><span class="chev">${ic('next', 18)}</span></summary>
          <div class="hist">${b.history.map(h => `<div><span>${day(h[0])}<small>Комиссия: ${esc(h[2])}</small></span><b class="n">${rub(h[1])}</b></div>`).join('')}</div></details>`).join('')}</div>
        <p class="muted" style="font-size:13px;margin:10px 4px 0">Ящики вскрывает комиссия из 3 человек. Сумма и фото пересчёта публикуются в тот же день.</p></section>
      <section class="sec"><div class="sec-h"><h2>Документы</h2></div>
        <div class="card listcard"><div class="list">
          ${[['Отчёт за ' + monthName(r.month).toLowerCase(), 'Подписан председателем и казначеем'], ['Чеки и накладные', r.out.length * 3 + ' файлов'], ['Акты вскрытия ящиков', D.boxes.length + ' акта']].map(d => `<button class="li doc" data-doc style="width:100%"><span class="ic">PDF</span><span class="tx">${d[0]}<small>${d[1]}</small></span>${ic('down')}</button>`).join('')}
        </div></div></section>
    </div>`;
  }

  function news() {
    const L = D.news.slice().sort((a, b) => parse(a.date) - parse(b.date));
    const up = L.filter(n => parse(n.date) >= TODAY), past = L.filter(n => parse(n.date) < TODAY).reverse();
    return `<h1>Новости и объявления</h1>
    ${up.length ? `<div class="sec-h"><h2>Скоро</h2></div><div class="grid">${up.map(n => newsCard(n)).join('')}</div>` : ''}
    ${past.length ? `<section class="sec"><div class="sec-h"><h2>Прошедшие</h2></div><div class="grid">${past.map(n => newsCard(n, true)).join('')}</div></section>` : ''}`;
  }

  function about() {
    const st = D.fund.stats;
    return `<div class="narrow">
    <div class="about-hero"><img src="${D.fund.photo}" alt="Селение в горах"></div>
    <h1 style="margin-top:20px">${esc(D.fund.name)}</h1>
    ${D.fund.about.map(p => `<p class="prose" style="margin-top:0;margin-bottom:12px">${esc(p)}</p>`).join('')}
    <div class="stats n">
      <div class="card stat"><span class="ic">${ic('coins')}</span><b>${short(st.raisedTotal)}</b><span>собрано</span></div>
      <div class="card stat"><span class="ic">${ic('family')}</span><b>${st.families}</b><span>семьям помогли</span></div>
      <div class="card stat"><span class="ic">${ic('users')}</span><b>${st.donors.toLocaleString('ru-RU')}</b><span>жертвователей</span></div>
    </div>
    <section class="sec"><div class="sec-h"><h2>Контакты</h2></div>
      <div class="card listcard"><div class="list">${D.fund.contacts.map(c => `<div class="li"><span class="ic in">${ic('phone')}</span><span class="tx">${esc(c[1])}<small>${esc(c[0])}</small></span><b class="v n" style="user-select:all">${esc(c[2])}</b></div>`).join('')}</div></div></section>
    <section class="sec"><div class="sec-h"><h2>Ящики для садаки</h2></div>
      <div class="card listcard"><div class="list">${D.boxes.map(b => `<div class="li"><span class="ic">${ic('pin')}</span><span class="tx">${esc(b.place)}<small>Идёт на: ${esc(campName(b.goes))}</small></span></div>`).join('')}</div></div></section>
    <section class="sec"><div class="sec-h"><h2>Реквизиты</h2></div><div class="card" style="padding:16px;color:var(--muted)">${esc(D.fund.requisites)}</div></section>
    ${installBlock(true)}
    ${D.credits ? `<section class="sec credits">Фото в демо-версии: ${D.credits.map(c => `<a href="${c[3]}" target="_blank" rel="noopener">${esc(c[1])}</a> (${esc(c[2])})`).join(', ')}.</section>` : ''}
    </div>`;
  }

  /* ---------- install as app ---------- */
  let installEvt = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  function installBlock(always) {
    if (standalone() || (!installEvt && !isIOS && !always)) return '';
    const text = installEvt ? 'Иконка фонда на экране телефона' : isIOS ? 'Нажмите «Поделиться», затем «На экран Домой»' : 'В меню браузера: «Установить приложение» или «Добавить на главный экран»';
    return `<section class="sec"><div class="card install"><img class="ic" src="icons/icon-192.png" alt=""><div><b>Приложение фонда</b>${text}</div>${installEvt ? '<button class="btn main sm" data-install>Установить</button>' : ''}</div></section>`;
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; route(true); });

  /* ---------- donate sheet ---------- */
  const sheet = $('sheet'), scrim = $('scrim');
  const sum = () => S.d.custom ? (parseInt(S.d.custom, 10) || 0) : S.d.amt;
  function openD(id) {
    S.d = { camp: id || '', amt: 1000, custom: '', type: 'sadaka', method: 'sbp', done: false, fixed: !!id };
    drawD(); scrim.classList.add('on'); sheet.classList.add('on'); document.body.style.overflow = 'hidden';
  }
  function closeD() { scrim.classList.remove('on'); sheet.classList.remove('on'); document.body.style.overflow = ''; }
  function drawD() {
    const d = S.d, c = d.camp ? camp(d.camp) : null;
    if (d.done) {
      sheet.innerHTML = `<div class="grab"></div><div class="ok"><div class="c">${ic('check', 36)}</div>
        <h3>Джазакаллаху хайран!</h3>
        <p class="n">${rub(sum())} · ${c ? esc(c.title) : 'Куда нужнее всего'}${DEMO ? '<br>Это демо: оплата будет подключена позже' : ''}</p>
        <button class="btn main block" data-close>Готово</button></div>`;
      return;
    }
    const opts = [['', 'Куда нужнее']].concat(D.campaigns.filter(x => x.status === 'active').map(x => [x.id, x.title]));
    sheet.innerHTML = `<div class="grab"></div>
      <div class="shead"><img src="${c ? c.photo : D.fund.photo}" alt=""><div><h3>Пожертвование</h3><small>${c ? esc(c.title) : 'Правление направит туда, где нужнее'}</small></div><button class="x" data-close aria-label="Закрыть">${ic('x', 18)}</button></div>
      ${d.fixed ? '' : `<div class="choose">${opts.map(o => `<button data-dcamp="${o[0]}" aria-pressed="${d.camp === o[0]}">${esc(o[1])}</button>`).join('')}</div>`}
      <div class="lbl">Сумма</div>
      <div class="amts n">${[300, 500, 1000, 2000, 5000, 10000].map(a => `<button data-amt="${a}" aria-pressed="${!d.custom && d.amt === a}">${a.toLocaleString('ru-RU')} ₽</button>`).join('')}</div>
      <label class="inp n"><input id="amt" inputmode="numeric" autocomplete="off" placeholder="Своя сумма" value="${d.custom}" aria-label="Своя сумма"><span class="muted">₽</span></label>
      <div class="lbl">Вид</div>
      <div class="sseg"><button data-type="sadaka" aria-pressed="${d.type === 'sadaka'}">Садака</button><button data-type="zakat" aria-pressed="${d.type === 'zakat'}">Закят</button></div>
      ${d.type === 'zakat' ? '<div class="hint">Закят идёт только на помощь нуждающимся семьям</div>' : ''}
      <div class="lbl">Способ оплаты</div>
      <div class="pm">
        <button data-method="sbp" aria-pressed="${d.method === 'sbp'}"><span class="lg" style="color:var(--accent)">СБП</span><div>СБП<small>Через приложение банка, без комиссии</small></div><span class="radio"></span></button>
        <button data-method="card" aria-pressed="${d.method === 'card'}"><span class="lg">${ic('card')}</span><div>Банковская карта<small>Мир, Visa, Mastercard</small></div><span class="radio"></span></button>
      </div>
      <button class="btn main block pay n" data-pay>Пожертвовать ${rub(sum())}</button>
      <div class="secure">${ic('lock', 14)}Деньги поступают на счёт фонда</div>`;
  }
  function pay() {
    const amount = sum();
    if (amount < 10) { toast('Минимальная сумма — 10 ₽'); return; }
    const c = S.d.camp ? camp(S.d.camp) : null;
    // Демо: учитываем пожертвование только в памяти страницы
    if (c) { c.raised += amount; c.donors += 1; D.donations.unshift([c.id, 'Вы', fmtNow(), amount]); }
    const r = D.reports.find(x => x.month === D.currentMonth); if (r) r.online += amount;
    S.d.done = true; drawD(); route(true);
  }
  const fmtNow = () => { const t = TODAY, p = n => String(n).padStart(2, '0'); return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`; };

  let tt;
  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

  async function share(id) {
    const c = camp(id), url = location.href.split('#')[0] + '#/sbor/' + id, text = c.title + ' — фонд Сагасидейбук';
    try { if (navigator.share) { await navigator.share({ title: text, url }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(url); toast('Ссылка скопирована'); } catch (e) { toast(url); }
  }

  /* ---------- events ---------- */
  document.addEventListener('click', async e => {
    const b = e.target.closest('button,a[data-donate]'); if (!b) return;
    const d = b.dataset;
    if ('donate' in d) { e.preventDefault(); openD(d.donate); }
    else if ('close' in d) closeD();
    else if ('share' in d) share(d.share);
    else if ('seg' in d) { S.seg = d.seg; route(true); }
    else if ('cat' in d) { S.cat = d.cat; route(true); }
    else if ('tab' in d) { S.tab = d.tab; route(true); }
    else if ('month' in d) { if (d.month) { S.month = d.month; route(true); } }
    else if ('doc' in d) toast(DEMO ? 'В демо документы не загружены' : 'Документ откроется');
    else if ('install' in d && installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; route(true); }
    else if (S.d && sheet.contains(b)) {
      if ('dcamp' in d) { S.d.camp = d.dcamp; if (S.d.type === 'zakat' && !(camp(d.dcamp) || {}).zakat) S.d.type = 'sadaka'; drawD(); }
      else if ('amt' in d) { S.d.amt = +d.amt; S.d.custom = ''; drawD(); }
      else if ('type' in d) { S.d.type = d.type; if (d.type === 'zakat') S.d.camp = 'need'; drawD(); }
      else if ('method' in d) { S.d.method = d.method; drawD(); }
      else if ('pay' in d) pay();
    }
  });
  scrim.addEventListener('click', closeD);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('on')) closeD(); });
  sheet.addEventListener('input', e => {
    if (e.target.id !== 'amt') return;
    S.d.custom = e.target.value.replace(/\D/g, '').slice(0, 7); e.target.value = S.d.custom;
    sheet.querySelectorAll('[data-amt]').forEach(x => x.setAttribute('aria-pressed', !S.d.custom && +x.dataset.amt === S.d.amt));
    sheet.querySelector('[data-pay]').textContent = 'Пожертвовать ' + rub(sum());
  });

  route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
