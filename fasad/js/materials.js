let materialsCache = null;
let catalogCache = null;

const MATERIALS_PATH = './data/materials.json';
const CATALOG_PATH = './data/catalog.json';

const Materials = {
  async getAll() {
    if (materialsCache) return materialsCache;
    try {
      const resp = await fetch(MATERIALS_PATH);
      materialsCache = await resp.json();
      return materialsCache;
    } catch (e) {
      console.error('Failed to load materials:', e);
      return [];
    }
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(m => m.id === id);
  },

  async getByCategory(category) {
    const all = await this.getAll();
    return all.filter(m => m.category === category && m.active !== false);
  },

  async search(query) {
    const all = await this.getAll();
    const q = query.toLowerCase();
    return all.filter(m => 
      m.name.toLowerCase().includes(q) && 
      m.active !== false
    );
  },

  // Изделия и отделка плитки из каталога «Камень Юг» (data/catalog.json)
  async getCatalog() {
    if (catalogCache) return catalogCache;
    try {
      const resp = await fetch(CATALOG_PATH);
      const data = await resp.json();
      // Модели по порядку номеров: К-1, К-2, К-3… (изделия без номера остаются в порядке каталога)
      const num = (m) => (m ? parseFloat(m.replace(/^[^\d]+/, '')) : Infinity);
      data.sections.forEach(s => s.items.sort((a, b) => num(a.model) - num(b.model)));
      // Быстрый доступ к любому варианту изделия по id
      data.variants = {};
      data.sections.forEach(s => s.items.forEach(item => item.variants.forEach(v => {
        data.variants[v.id] = { ...v, name: item.name, section: s.id };
      })));
      catalogCache = data;
      return data;
    } catch (e) {
      console.error('Failed to load catalog:', e);
      return { sections: [], tile: { formats: [], thickness: [], edges: [], surfaces: [] }, variants: {} };
    }
  },

  // Активные камни для выбора
  async getStones() {
    const all = await this.getAll();
    return all.filter(m => m.category === 'stone' && m.active !== false);
  }
};
