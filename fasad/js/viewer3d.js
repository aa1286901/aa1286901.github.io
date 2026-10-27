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
    return geo;
  },

  // Сборщик сетки: треугольник сам разворачивается наружу — по нормалям его вершин
  builder() {
    const pos = [], nor = [], uv = [], idx = [];
    const b = {
      vert(p, n, t) {
        pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]); uv.push(t[0], t[1]);
        return pos.length / 3 - 1;
      },
      tri(a, c, d) {
        const P = (i) => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
        const [A, C, D] = [P(a), P(c), P(d)];
        const u = [C[0] - A[0], C[1] - A[1], C[2] - A[2]], v = [D[0] - A[0], D[1] - A[1], D[2] - A[2]];
        const g = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
        let dot = 0;
        [a, c, d].forEach(i => { dot += g[0] * nor[i * 3] + g[1] * nor[i * 3 + 1] + g[2] * nor[i * 3 + 2]; });
        if (dot >= 0) idx.push(a, c, d); else idx.push(a, d, c);
      },
      quad(a, c, d, e) { b.tri(a, c, d); b.tri(a, d, e); },
      // Плоский многоугольник: точки в 3D, к ним 2D-координаты для разбиения на треугольники
      polygon(points3, points2, n, uvOf) {
        const tris = THREE.ShapeUtils.triangulateShape(points2.map(([x, y]) => new THREE.Vector2(x, y)), []);
        const ids = points3.map((p, i) => b.vert(p, n, uvOf(p, i)));
        tris.forEach(([i, j, k]) => b.tri(ids[i], ids[j], ids[k]));
      },
      geometry() {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        return geo;
      },
    };
    return b;
  },

  // Нормали открытой линии профиля (x — вынос/радиус, y — высота): у каждого отрезка нормали двух концов.
  // На плавных переходах сглажены, на уступах (угол больше 38°) острые. Наружу — в сторону +x.
  lineNormals(pts) {
    const CREASE = Math.cos((38 * Math.PI) / 180);
    const segs = pts.slice(0, -1).map((a, i) => {
      const b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      return [dy / len, -dx / len, len];
    });
    const sign = segs.reduce((s, [nx, , len]) => s + nx * len, 0) >= 0 ? 1 : -1;
    segs.forEach(s => { s[0] *= sign; s[1] *= sign; });
    const blend = (m, o) => {
      if (!o || m[0] * o[0] + m[1] * o[1] < CREASE) return [m[0], m[1]];
      const x = m[0] + o[0], y = m[1] + o[1], len = Math.hypot(x, y);
      return [x / len, y / len];
    };
    return segs.map((s, i) => ({ len: s[2], na: blend(s, segs[i - 1]), nb: blend(s, segs[i + 1]) }));
  },

  // Консоль: профиль обходит блок спереди и с обоих боков, на углах — запил.
  // На высоте h блок занимает x от −L/2 + (D − d) до L/2 − (D − d) и z от стены (0) до d.
  wrap(p) {
    const b = this.builder();
    const line = p.pts.slice(1, -1).map(([d, h]) => [d, p.H - h]);
    const segN = this.lineNormals(line);
    const xl = (d) => -p.L / 2 + (p.D - d), xr = (d) => p.L / 2 - (p.D - d);
    let run = 0;
    line.slice(0, -1).forEach((a, i) => {
      const c = line[i + 1], { na, nb, len } = segN[i];
      const v0 = run, v1 = run + len;
      // спереди
      b.quad(b.vert([xl(a[0]), a[1], a[0]], [0, na[1], na[0]], [xl(a[0]), v0]),
        b.vert([xr(a[0]), a[1], a[0]], [0, na[1], na[0]], [xr(a[0]), v0]),
        b.vert([xr(c[0]), c[1], c[0]], [0, nb[1], nb[0]], [xr(c[0]), v1]),
        b.vert([xl(c[0]), c[1], c[0]], [0, nb[1], nb[0]], [xl(c[0]), v1]));
      // слева и справа
      [[xl, -1], [xr, 1]].forEach(([X, s]) => {
        b.quad(b.vert([X(a[0]), a[1], 0], [s * na[0], na[1], 0], [0, v0]),
          b.vert([X(a[0]), a[1], a[0]], [s * na[0], na[1], 0], [a[0], v0]),
          b.vert([X(c[0]), c[1], c[0]], [s * nb[0], nb[1], 0], [c[0], v1]),
          b.vert([X(c[0]), c[1], 0], [s * nb[0], nb[1], 0], [0, v1]));
      });
      run = v1;
    });
    // верх, низ и задняя плоскость у стены
    [[line[0], 1], [line[line.length - 1], -1]].forEach(([[d, y], ny]) => {
      const rect = [[xl(d), y, 0], [xl(d), y, d], [xr(d), y, d], [xr(d), y, 0]];
      b.polygon(rect, rect.map(q => [q[0], q[2]]), [0, ny, 0], q => [q[0], q[2]]);
    });
    const back = [...line.map(([d, y]) => [xl(d), y, 0]), ...line.slice().reverse().map(([d, y]) => [xr(d), y, 0])];
    b.polygon(back, back.map(q => [q[0], q[1]]), [0, 0, -1], q => [q[0], q[1]]);
    return b.geometry();
  },

  // Тело вращения: профиль [радиус, высота]; square — четыре грани (квадратное сечение, r — половина стороны)
  lathe(pts, square) {
    const b = this.builder();
    const segN = this.lineNormals(pts);
    const n = square ? 4 : 64;
    let run = 0;
    pts.slice(0, -1).forEach((a, i) => {
      const c = pts[i + 1], { na, nb, len } = segN[i];
      const v0 = run, v1 = run + len;
      if (square) {
        for (let k = 0; k < 4; k++) {
          const u = [Math.cos((k * Math.PI) / 2), Math.sin((k * Math.PI) / 2)], t = [-u[1], u[0]];
          const P = (r, y, s) => [r * (u[0] + s * t[0]), y, r * (u[1] + s * t[1])];
          const N = (m) => [m[0] * u[0], m[1], m[0] * u[1]];
          b.quad(b.vert(P(a[0], a[1], -1), N(na), [-a[0], v0]), b.vert(P(a[0], a[1], 1), N(na), [a[0], v0]),
            b.vert(P(c[0], c[1], 1), N(nb), [c[0], v1]), b.vert(P(c[0], c[1], -1), N(nb), [-c[0], v1]));
        }
      } else {
        const ring = (q, m, v) => Array.from({ length: n + 1 }, (_, k) => {
          const f = (k / n) * Math.PI * 2, cs = Math.cos(f), sn = Math.sin(f);
          return b.vert([q[0] * cs, q[1], q[0] * sn], [m[0] * cs, m[1], m[0] * sn], [f * 60, v]);
        });
        const r0 = ring(a, na, v0), r1 = ring(c, nb, v1);
        for (let k = 0; k < n; k++) b.quad(r0[k], r0[k + 1], r1[k + 1], r1[k]);
      }
      run = v1;
    });
    // крышки, если профиль не сходится к оси
    [[pts[0], -1], [pts[pts.length - 1], 1]].forEach(([[r, y], ny]) => {
      if (r < 0.5) return;
      const ring = square
        ? [[r, y, r], [-r, y, r], [-r, y, -r], [r, y, -r]]
        : Array.from({ length: n }, (_, k) => [r * Math.cos((k / n) * Math.PI * 2), y, r * Math.sin((k / n) * Math.PI * 2)]);
      b.polygon(ring, ring.map(q => [q[0], q[2]]), [0, ny, 0], q => [q[0], q[2]]);
    });
    return b.geometry();
  },

  // Призма: сечение [x, z] (замкнутое) по высоте от y0 до y1 — стволы тумб с каннелюрами, плиты
  prism(section, y0, y1) {
    const b = this.builder();
    const closed = [...section, section[0]];
    const segN = this.lineNormals(closed);
    let run = 0;
    closed.slice(0, -1).forEach((a, i) => {
      const c = closed[i + 1], { na, nb, len } = segN[i];
      b.quad(b.vert([a[0], y0, a[1]], [na[0], 0, na[1]], [run, y0]), b.vert([c[0], y0, c[1]], [nb[0], 0, nb[1]], [run + len, y0]),
        b.vert([c[0], y1, c[1]], [nb[0], 0, nb[1]], [run + len, y1]), b.vert([a[0], y1, a[1]], [na[0], 0, na[1]], [run, y1]));
      run += len;
    });
    [[y0, -1], [y1, 1]].forEach(([y, ny]) => {
      const pts3 = section.map(([x, z]) => [x, y, z]);
      b.polygon(pts3, section, [0, ny, 0], q => [q[0], q[2]]);
    });
    return b.geometry();
  },

  // Геометрия изделия по описанию из profiles.json; ставится на пол (y = 0) по центру
  geometry(p) {
    let geo;
    if (p.kind === 'wrap') geo = this.wrap(p);
    else if (p.kind === 'model') geo = this.merge(p.parts.map(part => part.lathe ? this.lathe(part.lathe, part.square)
      : this.prism(part.prism, part.y0, part.y1)));
    else geo = this.extrude(p);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    geo.computeBoundingBox();
    return geo;
  },

  merge(geos) {
    const out = { position: [], normal: [], uv: [] }, idx = [];
    let base = 0;
    geos.forEach(g => {
      Object.keys(out).forEach(k => out[k].push(...g.attributes[k].array));
      g.index.array.forEach(i => idx.push(i + base));
      base += g.attributes.position.count;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(out.position, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(out.normal, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(out.uv, 2));
    geo.setIndex(idx);
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
    const geo = this.geometry(profile);
    const bb = geo.boundingBox, ext = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
    const size = Math.max(...ext);
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
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true; // тень только на пол: на самой модели она даёт «грязь» и гасит свет
    scene.add(mesh);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 1.6;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.addEventListener('start', () => { controls.autoRotate = false; });

    const radius = Math.hypot(...ext) / 2, cy = ext[1] / 2;
    const dist = radius / Math.sin((camera.fov * Math.PI) / 360) * 1.0;
    controls.target.set(0, cy, 0);
    camera.position.set(-dist * 0.68, cy - dist * 0.04, dist * 0.73); // как на фото каталога: слева и чуть снизу
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
    };
    view.setStone(textureUrl);
    return view;
  },
};
