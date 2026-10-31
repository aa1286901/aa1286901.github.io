// === Страница проекта: варианты одного фасада ===
// Одно фото — несколько вариантов подбора, у каждого своя картинка от ИИ.
// Фото: картинка варианта; «До и после» включает ползунок; нажатие — на весь экран с увеличением.

// Чем рисовать: прораб выбирает сам, выбор запоминается на телефоне.
// refs — сколько образцов отправлять. GPT Image 2.5 (Sunburst и Flare) с полным заданием и образцами изделий
// на kie.ai падает с «500 Internal Error», GPT Image 1.5 — «Inappropriate content»; GPT Image 2 рисует всё
const AI_MODELS = [
  { id: 'nano-banana-2-1', name: 'Nano Banana', note: '~30 с', coins: 1, refs: 15, wait: 'обычно 30–60 секунд' },
  { id: 'gpt-image-2-image-to-image', name: 'ChatGPT Image', note: '~2 мин', coins: 2, refs: 15, wait: 'обычно 1–2 минуты' },
];

const AiChoice = {
  get() {
    let id = null;
    try { id = localStorage.getItem('fasad-ai-model'); } catch (e) { /* без хранилища — по умолчанию */ }
    if (id === 'gpt-image-2-5-sunburst-image-to-image') id = 'gpt-image-2-image-to-image';  // кто выбирал GPT 2.5 — теперь GPT 2
    return AI_MODELS.some(m => m.id === id) ? id : AI_MODELS[0].id;
  },
  set(id) {
    try { localStorage.setItem('fasad-ai-model', id); } catch (e) { /* не запомнится — не страшно */ }
    this.render();
  },
  wait(id) {
    return AI_MODELS.find(m => m.id === id)?.wait || 'обычно 30–90 секунд';
  },
  name(id) {
    return AI_MODELS.find(m => m.id === id)?.name || '';
  },
  // Сколько монет стоит генерация выбранной моделью
  cost(id = this.get()) {
    return AI_MODELS.find(m => m.id === id)?.coins || 1;
  },
  // «· 1 🪙» на кнопке генерации
  costHtml() {
    return `<small class="btn-cost">${this.cost()}${coin('plain')}</small>`;
  },
  // Переключатель моделей: над «Нарисовать фасад» и над «Перерисовать»
  html() {
    const cur = this.get();
    return `<div class="ai-pick__top"><span class="ai-pick__label">${icon('sparkle')}Чем рисовать</span>${Wallet.chip()}</div>
      <div class="ai-pick__seg">${AI_MODELS.map(m => `
        <button class="${m.id === cur ? 'active' : ''}" data-ai-model="${m.id}"><b>${m.name}</b>
          <small>${coin('plain')}${m.coins} ${coinsWord(m.coins)} · ${m.note}</small></button>`).join('')}</div>`;
  },
  render() {
    // Цена на кнопках генерации
    if (ProjectPage.project && document.getElementById('project-main')) ProjectPage.renderMain(ProjectPage.variant(ProjectPage.sel));
  },
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-ai-model]');
  if (b) AiChoice.set(b.dataset.aiModel);
});

const ProjectPage = {
  project: null,
  sel: null,         // id выбранного варианта
  slider: false,     // ползунок «до / после» включён

  async load(id, selectId) {
    const res = await Api.getProject(id);
    this.project = res.data;
    const vs = this.project.variants || [];
    this.sel = vs.some(v => v.id === selectId) ? selectId : vs[vs.length - 1]?.id;
    this.slider = false;
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    this.stones = stones;
    this.catalog = catalog;
    this.bind();
    this.render();
    this.watch();
    Wallet.load();
  },

  variant(id) {
    return (this.project.variants || []).find(v => v.id === id);
  },

  index(id) {
    return (this.project.variants || []).findIndex(v => v.id === id) + 1;
  },

  busy(v) {
    return v?.ai?.status === 'processing';
  },

  // Поставить генерацию варианта: задание собирается из его подбора
  async generate(projectId, variantId, design) {
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    const task = aiTask(design, stones, catalog, AI_MODELS.find(m => m.id === AiChoice.get())?.refs);
    const res = await Api.projectVariant(projectId, 'generate', { variant_id: variantId, model: AiChoice.get(), ...task });
    Wallet.set(res.data.wallet);
    return res;
  },

  // Пока ИИ рисует — раз в 5 секунд спрашиваем сервер; готовая картинка сразу появляется
  watch() {
    clearTimeout(this.timer);
    if (!(this.project.variants || []).some(v => this.busy(v))) return;
    const id = this.project.id;
    this.timer = setTimeout(async () => {
      if (this.project?.id !== id || !document.getElementById('project-photo').offsetParent) return;
      try {
        const before = this.project.variants;
        const res = await Api.projectVariant(id, 'poll');
        this.project.variants = res.data.variants;
        Wallet.set(res.data.wallet);  // неудачная генерация вернула монеты
        const was = v => this.busy(before.find(b => b.id === v.id));
        const done = res.data.variants.find(v => v.ai?.status === 'done' && was(v));
        const failed = res.data.variants.find(v => v.ai?.status === 'failed' && was(v));
        if (done) showToast(`Вариант ${this.index(done.id)} готов`);
        if (failed) showToast(failed.ai.error || 'ИИ не смог нарисовать');
        if (done || failed) this.render();
      } catch (e) {
        // Сеть пропала — спросим ещё раз
      }
      this.watch();
    }, 5000);
  },

  render() {
    const p = this.project;
    const v = this.variant(this.sel);
    document.getElementById('project-title').textContent = p.name || 'Проект';
    this.renderPhoto(v);
    this.renderStrip();
    this.renderHead(v);
    this.renderMain(v);
    this.renderChosen(v);
    const box = document.getElementById('project-details');
    const rows = summarizeDesign(v?.design, this.stones, this.catalog);
    box.innerHTML = (rows || '<p class="configure-hint">У этого варианта нет подбора.</p>') + `
      <div class="project-details__item">
        <span class="project-details__label">Вариант создан</span>
        <span class="project-details__value">${formatFullDate(v?.created_at || p.created_at)}</span>
      </div>`;
    recolorSpec(box, this.stones, this.catalog);
  },

  // Заголовок свёрнутого «Что выбрано»: образцы камня и сколько позиций
  renderChosen(v) {
    const spec = upgradeDesign(v?.design, this.stones);
    const lines = specLines(v?.design, this.stones, this.catalog).filter(l => l[0] !== 'fit');
    const m = spec.materials;
    const swatch = id => this.stones.find(s => s.id === id)?.texture;
    const sw = [swatch(m.main.stone), m.base.on ? swatch(m.base.stone) : null].filter(Boolean);
    document.getElementById('project-chosen-head').innerHTML = `
      <span class="chosen__sw">${sw.map(src => `<img src="${src}" alt="">`).join('')}</span>
      <span class="chosen__text"><b>Что выбрано</b><small>${lines.length ? `${lines.length} ${plural(lines.length, 'позиция', 'позиции', 'позиций')} · камень и узоры` : 'подбор не сохранён'}</small></span>
      <span class="chosen__arrow" aria-hidden="true"></span>`;
  },

  // Фото варианта. Поверх — «До / После» и «на весь экран»; нажатие на фото тоже открывает его целиком
  renderPhoto(v) {
    const box = document.getElementById('project-photo');
    const photo = this.project.original_image;
    const img = v?.generated_image;
    const slider = this.slider && img;
    const note = this.busy(v) ? '' : img ? '' : v?.ai?.status === 'failed' ? v.ai.error : 'Это фото без облицовки — нажмите «Нарисовать фасад»';
    box.innerHTML = `
      <div class="photo__frame${slider ? ' photo__frame--slider' : ''}" style="--cut:50%">
        <img class="photo__img" src="${slider ? photo : img || photo}" alt="">
        ${slider ? `<img class="photo__img photo__after" src="${img}" alt="">
          <span class="photo__handle"></span>
          <span class="photo__label photo__label--a">До</span><span class="photo__label photo__label--b">После</span>` : ''}
        ${note ? `<span class="photo__note">${esc(note)}</span>` : ''}
        ${this.busy(v) ? '<span class="photo__busy"></span>' : ''}
        ${img ? `<button class="photo__pill${slider ? ' active' : ''}" id="photo-slider">${icon('compare')}${slider ? 'Скрыть «до»' : 'До / После'}</button>` : ''}
        <button class="photo__round" id="photo-zoom" aria-label="На весь экран">${icon('fit')}</button>
      </div>`;
    const frame = box.querySelector('.photo__frame');
    if (slider) bindSlider(frame);
    frame.addEventListener('click', (e) => {
      if (e.target.closest('#photo-slider')) {
        e.stopPropagation();
        this.slider = !this.slider;
        return this.renderPhoto(this.variant(this.sel));
      }
      if (e.target.closest('#photo-zoom') || !slider) this.openViewer();
    });
  },

  // На весь экран: картинка варианта или фото «до», с увеличением пальцами
  openViewer() {
    const v = this.variant(this.sel);
    const shots = [];
    if (v?.generated_image) shots.push({ label: 'После', src: v.generated_image });
    shots.push({ label: 'До', src: this.project.original_image });
    openPhotoViewer(shots, `Вариант ${this.index(this.sel)}`);
  },

  renderHead(v) {
    const n = this.index(this.sel), all = (this.project.variants || []).length;
    const state = this.busy(v) ? ['busy', 'ИИ рисует…'] : v?.generated_image ? ['done', 'Готово']
      : v?.ai?.status === 'failed' ? ['failed', 'Не получилось'] : ['wait', 'Без облицовки'];
    document.getElementById('variant-head').innerHTML = `
      <b>Вариант ${n}${all > 1 ? `<small> из ${all}</small>` : ''}</b><span class="variant-state variant-state--${state[0]}">${state[1]}</span>`;
  },

  aiName(v) {
    return AiChoice.name(v?.ai?.model) || (v?.ai?.model ? 'ИИ' : '');
  },

  // Лента вариантов сразу под фото — как галерея
  renderStrip() {
    const vs = this.project.variants || [];
    document.getElementById('project-variants').innerHTML = vs.map((v, i) => `
        <button class="variant${v.id === this.sel ? ' active' : ''}" data-variant="${v.id}" aria-label="Вариант ${i + 1}">
          <span class="variant__img"><img src="${v.generated_image || this.project.original_image}" alt="" loading="lazy">
            ${this.busy(v) ? '<span class="variant__wait variant__wait--busy">…</span>'
              : v.ai?.status === 'failed' && !v.generated_image ? '<span class="variant__wait variant__wait--failed">!</span>' : ''}
            <span class="variant__num">${i + 1}</span></span>
        </button>`).join('') + `
      <button class="variant variant--new" data-variant-new aria-label="Новый вариант">
        <span class="variant__img"><span>＋</span></span>
      </button>`;
    document.querySelector('#project-variants .active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  },

  // Одна главная кнопка по ситуации: нарисовать → отправить заказчику; пока рисует — только ожидание
  renderMain(v) {
    const box = document.getElementById('project-main');
    const img = v?.generated_image;
    let main;
    if (this.busy(v)) {
      main = `<div class="main-busy"><span class="spinner"></span><div><b>ИИ рисует фасад</b>
        <small>${AiChoice.wait(v.ai.model)} · можно выйти, картинка сохранится</small></div></div>`;
    } else if (img) {
      ImageFiles.prepare(img, `fasad-${this.project.id}-variant-${this.index(v.id)}.jpg`);  // для «Скачать» и «Отправить»
      // Готово: главное — отправить; ниже тот же выбор ИИ с «Перерисовать»
      // Готово: два главных действия — смета для заказчика и сама картинка
      main = `<div class="main-pair">
          <button class="btn btn-primary main-btn" data-act="kp">${icon('calc')}Собрать смету</button>
          <button class="btn main-btn main-btn--ink" data-act="send">${icon('share')}Отправить дизайн</button>
        </div>
        <div class="main-gen">
          <div class="ai-pick" data-ai-pick>${AiChoice.html()}</div>
          <button class="btn btn-secondary btn-full" data-act="generate">${icon('sparkle')}Перерисовать ${AiChoice.costHtml()}</button>
        </div>`;
    } else {
      // Выбор модели прямо над кнопкой: цена на кнопке меняется вместе с ним
      main = `<div class="main-gen">
          <div class="ai-pick" data-ai-pick>${AiChoice.html()}</div>
          <button class="btn btn-primary btn-full main-btn" data-act="generate">${icon('sparkle')}Нарисовать фасад ${AiChoice.costHtml()}</button>
        </div>`;
    }
    box.innerHTML = `${main}
      <div class="main-row">
        <button class="btn btn-secondary" data-act="edit">${icon('edit')}Изменить камень</button>
        <button class="btn btn-secondary" data-act="more">${icon('dots')}Ещё</button>
      </div>`;
  },

  async runGenerate() {
    const v = this.variant(this.sel);
    if (!v || this.busy(v)) return;
    try {
      const res = await this.generate(this.project.id, v.id, v.design);
      this.project.variants = res.data.variants;
      showToast(`ИИ начал рисовать — ${AiChoice.wait(AiChoice.get())}`);
    } catch (err) {
      if (!Wallet.handleError(err)) showToast(err.message || 'Не удалось запустить генерацию');
    }
    this.render();
    this.watch();
  },

  // Что отправить: картинку или коммерческое предложение со сметой
  share() {
    const v = this.variant(this.sel);
    showModal(`
      <div class="sheet-list">
        <h3 class="sheet-title">Отправить заказчику</h3>
        <button class="sheet-item" data-send="kp">${icon('edit')}<span><b>Коммерческое предложение</b><small>PDF: фото, смета, сроки и ваши контакты</small></span></button>
        <button class="sheet-item" data-send="image">${icon('gallery')}<span><b>Только картинку</b><small>фото «после» в мессенджер</small></span></button>
      </div>`);
    document.querySelector('.sheet-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-send]');
      if (!b) return;
      closeModal();
      if (b.dataset.send === 'kp') KP.open(this.project.id, v?.id);
      else shareProject(this.project.name, v?.generated_image || this.project.original_image);
    });
  },

  // «Ещё»: редкие действия коротким списком, удаление — отдельно и красным
  openMore() {
    const v = this.variant(this.sel);
    const img = v?.generated_image;
    const many = (this.project.variants || []).length > 1;
    const item = (act, ic, text, danger) => `
      <button class="sheet-item${danger ? ' sheet-item--danger' : ''}" data-more="${act}">${icon(ic)}<b>${text}</b></button>`;
    showModal(`
      <div class="sheet-list sheet-list--compact">
        ${img ? item('download', 'download', 'Сохранить в Фото') : ''}
        ${item('kp', 'share', 'Смета и КП заказчику')}
        ${item('new', 'plus', 'Новый вариант')}
        ${item('rename', 'edit', 'Переименовать проект')}
        <div class="sheet-sep"></div>
        ${many ? item('delete-variant', 'trash', `Удалить вариант ${this.index(this.sel)}`, true) : ''}
        ${item('delete', 'trash', 'Удалить проект', true)}
      </div>`);
    document.querySelector('.sheet-list').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-more]');
      if (!b) return;
      closeModal();
      const act = b.dataset.more;
      if (act === 'download') saveImage(img, `fasad-${this.project.id}-variant-${this.index(this.sel)}.jpg`);
      if (act === 'kp') KP.open(this.project.id, v?.id);
      if (act === 'new') this.edit(false);
      if (act === 'rename') {
        const name = await showPrompt('Название проекта', this.project.name, 'Сохранить');
        if (!name || name === this.project.name) return;
        try {
          await Api.renameProject(this.project.id, name);
          this.project.name = name;
          document.getElementById('project-title').textContent = name;
          showToast('Проект переименован');
        } catch (err) {
          showToast(err.message || 'Не удалось переименовать');
        }
      }
      if (act === 'delete-variant') {
        const n = this.index(this.sel);
        const ok = await showConfirm(`Удалить вариант ${n}?`, 'Подбор камня и картинка этого варианта удалятся, остальные варианты останутся.', 'Удалить');
        if (!ok) return;
        try {
          const res = await Api.projectVariant(this.project.id, 'delete', { variant_id: this.sel });
          this.project.variants = res.data.variants;
          const vs = this.project.variants;
          this.sel = (vs[Math.min(n - 1, vs.length - 1)] || vs[0])?.id;  // соседний вариант
          this.render();
          showToast(`Вариант ${n} удалён`);
        } catch (err) {
          showToast(err.message || 'Не удалось удалить вариант');
        }
      }
      if (act === 'delete') {
        const ok = await showConfirm('Удалить проект?', `«${esc(this.project.name || 'Проект')}» и все его варианты удалятся. Это нельзя отменить.`, 'Удалить');
        if (!ok) return;
        try {
          await Api.deleteProject(this.project.id);
          showToast('Проект удалён');
          Router.navigateTo('projects');
        } catch (err) {
          showToast(err.message || 'Не удалось удалить проект');
        }
      }
    });
  },

  // Изменить подбор выбранного варианта; сохранение даст новый вариант
  edit(fromScratch) {
    const v = this.variant(this.sel);
    const design = fromScratch ? Configurator.newSpec() : upgradeDesign(v?.design, this.stones);
    ProjectFlow.setState('originalPhoto', this.project.original_image);
    ProjectFlow.setState('editProject', { projectId: this.project.id, variantId: v?.id || null, name: this.project.name });
    ProjectFlow.setState('design', design);
    Configurator.spec = null;
    Configurator.step = 1;
    Router.navigateTo('configure');
  },

  onStrip(e) {
    if (e.target.closest('[data-variant-new]')) return this.edit(false);
    const vb = e.target.closest('[data-variant]');
    if (!vb) return;
    this.sel = +vb.dataset.variant;
    this.render();
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    document.getElementById('project-variants').addEventListener('click', e => this.onStrip(e));
    document.getElementById('project-back').addEventListener('click', () => Router.navigateTo('projects'));
    document.getElementById('project-more').addEventListener('click', () => this.openMore());
    document.getElementById('project-main').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'generate') { b.disabled = true; this.runGenerate(); }
      if (act === 'share') this.share();
      if (act === 'kp') KP.open(this.project.id, this.sel);
      if (act === 'send') {
        const v = this.variant(this.sel);
        shareProject(this.project.name, v?.generated_image || this.project.original_image);
      }
      if (act === 'edit') this.edit(false);
      if (act === 'more') this.openMore();
    });
  },
};

// Ползунок «до / после»: слева фото заказчика, справа картинка ИИ
function bindSlider(frame) {
  const set = (e) => {
    const r = frame.getBoundingClientRect();
    frame.style.setProperty('--cut', `${Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))}%`);
  };
  let dragging = false;
  frame.addEventListener('pointerdown', e => {
    dragging = true;
    set(e);
    e.preventDefault();
  });
  const move = e => { if (dragging) set(e); };
  const stop = () => { dragging = false; };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
  // Рамку перерисовали — слушатели окна больше не нужны
  new MutationObserver((_, obs) => {
    if (!frame.isConnected) {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      obs.disconnect();
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Просмотр на весь экран: увеличение двумя пальцами, колёсиком, двойным нажатием или кнопками
function openPhotoViewer(shots, title) {
  const overlay = document.createElement('div');
  overlay.className = 'viewer';
  overlay.innerHTML = `
    <div class="viewer__top">
      <span class="viewer__title">${esc(title)}</span>
      <button class="viewer__btn" data-close aria-label="Закрыть">✕</button>
    </div>
    <div class="viewer__stage"><img class="viewer__img" src="${shots[0].src}" alt="" draggable="false"></div>
    <div class="viewer__bottom">
      ${shots.length > 1 ? `<div class="viewer__seg">${shots.map((s, i) => `<button data-shot="${i}" class="${i ? '' : 'active'}">${s.label}</button>`).join('')}</div>` : ''}
      <div class="viewer__zoom">
        <button class="viewer__btn" data-zoom="-1" aria-label="Уменьшить">−</button>
        <button class="viewer__btn" data-zoom="1" aria-label="Увеличить">+</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const stage = overlay.querySelector('.viewer__stage');
  const img = overlay.querySelector('.viewer__img');
  let scale = 1, x = 0, y = 0;
  const apply = () => {
    // Не уводить картинку за край: сдвиг не больше лишнего размера
    const maxX = (img.offsetWidth * (scale - 1)) / 2, maxY = (img.offsetHeight * (scale - 1)) / 2;
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  };
  const zoomTo = (s) => { scale = Math.max(1, Math.min(6, s)); if (scale === 1) { x = 0; y = 0; } apply(); };

  const pts = new Map();
  let start = null, lastTap = 0;
  stage.addEventListener('pointerdown', e => {
    stage.setPointerCapture?.(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const now = Date.now();
    if (pts.size === 1 && now - lastTap < 300) zoomTo(scale > 1 ? 1 : 2.5);  // двойное нажатие
    lastTap = now;
    start = null;
  });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (!start) start = { d, scale };
      zoomTo(start.scale * (d / start.d));
    } else if (pts.size === 1 && scale > 1) {
      x += e.clientX - prev.x;
      y += e.clientY - prev.y;
      apply();
    }
  });
  const up = e => { pts.delete(e.pointerId); start = null; };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => { e.preventDefault(); zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2)); }, { passive: false });

  overlay.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return overlay.remove();
    const z = e.target.closest('[data-zoom]');
    if (z) return zoomTo(scale * (+z.dataset.zoom > 0 ? 1.5 : 1 / 1.5));
    const s = e.target.closest('[data-shot]');
    if (s) {
      overlay.querySelectorAll('[data-shot]').forEach(b => b.classList.toggle('active', b === s));
      img.src = shots[+s.dataset.shot].src;
    }
  });
}

// Подбор любой версии → подбор в три экрана (version 5), чтобы его можно было изменить
function upgradeDesign(design, stones) {
  if (design?.version === 5) return addMissingParts(JSON.parse(JSON.stringify(design)));
  const spec = Configurator.newSpec();
  spec.filled = true;
  Object.values(spec.parts).forEach(p => { p.item = null; });
  if (design?.version === 4) {
    spec.materials.main = { ...spec.materials.main, ...design.materials.main };
    spec.materials.base = { ...spec.materials.base, ...design.materials.base };
    PATTERN_ROWS.forEach(r => {
      spec.parts[r.key] = { item: design.parts?.[r.key] || null, stone: design.materials.groups?.[V4_GROUPS[r.key]] || DEFAULT_DECOR_STONE };
    });
    return spec;
  }
  if (design?.version === 3) {
    const P = design.parts || {};
    const tile = (k) => ['stone', 'format', 'thickness', 'edge', 'surface', 'layout', 'joint'].reduce((o, f) => (P[k]?.[f] != null ? { ...o, [f]: P[k][f] } : o), {});
    spec.materials.main = { ...spec.materials.main, ...tile('main') };
    spec.materials.base = { ...spec.materials.base, ...tile('base'), on: !!P.base?.on };
    const put = (key, from, field = 'item') => {
      if (P[from]?.on && P[from][field]) spec.parts[key] = { item: P[from][field], stone: P[from].stone || DEFAULT_DECOR_STONE };
    };
    put('topCornice', 'topCornice'); put('floorCornice', 'floorCornice'); put('baseCornice', 'baseCornice');
    put('dentils', 'dentils'); put('corners', 'corners');
    put('frame', 'windows', 'frame'); put('sill', 'windows', 'sill'); put('keystone', 'windows', 'keystone'); put('console', 'windows', 'console');
    put('column', 'columns'); put('capital', 'columns', 'capital');
    ['baluster', 'post', 'rail', 'finial'].forEach(f => put(f, 'balustrade', f));
    return spec;
  }
  spec.filled = false;  // подбора не было — пусть подставятся модели по умолчанию
  return spec;
}

// Отличия подборов: по каждой части — что было и что стало
// === Задание для ИИ: фото + образцы камня и изделий, по-английски (так модели понимают точнее) ===
// Картинка 1 — фото проекта (подставляет сервер), дальше образцы в порядке refs.
// В задании — всё, что выбрал прораб: камень, формат, толщина, фаска, поверхность, кладка, шов,
// каждое изделие с размером и своим камнем, русты на эркерах, и чего на фасаде быть не должно.
const AI_PART_TEXT = {
  topCornice: ['Crowning cornice', 'a continuous projecting cornice along the top of all walls, right under the roof eaves'],
  gableCornice: ['Gable rake cornice', 'a projecting cornice running along both sloping (raking) edges of every gable, if the building has gables'],
  floorCornice: ['Interfloor cornice', 'a continuous horizontal band at every floor level, around the whole building including bay windows'],
  baseCornice: ['Plinth moulding', 'a continuous band on top of the plinth along all walls and bay windows'],
  dentils: ['Dentils', 'a row of small rectangular blocks right under the crowning cornice'],
  frame: ['Window surrounds', 'a moulded frame around every window on all floors, including bay-window and gable windows'],
  windowCornice: ['Window cornices (hoods)', 'a short projecting moulded cornice above every window, on top of the window surround'],
  sill: ['Window sills', 'a projecting stone sill under every window'],
  keystone: ['Keystones', 'a keystone at the top centre of every window surround'],
  console: ['Consoles', 'small consoles (brackets) under every window sill'],
  corners: ['Quoins (rusticated corner blocks)', 'on every external corner of the building, alternating long and short blocks, from the plinth up to the crowning cornice, slightly projecting from the wall'],
  column: ['Columns or pilasters', 'at the entrance'],
  capital: ['Capitals and bases', 'on those columns or pilasters'],
  baluster: ['Balusters', 'of a stone balustrade on the porch or balcony, only if the building has one'],
  post: ['Balustrade pedestals', 'of that balustrade'],
  rail: ['Balustrade handrail', 'of that balustrade'],
  finial: ['Finials', 'on the balustrade pedestals'],
};
const AI_NOT_USED = {
  topCornice: 'crowning cornice', gableCornice: 'cornice along the gables', floorCornice: 'interfloor cornice', baseCornice: 'plinth moulding',
  dentils: 'dentils', frame: 'window surrounds', windowCornice: 'window cornices', sill: 'stone window sills', keystone: 'keystones',
  console: 'consoles', corners: 'quoins', column: 'columns or pilasters', capital: 'capitals', baluster: 'balustrade', post: 'balustrade pedestals',
  rail: 'balustrade handrail', finial: 'finials',
};
const AI_LAYOUT = { running: 'running bond — each row offset by half a tile', stack: 'stack bond — vertical joints aligned', random: 'random bond — tiles of the row offset irregularly' };
const AI_JOINT = { light: 'light-coloured', grey: 'grey', dark: 'dark' };
const AI_SURFACE = { sawn: 'smooth sawn', split: 'rough split (rock-face)' };
const AI_EDGE = {
  none: 'square edges without any bevel, tiles sit flush and only thin joints show',
  chamfer: '45° bevel (chamfer) on all four edges, so every tile is clearly outlined',
  convex: 'rounded (convex) edges on all four sides',
  concave: 'concave (cove) edges on all four sides',
  rabbet: 'stepped rabbet edges — a small step along all four edges',
};
const AI_STONE_TYPE = { 'Песчаник': 'sandstone', 'Известняк': 'limestone', 'Доломит': 'dolomite', 'Ракушечник': 'shell limestone (coquina)', 'Сланец': 'slate' };

// Цвет камня словами: картинковые модели плохо понимают код вида #e0d9c5
function aiColorName(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || '');
  if (!m) return '';
  const [r, g, b] = m.slice(1).map(x => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  const tone = l > 0.85 ? 'very light' : l > 0.7 ? 'light' : l > 0.45 ? 'medium' : l > 0.25 ? 'dark' : 'very dark';
  if (sat < 0.12) return l > 0.85 ? 'off-white' : `${tone} grey`;
  const hue = h < 15 || h >= 340 ? 'reddish' : h < 35 ? (l > 0.7 ? 'warm beige' : 'brownish') : h < 55 ? (l > 0.75 ? 'creamy' : 'sandy beige') : h < 75 ? 'yellowish' : h < 170 ? 'greenish' : h < 260 ? 'bluish' : 'pinkish';
  return `${tone} ${hue}`;
}

function aiTask(design, stones, catalog, maxRefs = 15) {
  const spec = upgradeDesign(design, stones);
  const m = spec.materials;
  const refs = [];
  // Номер образца в задании; сверх maxRefs образцы описываем только словами
  const ref = (path) => {
    let i = refs.indexOf(path);
    if (i < 0 && refs.length < maxRefs) { refs.push(path); i = refs.length - 1; }
    return i < 0 ? null : i + 2;  // картинка 1 — фото
  };
  const told = new Set();  // камень уже описан полностью — дальше только название и номер картинки
  const stone = (id) => {
    const s = stones.find(x => x.id === id);
    if (!s) return 'natural stone';
    const n = ref(s.texture);
    if (told.has(id)) return `"${s.name}"${n ? ` (image ${n})` : ''}, same stone as above`;
    told.add(id);
    const words = [AI_STONE_TYPE[s.type] || 'natural stone', aiColorName(s.color) && `${aiColorName(s.color)} colour`].filter(Boolean).join(', ');
    return `"${s.name}", ${words}${n ? `, exactly the stone in image ${n}` : ''}`;
  };
  const tileLines = (t, pad) => {
    const [h, w] = t.format.split('x').map(Number);
    const rows = Math.max(1, Math.round(3000 / (h + 4)));
    return [
      `${pad}- Tiles: rectangular, ${h} mm high × ${w} mm long × ${t.thickness} mm thick, long side horizontal.`,
      `${pad}- Face: ${AI_SURFACE[t.surface] || 'smooth sawn'}. Edges: ${AI_EDGE[t.edge] || AI_EDGE.chamfer}.`,
      `${pad}- Bond: ${AI_LAYOUT[t.layout] || AI_LAYOUT.running}. Joints: thin, 3–5 mm, ${AI_JOINT[t.joint] || 'light-coloured'}.`,
      `${pad}- Real scale: about ${rows} rows of tiles per 3 m of wall height. Keep this scale on the whole facade.`,
    ];
  };
  const spec1 = [
    '1. WALLS — all wall surfaces above the plinth, including bay windows and gables:',
    `   - Stone: ${stone(m.main.stone)}.`,
    ...tileLines(m.main, '   '),
  ];
  const spec2 = m.base.on ? [
    '2. PLINTH — the lowest band of the walls, from the ground up to the ground-floor level (about 0.6–1 m), on all walls and bay windows:',
    `   - Stone: ${stone(m.base.stone)}.`,
    ...tileLines(m.base, '   '),
  ] : ['2. PLINTH: no separate plinth — the wall stone goes down to the ground.'];
  const decor = [], notUsed = [];
  const erkerRust = spec.options?.erkerRust !== false;
  PATTERN_ROWS.forEach(r => {
    const part = spec.parts[r.key];
    const v = catalog.variants[part?.item];
    if (!part) return;  // части не было, когда подбор сохраняли (старый проект) — не пишем ничего
    if (!v) { notUsed.push(AI_NOT_USED[r.key]); return; }
    const [name, where] = AI_PART_TEXT[r.key];
    let place = where;
    if (r.key === 'corners') place += erkerRust ? '; also on both outer corners of every bay window, if the building has bay windows' : '; do not put quoins on bay windows';
    const n = v.image && ref(v.image.replace('assets/catalog/', 'assets/ai/').replace(/\.webp$/, '.jpg'));
    const dims = String(v.size || '').split('×').length === 3 ? ' (height × length × projection)' : '';
    const shape = n ? `Profile and shape exactly as the product in image ${n}` : `Classic ${name.toLowerCase()} profile`;
    decor.push(`   - ${name}: ${place}. ${shape}${v.size ? `, catalogue size ${v.size} mm${dims}` : ''}. Stone: ${stone(resolveStone(spec, part.stone))}.`);
  });
  const lastImg = refs.length + 1;
  const prompt = [
    'TASK: Photorealistic editing of a real photo. Image 1 is the original photo of the building. Clad its facade in natural stone exactly according to the SPECIFICATION. This is an edit of image 1, not a new picture and not a redesign.',
    '',
    'GEOMETRY — DO NOT CHANGE ANYTHING:',
    '- Same camera position, angle, lens, framing and crop as image 1.',
    '- Same building: outline, proportions, number of floors, wall heights, roof shape, roofing material and eaves overhang.',
    '- Same openings: the exact number, position, size and shape of every window, door, gate and arch. Do not add, remove, move, widen, narrow or merge any opening. Keep window frames, glass, glazing bars and doors exactly as they are.',
    '- Same projections: bay windows, gables, balconies, porches, steps — same shape and size. Do not invent new ones.',
    '- Same surroundings: ground, fence, plants, people, cars, street, sky, weather, light and shadows.',
    '- Stone decor is added only where the SPECIFICATION says, as a thin layer on the existing walls. Decor must never cover glass or change the size of an opening.',
    '',
    'REFERENCE IMAGES:',
    `- ${lastImg > 1 ? `Images 2–${lastImg} are` : 'Any other images are'} reference samples only. Stone images show the colour, grain and surface of the stone. Product images show the shape and profile of a moulding: copy the profile, but render it in the stone named in the SPECIFICATION, not in the colour of the product photo.`,
    '- Do not copy backgrounds, lighting or scale from the reference images.',
    '',
    'SPECIFICATION:',
    ...spec1,
    ...spec2,
    ...(decor.length ? ['3. DECOR — each element made exactly in the stone stated for it:', ...decor] : ['3. DECOR: none — plain stone walls only.']),
    ...(notUsed.length ? [`4. NOT USED — do not add: ${notUsed.join(', ')}.`] : []),
    '',
    'RESULT: a photorealistic daytime photo of the same building after the work is finished: real natural stone texture with slight tone variation between tiles, crisp straight joints, realistic depth and shadows under cornices and mouldings, the same light as in image 1. No text, no watermarks, no new objects.',
  ].join('\n');
  return { prompt, refs };
}
