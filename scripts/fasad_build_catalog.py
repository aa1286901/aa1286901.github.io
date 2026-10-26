"""Собирает каталог Fasad из PDF «Камень Юг — каталог 2024».

Каждая картинка изделия связывается с подписью под ней по положению на странице,
поэтому названия, модели и размеры берутся из PDF как есть.

Запуск: python3 scripts/fasad_build_catalog.py <каталог.pdf> <папка приложения fasad> [RealESRGAN_x4plus.pth]
Нужны: poppler-utils (pdfimages), pdfplumber, Pillow.
С весами Real-ESRGAN (нужны torch и spandrel) картинки изделий увеличиваются нейросетью в 4 раза,
без них — Lanczos вдвое с повышением резкости.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

import pdfplumber
from PIL import Image, ImageFilter, ImageStat

PDF, APP = sys.argv[1:3]
ESRGAN = sys.argv[3] if len(sys.argv) > 3 else None

TR = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
              'a b v g d e e zh z i y k l m n o p r s t u f h ts ch sh sch  y  e yu ya'.split(' ')))


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', ''.join(TR.get(c, c) for c in s.lower())).strip('-')


# === Картинки из PDF: номер картинки → файл, маска прозрачности склеивается с картинкой ===
tmp = tempfile.mkdtemp()
subprocess.run(['pdfimages', '-png', '-p', PDF, f'{tmp}/i'], check=True)
listing = subprocess.run(['pdfimages', '-list', PDF], check=True, capture_output=True, text=True).stdout
objects = {}
for line in listing.splitlines()[2:]:
    f = line.split()
    objects.setdefault((int(f[0]), int(f[10])), {})[f[2]] = int(f[1])


def load_image(page, num, smask=None):
    im = Image.open(f'{tmp}/i-{page:03d}-{num:03d}.png').convert('RGB')
    if smask is not None:
        im.putalpha(Image.open(f'{tmp}/i-{page:03d}-{smask:03d}.png').convert('L'))
    return im


# === Разметка страниц: картинки с координатами и подписи под ними ===
pdf = pdfplumber.open(PDF)


def page_items(pno):
    page = pdf.pages[pno - 1]
    words = page.extract_words(keep_blank_chars=True, x_tolerance=1.5)
    items = []
    for im in page.images:
        if im['width'] < 30 or im['height'] < 30:
            continue
        info = objects.get((pno, im['stream'].objid), {})
        x0, x1, top, bottom = im['x0'], im['x1'], im['top'], im['bottom']
        cap = [w for w in words if bottom - 14 <= w['top'] <= bottom + 80 and x0 - 40 <= w['x0'] <= x1]
        lines = {}
        for w in sorted(cap, key=lambda w: (round(w['top']), w['x0'])):
            lines.setdefault(round(w['top']), []).append(w['text'].strip())
        caption = []
        for _, parts in sorted(lines.items()):
            text = ' '.join(p for p in parts if p)
            if re.match(r'^(ВИДЫ|ЭЛЕМЕНТЫ|Большой|архитектурному|Описание)', text):
                break
            caption.append(text)
        items.append({'num': info.get('image'), 'smask': info.get('smask'), 'w': im['width'], 'h': im['height'],
                      'x': x0, 'y': top, 'caption': caption})
    return items


def parse_caption(lines):
    """Строки подписи → название, размер, камень образца."""
    name, size, stone = [], None, None
    for t in lines:
        if re.search(r'\d+\s*\*|D-\d|мм|Под заказ', t) and not size:
            size = t.replace(' мм', '').strip()
        elif re.match(r'^[А-ЯЁ][а-яё]+ [а-яё]+$', t):
            stone = t
        elif t.isupper() or re.search(r'[КПБ]-\d', t) or t.startswith('«'):
            name.append(t)
    title = ' '.join(name).strip()
    title = title[:1] + title[1:].lower()
    # Модели и названия в кавычках возвращаем в исходный регистр
    title = re.sub(r'([кпб])-(\d)', lambda m: m.group(1).upper() + '-' + m.group(2), title)
    title = re.sub(r'«([а-яё])', lambda m: '«' + m.group(1).upper(), title)
    title = title.replace('рус. пл.', 'руст. пл.')
    model = (re.search(r'[КПБ]-\d+(\.\d+)?', title) or [None])[0]
    return title, size, model


def size_text(size):
    if not size:
        return ''
    return size.replace('*', '×').replace('х', '×')


# === Камень: 20 видов, образец фактуры и фото плитки ===
STONE_ORDER = [
    ['Акушинский кремовый', 'Акушинский белый', 'Алтинский жёлтый', 'Дербентский кремовый', 'Дербентский жёлтый', 'Каралапко белый в крапинку'],
    ['Геленбатановский', 'Чиринский розовый', 'Ничирахский', 'Тенгинский', 'Фригский', 'Фригский с галькой'],
    ['Морской чёрный', 'Морской серый', 'Мекегинский', 'Зулемахинский', 'Каякентский жёлтый', 'Каякентский серый'],
    ['Джангинский', 'Чёрный сланец'],
]
KINDS = [('песчаник', 'Песчаник'), ('ракушечник', 'Ракушечник'), ('известняк', 'Известняк'), ('доломит', 'Доломит'), ('сланец', 'Сланец')]


def stone_texts(pno):
    """Описание и характеристики камня из двух колонок страницы."""
    text = subprocess.run(['pdftotext', '-f', str(pno), '-l', str(pno), '-layout', PDF, '-'],
                          check=True, capture_output=True, text=True).stdout
    cols = ['\n'.join(l[:69] for l in text.split('\n')), '\n'.join(l[69:] for l in text.split('\n'))]
    out = {}
    for col in cols:
        parts = re.split(r'\n\s*([А-ЯЁ][А-ЯЁ ]{3,})\s*\n(?=\s*\n\s*ТЕХНИЧЕСКИЕ)', col)
        for i in range(1, len(parts), 2):
            b = ' '.join(parts[i + 1].split())
            g = lambda pat: (re.search(pat, b) or [None, None])[1]
            out[parts[i].strip().lower()] = {
                'specs': {
                    'density': g(r'Плотность: (.+?кг/м³)'), 'porosity': g(r'Пористость: ([\d,\- ]+%)'),
                    'absorption': g(r'Водопоглощение: ([\d,\- ]+%)'), 'fire': g(r'Огнеупорность: ([\d\- ]+°C)'),
                    'strength': g(r'Предел прочности: ([\d ]+Мпа)'), 'frost': g(r'Морозостойкость: (F\d+)'),
                },
                'description': g(r'Описание: (.+?) Размеры:'),
                'sizes': [x.strip() for x in (g(r'Размеры: (.+?) Фаска') or '').split(',') if x.strip()],
            }
    return out


os.makedirs(f'{APP}/assets/textures/stones', exist_ok=True)
os.makedirs(f'{APP}/assets/catalog/slabs', exist_ok=True)
stones = []
for pno, names in zip([3, 4, 5, 6], STONE_ORDER):
    texts = stone_texts(pno)
    items = page_items(pno)
    swatches = sorted([i for i in items if abs(i['w'] - i['h']) < 5], key=lambda i: (round(i['y'] / 100), i['x']))
    slabs = sorted([i for i in items if i['h'] > i['w'] * 1.2], key=lambda i: (round(i['y'] / 100), i['x']))
    for name, sw, sl in zip(names, swatches, slabs):
        sid = slug(name)
        tex = load_image(pno, sw['num'])
        tex.save(f'{APP}/assets/textures/stones/{sid}.jpg', quality=92, optimize=True)
        slab = load_image(pno, sl['num'])
        slab.save(f'{APP}/assets/catalog/slabs/{sid}.jpg', quality=88, optimize=True)
        r, g, b = [int(v) for v in ImageStat.Stat(tex).mean]
        t = texts[name.lower()]
        kind = next((k for key, k in KINDS if key in (t['description'] or '').lower()), 'Камень')
        thickness = sorted({int(s.split('*')[2]) for s in t['sizes']})
        formats = []
        for s in t['sizes']:
            h, w, _ = s.split('*')
            if f'{h}x{w}' not in formats:
                formats.append(f'{h}x{w}')
        stones.append({
            'id': sid, 'name': name, 'category': 'stone', 'type': kind,
            'image': f'assets/textures/stones/{sid}.jpg', 'texture': f'assets/textures/stones/{sid}.jpg',
            'slab': f'assets/catalog/slabs/{sid}.jpg', 'color': '#%02x%02x%02x' % (r, g, b),
            'description': t['description'], 'specs': t['specs'], 'sizes': t['sizes'],
            'formats': formats, 'thickness': thickness, 'active': True,
        })

# Старые камни остаются неактивными: на них ссылаются ранее сохранённые проекты
mpath = f'{APP}/data/materials.json'
old = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) else []
ids = {s['id'] for s in stones}
for m in old:
    if m.get('category') == 'stone' and m['id'] not in ids and not m.get('active', True):
        stones.append(m)
json.dump(stones, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# === Элементы фасада по разделам каталога ===
# раздел: (название, значок, страницы, фильтр по названию изделия)
SECTIONS = [
    ('cornice', 'Карнизы', 'cornice', [8, 2], r'^Карниз'),
    ('plinth', 'Плинтусы', 'plinth', [9], r'^Плинтус'),
    ('dentil', 'Зубцы', 'dentil', [10], r'^Зубец'),
    ('window', 'Наличники и подоконники', 'opening', [2], r'^(Наличник|Подоконник)'),
    ('keystone', 'Замки и клинья', 'keystone', [11], r'^(Замок|Картуш)'),
    ('console', 'Консоли', 'console', [11], r'^Консоль'),
    ('rust', 'Русты', 'rust', [14], r'^Русты'),
    ('pilaster', 'Пилястры', 'pilaster', [15, 16, 17, 2], r'^Пилястра(?! на колонну)'),
    ('column', 'Колонны', 'column', [18, 19, 20, 21, 22, 23, 24, 25, 2], r'^Колонна'),
    ('capital', 'Капители и базы', 'capital', [15, 18, 23, 2], r'^(Капитель|База)'),
    ('balustrade', 'Балюстрада', 'balustrade', [12], r'^(Балюстрада|Балясина|Тумба|Перила|Навершие)'),
    ('carved', 'Розетки, барельефы, панно', 'rosette', [13], r'^(Розетка|Барельеф|Панно)'),
]
# Главная картинка раздела стоит над заголовком «Виды…»: её подпись читается отдельно
MAIN_CAPTIONS = {8: 'КАРНИЗ К-1|160*360*35 мм', 9: 'ПЛИНТУС П-15|80*360*50 мм', 10: 'ЗУБЕЦ К-1|160*160*35 мм',
                 11: 'ЗАМОК ПРОСТОЙ|215*165*80 мм', 12: 'БАЛЮСТРАДА|910*210*210 мм',
                 13: 'БАРЕЛЬЕФ|600*1250*50 мм', 14: 'РУСТЫ КРУПНЫЕ|350*750*50 мм',
                 15: 'ПИЛЯСТРА КРУПНАЯ ГЛАДКАЯ|350*750*50 мм', 16: 'ПИЛЯСТРА КРУПНАЯ С КАННЕЛЮРАМИ|350*750*50 мм',
                 17: 'ПИЛЯСТРА СЛОЖНАЯ С КАРНИЗОМ К-22|160*500*50 мм', 26: 'БРУСЧАТКА 80Х80|80*80*50 мм'}

os.makedirs(f'{APP}/assets/catalog', exist_ok=True)
page_cache = {}
sections = []
seen_images = set()


upscaler = None
if ESRGAN:
    import numpy as np
    import torch
    from spandrel import ModelLoader
    torch.set_num_threads(os.cpu_count() or 4)
    upscaler = ModelLoader().load_from_file(ESRGAN).model.eval()

MAX_SIDE = 1200  # длинные колонны после увеличения не нужны больше этого


def upscale(im):
    """Картинки в PDF маленькие (~180 px): нейросеть дорисовывает чёткие края, прозрачность — Lanczos."""
    if max(im.size) >= 420:
        return im
    if upscaler is None:
        big = im.resize((im.size[0] * 2, im.size[1] * 2), Image.LANCZOS)
        rgb = big.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    else:
        x = torch.from_numpy(np.asarray(im.convert('RGB'), dtype=np.float32) / 255).permute(2, 0, 1)[None]
        with torch.no_grad():
            y = upscaler(x)[0].clamp(0, 1).permute(1, 2, 0).numpy()
        # Нейросеть сглаживает фактуру камня — возвращаем зерно из обычного увеличения исходника
        lz = im.convert('RGB').resize((y.shape[1], y.shape[0]), Image.LANCZOS)
        grain = np.asarray(lz, np.float32) - np.asarray(lz.filter(ImageFilter.GaussianBlur(3)), np.float32)
        rgb = Image.fromarray(np.clip(y * 255 + grain * 0.8, 0, 255).round().astype('uint8'))
        big = im
    rgb.putalpha(big.getchannel('A').resize(rgb.size, Image.LANCZOS))
    if max(rgb.size) > MAX_SIDE:
        k = MAX_SIDE / max(rgb.size)
        rgb = rgb.resize((round(rgb.size[0] * k), round(rgb.size[1] * k)), Image.LANCZOS)
    return rgb


def fingerprint(im):
    """Одинаковые картинки повторяются на разных страницах — узнаём их по уменьшенной копии."""
    small = im.convert('LA').resize((12, 12))
    return tuple(v // 16 for px in small.get_flattened_data() for v in px)


for sid, title, icon, pages, pattern in SECTIONS:
    groups = {}  # одно изделие — одна карточка, варианты размеров и рисунков внутри
    for pno in pages:
        if pno not in page_cache:
            page_cache[pno] = page_items(pno)
        items = page_cache[pno]
        biggest = max((i for i in items if i['smask'] is not None), key=lambda i: i['w'] * i['h'], default=None)
        for it in items:
            if it['num'] is None or it['smask'] is None or it['w'] < 40:
                continue
            if pno == 2 and it['w'] > 300:
                continue  # фото дома на обложке раздела
            caption = it['caption']
            if it is biggest and pno in MAIN_CAPTIONS:
                caption = MAIN_CAPTIONS[pno].split('|')
            name, size, model = parse_caption(caption)
            if not name or not re.match(pattern, name):
                continue
            im = load_image(pno, it['num'], it['smask'])
            box = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
            if not box:
                continue
            im = im.crop(box)
            # Длинные собранные пилястры и колонны — в подборе фасада, но не в каталоге изделий
            tall = im.size[1] > im.size[0] * 2
            if sid == 'rust' and tall:
                # Русты: показываем верхнюю часть колонки — несколько камней, чтобы было видно рисунок
                im = im.crop((0, 0, im.size[0], int(im.size[1] * 0.42)))
            fp = (fingerprint(im), size)
            if fp in seen_images:
                continue
            seen_images.add(fp)
            group = groups.setdefault(name, {'name': name, 'model': model, 'variants': []})
            same_size = sum(1 for v in group['variants'] if v['size'] == size_text(size))
            vid = slug(f'{sid} {name} {size or ""} {same_size + 1 if same_size else ""}')[:70]
            path = f'assets/catalog/{vid}.webp'
            im = upscale(im)
            im.save(f'{APP}/{path}', 'WEBP', quality=86, method=4)
            px = sorted(0.299 * r + 0.587 * g + 0.114 * b for r, g, b, a in im.get_flattened_data() if a > 200)
            group['variants'].append({
                'id': vid, 'size': size_text(size), 'look': same_size + 1 if same_size else None,
                'page': pno, 'tall': tall,
                'image': path, 'w': im.size[0], 'h': im.size[1],
                'lumRef': round(px[int(len(px) * 0.75)], 1) if px else 200,
            })
    out = []
    for g in groups.values():
        g['id'] = g['variants'][0]['id']
        out.append(g)
    sections.append({'id': sid, 'title': title, 'icon': icon, 'items': out})

# Отделка плитки: форматы и толщины из размеров камня, фаски как на значках каталога
catalog = {
    'sections': sections,
    'tile': {
        'formats': stones[0]['formats'],
        'thickness': stones[0]['thickness'],
        'edges': [
            {'id': 'none', 'name': 'Без фаски'},
            {'id': 'chamfer', 'name': 'Скос'},
            {'id': 'convex', 'name': 'Скруглённая'},
            {'id': 'concave', 'name': 'Вогнутая'},
            {'id': 'rabbet', 'name': 'Четверть'},
        ],
        'surfaces': [
            {'id': 'sawn', 'name': 'Пиленая'},
            {'id': 'split', 'name': 'Отбитая'},
        ],
    },
}
json.dump(catalog, open(f'{APP}/data/catalog.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len([s for s in stones if s.get('active', True)]), 'stones;',
      ', '.join(f"{s['title']}: {len(s['items'])}/{sum(len(i['variants']) for i in s['items'])}" for s in sections))
