"""The floating island of the opening, modelled as a Blockbench project: a chunk of Cretaceous ground made of the mod's
own blocks that cracks in the middle when the meteor hits.

Uso: python3 -B scripts/island.py   (depois de scripts/import-mod.py, que copia as texturas de bloco)

Gera:
- art/island/island.bbmodel          projeto do Blockbench (Bedrock Entity, UV por face) com a animação "animation.island.break"
- art/island/island.png              atlas com as texturas de bloco do mod usadas na ilha
- public/assets/island/island.json   modelo compacto + animação, no formato das espécies do site
- public/assets/island/island.png e island_glow.png (o que brilha: âmbar e a lava da rachadura)

1 bloco = 16 px, a superfície fica em y = 0. A ilha é dividida em duas metades ("left" e "right") por uma rachadura
em zigue-zague; os blocos da beira da rachadura viram pedaços soltos ("debris_N") que voam na quebra. A face de cada
bloco que dá para a rachadura é lava, e só aparece quando as metades se afastam.
"""
import json
import math
import random
import sys
import uuid
import hashlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import read_png, write_png  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
BLOCKS = ROOT / 'public/assets/blocks'
rng = random.Random(1203)
uid = lambda *k: str(uuid.uuid5(uuid.NAMESPACE_URL, 'terrassic-island/' + '/'.join(map(str, k))))

# ------------------------------------------------------------------ voxels
KINDS = {  # kind: (side, top, bottom)
    'fern_ground': ('fern_litter_side', 'fern_litter', 'lateritic_soil'), 'soil': ('lateritic_soil',) * 3,
    'shale': ('shale',) * 3, 'limestone': ('limestone',) * 3, 'fossil': ('fossil_rock',) * 3, 'amber': ('amber_block',) * 3,
    'metasequoia': ('metasequoia_log', 'metasequoia_log_top', 'metasequoia_log_top'), 'metasequoia_leaves': ('metasequoia_leaves',) * 3,
    'ginkgo': ('ginkgo_log', 'ginkgo_log_top', 'ginkgo_log_top'), 'ginkgo_leaves': ('ginkgo_leaves',) * 3,
    'ash': ('volcanic_ash',) * 3, 'laterite': ('laterite',) * 3,
}
cells = {}
R = 11
crack = lambda z: round(math.sin(z * .8) * 1.2 + math.sin(z * 2.1) * .6)
for x in range(-R - 2, R + 3):
    for z in range(-R - 2, R + 3):
        a = math.atan2(z, x)
        edge = R + math.sin(a * 3 + 1) * 1.4 + math.sin(a * 7) * .8
        r = math.hypot(x, z * 1.15)
        if r > edge:
            continue
        depth = max(1, round((edge - r) * .9 + rng.random() * 2))
        for d in range(depth):
            y = -1 - d
            # Like the reference scene: lateritic soil with patches of volcanic ash, then shale over limestone.
            top = 'ash' if math.sin(x * .45 + 1) + math.cos(z * .5) > 1.1 else 'soil'
            cells[(x, y, z)] = top if d == 0 else 'soil' if d < 3 else 'fossil' if rng.random() < .03 else 'shale' if d < 5 else 'limestone'
cells[(4, -4, -8)] = 'amber'
cells[(-7, -4, 5)] = 'amber'
for (x, z) in ((-5, 7), (-4, 7), (7, 3), (2, -9), (3, -9), (2, -8)):
    if (x, -1, z) in cells:
        cells[(x, 0, z)] = 'laterite'


def tree(x, y, z, kind, h, crown):
    for i in range(h):
        cells[(x, y + i, z)] = kind
    leaves = kind + '_leaves'
    if crown == 'cone':
        for i in range(2, h + 2):
            r = max(0, round((h + 2 - i) * .38))
            for dx in range(-r, r + 1):
                for dz in range(-r, r + 1):
                    if dx * dx + dz * dz > r * r + .5 or (dx == 0 and dz == 0 and i < h) or rng.random() < .1:
                        continue
                    cells[(x + dx, y + i, z + dz)] = leaves
        cells[(x, y + h + 1, z)] = leaves
        cells[(x, y + h + 2, z)] = leaves
    else:  # umbrella: the wide, flat crown of a ginkgo
        for layer, r in ((0, 3), (1, 4), (2, 3)):
            for dx in range(-r, r + 1):
                for dz in range(-r, r + 1):
                    if dx * dx + dz * dz > r * r + 1 or rng.random() < .08:
                        continue
                    cells[(x + dx, y + h - 1 + layer, z + dz)] = leaves


tree(-8, 0, -6, 'metasequoia', 9, 'cone')
tree(8, 0, -6, 'ginkgo', 6, 'umbrella')
plants = []
names = ['bracken', 'royal_fern', 'horsetail', 'bracken']
for _ in range(40):
    x, z = round((rng.random() - .5) * R * 2), round((rng.random() - .5) * R * 1.7)
    if (x, -1, z) not in cells or cells[(x, -1, z)] != 'soil' or (x, 0, z) in cells or (math.hypot(x, z) < 4.5 and rng.random() < .85) or abs(x - crack(z)) < 1:
        continue
    if any(p[0] == x and p[2] == z for p in plants):
        continue
    plants.append((x, 0, z, names[rng.randrange(len(names))], .8 + rng.random() * .5))
plants += [(6, 0, 4, 'young_cycad', 1.4), (-4, 0, 8, 'williamsonia', 1.2), (-10, 0, 1, 'cycad_bottom', 1.3)]


def half(x, z):
    return 'left' if x < crack(z) else 'right'


# Blocks on the lip of the crack, near the surface, break off and fly.
debris = {}
for (x, y, z), k in cells.items():
    if y >= -3 and k not in ('metasequoia', 'metasequoia_leaves', 'ginkgo', 'ginkgo_leaves') and abs(x - crack(z) + .5) <= 1 and rng.random() < .3:
        debris[(x, y, z)] = f'debris_{len(debris) + 1}'
bone_of = {c: debris.get(c) or half(c[0], c[2]) for c in cells}

# ------------------------------------------------------------------ atlas
used = sorted({t for k in set(cells.values()) for t in KINDS[k]} | {p[3] for p in plants})
lava = [[(255, 196, 92, 255) if rng.random() < .3 else (240, 122, 26, 255) if rng.random() < .7 else (196, 71, 58, 255) for _ in range(16)] for _ in range(16)]
tiles = {name: read_png(BLOCKS / f'{name}.png')[2][:16] for name in used}
tiles['lava'] = lava
COLS = 8
order = list(tiles)
W, H = COLS * 16, 16 * (1 << max(0, math.ceil(math.log2(math.ceil(len(order) / COLS)))))
atlas = [[(0, 0, 0, 0)] * W for _ in range(H)]
glow = [[(0, 0, 0, 255)] * W for _ in range(H)]
cell_uv = {}
for i, name in enumerate(order):
    ox, oy = (i % COLS) * 16, (i // COLS) * 16
    for y in range(16):
        for x in range(16):
            atlas[oy + y][ox + x] = tiles[name][y][x]
            if name in ('lava', 'amber_block'):
                glow[oy + y][ox + x] = tiles[name][y][x]
    cell_uv[name] = [ox, oy, ox + 16, oy + 16]

# Random turn per block (src/blockspin.json): tops turn, sides mirror, so the ground does not repeat in a grid.
SPIN = json.loads((ROOT / 'src/blockspin.json').read_text())


def spun(tex, uv, face, x, y, z):
    h = int(hashlib.md5(f'{x},{y},{z},{face}'.encode()).hexdigest()[:8], 16)
    u0, v0, u1, v1 = uv
    if (tex in SPIN['full'] or tex in SPIN['half']) and face in ('up', 'down'):
        rot = (h % 4) * 90 if tex in SPIN['full'] else (h % 2) * 180
        if (h >> 3) & 1:
            u0, u1 = u1, u0
        return {'uv': [u0, v0, u1, v1], 'texture': 0, **({'rotation': rot} if rot else {})}
    if tex in SPIN['full'] or tex in SPIN['half'] or tex in SPIN['mirror']:
        if (h >> 3) & 1:
            u0, u1 = u1, u0
    return {'uv': [u0, v0, u1, v1], 'texture': 0}


# ------------------------------------------------------------------ cubes
FACES = {'east': (1, 0, 0), 'west': (-1, 0, 0), 'up': (0, 1, 0), 'down': (0, -1, 0), 'south': (0, 0, 1), 'north': (0, 0, -1)}
elements = []
for (x, y, z), kind in sorted(cells.items()):
    bone = bone_of[(x, y, z)]
    # A block hidden by six neighbours of its own piece can never be seen, even after the break.
    same = lambda c: c in cells and bone_of[c] == bone
    if all(same((x + d[0], y + d[1], z + d[2])) for d in FACES.values()):
        continue
    side, top, bottom = KINDS[kind]
    faces = {}
    for f, d in FACES.items():
        n = (x + d[0], y + d[1], z + d[2])
        tex = top if f == 'up' else bottom if f == 'down' else side
        # The face that looks across the crack is lava.
        if f in ('east', 'west') and n in cells and bone_of[n] != bone and bone in ('left', 'right') and bone_of[n] in ('left', 'right'):
            tex = 'lava'
        faces[f] = spun(tex, cell_uv[tex], f, x, y, z)
    elements.append(dict(name=f'{kind}_{x}_{y}_{z}', box_uv=False, rescale=False, locked=False, **{'from': [x * 16, y * 16, z * 16]},
                         to=[x * 16 + 16, y * 16 + 16, z * 16 + 16], autouv=0, color=0, inflate=0.0, origin=[x * 16 + 8, y * 16 + 8, z * 16 + 8],
                         rotation=[0, 0, 0], faces=faces, type='cube', uuid=uid('cube', x, y, z), _bone=bone))
# Plants: two crossed flat cubes, the way the game draws ferns.
for i, (x, y, z, name, s) in enumerate(plants):
    h = 16 * s
    for j, rot in enumerate((45, -45)):
        cx, cz = x * 16 + 8, z * 16 + 8
        uv = cell_uv[name]
        faces = {f: {'uv': uv if f in ('north', 'south') else [uv[0], uv[1], uv[0], uv[1]], 'texture': 0} for f in FACES}
        elements.append(dict(name=f'{name}_{i}_{j}', box_uv=False, rescale=False, locked=False, **{'from': [cx - h / 2, 0, cz]},
                             to=[cx + h / 2, h, cz], autouv=0, color=0, inflate=0.0, origin=[cx, 0, cz], rotation=[0, rot, 0], faces=faces,
                             type='cube', uuid=uid('plant', i, j), _bone=half(x, z)))

# ------------------------------------------------------------------ bones and animation
LENGTH, FPS = 3.2, 12


def ramp(t, a, b):
    x = max(0.0, min(1.0, (t - a) / (b - a)))
    return x * x * x * (x * (x * 6 - 15) + 10)


def out(t, a, b):
    x = max(0.0, min(1.0, (t - a) / (b - a)))
    return 1 - (1 - x) ** 3


pivot = {'left': [-6 * 16, -64, 0], 'right': [6 * 16, -64, 0]}
anim = {}
times = [round(i / FPS, 3) for i in range(int(LENGTH * FPS) + 1)]
for b, sign in (('left', -1), ('right', 1)):
    def pose(t, sign=sign):
        quake = math.sin(t * 60) * 1.6 * (1 - ramp(t, .1, .5))
        s = out(t, .25, 2.8)
        drop = 20 * ramp(t, .6, 3.2)
        # Values in the Bedrock convention of the mod's animation.json; the site applies (-x, y, z) to positions.
        return ([round(4 * s * sign, 3), 0, round(-16 * s * sign if sign < 0 else -20 * s, 3)],
                [round(-sign * (40 if sign < 0 else 56) * s + quake, 3), round(-(22 if sign < 0 else 38) * s - drop, 3), round(6 * s, 3)])
    anim[b] = {'rotation': {f'{t:g}': pose(t)[0] for t in times}, 'position': {f'{t:g}': pose(t)[1] for t in times}}
debris_bones = sorted(set(debris.values()), key=lambda n: int(n.split('_')[1]))
for name in debris_bones:
    (x, y, z) = next(c for c, n in debris.items() if n == name)
    side = -1 if x < crack(z) else 1
    vx, vy, vz = side * (30 + rng.random() * 90), 120 + rng.random() * 140 + y * 10, (rng.random() - .5) * 110
    spin = [(rng.random() - .5) * 720 for _ in range(3)]
    start = .15 + rng.random() * .25

    def pos(t, vx=vx, vy=vy, vz=vz, start=start):
        u = max(0.0, t - start)
        return [round(-vx * u, 3), round(vy * u - 160 * u * u, 3), round(vz * u, 3)]
    anim[name] = {'position': {f'{t:g}': pos(t) for t in times},
                  'rotation': {f'{t:g}': [round(spin[0] * max(0, t - start), 3), round(spin[1] * max(0, t - start), 3), round(spin[2] * max(0, t - start), 3)] for t in times}}
BONES = [('root', None, [0, 0, 0]), ('left', 'root', pivot['left']), ('right', 'root', pivot['right'])]
for name in debris_bones:
    (x, y, z) = next(c for c, n in debris.items() if n == name)
    BONES.append((name, 'root', [x * 16 + 8, y * 16 + 8, z * 16 + 8]))

# ------------------------------------------------------------------ Blockbench project
art = ROOT / 'art/island'
art.mkdir(parents=True, exist_ok=True)
write_png(art / 'island.png', W, H, atlas)
import base64  # noqa: E402


def outliner(name):
    node = next(b for b in BONES if b[0] == name)
    return dict(name=name, origin=node[2], rotation=[0, 0, 0], color=0, uuid=uid('bone', name), export=True, isOpen=False, locked=False,
                visibility=True, autouv=0, children=[e['uuid'] for e in elements if e['_bone'] == name] + [outliner(b[0]) for b in BONES if b[1] == name])


def bb_keyframes(bone, channels):
    out_ = []
    for ch, frames in channels.items():
        for t, (x, y, z) in frames.items():
            if ch == 'rotation':
                x, y = -x, -y
            if ch == 'position':
                x = -x
            out_.append(dict(channel=ch, data_points=[dict(x=x, y=y, z=z)], time=float(t), color=-1, interpolation='catmullrom', uuid=uid('key', bone, ch, t)))
    return out_


bbmodel = {
    'meta': {'format_version': '4.5', 'model_format': 'bedrock', 'box_uv': False}, 'name': 'island', 'model_identifier': 'island',
    'visible_box': [26, 20, -2], 'variable_placeholders': '', 'variable_placeholder_buttons': [], 'resolution': {'width': W, 'height': H},
    'elements': [{k: v for k, v in e.items() if not k.startswith('_')} for e in elements], 'outliner': [outliner('root')],
    'textures': [dict(path='', name='island.png', folder='', namespace='', id='0', particle=False, render_mode='default', visible=True, mode='bitmap',
                      saved=True, uuid=uid('texture'), source='data:image/png;base64,' + base64.b64encode((art / 'island.png').read_bytes()).decode())],
    'animations': [dict(uuid=uid('anim'), name='animation.island.break', loop='hold', override=False, length=LENGTH, snapping=20, selected=False,
                        anim_time_update='', blend_weight='', start_delay='', loop_delay='',
                        animators={uid('bone', b): dict(name=b, type='bone', keyframes=bb_keyframes(b, ch)) for b, ch in anim.items()})],
}
(art / 'island.bbmodel').write_text(json.dumps(bbmodel, separators=(',', ':')))

# ------------------------------------------------------------------ site files
ORDER = ['east', 'west', 'up', 'down', 'south', 'north']


def compact_bone(name):
    node = next(b for b in BONES if b[0] == name)
    kids = [i for i, e in enumerate(elements) if e['_bone'] == name] + [compact_bone(b[0]) for b in BONES if b[1] == name]
    return {'n': name, 'o': node[2], 'k': kids}


site = {'model': {'res': [W, H], 'bones': [compact_bone('root')],
                  'cubes': [[e['name'], e['from'], e['to'], e['origin'], e['rotation'], 0, [e['faces'][f]['uv'] + ([e['faces'][f]['rotation']] if e['faces'][f].get('rotation') else []) for f in ORDER]] for e in elements]},
        'animations': {'break': {'len': LENGTH, 'loop': False, 'bones': anim}},
        'rex': [-4 * 16, 0, 1 * 16], 'impact': [crack(0) * 16, 0, 0]}
outdir = ROOT / 'public/assets/island'
outdir.mkdir(parents=True, exist_ok=True)
(outdir / 'island.json').write_text(json.dumps(site, separators=(',', ':')))
write_png(outdir / 'island.png', W, H, atlas)
write_png(outdir / 'island_glow.png', W, H, glow)
print(f'{len(elements)} cubos, {len(BONES)} ossos ({len(debris_bones)} pedaços soltos), atlas {W}x{H}: art/island/island.bbmodel')
