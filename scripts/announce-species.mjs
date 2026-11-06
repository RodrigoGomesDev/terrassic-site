// Announces on Discord a redesigned species when its APPROVED announcement image is added to the site:
// public/assets/announce/<id>.webp (or .png / .jpg). The art is made and approved by hand (another session, not the
// automatic card), so adding that file is the deliberate "publish" step. Marking a species in models.ready only
// updates the site and posts nothing (Rodrigo, 05/11/2026: "não pode ser automático assim").
// Run by .github/workflows/discord-species.yml on every push to main that touches public/assets/announce/. It posts
// only the species whose image was ADDED in the push (replacing an image later never posts again) and that are in
// models.ready. No approved image, no post: there is no fallback to the generated card.
//
// Sem DISCORD_SPECIES_WEBHOOK (fork, PR, rodando à mão): só mostra o que mandaria e sai sem erro.
// Rodar à mão: BEFORE=<commit> node scripts/announce-species.mjs
// Disparo manual (Actions > Run workflow, ou IDS=a,b,c): usa essa lista em vez do diff, mas ainda exige a imagem
// aprovada de cada uma e o limite de MAX_PER_PUSH. NO_PING=1 não marca o cargo (segundo lote de uma mesma leva).
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';

const ROOT=fileURLToPath(new URL('..',import.meta.url));
export const SITE=(process.env.SITE_URL||'https://terrassic.vercel.app').replace(/\/+$/,'');
const COLOR=0xF2B544;// AMBER_500, the brand accent
const MAX_PER_PUSH=5;// a push that releases more than this is a mistake or a migration: never flood the channel

// The Discord server is organised in English, and #new-species is an English channel: the post is in English only
// (Rodrigo, 05/11/2026: "todos os conteúdos em inglês"). Portuguese and Spanish live in the language categories.
const EN={
 group:{predator:'Predator',herbivore:'Herbivore',flyer:'Flyer',water:'Aquatic'},
 diet:{carnivore:'Carnivore',herbivore:'Herbivore',omnivore:'Omnivore',piscivore:'Piscivore'},
 tame:{egg:'From the egg',food:'By feeding',knockout:'By knockout',baby:'Only as a baby',none:"Can't be tamed"},
 mount:{ride:'Rideable',platform:'Platform saddle',shoulder:'Shoulder pet',none:'Not rideable'},
};
const meters=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
// The mod draws the player as a 1.70 m person in a 1.8-block body (gen_species.METRE, 1.8.1): hitboxes are in blocks.
const BLOCKS_PER_METRE=1.8/1.7;
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
 const tall=s.hitbox?.[1]&&s.hitbox[1]/BLOCKS_PER_METRE;// metres
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
  ],
  image:{url:`attachment://${image}`},
  footer:{text:"Full entry in the in-game Bestiaries and Rexpert's /dino"},
  timestamp:new Date().toISOString(),
 };
 return {
  username:'Terrassic',avatar_url:`${SITE}/assets/monograma_256.png`,
  content:`${role?`<@&${role}> `:''}**${s.name.en}** is here, redesigned.`,
  embeds:[embed],
  allowed_mentions:{roles:role?[role]:[]},
 };
}

// The approved announcement image of a species, or null. Never the generated card or the thumbnail.
const TYPES={webp:'image/webp',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg'};
export const ANNOUNCE_DIR='public/assets/announce/';
const MAX_BYTES=8*1024*1024;// Discord's upload limit for webhooks
export function imageFor(id,root=new URL('../',import.meta.url)){
 for(const ext of Object.keys(TYPES)){
  const path=new URL(`${ANNOUNCE_DIR}${id}.${ext}`,root);
  if(existsSync(path))return {path,name:`${id}.${ext}`,type:TYPES[ext],size:statSync(path).size};
 }
 return null;
}

// The species whose announcement image was ADDED between two commits (a replaced image is a modification: no repost).
export const addedIds=(paths)=>[...new Set(paths.filter(p=>p.startsWith(ANNOUNCE_DIR)).map(p=>p.slice(ANNOUNCE_DIR.length))
 .map(f=>/^([\w-]+)\.(webp|png|jpe?g)$/i.exec(f)?.[1]).filter(Boolean))];
export function addedSince(ref){
 if(!ref||/^0+$/.test(ref))return null;
 try{return addedIds(git('diff','--name-only','--diff-filter=A',ref,'HEAD','--',ANNOUNCE_DIR).split('\n').filter(Boolean))}catch{return null}
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
 const webhook=(env.DISCORD_SPECIES_WEBHOOK||'').trim();
 const role=env.NO_PING==='true'||env.NO_PING==='1'?null:(env.DISCORD_SPECIES_ROLE||'').trim()||null;
 const ids=(env.IDS||'').trim();
 const ready=readyFrom(readFileSync(new URL('../src/site-config.js',import.meta.url),'utf8'));
 let fresh;
 if(ids){
  fresh=ids.split(',').map(s=>s.trim()).filter(Boolean);
 }else{
  const added=addedSince(env.BEFORE||'HEAD~1');
  if(added===null){log('Sem o commit anterior (primeiro push?); nada a avisar.');return 0}
  const notReady=added.filter(id=>!ready.includes(id));
  if(notReady.length)log(`Imagem nova, mas ainda fora de models.ready (não aviso): ${notReady.join(', ')}.`);
  fresh=added.filter(id=>ready.includes(id));
 }
 if(!fresh.length){log(`Nenhuma imagem aprovada nova em ${ANNOUNCE_DIR}; nada a avisar.`);return 0}
 if(fresh.length>MAX_PER_PUSH){log(`${fresh.length} espécies de uma vez (${fresh.join(', ')}): mais que ${MAX_PER_PUSH}, não aviso para não inundar o canal.`);return 0}
 const {SPECIES}=await import(pathToFileURL(new URL('../src/generated/species.js',import.meta.url).pathname).href);
 let failed=0,sent=0;
 for(const id of fresh){
  const s=SPECIES.find(x=>x.id===id);if(!s){log(`${id}: não está em species.js, pulando.`);continue}
  const file=imageFor(id);
  if(!file){log(`${id}: sem a imagem aprovada em ${ANNOUNCE_DIR} (${id}.webp, .png ou .jpg); não aviso.`);continue}
  if(file.size>MAX_BYTES){log(`${id}: ${file.name} tem ${(file.size/1048576).toFixed(1)} MB, acima do limite de 8 MB do Discord; não aviso.`);continue}
  const payload=message(s,{role:sent===0?role:null,image:file.name});// ping only once per push
  if(!webhook){log(`DISCORD_SPECIES_WEBHOOK não configurado: o aviso de ${id} seria:`);log(JSON.stringify(payload,null,2));sent++;continue}
  try{log(`${id}: Discord ${await post(webhook,payload,file)}`);sent++}catch(e){failed++;console.error(`${id}: ${e.message}`)}
 }
 return failed?1:0;
}

if(import.meta.url===pathToFileURL(process.argv[1]||'').href)process.exit(await main());
