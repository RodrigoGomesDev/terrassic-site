"""The meteor of the opening: a burning rock modelled as a Blockbench project, with its texture and animation.

Uso: python3 -B scripts/meteor.py

Gera:
- art/meteor/meteor.bbmodel         projeto do Blockbench (Bedrock Entity, box UV), abre e edita como os dinossauros do mod
- art/meteor/meteor.png             textura (a mesma embutida no .bbmodel)
- public/assets/meteor/meteor.json  modelo compacto + animação, no mesmo formato das espécies do site
- public/assets/meteor/meteor.png e meteor_glow.png (o que brilha: rachaduras, chamas e brasas)

Tudo é desenhado aqui: cubos, pintura e curvas. Convenções do mod: 16 px = 1 bloco, a frente olha para -Z,
então as chamas ficam para trás (+Z). Animação "animation.meteor.fall": a rocha gira, as chamas tremulam e as
brasas orbitam.
"""
import base64
import json
import math
import random
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from png import write_png  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
TEX = 256
LENGTH = 2.0
rng = random.Random(66)
uid = lambda *k: str(uuid.uuid5(uuid.NAMESPACE_URL, 'terrassic-meteor/' + '/'.join(map(str, k))))

# ------------------------------------------------------------------ cubes: (bone, name, from, to, rotation, kind)
CUBES = [
    ('rock', 'core', [-16, 8, -16], [16, 40, 16], [0, 0, 0], 'rock'),
    ('rock', 'chunk_w', [-22, 14, -10], [-12, 32, 8], [0, 0, 12], 'rock'),
    ('rock', 'chunk_ne', [6, 30, -14], [20, 44, 4], [18, 0, -14], 'rock'),
    ('rock', 'chunk_top', [-10, 36, -6], [6, 47, 10], [0, 22, 0], 'rock'),
    ('rock', 'chunk_front', [-8, 3, -22], [12, 19, -10], [-16, 10, 0], 'rock'),
    ('rock', 'chunk_se', [9, 10, 6], [21, 24, 19], [0, -18, 10], 'rock'),
    ('rock', 'chunk_low', [-14, 2, 4], [2, 12, 18], [8, 0, -8], 'rock'),
    ('flame1', 'flame_core', [-15, 9, 12], [15, 39, 32], [0, 0, 0], 'flame_hot'),
    ('flame2', 'flame_mid', [-11, 13, 30], [11, 35, 54], [0, 0, 0], 'flame'),
    ('flame3', 'flame_tail', [-7, 17, 52], [7, 31, 80], [0, 0, 0], 'flame'),
    ('flame4', 'flame_tip', [-3, 21, 78], [3, 27, 104], [0, 0, 0], 'flame_cool'),
]
EMBERS = [(18, 34, 10), (-20, 30, 20), (10, 6, 30), (-8, 44, 34), (22, 18, 40), (-16, 10, 46)]
for i, (x, y, z) in enumerate(EMBERS):
    CUBES.append((f'ember{i + 1}', f'ember{i + 1}', [x - 1.5, y - 1.5, z - 1.5], [x + 1.5, y + 1.5, z + 1.5], [0, 0, 0], 'ember'))
PIVOT = [0, 24, 0]
BONES = [('root', None, [0, 0, 0]), ('rock', 'root', PIVOT), ('flames', 'root', PIVOT)]
BONES += [(f'flame{i}', 'flames', [0, 24, 10 + i * 18]) for i in range(1, 5)]
BONES += [('embers', 'root', PIVOT)] + [(f'ember{i + 1}', 'embers', PIVOT) for i in range(len(EMBERS))]

# ------------------------------------------------------------------ box UV packing (Blockbench layout)
def box_faces(size, off):
    w, h, d = (int(math.ceil(v)) for v in size)
    u, v = off
    return {'east': [u, v + d, u + d, v + d + h], 'north': [u + d, v + d, u + d + w, v + d + h],
            'west': [u + d + w, v + d, u + 2 * d + w, v + d + h], 'south': [u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h],
            'up': [u + d, v, u + d + w, v + d], 'down': [u + d + w, v, u + d + 2 * w, v + d]}


layout, x, y, row = [], 0, 0, 0
for c in CUBES:
    size = [c[3][i] - c[2][i] for i in range(3)]
    fw, fh = int(2 * (math.ceil(size[2]) + math.ceil(size[0]))), int(math.ceil(size[2]) + math.ceil(size[1]))
    if x + fw > TEX:
        x, y, row = 0, y + row, 0
    layout.append((x, y))
    x, row = x + fw, max(row, fh)
assert y + row <= TEX, 'texture too small'

# ------------------------------------------------------------------ painting
img = [[(0, 0, 0, 0)] * TEX for _ in range(TEX)]
glow = [[(0, 0, 0, 255)] * TEX for _ in range(TEX)]
ROCK = [(26, 22, 28), (42, 35, 41), (58, 48, 54), (36, 30, 34), (82, 69, 80)]
HOT = {'flame_hot': [(255, 236, 170), (255, 210, 122), (255, 186, 80)], 'flame': [(255, 196, 92), (242, 150, 50), (240, 122, 26)],
       'flame_cool': [(240, 122, 26), (214, 92, 30), (196, 71, 58)], 'ember': [(255, 226, 150), (255, 200, 90)]}


def paint_face(kind, rect):
    x0, y0, x1, y1 = rect
    for py in range(y0, y1):
        for px in range(x0, x1):
            if kind == 'rock':
                c = ROCK[rng.randrange(len(ROCK))] if rng.random() < .55 else ROCK[1]
                img[py][px] = (*c, 255)
            else:
                pal = HOT[kind]
                c = pal[rng.randrange(len(pal))]
                img[py][px] = (*c, 255)
                glow[py][px] = (*c, 255)
    if kind == 'rock':
        # Lava veins: short random walks in amber and rift orange, the only rock pixels that glow.
        area = (x1 - x0) * (y1 - y0)
        for _ in range(max(1, area // 70)):
            px, py = rng.randrange(x0, x1), rng.randrange(y0, y1)
            for _ in range(rng.randrange(4, 14)):
                c = (255, 196, 92) if rng.random() < .35 else (240, 122, 26)
                img[py][px] = (*c, 255)
                glow[py][px] = (*c, 255)
                px = min(x1 - 1, max(x0, px + rng.choice((-1, 0, 1))))
                py = min(y1 - 1, max(y0, py + rng.choice((-1, 0, 1))))


elements = []
for (bone, name, frm, to, rot, kind), off in zip(CUBES, layout):
    size = [to[i] - frm[i] for i in range(3)]
    faces = box_faces(size, off)
    for f, r in faces.items():
        paint_face(kind, r)
    origin = [(frm[i] + to[i]) / 2 for i in range(3)]
    elements.append(dict(name=name, box_uv=True, rescale=False, locked=False, **{'from': frm}, to=to, autouv=0, color=0, inflate=0.0,
                         origin=origin, rotation=rot, uv_offset=list(off), faces={f: {'uv': r, 'texture': 0} for f, r in faces.items()},
                         type='cube', uuid=uid('cube', name), _bone=bone, _kind=kind))

# ------------------------------------------------------------------ animation (values in the mod's animation.json convention)
def keys(fn, times, mode='catmullrom'):
    return {f'{t:g}': ({'post': fn(t), 'lerp_mode': mode} if mode != 'catmullrom' else fn(t)) for t in times}


T5 = [0, .5, 1, 1.5, 2]
T9 = [i / 4 for i in range(9)]
anim = {
    'rock': {'rotation': keys(lambda t: [round(-360 * t / LENGTH, 3), 0, round(180 * t / LENGTH, 3)], [0, 2], 'linear')},
    'flames': {'rotation': keys(lambda t: [round(2 * math.sin(t * math.pi), 3), round(3 * math.sin(t * math.pi * 2), 3), 0], T9)},
    'embers': {'rotation': keys(lambda t: [0, 0, round(360 * t / LENGTH, 3)], [0, 2], 'linear')},
}
for i in range(1, 5):
    amp = .08 + i * .05
    anim[f'flame{i}'] = {'scale': keys(lambda t, i=i, a=amp: [round(1 + a * math.sin(t * math.pi * 2 * (i + 1) + i), 3),
                                                              round(1 + a * .8 * math.sin(t * math.pi * 2 * (i + 1) + i + 1.3), 3),
                                                              round(1 + a * 1.4 * math.sin(t * math.pi * 2 * (i + 1) + i * 2), 3)], T9)}
for i in range(len(EMBERS)):
    anim[f'ember{i + 1}'] = {'position': keys(lambda t, i=i: [0, round(2 * math.sin(t * math.pi * 2 + i), 3), round(-3 * math.sin(t * math.pi + i), 3)], T9),
                             'scale': keys(lambda t, i=i: [round(1 + .5 * math.sin(t * math.pi * 4 + i * 1.7), 3)] * 3, T9)}

# ------------------------------------------------------------------ Blockbench project
texture_png = ROOT / 'art/meteor/meteor.png'
texture_png.parent.mkdir(parents=True, exist_ok=True)
write_png(texture_png, TEX, TEX, img)


def outliner(name):
    node = next(b for b in BONES if b[0] == name)
    return dict(name=name, origin=node[2], rotation=[0, 0, 0], color=0, uuid=uid('bone', name), export=True, isOpen=False,
                locked=False, visibility=True, autouv=0,
                children=[e['uuid'] for e in elements if e['_bone'] == name] + [outliner(b[0]) for b in BONES if b[1] == name])


def bb_keyframes(bone, channels):
    out = []
    for ch, frames in channels.items():
        for t, v in frames.items():
            mode = v.get('lerp_mode', 'catmullrom') if isinstance(v, dict) else 'catmullrom'
            x, y, z = v['post'] if isinstance(v, dict) else v
            # Blockbench stores rotation as (-x, -y, z) and position as (-x, y, z) of the exported Bedrock file.
            if ch == 'rotation':
                x, y = -x, -y
            if ch == 'position':
                x = -x
            out.append(dict(channel=ch, data_points=[dict(x=x, y=y, z=z)], time=float(t), color=-1, interpolation=mode, uuid=uid('key', bone, ch, t)))
    return out


bbmodel = {
    'meta': {'format_version': '4.5', 'model_format': 'bedrock', 'box_uv': True}, 'name': 'meteor', 'model_identifier': 'meteor',
    'visible_box': [3, 3, 1], 'variable_placeholders': '', 'variable_placeholder_buttons': [], 'resolution': {'width': TEX, 'height': TEX},
    'elements': [{k: v for k, v in e.items() if not k.startswith('_')} for e in elements], 'outliner': [outliner('root')],
    'textures': [dict(path='', name='meteor.png', folder='', namespace='', id='0', particle=False, render_mode='default', visible=True,
                      mode='bitmap', saved=True, uuid=uid('texture'), source='data:image/png;base64,' + base64.b64encode(texture_png.read_bytes()).decode())],
    'animations': [dict(uuid=uid('anim'), name='animation.meteor.fall', loop='loop', override=False, length=LENGTH, snapping=20, selected=False,
                        anim_time_update='', blend_weight='', start_delay='', loop_delay='',
                        animators={uid('bone', b): dict(name=b, type='bone', keyframes=bb_keyframes(b, ch)) for b, ch in anim.items()})],
}
(ROOT / 'art/meteor/meteor.bbmodel').write_text(json.dumps(bbmodel, indent=1))

# ------------------------------------------------------------------ site files (same compact format as scripts/import-mod.py)
def compact_bone(name):
    node = next(b for b in BONES if b[0] == name)
    kids = [i for i, e in enumerate(elements) if e['_bone'] == name] + [compact_bone(b[0]) for b in BONES if b[1] == name]
    return {'n': name, 'o': node[2], 'k': kids}


FACES = ['east', 'west', 'up', 'down', 'south', 'north']
site = {'model': {'res': [TEX, TEX], 'bones': [compact_bone('root')],
                  'cubes': [[e['name'], e['from'], e['to'], e['origin'], e['rotation'], 0, [e['faces'][f]['uv'] for f in FACES]] for e in elements]},
        'animations': {'fall': {'len': LENGTH, 'loop': True, 'bones': anim}}}
out = ROOT / 'public/assets/meteor'
out.mkdir(parents=True, exist_ok=True)
(out / 'meteor.json').write_text(json.dumps(site, separators=(',', ':')))
write_png(out / 'meteor.png', TEX, TEX, img)
write_png(out / 'meteor_glow.png', TEX, TEX, glow)
print(f'{len(elements)} cubos, {len(BONES)} ossos, animação de {LENGTH} s: art/meteor/meteor.bbmodel')
