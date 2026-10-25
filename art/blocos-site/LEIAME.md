# Blocos do site: versão calma aprovada pelo Rodrigo (2026-10-25 16:31Z)

Todos os PNGs têm 16x16 pixels, um bloco cada, com o mesmo nome do arquivo do mod
(`common/src/main/resources/assets/terrassic/textures/block/<nome>.png`), que eles substituem.
Para desenhar no site, use pixel nítido (`image-rendering: pixelated`, filtro NEAREST).

| Arquivo | Bloco do mod | Giro ao acaso |
|---|---|---|
| lateritic_soil.png | Solo laterítico (torrões e pedrinhas) | Sim: topo em 0/90/180/270°, laterais espelhadas |
| volcanic_ash.png | Cinza vulcânica | Sim: topo em 0/90/180/270°, laterais espelhadas |
| laterite.png | Laterita (rocha) | Sim: topo em 0/90/180/270°, laterais espelhadas |
| amber_block.png | Bloco de âmbar | Sim: topo em 0/90/180/270°, laterais espelhadas |
| shale.png | Folhelho (acamado) | Só espelho horizontal e 180° no topo, para as lâminas ficarem deitadas |
| limestone.png | Calcário (acamado) | Só espelho horizontal e 180° no topo |
| metasequoia_leaves.png | Folhas de metassequoia (tem furos com alfa 0) | Só espelho horizontal |
| ginkgo_leaves.png | Folhas de ginkgo (tem furos com alfa 0) | Só espelho horizontal |
| metasequoia_log.png, metasequoia_log_top.png | Tronco de metassequoia, lateral e topo (sem mudança) | Não |
| ginkgo_log.png, ginkgo_log_top.png | Tronco de ginkgo, lateral e topo (sem mudança) | Não |

"Giro ao acaso" quer dizer que cada bloco sorteia uma das orientações, de forma fixa pela posição dele
(por exemplo, um hash de x, y, z). É o que o Minecraft faz com a terra e o que apaga a grade num chão grande.

Origem: folhas de tools/texpack/folhas.py; solo de tools/texpack/torroes.py; as rochas, a cinza e o âmbar são
protótipos da thread de blocos (progressao/estudo/prototipo/) na saturação calma. As outras rochas e solos da
família (giz, quartzito, gnaisse, conglomerado, sílex, serrapilheiras, turfa...) ainda vão ser refeitos em torrões
e lascas e chegam depois.
Prévia de referência: https://claude.ai/artifact/Y8ZuA9E8MNvd5Ns4NWBwmz (coluna "cores mais calmas").
