"""Importa do repositório do mod tudo o que o site usa, sem modificar o mod.

Uso: python3 -B scripts/import-mod.py /caminho/terrassic

Gera:
- public/assets/species/<id>.json   modelo compacto (cubos do .bbmodel) + animações GeckoLib minificadas
- public/assets/species/<id>_male.png e _female.png
- public/assets/sprites.png          atlas 32x32 com ovos geradores, estágios do ovo-bloco e itens
- src/generated/species.js           dados de cada espécie (nomes, Guia de Campo em pt/en/es, tamanhos, versão)
"""
import json
import re
import shutil
import sys
from pathlib import Path

if len(sys.argv) < 2:
    raise SystemExit('Uso: python3 -B scripts/import-mod.py /caminho/terrassic')
MOD = Path(sys.argv[1]).resolve()
SITE = Path(__file__).resolve().parents[1]
RES = MOD / 'common/src/main/resources/assets/terrassic'
OUT = SITE / 'public/assets'
sys.path.insert(0, str(MOD / 'tools/javagen'))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen_resources  # noqa: E402
import gen_species  # noqa: E402
import lore  # noqa: E402


def r4(v):
    if isinstance(v, float):
        v = round(v, 4)
        return int(v) if v == int(v) else v
    if isinstance(v, list):
        return [r4(x) for x in v]
    if isinstance(v, dict):
        return {k: r4(x) for k, x in v.items()}
    return v


# ------------------------------------------------------------------ models
FACES = ['east', 'west', 'up', 'down', 'south', 'north']  # BoxGeometry material order


def compact_model(bb):
    elements = {e['uuid']: e for e in bb['elements'] if e.get('type', 'cube') == 'cube'}
    cubes = []

    def cube(e):
        faces = []
        for f in FACES:
            face = e['faces'].get(f)
            uv = face.get('uv', [0, 0, 0, 0]) if face else [0, 0, 0, 0]
            rot = face.get('rotation', 0) if face else 0
            faces.append(uv + ([rot] if rot else []))
        cubes.append([e['name'], e['from'], e['to'], e.get('origin', [0, 0, 0]), e.get('rotation', [0, 0, 0]),
                      e.get('inflate', 0), faces])
        return len(cubes) - 1

    def bone(g):
        out = {'n': g['name'], 'o': g.get('origin', [0, 0, 0]), 'k': []}
        if any(g.get('rotation', [0, 0, 0])):
            out['r'] = g['rotation']
        if g.get('visibility') is False:
            out['h'] = 1
        for child in g.get('children', []):
            if isinstance(child, str):
                if child in elements and elements[child].get('visibility') is not False:
                    out['k'].append(cube(elements[child]))
            else:
                out['k'].append(bone(child))
        return out

    roots = [bone(g) for g in bb['outliner'] if isinstance(g, dict)]
    return {'res': [bb['resolution']['width'], bb['resolution']['height']], 'bones': roots, 'cubes': cubes}


def compact_animations(raw):
    out = {}
    for name, a in raw['animations'].items():
        bones = {}
        for bname, b in a.get('bones', {}).items():
            ch = {}
            for c in ('rotation', 'position', 'scale'):
                if c not in b:
                    continue
                v = b[c]
                if isinstance(v, dict):
                    # Every channel in the mod is Catmull-Rom; keep the mode only when it differs.
                    ch[c] = {t: (k['post'] if k.get('lerp_mode', 'catmullrom') == 'catmullrom' else k) if isinstance(k, dict) else k
                             for t, k in v.items()}
                else:
                    ch[c] = v
            bones[bname] = ch
        out[name.split('.')[-1]] = {'len': a.get('animation_length', 0), 'loop': a.get('loop') is True, 'bones': bones}
    return r4(out)


from png import read_png, write_png  # noqa: E402


CELL = 32
ITEMS = ['field_notebook', 'amber_lens', 'sketching_charcoal', 'hair_brush', 'flint_chisel', 'clay_jar', 'blood_sample',
         'raw_amber', 'loose_page', 'flint_spear', 'horn_spear', 'flint_knife', 'flint_hatchet', 'bone_club', 'tail_club',
         'rex_tooth_dagger', 'rex_tooth', 'triceratops_horn', 'ankylosaurus_club', 'blowgun', 'tranq_dart', 'sleep_herb',
         'raw_dino_meat', 'cooked_prime_meat', 'platform_saddle', 'sketch']
BLOCKS = ['tyrannosaurus_egg_0', 'tyrannosaurus_egg_1', 'tyrannosaurus_egg_2', 'triceratops_egg_0', 'triceratops_egg_1',
          'triceratops_egg_2', 'amber_block', 'amber_with_insect', 'amber_with_leaf', 'amber_with_feather', 'bone_pile',
          'tyrannosaurus_skull_fossil']


# Block textures used by the scenery (the hero island, the era dioramas, the bestiary plinth).
SCENERY = ['fern_litter', 'fern_litter_side', 'needle_litter', 'needle_litter_side', 'lateritic_soil', 'packed_earth_floor',
           'cracked_mud', 'volcanic_ash', 'salt_crust', 'chalk', 'limestone', 'shale', 'gneiss_stacked', 'gneiss_flagstone',
           'limestone_flagstone', 'laterite', 'basin_water', 'cretaceous_grass', 'bracken', 'royal_fern', 'horsetail',
           'tall_bracken_bottom', 'tall_bracken_top', 'clubmoss', 'cycad_bottom', 'cycad_top', 'young_cycad', 'williamsonia',
           'archaefructus', 'metasequoia_log', 'metasequoia_log_top', 'metasequoia_leaves', 'araucaria_log', 'araucaria_log_top',
           'araucaria_leaves', 'magnolia_log', 'magnolia_log_top', 'magnolia_leaves', 'tree_fern_log', 'tree_fern_log_top',
           'tree_fern_leaves', 'podocarpus_log', 'podocarpus_log_top', 'podocarpus_leaves', 'taxodium_log', 'taxodium_log_top',
           'taxodium_leaves', 'amber_block', 'fossil_rock', 'menhir', 'menhir_top', 'bone_pile', 'rib_bone', 'lichen']


def copy_blocks():
    out = OUT / 'blocks'
    out.mkdir(exist_ok=True)
    for name in SCENERY:
        src = RES / 'textures/block' / f'{name}.png'
        if src.exists():
            shutil.copy2(src, out / f'{name}.png')
    return sorted(p.stem for p in out.glob('*.png'))


def nearest(px, w, h, size):
    return [[px[y * h // size][x * w // size] for x in range(size)] for y in range(size)]


def build_atlas(ids):
    sprites = [(f'egg:{i}', RES / 'textures/item' / f'{i}_spawn_egg.png') for i in ids]
    sprites += [(f'item:{i}', RES / 'textures/item' / f'{i}.png') for i in ITEMS]
    sprites += [(f'block:{i}', RES / 'textures/block' / f'{i}.png') for i in BLOCKS]
    sprites = [(k, p) for k, p in sprites if p.exists()]
    cols = 16
    rows = (len(sprites) + cols - 1) // cols
    atlas = [[(0, 0, 0, 0)] * (cols * CELL) for _ in range(rows * CELL)]
    index = {}
    for n, (key, path) in enumerate(sprites):
        w, h, px = read_png(path)
        if h > w:  # animated strip: first frame
            px, h = px[:w], w
        cell = nearest(px, w, h, CELL)
        ox, oy = (n % cols) * CELL, (n // cols) * CELL
        for y in range(CELL):
            atlas[oy + y][ox:ox + CELL] = cell[y]
        index[key] = n
    write_png(OUT / 'sprites.png', cols * CELL, rows * CELL, atlas)
    return {'cols': cols, 'rows': rows, 'cell': CELL, 'index': index}


# ------------------------------------------------------------------ roster: version, taming and mount per species
def parse_roster(names):
    text = (MOD / 'docs/ROSTER.md').read_text()
    by_name = {v.lower(): k for k, v in names.items()}
    out, version, header = {}, None, None
    for line in text.splitlines():
        m = re.match(r'^## (v\d+\.\d+)', line)
        if m:
            version, header = m.group(1), None
            continue
        if line.startswith('# '):
            version = None
        if not line.startswith('|') or not version:
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        if cells[0] in ('Espécie',):
            header = cells
            continue
        if not header or set(cells[0]) <= set('-: '):
            continue
        name = re.sub(r'\*|\(.*?\)', '', cells[0]).strip().lower()
        sid = by_name.get(name)
        if not sid or sid in out:
            continue
        row = dict(zip(header, cells))
        out[sid] = dict(version=version, tame=row.get('Domar', ''), mount=row.get('Montaria', ''), kind=row.get('Tipo', ''))
    return out


def tame_key(text, spec):
    t = text.lower()
    if spec.get('tame') == 'baby' or 'filhote' in t: return 'baby'
    if 'nocaute' in t: return 'knockout'
    if t.startswith('ovo') or spec.get('egg_only'): return 'egg'
    if 'comida' in t: return 'food'
    if t.startswith('—') or t == '-': return 'none'
    return 'egg' if spec['base'] == 'PredatorDinosaur' else 'food'


def story():
    tri = lambda t: dict(pt=t[0], en=t[1], es=t[2])
    themes = list(lore.THEMES)
    objectives = [dict(id=k, theme=themes[i // 3], title=tri(v[0]), text=tri(v[1])) for i, (k, v) in enumerate(lore.OBJECTIVES.items())]
    return dict(intro=[tri(t) for t in lore.INTRO], era=tri(lore.INTRO_ERA),
                report=[dict(title=tri(r['title']), text=tri(r['text'])) for r in lore.REPORT],
                pages=[dict(day=p['day'], text=tri(p['text'])) for p in lore.PAGES if p['kind'] == 'diary'],
                themes={k: tri(v) for k, v in lore.THEMES.items()}, objectives=objectives,
                eras={k: tri(v) for k, v in lore.ERAS.items()}, diets={k: tri(v) for k, v in lore.DIETS.items()})


def main():
    (OUT / 'species').mkdir(parents=True, exist_ok=True)
    (SITE / 'src/generated').mkdir(parents=True, exist_ok=True)
    report = json.loads((MOD / 'art/build_report.json').read_text())
    names = {k: v[0] for k, v in gen_resources.SPECIES.items()}
    roster = parse_roster(names)
    species = []
    for spec in gen_species.SPECIES:
        sid = spec['id']
        bb = json.loads((MOD / 'art' / sid / f'{sid}.bbmodel').read_text())
        anims = json.loads((RES / 'animations/entity' / f'{sid}.animation.json').read_text())
        data = {'model': r4(compact_model(bb)), 'animations': compact_animations(anims)}
        (OUT / 'species' / f'{sid}.json').write_text(json.dumps(data, separators=(',', ':'), ensure_ascii=False))
        for sex in ('male', 'female'):
            shutil.copy2(RES / 'textures/entity' / f'{sid}_{sex}.png', OUT / 'species' / f'{sid}_{sex}.png')
        en, pt, es, _egg = gen_resources.SPECIES[sid]
        size, guide, text, rost = gen_species.SIZES[sid], gen_species.GUIDE[sid], lore.GUIDE[sid], roster.get(sid, {})
        base = spec['base']
        kind = rost.get('kind', '')
        group = ('flyer' if base == 'FlyingDinosaur' else 'water' if base == 'SwimmingDinosaur' or '🐊' in kind
                 else 'predator' if guide['diet'] in ('carnivore', 'piscivore') else 'herbivore')
        mount = 'platform' if spec.get('platform') else 'shoulder' if spec.get('shoulder') else 'ride' if spec.get('rideable') else 'none'
        b = report[sid]['bounds_px']
        species.append(dict(
            id=sid, name=dict(en=en, pt=pt, es=es), group=group, diet=guide['diet'], era=guide['era'],
            length=size['real'], scale=size['scale'], hitbox=[size['w'], size['h']],
            bounds=r4([b[0], b[1]]), mount=mount, tame=tame_key(rost.get('tame', ''), spec),
            version=rost.get('version', 'v0.2'), anims=list(data['animations']), cubes=report[sid]['cubes'],
            guide={k: dict(pt=v[0], en=v[1], es=v[2]) for k, v in text.items()},
        ))
    atlas = build_atlas([s['id'] for s in species])
    blocks = copy_blocks()
    # Optional: the site's own softer drawings of the scenery blocks (scripts/blocktex.py), still under review.
    if '--soft-blocks' in sys.argv:
        import blocktex
        blocktex.main()
    js = ('// Gerado por scripts/import-mod.py a partir do repositório do mod. Não edite à mão.\n'
          f'export const SPECIES={json.dumps(species, ensure_ascii=False, separators=(",", ":"))};\n'
          f'export const SPRITES={json.dumps(atlas, separators=(",", ":"))};\n'
          f'export const BLOCKS={json.dumps(blocks, separators=(",", ":"))};\n'
          f'export const LORE={json.dumps(story(), ensure_ascii=False, separators=(",", ":"))};\n')
    (SITE / 'src/generated/species.js').write_text(js)
    for name in ['letreiro_950.png', 'letreiro_1900.png', 'monograma_64.png', 'monograma_256.png', 'selo_altar_512.png']:
        if (MOD / 'art/marca' / name).exists():
            shutil.copy2(MOD / 'art/marca' / name, OUT / name)
    print(f'{len(species)} espécies, {len(atlas["index"])} sprites, {len(blocks)} blocos, textos em pt/en/es.')


main()
