// === Наши работы: дома, облицованные дагестанским камнем ===
// Фото с сайтов kamenyug.ru и dagkamni.ru — чтобы показать заказчику готовые фасады
const Works = {
  list: null,
  index: 0,

  async load() {
    if (this.list) return this.list;
    try {
      this.list = await (await fetch('data/works.json')).json();
    } catch {
      this.list = [];
    }
    return this.list;
  },

  async render() {
    const box = document.getElementById('works-list');
    if (!box || box.dataset.ready) return;
    const list = await this.load();
    box.dataset.ready = '1';
    box.innerHTML = list.map((w, i) => `
      <button class="works__item" data-work="${i}" aria-label="Открыть фото работы">
        <img src="${w.thumb}" alt="Облицовка дома камнем" loading="lazy">
      </button>`).join('');
    box.addEventListener('click', e => {
      const btn = e.target.closest('[data-work]');
      if (btn) this.open(+btn.dataset.work);
    });
  },

  open(i) {
    this.index = (i + this.list.length) % this.list.length;
    const w = this.list[this.index];
    let viewer = document.getElementById('works-viewer');
    if (!viewer) {
      viewer = document.createElement('div');
      viewer.id = 'works-viewer';
      viewer.className = 'works-viewer';
      viewer.innerHTML = `
        <button class="works-viewer__close" data-act="close" aria-label="Закрыть">✕</button>
        <button class="works-viewer__nav works-viewer__nav--prev" data-act="prev" aria-label="Предыдущее">‹</button>
        <img class="works-viewer__img" alt="Облицовка дома камнем">
        <button class="works-viewer__nav works-viewer__nav--next" data-act="next" aria-label="Следующее">›</button>
        <div class="works-viewer__bar">
          <span class="works-viewer__source"></span>
          <button class="btn btn-primary" data-act="use">Разметить это фото</button>
        </div>`;
      viewer.addEventListener('click', e => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'close' || e.target === viewer) this.close();
        if (act === 'prev') this.open(this.index - 1);
        if (act === 'next') this.open(this.index + 1);
        if (act === 'use') this.useAsPhoto();
      });
      // Листание пальцем
      let startX = null;
      viewer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      viewer.addEventListener('touchend', e => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) this.open(this.index + (dx < 0 ? 1 : -1));
        startX = null;
      });
      document.body.appendChild(viewer);
    }
    viewer.querySelector('.works-viewer__img').src = w.image;
    viewer.querySelector('.works-viewer__source').textContent = `${this.index + 1} / ${this.list.length} · ${w.source}`;
    viewer.hidden = false;
  },

  close() {
    const viewer = document.getElementById('works-viewer');
    if (viewer) viewer.hidden = true;
  },

  // Фото работы можно разметить, чтобы показать заказчику другой камень на похожем доме
  useAsPhoto() {
    const w = this.list[this.index];
    this.close();
    ProjectFlow.setState('originalPhoto', w.image);
    ProjectFlow.setState('design', null);
    Router.navigateTo('editor');
  },
};
