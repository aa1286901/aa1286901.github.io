// Project creation flow state
const ProjectFlow = {
  state: {
    originalPhoto: null,      // base64 or URL (уменьшенное фото для редактора)
    originalImageFile: null,  // File object for upload
    design: null,             // { zones: [], bands: [] } — разметка фасада
    sketch: null,             // dataURL готового наброска
    projectName: '',
    projectId: null,
  },

  setState(key, value) {
    this.state[key] = value;
    this.saveDraft();
  },

  getState(key) {
    if (key) return this.state[key];
    return this.state;
  },

  saveDraft() {
    const draftable = {
      originalPhoto: this.state.originalPhoto,
      design: this.state.design,
    };
    Storage.save('project-draft', draftable);
  },

  loadDraft() {
    return Storage.load('project-draft');
  },

  clearDraft() {
    Storage.remove('project-draft');
    this.state = {
      originalPhoto: null,
      originalImageFile: null,
      design: null,
      sketch: null,
      projectName: '',
      projectId: null,
    };
  },

  hasDraft() {
    const draft = this.loadDraft();
    return draft && draft.originalPhoto;
  },
};
