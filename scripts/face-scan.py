"""Procura faces de lado viradas para dentro nos modelos do mod (o bug do Deinossuco da 1.9.0).

Convenção do GeckoLib 4.8.4: o centro do cubo em x é -(o[0] + s[0]/2); o lado de fora é a face east se ele for
positivo, west se negativo. Suspeito: a face de dentro tem detalhe (4 cores ou mais) e a de fora quase nenhum.
Uso: python3 -B scripts/face-scan.py <mod> <espécie> [<espécie> ...]
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from png import read_png


def colours(img, uv, size):
    w, h, px = img
    x0, x1 = sorted((round(uv[0]), round(uv[0] + size[0])))
    y0, y1 = sorted((round(uv[1]), round(uv[1] + size[1])))
    return len({px[j][i] for j in range(max(0, y0), min(h, y1)) for i in range(max(0, x0), min(w, x1))})


def scan(geo, tex):
    img, found = read_png(tex), []
    for b in json.loads(geo.read_text())['minecraft:geometry'][0]['bones']:
        for c in b.get('cubes', []):
            uv = c.get('uv')
            if not isinstance(uv, dict) or 'east' not in uv or 'west' not in uv:
                continue
            cx = -(c['origin'][0] + c['size'][0] / 2)
            if abs(cx) < 0.5:
                continue
            out, inn = ('east', 'west') if cx > 0 else ('west', 'east')
            co = colours(img, uv[out]['uv'], uv[out]['uv_size'])
            ci = colours(img, uv[inn]['uv'], uv[inn]['uv_size'])
            if ci >= 4 and co <= 2:
                found.append(f"{b['name']}: dentro={inn} {ci} cores, fora={out} {co}")
    return found


if __name__ == '__main__':
    assets = Path(sys.argv[1]) / 'common/src/main/resources/assets/terrassic'
    bad = 0
    for sid in sys.argv[2:]:
        for sex in ('male', 'female'):
            found = scan(assets / f'geo/entity/{sid}.geo.json', assets / f'textures/entity/{sid}_{sex}.png')
            bad += len(found)
            print(f'{sid} {sex}: {len(found)} suspeitos', *[f'\n  {f}' for f in found])
    sys.exit(1 if bad else 0)
