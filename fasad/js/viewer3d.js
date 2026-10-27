// 3D-просмотр изделий: сечение из data/profiles.json вытягивается в объём, камень — фактура из каталога.
// Three.js подгружается только при первом открытии 3D.
const Viewer3D = {
  profiles: null,
  lib: null,
  textures: {},

  async getProfiles() {
    if (!this.profiles) {
      try {
        this.profiles = await (await fetch('data/profiles.json')).json();
      } catch (e) {
        this.profiles = {};
      }
    }
    return this.profiles;
  },

  loadLib() {
    const script = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    this.lib = this.lib || script('js/vendor/three.min.js?v=007').then(() => script('js/vendor/OrbitControls.js?v=007'));
    return this.lib;
  },

  // Образец камня без светлой рамки по краю, рисунок повторяется зеркально, чтобы не было швов
  texture(url) {
    if (!this.textures[url]) {
      const tex = new THREE.Texture();
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const m = Math.round(img.width * 0.035);
        c.width = img.width - 2 * m;
        c.height = img.height - 2 * m;
        c.getContext('2d').drawImage(img, -m, -m);
        tex.image = c;
        tex.needsUpdate = true;
      };
      img.src = url;
      tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
      tex.repeat.set(1 / 110, 1 / 110); // образец камня ≈ 110 мм
      tex.encoding = THREE.sRGBEncoding;
      this.textures[url] = tex;
    }
    return this.textures[url];
  },

  // Вытянутое сечение: x — вынос от стены, y — высота, z — длина изделия; всё в мм
  extrude(p) {
    const shape = new THREE.Shape(p.pts.map(([d, h]) => new THREE.Vector2(d, p.H - h)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: p.L, bevelEnabled: false, curveSegments: 1 });
    geo.rotateY(-Math.PI / 2);
    geo.translate(p.L / 2, 0, -p.D / 2);
    geo.computeVertexNormals();
    return geo;
  },

  // Показывает изделие в box; возвращает управление: смена камня и режима вращения
  async mount(box, profile, textureUrl) {
    await this.loadLib();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    box.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 10, 20000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8174, 0.62));
    const size = Math.max(profile.L, profile.H, profile.D);
    const sun = new THREE.DirectionalLight(0xffffff, 0.95);
    sun.position.set(-size * 1.2, size * 2.2, size * 1.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: size * 6 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.35);
    fill.position.set(size * 1.5, size * 0.5, size);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size * 10, size * 10), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const material = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, bumpScale: 0.6 });
    const mesh = new THREE.Mesh(this.extrude(profile), material);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    const radius = Math.hypot(profile.L, profile.H, profile.D) / 2;
    const dist = radius / Math.sin((camera.fov * Math.PI) / 360) * 0.85;
    controls.target.set(0, profile.H / 2, 0);
    camera.position.set(-dist * 0.5, profile.H / 2 + dist * 0.08, dist * 0.86); // как на фото каталога: слева, почти на уровне глаз
    controls.minDistance = dist * 0.35;
    controls.maxDistance = dist * 1.8;
    controls.update();

    const resize = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    resize();

    const dispose = () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    renderer.setAnimationLoop(() => {
      if (!canvas.isConnected) return dispose(); // окно закрыли
      controls.update();
      renderer.render(scene, camera);
    });

    const view = {
      setStone: (url) => {
        material.map = material.bumpMap = this.texture(url);
        material.needsUpdate = true;
      },
      // Только по кругу — как на маркетплейсах; иначе можно смотреть и сверху
      setTurnOnly: (on) => {
        const a = controls.getPolarAngle();
        controls.minPolarAngle = on ? a : 0;
        controls.maxPolarAngle = on ? a : Math.PI * 0.52;
      },
    };
    view.setStone(textureUrl);
    return view;
  },
};
