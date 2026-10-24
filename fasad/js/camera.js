const Camera = {
  videoElement: null,
  stream: null,
  previewElement: null,

  async startCamera(container) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });

      this.videoElement = document.createElement('video');
      this.videoElement.playsInline = true;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;
      this.videoElement.srcObject = this.stream;

      container.innerHTML = '';
      container.appendChild(this.videoElement);

      // Add camera controls
      const controls = document.createElement('div');
      controls.className = 'camera-area__controls';
      controls.innerHTML = `
        <button class="camera-gallery-btn" id="camera-gallery-btn" aria-label="Выбрать из галереи">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </button>
        <div class="camera-shutter" id="camera-shutter">
          <div class="camera-shutter__inner"></div>
        </div>
        <button class="camera-gallery-btn" id="camera-switch-btn" aria-label="Переключить камеру">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        </button>
      `;
      container.appendChild(controls);

      // Shutter
      document.getElementById('camera-shutter').addEventListener('click', () => this.capture());
      
      // Gallery
      document.getElementById('camera-gallery-btn').addEventListener('click', () => this.openGallery());
      
      // Switch camera
      document.getElementById('camera-switch-btn').addEventListener('click', () => this.switchCamera());

    } catch (e) {
      console.warn('Camera not available:', e);
      this.openGallery();
    }
  },

  capture() {
    if (!this.videoElement) return;
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    ProjectFlow.setState('originalPhoto', imageData);
    this.stopCamera();
    window.onScreenPhoto();
  },

  async openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          ProjectFlow.setState('originalPhoto', ev.target.result);
          ProjectFlow.setState('originalImageFile', file);
          this.stopCamera();
          window.onScreenPhoto();
        };
        reader.readAsDataURL(file);
      }
    });
    input.click();
  },

  async switchCamera() {
    this.stopCamera();
    const facing = this.stream?.getVideoTracks()[0]?.getSettings()?.facingMode === 'user' ? 'environment' : 'user';
    this.startCamera(document.querySelector('.camera-area'));
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  },

  // From file input
  async loadImageFromInput(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        ProjectFlow.setState('originalPhoto', e.target.result);
        ProjectFlow.setState('originalImageFile', file);
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
