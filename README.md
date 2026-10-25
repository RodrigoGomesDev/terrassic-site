# Terrassic — site e experiência 3D

Site estático do [Terrassic](https://github.com/RodrigoGomesDev/terrassic), de Rodrigo Gomes. A abertura usa o scroll nativo para conduzir uma pequena mudança de ângulo e aproximar a cabeça do T. rex. O elenco, as seções de recursos, a história, a instalação e as dúvidas completam a apresentação.

## Rodar

Node.js 22.12+ ou 24:

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Publique `dist/` em um host estático HTTPS. Sem backend, banco de dados ou segredos de aplicação. A CI verifica sintaxe, regressões e build.

## Animação

- O giro completo foi substituído por uma mudança limitada de ângulo e uma aproximação gradual. O elenco não gira sozinho.
- As curvas numéricas do mod marcadas Catmull-Rom são interpoladas suavemente; os canais são compilados uma vez.
- A mandíbula usa tangentes que preservam a forma da curva para evitar ultrapassar as poses de boca fechada/aberta.
- O botão **Rugir** dispara uma ação de apresentação com preparação, movimento do pescoço, corpo, braços e cauda e retorno suave à pose atual.
- O clip de apresentação tem 109 poses em 3,6 segundos; a reprodução interpola entre elas conforme os quadros da tela. Isso não é uma garantia de taxa de quadros em todo dispositivo.
- O botão **Som off/on** permite ouvir o áudio do próprio mod, apenas por ação do visitante. Não há reprodução automática.
- **Abrir boca** continua controlando a articulação diretamente.
- As oito espécies têm controle de aparência e animações. O arraste fica ativo no elenco; a rolagem vertical permanece nativa.

A revisão do ritmo do rugido foi discutida com o Claude Code instalado, em uma consulta sem ferramentas de escrita. O rig e os recursos do jogo não foram alterados. O clip novo é específico da apresentação web e pode ser regenerado com `python3 scripts/presentation-roar.py`.

## Renderização

Os modelos são cubos fechados do Blockbench. O visualizador descarta faces traseiras e aplica um viés de profundidade mínimo e determinístico às faces coplanares, estabilizando as camadas que se encontram na bochecha. A faixa de profundidade da câmera foi reduzida para melhorar a precisão no close.

Os renders não são capturas de gameplay. Modelos e tamanhos são ajustados ao enquadramento. O leitor não implementa expressões Molang nem toda a especificação GeckoLib. A preferência por redução de movimento pula a sequência de scroll; ações pedidas pelo visitante ainda podem ser reproduzidas. Sem WebGL, há prévias estáticas.

## Conteúdo e links

- `src/site-config.js`: URLs oficiais de download, comunidade, trailer e redes. Campos vazios não geram links falsos.
- `src/content.js`: abas Criar/Pesquisar/Explorar e revelação das seções.
- `src/animation.js`: compilação, interpolação e pesos de transição.
- `src/scroll-scene.js`: sequência e câmera.
- `src/viewer.js`: leitura do modelo e reprodução.
- `src/main.js`: controles e navegação.
- `public/assets/`: recursos do Terrassic; créditos de áudio em `audio/CREDITS.txt`.
- `tests/animation.test.js`: continuidade do loop, continuidade de velocidade, limites do rugido e colisão de faces na bochecha.

No levantamento desta entrega o repositório do mod não tinha releases públicas. Por isso o site promove o GitHub, sem oferecer um download inexistente. Preencha `links.download` quando uma versão for aprovada/publicada.

## Autoria

Rodrigo Gomes. Marca, cubos, UVs e texturas foram preservados. O checkout do mod não foi modificado. Fontes Barlow Condensed e IBM Plex via Google Fonts, com fallback de sistema. Nenhuma licença de redistribuição foi acrescentada aos assets do mod.

## Composição das áreas claras

As pegadas de três dedos são um SVG próprio, decorativo e sem interação. Aparecem em sequência nas seções claras, com animação suspensa fora da tela e versão estática para redução de movimento. Na seção de recursos, o modelo e seu item usam células separadas; o item não é mais uma camada posicionada sobre o modelo.
