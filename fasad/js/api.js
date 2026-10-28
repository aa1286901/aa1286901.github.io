// API лежит рядом с index.html, поэтому путь относительный:
// приложение работает и в корне домена, и в подпапке (например /fasad/)
const API_BASE = 'api';

const Api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint.replace(/^\.?\/+/, '')}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
      headers: { ...options.headers, 'Content-Type': 'application/json' },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Ошибка сервера');
      }
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Ошибка ответа сервера');
      }
      throw error;
    }
  },

  // === Auth ===
  async register(name, email, password) {
    return this.request('./auth/register.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email, password) {
    return this.request('./auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return this.request('./auth/logout.php', { method: 'POST' });
  },

  async me() {
    return this.request('./auth/me.php');
  },

  // === Projects ===
  async createProject(data) {
    return this.request('./projects/create.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listProjects() {
    return this.request('./projects/list.php');
  },

  async getProject(id) {
    return this.request(`./projects/get.php?id=${id}`);
  },

  // Варианты проекта: action = add | star | delete | generate
  async projectVariant(projectId, action, data = {}) {
    return this.request('./projects/variants.php', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, action, ...data }),
    });
  },

  async deleteProject(id) {
    return this.request(`./projects/delete.php?id=${id}`, { method: 'DELETE' });
  },

  // === Upload ===
  async uploadImage(file, kind = 'original') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('kind', kind);
    
    const response = await fetch(`${API_BASE}/upload/original.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Не удалось загрузить фотографию');
    }
    return data;
  },

  // === Generation ===
  async startGeneration(projectId, materials, cornices) {
    return this.request('./generation/start.php', {
      method: 'POST',
      body: JSON.stringify({ projectId, materials, cornices }),
    });
  },

  async getGenerationStatus(projectId) {
    return this.request(`./generation/status.php?id=${projectId}`);
  },

  // === Favorites ===
  async addFavorite(materialId) {
    return this.request('./user/favorites/add.php', {
      method: 'POST',
      body: JSON.stringify({ materialId }),
    });
  },

  async removeFavorite(materialId) {
    return this.request('./user/favorites/remove.php', {
      method: 'POST',
      body: JSON.stringify({ materialId }),
    });
  },

  async listFavorites() {
    return this.request('./user/favorites/list.php');
  },
};
