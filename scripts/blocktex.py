"""Softer block textures for the site's scenery, drawn by code in the spirit of today's Minecraft textures.

Uso: python3 -B scripts/blocktex.py [--sheet caminho.png]

Regras (a partir do guia de texturas do Faithful e da revisão de texturas do Minecraft 1.14):
- paletas pequenas por material (4 a 6 tons), com o escuro puxando para o frio e o claro para o quente;
- o tom mais escuro nunca encosta no mais claro, e não ficam pixels soltos sem vizinho da mesma cor;
- formas agrupadas (pedras, tufos de folha, veios) em vez de ruído pixel a pixel;
- luz vindo de cima e da esquerda; folhas sem pontilhado; madeira com veios verticais;
- tudo emenda sem costura (o ruído e as células são periódicos em 16 px).
As texturas saem em public/assets/blocks/ com os mesmos nomes dos blocos do mod, que o site usa nos cenários.
"""
import colorsys
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import write_png  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/blocks'
N = 16
CLEAR = (0, 0, 0, 0)


# ------------------------------------------------------------------ colour
def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def ramp(mid, n=5, step=.085, hue=.028, sat=.0):
    """Dark to light. Darker tones shift towards blue/purple and lighter ones towards yellow, like hand-made palettes."""
    r, g, b = hexrgb(mid)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    out = []
    for i in range(n):
        k = i - (n - 1) / 2
        hh = (h - hue * k * (1 if h < .5 or h > .85 else -1)) % 1  # warm materials cool down, cool ones warm up in the lights
        ll = min(.95, max(.04, l + step * k))
        ss = min(1, max(0, s * (1 + sat * k) * (1 - .06 * abs(k))))
        rr, gg, bb = colorsys.hls_to_rgb(hh, ll, ss)
        out.append((round(rr * 255), round(gg * 255), round(bb * 255), 255))
    return out


# ------------------------------------------------------------------ periodic noise and cleanup
def noise(seed, cells=4, octaves=2):
    """Smooth value noise that tiles every 16 px."""
    rng = random.Random(seed)
    field = [[0.0] * N for _ in range(N)]
    amp, total = 1.0, 0.0
    for o in range(octaves):
        c = cells * (2 ** o)
        grid = [[rng.random() for _ in range(c)] for _ in range(c)]
        for y in range(N):
            for x in range(N):
                fx, fy = x / N * c, y / N * c
                x0, y0 = int(fx), int(fy)
                tx, ty = fx - x0, fy - y0
                tx, ty = tx * tx * (3 - 2 * tx), ty * ty * (3 - 2 * ty)
                a, b = grid[y0 % c][x0 % c], grid[y0 % c][(x0 + 1) % c]
                cc, d = grid[(y0 + 1) % c][x0 % c], grid[(y0 + 1) % c][(x0 + 1) % c]
                field[y][x] += amp * ((a * (1 - tx) + b * tx) * (1 - ty) + (cc * (1 - tx) + d * tx) * ty)
        total += amp
        amp *= .5
    return [[v / total for v in row] for row in field]


def quantize(field, levels, bias=0.0, spread=1.0):
    lo = min(min(r) for r in field)
    hi = max(max(r) for r in field)
    out = []
    for row in field:
        out.append([max(0, min(levels - 1, int(((v - lo) / (hi - lo + 1e-9) - .5) * spread * levels + levels / 2 + bias))) for v in row])
    return out


def tidy(idx, passes=2):
    """Remove lone pixels (no 4-neighbour of the same tone) and keep darkest and lightest tones apart."""
    for _ in range(passes):
        new = [row[:] for row in idx]
        for y in range(N):
            for x in range(N):
                v = idx[y][x]
                nb = [idx[(y - 1) % N][x], idx[(y + 1) % N][x], idx[y][(x - 1) % N], idx[y][(x + 1) % N]]
                if v not in nb:
                    new[y][x] = max(set(nb), key=nb.count)
        idx = new
    top = max(max(r) for r in idx)
    for y in range(N):
        for x in range(N):
            if idx[y][x] == 0 and any(idx[(y + dy) % N][(x + dx) % N] == top for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                idx[y][x] = 1
    return idx


def paint(idx, pal):
    return [[pal[v] if v is not None and v >= 0 else CLEAR for v in row] for row in idx]


# ------------------------------------------------------------------ shapes
def voronoi(seed, count, stretch=(1.0, 1.0)):
    """Cells on a torus: returns (cell id, distance to edge) per pixel."""
    rng = random.Random(seed)
    pts = [(rng.random() * N, rng.random() * N) for _ in range(count)]
    cell = [[0] * N for _ in range(N)]
    edge = [[0.0] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            ds = []
            for i, (px, py) in enumerate(pts):
                dx = min(abs(x + .5 - px), N - abs(x + .5 - px)) * stretch[0]
                dy = min(abs(y + .5 - py), N - abs(y + .5 - py)) * stretch[1]
                ds.append((dx * dx + dy * dy, i))
            ds.sort()
            cell[y][x] = ds[0][1]
            edge[y][x] = math.sqrt(ds[1][0]) - math.sqrt(ds[0][0])
    return cell, edge


def stones(seed, pal, count=9, stretch=(1, 1), gap=.9, rough=True):
    """Rocks or cobbles: each stone has its own tone, a 1 px lit rim at the top-left, a 1 px shade at the
    bottom-right and a thin gap in the darkest tone. No per-pixel noise inside the stones."""
    rng = random.Random(seed)
    cell, edge = voronoi(seed, count, stretch)
    top = len(pal) - 1
    base = {i: rng.choice((top - 2, top - 1, top - 1)) for i in range(count)}
    tex = noise(seed + 7, 8, 1)
    idx = [[0] * N for _ in range(N)]
    for y in range(N):
        for x in range(N):
            c = cell[y][x]
            if edge[y][x] < gap:
                idx[y][x] = 0
                continue
            v = base[c]
            up, left = cell[(y - 1) % N][x] != c or edge[(y - 1) % N][x] < gap, cell[y][(x - 1) % N] != c or edge[y][(x - 1) % N] < gap
            down, right = cell[(y + 1) % N][x] != c or edge[(y + 1) % N][x] < gap, cell[y][(x + 1) % N] != c or edge[y][(x + 1) % N] < gap
            if up or left:
                v += 1
            elif down or right:
                v -= 1
            elif rough and tex[y][x] > .7:
                v += 1
            elif rough and tex[y][x] < .22:
                v -= 1
            idx[y][x] = max(1, min(top, v))
    return idx


def clusters(seed, mid=2, cells=8, hi=.64, lo=.32, top=4):
    """A mid tone with small lighter and darker clusters, the base of earth, grass and sand."""
    a, b = noise(seed, cells, 1), noise(seed + 101, cells, 1)
    idx = [[mid + (1 if a[y][x] > hi else 0) - (1 if b[y][x] < lo else 0) for x in range(N)] for y in range(N)]
    return tidy([[max(0, min(top, v)) for v in row] for row in idx], 1)


def soil(seed, pal, cells=8, pebbles=0, pebble_pal=None):
    img = paint(clusters(seed, 2, cells, top=len(pal) - 1), pal)
    rng = random.Random(seed + 3)
    pp = pebble_pal or pal
    for _ in range(pebbles):
        x, y = rng.randrange(N), rng.randrange(N)
        img[y][x] = pp[-1]
        img[y][(x + 1) % N] = pp[-2]
        img[(y + 1) % N][x] = pp[1]
        img[(y + 1) % N][(x + 1) % N] = pp[1]
    return img


def bark(seed, pal, groove=3, fibres=True):
    """Vertical fibres in runs of a few pixels, with darker grooves that break now and then."""
    rng = random.Random(seed)
    top = len(pal) - 1
    idx = [[0] * N for _ in range(N)]
    for x in range(N):
        col = x % groove
        base = 1 if col == 0 else top - 1 if col == 1 else 2
        y = rng.randrange(N)
        for _ in range(N):
            run = rng.randrange(3, 7)
            shift = rng.choice((0, 0, 1, -1)) if col else rng.choice((0, 0, 0, 1))
            for k in range(run):
                yy = (y + k) % N
                idx[yy][x] = max(0, min(top, base + shift - (1 if col == 0 and rng.random() < .5 else 0)))
            y = (y + run) % N
    return paint(tidy(idx, 1), pal)


def rings(seed, wood, bark_pal):
    img = [[CLEAR] * N for _ in range(N)]
    f = noise(seed, 4, 1)
    for y in range(N):
        for x in range(N):
            if x in (0, N - 1) or y in (0, N - 1):
                img[y][x] = bark_pal[1 + (x + y) % 2]
                continue
            d = math.hypot(x - 7.5, y - 7.5) + f[y][x] * 1.2
            img[y][x] = wood[1 + int(d) % 2 + (1 if d < 2 else 0)]
    return img


def leaves(seed, pal, holes=.05, cluster=3, flowers=None):
    """Tufts of leaves, lit from the top-left; the hollows between tufts are the darkest tone or a gap to the sky."""
    rng = random.Random(seed)
    idx = [[0] * N for _ in range(N)]
    for _ in range(34):
        cx, cy = rng.randrange(N), rng.randrange(N)
        w, h = rng.choice(((3, 2), (2, 2), (3, 3), (2, 3))) if cluster < 3 else rng.choice(((3, 3), (4, 3), (3, 2)))
        for dy in range(h):
            for dx in range(w):
                x, y = (cx + dx) % N, (cy + dy) % N
                v = 3 if (dx == 0 and dy == 0) or (dx + dy == 1 and rng.random() < .5) else 1 if (dx == w - 1 and dy == h - 1) else 2
                if v > idx[y][x] or idx[y][x] == 0:
                    idx[y][x] = v
    img = paint([[max(1, v) for v in row] for row in idx], pal)
    gaps = [(x, y) for y in range(N) for x in range(N) if idx[y][x] == 0]
    rng.shuffle(gaps)
    for x, y in gaps[:int(N * N * holes)]:
        img[y][x] = CLEAR
    for (x, y, c) in (flowers or []):
        img[y][x] = c
        img[y][(x + 1) % N] = c
    return img


# ------------------------------------------------------------------ plants (cross models, transparent)
def canvas():
    return [[CLEAR] * N for _ in range(N)]


def put(img, x, y, c):
    if 0 <= x < N and 0 <= y < N:
        img[y][x] = c


def blade(img, x0, h, lean, pal, width=1):
    for i in range(h):
        t = i / max(1, h - 1)
        x = round(x0 + lean * t * t * h * .5)
        c = pal[min(len(pal) - 1, 1 + int(t * (len(pal) - 1)))]
        for w in range(width if t < .6 else 1):
            put(img, x + w, N - 1 - i, c)


def frond(img, x0, y0, length, angle, pal, leaflet=3):
    """A fern frond: a stem with alternating leaflets that shorten towards the tip."""
    for i in range(length):
        t = i / length
        x = x0 + math.cos(angle) * i
        y = y0 - math.sin(angle) * i
        put(img, round(x), round(y), pal[1])
        if i % 2 == 0 and i > 0:
            side = 1 if (i // 2) % 2 else -1
            ll = max(1, round(leaflet * (1 - t) + .5))
            for k in range(1, ll + 1):
                nx = x + math.cos(angle + side * 1.3) * k
                ny = y - math.sin(angle + side * 1.3) * k
                put(img, round(nx), round(ny), pal[2 + (1 if k == 1 and side < 0 else 0) if len(pal) > 3 else 2])


# ------------------------------------------------------------------ the blocks
GREEN = ramp('#5b8a3a', 5, .06, .03)
FERN = ramp('#5f8c3c', 5, .055, .035)
SOIL = ramp('#7a5238', 5, .05, .02)
EARTH = ramp('#8a6a48', 5, .055)
STONE = ramp('#807c76', 5, .06, .02)
SHALE = ramp('#5c6168', 5, .06, .015)
LIME = ramp('#c2b597', 5, .05, .02)
CHALK = ramp('#e4ddcd', 4, .035)
ASH = ramp('#8a8580', 5, .055)
LATER = ramp('#9a5c42', 5, .055, .02)
MUD = ramp('#b39a72', 4, .05)
SALT = ramp('#e6e2d8', 4, .035)
AMBER = ramp('#e0962c', 5, .07, .03)
BONE = ramp('#d8ccb2', 4, .06)
WATER = ramp('#3f6f9a', 4, .06, -.01)


def grass_side(top, under, seed):
    """Earth with the top layer hanging over the edge in an uneven fringe, like today's grass block."""
    img = soil(seed, under, 8, pebbles=2)
    rng = random.Random(seed)
    for x in range(N):
        d = 2 + rng.choice((0, 0, 1, 1, 1, 2)) + (2 if rng.random() < .12 else 0)
        for y in range(d):
            img[y][x] = top[3 if y == 0 and rng.random() < .6 else 2 if y < d - 1 else 1]
    return img


def ground_top(seed, pal, soil_pal, bare=.12):
    idx = clusters(seed, 2, 8, hi=.62, lo=.3, top=len(pal) - 1)
    img = paint(idx, pal)
    rng = random.Random(seed + 5)
    for _ in range(5):
        x, y = rng.randrange(N), rng.randrange(N)
        if idx[y][x] >= 2:
            img[y][x] = pal[min(len(pal) - 1, 4)]
            img[y][(x + 1) % N] = pal[3]
    for _ in range(int(bare * 30)):
        x, y = rng.randrange(N), rng.randrange(N)
        img[y][x] = soil_pal[2]
        img[y][(x + 1) % N] = soil_pal[1]
    return img


TEX = {}
TEX['fern_litter'] = ground_top(11, FERN, SOIL)
TEX['fern_litter_side'] = grass_side(FERN, SOIL, 12)
NEEDLE = ramp('#9a6a3a', 5, .06, .02)
TEX['needle_litter'] = ground_top(13, NEEDLE, SOIL, .05)
TEX['needle_litter_side'] = grass_side(NEEDLE, SOIL, 14)
TEX['lateritic_soil'] = soil(15, SOIL, 4, pebbles=3, pebble_pal=EARTH)
TEX['packed_earth_floor'] = soil(16, EARTH, 2)
TEX['laterite'] = paint(stones(17, LATER, 7, gap=.7), LATER)
TEX['volcanic_ash'] = soil(18, ASH, 4, pebbles=4, pebble_pal=SHALE)
TEX['shale'] = paint(stones(19, SHALE, 6, stretch=(.45, 1.6), gap=.7), SHALE)
TEX['limestone'] = paint(stones(20, LIME, 8, gap=.6), LIME)
TEX['chalk'] = soil(21, CHALK, 2)
TEX['gneiss_stacked'] = paint(stones(22, STONE, 14, stretch=(.6, 1.3), gap=.8, rough=True), STONE)
TEX['gneiss_flagstone'] = paint(stones(23, STONE, 5, gap=.8, rough=False), STONE)
TEX['limestone_flagstone'] = paint(stones(24, LIME, 5, gap=.8, rough=False), LIME)
TEX['menhir'] = paint(stones(25, STONE, 5, stretch=(1.6, .6), gap=.6), STONE)
TEX['menhir_top'] = paint(stones(26, STONE, 4, gap=.6), STONE)
TEX['salt_crust'] = paint(stones(27, SALT, 7, gap=.5, rough=False), SALT)


def cracked(seed, pal):
    cell, edge = voronoi(seed, 6)
    img = soil(seed, pal, 4)
    for y in range(N):
        for x in range(N):
            if edge[y][x] < .55:
                img[y][x] = pal[0]
            elif edge[y][x] < 1.3 and cell[(y - 1) % N][x] != cell[y][x]:
                img[y][x] = pal[-1]
    return img


TEX['cracked_mud'] = cracked(28, MUD)


def fossil(seed):
    img = paint(stones(seed, STONE, 7, gap=.7), STONE)
    for (x0, y0, dx, dy, n) in ((3, 4, 1, 1, 6), (10, 9, 1, -1, 5), (6, 12, 1, 0, 4)):
        for i in range(n):
            x, y = (x0 + dx * i) % N, (y0 + dy * i) % N
            img[y][x] = BONE[2]
            img[(y + 1) % N][x] = BONE[1]
        img[y0][x0] = BONE[3]
    return img


TEX['fossil_rock'] = fossil(29)


def amber(seed):
    """Temporal Amber: smooth facets (no dithering), each lit at the top-left, with a few bright inclusions."""
    cell, edge = voronoi(seed, 5)
    rng = random.Random(seed)
    base = {i: rng.choice((2, 2, 3)) for i in range(5)}
    img = canvas()
    for y in range(N):
        for x in range(N):
            c = cell[y][x]
            v = base[c]
            if edge[y][x] < .7:
                v = 1
            elif cell[(y - 1) % N][x] != c or cell[y][(x - 1) % N] != c:
                v = 4
            img[y][x] = AMBER[v]
    for x, y in ((4, 4), (11, 10)):
        img[y][x] = (255, 236, 186, 255)
    return img


TEX['amber_block'] = amber(30)
TEX['bone_pile'] = paint(stones(31, BONE, 6, stretch=(1.5, .7), gap=.9, rough=False), BONE)
TEX['rib_bone'] = TEX['bone_pile']


def water(seed):
    f = noise(seed, 2, 2)
    idx = tidy(quantize(f, 3, bias=.3))
    img = paint([[v for v in row] for row in idx], WATER)
    for y in range(0, N, 5):
        for x in range(N):
            if (x + y // 5 * 3) % 8 < 3:
                img[y][x] = WATER[3]
    return img


TEX['basin_water'] = water(32)

# Trees: bark, end grain and leaves per species.
WOODS = {
    'metasequoia': ('#7a4232', '#b77a55', '#4d7a34', dict(cluster=2.6, holes=.06)),
    'araucaria': ('#6b5a4a', '#a88a66', '#3c6448', dict(cluster=2.2, holes=.07)),
    'magnolia': ('#7d7468', '#b8a585', '#3e6438', dict(cluster=3.2, holes=.04)),
    'tree_fern': ('#4e3b2c', '#8a6a48', '#5a8c3c', dict(cluster=2.8, holes=.08)),
    'podocarpus': ('#6a4a34', '#a8805a', '#3e6a3e', dict(cluster=2.6, holes=.05)),
    'taxodium': ('#7f4a34', '#b88258', '#4f7a4c', dict(cluster=2.4, holes=.06)),
}
for i, (name, (bark_hex, wood_hex, leaf_hex, opts)) in enumerate(WOODS.items()):
    bp, wp = ramp(bark_hex, 5, .06, .02), ramp(wood_hex, 4, .06)
    TEX[f'{name}_log'] = bark(40 + i, bp, groove=3 if name != 'tree_fern' else 4)
    TEX[f'{name}_log_top'] = rings(50 + i, wp, bp)
    lp = ramp(leaf_hex, 5, .055, .035)
    flowers = [(3, 4, (240, 230, 220, 255)), (11, 10, (236, 214, 220, 255)), (7, 13, (240, 230, 220, 255))] if name == 'magnolia' else None
    TEX[f'{name}_leaves'] = leaves(60 + i, lp, flowers=flowers, **opts)

# Plants.
def tall_grass(seed, pal, blades=7, h=(8, 15)):
    rng = random.Random(seed)
    img = canvas()
    for i in range(blades):
        blade(img, 1 + i * 2 + rng.randrange(2), rng.randrange(*h), rng.choice((-1, -.5, .5, 1)), pal)
    return img


def fern_plant(seed, pal, fronds=5, length=8):
    rng = random.Random(seed)
    img = canvas()
    for i in range(fronds):
        a = math.pi / 2 + (i - (fronds - 1) / 2) * .3 + (rng.random() - .5) * .12
        frond(img, 7.5, 15, length + rng.randrange(-1, 3), a, pal)
    return img


def horsetail(seed, pal):
    img = canvas()
    for x0, h in ((4, 14), (8, 12), (11, 15)):
        for i in range(h):
            y = N - 1 - i
            put(img, x0, y, pal[2] if i % 3 else pal[1])
            if i % 3 == 0 and i > 2:
                put(img, x0 - 1, y + 1, pal[3])
                put(img, x0 + 1, y + 1, pal[3])
        put(img, x0, N - h, (170, 140, 90, 255))
    return img


def cycad(seed, pal, trunk=4, flower=False):
    img = canvas()
    tp = ramp('#6a5038', 4, .07)
    for y in range(N - trunk, N):
        put(img, 7, y, tp[1 + y % 2])
        put(img, 8, y, tp[2])
    for i, a in enumerate((.35, .9, 1.5, 2.2, 2.75)):
        frond(img, 7.5, N - trunk, 7, a, pal, leaflet=2)
    if flower:
        for y in range(N - trunk - 3, N - trunk):
            put(img, 7, y, (214, 170, 70, 255))
            put(img, 8, y, (190, 140, 60, 255))
    return img


TEX['cretaceous_grass'] = tall_grass(70, ramp('#6f9a40', 5, .075, .03))
TEX['bracken'] = fern_plant(71, FERN, length=13)
TEX['royal_fern'] = fern_plant(72, ramp('#6f9a46', 5, .07, .03), fronds=4, length=12)
TEX['tall_bracken_bottom'] = fern_plant(73, FERN, fronds=4, length=11)
TEX['tall_bracken_top'] = fern_plant(74, FERN, fronds=3, length=7)
TEX['horsetail'] = horsetail(75, ramp('#6c8f3a', 5, .07, .03))
TEX['clubmoss'] = tall_grass(76, ramp('#5b8a44', 5, .07, .03), blades=6, h=(4, 8))
TEX['young_cycad'] = cycad(77, ramp('#55853c', 5, .075, .03), trunk=2)
TEX['cycad_bottom'] = cycad(78, ramp('#4f7f3a', 5, .075, .03), trunk=5)
TEX['cycad_top'] = fern_plant(79, ramp('#4f7f3a', 5, .075, .03))
TEX['williamsonia'] = cycad(80, ramp('#5a8a40', 5, .075, .03), trunk=3, flower=True)
TEX['archaefructus'] = tall_grass(81, ramp('#7aa65a', 5, .075, .03), blades=5, h=(6, 12))
TEX['lichen'] = tall_grass(82, ramp('#9aa38a', 4, .06), blades=6, h=(2, 5))


def sheet(path, names=None):
    """Each texture at 6x, then a 3x3 tiling at 2x to check the seams."""
    names = names or sorted(TEX)
    S, T, gap, cols = 6, 2, 8, 6
    cw, ch = N * S + N * 3 * T + gap * 2, N * S + gap * 2
    rows = math.ceil(len(names) / cols)
    W, H = cols * cw, rows * ch
    img = [[(40, 36, 44, 255)] * W for _ in range(H)]
    for n, name in enumerate(names):
        ox, oy = (n % cols) * cw + gap, (n // cols) * ch + gap
        t = TEX[name]
        for y in range(N * S):
            for x in range(N * S):
                c = t[y // S][x // S]
                if c[3]:
                    img[oy + y][ox + x] = c
        for y in range(N * 3 * T):
            for x in range(N * 3 * T):
                c = t[(y // T) % N][(x // T) % N]
                if c[3] and oy + y < H:
                    img[oy + y][ox + N * S + 4 + x] = c
    write_png(Path(path), W, H, img)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, t in TEX.items():
        write_png(OUT / f'{name}.png', N, N, t)
    if '--sheet' in sys.argv:
        only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
        sheet(sys.argv[sys.argv.index('--sheet') + 1], only)
    print(f'{len(TEX)} texturas de bloco em {OUT.relative_to(ROOT)}')


NAMES = sorted(TEX)
if __name__ == '__main__':
    main()
