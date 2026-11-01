// Cretaceous animals that are on the mod's plan but not in the game yet. They have no model, so the site lists them
// by name and size only. Data from the mod's roster (tools/roster/roster_data.py) and the v1 plan; sizes are the
// planning values there (body length, or wingspan for pterosaurs), not final.
// Fields: id | name en | name pt | name es | site group | diet | era (early/late) | metres
const ROWS=`
acrocanthosaurus|Acrocanthosaurus|Acrocantossauro|Acrocantosaurio|predator|carnivore|early|11.5
concavenator|Concavenator|Concavenator|Concavenator|predator|carnivore|early|6
utahraptor|Utahraptor|Utahraptor|Utahraptor|predator|carnivore|early|7
deinonychus|Deinonychus|Deinonico|Deinonychus|predator|carnivore|early|3.4
yutyrannus|Yutyrannus|Yutyrannus|Yutyrannus|predator|carnivore|early|9
sinornithosaurus|Sinornithosaurus|Sinornithosaurus|Sinornithosaurus|predator|carnivore|early|1
sarcosuchus|Sarcosuchus|Sarcosuchus|Sarcosuchus|water|carnivore|early|9.5
baryonyx|Baryonyx|Barionix|Baryonyx|predator|piscivore|early|10
suchomimus|Suchomimus|Suchomimus|Suchomimus|predator|piscivore|early|11
irritator|Irritator|Irritator|Irritator|predator|piscivore|early|8
iguanodon|Iguanodon|Iguanodonte|Iguanodonte|herbivore|herbivore|early|13
ouranosaurus|Ouranosaurus|Ouranossauro|Ouranosaurus|herbivore|herbivore|early|8.3
psittacosaurus|Psittacosaurus|Psitacossauro|Psitacosaurio|herbivore|herbivore|early|2
sauropelta|Sauropelta|Sauropelta|Sauropelta|herbivore|herbivore|early|5
gastonia|Gastonia|Gastonia|Gastonia|herbivore|herbivore|early|5
amargasaurus|Amargasaurus|Amargassauro|Amargasaurus|herbivore|herbivore|early|10
nigersaurus|Nigersaurus|Nigersaurus|Nigersaurus|herbivore|herbivore|early|9
microraptor|Microraptor|Microraptor|Microraptor|flyer|carnivore|early|0.8
mei|Mei|Mei|Mei|predator|carnivore|early|0.5
sinosauropteryx|Sinosauropteryx|Sinosauropteryx|Sinosauropteryx|predator|carnivore|early|1
bernissartia|Bernissartia|Bernissartia|Bernissartia|water|omnivore|early|0.6
repenomamus|Repenomamus|Repenomamus|Repenomamus|predator|carnivore|early|1
confuciusornis|Confuciusornis|Confuciusornis|Confuciusornis|flyer|omnivore|early|0.7
tapejara|Tapejara|Tapejara|Tapejara|flyer|omnivore|early|3.5
hamipterus|Hamipterus|Hamipterus|Hamipterus|flyer|piscivore|early|3.5
anhanguera|Anhanguera|Anhanguera|Anhanguera|flyer|piscivore|early|4.5
ornithocheirus|Ornithocheirus|Ornithocheirus|Ornithocheirus|flyer|piscivore|early|5
kronosaurus|Kronosaurus|Kronosaurus|Kronosaurus|water|carnivore|early|10
leptocleidus|Leptocleidus|Leptocleidus|Leptocleidus|water|piscivore|early|3
mapusaurus|Mapusaurus|Mapusaurus|Mapusaurus|predator|carnivore|late|12
nanuqsaurus|Nanuqsaurus|Nanuqsaurus|Nanuqsaurus|predator|carnivore|late|6
achillobator|Achillobator|Achillobator|Achillobator|predator|carnivore|late|6
austroraptor|Austroraptor|Austroraptor|Austroraptor|predator|piscivore|late|6
masiakasaurus|Masiakasaurus|Masiakasaurus|Masiakasaurus|predator|carnivore|late|2
kaprosuchus|Kaprosuchus|Kaprosuchus|Kaprosuchus|predator|carnivore|late|6
sanajeh|Sanajeh|Sanajeh|Sanajeh|predator|carnivore|late|3.5
beelzebufo|Beelzebufo|Beelzebufo|Beelzebufo|predator|carnivore|late|0.4
gigantoraptor|Gigantoraptor|Gigantoraptor|Gigantoraptor|herbivore|omnivore|late|8
edmontonia|Edmontonia|Edmontonia|Edmontonia|herbivore|herbivore|late|6.6
magyarosaurus|Magyarosaurus|Magyarosaurus|Magyarosaurus|herbivore|herbivore|late|6
stegoceras|Stegoceras|Stegoceras|Stegoceras|herbivore|herbivore|late|2.5
oryctodromeus|Oryctodromeus|Oryctodromeus|Oryctodromeus|herbivore|herbivore|late|2.1
simosuchus|Simosuchus|Simosuchus|Simosuchus|herbivore|herbivore|late|0.75
polyglyphanodon|Polyglyphanodon|Polyglyphanodon|Polyglyphanodon|herbivore|herbivore|late|1.3
alphadon|Alphadon|Alphadon|Alphadon|herbivore|omnivore|late|0.3
rahonavis|Rahonavis|Rahonavis|Rahonavis|flyer|carnivore|late|0.7
asteriornis|Asteriornis|Asteriornis|Asteriornis|flyer|omnivore|late|0.4
nyctosaurus|Nyctosaurus|Nyctosaurus|Nyctosaurus|flyer|piscivore|late|2
caiuajara|Caiuajara|Caiuajara|Caiuajara|flyer|herbivore|late|2.4
cretoxyrhina|Cretoxyrhina|Cretoxyrhina|Cretoxyrhina|water|carnivore|late|8
squalicorax|Squalicorax|Squalicorax|Squalicorax|water|carnivore|late|5
globidens|Globidens|Globidens|Globidens|water|carnivore|late|6
pannoniasaurus|Pannoniasaurus|Pannoniasaurus|Pannoniasaurus|water|carnivore|late|6
polycotylus|Polycotylus|Polycotylus|Polycotylus|water|piscivore|late|5
protostega|Protostega|Protostega|Protostega|water|omnivore|late|3
protosphyraena|Protosphyraena|Protosphyraena|Protosphyraena|water|carnivore|late|3
gillicus|Gillicus|Gillicus|Gillicus|water|piscivore|late|2
bonnerichthys|Bonnerichthys|Bonnerichthys|Bonnerichthys|water|filter|late|6
brachychampsa|Brachychampsa|Brachychampsa|Brachychampsa|water|carnivore|late|2.5
placenticeras|Placenticeras|Placenticeras|Placenticeras|water|carnivore|late|1
baculites|Baculites|Baculites|Baculites|water|carnivore|late|2
`;
// Pterosaurs are measured by wingspan, like in the mod.
const WING=new Set(['tapejara','hamipterus','anhanguera','ornithocheirus','nyctosaurus','caiuajara']);
export const PLANNED=ROWS.trim().split('\n').map(r=>{const [id,en,pt,es,group,diet,era,m]=r.split('|');
 return {id,name:{en,pt,es},group,diet,era:`${era}_cretaceous`,length:Number(m),planned:true,wing:WING.has(id)}});
