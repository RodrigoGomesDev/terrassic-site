"""Importa uma cópia dos assets autorais sem modificar o projeto do mod."""
import json, shutil, sys
from pathlib import Path
if len(sys.argv)!=2:
 raise SystemExit('Uso: python3 scripts/import-assets.py /caminho/terrassic')
source=Path(sys.argv[1])
out=Path(__file__).resolve().parents[1]/'public/assets'
out.mkdir(parents=True,exist_ok=True)
for name in ['letreiro_950.png','monograma_64.png']:
 shutil.copy2(source/'art/marca'/name,out/name)
for name in ['tyrannosaurus','triceratops','spinosaurus','brachiosaurus','velociraptor','pteranodon','mosasaurus','ankylosaurus']:
 dest=out/name; dest.mkdir(exist_ok=True)
 d=json.loads((source/'art'/name/f'{name}.bbmodel').read_text())
 d.pop('textures',None);d.pop('animations',None)
 (dest/'model.json').write_text(json.dumps(d,separators=(',',':')))
 shutil.copy2(source/'common/src/main/resources/assets/terrassic/animations/entity'/f'{name}.animation.json',dest/'animations.json')
 for sex in ['male','female']:
  shutil.copy2(source/'art'/name/f'{name}_{sex}.png',dest/f'{sex}.png')
 shutil.copy2(source/'art'/name/'previews/front34.png',dest/'preview.png')
print('8 modelos, animações, 16 texturas e identidade importados.')
