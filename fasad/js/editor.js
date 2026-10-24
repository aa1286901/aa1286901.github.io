// === Редактор разметки фасада ===
// Прораб ставит на фото зоны (стена, цоколь, откос, проём) и карнизы,
// для каждой зоны выбирает камень, узор кладки, размер камня и цвет шва.
// Все координаты хранятся в пикселях уменьшенного фото.

const EDITOR_MAX_SIDE = 1600;   // итоговый набросок
const PREVIEW_MAX_SIDE = 800;   // быстрый предпросмотр во время правок
const SVG_NS = 'http://www.w3.org/2000/svg';

const Editor = {
  photo: null,          // canvas с фото (EDITOR_MAX_SIDE)
  preview: null,        // canvas с фото (PREVIEW_MAX_SIDE)
  design: null,
  selectedId: null,
  materials: {},
  materialList: [],
  lastChoice: {},       // последние выбранные материал/узор для каждого типа зоны
  renderTimer: null,
  renderToken: 0,
  bound: false,

  async open() {
    const photo = ProjectFlow.getState('originalPhoto');
    if (!photo) {
      Router.navigateTo('photo');
      return;
    }

    this.bind();
    await this.loadMaterials();

    const img = await this.loadImage(photo);
    this.photo = this.scaleToCanvas(img, EDITOR_MAX_SIDE);
    this.preview = this.scaleToCanvas(img, PREVIEW_MAX_SIDE);

    // Фото храним уже уменьшенным: так черновик помещается в память телефона
    if (photo.startsWith('data:') && photo.length > 600000) {
      ProjectFlow.setState('originalPhoto', this.photo.toDataURL('image/jpeg', 0.88));
    }

    const draftDesign = ProjectFlow.getState('design');
    this.design = draftDesign && draftDesign.w === this.photo.width
      ? draftDesign
      : { w: this.photo.width, h: this.photo.height, zones: [], bands: [] };
    this.selectedId = null;

    const canvas = document.getElementById('editor-canvas');
    canvas.width = this.preview.width;
    canvas.height = this.preview.height;
    const overlay = document.getElementById('editor-overlay');
    overlay.setAttribute('viewBox', `0 0 ${this.photo.width} ${this.photo.height}`);
    // Фото занимает не больше ~55% высоты экрана, чтобы панель выбора камня была видна
    const ratio = this.photo.width / this.photo.height;
    const stage = document.getElementById('editor-stage');
    stage.style.aspectRatio = `${this.photo.width} / ${this.photo.height}`;
    stage.style.width = `min(100%, calc(55vh * ${ratio.toFixed(4)}))`;

    this.drawOverlay();
    this.renderPanel();
    this.scheduleRender(0);

    if (!this.design.zones.length && !this.design.bands.length) {
      showToast('Добавьте зону «Стена» и поставьте углы по краям стены');
    }
  },

  async loadMaterials() {
    if (this.materialList.length) return;
    const all = await Materials.getAll();
    this.materialList = all.filter(m => m.active !== false && m.texture);
    this.materialList.forEach(m => { this.materials[m.id] = m; });
  },

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  scaleToCanvas(img, maxSide) {
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  },

  save() {
    ProjectFlow.setState('design', this.design);
  },

  // === Предпросмотр ===
  scheduleRender(delay = 250) {
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => this.renderPreview(), delay);
  },

  async renderPreview() {
    const token = ++this.renderToken;
    const k = this.preview.width / this.photo.width;
    const result = await FacadeRender.render(this.preview, this.scaleDesign(this.design, k), this.materials);
    if (token !== this.renderToken) return; // пока считали, разметку уже поменяли
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.showingOriginal ? this.preview : result, 0, 0);
    this.lastPreview = result;
  },

  scaleDesign(design, k) {
    const sp = p => [p[0] * k, p[1] * k];
    return {
      zones: design.zones.map(z => ({ ...z, points: z.points.map(sp) })),
      bands: design.bands.map(b => ({ ...b, p1: sp(b.p1), p2: sp(b.p2) })),
    };
  },

  // === Добавление элементов ===
  addZone(type) {
    const { w, h } = this.design;
    const sizes = {
      wall:    [0.2, 0.25, 0.8, 0.7],
      base:    [0.15, 0.72, 0.85, 0.88],
      reveal:  [0.42, 0.35, 0.5, 0.6],
      opening: [0.4, 0.38, 0.6, 0.58],
    };
    const [x1, y1, x2, y2] = sizes[type];
    const last = this.lastChoice[type] || this.lastChoice.wall || {};
    const zone = {
      id: 'z' + Date.now(),
      type,
      points: [[x1 * w, y1 * h], [x2 * w, y1 * h], [x2 * w, y2 * h], [x1 * w, y2 * h]],
    };
    if (type !== 'opening') {
      Object.assign(zone, {
        materialId: last.materialId || this.materialList[0]?.id,
        pattern: last.pattern || (type === 'base' ? 'split' : type === 'reveal' ? 'smooth' : 'sawn'),
        size: last.size || 'm',
        joint: last.joint || 'grey',
      });
    }
    this.design.zones.push(zone);
    this.select(zone.id);
    this.changed();
  },

  addBand() {
    const { w, h } = this.design;
    const band = {
      id: 'b' + Date.now(),
      type: 'cornice',
      color: 'white',
      scale: 1,
      p1: [0.15 * w, 0.3 * h],
      p2: [0.85 * w, 0.3 * h],
    };
    this.design.bands.push(band);
    this.select(band.id);
    this.changed();
  },

  findItem(id) {
    return this.design.zones.find(z => z.id === id) || this.design.bands.find(b => b.id === id);
  },

  select(id) {
    this.selectedId = id;
    this.drawOverlay();
    this.renderPanel();
  },

  removeSelected() {
    this.design.zones = this.design.zones.filter(z => z.id !== this.selectedId);
    this.design.bands = this.design.bands.filter(b => b.id !== this.selectedId);
    this.select(null);
    this.changed();
  },

  updateSelected(patch) {
    const item = this.findItem(this.selectedId);
    if (!item) return;
    Object.assign(item, patch);
    if (item.points && item.type !== 'opening') {
      this.lastChoice[item.type] = { materialId: item.materialId, pattern: item.pattern, size: item.size, joint: item.joint };
    }
    this.renderPanel();
    this.changed();
  },

  changed() {
    this.save();
    this.drawOverlay();
    this.scheduleRender();
  },

  // === Слой разметки (SVG поверх фото) ===
  drawOverlay() {
    const svg = document.getElementById('editor-overlay');
    if (!svg || !this.design) return;
    svg.innerHTML = '';
    const r = Math.max(this.design.w, this.design.h) * 0.022; // радиус ручки
    const stroke = Math.max(this.design.w, this.design.h) * 0.004;

    const el = (name, attrs) => {
      const e = document.createElementNS(SVG_NS, name);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      svg.appendChild(e);
      return e;
    };

    this.design.zones.forEach(z => {
      const selected = z.id === this.selectedId;
      const color = ZONE_TYPES[z.type].stroke;
      const poly = el('polygon', {
        points: z.points.map(p => p.join(',')).join(' '),
        fill: selected ? color + '22' : 'transparent',
        stroke: color,
        'stroke-width': selected ? stroke * 1.6 : stroke,
        'stroke-dasharray': z.type === 'opening' ? `${stroke * 4} ${stroke * 3}` : 'none',
        'data-select': z.id,
      });
      poly.style.cursor = 'pointer';
      if (selected) {
        z.points.forEach((p, i) => this.drawHandle(el, p, r, stroke, color, `${z.id}:${i}`));
      }
    });

    this.design.bands.forEach(b => {
      const selected = b.id === this.selectedId;
      el('line', {
        x1: b.p1[0], y1: b.p1[1], x2: b.p2[0], y2: b.p2[1],
        stroke: 'transparent', 'stroke-width': r * 2, 'data-select': b.id,
      });
      el('line', {
        x1: b.p1[0], y1: b.p1[1], x2: b.p2[0], y2: b.p2[1],
        stroke: '#ffffff', 'stroke-width': selected ? stroke * 1.6 : stroke,
        'stroke-dasharray': `${stroke * 5} ${stroke * 2}`, 'pointer-events': 'none',
      });
      if (selected) {
        this.drawHandle(el, b.p1, r, stroke, '#ffffff', `${b.id}:p1`);
        this.drawHandle(el, b.p2, r, stroke, '#ffffff', `${b.id}:p2`);
      }
    });
  },

  drawHandle(el, p, r, stroke, color, key) {
    // Невидимая большая область для пальца и видимая точка
    el('circle', { cx: p[0], cy: p[1], r: r * 1.8, fill: 'transparent', 'data-handle': key });
    el('circle', {
      cx: p[0], cy: p[1], r, fill: color, stroke: '#ffffff', 'stroke-width': stroke,
      'pointer-events': 'none',
    });
  },

  // === Перетаскивание углов ===
  toImageCoords(e) {
    const svg = document.getElementById('editor-overlay');
    const rect = svg.getBoundingClientRect();
    return [
      Math.min(this.design.w, Math.max(0, (e.clientX - rect.left) / rect.width * this.design.w)),
      Math.min(this.design.h, Math.max(0, (e.clientY - rect.top) / rect.height * this.design.h)),
    ];
  },

  onPointerDown(e) {
    const handle = e.target.getAttribute('data-handle');
    if (handle) {
      e.preventDefault();
      const [id, idx] = handle.split(':');
      this.drag = { id, idx, pointerId: e.pointerId };
      e.target.setPointerCapture?.(e.pointerId);
      this.showLoupe(e);
      return;
    }
    const sel = e.target.getAttribute('data-select');
    if (sel) {
      // Перетаскивание всей зоны или карниза
      e.preventDefault();
      if (sel !== this.selectedId) this.select(sel);
      this.drag = { id: sel, idx: 'all', start: this.toImageCoords(e), orig: JSON.parse(JSON.stringify(this.findItem(sel))), moved: false };
      e.target.setPointerCapture?.(e.pointerId);
      return;
    }
    if (this.selectedId) this.select(null);
  },

  onPointerMove(e) {
    if (!this.drag) return;
    e.preventDefault();
    const item = this.findItem(this.drag.id);
    if (!item) return;
    const p = this.toImageCoords(e);
    if (this.drag.idx === 'all') {
      const dx = p[0] - this.drag.start[0], dy = p[1] - this.drag.start[1];
      if (Math.hypot(dx, dy) > 4) this.drag.moved = true;
      if (item.points) item.points = this.drag.orig.points.map(q => [q[0] + dx, q[1] + dy]);
      else { item.p1 = [this.drag.orig.p1[0] + dx, this.drag.orig.p1[1] + dy]; item.p2 = [this.drag.orig.p2[0] + dx, this.drag.orig.p2[1] + dy]; }
    } else if (this.drag.idx === 'p1' || this.drag.idx === 'p2') {
      item[this.drag.idx] = p;
      this.showLoupe(e, p);
    } else {
      item.points[+this.drag.idx] = p;
      this.showLoupe(e, p);
    }
    this.drawOverlay();
  },

  onPointerUp() {
    if (!this.drag) return;
    const moved = this.drag.idx !== 'all' || this.drag.moved;
    this.drag = null;
    this.hideLoupe();
    if (moved) this.changed();
  },

  // === Лупа: увеличенный участок фото над пальцем, чтобы точно попасть в угол ===
  showLoupe(e, p) {
    const loupe = document.getElementById('editor-loupe');
    const stage = document.getElementById('editor-stage');
    if (!loupe || !stage) return;
    p = p || this.toImageCoords(e);
    const size = 120, zoom = 2.5;
    const ctx = loupe.getContext('2d');
    loupe.width = size;
    loupe.height = size;
    const svgRect = document.getElementById('editor-overlay').getBoundingClientRect();
    const k = (svgRect.width / this.design.w) * zoom; // пикселей экрана на пиксель фото
    const src = size / k;
    ctx.drawImage(this.photo, p[0] - src / 2, p[1] - src / 2, src, src, 0, 0, size, size);
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2 - 14); ctx.lineTo(size / 2, size / 2 + 14);
    ctx.moveTo(size / 2 - 14, size / 2); ctx.lineTo(size / 2 + 14, size / 2);
    ctx.stroke();
    const stageRect = stage.getBoundingClientRect();
    const x = e.clientX - stageRect.left, y = e.clientY - stageRect.top;
    loupe.style.left = `${Math.min(stageRect.width - size, Math.max(0, x - size / 2))}px`;
    loupe.style.top = `${y - size - 40 < 0 ? y + 40 : y - size - 40}px`;
    loupe.hidden = false;
  },

  hideLoupe() {
    const loupe = document.getElementById('editor-loupe');
    if (loupe) loupe.hidden = true;
  },

  // === Панель настроек выбранного элемента ===
  renderPanel() {
    const panel = document.getElementById('editor-panel');
    if (!panel) return;
    const item = this.findItem(this.selectedId);

    if (!item) {
      panel.innerHTML = `<p class="editor-panel__hint">${this.design?.zones.length
        ? 'Нажмите на зону или карниз, чтобы изменить камень и узор'
        : 'Добавьте зону кнопками выше. Углы зоны перетаскивайте на углы стены на фото'}</p>`;
      return;
    }

    const chips = (field, options, current) => `
      <div class="editor-chips">
        ${Object.entries(options).map(([key, o]) => `
          <button class="editor-chip${key === current ? ' active' : ''}" data-field="${field}" data-value="${key}">${o.name}</button>
        `).join('')}
      </div>`;

    const remove = `<button class="btn btn-ghost editor-remove" data-action="remove">Удалить</button>`;

    if (item.p1) {
      panel.innerHTML = `
        <div class="editor-panel__title">Карниз / пояс ${remove}</div>
        ${chips('type', BAND_TYPES, item.type)}
        <div class="editor-panel__label">Цвет</div>
        ${chips('color', BAND_COLORS, item.color)}
        <div class="editor-panel__label">Толщина</div>
        ${chips('scale', { 0.7: { name: 'Тонкий' }, 1: { name: 'Средний' }, 1.4: { name: 'Толстый' } }, String(item.scale))}
      `;
      return;
    }

    if (item.type === 'opening') {
      panel.innerHTML = `
        <div class="editor-panel__title">Проём ${remove}</div>
        <p class="editor-panel__hint">Окно или дверь: внутри проёма фото остаётся как есть. Поставьте углы по краям проёма.</p>
      `;
      return;
    }

    const query = (this.materialQuery || '').toLowerCase();
    const list = this.materialList.filter(m => !query || m.name.toLowerCase().includes(query));
    const current = this.materials[item.materialId];

    panel.innerHTML = `
      <div class="editor-panel__title">${ZONE_TYPES[item.type].name}: <span class="editor-panel__material">${current?.name || 'камень не выбран'}</span> ${remove}</div>
      ${chips('type', { wall: ZONE_TYPES.wall, base: ZONE_TYPES.base, reveal: ZONE_TYPES.reveal }, item.type)}
      <input class="input editor-search" type="search" placeholder="Поиск камня" value="${(this.materialQuery || '').replace(/[&"<>]/g, c => `&#${c.charCodeAt(0)};`)}">
      <div class="editor-materials">
        ${list.map(m => `
          <button class="editor-material${m.id === item.materialId ? ' active' : ''}" data-material="${m.id}">
            <img src="${m.texture}" alt="" loading="lazy">
            <span>${m.name}</span>
          </button>
        `).join('') || '<p class="editor-panel__hint">Ничего не найдено</p>'}
      </div>
      <div class="editor-panel__label">Узор кладки</div>
      ${chips('pattern', PATTERNS, item.pattern)}
      <div class="editor-panel__label">Размер камня</div>
      ${chips('size', STONE_SIZES, item.size)}
      ${item.pattern === 'smooth' ? '' : `<div class="editor-panel__label">Шов</div>${chips('joint', JOINTS, item.joint)}`}
    `;

    // Выбранный камень — в зоне видимости ленты
    panel.querySelector('.editor-material.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });

    const search = panel.querySelector('.editor-search');
    search.addEventListener('input', () => {
      this.materialQuery = search.value;
      const pos = search.selectionStart;
      this.renderPanel();
      const again = document.querySelector('#editor-panel .editor-search');
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  },

  onPanelClick(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action === 'remove') return this.removeSelected();
    if (btn.dataset.material) return this.updateSelected({ materialId: btn.dataset.material });
    if (btn.dataset.field) {
      const value = btn.dataset.field === 'scale' ? parseFloat(btn.dataset.value) : btn.dataset.value;
      this.updateSelected({ [btn.dataset.field]: value });
    }
  },

  // Удержание кнопки «До» показывает исходное фото
  showOriginal(on) {
    this.showingOriginal = on;
    const ctx = document.getElementById('editor-canvas').getContext('2d');
    ctx.drawImage(on || !this.lastPreview ? this.preview : this.lastPreview, 0, 0);
  },

  async finish() {
    const fills = this.design.zones.filter(z => z.type !== 'opening');
    if (!fills.length) {
      showToast('Добавьте хотя бы одну зону с камнем');
      return;
    }
    const btn = document.getElementById('editor-done');
    btn.disabled = true;
    btn.textContent = 'Рисую…';
    try {
      const result = await FacadeRender.render(this.photo, this.design, this.materials);
      ProjectFlow.state.sketch = result.toDataURL('image/jpeg', 0.9);
      Router.navigateTo('sketch');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Готово';
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;

    const svg = document.getElementById('editor-overlay');
    svg.addEventListener('pointerdown', e => this.onPointerDown(e));
    svg.addEventListener('pointermove', e => this.onPointerMove(e));
    svg.addEventListener('pointerup', () => this.onPointerUp());
    svg.addEventListener('pointercancel', () => this.onPointerUp());

    document.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.add === 'band') this.addBand();
        else this.addZone(btn.dataset.add);
      });
    });

    document.getElementById('editor-panel').addEventListener('click', e => this.onPanelClick(e));
    document.getElementById('editor-back').addEventListener('click', () => Router.navigateTo('photo'));
    document.getElementById('editor-done').addEventListener('click', () => this.finish());

    const before = document.getElementById('editor-before');
    before.addEventListener('pointerdown', () => this.showOriginal(true));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => before.addEventListener(ev, () => this.showOriginal(false)));
  },
};

// === Экран: Разметка ===
function onScreenEditor() {
  Editor.open();
}

// === Экран: Набросок (результат) ===
const Sketch = {
  bound: false,

  open() {
    const sketch = ProjectFlow.state.sketch;
    if (!sketch || !Editor.photo) {
      Router.navigateTo(ProjectFlow.getState('originalPhoto') ? 'editor' : 'photo');
      return;
    }
    this.bind();
    document.getElementById('sketch-after').src = sketch;
    document.getElementById('sketch-before').src = Editor.photo.toDataURL('image/jpeg', 0.88);
    document.getElementById('sketch-slider').value = 50;
    this.setSplit(50);
    this.renderSummary();
  },

  setSplit(value) {
    document.getElementById('sketch-before-wrap').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    document.getElementById('sketch-divider').style.left = `${value}%`;
  },

  renderSummary() {
    const design = ProjectFlow.getState('design');
    const box = document.getElementById('sketch-summary');
    box.innerHTML = summarizeDesign(design, Editor.materials);
  },

  async blob() {
    const res = await fetch(ProjectFlow.state.sketch);
    return res.blob();
  },

  async share() {
    const blob = await this.blob();
    const file = new File([blob], 'fasad-nabrosok.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Набросок фасада', text: 'Набросок фасада — Fasad AI' });
      } catch (e) {
        if (e.name !== 'AbortError') showToast('Не удалось поделиться');
      }
    } else {
      downloadImage(ProjectFlow.state.sketch, 'fasad-nabrosok.jpg');
    }
  },

  async saveProject() {
    if (!Auth.isLoggedIn()) {
      showAuthModal();
      showToast('Войдите, чтобы сохранить проект');
      return;
    }
    const btn = document.getElementById('sketch-save');
    btn.disabled = true;
    try {
      const original = await (await fetch(Editor.photo.toDataURL('image/jpeg', 0.88))).blob();
      const up1 = await Api.uploadImage(new File([original], 'original.jpg', { type: 'image/jpeg' }));
      const up2 = await Api.uploadImage(new File([await this.blob()], 'sketch.jpg', { type: 'image/jpeg' }), 'generated');
      const now = new Date();
      const project = await Api.createProject({
        name: `Фасад ${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`,
        original_image: up1.data.url,
        generated_image: up2.data.url,
        design: ProjectFlow.getState('design'),
      });
      ProjectFlow.clearDraft();
      showToast('Проект сохранён');
      openProject(project.data.id);
    } catch (e) {
      if ((e.message || '').includes('Не авторизован')) {
        Auth._user = null;
        showAuthModal();
      }
      showToast(e.message || 'Не удалось сохранить проект');
    } finally {
      btn.disabled = false;
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    const slider = document.getElementById('sketch-slider');
    slider.addEventListener('input', () => this.setSplit(slider.value));
    document.getElementById('sketch-back').addEventListener('click', () => Router.navigateTo('editor'));
    document.getElementById('sketch-edit').addEventListener('click', () => Router.navigateTo('editor'));
    document.getElementById('sketch-share').addEventListener('click', () => this.share());
    document.getElementById('sketch-download').addEventListener('click', () => downloadImage(ProjectFlow.state.sketch, 'fasad-nabrosok.jpg'));
    document.getElementById('sketch-save').addEventListener('click', () => this.saveProject());
  },
};

function onScreenSketch() {
  Sketch.open();
}

// Список зон и камней для экрана результата и карточки проекта
function summarizeDesign(design, materials) {
  if (!design || !design.zones) return '';
  const rows = design.zones
    .filter(z => z.type !== 'opening')
    .map(z => {
      const m = materials[z.materialId];
      const details = [PATTERNS[z.pattern]?.name, STONE_SIZES[z.size]?.name?.toLowerCase(),
        z.pattern === 'smooth' ? null : 'шов ' + (JOINTS[z.joint]?.name || '').toLowerCase()].filter(Boolean).join(', ');
      return `
        <div class="project-details__item">
          <span class="project-details__label">${ZONE_TYPES[z.type].name}</span>
          <span class="project-details__value">${m?.name || 'Камень'}<br><small>${details}</small></span>
        </div>`;
    });
  design.bands.forEach(b => rows.push(`
    <div class="project-details__item">
      <span class="project-details__label">${BAND_TYPES[b.type]?.name || 'Карниз'}</span>
      <span class="project-details__value">${BAND_COLORS[b.color]?.name || ''}</span>
    </div>`));
  return rows.join('');
}
