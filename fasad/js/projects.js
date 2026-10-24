// Project creation flow state
const ProjectFlow = {
  state: {
    originalPhoto: null,      // base64 or URL
    originalImageFile: null,  // File object for upload
    selectedBaseMaterial: null,
    selectedFacadeMaterial: null,
    selectedCornices: [],
    projectName: '',
    generationStatus: null,
    generatedImage: null,
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
      selectedBaseMaterial: this.state.selectedBaseMaterial,
      selectedFacadeMaterial: this.state.selectedFacadeMaterial,
      selectedCornices: this.state.selectedCornices,
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
      selectedBaseMaterial: null,
      selectedFacadeMaterial: null,
      selectedCornices: [],
      projectName: '',
      generationStatus: null,
      generatedImage: null,
      projectId: null,
    };
  },

  hasDraft() {
    const draft = this.loadDraft();
    return draft && draft.originalPhoto;
  },

  isValid() {
    return this.state.originalPhoto &&
           this.state.selectedBaseMaterial &&
           this.state.selectedFacadeMaterial;
  }
};
