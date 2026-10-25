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
function showConfirm(title, message) {
  return new Promise((resolve) => {
    showModal(`
      <h3 style="margin-bottom: 8px;">${title}</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: 24px; font-size: var(--font-size-sm); line-height: 1.5;">${message}</p>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary btn-full" id="confirm-cancel">Отмена</button>
        <button class="btn btn-primary btn-full" id="confirm-ok">Удалить</button>
      </div>
    `);

    document.getElementById('confirm-cancel').addEventListener('click', () => { closeModal(); resolve(false); });
    document.getElementById('confirm-ok').addEventListener('click', () => { closeModal(); resolve(true); });
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
function renderProjectCard(project, onClick = null) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.innerHTML = `
    <div class="project-card__thumb">
      <img src="${project.generated_image || project.original_image}" alt="${project.name}" loading="lazy">
    </div>
    <div class="project-card__info">
      <div class="project-card__name">${project.name}</div>
      <div class="project-card__date">${formatDate(project.created_at)}</div>
    </div>
    <div class="project-card__menu">
      <button class="btn-icon" data-delete="${project.id}" aria-label="Удалить проект">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      </button>
    </div>
  `;

  if (onClick) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('[data-delete]')) onClick(project);
    });
  }

  return card;
}

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
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// === Full Date Formatter ===
function formatFullDate(dateStr) {
  const date = new Date(dateStr);
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
async function shareProject(title, imageUrl) {
  if (navigator.share) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'fasad-project.png', { type: 'image/png' });
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
