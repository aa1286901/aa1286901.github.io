"""Собирает каталог Fasad из PDF «Камень Юг».
Аргументы: <папка pdf-выгрузки> <папка приложения fasad>"""
import json, os, re, sys
from PIL import Image, ImageStat

PDF, APP = sys.argv[1:3]
tr = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
              'a b v g d e e zh z i y k l m n o p r s t u f h ts ch sh sch  y  e yu ya'.split(' ')))
def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', ''.join(tr.get(c, c) for c in s.lower())).strip('-')

# === Камень: 20 видов из каталога ===
stones = json.load(open(f'{PDF}/stones.json', encoding='utf-8'))
order = ['Акушинский кремовый', 'Акушинский белый', 'Алтинский жёлтый', 'Дербентский кремовый', 'Дербентский жёлтый',
         'Каралапко белый в крапинку', 'Геленбатановский', 'Чиринский розовый', 'Ничирахский', 'Тенгинский', 'Фригский',
         'Фригский с галькой', 'Морской чёрный', 'Морской серый', 'Мекегинский', 'Зулемахинский', 'Каякентский жёлтый',
         'Каякентский серый', 'Джангинский', 'Чёрный сланец']
by_name = {s['name'].lower(): s for s in stones}
os.makedirs(f'{APP}/assets/textures/stones', exist_ok=True)
kinds = [('песчаник', 'Песчаник'), ('ракушечник', 'Ракушечник'), ('известняк', 'Известняк'), ('доломит', 'Доломит'), ('сланец', 'Сланец')]
materials = []
for i, name in enumerate(order):
    s = by_name[name.lower()]
    im = Image.open(f'{PDF}/sw/{i:02d}.png').convert('RGB')
    sid = slug(name)
    path = f'assets/textures/stones/{sid}.jpg'
    im.save(f'{APP}/{path}', quality=90, optimize=True)
    r, g, b = [int(v) for v in ImageStat.Stat(im).mean]
    desc = s['description'] or ''
    kind = next((k for key, k in kinds if key in desc.lower()), 'Камень')
    materials.append({
        'id': sid, 'name': name, 'category': 'stone', 'type': kind,
        'image': path, 'texture': path, 'color': '#%02x%02x%02x' % (r, g, b),
        'description': desc,
        'specs': {k: s[k] for k in ('density', 'porosity', 'absorption', 'fire', 'strength', 'frost')},
        'sizes': [x.strip() for x in (s['sizes'] or '').split(',') if x.strip()],
        'active': True,
    })

# Старые камни остаются в файле неактивными: на них ссылаются уже сохранённые проекты
old = json.load(open(f'{APP}/data/materials.json', encoding='utf-8'))
for m in old:
    if m.get('category') == 'stone' and m['id'] not in {x['id'] for x in materials} and not m['id'].isascii():
        m['active'] = False
        materials.append(m)
json.dump(materials, open(f'{APP}/data/materials.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# === Изделия: картинки с прозрачным фоном, обрезанные по содержимому ===
os.makedirs(f'{APP}/assets/decor', exist_ok=True)
def sprite(src, sid):
    im = Image.open(f'{PDF}/pages/{src}.png').convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox())
    im.save(f'{APP}/assets/decor/{sid}.webp', 'WEBP', quality=82, method=6)
    # Опорная яркость лицевой (освещённой) стороны камня — для перекраски в выбранный камень
    px = [0.299 * r + 0.587 * g + 0.114 * b for r, g, b, a in im.get_flattened_data() if a > 200]
    px.sort()
    ref = px[int(len(px) * 0.75)] if px else 200
    return {'image': f'assets/decor/{sid}.webp', 'w': im.size[0], 'h': im.size[1], 'lumRef': round(ref, 1)}

S = []  # (id, src, name, group, widthMm, heightMm)
S += [('rust-standart', 'p14_23', 'Русты стандартные', 'rust', 360, 0),
      ('rust-raschyoska', 'p14_24', 'Русты «расчёска»', 'rust', 360, 0),
      ('rust-sparennye', 'p14_25', 'Русты спаренные', 'rust', 360, 0),
      ('rust-krupnye', 'p14_22', 'Русты из крупной рустовой плиты', 'rust', 750, 0),
      ('rust-sparennaya-plita', 'p14_21', 'Русты из спаренной рустовой плиты', 'rust', 360, 0),
      ('pilastra-gladkaya', 'p15_24', 'Пилястра гладкая', 'pilaster', 360, 0),
      ('pilastra-kannelyury', 'p16_24', 'Пилястра с каннелюрами', 'pilaster', 360, 0),
      ('pilastra-slozhnaya', 'p17_24', 'Пилястра сложная', 'pilaster', 500, 0),
      ('kolonna-kruglaya', 'p18_21', 'Колонна круглая гладкая', 'column', 430, 0),
      ('kolonna-kruglaya-kannelyury', 'p19_20', 'Колонна круглая с каннелюрами', 'column', 430, 0),
      ('kolonna-konusnaya', 'p20_28', 'Колонна конусная гладкая', 'column', 430, 0),
      ('kolonna-konusnaya-kannelyury', 'p21_20', 'Колонна конусная с каннелюрами', 'column', 430, 0),
      ('kolonna-kv-gladkaya', 'p23_21', 'Колонна квадратная гладкая', 'column', 400, 0),
      ('kolonna-kv-kannelyury', 'p24_29', 'Колонна квадратная с каннелюрами', 'column', 400, 0),
      ('kolonna-kv-slozhnaya', 'p25_28', 'Колонна квадратная сложная', 'column', 400, 0),
      ('kolonna-kv-rusty', 'p22_21', 'Колонна квадратная с рустами', 'column', 400, 0),
      ('kolonna-kv-rust-plitka', 'p22_23', 'Колонна квадратная с рустовой плиткой', 'column', 400, 0),
      ('zamok-prostoy', 'p11_00', 'Замок простой', 'keystone', 165, 215),
      ('zamok-figurnyy', 'p11_25', 'Замок фигурный', 'keystone', 170, 240),
      ('zamok-stupenchatyy', 'p11_23', 'Замок ступенчатый', 'keystone', 240, 300),
      ('zamok-reznoy', 'p11_21', 'Замок резной', 'keystone', 180, 240),
      ('zamok-reznoy-2', 'p11_22', 'Замок резной большой', 'keystone', 200, 240),
      ('kartush', 'p11_24', 'Картуш резной', 'keystone', 350, 470),
      ('konsol-k1', 'p11_26', 'Консоль простая К-1', 'console', 210, 160),
      ('konsol-k5', 'p11_27', 'Консоль простая К-5', 'console', 210, 160),
      ('konsol-k6', 'p11_28', 'Консоль простая К-6', 'console', 210, 160),
      ('konsol-k22', 'p11_32', 'Консоль простая К-22', 'console', 210, 160),
      ('konsol-k53', 'p11_37', 'Консоль простая К-53.1', 'console', 210, 160),
      ('konsol-reznaya', 'p11_31', 'Консоль резная', 'console', 160, 240),
      ('konsol-reznaya-2', 'p11_29', 'Консоль резная с листом', 'console', 160, 240),
      ('balyasina-b1', 'p12_20', 'Балясина Б-1', 'baluster', 160, 750),
      ('balyasina-b2', 'p12_21', 'Балясина Б-2', 'baluster', 160, 750),
      ('balyasina-b3', 'p12_22', 'Балясина Б-3', 'baluster', 210, 750),
      ('balyasina-b4', 'p12_23', 'Балясина Б-4', 'baluster', 210, 750),
      ('tumba-kruglaya', 'p12_24', 'Тумба круглая гладкая', 'post', 210, 910),
      ('tumba-kruglaya-k', 'p12_25', 'Тумба круглая с каннелюрами', 'post', 210, 910),
      ('tumba-kv', 'p12_26', 'Тумба квадратная гладкая', 'post', 210, 910),
      ('tumba-kv-k', 'p12_27', 'Тумба квадратная с каннелюрами', 'post', 210, 910),
      ('navershie-konus', 'p12_31', 'Навершие «Конус»', 'finial', 150, 260),
      ('navershie-shar-reznoy', 'p12_32', 'Навершие резное «Шар»', 'finial', 250, 330),
      ('navershie-shar', 'p12_33', 'Навершие «Шар»', 'finial', 250, 250),
      ('navershie-shishka', 'p12_34', 'Навершие резное «Шишка»', 'finial', 250, 380),
      ('kapitel-ionicheskaya', 'p15_23', 'Капитель ионическая', 'capital', 500, 180),
      ('kapitel-korinfskaya', 'p15_25', 'Капитель коринфская', 'capital', 350, 650),
      ('rozetka-lev', 'p13_31', 'Розетка резная «Лев»', 'rosette', 600, 600),
      ('rozetka-tsvetok', 'p13_32', 'Розетка резная «Цветок»', 'rosette', 500, 500),
      ('rozetka-koltso', 'p13_33', 'Розетка резная «Кольцо»', 'rosette', 800, 800),
      ('rozetka-uzor', 'p13_34', 'Розетка резная «Узор»', 'rosette', 800, 800),
      ('rozetka-rakovina', 'p13_35', 'Розетка резная «Раковина»', 'rosette', 500, 500),
      ('barelef', 'p13_30', 'Барельеф', 'barelief', 1250, 600),
      ('barelef-1', 'p13_24', 'Барельеф резной 450×1600', 'barelief', 1600, 450),
      ('barelef-2', 'p13_25', 'Барельеф резной 400×1400', 'barelief', 1400, 400),
      ('barelef-3', 'p13_26', 'Барельеф резной 500×1700', 'barelief', 1700, 500),
      ('barelef-4', 'p13_27', 'Барельеф резной 600×1800', 'barelief', 1800, 600),
      ('barelef-5', 'p13_28', 'Барельеф резной 700×1800', 'barelief', 1800, 700),
      ('barelef-fronton', 'p02_10', 'Барельеф резной на фронтон', 'barelief', 2700, 900),
      ('panno-1', 'p13_00', 'Панно резное в рамке 500×1600', 'panel', 1600, 500),
      ('panno-2', 'p13_21', 'Панно резное 600×1600', 'panel', 1600, 600),
      ('panno-3', 'p13_22', 'Панно резное 600×1200', 'panel', 1200, 600),
      ('panno-4', 'p13_23', 'Панно резное 600×1400', 'panel', 1400, 600),
      ('panno-5', 'p13_29', 'Панно резное в рамке 600×1200', 'panel', 1200, 600)]
sprites = []
for sid, src, name, group, wmm, hmm in S:
    info = sprite(src, sid)
    if not hmm:  # вертикальные элементы: высота по пропорции картинки
        hmm = round(wmm * info['h'] / info['w'])
    sprites.append({'id': sid, 'name': name, 'group': group, 'widthMm': wmm, 'heightMm': hmm, **info})

# Профили карнизов, плинтусов и подоконников: участки лицевой стороны сверху вниз
# доля высоты + тип поверхности (top — полка сверху, flat — вертикаль, convex/concave — вал/выкружка, under — низ в тени)
P = lambda *seg: [list(s) for s in seg]
bands = [
    {'id': 'k1', 'name': 'Карниз К-1', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 35,
     'profile': P((0.08, 'top'), (0.12, 'flat'), (0.3, 'concave'), (0.08, 'flat'), (0.3, 'concave'), (0.12, 'under'))},
    {'id': 'k2', 'name': 'Карниз К-2', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 160,
     'profile': P((0.1, 'top'), (0.15, 'flat'), (0.45, 'concave'), (0.1, 'flat'), (0.2, 'under'))},
    {'id': 'k5', 'name': 'Карниз К-5', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 80,
     'profile': P((0.08, 'top'), (0.2, 'flat'), (0.3, 'convex'), (0.25, 'concave'), (0.17, 'under'))},
    {'id': 'k6', 'name': 'Карниз К-6', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 50,
     'profile': P((0.1, 'top'), (0.55, 'flat'), (0.1, 'under'), (0.25, 'flat'))},
    {'id': 'k11', 'name': 'Карниз венчающий К-11', 'kind': 'cornice', 'heightMm': 360, 'depthMm': 160,
     'profile': P((0.06, 'top'), (0.18, 'flat'), (0.08, 'under'), (0.3, 'concave'), (0.08, 'flat'), (0.2, 'convex'), (0.1, 'under'))},
    {'id': 'k12', 'name': 'Карниз К-12', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 35,
     'profile': P((0.06, 'top'), (0.2, 'convex'), (0.08, 'under'), (0.2, 'convex'), (0.08, 'under'), (0.2, 'convex'), (0.18, 'under'))},
    {'id': 'k19', 'name': 'Карниз К-19', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 80,
     'profile': P((0.08, 'top'), (0.22, 'flat'), (0.35, 'concave'), (0.1, 'flat'), (0.1, 'convex'), (0.15, 'under'))},
    {'id': 'k22', 'name': 'Карниз К-22', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 50,
     'profile': P((0.1, 'top'), (0.3, 'flat'), (0.45, 'concave'), (0.15, 'under'))},
    {'id': 'k26', 'name': 'Карниз межэтажный К-26', 'kind': 'cornice', 'heightMm': 160, 'depthMm': 80,
     'profile': P((0.1, 'top'), (0.25, 'flat'), (0.25, 'convex'), (0.25, 'concave'), (0.15, 'under'))},
    {'id': 'p15', 'name': 'Плинтус П-15', 'kind': 'plinth', 'heightMm': 80, 'depthMm': 50,
     'profile': P((0.15, 'top'), (0.35, 'flat'), (0.3, 'concave'), (0.2, 'flat'))},
    {'id': 'p2', 'name': 'Плинтус П-2', 'kind': 'plinth', 'heightMm': 80, 'depthMm': 35,
     'profile': P((0.25, 'convex'), (0.75, 'flat'))},
    {'id': 'p32', 'name': 'Плинтус П-32', 'kind': 'plinth', 'heightMm': 80, 'depthMm': 80,
     'profile': P((0.12, 'top'), (0.28, 'convex'), (0.2, 'concave'), (0.4, 'flat'))},
    {'id': 'k37', 'name': 'Подоконник К-37', 'kind': 'sill', 'heightMm': 80, 'depthMm': 160,
     'profile': P((0.35, 'top'), (0.35, 'flat'), (0.3, 'under'))},
    {'id': 'k12n', 'name': 'Наличник оконный К-12', 'kind': 'surround', 'heightMm': 160, 'depthMm': 50,
     'profile': P((0.15, 'convex'), (0.1, 'under'), (0.5, 'flat'), (0.25, 'concave'))},
    {'id': 'nal-gladkiy', 'name': 'Наличник гладкий', 'kind': 'surround', 'heightMm': 120, 'depthMm': 35,
     'profile': P((0.12, 'top'), (0.76, 'flat'), (0.12, 'under'))},
    {'id': 'perila-p2', 'name': 'Перила П-2', 'kind': 'rail', 'heightMm': 160, 'depthMm': 750,
     'profile': P((0.45, 'convex'), (0.4, 'flat'), (0.15, 'under'))},
]
json.dump({'sprites': sprites, 'bands': bands},
          open(f'{APP}/data/elements.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print(len(materials), 'materials;', len(sprites), 'sprites;', len(bands), 'bands')
