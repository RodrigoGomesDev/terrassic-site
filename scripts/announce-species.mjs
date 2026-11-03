// Announces on Discord each species that entered `models.ready` in src/site-config.js (a redesigned animal released).
// Run by .github/workflows/discord-species.yml on every push to main that touches site-config.js. It compares the
// list before the push (BEFORE, the push's previous commit) with the current one and posts, per new species, the
// release card (public/assets/cards/<id>.webp, from `npm run cards`) and the Field Guide facts.
//
// Sem DISCORD_SPECIES_WEBHOOK (fork, PR, rodando à mão): só mostra o que mandaria e sai sem erro.
// Rodar à mão: BEFORE=<commit> node scripts/announce-species.mjs
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=fileURLToPath(new URL('..',import.meta.url));
export const SITE=(process.env.SITE_URL||'https://terrassic.vercel.app').replace(/\/+$/,'');
const COLOR=0xF2B544;// AMBER_500, the brand accent
const MAX_PER_PUSH=5;// a push that releases more than this is a mistake or a migration: never flood the channel

// The Discord server is organised in English (the shared language) with Portuguese and Spanish sections, so the post
// is written the same way: English base, then a short block in Portuguese and in Spanish.
const EN={
 group:{predator:'Predator',herbivore:'Herbivore',flyer:'Flyer',water:'Aquatic'},
 diet:{carnivore:'Carnivore',herbivore:'Herbivore',omnivore:'Omnivore',piscivore:'Piscivore'},
 tame:{egg:'From the egg',food:'By feeding',knockout:'By knockout',baby:'Only as a baby',none:"Can't be tamed"},
 mount:{ride:'Rideable',platform:'Platform saddle',shoulder:'Shoulder pet',none:'Not rideable'},
};
const meters=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
const clip=(s,n)=>(s.length>n?`${s.slice(0,n-1).trimEnd()}…`:s);

// The ids inside `ready:[...]` of a site-config.js text (the code line, not the example in the comment above it).
// Empty when the list or the file does not exist yet.
export function readyFrom(text){const m=/^[ \t]*ready:\s*\[([^\]]*)\]/m.exec(text||'');return m?[...m[1].matchAll(/['"]([\w-]+)['"]/g)].map(x=>x[1]):[]}
export const released=(before,after)=>after.filter(id=>!before.includes(id));

const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']});
export function configAt(ref){if(!ref||/^0+$/.test(ref))return null;try{return git('show',`${ref}:src/site-config.js`)}catch{return null}}

// The Discord message for one species: a short ping line, one embed with the card as its big image.
export function message(s,{role=null,image}={}){
 const g=s.guide||{},first=t=>(t||'').split(/(?<=[.!?])\s/)[0];
 const tall=s.hitbox?.[1];
 const embed={
  color:COLOR,
  author:{name:'New species · Terrassic',icon_url:`${SITE}/assets/monograma_64.png`},
  title:s.name.en,url:`${SITE}/wiki/#${s.id}`,
  description:clip([g.sci?.en,g.behavior?.en].filter(Boolean).join('\n\n'),900),
  fields:[
   {name:'Type',value:[...new Set([EN.group[s.group],EN.diet[s.diet]])].join(' · '),inline:true},// "Herbivore" once
   {name:'Size',value:`${meters(s.length)} m long${tall?` · ${meters(tall)} m tall`:''}`,inline:true},
   {name:'Riding',value:EN.mount[s.mount]||'—',inline:true},
   {name:'How to tame',value:clip(g.taming?.en||EN.tame[s.tame]||'—',1000)},
   ...(g.utility?.en?[{name:"What it's good for",value:clip(g.utility.en,1000)}]:[]),
   {name:'Português',value:clip(`**${s.name.pt}**: ${first(g.sci?.pt)}${g.taming?.pt?`\n**Como domar:** ${first(g.taming.pt)}`:''}`,1000)},
   {name:'Español',value:clip(`**${s.name.es}**: ${first(g.sci?.es)}${g.taming?.es?`\n**Cómo domesticarlo:** ${first(g.taming.es)}`:''}`,1000)},
  ],
  image:{url:`attachment://${image}`},
  footer:{text:"Full entry in the in-game Field Guide and Rexpert's /dino · Ficha completa no Guia de Campo"},
  timestamp:new Date().toISOString(),
 };
 const names=[...new Set([s.name.pt,s.name.es].filter(n=>n!==s.name.en))];
 return {
  username:'Terrassic',avatar_url:`${SITE}/assets/monograma_256.png`,
  content:`${role?`<@&${role}> `:''}**${s.name.en}**${names.length?` (${names.join(' · ')})`:''} is here, redesigned · chegou refeito · llegó rehecho.`,
  embeds:[embed],
  allowed_mentions:{roles:role?[role]:[]},
 };
}

// The image to attach: the release card, or the site thumbnail if the card was not baked.
export function imageFor(id){
 const card=new URL(`../public/assets/cards/${id}.webp`,import.meta.url),thumb=new URL(`../public/assets/thumbs/${id}.webp`,import.meta.url);
 if(existsSync(card))return {path:card,name:`${id}.webp`,type:'image/webp',card:true};
 if(existsSync(thumb))return {path:thumb,name:`${id}.webp`,type:'image/webp',card:false};
 return null;
}

async function post(webhook,payload,file){
 const form=new FormData();
 form.append('payload_json',JSON.stringify(payload));
 if(file)form.append('files[0]',new Blob([readFileSync(file.path)],{type:file.type}),file.name);
 const res=await fetch(`${webhook}${webhook.includes('?')?'&':'?'}wait=true`,{method:'POST',body:form});
 if(!res.ok)throw new Error(`Discord ${res.status}: ${(await res.text()).slice(0,300)}`);
 return res.status;
}

export async function main({env=process.env,log=console.log}={}){
 const webhook=(env.DISCORD_SPECIES_WEBHOOK||'').trim(),role=(env.DISCORD_SPECIES_ROLE||'').trim()||null;
 const before=configAt(env.BEFORE||'HEAD~1');
 if(before===null){log('Sem a versão anterior de site-config.js (primeiro push?); nada a avisar.');return 0}
 const now=readFileSync(new URL('../src/site-config.js',import.meta.url),'utf8');
 const fresh=released(readyFrom(before),readyFrom(now));
 if(!fresh.length){log('Nenhuma espécie nova em models.ready; nada a avisar.');return 0}
 if(fresh.length>MAX_PER_PUSH){log(`${fresh.length} espécies de uma vez (${fresh.join(', ')}): mais que ${MAX_PER_PUSH}, não aviso para não inundar o canal.`);return 0}
 const {SPECIES}=await import(pathToFileURL(new URL('../src/generated/species.js',import.meta.url).pathname).href);
 let failed=0;
 for(const [i,id] of fresh.entries()){
  const s=SPECIES.find(x=>x.id===id);if(!s){log(`${id}: não está em species.js, pulando.`);continue}
  const file=imageFor(id);
  if(!file?.card)log(`${id}: sem cartão em public/assets/cards/ (rode npm run cards); ${file?'uso a miniatura':'sem imagem'}.`);
  const payload=message(s,{role:i===0?role:null,image:file?.name});// ping only once per push
  if(!file)delete payload.embeds[0].image;
  if(!webhook){log(`DISCORD_SPECIES_WEBHOOK não configurado: o aviso de ${id} seria:`);log(JSON.stringify(payload,null,2));continue}
  try{log(`${id}: Discord ${await post(webhook,payload,file)}`)}catch(e){failed++;console.error(`${id}: ${e.message}`)}
 }
 return failed?1:0;
}

if(import.meta.url===pathToFileURL(process.argv[1]||'').href)process.exit(await main());
