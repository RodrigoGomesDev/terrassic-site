// Public copy in Portuguese, English and Spanish. Keep technical instructions in installation and the wiki.
import {scientistName} from './editorial.js';
export const LANGS=['pt','en','es'];
export const HTML_LANG={pt:'pt-BR',en:'en',es:'es'};
export const UI={
 skip:['Pular para o bestiário','Skip to the bestiary','Saltar al bestiario'],'wiki.skip':['Pular para o conteúdo','Skip to content','Saltar al contenido'],'nav.wiki':['Wiki','Wiki','Wiki'],
 'loader.text':['Acordando os dinossauros','Waking the dinosaurs','Despertando a los dinosaurios'],
 'loader.fonts':['Abrindo o Caderno de Campo…','Opening the Field Notebook…','Abriendo el Cuaderno de Campo…'],'loader.3d':['Ligando a máquina do tempo…','Powering up the time machine…','Encendiendo la máquina del tiempo…'],
 'loader.meteor':['Calculando a queda do meteoro…','Plotting the meteor’s fall…','Calculando la caída del meteorito…'],'loader.pictures':['Revelando as fotos de campo…','Developing the field photos…','Revelando las fotos de campo…'],
 'loader.rex':['Acordando o T. rex…','Waking the T. rex…','Despertando al T. rex…'],'loader.done':['A Fenda se abre.','The Rift opens.','La Grieta se abre.'],
 'nav.story':['História','Story','Historia'],'nav.eras':['Eras','Eras','Eras'],'nav.bestiary':['Bestiário','Bestiary','Bestiario'],'nav.play':['Como se joga','How it plays','Cómo se juega'],'nav.roadmap':['Roteiro','Roadmap','Hoja de ruta'],'nav.cta':['Jogar','Play','Jugar'],
 'hero.eyebrow':['Mod para Minecraft Java 1.20.1 · Fabric e Forge','A Minecraft Java 1.20.1 mod · Fabric and Forge','Mod para Minecraft Java 1.20.1 · Fabric y Forge'],
 'hero.lede':["Atravesse a Fenda e sobreviva entre dinossauros. Crie seus companheiros desde o ovo, explore os céus e siga os vestígios de uma expedição perdida.", "Cross the Rift and survive among dinosaurs. Raise companions from the egg, take to the skies, and follow the traces of a lost expedition.", "Cruza la Grieta y sobrevive entre dinosaurios. Cría compañeros desde el huevo, surca los cielos y sigue las huellas de una expedición perdida."],
 'hero.cta':['Conhecer as criaturas','Meet the creatures','Conocer las criaturas'],'hero.download':['Baixar a v0.2.0','Download v0.2.0','Descargar la v0.2.0'],
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
 'eras.eyebrow':['Capítulos','Chapters','Capítulos'],'eras.title':['Uma era de cada vez.','One era at a time.','Una era cada vez.'],
 'eras.lede':["As pistas de Katyusha levam a florestas, mares e continentes de outros tempos.", "Katyusha’s trail leads through forests, seas, and continents of another time.", "Las pistas de Katyusha llevan a bosques, mares y continentes de otros tiempos."],
 'eras.event':['Evento','Event','Evento'],'eras.boss':['Chefe','Boss','Jefe'],'eras.where':['Onde','Where','Dónde'],'eras.fauna':['Quem vive lá','Who lives there','Quién vive allí'],'eras.plants':['Plantas','Plants','Plantas'],
 'best.eyebrow':['Bestiário','Bestiary','Bestiario'],'best.title':['Veja cada uma de perto.','See each one up close.','Mira cada una de cerca.'],
 'best.lede':["Escolha uma criatura, veja como ela se move e conheça seus hábitos. Arraste para girar.", "Choose a creature, watch it move, and learn its habits. Drag to turn.", "Elige una criatura, observa cómo se mueve y conoce sus hábitos. Arrastra para girar."],
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
 'mech.eyebrow':['Como se joga','How it plays','Cómo se juega'],'mech.title':['Sobreviva com o que a época oferece.','Survive with what the age provides.','Sobrevive con lo que la época ofrece.'],
 'mech.lede':["Encontre comida, erga um abrigo e prepare-se para o que vive além do acampamento.", "Find food, build a shelter, and prepare for what lives beyond camp.", "Busca comida, construye un refugio y prepárate para lo que vive más allá del campamento."],
 'mech.egg.t':["Do ovo ao primeiro passeio", "From the egg to your first journey", "Del huevo al primer viaje"],
 'mech.egg.p':["Cuide dos ovos e esteja por perto quando os filhotes nascerem. Eles vão reconhecer você como parte da família.", "Tend to the eggs and be there when they hatch. The hatchlings will recognise you as family.", "Cuida los huevos y quédate cerca cuando nazcan las crías. Te reconocerán como parte de su familia."],
 'mech.sex.t':['Macho e fêmea','Male and female','Macho y hembra'],
 'mech.sex.p':["Cores, cristas e adornos variam entre machos e fêmeas. Encontre um casal e acompanhe a próxima geração.", "Colours, crests, and markings vary between males and females. Find a pair and raise the next generation.", "Los colores, las crestas y los adornos varían entre machos y hembras. Encuentra una pareja y cría la siguiente generación."],
 'mech.tame.t':['Domesticação','Taming','Domesticación'],
 'mech.tame.s1':["Ofereça a comida certa.", "Offer the right food.", "Ofrece la comida adecuada."],
 'mech.tame.s2':["Crie companheiros desde filhotes.", "Raise companions from hatchlings.", "Cría compañeros desde pequeños."],
 'mech.tame.s3':["Prepare-se para os mais difíceis.", "Come prepared for the tougher ones.", "Prepárate para los más difíciles."],
 'mech.tame.p':["Ganhe a confiança de um animal e leve companhia para as suas explorações.", "Earn an animal’s trust and bring a companion on your explorations.", "Gánate la confianza de un animal y lleva compañía en tus exploraciones."],
 'mech.ride.t':['Montaria e voo','Riding and flight','Montura y vuelo'],
 'mech.ride.p':["Atravesse as planícies montado ou decole com um Pteranodon. Lá de cima, fica mais fácil escolher o próximo destino.", "Ride across the plains or take flight on a Pteranodon. From up there, it is easier to choose your next destination.", "Recorre las llanuras a lomos de una montura o despega con un Pteranodon. Desde arriba, es más fácil elegir tu próximo destino."],
 'mech.sci.t':["Caderno de Campo", "Field Notebook", "Cuaderno de Campo"],
 'mech.sci.p':["Escave fósseis, observe os animais e registre suas descobertas. Cada página ajuda a conhecer melhor a fauna ao seu redor.", "Dig up fossils, observe the wildlife, and record your discoveries. Each page helps you understand the creatures around you.", "Excava fósiles, observa a los animales y registra tus hallazgos. Cada página te ayuda a conocer mejor la fauna que te rodea."],
 'mech.arms.t':['Armas da época','Weapons of the age','Armas de la época'],
 'mech.arms.p':["Facas, clavas e lanças feitas de pedra, osso e sílex.", "Knives, clubs, and spears crafted from stone, bone, and flint.", "Cuchillos, garrotes y lanzas de piedra, hueso y sílex."],
 'mech.thrown':['arremessada','thrown','arrojada'],
 'mech.journal.t':['Diário de Campo','Field Journal','Diario de Campo'],
 'mech.journal.p':["Siga as pistas da expedição, reúna fragmentos de âmbar e reconstrua o Altar do Salto. Há muito mais do outro lado.", "Follow the expedition’s clues, gather amber fragments, and rebuild the Leap Altar. There is more waiting on the other side.", "Sigue las pistas de la expedición, reúne fragmentos de ámbar y reconstruye el Altar del Salto. Hay más por descubrir al otro lado."],
 'road.eyebrow':['Roteiro','Roadmap','Hoja de ruta'],'road.title':["O próximo capítulo.", "The next chapter.", "El próximo capítulo."],
 'road.lede':["Novas criaturas, paisagens e pistas para continuar a viagem. Veja o que está em produção e o que vem depois.", "New creatures, landscapes, and clues for the journey ahead. See what is in progress and what comes next.", "Nuevas criaturas, paisajes y pistas para continuar el viaje. Descubre qué está en desarrollo y qué viene después."],
 'road.made':['criaturas já modeladas','creatures already modelled','criaturas ya modeladas'],'road.of':['de 152 planejadas no roteiro','of 152 planned on the roadmap','de 152 previstas en la hoja de ruta'],
 'road.done':['Publicada','Released','Publicada'],'road.wip':['Em produção','In progress','En producción'],'road.plan':['Planejada','Planned','Prevista'],'road.new':['+{n} criaturas','+{n} creatures','+{n} criaturas'],
 'inst.eyebrow':['Jogar','Play','Jugar'],'inst.title':['Como instalar.','How to install.','Cómo instalar.'],
 'inst.lede':["Escolha Fabric ou Forge e baixe o arquivo correspondente. O Terrassic está em desenvolvimento.", "Choose Fabric or Forge and download the matching file. Terrassic is in development.", "Elige Fabric o Forge y descarga el archivo correspondiente. Terrassic está en desarrollo."],
 'inst.curseforge':['Baixar no CurseForge','Download on CurseForge','Descargar en CurseForge'],'inst.wiki':['Wiki do mod','Mod wiki','Wiki del mod'],'inst.report':['Reportar um problema','Report a problem','Reportar un problema'],'inst.donate':['Apoiar no Ko-fi','Support on Ko-fi','Apoyar en Ko-fi'],
 'faq.title':['Antes de jogar.','Before you play.','Antes de jugar.'],
 'foot.by':["Um mod de Rodrigo Gomes.", "A mod by Rodrigo Gomes.", "Un mod de Rodrigo Gomes."],
 'foot.top':['Voltar ao topo','Back to top','Volver arriba'],
 'foot.legal':['Projeto independente, sem afiliação à Mojang ou à Microsoft. Minecraft é marca da Mojang Synergies AB.','Independent project, not affiliated with Mojang or Microsoft. Minecraft is a trademark of Mojang Synergies AB.','Proyecto independiente, sin afiliación con Mojang ni Microsoft. Minecraft es una marca de Mojang Synergies AB.'],
 'meta.desc':["Atravesse a Fenda e sobreviva entre dinossauros. Crie companheiros, explore os céus e siga uma expedição perdida em Terrassic.", "Cross the Rift and survive among dinosaurs. Raise companions, take to the skies, and follow a lost expedition in Terrassic.", "Cruza la Grieta y sobrevive entre dinosaurios. Cría compañeros, surca los cielos y sigue una expedición perdida en Terrassic."],
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
