// === Страница проекта: варианты одного фасада ===
// Одно фото — несколько вариантов подбора. У каждого своя картинка (появится после генерации ИИ).
// Ползунок «до / после», сравнение двух вариантов, «Выбран клиентом», «Изменить и сгенерировать» — новый вариант.

const ProjectPage = {
  project: null,
  sel: null,        // id выбранного варианта
  cmp: null,        // id варианта для сравнения
  comparing: false,

  async load(id, selectId) {
    const res = await Api.getProject(id);
    this.project = res.data;
    const vs = this.project.variants || [];
    const starred = vs.find(v => v.starred);
    this.sel = vs.some(v => v.id === selectId) ? selectId : (starred || vs[vs.length - 1])?.id;
    this.comparing = false;
    this.cmp = null;
    const [stones, catalog] = await Promise.all([Materials.getStones(), Materials.getCatalog()]);
    this.stones = stones;
    this.catalog = catalog;
    this.bind();
    this.render();
    this.watch();
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
      if (this.project?.id !== id || !document.getElementById('project-ba').offsetParent) return;
      try {
        const before = this.project.variants;
        const res = await Api.projectVariant(id, 'poll');
        this.project.variants = res.data.variants;
        const done = res.data.variants.find(v => v.ai?.status === 'done' && this.busy(before.find(b => b.id === v.id)));
        const failed = res.data.variants.find(v => v.ai?.status === 'failed' && this.busy(before.find(b => b.id === v.id)));
        if (done) showToast(`Вариант ${this.index(done.id)} готов`);
        if (failed) showToast(failed.ai.error || 'ИИ не смог нарисовать');
        if (done || failed) this.render();
      } catch (e) {
        // Сеть пропала — спросим ещё раз
      }
      this.watch();
    }, 5000);
  },

  variant(id) {
    return (this.project.variants || []).find(v => v.id === id);
  },

  index(id) {
    return (this.project.variants || []).findIndex(v => v.id === id) + 1;
  },

  render() {
    const p = this.project;
    const v = this.variant(this.sel);
    document.getElementById('project-title').textContent = p.name || 'Проект';
    this.renderCompare(v);
    this.renderHead(v);
    this.renderStrip();
    this.renderActions(v);
    this.renderChanges(v);
    const box = document.getElementById('project-details');
    const rows = summarizeDesign(v?.design, this.stones, this.catalog);
    box.innerHTML = (rows || '<p class="configure-hint">У этого варианта нет подбора.</p>') + `
      <div class="project-details__item">
        <span class="project-details__label">Вариант создан</span>
        <span class="project-details__value">${formatFullDate(v?.created_at || p.created_at)}</span>
      </div>`;
    recolorSpec(box, this.stones, this.catalog);
  },

  // До / после — или два варианта при сравнении
  renderCompare(v) {
    const box = document.getElementById('project-ba');
    const photo = this.project.original_image;
    if (this.comparing && this.cmp) {
      const w = this.variant(this.cmp);
      const a = v?.generated_image, b = w?.generated_image;
      box.innerHTML = baFrame(a || photo, b || photo, `Вариант ${this.index(this.sel)}`, `Вариант ${this.index(this.cmp)}`,
        a && b ? '' : 'Картинки вариантов появятся после генерации ИИ — ниже видно, чем они отличаются');
    } else if (this.comparing) {
      box.innerHTML = baFrame(v?.generated_image || photo, null, '', '', 'Выберите в ленте вариант, с которым сравнить');
    } else {
      const note = this.busy(v) ? 'ИИ рисует картинку — обычно 30–90 секунд'
        : v?.ai?.status === 'failed' && !v.generated_image ? v.ai.error
        : v?.generated_image ? '' : 'Картинка этого варианта появится после генерации ИИ';
      box.innerHTML = baFrame(photo, v?.generated_image, 'До', 'После', note);
    }
    bindBa(box.querySelector('.ba__frame'));
  },

  renderHead(v) {
    const n = this.index(this.sel);
    document.getElementById('variant-head').innerHTML = `
      <b>Вариант ${n}</b>${v?.starred ? '<span class="variant-head__star">★ Выбран клиентом</span>' : ''}
      <span>${this.busy(v) ? 'ИИ рисует…' : v?.generated_image ? 'есть картинка' : v?.ai?.status === 'failed' ? 'не получилось' : 'ожидает генерации'}</span>`;
  },

  renderStrip() {
    const vs = this.project.variants || [];
    document.getElementById('project-variants').innerHTML = vs.map((v, i) => {
      const main = this.stones.find(s => s.id === v.design?.materials?.main?.stone || s.id === v.design?.parts?.main?.stone);
      const cls = [v.id === this.sel ? 'active' : '', v.id === this.cmp ? 'compare' : ''].join(' ');
      return `
        <button class="variant ${cls}" data-variant="${v.id}">
          <span class="variant__img"><img src="${v.generated_image || this.project.original_image}" alt="" loading="lazy">
            ${this.busy(v) ? '<span class="variant__wait variant__wait--busy">рисует…</span>'
              : v.generated_image ? '' : v.ai?.status === 'failed' ? '<span class="variant__wait variant__wait--failed">ошибка</span>' : '<span class="variant__wait">ждёт ИИ</span>'}
            ${v.starred ? '<span class="variant__star">★</span>' : ''}</span>
          <span class="variant__name">${main ? `<img src="${main.texture}" alt="">` : ''}Вариант ${i + 1}</span>
        </button>`;
    }).join('') + `
      <button class="variant variant--new" data-variant-new>
        <span class="variant__img"><span>＋</span></span><span class="variant__name">Новый вариант</span>
      </button>`;
    document.querySelector('#project-variants .active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  },

  renderActions(v) {
    const many = (this.project.variants || []).length > 1;
    const star = document.getElementById('project-star');
    star.textContent = v?.starred ? '★ Выбран клиентом' : '☆ Выбран клиентом';
    star.classList.toggle('active', !!v?.starred);
    const cmp = document.getElementById('project-compare');
    cmp.textContent = this.comparing ? 'Закончить сравнение' : 'Сравнить';
    cmp.disabled = !many;
    document.getElementById('project-variant-delete').disabled = !many;
    const gen = document.getElementById('project-generate');
    gen.textContent = this.busy(v) ? 'ИИ рисует…' : v?.generated_image ? 'Сгенерировать заново' : 'Сгенерировать';
    gen.disabled = this.busy(v);
  },

  // Чем вариант отличается от предыдущего (или от варианта для сравнения)
  renderChanges(v) {
    const box = document.getElementById('project-changes');
    const vs = this.project.variants || [];
    const other = this.comparing && this.cmp ? this.variant(this.cmp) : vs[vs.findIndex(x => x.id === this.sel) - 1];
    if (!v || !other) { box.innerHTML = ''; return; }
    const diff = designDiff(other.design, v.design, this.stones, this.catalog);
    box.innerHTML = `
      <h3 class="section-title">${this.comparing ? `Вариант ${this.index(this.sel)} против варианта ${this.index(other.id)}` : `Что изменилось после варианта ${this.index(other.id)}`}</h3>
      ${diff.length ? diff.map(d => `
        <div class="change"><span class="change__part">${esc(d.part)}</span>
          <span class="change__was">${esc(d.was || 'нет')}</span><span class="change__arrow">→</span><span class="change__now">${esc(d.now || 'нет')}</span></div>`).join('')
        : '<p class="configure-hint">Подбор не отличается.</p>'}`;
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

  async action(name, data = {}) {
    try {
      const res = await Api.projectVariant(this.project.id, name, data);
      this.project.variants = res.data.variants;
      return true;
    } catch (e) {
      showToast(e.message || 'Не удалось выполнить');
      return false;
    }
  },

  async onClick(e) {
    const t = e.target;
    if (t.closest('[data-variant-new]')) return this.edit(false);
    const vb = t.closest('[data-variant]');
    if (vb) {
      const id = +vb.dataset.variant;
      if (this.comparing && id !== this.sel) this.cmp = id;
      else { this.sel = id; if (this.cmp === id) this.cmp = null; }
      return this.render();
    }
  },

  bind() {
    if (this.bound) return;
    this.bound = true;
    document.getElementById('project-variants').addEventListener('click', e => this.onClick(e));
    document.getElementById('project-back').addEventListener('click', () => Router.navigateTo('projects'));
    document.getElementById('project-edit').addEventListener('click', () => this.edit(false));
    document.getElementById('project-star').addEventListener('click', async () => {
      if (await this.action('star', { variant_id: this.sel })) this.render();
    });
    document.getElementById('project-compare').addEventListener('click', () => {
      this.comparing = !this.comparing;
      this.cmp = null;
      if (this.comparing) {
        // Сравнить с предыдущим вариантом сразу, другой — нажатием в ленте
        const vs = this.project.variants;
        const i = vs.findIndex(v => v.id === this.sel);
        this.cmp = (vs[i - 1] || vs[i + 1])?.id || null;
      }
      this.render();
    });
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
      downloadImage(v?.generated_image || this.project.original_image, `fasad-${this.project.id}-variant-${this.index(this.sel)}.jpg`);
    });
    document.getElementById('project-variant-delete').addEventListener('click', async () => {
      const ok = await showConfirm(`Удалить вариант ${this.index(this.sel)}?`, 'Подбор и картинка этого варианта удалятся.');
      if (!ok || !(await this.action('delete', { variant_id: this.sel }))) return;
      const vs = this.project.variants;
      this.sel = vs[vs.length - 1]?.id;
      this.cmp = null;
      this.comparing = false;
      showToast('Вариант удалён');
      this.render();
    });
    document.getElementById('project-share').addEventListener('click', () => {
      const v = this.variant(this.sel);
      shareProject(this.project.name, v?.generated_image || this.project.original_image);
    });
  },
};

// Ползунок «до / после»: слева одна картинка, справа другая; без второй — подпись поверх фото
function baFrame(before, after, labelA, labelB, note) {
  return `
    <div class="ba__frame" style="--cut:50%">
      <img class="ba__img" src="${before}" alt="">
      ${after ? `<img class="ba__img ba__after" src="${after}" alt="">
        <span class="ba__handle"></span>
        <span class="ba__label ba__label--a">${esc(labelA)}</span><span class="ba__label ba__label--b">${esc(labelB)}</span>` : ''}
      ${note ? `<span class="ba__note">${esc(note)}</span>` : ''}
      <button class="ba__full" aria-label="На весь экран">⤢</button>
    </div>`;
}

function bindBa(frame) {
  if (!frame) return;
  const set = (e) => {
    const r = frame.getBoundingClientRect();
    frame.style.setProperty('--cut', `${Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))}%`);
  };
  let dragging = false;
  frame.addEventListener('pointerdown', e => {
    if (e.target.closest('.ba__full') || !frame.querySelector('.ba__after')) return;
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
  frame.querySelector('.ba__full').addEventListener('click', () => {
    // На весь экран — показать заказчику
    const overlay = document.createElement('div');
    overlay.className = 'ba-fullscreen';
    overlay.innerHTML = frame.outerHTML.replace('<button class="ba__full" aria-label="На весь экран">⤢</button>', '')
      + '<button class="btn btn-secondary ba-fullscreen__close">Закрыть</button>';
    document.body.appendChild(overlay);
    const f = overlay.querySelector('.ba__frame');
    f.insertAdjacentHTML('beforeend', '<button class="ba__full" hidden></button>');
    bindBa(f);
    overlay.querySelector('.ba-fullscreen__close').addEventListener('click', () => overlay.remove());
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
function designDiff(a, b, stones, catalog) {
  const map = (d) => Object.fromEntries(specLines(d, stones, catalog)
    .filter(l => l[1] !== 'Здание')
    .map(l => [l[1], l[3] ? `${l[2]} (${l[3]})` : l[2]]));
  const A = map(a), B = map(b);
  return [...new Set([...Object.keys(A), ...Object.keys(B)])]
    .filter(k => A[k] !== B[k])
    .map(k => ({ part: k, was: A[k], now: B[k] }));
}

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
