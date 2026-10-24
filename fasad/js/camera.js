// === Фото фасада: съёмка камерой телефона или выбор из фотоальбома ===
const Camera = {
  // useCamera = true — сразу открывается камера, false — фотоальбом (без атрибута capture)
  pick(useCamera) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) input.capture = 'environment';
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (file) this.loadFile(file);
    });
    input.click();
  },

  loadFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Выберите фотографию');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      ProjectFlow.setState('originalPhoto', reader.result);
      ProjectFlow.setState('originalImageFile', file);
      ProjectFlow.setState('design', null);
      showPhotoPreview();
    };
    reader.onerror = () => showToast('Не удалось открыть фото');
    reader.readAsDataURL(file);
  },
};
