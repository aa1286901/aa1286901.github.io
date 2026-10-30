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
  // Монеты, тарифы и пакеты
  async getWallet() {
    return this.request('./user/wallet.php');
  },

  // Администратор: пользователи (без data — список; { action: 'update' | 'create', ... } — изменить)
  async adminUsers(data = null) {
    return data ? this.request('./admin/users.php', { method: 'POST', body: JSON.stringify(data) })
      : this.request('./admin/users.php');
  },

  // Администратор: баланс kie.ai
  async adminKie() {
    return this.request('./admin/kie.php');
  },

  async adminAiLog() {
    return this.request('./admin/ai-log.php');
  },

  // Администратор: ключ kie.ai (без key — узнать, какой стоит; с key — проверить и сохранить)
  async adminAiKey(key = null) {
    return key ? this.request('./admin/ai-key.php', { method: 'POST', body: JSON.stringify({ key }) })
      : this.request('./admin/ai-key.php');
  },

  // КП: данные и цены прораба (без data — прочитать)
  async kpProfile(data = null) {
    return data ? this.request('./user/kp.php', { method: 'POST', body: JSON.stringify(data) }) : this.request('./user/kp.php');
  },

  // КП проекта (без kp — прочитать; issue — выдаётся новый PDF, номер растёт)
  async projectKp(projectId, kp = null, issue = false) {
    return kp ? this.request('./projects/kp.php', { method: 'POST', body: JSON.stringify({ project_id: projectId, kp, issue }) })
      : this.request(`./projects/kp.php?project_id=${projectId}`);
  },

  // Контакты поддержки
  async getSupport() {
    return this.request('./support.php');
  },

  async projectVariant(projectId, action, data = {}) {
    return this.request('./projects/variants.php', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, action, ...data }),
    });
  },

  async renameProject(id, name) {
    return this.request('./projects/rename.php', { method: 'POST', body: JSON.stringify({ project_id: id, name }) });
  },

  // Своё имя в профиле
  async updateProfile(data) {
    return this.request('./user/update.php', { method: 'POST', body: JSON.stringify(data) });
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
