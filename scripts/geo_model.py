"""Modelo compacto do site a partir do geo.json do mod (Bedrock), para modelos feitos à mão com UV por face.

O .bbmodel em art/<id>/ desses modelos pode estar antigo; o geo.json é o que o jogo desenha. A conversão segue a
importação do Blockbench: x espelhado nos pivôs e cubos, rotações x e y com o sinal trocado.
"""

FACES = ['east', 'west', 'up', 'down', 'south', 'north']  # ordem de faces do BoxGeometry


def per_face(geo):
    d = geo['minecraft:geometry'][0]
    return any(isinstance(c.get('uv'), dict) for b in d['bones'] for c in b.get('cubes', []))


def compact_from_geo(geo):
    d = geo['minecraft:geometry'][0]
    desc = d['description']
    cubes, nodes = [], {}

    def flip(r):
        return [-r[0], -r[1], r[2]]

    for b in d['bones']:
        node = {'n': b['name'], 'o': [-b['pivot'][0], b['pivot'][1], b['pivot'][2]], 'k': []}
        if any(b.get('rotation', [0, 0, 0])):
            node['r'] = flip(b['rotation'])
        nodes[b['name']] = (node, b.get('parent'))
        for i, c in enumerate(b.get('cubes', [])):
            o, s = c['origin'], c['size']
            frm = [-(o[0] + s[0]), o[1], o[2]]
            to = [frm[0] + s[0], frm[1] + s[1], frm[2] + s[2]]
            pv = c.get('pivot', b['pivot'])
            faces = []
            for f in FACES:
                u = c['uv'].get(f)
                faces.append([u['uv'][0], u['uv'][1], u['uv'][0] + u['uv_size'][0], u['uv'][1] + u['uv_size'][1]] if u else [0, 0, 0, 0])
            cubes.append([f"{b['name']}_{i}", frm, to, [-pv[0], pv[1], pv[2]],
                          flip(c['rotation']) if c.get('rotation') else [0, 0, 0], c.get('inflate', 0), faces])
            node['k'].append(len(cubes) - 1)
    roots = []
    for node, parent in nodes.values():
        (nodes[parent][0]['k'] if parent else roots).append(node)
    return {'res': [desc['texture_width'], desc['texture_height']], 'bones': roots, 'cubes': cubes}
