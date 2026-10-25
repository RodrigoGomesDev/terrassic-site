# Terrassic: site do mod

Site estático do [Terrassic](https://github.com/RodrigoGomesDev/terrassic), de Rodrigo Gomes, em português, inglês e espanhol.

O que tem:

- **Abertura:** fundo âmbar neutro e o T. rex sozinho. Rolando, ele ruge enquanto a câmera se afasta; depois abre a boca, a câmera mergulha nela e a tela escurece para a história. O som do rugido só toca se o visitante ligar.
- **O Salto:** a tela de abertura do mod, uma frase por vez conforme o scroll, com o meteoro descendo pela tela e explodindo depois de "Então veio a luz".
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

O script só lê o mod e gera os arquivos abaixo. Com `--soft-blocks`, ele troca as texturas de bloco dos cenários pelas versões suaves de `scripts/blocktex.py`, que ainda estão em avaliação:

| Saída | Origem no mod |
|---|---|
| `public/assets/species/<id>.json` | cubos do `art/<id>/<id>.bbmodel` + `animations/entity/<id>.animation.json`, compactados |
| `public/assets/species/<id>_male.png` / `_female.png` | `textures/entity/` |
| `public/assets/sprites.png` | ovos geradores, itens e ovos-bloco num atlas de 32 px |
| `src/generated/species.js` | `gen_resources.SPECIES` (nomes), `gen_species.SIZES`/`GUIDE`/`SPECIES`, `lore.py` (Guia, abertura, relatório, diário, objetivos) e a versão de cada espécie no `docs/ROSTER.md` |
| `public/assets/blocks/*.png` | texturas de blocos do mod usadas nos cenários (`textures/block/`) |
| `public/assets/letreiro_*.png`, `monograma_*.png`, `selo_altar_512.png` | `art/marca/` |

Espécie nova no mod entra no site sozinha na próxima importação.

## Letreiro e tipografia

`python3 -B scripts/letreiro.py` desenha a letra de título do Terrassic ("Degraus", em `scripts/letreiro_glyphs.py`): maiúsculas pesadas de pedra gasta, cada uma numa altura e num degrau, com o alfabeto inteiro, números, pontuação e acentos. Sai em quatro acabamentos (basalto, âmbar, osso e pedra) em `art/marca/letreiro/`, mais o letreiro que o site usa em `public/assets/`. As letras partem das do letreiro do mod (`tools/capagen/titulo.py`) e da família Entalhe, no mesmo formato de grade do `tools/fontgen`.

## Miniaturas

As miniaturas do bestiário, dos capítulos e do macho e fêmea são imagens prontas em `public/assets/thumbs/`, então o visitante não precisa renderizar 59 modelos no navegador. Depois de mudar um modelo ou um bloco:

```sh
npm run build && npm run thumbs   # precisa do Google Chrome instalado (CHROME=/caminho troca o executável)
```

Se faltar alguma imagem, o site desenha a miniatura no navegador.

## Desempenho

- Cada cena 3D só desenha quando está na tela, e para quando a aba fica escondida.
- Se o aparelho não segura a taxa de quadros, a cena baixa sozinha a resolução e depois desliga as sombras (`QualityGuard` em `src/rig.js`).
- As animações dos modelos só são preparadas quando alguém usa uma delas.

## Meteoro, ilha e rugido

- `python3 -B scripts/island.py` gera a ilha: `art/island/island.bbmodel` (projeto do Blockbench com UV por face num atlas das texturas de bloco do mod e a animação `animation.island.break`) e a cópia do site em `public/assets/island/`. Rode depois do `import-mod.py`.

- `python3 -B scripts/meteor.py` gera o meteoro: `art/meteor/meteor.bbmodel` (projeto do Blockbench, abre e edita como os modelos do mod), a textura e a animação `animation.meteor.fall`, e a cópia que o site usa em `public/assets/meteor/`.
- `python3 -B scripts/web-roar.py` gera o rugido do T. rex feito para o site (`public/assets/species/tyrannosaurus.roar.json`), no rig do mod: preparação, corpo que sobe, cabeça varrendo de um lado para o outro com a mandíbula tremendo, braços fechando e a cauda em onda. Os arquivos do jogo não mudam.

## Código

- `src/rig.js`: monta o rig do Blockbench (16 px = 1 m, escala `MODEL_SCALE` do mod) e o `Animator` (transições entre loops, ações por cima).
- `src/animation.js`: interpolação Catmull-Rom dos canais GeckoLib, testada em `tests/`.
- `src/blocks.js`: cenários de blocos 1 m com as texturas do mod (ilha da abertura, eras, pedestal do bestiário).
- `src/hero.js`: a abertura com o T. rex e o meteoro.
- `src/viewer.js`: o palco do bestiário e as miniaturas.
- `src/bestiary.js`, `src/sections.js`: as seções da página.
- `src/i18n.js`: textos da interface em pt/en/es. `src/content.js`: eras, roteiro, armas e dúvidas, tirados de `README`, `docs/HISTORIA.md`, `docs/ROSTER.md` e `docs/RESUMO.md` do mod.
- `src/site-config.js`: links oficiais. Quando houver download (Modrinth, CurseForge), preencha `links.download` e o botão de instalar passa a apontar para ele.

O idioma vem de `?lang=pt|en|es`, da última escolha do visitante ou do navegador.

## Notas

- Renders feitos no navegador, não capturas do jogo. O leitor não roda Molang nem a especificação GeckoLib inteira; o mod não usa nenhum dos dois.
- Com "reduzir movimento" ligado, as cenas ficam paradas e as seções presas ao scroll viram páginas normais. Sem WebGL, o texto e os dados continuam.
- A cor e a tipografia seguem a identidade "Âmbar e Basalto" do mod (`docs/IDENTIDADE.md`). Fontes: Big Shoulders Display, Hanken Grotesk e JetBrains Mono (Google Fonts), mais as três fontes do mod (Caderno para o que a Katarina escreveu, Sedimento para o relatório datilografado e Entalhe para os títulos das páginas), embutidas no CSS.
- O som do rugido é o do próprio mod (`public/assets/audio/CREDITS.txt`) e só toca se o visitante ligar.

## Autoria

Rodrigo Gomes. Modelos, texturas, sprites e textos são do mod e autorais. Os cenários são montados por código com os blocos do mod; nenhuma textura do Minecraft é usada. Projeto independente, sem afiliação à Mojang ou à Microsoft.
