let materialsCache = null;
let cornicesCache = null;

const MATERIALS_PATH = './data/materials.json';
const CORNICES_PATH = './data/cornices.json';

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

  async getCornices() {
    if (cornicesCache) return cornicesCache;
    try {
      const resp = await fetch(CORNICES_PATH);
      cornicesCache = await resp.json();
      return cornicesCache;
    } catch (e) {
      console.error('Failed to load cornices:', e);
      return [];
    }
  }
};
