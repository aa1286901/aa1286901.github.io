// === Страница проекта: варианты одного фасада ===
// Одно фото — несколько вариантов подбора, у каждого своя картинка от ИИ.
// Фото: картинка варианта; «До и после» включает ползунок; нажатие — на весь экран с увеличением.

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
    const task = aiTask(design, stones, catalog);
    return Api.projectVariant(projectId, 'generate', { variant_id: variantId, ...task });
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
    this.renderHead(v);
    this.renderActions(v);
    this.renderStrip();
    const box = document.getElementById('project-details');
    const rows = summarizeDesign(v?.design, this.stones, this.catalog);
    box.innerHTML = (rows || '<p class="configure-hint">У этого варианта нет подбора.</p>') + `
      <div class="project-details__item">
        <span class="project-details__label">Вариант создан</span>
        <span class="project-details__value">${formatFullDate(v?.created_at || p.created_at)}</span>
      </div>`;
    recolorSpec(box, this.stones, this.catalog);
  },

  // Фото варианта; без картинки ИИ — фото заказчика с подписью
  renderPhoto(v) {
    const box = document.getElementById('project-photo');
    const photo = this.project.original_image;
    const img = v?.generated_image;
    const slider = this.slider && img;
    const note = this.busy(v) ? 'ИИ рисует картинку — обычно 30–90 секунд'
      : img ? '' : v?.ai?.status === 'failed' ? v.ai.error : 'Нажмите «Сгенерировать» — ИИ нарисует облицовку на этом фото';
    box.innerHTML = `
      <div class="photo__frame${slider ? ' photo__frame--slider' : ''}" style="--cut:50%">
        <img class="photo__img" src="${slider ? photo : img || photo}" alt="">
        ${slider ? `<img class="photo__img photo__after" src="${img}" alt="">
          <span class="photo__handle"></span>
          <span class="photo__label photo__label--a">До</span><span class="photo__label photo__label--b">После</span>` : ''}
        ${note ? `<span class="photo__note">${esc(note)}</span>` : ''}
        ${this.busy(v) ? '<span class="photo__busy"></span>' : ''}
      </div>
      <div class="photo__tools">
        ${img ? `<button class="photo__tool${slider ? ' active' : ''}" id="photo-slider" aria-pressed="${!!slider}">
          ${icon('compare')}До и после</button>` : ''}
        <button class="photo__tool" id="photo-zoom">${icon('zoom-in')}Увеличить</button>
      </div>`;
    const frame = box.querySelector('.photo__frame');
    if (slider) bindSlider(frame);
    else frame.addEventListener('click', () => this.openViewer());
    document.getElementById('photo-zoom').addEventListener('click', () => this.openViewer());
    document.getElementById('photo-slider')?.addEventListener('click', () => {
      this.slider = !this.slider;
      this.renderPhoto(this.variant(this.sel));
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
    const n = this.index(this.sel);
    const state = this.busy(v) ? ['busy', 'ИИ рисует…'] : v?.generated_image ? ['done', 'Готово']
      : v?.ai?.status === 'failed' ? ['failed', 'Не получилось'] : ['wait', 'Без картинки'];
    document.getElementById('variant-head').innerHTML = `
      <b>Вариант ${n}</b><span class="variant-state variant-state--${state[0]}">${state[1]}</span>`;
  },

  renderStrip() {
    const vs = this.project.variants || [];
    document.getElementById('project-variants-title').textContent = `Варианты (${vs.length})`;
    document.getElementById('project-variants').innerHTML = vs.map((v, i) => `
        <button class="variant${v.id === this.sel ? ' active' : ''}" data-variant="${v.id}">
          <span class="variant__img"><img src="${v.generated_image || this.project.original_image}" alt="" loading="lazy">
            ${this.busy(v) ? '<span class="variant__wait variant__wait--busy">рисует…</span>'
              : v.generated_image ? '' : v.ai?.status === 'failed' ? '<span class="variant__wait variant__wait--failed">ошибка</span>' : '<span class="variant__wait">без ИИ</span>'}</span>
          <span class="variant__name">Вариант ${i + 1}</span>
        </button>`).join('') + `
      <button class="variant variant--new" data-variant-new>
        <span class="variant__img"><span>＋</span></span><span class="variant__name">Новый</span>
      </button>`;
    document.querySelector('#project-variants .active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  },

  renderActions(v) {
    const gen = document.getElementById('project-generate');
    gen.querySelector('span').textContent = this.busy(v) ? 'ИИ рисует…' : v?.generated_image ? 'Перерисовать' : 'Сгенерировать';
    gen.disabled = this.busy(v);
    document.getElementById('project-download').disabled = !v?.generated_image;
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
    document.getElementById('project-edit').addEventListener('click', () => this.edit(false));
    document.getElementById('project-generate').addEventListener('click', async (e) => {
      const v = this.variant(this.sel);
      if (!v || this.busy(v)) return;
      e.currentTarget.disabled = true;
      try {
        const res = await this.generate(this.project.id, v.id, v.design);
        this.project.variants = res.data.variants;
        showToast('ИИ начал рисовать — обычно 30–90 секунд');
      } catch (err) {
        showToast(err.message || 'Не удалось запустить генерацию');
      }
      this.render();
      this.watch();
    });
    document.getElementById('project-download').addEventListener('click', () => {
      const v = this.variant(this.sel);
      if (v?.generated_image) downloadImage(v.generated_image, `fasad-${this.project.id}-variant-${this.index(this.sel)}.jpg`);
    });
    document.getElementById('project-share').addEventListener('click', () => {
      const v = this.variant(this.sel);
      shareProject(this.project.name, v?.generated_image || this.project.original_image);
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
  if (design?.version === 5) return JSON.parse(JSON.stringify(design));
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
const AI_PART_TEXT = {
  topCornice: 'Crowning cornice along the top of the walls, right under the roof eaves',
  floorCornice: 'Interfloor cornice: a horizontal band between the floors',
  baseCornice: 'Plinth moulding: a horizontal band on top of the plinth',
  dentils: 'Dentils (row of small rectangular blocks) right under the crowning cornice',
  frame: 'Window surrounds: a moulded frame around every window',
  sill: 'Stone window sill under every window',
  keystone: 'Keystone at the top centre of every window surround',
  console: 'Small consoles (brackets) under every window sill',
  corners: 'Quoins: alternating rusticated stone blocks on every corner of the building',
  column: 'Columns or pilasters at the entrance',
  capital: 'Capitals and bases on those columns or pilasters',
  baluster: 'Balusters of a stone balustrade on the porch or balcony, only if the building has one',
  post: 'Pedestals of that balustrade',
  rail: 'Handrail of that balustrade',
  finial: 'Finials on the balustrade pedestals',
};
const AI_LAYOUT = { running: 'running bond (each row offset by half a tile)', stack: 'stack bond (joints aligned)', random: 'random bond' };
const AI_JOINT = { light: 'light', grey: 'grey', dark: 'dark' };
const AI_SURFACE = { sawn: 'smooth sawn', split: 'rough split (rock-face)' };

function aiTask(design, stones, catalog) {
  const spec = upgradeDesign(design, stones);
  const m = spec.materials;
  const refs = [];
  // Номер образца в задании; модель берёт не больше 10 картинок — лишние образцы описываем только словами
  const ref = (path) => {
    let i = refs.indexOf(path);
    if (i < 0 && refs.length < 9) { refs.push(path); i = refs.length - 1; }
    return i < 0 ? null : i + 2;  // картинка 1 — фото
  };
  const stone = (id) => {
    const s = stones.find(x => x.id === id);
    if (!s) return 'natural stone';
    const n = ref(s.texture);
    return `${n ? `the stone shown in image ${n}` : 'natural stone'} ("${s.name}", colour ${s.color})`;
  };
  const tile = (t) => {
    const [h, w] = t.format.split('x');
    return `${AI_SURFACE[t.surface] || 'sawn'} tiles ${h} mm high and ${w} mm long, laid in ${AI_LAYOUT[t.layout] || 'running bond'} with ${AI_JOINT[t.joint] || 'light'} joints`;
  };
  const lines = [`- Walls: ${stone(m.main.stone)}, ${tile(m.main)}.`];
  lines.push(m.base.on
    ? `- Plinth (the lowest band of the walls, from the ground up to the ground-floor level, about 0.6–1 m): ${stone(m.base.stone)}, ${tile(m.base)}.`
    : '- No separate plinth: the wall stone goes down to the ground.');
  PATTERN_ROWS.forEach(r => {
    const part = spec.parts[r.key];
    const v = catalog.variants[part?.item];
    if (!v) return;
    const material = stone(resolveStone(spec, part.stone));
    const n = v.image && ref(v.image.replace('assets/catalog/', 'assets/ai/').replace(/\.webp$/, '.jpg'));
    lines.push(`- ${AI_PART_TEXT[r.key]}${n ? `, with the shape and profile of the product in image ${n}` : ''}, made of ${material}.`);
  });
  const prompt = [
    'Image 1 is a photo of a building. Edit this photo: clad the facade in natural stone according to the specification below.',
    'Keep everything else exactly as in image 1: the same camera angle and framing, the same building shape and proportions, the same number, position and size of windows and doors, the same roof, steps, fence, people, cars, street, sky and lighting. Do not add or remove windows, doors, floors or any objects.',
    'The other images are only samples of stone texture and product shapes; use the product images for their shape, but always render them in the stone named in the specification.',
    'Specification:',
    ...lines,
    'Result: a photorealistic photo of the same building with a finished natural stone facade, real stone texture and thin joints, the same daylight as in the original photo.',
  ].join('\n');
  return { prompt, refs };
}
