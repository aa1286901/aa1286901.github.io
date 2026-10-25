// === Фото фасада: съёмка камерой телефона или выбор из фотоальбома ===
// Поля выбора файла стоят в разметке внутри кнопок (label): нажатие открывает
// камеру или альбом без программного click(), который на iPhone срабатывает ненадёжно
const Camera = {
  bound: false,

  bind() {
    if (this.bound) return;
    this.bound = true;
    ['photo-camera-input', 'photo-album-input'].forEach(id => {
      const input = document.getElementById(id);
      input?.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (file) this.loadFile(file);
        input.value = ''; // чтобы можно было выбрать то же фото ещё раз
      });
    });
  },

  // Нажатие на пустую область превью открывает фотоальбом
  openAlbum() {
    document.getElementById('photo-album-input')?.click();
  },

  loadFile(file) {
    // У фото с некоторых телефонов (HEIC) тип файла бывает пустым — такие тоже пробуем открыть
    if (file.type && !file.type.startsWith('image/')) {
      showToast('Выберите фотографию');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Сразу уменьшаем до 1600 px: большие фото с камеры не помещаются в память браузера
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      ProjectFlow.setState('originalPhoto', canvas.toDataURL('image/jpeg', 0.9));
      ProjectFlow.setState('design', null);
      showPhotoPreview();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Не удалось открыть фото. Попробуйте другое или сделайте снимок');
    };
    img.src = url;
  },
};
