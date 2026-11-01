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
 'hero.eyebrow':['Mod para Minecraft Java 1.20.1 · Fabric e Forge','A Minecraft Java 1.20.1 mod · Fabric and Forge','Mod para Minecraft Java 1.20.1 · Fabric y Forge'],
 'hero.lede':["Um mod de dinossauros para Minecraft Java. Cada espécie nasce de um ovo e tem o seu jeito de ser domada.", "A dinosaur mod for Minecraft Java. Every species hatches from an egg and has its own way of being tamed.", "Un mod de dinosaurios para Minecraft Java. Cada especie nace de un huevo y tiene su propia forma de ser domada."],
 'hero.cta':['Conhecer as criaturas','Meet the creatures','Conocer las criaturas'],'hero.download':["Baixar no CurseForge", "Download on CurseForge", "Descargar en CurseForge"],
 'hero.fact1':["criaturas para conhecer", "creatures to discover", "criaturas por descubrir"],
 'hero.fact2':["companheiros de viagem", "travelling companions", "compañeros de viaje"],
 'hero.fact3':["capítulos pelo passado", "chapters through the past", "capítulos por el pasado"],
 'hero.loading':['Carregando o T. rex','Loading the T. rex','Cargando el T. rex'],'hero.ready':["Pronto para explorar", "Ready to explore", "Listo para explorar"],
 'film.chapter':['Capítulo 1 · Cretáceo Superior','Chapter 1 · Late Cretaceous','Capítulo 1 · Cretácico Superior'],'film.title':['Ecos do Fim.','Echoes of the End.','Ecos del Fin.'],
 'film.line':["Você não está sozinho aqui.", "You are not alone here.", "No estás solo aquí."],
 'film.scroll':['Role e ele ruge','Scroll and it roars','Desplázate y ruge'],'film.scroll2':["Chegue mais perto", "Take a closer look", "Acércate"],'film.scroll3':['Continue para a história','Continue to the story','Sigue hacia la historia'],
 'hero.note':["Conheça as criaturas do Terrassic.", "Meet the creatures of Terrassic.", "Conoce las criaturas de Terrassic."],
 'hero.sound':['Ouvir o rugido','Hear the roar','Oír el rugido'],
 'story.kicker':['A história · O Salto','The story · The Leap','La historia · El Salto'],
 'chron.eyebrow':['O Projeto Terrassic','The Terrassic Project','El Proyecto Terrassic'],
 'chron.title':["Ela atravessou primeiro.", "She crossed first.", "Ella cruzó primero."],
 'chron.p1':["O Projeto Terrassic nasceu de uma descoberta num sítio de fósseis: um âmbar capaz de abrir uma janela para o passado. A Dra. Katyusha atravessou essa janela e desapareceu.", "The Terrassic Project began with a discovery at a fossil site: amber that could open a window into the past. Dr. Katyusha stepped through and disappeared.", "El Proyecto Terrassic nació de un hallazgo en un yacimiento de fósiles: un ámbar capaz de abrir una ventana al pasado. La Dra. Katyusha la cruzó y desapareció."],
 'chron.p2':["Ao tentar encontrá-la, você acaba no Cretáceo, de mãos vazias. As anotações que ela deixou são sua primeira pista para entender o que aconteceu e encontrar um caminho de volta.", "While trying to find her, you end up in the Cretaceous empty-handed. The notes she left behind are your first clues to what happened and how to find a way home.", "Al intentar encontrarla, terminas en el Cretácico con las manos vacías. Las notas que dejó son tus primeras pistas para entender lo ocurrido y encontrar el camino de vuelta."],
 'chron.rule':["Siga as pistas ou escolha um lugar para ficar.", "Follow the clues or find a place to stay.", "Sigue las pistas o elige un lugar donde quedarte."],
 'book.report':['Relatório do Incidente','Incident Report','Informe del Incidente'],'book.katarina':["Páginas da Katyusha", "Katyusha’s pages", "Páginas de Katyusha"],'book.day':['Dia','Day','Día'],
 'eras.eyebrow':['Capítulos','Chapters','Capítulos'],'eras.title':["Eras", "Eras", "Eras"],
 'eras.lede':["Hoje o Terrassic acontece no Cretáceo Superior, no mundo normal do Minecraft. As outras eras chegam com o modo história.", "Today Terrassic takes place in the Late Cretaceous, in the normal Minecraft world. The other eras arrive with story mode.", "Hoy Terrassic transcurre en el Cretácico Superior, en el mundo normal de Minecraft. Las otras eras llegan con el modo historia."],
 'eras.event':['Evento','Event','Evento'],'eras.boss':['Chefe','Boss','Jefe'],'eras.where':['Onde','Where','Dónde'],'eras.fauna':['Quem vive lá','Who lives there','Quién vive allí'],'eras.plants':['Plantas','Plants','Plantas'],
 'best.eyebrow':['Bestiário','Bestiary','Bestiario'],'best.title':["Bestiário", "Bestiary", "Bestiario"],
 'best.lede':["Os animais em cores já estão com o modelo novo. Os outros estão no jogo com o modelo antigo e aparecem como silhueta até serem refeitos. Arraste o 3D para girar.", "Animals in colour already have their new model. The others are in the game with their old model and show as a silhouette until they are remade. Drag the 3D view to turn it.", "Los animales en color ya tienen el modelo nuevo. Los demás están en el juego con el modelo antiguo y aparecen como silueta hasta que se rehagan. Arrastra la vista 3D para girarla."],
 'best.male':['Macho','Male','Macho'],'best.female':['Fêmea','Female','Hembra'],'best.sound':['Som','Sound','Sonido'],
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
 'mech.lede':["O que já existe no mod hoje.", "What is in the mod today.", "Lo que ya existe en el mod hoy."],
 'mech.egg.t':["Ovos", "Eggs", "Huevos"],
 'mech.egg.p':["Cada espécie tem o seu ovo. Algumas só se domam se você estiver lá quando o filhote nasce.", "Every species has its own egg. Some can only be tamed if you are there when the baby hatches.", "Cada especie tiene su huevo. Algunas solo se doman si estás allí cuando nace la cría."],
 'mech.sex.t':['Macho e fêmea','Male and female','Macho y hembra'],
 'mech.sex.p':["Machos e fêmeas têm cores e adornos diferentes.", "Males and females have different colours and markings.", "Machos y hembras tienen colores y adornos distintos."],
 'mech.tame.t':['Domesticação','Taming','Domesticación'],
 'mech.tame.s1':["Comida na mão", "Hand-feeding", "Comida en la mano"],
 'mech.tame.s2':["Desde o ovo ou filhote", "From the egg or as a baby", "Desde el huevo o de cría"],
 'mech.tame.s3':["Nocaute com dardo de zarabatana", "Knockout with a blowgun dart", "Noqueo con dardo de cerbatana"],
 'mech.tame.p':["Quase toda espécie se doma de um desses jeitos. A ficha do animal no bestiário diz qual.", "Almost every species is tamed in one of these ways. Its profile in the bestiary says which.", "Casi todas las especies se doman de una de estas formas. Su ficha en el bestiario dice cuál."],
 'mech.ride.t':["Montaria", "Riding", "Montura"],
 'mech.ride.p':["Os grandes aceitam sela, alguns carregam uma plataforma nas costas e os pequenos vão no ombro. O Pteranodon voa com você.", "The big ones take a saddle, some carry a platform on their back and the small ones ride on your shoulder. The Pteranodon flies with you.", "Los grandes aceptan silla, algunos llevan una plataforma en el lomo y los pequeños van en el hombro. El Pteranodon vuela contigo."],
 'mech.sci.t':["Caderno de Campo", "Field Notebook", "Cuaderno de Campo"],
 'mech.sci.p':["Cada espécie tem uma página no Guia de Campo, que se completa em quatro níveis com fósseis, observação e esboços.", "Every species has a page in the Field Guide, filled in over four levels with fossils, observation and sketches.", "Cada especie tiene una página en la Guía de Campo, que se completa en cuatro niveles con fósiles, observación y bocetos."],
 'mech.arms.t':['Armas da época','Weapons of the age','Armas de la época'],
 'mech.arms.p':["Facas, clavas e lanças feitas de pedra, osso e sílex.", "Knives, clubs, and spears crafted from stone, bone, and flint.", "Cuchillos, garrotes y lanzas de piedra, hueso y sílex."],
 'mech.thrown':['arremessada','thrown','arrojada'],
 'mech.journal.t':['Diário de Campo','Field Journal','Diario de Campo'],
 'mech.journal.p':["O diário da expedição faz parte do modo história, que chega numa versão futura.", "The expedition journal is part of story mode, which arrives in a future version.", "El diario de la expedición es parte del modo historia, que llega en una versión futura."],
 'road.eyebrow':['Roteiro','Roadmap','Hoja de ruta'],'road.title':["O próximo capítulo.", "The next chapter.", "El próximo capítulo."],
 'road.lede':["Novas criaturas, paisagens e pistas para continuar a viagem. Veja o que está em produção e o que vem depois.", "New creatures, landscapes, and clues for the journey ahead. See what is in progress and what comes next.", "Nuevas criaturas, paisajes y pistas para continuar el viaje. Descubre qué está en desarrollo y qué viene después."],
 'road.made':['criaturas já modeladas','creatures already modelled','criaturas ya modeladas'],'road.of':['de 152 planejadas no roteiro','of 152 planned on the roadmap','de 152 previstas en la hoja de ruta'],
 'road.done':['Publicada','Released','Publicada'],'road.wip':['Em produção','In progress','En producción'],'road.plan':['Planejada','Planned','Prevista'],'road.new':['+{n} criaturas','+{n} creatures','+{n} criaturas'],
 'inst.eyebrow':['Jogar','Play','Jugar'],'inst.title':["Como instalar", "How to install", "Cómo instalar"],
 'inst.lede':["Os arquivos ficam no CurseForge. Baixe a versão do seu loader, Fabric ou Forge, e siga os passos ao lado.", "The files are on CurseForge. Download the one for your loader, Fabric or Forge, and follow the steps.", "Los archivos están en CurseForge. Descarga el de tu loader, Fabric o Forge, y sigue los pasos."],
 'inst.curseforge':['Baixar no CurseForge','Download on CurseForge','Descargar en CurseForge'],'inst.wiki':['Wiki do mod','Mod wiki','Wiki del mod'],'inst.report':['Reportar um problema','Report a problem','Reportar un problema'],'inst.donate':['Apoiar no Ko-fi','Support on Ko-fi','Apoyar en Ko-fi'],
 'faq.title':["Dúvidas", "Questions", "Dudas"],
 'foot.by':["Um mod de Rodrigo Gomes.", "A mod by Rodrigo Gomes.", "Un mod de Rodrigo Gomes."],
 'foot.top':['Voltar ao topo','Back to top','Volver arriba'],
 'foot.legal':['Projeto independente, sem afiliação à Mojang ou à Microsoft. Minecraft é marca da Mojang Synergies AB.','Independent project, not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Synergies AB.','Proyecto independiente, sin afiliación con Mojang ni Microsoft. Minecraft es una marca de Mojang Synergies AB.'],
 'meta.desc':["Sobreviva entre dinossauros no Minecraft. Crie companheiros desde o ovo, monte e voe no Terrassic.", "Survive among dinosaurs in Minecraft. Raise companions from the egg, ride and fly in Terrassic.", "Sobrevive entre dinosaurios en Minecraft. Cría compañeros desde el huevo, monta y vuela en Terrassic."],
 'best.plannedHead':["Ainda não estão no jogo: os próximos do Cretáceo ({n})", "Not in the game yet: the next Cretaceous animals ({n})", "Aún no están en el juego: los próximos del Cretácico ({n})"],
 'best.planned':["Ainda não está no mod. Está na lista dos próximos animais do Cretáceo, e só ganha modelo depois de um estudo próprio.", "Not in the mod yet. It is on the list of the next Cretaceous animals, and gets a model only after its own study.", "Aún no está en el mod. Está en la lista de los próximos animales del Cretácico y solo tendrá modelo después de un estudio propio."],
 'best.plannedStage':["{name} ainda não tem modelo.", "{name} has no model yet.", "{name} aún no tiene modelo."],
 'best.notYet':["Ainda não", "Not yet", "Aún no"],
 'diet.filter':["Filtrador", "Filter feeder", "Filtrador"],
 'soon':["Em breve", "Coming soon", "Próximamente"],
 'best.soon':["Este animal está sendo refeito. Até lá, mostramos só a silhueta.", "This animal is being remade. Until then, you only see its silhouette.", "Este animal se está rehaciendo. Hasta entonces, solo mostramos su silueta."],
 'hero.dlnote':["Abre a página do Terrassic no CurseForge, com os arquivos para Fabric e Forge.", "Opens the Terrassic page on CurseForge, with the files for Fabric and Forge.", "Abre la página de Terrassic en CurseForge, con los archivos para Fabric y Forge."],
 'film.scroll3b':["Continue descendo", "Keep scrolling", "Sigue bajando"],
 'soonstory.eyebrow':["História", "Story", "Historia"],
 'soonstory.title':["Modo história", "Story mode", "Modo historia"],
 'soonstory.p':["A expedição da Dra. Katyusha, a Fenda e os capítulos chegam numa versão futura.", "Dr. Katyusha’s expedition, the Rift and the chapters arrive in a future version.", "La expedición de la Dra. Katyusha, la Grieta y los capítulos llegan en una versión futura."],
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
