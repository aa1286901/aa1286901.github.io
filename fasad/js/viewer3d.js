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

  // Вытянутое сечение: x — вынос от стены, y — высота, z — длина изделия; всё в мм.
  // На кривых нормали сглаживаются (свет перетекает плавно), на уступах и рёбрах остаются острыми.
  extrude(p) {
    const CREASE = Math.cos((38 * Math.PI) / 180);
    let pts = p.pts.map(([d, h]) => [d, p.H - h]);
    pts = pts.filter((q, i) => {
      const n = pts[(i + 1) % pts.length];
      return Math.hypot(n[0] - q[0], n[1] - q[1]) > 0.01;
    });
    const n = pts.length;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n];
      area += x1 * y2 - x2 * y1;
    }
    const out = area < 0 ? 1 : -1; // наружу от контура при обходе по часовой стрелке
    const segN = pts.map((a, i) => {
      const b = pts[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      return [(-dy / len) * out, (dx / len) * out];
    });
    const vertexN = (i, own) => {
      const other = segN[i];
      const mine = segN[own];
      if (mine[0] * other[0] + mine[1] * other[1] < CREASE) return mine;
      const x = mine[0] + other[0], y = mine[1] + other[1], len = Math.hypot(x, y);
      return [x / len, y / len];
    };

    const pos = [], nor = [], uv = [], idx = [];
    const L = p.L;
    // Боковые грани по контуру: u — путь по профилю, v — длина, в мм (рисунок камня без швов)
    let run = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const na = vertexN((i - 1 + n) % n, i), nb = vertexN((i + 1) % n, i);
      const base = pos.length / 3;
      [[a, na, run], [b, nb, run + len]].forEach(([q, nq, u]) => {
        pos.push(q[0], q[1], 0, q[0], q[1], L);
        nor.push(nq[0], nq[1], 0, nq[0], nq[1], 0);
        uv.push(u, 0, u, L);
      });
      // a0=base, a1=base+1, b0=base+2, b1=base+3
      if (out > 0) idx.push(base, base + 3, base + 2, base, base + 1, base + 3);
      else idx.push(base, base + 2, base + 3, base, base + 3, base + 1);
      run += len;
    }
    // Торцы
    const contour = pts.map(([x, y]) => new THREE.Vector2(x, y));
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    [[0, -1], [L, 1]].forEach(([z, nz]) => {
      const base = pos.length / 3;
      pts.forEach(([x, y]) => { pos.push(x, y, z); nor.push(0, 0, nz); uv.push(x, y); });
      tris.forEach(([i, j, k]) => {
        const [ax, ay] = pts[i], [bx, by] = pts[j], [cx, cy] = pts[k];
        const ccw = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) > 0;
        if (ccw === (nz > 0)) idx.push(base + i, base + j, base + k);
        else idx.push(base + i, base + k, base + j);
      });
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.rotateY(-Math.PI / 2);
    geo.translate(p.L / 2, 0, -p.D / 2);
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
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8174, 0.38));
    const size = Math.max(profile.L, profile.H, profile.D);
    const sun = new THREE.DirectionalLight(0xffffff, 1.25);
    sun.position.set(size * 1.1, size * 1.9, size * 1.9); // как в каталоге: свет справа спереди, левый торец в тени
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: size * 6 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xe8eef5, 0.12);
    fill.position.set(-size * 1.5, size * 0.3, size * 0.6);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size * 10, size * 10), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const material = new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, bumpScale: 0.04 });
    const mesh = new THREE.Mesh(this.extrude(profile), material);
    mesh.castShadow = true; // тень только на пол: на самой модели она даёт «грязь» и гасит свет
    scene.add(mesh);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    const radius = Math.hypot(profile.L, profile.H, profile.D) / 2;
    const dist = radius / Math.sin((camera.fov * Math.PI) / 360) * 1.0;
    controls.target.set(0, profile.H / 2, 0);
    camera.position.set(-dist * 0.68, profile.H / 2 - dist * 0.04, dist * 0.73); // как на фото каталога: слева и чуть снизу
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
