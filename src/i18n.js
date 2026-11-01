// Public copy in Portuguese, English and Spanish. Keep technical instructions in installation and the wiki.
import {scientistName} from './editorial.js';
export const LANGS=['pt','en','es'];
export const HTML_LANG={pt:'pt-BR',en:'en',es:'es'};
export const UI={
 skip:['Pular para o bestiário','Skip to the bestiary','Saltar al bestiario'],'wiki.skip':['Pular para o conteúdo','Skip to content','Saltar al contenido'],'nav.wiki':['Wiki','Wiki','Wiki'],
 'loader.text':['Acordando os dinossauros','Waking the dinosaurs','Despertando a los dinosaurios'],
 'loader.fonts':['Abrindo o Caderno de Campo…','Opening the Field Notebook…','Abriendo el Cuaderno de Campo…'],'loader.3d':['Ligando a máquina do tempo…','Powering up the time machine…','Encendiendo la máquina del tiempo…'],
 'loader.meteor':['Calculando a queda do meteoro…','Plotting the meteor’s fall…','Calculando la caída del meteorito…'],'loader.pictures':['Revelando as fotos de campo…','Developing the field photos…','Revelando las fotos de campo…'],
 'loader.rex':['Acordando o T. rex…','Waking the T. rex…','Despertando al T. rex…'],'loader.done':["Tudo pronto.", "All set.", "Todo listo."],
 'nav.menu':['Menu','Menu','Menú'],'nav.story':['História','Story','Historia'],'nav.eras':['Eras','Eras','Eras'],'nav.bestiary':['Bestiário','Bestiary','Bestiario'],'nav.play':['Como se joga','How it plays','Cómo se juega'],'nav.roadmap':['Roteiro','Roadmap','Hoja de ruta'],'nav.cta':['Jogar','Play','Jugar'],
 'hero.eyebrow':["Mod para Minecraft Java 1.21.1 e 1.20.1 · Fabric, NeoForge e Forge", "A mod for Minecraft Java 1.21.1 and 1.20.1 · Fabric, NeoForge and Forge", "Mod para Minecraft Java 1.21.1 y 1.20.1 · Fabric, NeoForge y Forge"],
 'hero.lede':["Tem uma pegada de três dedos na beira do rio, maior que você. Quem deixou ainda está por perto.", "There's a three-toed footprint by the river, and it's bigger than you. Whatever left it is still nearby.", "Hay una huella de tres dedos junto al río, más grande que tú. Quien la dejó sigue cerca."],
 'hero.cta':['Conhecer as criaturas','Meet the creatures','Conocer las criaturas'],'hero.download':["Baixar no CurseForge", "Download on CurseForge", "Descargar en CurseForge"],
 'hero.fact1':["criaturas para conhecer", "creatures to discover", "criaturas por descubrir"],
 'hero.fact2':["companheiros de viagem", "travelling companions", "compañeros de viaje"],
 'hero.fact3':["capítulos pelo passado", "chapters through the past", "capítulos por el pasado"],
 'hero.loading':['Carregando o T. rex','Loading the T. rex','Cargando el T. rex'],'hero.ready':["Pronto para explorar", "Ready to explore", "Listo para explorar"],
 'film.chapter':['Capítulo 1 · Cretáceo Superior','Chapter 1 · Late Cretaceous','Capítulo 1 · Cretácico Superior'],'film.title':['Ecos do Fim.','Echoes of the End.','Ecos del Fin.'],
 'film.line':["Você não está sozinho aqui.", "You are not alone here.", "No estás solo aquí."],
 'film.scroll':['Role e ele ruge','Scroll and it roars','Desplázate y ruge'],'film.scroll2':["Chegue mais perto", "Take a closer look", "Acércate"],'film.scroll3':['Continue para a história','Continue to the story','Sigue hacia la historia'],
 'hero.note':["Conheça as criaturas do Terrassic.", "Meet the creatures of Terrassic.", "Conoce las criaturas de Terrassic."],

 'story.kicker':['A história · O Salto','The story · The Leap','La historia · El Salto'],
 'chron.eyebrow':['O Projeto Terrassic','The Terrassic Project','El Proyecto Terrassic'],
 'chron.title':["Ela atravessou primeiro.", "She crossed first.", "Ella cruzó primero."],
 'chron.p1':["O Projeto Terrassic nasceu de uma descoberta num sítio de fósseis: um âmbar capaz de abrir uma janela para o passado. A Dra. Katyusha atravessou essa janela e desapareceu.", "The Terrassic Project began with a discovery at a fossil site: amber that could open a window into the past. Dr. Katyusha stepped through and disappeared.", "El Proyecto Terrassic nació de un hallazgo en un yacimiento de fósiles: un ámbar capaz de abrir una ventana al pasado. La Dra. Katyusha la cruzó y desapareció."],
 'chron.p2':["Ao tentar encontrá-la, você acaba no Cretáceo, de mãos vazias. As anotações que ela deixou são sua primeira pista para entender o que aconteceu e encontrar um caminho de volta.", "While trying to find her, you end up in the Cretaceous empty-handed. The notes she left behind are your first clues to what happened and how to find a way home.", "Al intentar encontrarla, terminas en el Cretácico con las manos vacías. Las notas que dejó son tus primeras pistas para entender lo ocurrido y encontrar el camino de vuelta."],
 'chron.rule':["Siga as pistas ou escolha um lugar para ficar.", "Follow the clues or find a place to stay.", "Sigue las pistas o elige un lugar donde quedarte."],
 'book.report':['Relatório do Incidente','Incident Report','Informe del Incidente'],'book.katarina':["Páginas da Katyusha", "Katyusha’s pages", "Páginas de Katyusha"],'book.day':['Dia','Day','Día'],
 'eras.eyebrow':['Capítulos','Chapters','Capítulos'],'eras.title':["Eras", "Eras", "Eras"],
 'eras.lede':["Os capítulos da história chegam numa versão futura. Hoje o Terrassic acontece no Cretáceo Superior.", "The story chapters arrive in a future version. For now, Terrassic takes place in the Late Cretaceous.", "Los capítulos de la historia llegan en una versión futura. Por ahora, Terrassic transcurre en el Cretácico Superior."],
 'eras.event':['Evento','Event','Evento'],'eras.boss':['Chefe','Boss','Jefe'],'eras.where':['Onde','Where','Dónde'],'eras.fauna':['Quem vive lá','Who lives there','Quién vive allí'],'eras.plants':['Plantas','Plants','Plantas'],
 'best.eyebrow':['Bestiário','Bestiary','Bestiario'],'best.title':["Bestiário", "Bestiary", "Bestiario"],
 'best.lede':["Escolha uma criatura para ver o modelo, as animações e as anotações de campo. Arraste para girar.", "Pick a creature to see its model, its animations and the field notes. Drag to turn.", "Elige una criatura para ver el modelo, las animaciones y las notas de campo. Arrastra para girar."],
 'best.male':['Macho','Male','Macho'],'best.female':['Fêmea','Female','Hembra'],
 'best.search':['Buscar espécie','Search species','Buscar especie'],'best.sort':['Ordenar','Sort','Ordenar'],'best.sortSize':['Maior primeiro','Largest first','Más grande primero'],'best.sortName':['Nome','Name','Nombre'],'best.sortVersion':['Versão','Version','Versión'],
 'best.count':['{n} de {total} criaturas','{n} of {total} creatures','{n} de {total} criaturas'],'best.none':['Nenhuma espécie com esse nome.','No species by that name.','Ninguna especie con ese nombre.'],
 'best.noteBy':["Dra. Katyusha", "Dr. Katyusha", "Dra. Katyusha"],'best.loading':['Carregando o modelo…','Loading the model…','Cargando el modelo…'],'best.static':["Visualização 3D indisponível.", "3D preview unavailable.", "Vista 3D no disponible."],
 'best.view':['Ver {name} em 3D','View {name} in 3D','Ver {name} en 3D'],'best.canvas':['{name} em 3D. Arraste para girar.','{name} in 3D. Drag to turn.','{name} en 3D. Arrastra para girar.'],
 'fact.length':['Comprimento','Length','Longitud'],'fact.diet':['Dieta','Diet','Dieta'],'fact.era':['Era','Era','Era'],'fact.mount':['Montaria','Mount','Montura'],'fact.tame':['Domar','Taming','Domar'],'fact.version':['No mod','In the mod','En el mod'],
 'fact.wing':['Envergadura','Wingspan','Envergadura'],
 'group.all':['Todas','All','Todas'],'group.predator':['Predadores','Predators','Depredadores'],'group.herbivore':['Herbívoros','Herbivores','Herbívoros'],'group.flyer':['Voadores','Flyers','Voladores'],'group.water':['Água e margem','Water and shore','Agua y orilla'],
 'one.predator':['Predador','Predator','Depredador'],'one.herbivore':['Herbívoro','Herbivore','Herbívoro'],'one.flyer':['Voador','Flyer','Volador'],'one.water':['Água e margem','Water and shore','Agua y orilla'],
 'mount.ride':['Montável','Rideable','Montable'],'mount.platform':['Sela de plataforma','Platform saddle','Silla de plataforma'],'mount.shoulder':['Vai no ombro','Rides on your shoulder','Va en el hombro'],'mount.none':['Não montável','Not rideable','No montable'],
 'tame.food':['Comida na mão','Hand-feeding','Comida en la mano'],'tame.egg':['Só desde o ovo','Only from the egg','Solo desde el huevo'],'tame.baby':['Desde filhote','Raised from a baby','Desde cría'],'tame.knockout':['Nocaute','Knockout','Noqueo'],'tame.none':['Não se doma','Cannot be tamed','No se doma'],
 'ver.base':['Desde a v0.2','Since v0.2','Desde la v0.2'],'ver.next':['Entra na {v}','Joins in {v}','Llega en la {v}'],
 'guide.sci':['Ciência','Science','Ciencia'],'guide.behavior':['Comportamento','Behaviour','Comportamiento'],'guide.taming':['Domesticação','Taming','Domesticación'],'guide.utility':['Utilidade','Use','Utilidad'],
 'anim.idle':['Parado','Idle','Quieto'],'anim.walk':['Andar','Walk','Andar'],'anim.run':['Correr','Run','Correr'],'anim.attack':['Atacar','Attack','Atacar'],'anim.roar':['Rugir','Roar','Rugir'],'anim.sit':['Descansar','Rest','Descansar'],'anim.knocked_out':['Nocauteado','Knocked out','Noqueado'],'anim.wake':['Acordar','Wake up','Despertar'],'anim.eat':['Comer','Eat','Comer'],'anim.beg':['Pedir comida','Beg','Pedir comida'],'anim.tame':['Domesticar','Tame','Domesticar'],'anim.graze':['Pastar','Graze','Pastar'],'anim.call':['Chamado','Call','Llamada'],'anim.fly':['Voar','Fly','Volar'],'anim.glide':['Planar','Glide','Planear'],'anim.dig':['Cavar','Dig','Cavar'],'anim.display':['Exibição','Display','Exhibición'],'anim.charge':['Investida','Charge','Embestida'],'anim.brood':['Chocar','Brood','Incubar'],'anim.sniff':['Farejar','Sniff','Olfatear'],'anim.hide':['Esconder','Hide','Esconderse'],'anim.fish':['Pescar','Fish','Pescar'],'anim.rear':['Empinar','Rear up','Encabritarse'],'anim.nibble':['Mordiscar','Nibble','Mordisquear'],'anim.scent':['Almíscar','Musk','Almizcle'],
 'mech.eyebrow':['Como se joga','How it plays','Cómo se juega'],'mech.title':["Como se joga", "How it plays", "Cómo se juega"],
 'mech.lede':["Os herbívoros andam em bando, os predadores seguem os bandos e sempre tem alguém que deixa o ninho mal vigiado.", "Herbivores move in herds, predators follow the herds, and someone always leaves a nest poorly guarded.", "Los herbívoros andan en manada, los depredadores siguen a las manadas y siempre hay alguien que deja el nido mal vigilado."],
 'mech.egg.t':["Do ovo ao primeiro passeio", "From the egg to your first journey", "Del huevo al primer viaje"],
 'mech.egg.p':["Pegue um ovo num ninho selvagem, coloque no chão perto da sua casa e espere: o filhote que nascer já é seu. Os adultos da espécie percebem quando você começa a quebrar o ovo, então escolha bem a hora.", "Take an egg from a wild nest, set it down near your base and wait: the hatchling that comes out is already yours. The adults notice as soon as you start breaking the egg loose, so pick your moment.", "Toma un huevo de un nido salvaje, déjalo cerca de tu base y espera: la cría que nazca ya es tuya. Los adultos lo notan en cuanto empiezas a romper el huevo, así que elige bien el momento."],
 'mech.sex.t':['Macho e fêmea','Male and female','Macho y hembra'],
 'mech.sex.p':["As cores e as cristas mudam de um para o outro, então dá para saber quem é quem de longe. Um casal domesticado e bem alimentado põe ovos.", "Colour and crest change from one to the other, so you can tell them apart from a distance. A tamed pair that is well fed will lay eggs.", "Los colores y las crestas cambian de uno a otro, así que se distinguen de lejos. Una pareja domesticada y bien alimentada pone huevos."],
 'mech.tame.t':['Domesticação','Taming','Domesticación'],
 'mech.tame.s1':["Comida: os mais mansos aceitam da sua mão.", "Food: the calmer ones take it from your hand.", "Comida: los más mansos la aceptan de tu mano."],
 'mech.tame.s2':["Ovo: o filhote já nasce domesticado.", "Egg: the hatchling is born tame.", "Huevo: la cría ya nace domesticada."],
 'mech.tame.s3':["Nocaute: clava ou dardo tranquilizante, e comida enquanto ele dorme.", "Knockout: a club or a tranquilliser dart, then food while it sleeps.", "Noqueo: garrote o dardo tranquilizante, y comida mientras duerme."],
 'mech.tame.p':["Um animal seu segue você, fica onde você mandar e entra na briga do seu lado. Quanto mais você estudou a espécie, mais rápido ele aceita.", "Your animal follows you, stays where you tell it to and joins your fights. The more you have studied the species, the sooner it accepts you.", "Tu animal te sigue, se queda donde le digas y pelea a tu lado. Cuanto más hayas estudiado la especie, antes te acepta."],
 'mech.ride.t':['Montaria e voo','Riding and flight','Montura y vuelo'],
 'mech.ride.p':["Com sela, dá para montar em boa parte dos animais. O Pteranodon voa, o Mosasaurus nada, e o Alamosaurus carrega uma plataforma onde dá para construir.", "With a saddle, you can ride a good share of the animals. The Pteranodon flies, the Mosasaurus swims, and the Alamosaurus carries a platform you can build on.", "Con silla, puedes montar buena parte de los animales. El Pteranodon vuela, el Mosasaurus nada y el Alamosaurus lleva una plataforma sobre la que se puede construir."],
 'mech.sci.t':["Caderno de Campo", "Field Notebook", "Cuaderno de Campo"],
 'mech.sci.p':["Escave fósseis, desenhe os animais que encontrar e guarde tudo no Caderno de Campo. Uma espécie bem estudada é mais fácil de domesticar e de enfrentar.", "Dig up fossils, sketch the animals you come across and keep it all in the Field Notebook. A species you have studied well is easier to tame and to fight.", "Excava fósiles, dibuja los animales que encuentres y guárdalo todo en el Cuaderno de Campo. Una especie bien estudiada es más fácil de domesticar y de enfrentar."],
 'mech.arms.t':['Armas da época','Weapons of the age','Armas de la época'],
 'mech.arms.p':["Facas, clavas e lanças de pedra, osso e sílex, e arco, zarabatana e boleadeira para o que não deve chegar perto.", "Knives, clubs and spears of stone, bone and flint, and a bow, a blowgun and a bola for what should not get close.", "Cuchillos, garrotes y lanzas de piedra, hueso y sílex, y un arco, una cerbatana y unas boleadoras para lo que no debe acercarse."],
 'mech.thrown':['arremessada','thrown','arrojada'],
 'mech.journal.t':['Diário de Campo','Field Journal','Diario de Campo'],
 'mech.journal.p':["O diário da expedição faz parte do modo história, que chega numa versão futura.", "The expedition journal is part of story mode, which arrives in a future version.", "El diario de la expedición es parte del modo historia, que llega en una versión futura."],
 'road.eyebrow':['Roteiro','Roadmap','Hoja de ruta'],'road.title':["O próximo capítulo.", "The next chapter.", "El próximo capítulo."],
 'road.lede':["Novas criaturas, paisagens e pistas para continuar a viagem. Veja o que está em produção e o que vem depois.", "New creatures, landscapes, and clues for the journey ahead. See what is in progress and what comes next.", "Nuevas criaturas, paisajes y pistas para continuar el viaje. Descubre qué está en desarrollo y qué viene después."],
 'road.made':['criaturas já modeladas','creatures already modelled','criaturas ya modeladas'],'road.of':['de 152 planejadas no roteiro','of 152 planned on the roadmap','de 152 previstas en la hoja de ruta'],
 'road.done':['Publicada','Released','Publicada'],'road.wip':['Em produção','In progress','En producción'],'road.plan':['Planejada','Planned','Prevista'],'road.new':['+{n} criaturas','+{n} creatures','+{n} criaturas'],
 'inst.eyebrow':['Jogar','Play','Jugar'],'inst.title':["Como instalar", "How to install", "Cómo instalar"],
 'inst.lede':["Os arquivos ficam no CurseForge, um para cada versão do Minecraft e loader. Escolha o seu e siga os passos.", "The files are on CurseForge, one for each Minecraft version and loader. Pick yours and follow the steps.", "Los archivos están en CurseForge, uno para cada versión de Minecraft y loader. Elige el tuyo y sigue los pasos."],
 'inst.curseforge':['Baixar no CurseForge','Download on CurseForge','Descargar en CurseForge'],'inst.wiki':['Wiki do mod','Mod wiki','Wiki del mod'],'inst.report':['Reportar um problema','Report a problem','Reportar un problema'],'inst.donate':['Apoiar no Ko-fi','Support on Ko-fi','Apoyar en Ko-fi'],
 'faq.title':["Dúvidas", "Questions", "Dudas"],
 'foot.by':["Um mod de Rodrigo Gomes.", "A mod by Rodrigo Gomes.", "Un mod de Rodrigo Gomes."],
 'foot.top':['Voltar ao topo','Back to top','Volver arriba'],
 'foot.legal':['Projeto independente, sem afiliação à Mojang ou à Microsoft. Minecraft é marca da Mojang Synergies AB.','Independent project, not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Synergies AB.','Proyecto independiente, sin afiliación con Mojang ni Microsoft. Minecraft es una marca de Mojang Synergies AB.'],
 'meta.desc':["Sobreviva entre dinossauros no Minecraft. Crie companheiros desde o ovo, monte e voe no Terrassic.", "Survive among dinosaurs in Minecraft. Raise companions from the egg, ride and fly in Terrassic.", "Sobrevive entre dinosaurios en Minecraft. Cría compañeros desde el huevo, monta y vuela en Terrassic."],
 'best.partReady':["Com o modelo novo ({n})", "With the new model ({n})", "Con el modelo nuevo ({n})"],
 'best.partRemake':["No jogo, sendo refeitos ({n})", "In the game, being remade ({n})", "En el juego, rehaciéndose ({n})"],
 'best.showAll':["Mostrar todos os {n}", "Show all {n}", "Mostrar los {n}"],
 'best.plannedHead':["Ainda não estão no jogo: os próximos do Cretáceo ({n})", "Not in the game yet: the next Cretaceous animals ({n})", "Aún no están en el juego: los próximos del Cretácico ({n})"],
 'best.planned':["Ainda não está no mod. Está na lista dos próximos animais do Cretáceo, e só ganha modelo depois de um estudo próprio.", "Not in the mod yet. It is on the list of the next Cretaceous animals, and gets a model only after its own study.", "Aún no está en el mod. Está en la lista de los próximos animales del Cretácico y solo tendrá modelo después de un estudio propio."],
 'best.plannedStage':["{name} ainda não tem modelo.", "{name} has no model yet.", "{name} aún no tiene modelo."],
 'best.notYet':["Ainda não", "Not yet", "Aún no"],
 'diet.filter':["Filtrador", "Filter feeder", "Filtrador"],
 'soon':["Em breve", "Coming soon", "Próximamente"],
 'best.soon':["Este animal está sendo refeito. Até lá, mostramos só a silhueta.", "This animal is being remade. Until then, you only see its silhouette.", "Este animal se está rehaciendo. Hasta entonces, solo mostramos su silueta."],
 'hero.dlnote':["Abre a página do Terrassic no CurseForge, com os arquivos para Fabric, NeoForge e Forge.", "Opens the Terrassic page on CurseForge, with the files for Fabric, NeoForge and Forge.", "Abre la página de Terrassic en CurseForge, con los archivos para Fabric, NeoForge y Forge."],
 'film.scroll3b':["Continue descendo", "Keep scrolling", "Sigue bajando"],
 'soonstory.eyebrow':["História", "Story", "Historia"],
 'soonstory.title':["Modo história", "Story mode", "Modo historia"],
 'soonstory.p':["A expedição da Dra. Katyusha, a Fenda e os capítulos chegam numa versão futura.", "Dr. Katyusha’s expedition, the Rift and the chapters arrive in a future version.", "La expedición de la Dra. Katyusha, la Grieta y los capítulos llegan en una versión futura."],
 'anim.swipe':['Golpe de garra','Claw swipe','Zarpazo'],'anim.preen':['Ajeitar as penas','Preen','Acicalarse'],'anim.ruffle':['Arrepiar as penas','Ruffle','Erizar las plumas'],'anim.leap':['Saltar','Leap','Saltar'],'anim.screech':['Guinchar','Screech','Chillar'],'anim.kick':['Chutar','Kick','Patear'],'anim.pounce':['Dar o bote','Pounce','Abalanzarse'],
 'anim.bank_left':['Curva à esquerda','Bank left','Giro a la izquierda'],'anim.bank_right':['Curva à direita','Bank right','Giro a la derecha'],'anim.takeoff':['Decolar','Take off','Despegar'],'anim.land':['Pousar','Land','Aterrizar'],'anim.dive':['Mergulhar','Dive','Picado'],'anim.scoop':['Pescar no voo','Scoop','Pescar al vuelo'],'anim.water_takeoff':['Decolar da água','Take off from water','Despegar del agua'],'anim.sun':['Tomar sol','Sunbathe','Tomar el sol'],'anim.knocked_out_air':['Desmaiar no ar','Knocked out in flight','Desmayo en el aire'],
 'anim.look_back':['Olhar para trás','Look back','Mirar atrás'],
 'anim.shake':['Sacudir','Shake','Sacudirse'],
 'anim.yawn':['Bocejar','Yawn','Bostezar'],
 'anim.stretch':['Espreguiçar','Stretch','Estirarse'],
 'anim.stalk':['Espreitar','Stalk','Acechar'],
 'anim.swim':['Nadar','Swim','Nadar'],
 'anim.roar_loud':['Rugido forte','Loud roar','Rugido fuerte'],
 'anim.threat':['Ameaçar','Threaten','Amenazar'],
 'anim.attack_quick':['Mordida rápida','Quick bite','Mordisco rápido'],
 'anim.stomp':['Pisotear','Stomp','Pisotear'],
 'anim.hurt':['Ferido','Hurt','Herido'],
 'anim.death':['Morrer','Death','Morir'],
 'anim.drink':['Beber','Drink','Beber'],
 'anim.sleep':['Dormir','Sleep','Dormir'],
 'anim.wake_sleep':['Acordar do sono','Wake from sleep','Despertar del sueño'],
};
let lang='pt';
export const getLang=()=>lang;
export const t=(key,vars={})=>{const row=UI[key];let s=row?row[LANGS.indexOf(lang)]??row[0]:key;for(const [k,v] of Object.entries(vars))s=s.replaceAll(`{${k}}`,v);return s};
export const pick=obj=>scientistName(obj?.[lang]??obj?.pt??'');
export function detectLang(){
 let stored=null;try{stored=localStorage.getItem('terrassic.lang')}catch{}
 const query=new URLSearchParams(location.search).get('lang');
 // English by default; Portuguese and Spanish when chosen or asked for in the address (?lang=pt).
 return [query,stored].find(l=>LANGS.includes(l))||'en';
}
export function setLang(next){
 lang=LANGS.includes(next)?next:'pt';try{localStorage.setItem('terrassic.lang',lang)}catch{}
 document.documentElement.lang=HTML_LANG[lang];
 for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
 for(const el of document.querySelectorAll('[data-i18n-placeholder]'))el.placeholder=t(el.dataset.i18nPlaceholder);
 for(const b of document.querySelectorAll('[data-lang]'))b.setAttribute('aria-pressed',String(b.dataset.lang===lang));
 document.querySelector('meta[name="description"]')?.setAttribute('content',t('meta.desc'));
 document.querySelector('meta[property="og:description"]')?.setAttribute('content',t('meta.desc'));
}
