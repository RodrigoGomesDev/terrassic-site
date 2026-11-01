# Site do Terrassic

Site do [Terrassic](https://github.com/RodrigoGomesDev/terrassic), um mod de dinossauros para Minecraft feito por
Rodrigo Gomes. Em português, inglês e espanhol, com uma wiki em `/wiki/`.

## Rodar

Node.js 22.12 ou mais novo:

```sh
npm ci
npm run dev      # site local
npm run check    # sintaxe e testes
npm run build    # gera dist/, que serve em qualquer host estático
```

## O que está pronto e o que é "em breve"

Tudo fica em `src/site-config.js`:

- `models.ready`: animais com o modelo novo aprovado. Os outros aparecem só como silhueta. O último da lista é o que
  aparece na abertura.
- `story`: o modo história está desligado no mod, então o site mostra um aviso no lugar dele.
- `links`: CurseForge, Discord, Ko-fi. O Modrinth volta quando o mod for aprovado lá.

## Atualizar a partir do mod

```sh
python3 -B scripts/import-mod.py /caminho/para/terrassic
npm run build && npm run thumbs   # miniaturas; precisa do Google Chrome
```

O script só lê o mod. Modelos feitos à mão (como o T. rex) vêm do `geo.json` que o jogo usa; os outros, do `.bbmodel`.

## Créditos

Modelos, texturas, sprites e textos são do mod. O rugido do T. rex é "Dinosaur roar or scream 2", de GSMsea, pela
Pixabay. Projeto independente, sem afiliação com a Mojang ou a Microsoft.
