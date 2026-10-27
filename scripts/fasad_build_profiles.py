"""Снимает сечения карнизов, плинтусов, зубцов и простых консолей с картинок каталога Fasad для 3D-просмотра.

На рендерах «Камень Юг» изделие снято слева: торец серо-синий, камень бежевый.
1. По торцу узнаём, как изделие лежит на картинке: где стена, масштаб и наклон
   (чем дальше от стены, тем выше точка — съёмка немного снизу).
2. Правый край изделия на картинке — это тот же профиль, только чёткий: граница камня
   с прозрачным фоном. Подгоняем торец к правому краю (сдвиг и масштаб перспективы)
   и переводим каждую точку края обратно в миллиметры: вынос от стены и высоту.
3. Профиль сглаживается по участкам между уступами: кривые плавные, уступы острые.

Запуск: python3 scripts/fasad_build_profiles.py <папка приложения fasad> [папка для проверочных картинок]
Нужны: numpy, scipy, Pillow. Пишет data/profiles.json и печатает совпадение с фото для каждого изделия.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage, optimize
from scipy.interpolate import UnivariateSpline
from scipy.spatial import cKDTree

APP = sys.argv[1]
CHECK = sys.argv[2] if len(sys.argv) > 2 else None
SECTIONS = ('cornice', 'plinth', 'dentil', 'console')
STEP = 0.5  # мм по высоте между точками профиля
# Камера на всех рендерах каталога одна; по изделиям с широким торцом (медиана):
T_CATALOG = -0.32  # наклон горизонтали торца на фото
RHO_CATALOG = 0.58  # пикселей на мм по выносу к пикселям на мм по высоте

# Запасной вариант, если профиль не снять с картинки: сечение вручную: [вынос, высота сверху], мм
MANUAL = {
    'cornice-karniz-mezhetazhnyy-k-26-160-360-80': [
        [0, 0], [80, 0], [80, 70], [74, 70], [68, 71], [55, 76], [43, 84], [33, 94], [25, 107],
        [19, 121], [15, 134], [14, 148], [20, 148], [20, 160], [0, 160]],
    'plinth-plintus-g-80-360-80': [[0, 0], [80, 0], [80, 22], [62, 22], [62, 80], [0, 80]],
}


def end_face(alpha, r, b):
    """Торец — крупная серо-синяя область ближе к левому краю."""
    gray = ndimage.binary_opening(alpha & (b >= r + 4), iterations=2)
    lab, n = ndimage.label(gray)
    if not n:
        return None
    sizes = ndimage.sum(gray, lab, range(1, n + 1))
    best = max(range(1, n + 1),
               key=lambda i: sizes[i - 1] / (1 + ndimage.center_of_mass(gray, lab, i)[1] / alpha.shape[1]))
    return lab == best


def simplify(pts, eps):
    """Рамер — Дуглас — Пекер: убираем лишние точки, оставляя форму."""
    pts = np.asarray(pts, float)
    keep = np.zeros(len(pts), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i0, i1 = stack.pop()
        if i1 - i0 < 2:
            continue
        a, b = pts[i0], pts[i1]
        ab = b - a
        norm = np.hypot(*ab) or 1
        seg = pts[i0 + 1:i1]
        dist = np.abs(ab[0] * (seg[:, 1] - a[1]) - ab[1] * (seg[:, 0] - a[0])) / norm
        k = int(np.argmax(dist))
        if dist[k] > eps:
            keep[i0 + 1 + k] = True
            stack += [(i0, i0 + 1 + k), (i0 + 1 + k, i1)]
    return pts[keep]


def measure(path, H, D, corners_only=False):
    """Профиль изделия по картинке: список (вынос, высота) в мм и данные для проверки."""
    rgba = np.asarray(Image.open(path).convert('RGBA')).astype(float)
    r, b, a = rgba[..., 0], rgba[..., 2], rgba[..., 3]
    alpha = a > 128
    edge = np.array([(np.where(alpha[y])[0][-1], y) for y in range(alpha.shape[0]) if alpha[y].any()], float)
    # Углы правого торца. Верхний — там, где кончается верхняя кромка изделия (на фото это ровная
    # наклонная линия), нижний — последняя строка изделия.
    tops = np.array([(x, np.where(alpha[:, x])[0][0]) for x in range(alpha.shape[1]) if alpha[:, x].any()], float)
    mid = tops[(tops[:, 0] > tops[:, 0].min() + 0.3 * np.ptp(tops[:, 0])) & (tops[:, 0] < tops[:, 0].min() + 0.8 * np.ptp(tops[:, 0]))]
    kline = np.polyfit(mid[:, 0], mid[:, 1], 1)
    on_line = tops[np.abs(tops[:, 1] - np.polyval(kline, tops[:, 0])) <= 3]
    x_corner = on_line[:, 0].max()
    y_corner = float(np.polyval(kline, x_corner))
    y_last = edge[:, 1].max()

    g = None if corners_only else end_face(alpha, r, b)
    if (g is None or g.sum() < 200 or np.ptp(np.where(g.any(1))[0]) < 20
            or g.sum() > 0.5 * alpha.sum()
            or np.ptp(np.where(g.any(0))[0]) > 0.6 * np.ptp(np.where(alpha.any(0))[0])):
        # Торец не отделить от камня (светлый или голубоватый камень, синеватая тень вдоль изделия): привязываем профиль к углам правого торца,
        # пропорции и наклон — общие для каталога. Верх изделия считаем самым выступающим.
        t = T_CATALOG
        by = (y_last - y_corner) / (H - t * RHO_CATALOG * D)
        ax = RHO_CATALOG * by
        m = 1.0
        X0 = edge[:, 0].max() - ax * D
        Y0 = y_last - by * H
        wall, y_top = X0, Y0
    else:
        rows = [(y, np.where(g[y])[0]) for y in range(g.shape[0]) if g[y].any()]
        wall = float(np.median([xs[0] for _, xs in rows]))
        # Наклон: верхняя кромка торца — горизонтальная линия профиля, на фото она идёт под углом
        cols = [(x, np.where(g[:, x])[0][0]) for x in range(int(wall), g.shape[1]) if g[:, x].any()]
        t = np.polyfit(*np.array(cols, float).T, 1)[0] if len(cols) > 5 else 0.0
        wy = np.where(g[:, min(g.shape[1] - 1, int(round(wall)) + 2)])[0]
        if len(wy) < 10:
            return None
        y_top, y_bot = float(wy[0]), float(wy[-1])
        by = (y_bot - y_top) / H                             # пикселей на мм по высоте
        W = max(xs[-1] for _, xs in rows) - wall
        # Узкий торец (тонкое изделие) наклон не показывает — все рендеры сняты одной камерой, берём общий
        if W < 40 or not -0.6 < t < 0.1:
            t = T_CATALOG
        ax = W / D                                            # пикселей на мм по выносу
        coarse = np.array([((xs[-1] - wall) / ax, (y - y_top - t * (xs[-1] - wall)) / by) for y, xs in rows])

        tree = cKDTree(edge)

        def to_img(p, X0, Y0, m):
            return np.stack([X0 + m * ax * p[:, 0], Y0 + m * (by * p[:, 1] + t * ax * p[:, 0])], 1)

        def cost(q):
            X0, Y0, m = q
            if not 0.6 < m < 1.3:
                return 1e9
            img = to_img(coarse, X0, Y0, m)
            dist, _ = tree.query(img)
            # И наоборот: весь край торца на фото должен быть покрыт профилем — иначе профиль «съезжает»
            band = edge[(edge[:, 0] >= X0 - 2) & (edge[:, 1] >= img[:, 1].min() - 3) & (edge[:, 1] <= img[:, 1].max() + 3)]
            back, _ = cKDTree(img).query(band) if len(band) else (np.zeros(1), None)
            lost = edge[(edge[:, 0] >= X0 + 2) & ((edge[:, 1] < img[:, 1].min() - 3) | (edge[:, 1] > img[:, 1].max() + 3))]
            # Верх и низ профиля — на углах правого торца
            ends = (img[:, 1].min() - y_corner) ** 2 + (img[:, 1].max() - y_last) ** 2
            return (np.mean(np.minimum(dist, 15) ** 2) + np.mean(np.minimum(back, 15) ** 2)
                    + 225 * len(lost) / max(len(band), 1) + 0.5 * ends)

        # Правый торец дальше от камеры: тот же профиль, сдвинут и чуть меньше
        best = None
        for m in (0.75, 0.85, 0.95, 1.05):
            for dy in (-20, 0, 20):
                res = optimize.minimize(cost, [edge[:, 0].max() - m * W, y_corner - 2 + dy, m], method='Nelder-Mead',
                                        options={'xatol': 0.05, 'fatol': 0.01, 'maxiter': 2000})
                if best is None or res.fun < best.fun:
                    best = res
        X0, Y0, m = best.x
        if not 0.62 < m < 1.28:  # торец распознан плохо — подгонка упёрлась в край
            return measure(path, H, D, corners_only=True)

    x, y = edge[:, 0], edge[:, 1]
    d = (x - X0) / (m * ax)
    h = (y - Y0 - t * (x - X0)) / (m * by)
    ok = (h >= -1) & (h <= H + 1) & (d >= -2) & (d <= D * 1.1)
    d, h = d[ok], h[ok]

    line, k, cover = trace(d, h, H, D, 1 / (m * ax))
    if line is None:
        return None if corners_only else measure(path, H, D, corners_only=True)
    return dict(line=line, fit=(X0, Y0, m, ax / k, by, t, wall, y_top), edge=edge, cover=cover,
                mode='по углам' if corners_only or g is None else 'правый край')


def trace(d, h, H, D, q):
    """Точки края в мм → плавный профиль: (вынос, высота) с шагом 0,5 мм по высоте.
    q — сколько мм в одном пикселе картинки по выносу. Возвращает профиль, поправку масштаба и долю высоты с данными."""
    # По высоте с шагом 0,5 мм: середина края в каждой полосе
    grid = np.arange(0, H + STEP / 2, STEP)
    prof = np.full(len(grid), np.nan)
    for i, hh in enumerate(grid):
        sel = np.abs(h - hh) <= STEP
        if sel.sum():
            prof[i] = np.median(d[sel])
    good = ~np.isnan(prof)
    if good.sum() < len(grid) * 0.6:
        return None, 1, 0
    prof = np.interp(grid, grid[good], prof[good])
    prof = ndimage.median_filter(prof, size=5, mode='nearest')

    # У тонких изделий край идёт ступеньками в пиксель (q мм).
    # Уступы профиля — скачок больше пикселя; между ними проводим плавную кривую (сплайн),
    # которая отходит от края фото не больше, чем на погрешность пикселя.
    jumps = np.where(np.abs(np.diff(prof)) > max(1.2, 2.5 * q))[0]
    cuts = [0] + [j + 1 for j in jumps] + [len(prof)]
    smooth = prof.copy()
    for s0, s1 in zip(cuts[:-1], cuts[1:]):
        n = s1 - s0
        if n > 6:
            spline = UnivariateSpline(grid[s0:s1], prof[s0:s1], k=3, s=n * q * q * 0.3)
            smooth[s0:s1] = spline(grid[s0:s1])
    # Вынос приводим ровно к размеру из каталога; k — во сколько раз поправили масштаб фото
    k = D / max(smooth.max(), 1e-6)
    smooth = np.clip(smooth * k, 0, D)
    return np.stack([smooth, grid], 1), k, float(good.mean())


def measure_left(path, H, D):
    """Второй способ — по левому торцу: там, где серо-синий торец переходит в тёплый бежевый камень.
    Подходит, когда торец крупный (консоли, зубцы), а правый край изделия частично закрыт."""
    rgba = np.asarray(Image.open(path).convert('RGBA')).astype(float)
    alpha = rgba[..., 3] > 128
    warm = ndimage.gaussian_filter(rgba[..., 0] - rgba[..., 2], 1.0)  # камень тёплый, торец — нет
    rows = []
    for y in range(alpha.shape[0]):
        xs = np.where(alpha[y])[0]
        if len(xs) < 5:
            continue
        seg = warm[y, xs[0]:xs[-1] + 1]
        hot = seg > 8
        run = np.convolve(hot, np.ones(4), 'valid') == 4  # тепло держится 4 пикселя подряд
        if run.any():
            rows.append((y, xs[0], xs[0] + int(np.argmax(run))))
    if len(rows) < 20:
        return None
    rows = np.array(rows, float)
    wall = float(np.median(rows[:, 1]))
    on = rows[np.abs(rows[:, 1] - wall) <= 2]
    y_top, y_bot = on[:, 0].min(), on[:, 0].max()
    if y_bot - y_top < 20:
        return None
    by = (y_bot - y_top) / H
    inside = rows[(rows[:, 0] >= y_top) & (rows[:, 0] <= y_bot)]
    W = float(np.percentile(inside[:, 2] - wall, 98))
    if W < 12:
        return None
    # Наклон верхней кромки торца — по верху силуэта над торцом
    cols = [(x, np.where(alpha[:, x])[0][0]) for x in range(int(wall) + 2, int(wall + W) - 1) if alpha[:, x].any()]
    t = np.polyfit(*np.array(cols, float).T, 1)[0] if len(cols) > 5 else T_CATALOG
    if not -0.6 < t < 0.3:
        t = T_CATALOG
    ax = W / D
    sel = rows[(rows[:, 0] >= y_top - abs(t) * W - 2) & (rows[:, 0] <= y_bot)]
    x, y = sel[:, 2], sel[:, 0]
    d = (x - wall) / ax
    h = (y - y_top - t * (x - wall)) / by
    ok = (h >= 1) & (h <= H - 1) & (d >= -2) & (d <= D * 1.1)
    line, k, cover = trace(d[ok], h[ok], H, D, 1 / ax)
    if line is None:
        return None
    return dict(line=line, fit=(wall, y_top, 1.0, ax / k, by, t, wall, y_top),
                edge=np.stack([x[ok], y[ok]], 1), cover=cover, mode='левый торец')


def measure_wrap(path, H, L, D):
    """Консоль: профиль обходит блок спереди и с боков. Сбоку блок отступает на side·(D − d) с каждой
    стороны (side подбирается по фото: у разных консолей боковой отступ разный).
    Правый край силуэта — передний правый угол (z = d): по нему профиль, он чёткий.
    Левый край — задний левый угол у стены (z = 0): по нему проверяем профиль и подбираем side.
    Пропорции и наклон съёмки — общие для каталога (как у карнизов)."""
    alpha = np.asarray(Image.open(path).convert('RGBA'))[..., 3] > 128
    rows = np.array([(y, *np.where(alpha[y])[0][[0, -1]]) for y in range(alpha.shape[0]) if alpha[y].sum() > 5], float)
    y_top, y_bot = rows[0, 0], rows[-1, 0]
    by = (y_bot - y_top) / H                   # у стены наклона нет: высота — по левому краю
    sx = RHO_CATALOG * by                       # пикселей на мм выноса
    t = T_CATALOG
    y, xl, xr = rows[:, 0], rows[:, 1], rows[:, 2]
    h_l = (y - y_top) / by
    top = (h_l > 0.03 * H) & (h_l < 0.10 * H)
    xl_top = np.median(xl[top])
    xr_top = np.percentile(xr[h_l < 0.3 * H], 95)  # вверху справа сначала идёт наклонная кромка — берём сам угол блока
    cx = (xr_top - xl_top - D * sx) / L         # пикселей на мм по длине
    if cx <= 0:
        return None

    def from_right(side):
        kr = side * cx + sx
        d = D + (xr - xr_top) / kr
        h = (y - y_top - t * sx * d) / by
        return d, h

    def left_error(side):
        d, h = from_right(side)
        ok = (h >= 0) & (h <= H)
        order = np.argsort(h[ok])
        pred = xl_top + side * cx * (D - np.interp(h_l, h[ok][order], d[ok][order]))
        sel = (h_l >= 4) & (h_l <= H - 4)
        return np.abs(xl[sel] - pred[sel]) / cx   # в мм

    sides = np.linspace(0.1, 1.6, 61)
    side = float(sides[np.argmin([np.median(left_error(s_)) for s_ in sides])])
    d, h = from_right(side)
    ok = (h >= 1) & (h <= H - 1) & (d >= -2) & (d <= D * 1.15)
    line, k, cover = trace(d[ok], h[ok], H, D, 1 / (side * cx + sx))
    if line is None:
        return None
    dev = left_error(side)
    kr = side * cx + sx
    img = np.stack([xr_top + (line[:, 0] - D) * kr, y_top + by * line[:, 1] + t * sx * line[:, 0]], 1)
    return dict(line=line, cover=cover, side=round(side, 2), score=float((dev <= 3).mean()), img_line=img,
                edge=rows[:, [2, 0]], mode=f'консоль: боковой отступ ×{side:.2f}, среднее отклонение {dev.mean():.1f} мм')


def match(R, H, D):
    """Совпадение с фото: доля точек правого края, до которых профиль ближе 2 пикселей (неровность края от зерна камня)."""
    X0, Y0, m, ax, by, t, wall, y_top = R['fit']
    line = R['line']
    dense = np.concatenate([np.linspace(p, q, 6) for p, q in zip(line[:-1], line[1:])])
    img = np.stack([X0 + m * ax * dense[:, 0], Y0 + m * (by * dense[:, 1] + t * ax * dense[:, 0])], 1)
    tree = cKDTree(img)
    e = R['edge']
    # только та часть края, что принадлежит торцу (без верхней кромки и тени под изделием)
    hh = (e[:, 1] - Y0 - t * (e[:, 0] - X0)) / (m * by)
    e = e[(hh >= 1) & (hh <= H - 1)]
    dist, _ = tree.query(e)
    return float((dist <= 2).mean()), img


def draw_check(path, R, img_line, score, out):
    im = Image.open(path).convert('RGBA')
    k = 420 / im.size[1]
    big = im.resize((int(im.size[0] * k), 420))
    line = R['line']
    H, D = line[-1, 1], line[:, 0].max()
    s = 400 / max(H, D)
    tile = Image.new('RGB', (big.size[0] + 440, 460), 'white')
    tile.paste(big, (0, 30), big)
    dr = ImageDraw.Draw(tile)
    dr.line([(p[0] * k, 30 + p[1] * k) for p in img_line], fill=(220, 0, 0), width=2)
    poly = [(big.size[0] + 20, 30)] + [(big.size[0] + 20 + p[0] * s, 30 + p[1] * s) for p in line] + [(big.size[0] + 20, 30 + H * s)]
    dr.polygon(poly, outline=(220, 0, 0), fill=(245, 236, 220))
    dr.text((6, 6), f'{os.path.basename(path)}  совпадение {score * 100:.1f}%', fill='black')
    tile.save(out)


catalog = json.load(open(f'{APP}/data/catalog.json', encoding='utf-8'))
if CHECK:
    os.makedirs(CHECK, exist_ok=True)
out = {}
scores = []
for section in catalog['sections']:
    if section['id'] not in SECTIONS:
        continue
    for item in section['items']:
        if section['id'] == 'console' and not item.get('model'):
            continue  # резные консоли с листьями — не протянутый профиль
        for v in item['variants']:
            nums = [int(n) for n in v['size'].replace('×', 'x').split('x') if n.strip().isdigit()]
            if len(nums) != 3:
                continue
            H, L, D = nums
            path = f"{APP}/{v['image']}"
            # Оба способа; берём тот, что лучше совпадает с фото и покрывает всю высоту изделия
            R = None
            if section['id'] == 'console':
                # Профиль консоли обходит её с трёх сторон: слева видна не торцевая плоскость, а боковая грань
                cands = (measure_wrap(path, H, L, D),)
            else:
                cands = (measure(path, H, D), measure_left(path, H, D))
            for cand in cands:
                if cand is not None:
                    if 'score' not in cand:
                        cand['score'], cand['img_line'] = match(cand, H, D)
                    if R is None or cand['score'] * cand['cover'] > R['score'] * R['cover']:
                        R = cand
            if R is None and v['id'] in MANUAL:
                pts = MANUAL[v['id']]
                print(f"{v['id']}: задан вручную")
            elif R is None:
                print('нет сечения:', v['id'])
                continue
            else:
                score, img_line = R['score'], R['img_line']
                scores.append(score)
                print(f"{v['id']}: совпадение {score * 100:.1f}%, высота {R['cover'] * 100:.0f}%, {R['mode']}")
                if CHECK:
                    draw_check(path, R, img_line, score, f"{CHECK}/{v['id']}.png")
                line = simplify(R['line'], 0.05)  # на скруглениях точки через 1–3 мм — изгиб плавный
                pts = [[0, 0]] + [[round(float(x), 1), round(float(y), 1)] for x, y in line] + [[0, H]]
            # wrap — профиль обходит изделие спереди и с боков (консоли), extrude — протянут по длине
            kind = 'wrap' if section['id'] == 'console' else 'extrude'
            out[v['id']] = {'kind': kind, 'H': H, 'L': L, 'D': D, 'pts': pts}
            if kind == 'wrap':
                out[v['id']]['side'] = R['side'] if R else 1

json.dump(out, open(f'{APP}/data/profiles.json', 'w', encoding='utf-8'), separators=(',', ':'))
print(len(out), 'profiles; совпадение: среднее', round(np.mean(scores) * 100, 1), '%, худшее', round(min(scores) * 100, 1), '%')
