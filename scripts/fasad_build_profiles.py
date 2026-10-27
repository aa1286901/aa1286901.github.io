"""Снимает сечения карнизов, плинтусов и зубцов с картинок каталога Fasad для 3D-просмотра.

На рендерах «Камень Юг» торец изделия серо-синий, а камень бежевый: серая область слева —
это сечение. Для каждой строки картинки берётся вынос от стены (ширина торца), затем
профиль приводится к размерам из каталога (высота × вынос, мм) и упрощается.

Запуск: python3 scripts/fasad_build_profiles.py <папка приложения fasad>
Нужны: numpy, scipy, Pillow. Пишет data/profiles.json.
"""
import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

APP = sys.argv[1]
SECTIONS = ('cornice', 'plinth', 'dentil')

# Где торец на картинке не отделить от камня — сечение задано вручную: [вынос, высота сверху], мм
MANUAL = {
    'cornice-karniz-mezhetazhnyy-k-26-160-360-80': [
        [0, 0], [80, 0], [80, 70], [74, 70], [68, 71], [55, 76], [43, 84], [33, 94], [25, 107],
        [19, 121], [15, 134], [14, 148], [20, 148], [20, 160], [0, 160]],
    'plinth-plintus-g-80-360-80': [[0, 0], [80, 0], [80, 22], [62, 22], [62, 80], [0, 80]],
}


def end_face(path):
    im = np.asarray(Image.open(path).convert('RGBA')).astype(int)
    r, b, a = im[..., 0], im[..., 2], im[..., 3]
    gray = ndimage.binary_opening((a > 128) & (b >= r + 4), iterations=2)
    lab, n = ndimage.label(gray)
    if not n:
        return None
    sizes = ndimage.sum(gray, lab, range(1, n + 1))
    # Торец — крупная серая область ближе к левому краю
    best = max(range(1, n + 1),
               key=lambda i: sizes[i - 1] / (1 + ndimage.center_of_mass(gray, lab, i)[1] / im.shape[1]))
    return lab == best


def simplify(pts, eps):
    """Рамер — Дуглас — Пекер: убираем лишние точки, оставляя форму."""
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0]), np.array(pts[-1])
    ab = b - a
    norm = np.hypot(*ab) or 1
    dist = [abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / norm for p in pts]
    i = int(np.argmax(dist))
    if dist[i] <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[:i + 1], eps)[:-1] + simplify(pts[i:], eps)


def profile(path, H, D):
    m = end_face(path)
    if m is None or m.sum() < 200:
        return None
    rows = [(y, np.where(m[y])[0]) for y in range(m.shape[0]) if m[y].any()]
    y0, y1 = rows[0][0], rows[-1][0]
    if y1 - y0 < 20:
        return None
    left = np.median([xs[0] for _, xs in rows])
    d = ndimage.median_filter(np.array([xs[-1] - left for _, xs in rows], float), size=5)
    # Края торца «гуляют» на пиксель — без сглаживания на гладких гранях видна лесенка
    d = ndimage.gaussian_filter1d(d, 2.0).clip(0)
    if d.max() <= 0:
        return None
    line = [[float(dd / d.max() * D), float((y - y0) / (y1 - y0) * H)] for (y, _), dd in zip(rows, d)]
    line = simplify(line, 1.0)
    pts = [[0, 0], [line[0][0], 0]] + line + [[line[-1][0], H], [0, H]]
    return [[round(x, 1), round(y, 1)] for x, y in pts]


catalog = json.load(open(f'{APP}/data/catalog.json', encoding='utf-8'))
out = {}
for section in catalog['sections']:
    if section['id'] not in SECTIONS:
        continue
    for item in section['items']:
        for v in item['variants']:
            nums = [int(n) for n in v['size'].replace('×', 'x').split('x') if n.strip().isdigit()]
            if len(nums) != 3:
                continue
            H, L, D = nums
            pts = MANUAL.get(v['id']) or profile(f"{APP}/{v['image']}", H, D)
            if pts:
                out[v['id']] = {'kind': 'extrude', 'H': H, 'L': L, 'D': D, 'pts': pts}
            else:
                print('нет сечения:', v['id'])

json.dump(out, open(f'{APP}/data/profiles.json', 'w', encoding='utf-8'), separators=(',', ':'))
print(len(out), 'profiles')
