// === Toast Notifications ===
function showToast(message, duration = 3000) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// Значок из набора в index.html и экранирование текста для вставки в разметку
const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s ?? '').replace(/[&"<>]/g, c => `&#${c.charCodeAt(0)};`);

// === Modal ===
function showModal(content) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      ${content}
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
  }
}

// === Confirm Dialog ===
function showConfirm(title, message, okLabel = 'Удалить') {
  return new Promise((resolve) => {
    showModal(`
      <h3 style="margin-bottom: 8px;">${title}</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: 24px; font-size: var(--font-size-sm); line-height: 1.5;">${message}</p>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary btn-full" id="confirm-cancel">Отмена</button>
        <button class="btn btn-primary btn-full" id="confirm-ok">${okLabel}</button>
      </div>
    `);

    document.getElementById('confirm-cancel').addEventListener('click', () => { closeModal(); resolve(false); });
    document.getElementById('confirm-ok').addEventListener('click', () => { closeModal(); resolve(true); });
  });
}

// === Ввод текста (переименовать): вернёт новое значение или null ===
function showPrompt(title, value = '', okLabel = 'Сохранить', placeholder = '') {
  return new Promise((resolve) => {
    showModal(`
      <h3 style="margin-bottom: 12px;">${esc(title)}</h3>
      <input class="input" id="prompt-input" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="200" autocomplete="off" autocapitalize="off" spellcheck="false">
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="btn btn-secondary btn-full" id="prompt-cancel">Отмена</button>
        <button class="btn btn-primary btn-full" id="prompt-ok">${esc(okLabel)}</button>
      </div>
    `);
    const input = document.getElementById('prompt-input');
    const done = (v) => { closeModal(); resolve(v); };
    setTimeout(() => { input.focus(); input.select(); }, 350);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(input.value.trim() || null); });
    document.getElementById('prompt-cancel').addEventListener('click', () => done(null));
    document.getElementById('prompt-ok').addEventListener('click', () => done(input.value.trim() || null));
  });
}

// === Material Card Renderer ===
function renderMaterialCard(material, selected = false, onClick = null) {
  const card = document.createElement('div');
  card.className = `material-card${selected ? ' selected' : ''}`;
  card.innerHTML = `
    <div class="material-card__image">
      <img src="${material.image}" alt="${material.name}" loading="lazy">
      <div class="material-card__check">✓</div>
    </div>
    <div class="material-card__name">${material.name}</div>
  `;

  if (onClick) {
    card.addEventListener('click', () => onClick(material));
  }

  return card;
}

// === Project Card Renderer ===
// Под названием проекта: сколько вариантов и есть ли картинка ИИ
function projectCardMeta(project) {
  const vs = project.variants || [];
  const n = vs.length || 1;
  const done = vs.length ? vs.filter(v => v.generated_image).length : (project.generated_image ? 1 : 0);
  const word = n % 10 === 1 && n % 100 !== 11 ? 'вариант' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'варианта' : 'вариантов';
  return `<div class="project-card__meta"><span>${n} ${word}</span>${done ? '<span class="project-card__ok">✓ есть картинка</span>' : '<span>без картинки</span>'}</div>`;
}

// Карточка проекта. Смахнуть влево — справа «Переименовать» и «Удалить»
function renderProjectCard(project, onClick = null) {
  const wrap = document.createElement('div');
  wrap.className = 'swipe';
  wrap.innerHTML = `
    <div class="swipe__actions">
      <button class="swipe__btn swipe__btn--rename" data-rename="${project.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>
        Название
      </button>
      <button class="swipe__btn swipe__btn--delete" data-delete="${project.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        Удалить
      </button>
    </div>
    <div class="project-card">
      <div class="project-card__thumb">
        <img src="${project.generated_image || project.original_image}" alt="" loading="lazy">
      </div>
      <div class="project-card__info">
        <div class="project-card__name">${esc(project.name)}</div>
        <div class="project-card__date">${formatDateTime(project.created_at)}</div>
        ${projectCardMeta(project)}
      </div>
    </div>
  `;
  const card = wrap.querySelector('.project-card');
  bindSwipe(wrap, card);
  card.addEventListener('click', () => {
    if (wrap.dataset.swiped) return;              // только что смахнули — это не нажатие
    if (wrap.classList.contains('open')) return setSwipeOpen(wrap, false);
    if (onClick) onClick(project);
  });
  // После действия карточка закрывается
  wrap.querySelector('.swipe__actions').addEventListener('click', () => setSwipeOpen(wrap, false));
  return wrap;
}

const SWIPE_W = 168;  // ширина двух кнопок справа

function setSwipeOpen(wrap, open) {
  const card = wrap.querySelector('.project-card');
  wrap.classList.toggle('open', open);
  card.style.transform = open ? `translateX(-${SWIPE_W}px)` : '';
  if (open) {
    document.querySelectorAll('.swipe.open').forEach(w => { if (w !== wrap) setSwipeOpen(w, false); });
    try { localStorage.setItem('fasad-swipe-hint', '1'); } catch (e) { /* не запомнится — подсказка покажется ещё раз */ }
    document.getElementById('swipe-hint')?.remove();
  }
}

// Горизонтальное движение пальцем двигает карточку; вертикальное — обычная прокрутка списка
function bindSwipe(wrap, card) {
  let x0 = 0, y0 = 0, dx = 0, axis = null, down = false;
  card.addEventListener('pointerdown', (e) => {
    down = true; axis = null; dx = 0;
    x0 = e.clientX; y0 = e.clientY;
  });
  card.addEventListener('pointermove', (e) => {
    if (!down) return;
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (axis === null) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
      if (axis === 'x') { card.setPointerCapture?.(e.pointerId); card.style.transition = 'none'; }
    }
    if (axis !== 'x') return;
    const base = wrap.classList.contains('open') ? -SWIPE_W : 0;
    dx = Math.max(-SWIPE_W - 40, Math.min(0, base + mx));
    card.style.transform = `translateX(${dx}px)`;
  });
  const end = () => {
    if (!down) return;
    down = false;
    if (axis !== 'x') return;
    card.style.transition = '';
    setSwipeOpen(wrap, dx < -SWIPE_W / 2);
    wrap.dataset.swiped = '1';
    setTimeout(() => delete wrap.dataset.swiped, 60);
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

// Нажатие мимо открытой карточки закрывает её
document.addEventListener('pointerdown', (e) => {
  if (!e.target.closest('.swipe.open')) document.querySelectorAll('.swipe.open').forEach(w => setSwipeOpen(w, false));
});

// === Catalog Card Renderer ===
function renderCatalogCard(material, onClick = null) {
  const card = document.createElement('div');
  card.className = 'catalog-card';
  card.innerHTML = `
    <div class="catalog-card__image">
      <img src="${material.image}" alt="${material.name}" loading="lazy">
    </div>
    <div class="catalog-card__info">
      <div class="catalog-card__name">${material.name}</div>
      <div class="catalog-card__type">${material.type || ''}</div>
    </div>
  `;

  if (onClick) {
    card.addEventListener('click', () => onClick(material));
  }

  return card;
}

// === Carousel Helper ===
function renderCarousel(items, renderItem, selectedIds = [], onSelect = null) {
  const container = document.createElement('div');
  container.className = 'carousel';

  items.forEach(item => {
    const isSelected = selectedIds.includes(item.id);
    const card = renderItem(item, isSelected);
    if (onSelect) {
      card.addEventListener('click', () => onSelect(item));
    }
    container.appendChild(card);
  });

  return container;
}

// === Date Formatter ===
// «2026-10-29 14:25:00» с сервера: Safari на iPhone понимает его только с «T»
function parseDate(dateStr) {
  return new Date(String(dateStr || '').replace(' ', 'T'));
}

function formatDate(dateStr) {
  const date = parseDate(dateStr);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Дата и время: «29 окт 2026, 14:25»
function formatDateTime(dateStr) {
  const date = parseDate(dateStr);
  if (isNaN(date)) return '';
  return `${formatDate(dateStr)}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// === Full Date Formatter ===
function formatFullDate(dateStr) {
  const date = parseDate(dateStr);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// === Local Storage helpers ===
const Storage = {
  save(key, data) {
    try {
      localStorage.setItem(`fasad_${key}`, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  },

  load(key) {
    try {
      const data = localStorage.getItem(`fasad_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(`fasad_${key}`);
    } catch (e) { /* ignore */ }
  }
};

// === Share helper ===
// Картинки для окна «Поделиться». На iPhone оно открывается только сразу после нажатия —
// пока файл качается, нажатие «протухает». Поэтому файл готовим заранее, как только картинка на экране
const ImageFiles = {
  cache: new Map(),
  prepare(url, name = 'fasad.jpg') {
    let entry = this.cache.get(url);
    if (!entry) {
      entry = { file: null };
      entry.promise = fetch(url)
        .then(r => (r.ok ? r.blob() : Promise.reject(new Error('Картинка не загрузилась'))))
        .then(b => (entry.file = new File([b], name, { type: b.type || 'image/jpeg' })));
      entry.promise.catch(() => this.cache.delete(url));
      this.cache.set(url, entry);
    }
    return entry;
  },
};

// «Скачать картинку»: на телефоне — окно «Поделиться» с пунктом «Сохранить изображение» (в Фото),
// а не файл JPG, из которого в приложении с экрана «Домой» не выйти. На компьютере — обычное скачивание
async function saveImage(url, filename) {
  if (!navigator.share || !navigator.canShare) return downloadImage(url, filename);
  const entry = ImageFiles.prepare(url, filename);
  if (entry.file) return shareImageFile(entry.file, url, filename);
  // Файл ещё качается — откроем «Поделиться» вторым нажатием
  showModal(`
    <div class="save-sheet">
      <h3 class="sheet-title">Сохранить в Фото</h3>
      <p class="configure-hint">В открывшемся окне выберите «Сохранить изображение».</p>
      <button class="btn btn-primary btn-full" id="save-go" disabled>Готовим картинку…</button>
    </div>`);
  const file = await entry.promise.catch(() => null);
  const btn = document.getElementById('save-go');
  if (!btn) return;
  if (!file) {
    closeModal();
    return showToast('Не удалось загрузить картинку');
  }
  btn.disabled = false;
  btn.textContent = 'Сохранить';
  btn.addEventListener('click', () => {
    closeModal();
    shareImageFile(file, url, filename);
  });
}

function shareImageFile(file, url, filename) {
  if (!navigator.canShare({ files: [file] })) return downloadImage(url, filename);
  // Без текста: с текстом iPhone прячет «Сохранить изображение»
  navigator.share({ files: [file] }).catch(e => {
    if (e.name !== 'AbortError') showToast('Не удалось открыть «Поделиться»');
  });
}

async function shareProject(title, imageUrl) {
  if (navigator.share) {
    try {
      const entry = ImageFiles.prepare(imageUrl, 'fasad.jpg');
      const file = entry.file || await entry.promise;
      await navigator.share({
        title: title,
        text: 'Мой фасад, созданный в Fasad AI',
        files: [file],
      });
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        await copyLink();
      }
      return false;
    }
  } else {
    await copyLink();
    return false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Ссылка скопирована');
  } catch {
    showToast('Не удалось скопировать ссылку');
  }
}

// === Download image ===
function downloadImage(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'fasad-project.png';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
