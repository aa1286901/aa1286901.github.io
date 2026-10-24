const Auth = {
  _user: null,

  async init() {
    try {
      const data = await Api.me();
      this._user = data.data || null;
    } catch {
      this._user = null;
    }
    return this._user;
  },

  isLoggedIn() {
    return this._user !== null;
  },

  getUser() {
    return this._user;
  },

  async register(name, email, password) {
    const data = await Api.register(name, email, password);
    this._user = data.data || null;
    return data;
  },

  async login(email, password) {
    const data = await Api.login(email, password);
    this._user = data.data || null;
    return data;
  },

  async logout() {
    await Api.logout();
    this._user = null;
  },

  canUseFeatures() {
    return this.isLoggedIn();
  }
};
