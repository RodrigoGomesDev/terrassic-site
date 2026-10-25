# Terrassic: site do mod

Site estático do [Terrassic](https://github.com/RodrigoGomesDev/terrassic), de Rodrigo Gomes, em português, inglês e espanhol.

O que tem:

- **Abertura ao vivo:** uma clareira do Cretáceo feita de blocos de 1 m, gerada por código, com 13 criaturas do mod andando, pastando, rugindo e voando (T. rex, manada de hadrossauros, Brachiosaurus, Triceratops, bando de Velociraptor, Pteranodon e Quetzalcoatlus). No celular entram só 5, para poupar a bateria.
- **O Salto:** a tela de abertura do mod, uma frase por vez conforme o scroll, com a Fenda se abrindo.
- **Caderno da Katarina:** o Relatório do Incidente e as páginas do diário, com o texto do próprio mod.
- **Eras:** os 5 capítulos numa faixa horizontal presa ao scroll, cada um com uma paisagem em pixel desenhada por código.
- **Bestiário 3D:** as 59 espécies com modelo, macho e fêmea, todas as animações do jogo com transição suave, uma pessoa de 1,8 m e um piso de blocos de 1 m para dar a escala, o Guia de Campo (ciência, comportamento, domesticação, utilidade e a nota da Katarina) e as miniaturas renderizadas dos próprios modelos.
- **Como se joga, roteiro, instalação e dúvidas**, com os sprites do mod (ovos, itens, armas).

## Rodar

Node.js 22.12+ ou 24:

```sh
npm ci
npm run dev
npm run check   # sintaxe + testes
npm run build   # gera dist/
npm run preview
```

`dist/` funciona em qualquer host estático e em qualquer subpasta (a base é relativa). Sem backend.

## Atualizar a partir do mod

Os modelos, animações, texturas, sprites e textos vêm do repositório do mod. Depois de mudar o mod, rode:

```sh
python3 -B scripts/import-mod.py /caminho/para/terrassic
```

O script só lê o mod e gera:

| Saída | Origem no mod |
|---|---|
| `public/assets/species/<id>.json` | cubos do `art/<id>/<id>.bbmodel` + `animations/entity/<id>.animation.json`, compactados |
| `public/assets/species/<id>_male.png` / `_female.png` | `textures/entity/` |
| `public/assets/sprites.png` | ovos geradores, itens e ovos-bloco num atlas de 32 px |
| `src/generated/species.js` | `gen_resources.SPECIES` (nomes), `gen_species.SIZES`/`GUIDE`/`SPECIES`, `lore.py` (Guia, abertura, relatório, diário, objetivos) e a versão de cada espécie no `docs/ROSTER.md` |
| `public/assets/letreiro_*.png`, `monograma_*.png`, `selo_altar_512.png` | `art/marca/` |

Espécie nova no mod entra no site sozinha na próxima importação.

## Código

- `src/rig.js`: monta o rig do Blockbench (16 px = 1 m, escala `MODEL_SCALE` do mod) e o `Animator` (transições entre loops, ações por cima).
- `src/animation.js`: interpolação Catmull-Rom dos canais GeckoLib, testada em `tests/`.
- `src/world.js` e `src/hero.js`: a clareira e quem anda nela.
- `src/viewer.js`: o palco do bestiário e as miniaturas.
- `src/bestiary.js`, `src/sections.js`: as seções da página.
- `src/i18n.js`: textos da interface em pt/en/es. `src/content.js`: eras, roteiro, armas e dúvidas, tirados de `README`, `docs/HISTORIA.md`, `docs/ROSTER.md` e `docs/RESUMO.md` do mod.
- `src/site-config.js`: links oficiais. Quando houver download (Modrinth, CurseForge), preencha `links.download` e o botão de instalar passa a apontar para ele.

O idioma vem de `?lang=pt|en|es`, da última escolha do visitante ou do navegador.

## Notas

- Renders feitos no navegador, não capturas do jogo. O leitor não roda Molang nem a especificação GeckoLib inteira; o mod não usa nenhum dos dois.
- Com "reduzir movimento" ligado, as cenas ficam paradas e as seções presas ao scroll viram páginas normais. Sem WebGL, o texto e os dados continuam.
- A cor e a tipografia seguem a identidade "Âmbar e Basalto" do mod (`docs/IDENTIDADE.md`). Fontes: Big Shoulders Display, Hanken Grotesk, JetBrains Mono e Caveat (Google Fonts).
- O som do rugido é o do próprio mod (`public/assets/audio/CREDITS.txt`) e só toca se o visitante ligar.

## Autoria

Rodrigo Gomes. Modelos, texturas, sprites e textos são do mod e autorais. O cenário da abertura e as paisagens das eras são gerados por código. Projeto independente, sem afiliação à Mojang ou à Microsoft.
