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
      box.innerHTML = baFrame(photo, v?.generated_image, 'До', 'После',
        v?.generated_image ? '' : 'Картинка этого варианта появится после генерации ИИ');
    }
    bindBa(box.querySelector('.ba__frame'));
  },

  renderHead(v) {
    const n = this.index(this.sel);
    document.getElementById('variant-head').innerHTML = `
      <b>Вариант ${n}</b>${v?.starred ? '<span class="variant-head__star">★ Выбран клиентом</span>' : ''}
      <span>${v?.generated_image ? 'есть картинка' : 'ожидает генерации'}</span>`;
  },

  renderStrip() {
    const vs = this.project.variants || [];
    document.getElementById('project-variants').innerHTML = vs.map((v, i) => {
      const main = this.stones.find(s => s.id === v.design?.materials?.main?.stone || s.id === v.design?.parts?.main?.stone);
      const cls = [v.id === this.sel ? 'active' : '', v.id === this.cmp ? 'compare' : ''].join(' ');
      return `
        <button class="variant ${cls}" data-variant="${v.id}">
          <span class="variant__img"><img src="${v.generated_image || this.project.original_image}" alt="" loading="lazy">
            ${v.generated_image ? '' : '<span class="variant__wait">ждёт ИИ</span>'}
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
    document.getElementById('project-generate').textContent = v?.generated_image ? 'Сгенерировать заново' : 'Сгенерировать';
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
    document.getElementById('project-generate').addEventListener('click', () => this.action('generate', { variant_id: this.sel }));
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
