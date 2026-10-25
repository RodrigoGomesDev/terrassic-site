// Site content taken from the mod's documentation (README, docs/HISTORIA.md, docs/ROSTER.md, docs/RESUMO.md).
const T=(pt,en,es)=>({pt,en,es});

// Chapters, deepest last. Colours paint each era's generated landscape.
export const ERAS=[
 {id:'late',n:T('Capítulo 1','Chapter 1','Capítulo 1'),name:T('Ecos do Fim','Echoes of the End','Ecos del Fin'),era:T('Cretáceo Superior','Late Cretaceous','Cretácico Superior'),ma:[100,66],
  where:T('O mundo normal do Minecraft','The regular Minecraft world','El mundo normal de Minecraft'),
  land:T('Florestas de flores e coníferas, planícies, rios e o mar interior.','Forests of flowers and conifers, plains, rivers and the inland sea.','Bosques de flores y coníferas, llanuras, ríos y el mar interior.'),
  event:T('Chuva de meteoros','Meteor shower','Lluvia de meteoros'),boss:T('Tirano da Fenda','Tyrant of the Rift','Tirano de la Grieta'),
  plants:T('A grama só existe a partir daqui.','Grass only exists from here on.','La hierba solo existe desde aquí.'),
  fauna:['Tyrannosaurus','Triceratops','Spinosaurus','Argentinosaurus','Pteranodon','Mosasaurus'],version:'v1.0',status:'wip',
  colors:['#3a2240','#f07a1a','#7faf55','#2f5a35']},
 {id:'early',n:T('Capítulo 2','Chapter 2','Capítulo 2'),name:T('Penas e Cinzas','Feathers and Ash','Plumas y Cenizas'),era:T('Cretáceo Inferior','Early Cretaceous','Cretácico Inferior'),ma:[145,100],
  where:T('Dimensão própria','Its own dimension','Dimensión propia'),
  land:T('Lagoas, mangues, florestas de coníferas e vulcões ao longe.','Lagoons, mangroves, conifer forests and distant volcanoes.','Lagunas, manglares, bosques de coníferas y volcanes a lo lejos.'),
  event:T('Chuva de cinza','Ash fall','Lluvia de ceniza'),boss:T('Rei do Rio, um Sarcosuchus da Fenda','River King, a Rift Sarcosuchus','Rey del Río, un Sarcosuchus de la Grieta'),
  plants:T('As primeiras flores aparecem.','The first flowers appear.','Aparecen las primeras flores.'),
  fauna:['Iguanodon','Baryonyx','Sarcosuchus','Tapejara','Microraptor','Yutyrannus'],version:'v2.0',status:'plan',
  colors:['#2a2329','#c4473a','#8a7c6a','#524550']},
 {id:'jurassic',n:T('Capítulo 3','Chapter 3','Capítulo 3'),name:T('O Reino dos Gigantes','The Realm of Giants','El Reino de los Gigantes'),era:T('Jurássico','Jurassic','Jurásico'),ma:[201,145],
  where:T('Dimensão própria','Its own dimension','Dimensión propia'),
  land:T('Florestas de araucárias e samambaias, arquipélagos e mares rasos.','Araucaria and fern forests, archipelagos and shallow seas.','Bosques de araucarias y helechos, archipiélagos y mares poco profundos.'),
  event:T('Monções','Monsoons','Monzones'),boss:T('Leviatã da Fenda, um Liopleurodon','Rift Leviathan, a Liopleurodon','Leviatán de la Grieta, un Liopleurodon'),
  plants:T('Sem flores nem grama: o chão é de samambaia e musgo.','No flowers, no grass: the ground is fern and moss.','Sin flores ni hierba: el suelo es de helecho y musgo.'),
  fauna:['Brachiosaurus','Diplodocus','Stegosaurus','Allosaurus','Archaeopteryx','Liopleurodon'],version:'v3.0',status:'plan',
  colors:['#1c3a3a','#8fb4c8','#4f7a3a','#28503a']},
 {id:'triassic',n:T('Capítulo 4','Chapter 4','Capítulo 4'),name:T('A Origem','The Origin','El Origen'),era:T('Triássico','Triassic','Triásico'),ma:[252,201],
  where:T('Dimensão própria: a Pangeia','Its own dimension: Pangaea','Dimensión propia: Pangea'),
  land:T('Um continente só: deserto vermelho, oásis e rios de estação.','A single continent: red desert, oases and seasonal rivers.','Un solo continente: desierto rojo, oasis y ríos de temporada.'),
  event:T('Episódio Pluvial Carniano','Carnian Pluvial Episode','Episodio Pluvial Carniense'),boss:T('Coração da Fenda','Heart of the Rift','Corazón de la Grieta'),
  plants:T('Sem flores nem grama, e quem manda são os parentes dos crocodilos.','No flowers, no grass, and crocodile relatives rule.','Sin flores ni hierba, y mandan los parientes de los cocodrilos.'),
  fauna:['Herrerasaurus','Coelophysis','Plateosaurus','Postosuchus','Lisowicia','Shonisaurus'],version:'v4.0',status:'plan',
  colors:['#3a1a14','#f07a1a','#b9771c','#5a3620']},
 {id:'ice',n:T('Epílogo','Epilogue','Epílogo'),name:T('O Caminho de Volta','The Way Back','El Camino de Vuelta'),era:T('Era do Gelo','Ice Age','Edad de Hielo'),ma:null,
  where:T('Dimensão própria','Its own dimension','Dimensión propia'),
  land:T('Quase tudo gelo e neve, com uma faixa de estepe no sul.','Almost all ice and snow, with a strip of steppe to the south.','Casi todo hielo y nieve, con una franja de estepa al sur.'),
  event:T('A Grande Nevasca','The Great Blizzard','La Gran Ventisca'),boss:T('Nenhum: sobreviver é o desafio','None: survival is the challenge','Ninguno: sobrevivir es el desafío'),
  plants:T('A estepe de gramíneas alimenta os mamutes.','The grass steppe feeds the mammoths.','La estepa de gramíneas alimenta a los mamuts.'),
  fauna:[T('Mamute-lanoso','Woolly mammoth','Mamut lanudo'),'Smilodon',T('Megatério','Megatherium','Megaterio'),T('Rinoceronte-lanoso','Woolly rhinoceros','Rinoceronte lanudo'),'Argentavis'],version:'v5.0',status:'plan',
  colors:['#1e2a36','#8fb4c8','#efe6d2','#b3a48c']},
];

// docs/ROSTER.md, summary table.
export const VERSIONS=[
 {v:'v0.2',name:T('Primeiros dinossauros','First dinosaurs','Primeros dinosaurios'),add:12,status:'done',detail:T('Sexo, ovos, domesticação, montaria e armas.','Sex, eggs, taming, riding and weapons.','Sexo, huevos, domesticación, montura y armas.')},
 {v:'v0.3',name:T('História e cientista','Story and scientist','Historia y científico'),add:3,status:'wip',detail:T('Caderno de Campo, fósseis, Mesa de Pesquisa, Lente de Âmbar, espanhol e voo no Pteranodon.','Field Notebook, fossils, Research Table, Amber Lens, Spanish and Pteranodon flight.','Cuaderno de Campo, fósiles, Mesa de Investigación, Lente de Ámbar, español y vuelo en el Pteranodon.')},
 {v:'v0.4',name:T('Os céus','The skies','Los cielos'),add:3,status:'wip',detail:T('Voo montado completo e criaturas de ombro.','Full mounted flight and shoulder pets.','Vuelo montado completo y criaturas de hombro.')},
 {v:'v0.5',name:T('O Mar Interior','The Inland Sea','El Mar Interior'),add:7,status:'wip',detail:T('Montaria aquática, rios, mar e pântano.','Water mounts, rivers, sea and swamp.','Monturas acuáticas, ríos, mar y pantano.')},
 {v:'v0.6',name:T('Manadas e titãs','Herds and titans','Manadas y titanes'),add:15,status:'wip',detail:T('Cadeia alimentar, carcaças, ninhos, migração e sela de plataforma.','Food chain, carcasses, nests, migration and platform saddles.','Cadena alimentaria, cadáveres, nidos, migración y silla de plataforma.')},
 {v:'v0.7',name:T('Predadores ápice','Apex predators','Depredadores ápice'),add:13,status:'wip',detail:T('Nocaute com zarabatana e boleadeira, territórios e ninhos para roubar.','Knockout with blowgun and bolas, territories and nests to raid.','Noqueo con cerbatana y boleadoras, territorios y nidos para robar.')},
 {v:'v0.8',name:T('O mundo Terrassic','The Terrassic world','El mundo Terrassic'),add:0,status:'plan',detail:T('Biomas, estruturas, HUD e ambientação.','Biomes, structures, HUD and ambience.','Biomas, estructuras, HUD y ambientación.')},
 {v:'v0.9',name:T('O Fim','The End','El Fin'),add:0,status:'plan',detail:T('Objetivos, Altar do Salto e o primeiro chefe.','Objectives, the Leap Altar and the first boss.','Objetivos, el Altar del Salto y el primer jefe.')},
 {v:'v1.0',name:T('Ecos do Fim completo','Echoes of the End, complete','Ecos del Fin completo'),add:0,status:'plan',detail:T('O Capítulo 1 jogável do começo ao fim.','Chapter 1 playable from start to finish.','El Capítulo 1 jugable de principio a fin.')},
 {v:'v2.0',name:T('Cretáceo Inferior','Early Cretaceous','Cretácico Inferior'),add:29,status:'plan'},
 {v:'v3.0',name:T('Jurássico','Jurassic','Jurásico'),add:30,status:'plan'},
 {v:'v4.0',name:T('Triássico e o final','Triassic and the ending','Triásico y el final'),add:24,status:'plan'},
 {v:'v5.0',name:T('Era do Gelo','Ice Age','Edad de Hielo'),add:14,status:'plan'},
];

export const GUIDE_LEVELS=[
 {name:T('Silhueta','Silhouette','Silueta'),how:T('Estude um fóssil na Mesa.','Study a fossil at the Table.','Estudia un fósil en la Mesa.')},
 {name:T('Avistado','Spotted','Avistado'),how:T('Veja a espécie a até 16 blocos.','See the species within 16 blocks.','Ve la especie a 16 bloques o menos.')},
 {name:T('Estudado','Studied','Estudiado'),how:T('Junte 3 pontos: fóssil, esboço ou vitória. Domar fica mais fácil e o dano sobe 20%.','Gather 3 points: fossil, sketch or a win. Taming gets easier and damage rises 20%.','Reúne 3 puntos: fósil, boceto o victoria. Domar es más fácil y el daño sube un 20%.')},
 {name:T('Domesticado','Tamed','Domesticado'),how:T('Dome um. O Guia mostra a utilidade e a nota da Katarina.','Tame one. The Guide shows its use and Katarina’s note.','Doma uno. La Guía muestra su utilidad y la nota de Katarina.')},
];
export const TOOLS=[
 {sprite:'item:field_notebook',name:T('Caderno de Campo','Field Notebook','Cuaderno de Campo')},
 {sprite:'item:amber_lens',name:T('Lente de Âmbar','Amber Lens','Lente de Ámbar')},
 {sprite:'item:sketching_charcoal',name:T('Carvão de Esboço','Sketching Charcoal','Carbón de Boceto')},
 {sprite:'item:hair_brush',name:T('Pincel de Pelo','Hair Brush','Pincel de Pelo')},
 {sprite:'item:flint_chisel',name:T('Cinzel de Sílex','Flint Chisel','Cincel de Sílex')},
 {sprite:'item:clay_jar',name:T('Frasco de Argila','Clay Jar','Frasco de Arcilla')},
];
// README, "Armas arcaicas".
export const WEAPONS=[
 {sprite:'item:flint_knife',name:T('Faca de Sílex','Flint Knife','Cuchillo de Sílex'),dmg:'4,5'},
 {sprite:'item:flint_hatchet',name:T('Machadinha de Sílex','Flint Hatchet','Hachuela de Sílex'),dmg:'7,5'},
 {sprite:'item:bone_club',name:T('Clava de Osso','Bone Club','Garrote de Hueso'),dmg:'7,5'},
 {sprite:'item:flint_spear',name:T('Lança de Sílex','Flint Spear','Lanza de Sílex'),dmg:'6',thrown:'7'},
 {sprite:'item:horn_spear',name:T('Lança de Chifre','Horn Spear','Lanza de Cuerno'),dmg:'8',thrown:'10'},
 {sprite:'item:rex_tooth_dagger',name:T('Adaga de Dente de T. rex','T. rex Tooth Dagger','Daga de Diente de T. rex'),dmg:'7'},
 {sprite:'item:tail_club',name:T('Clava de Cauda','Tail Club','Garrote de Cola'),dmg:'11'},
];
export const INSTALL={
 fabric:[T('Instale o Fabric Loader para o Minecraft Java 1.20.1.','Install Fabric Loader for Minecraft Java 1.20.1.','Instala Fabric Loader para Minecraft Java 1.20.1.'),T('Coloque na pasta mods a Fabric API, a Architectury API 9.2.x e o GeckoLib 4.x para 1.20.1.','Put Fabric API, Architectury API 9.2.x and GeckoLib 4.x for 1.20.1 in the mods folder.','Pon en la carpeta mods Fabric API, Architectury API 9.2.x y GeckoLib 4.x para 1.20.1.'),T('Adicione o arquivo do Terrassic na mesma pasta e abra o jogo.','Add the Terrassic file to the same folder and launch the game.','Añade el archivo de Terrassic en la misma carpeta y abre el juego.')],
 forge:[T('Instale o Forge 1.20.1 (47.x).','Install Forge 1.20.1 (47.x).','Instala Forge 1.20.1 (47.x).'),T('Coloque na pasta mods a Architectury API 9.2.x e o GeckoLib 4.x para 1.20.1.','Put Architectury API 9.2.x and GeckoLib 4.x for 1.20.1 in the mods folder.','Pon en la carpeta mods Architectury API 9.2.x y GeckoLib 4.x para 1.20.1.'),T('Adicione o arquivo do Terrassic na mesma pasta e abra o jogo.','Add the Terrassic file to the same folder and launch the game.','Añade el archivo de Terrassic en la misma carpeta y abre el juego.')],
};
export const FAQ=[
 {q:T('Qual Minecraft eu preciso?','Which Minecraft do I need?','¿Qué Minecraft necesito?'),a:T('Minecraft Java 1.20.1, com Fabric ou Forge. Os portes para 1.21 estão no roteiro.','Minecraft Java 1.20.1, with Fabric or Forge. Ports to 1.21 are on the roadmap.','Minecraft Java 1.20.1, con Fabric o Forge. Las versiones para 1.21 están en la hoja de ruta.')},
 {q:T('A história é obrigatória?','Is the story required?','¿La historia es obligatoria?'),a:T('Não. Construir, plantar, domar e montar funcionam desde o primeiro minuto. A tela de abertura se pula e o mundo segue normal para quem só quer dinossauros.','No. Building, farming, taming and riding work from the first minute. The intro can be skipped and the world stays normal for anyone who only wants dinosaurs.','No. Construir, cultivar, domar y montar funcionan desde el primer minuto. La pantalla de inicio se puede saltar y el mundo sigue normal para quien solo quiere dinosaurios.')},
 {q:T('Os tamanhos são reais?','Are the sizes real?','¿Los tamaños son reales?'),a:T('Sim. Cada criatura tem o tamanho do maior fóssil conhecido, com 1 bloco igual a 1 metro. Cada indivíduo ainda sorteia o próprio tamanho, um pouco maior ou menor.','Yes. Each creature has the size of the largest known fossil, with 1 block equal to 1 metre. Every individual also rolls its own size, a little larger or smaller.','Sí. Cada criatura tiene el tamaño del mayor fósil conocido, con 1 bloque igual a 1 metro. Cada individuo además sortea su propio tamaño, un poco mayor o menor.')},
 {q:T('E no multiplayer?','What about multiplayer?','¿Y en multijugador?'),a:T('A progressão é de cada jogador. Um jogador saltar de era não leva os outros: quem quiser ir junto entra no anel do Altar antes da ativação.','Progress belongs to each player. One player leaping to another era does not take the others: whoever wants to come steps into the Altar ring before it activates.','El progreso es de cada jugador. Que uno salte de era no lleva a los demás: quien quiera ir entra en el anillo del Altar antes de activarlo.')},
 {q:T('O que aparece no site é uma captura do jogo?','Is this page a capture of the game?','¿Lo que se ve en el sitio es una captura del juego?'),a:T('Não. Os modelos, as texturas e as animações vêm do mod e são desenhados no navegador, com câmera e luz próprias. O cenário da abertura é gerado por código.','No. The models, textures and animations come from the mod and are drawn in your browser with their own camera and light. The opening scenery is generated by code.','No. Los modelos, las texturas y las animaciones vienen del mod y se dibujan en el navegador, con cámara y luz propias. El paisaje de la portada se genera por código.')},
 {q:T('Tudo é original?','Is everything original?','¿Todo es original?'),a:T('Sim. Modelos, texturas, sprites e código são autorais e gerados pelas ferramentas do projeto. Fotos e artigos serviram só para medidas.','Yes. Models, textures, sprites and code are original and generated by the project’s own tools. Photos and papers were used only for measurements.','Sí. Modelos, texturas, sprites y código son originales y se generan con las herramientas del proyecto. Fotos y artículos sirvieron solo para medidas.')},
];
