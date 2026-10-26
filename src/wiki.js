// The wiki page (/wiki/): installation, how it plays, every creature's Field Guide, eras, roadmap and FAQ, in the
// mod's three languages. Same data as the home page, no 3D, and a stable address for each part (#instalacao,
// #tyrannosaurus...) to link from CurseForge and Modrinth.
import {detectLang,setLang,t,pick,getLang} from './i18n.js';
import {links,report} from './site-config.js';
import {SPECIES,LORE} from './generated/species.js';
import {ERAS,VERSIONS,GUIDE_LEVELS,TOOLS,WEAPONS,FAQ} from './content.js';
import {W,DEPS} from './wiki-content.js';
import {sprite} from './sprites.js';
import {assetUrl} from './assets.js';
import {initAnchors} from './anchors.js';
const $=id=>document.getElementById(id);
const w=(key,vars={})=>{let s=pick(W[key]);for(const [k,v] of Object.entries(vars))s=s.replaceAll(`{${k}}`,v);return s};
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const h=(tag,cls,...kids)=>{const e=el(tag,cls);e.append(...kids.filter(k=>k!=null&&k!==false));return e};
const ext=(href,text,cls)=>{const a=el('a',cls,text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a};
const fmt=n=>new Intl.NumberFormat(getLang()==='pt'?'pt-BR':getLang(),{maximumFractionDigits:2}).format(n);
const norm=x=>x.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),ALIAS={tyrannosaurus:'t. rex trex',velociraptor:'raptor',triceratops:'trike'};
const GROUPS=['all','predator','herbivore','flyer','water'],GUIDE_KEYS=['sci','behavior','taming','utility'];
const lengthLabel=s=>s.group==='flyer'&&['pteranodon','quetzalcoatlus','hatzegopteryx','ichthyornis'].includes(s.id)?'fact.wing':'fact.length';
const verLabel=v=>v==='v0.2'?t('ver.base'):t('ver.next',{v});

// The table of contents; the sub-entries of a section are indented.
const SECTIONS=()=>[['comecar',w('start.t')],['instalacao',w('inst.t')],['fabric',w('fabric.t'),1],['forge',w('forge.t'),1],['multiplayer',w('mp.t'),1],['atualizar',w('up.t'),1],
 ['como-se-joga',w('play.t')],['criaturas',w('crea.t')],['eras',w('eras.t')],['roteiro',w('road.t')],['faq',w('faq.t')],...(reporting()?[['reportar',w('bug.t')]]:[])];

let group='all',query='';const open=new Set();
const sub=(id,title,...kids)=>Object.assign(h('div','wiki-sub',h('h3','wiki-h3',title),...kids),{id});
const list=(items,ordered)=>h(ordered?'ol':'ul','wiki-list',...items.map(i=>el('li','',typeof i==='string'?i:pick(i))));
const note=(text,kind='warn')=>h('p',`wiki-note is-${kind}`,text);

function start(){
 const cards=h('div','wiki-cards',...W['start.cards'].map(c=>{const a=h('a','wiki-card',el('strong','',pick(c.t)),el('span','',pick(c.p).replace('{n}',SPECIES.length)));a.href=`#${c.id}`;return a}));
 return Object.assign(h('section','wiki-section wiki-intro',el('p','eyebrow','Minecraft Java 1.20.1 · Fabric · Forge'),el('h1','display',w('title')),el('p','lede',w('lede')),
  note(w('alpha')),el('p','small',w('updated',{v:links.version})),cards),{id:'comecar'});
}

function install(){
 const v=links.version,deps=h('table','wiki-table',h('thead','',h('tr','',el('th','',w('deps.mod')),el('th','',w('deps.v')),el('th','',w('deps.for')))),
  h('tbody','',...DEPS.map(d=>h('tr','',h('td','',ext(d.url,d.name)),h('td','',el('code','',d.v)),el('td','',d.loaders.map(l=>l[0].toUpperCase()+l.slice(1)).join(' · '))))));
 const dl=h('p','wiki-actions',ext(links.download,t('inst.curseforge'),'btn btn-primary'),links.modrinth&&ext(links.modrinth,'Modrinth','btn btn-ghost'));
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('inst.t')),dl,
  sub('requisitos',w('req.t'),list(W.req)),
  sub('dependencias',w('deps.t'),h('div','wiki-scroll',deps),el('p','small',w('deps.note'))),
  sub('fabric',w('fabric.t'),list(W.fabric.map(s=>pick(s).replace('{v}',v)),true)),
  sub('forge',w('forge.t'),list(W.forge.map(s=>pick(s).replace('{v}',v)),true),note(w('forge.warn'))),
  sub('multiplayer',w('mp.t'),list(W.mp)),
  sub('atualizar',w('up.t'),list(W.up,true),note(w('up.warn')))),{id:'instalacao'});
}

function play(){
 const card=(key,...extra)=>h('div','wiki-mech',el('h3','wiki-h3',t(`mech.${key}.t`)),el('p','',t(`mech.${key}.p`)),...extra);
 const levels=h('ol','wiki-levels',...GUIDE_LEVELS.map(l=>h('li','',el('strong','',pick(l.name)),el('span','',pick(l.how)))));
 const tools=h('ul','wiki-items',...TOOLS.map(x=>h('li','',sprite(x.sprite,32),el('span','',pick(x.name)))));
 const arms=h('div','wiki-scroll',h('table','wiki-table',h('thead','',h('tr','',el('th','',w('arms.weapon')),el('th','',w('arms.dmg')))),
  h('tbody','',...WEAPONS.map(x=>h('tr','',h('td','',h('span','wiki-item',sprite(x.sprite,24),el('span','',pick(x.name)))),el('td','',x.thrown?`${x.dmg} · ${x.thrown} ${t('mech.thrown')}`:x.dmg))))));
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('play.t')),el('p','lede',t('mech.lede')),
  h('div','wiki-mechs',card('egg'),card('sex'),card('tame'),card('ride')),
  card('sci',h('div','wiki-sub',el('h4','wiki-h4',w('guide.t')),levels),h('div','wiki-sub',el('h4','wiki-h4',w('tools.t')),tools)),
  card('arms',arms),card('journal')),{id:'como-se-joga'});
}

function creature(s){
 const d=el('details','sp');d.id=s.id;d.open=open.has(s.id);d.dataset.group=s.group;
 d.addEventListener('toggle',()=>{d.open?open.add(s.id):open.delete(s.id)});
 const img=el('img','sp-art');img.alt='';img.loading='lazy';img.decoding='async';img.src=assetUrl(`thumbs/${s.id}.webp`);img.onerror=()=>img.remove();
 const names=[...new Set(Object.values(s.name))].filter(n=>n!==pick(s.name)).join(' · ');
 const facts=[[lengthLabel(s),`${fmt(s.length)} m`],['fact.diet',pick(LORE.diets[s.diet])],['fact.era',pick(LORE.eras[s.era])],['fact.mount',t(`mount.${s.mount}`)],['fact.tame',t(`tame.${s.tame}`)],['fact.version',verLabel(s.version)]];
 const copy=el('button','chip',w('crea.link'));copy.type='button';
 copy.addEventListener('click',()=>{const url=`${location.origin}${location.pathname}#${s.id}`;navigator.clipboard?.writeText(url).then(()=>{copy.textContent=w('crea.copied');setTimeout(()=>{copy.textContent=w('crea.link')},1600)},()=>{})});
 d.append(h('summary','',img,h('span','sp-head',h('span','sp-name',sprite(`egg:${s.id}`,24),el('strong','',pick(s.name))),names&&el('span','sp-alt',names),
   el('span','sp-sub',`${fmt(s.length)} m · ${t(`one.${s.group}`)} · ${pick(LORE.eras[s.era])}`)),el('span',`status ${s.version==='v0.2'?'status-done':'status-plan'}`,s.version==='v0.2'?w('crea.in'):s.version),el('i','sp-plus','+')),
  h('div','sp-body',h('dl','facts',...facts.map(([k,v])=>h('div','',el('dt','',t(k)),el('dd','',v)))),
   ...GUIDE_KEYS.filter(k=>pick(s.guide[k])).map(k=>h('div','sp-guide',el('h4','wiki-h4',t(`guide.${k}`)),el('p','',pick(s.guide[k])))),
   pick(s.guide.note)&&h('blockquote','note',el('p','',pick(s.guide.note)),el('cite','',t('best.noteBy'))),h('p','sp-actions',copy)));
 return d;
}
function creatures(){
 const grid=h('div','sp-list',...[...SPECIES].sort((a,b)=>pick(a.name).localeCompare(pick(b.name))).map(creature)),none=el('p','small sp-none',w('crea.none'));
 const filter=()=>{let n=0;for(const d of grid.children){const s=SPECIES.find(x=>x.id===d.id),show=(group==='all'||s.group===group)&&(!query||[...Object.values(s.name),s.id,ALIAS[s.id]||''].some(x=>norm(x).includes(query)));d.hidden=!show;n+=show}none.hidden=n>0;
  for(const b of chips.children)b.setAttribute('aria-pressed',String(b.dataset.group===group))};
 const chips=h('div','filters',...GROUPS.map(g=>{const b=el('button','chip',t(`group.${g}`));b.type='button';b.dataset.group=g;b.addEventListener('click',()=>{group=g;filter()});return b}));
 const search=el('input');search.type='search';search.autocomplete='off';search.placeholder=w('crea.search');search.value=query;search.setAttribute('aria-label',w('crea.search'));
 search.addEventListener('input',()=>{query=norm(search.value.trim());filter()});
 const node=Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('crea.t')),el('p','lede',w('crea.lede',{n:SPECIES.length})),h('div','sp-tools',chips,h('label','search',search)),grid,none),{id:'criaturas'});
 filter();return node;
}

function eras(){
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('eras.t')),el('p','lede',w('eras.lede')),...ERAS.map(e=>Object.assign(h('article','wiki-era',
  el('p','eyebrow',`${pick(e.n)} · ${pick(e.era)}${e.ma?` · ${e.ma[0]}–${e.ma[1]} Ma`:''}`),el('h3','wiki-h3',pick(e.name)),el('p','',pick(e.land)),
  h('dl','facts',...[['eras.where',e.where],['eras.event',e.event],['eras.boss',e.boss],['eras.plants',e.plants]].map(([k,v])=>h('div','',el('dt','',w(k)),el('dd','',pick(v))))),
  h('p','wiki-fauna',el('strong','',`${w('eras.fauna')}: `),e.fauna.map(f=>typeof f==='string'?f:pick(f)).join(' · ')),
  el('span',`status status-${e.status}`,`${e.version} · ${t(`road.${e.status}`)}`)),{id:`era-${e.id}`}))),{id:'eras'});
}

function roadmap(){
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('road.t')),el('p','lede',w('road.lede')),
  h('ol','wiki-road',...VERSIONS.map(v=>h('li','',h('div','wiki-road-head',el('strong','',v.v),el('span','',pick(v.name)),el('span',`status status-${v.status}`,t(`road.${v.status}`))),
   v.detail&&el('p','',pick(v.detail)),v.add?el('p','small',t('road.new',{n:v.add})):null)))),{id:'roteiro'});
}

function faq(){
 const item=f=>h('details','',h('summary','',el('span','',pick(f.q)),el('i','','+')),el('p','',pick(f.a)));
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('faq.t')),h('div','faq-list',...[...FAQ,...W.faq].map(item))),{id:'faq'});
}

// Bug reports without GitHub: a form that mails each report to the author through Web3Forms (free, no server), and
// the Discord when there is one. Without a key the form only shows in development, so the live site never shows a
// form that cannot send. What the visitor typed survives a change of language.
const formKey=report.web3formsKey,showForm=!!formKey||import.meta.env.DEV;
const reporting=()=>showForm||!!links.discord;
const draft={version:links.version,loader:'fabric',where:'sp'};let sent=false;
function bugForm(){
 const form=el('form','wiki-form');
 const field=(name,label,control,{optional,hint}={})=>{control.name=name;control.id=`bug-${name}`;if(draft[name]!==undefined&&control.type!=='radio')control.value=draft[name];
  const lab=el('label','',label);lab.htmlFor=control.id;if(optional)lab.append(el('span','wiki-optional',` · ${w('bug.optional')}`));
  return h('div','wiki-field',lab,control,hint&&el('p','wiki-hint',hint))};
 const input=(type,attrs={})=>Object.assign(el('input'),{type,...attrs});
 const area=(attrs={})=>Object.assign(el('textarea'),{rows:4,...attrs});
 const select=(opts)=>{const s=el('select');for(const [v,l] of opts){const o=el('option','',l);o.value=v;s.append(o)}return s};
 const loader=h('fieldset','wiki-field wiki-radios',el('legend','',w('bug.loader')),...['fabric','forge'].map(v=>{const r=input('radio',{name:'loader',value:v,checked:draft.loader===v});return h('label','',r,el('span','',v[0].toUpperCase()+v.slice(1)))}));
 const log=input('url',{placeholder:'https://mclo.gs/…'}),hint=el('p','wiki-hint');hint.append(...w('bug.log.hint').split('mclo.gs').flatMap((part,i)=>i?[ext('https://mclo.gs','mclo.gs'),part]:[part]));
 const status=el('p','wiki-form-status');status.setAttribute('aria-live','polite');
 const send=el('button','btn btn-primary',w('bug.send'));send.type='submit';
 // A trap for bots: people never see or tick it.
 const trap=input('checkbox',{name:'botcheck',tabIndex:-1});trap.className='wiki-trap';trap.setAttribute('aria-hidden','true');
 form.append(
  h('div','wiki-form-row',field('version',w('bug.version'),input('text',{required:true,autocomplete:'off'})),loader,
   field('where',w('bug.where'),select([['sp',w('bug.where.sp')],['mp',w('bug.where.mp')],['both',w('bug.where.both')]]))),
  field('what',w('bug.what'),area({required:true,placeholder:w('bug.what.hint'),rows:5})),
  field('steps',w('bug.steps'),area({placeholder:w('bug.steps.hint')}),{optional:true}),
  h('div','wiki-field',Object.assign(el('label','',w('bug.log')),{htmlFor:'bug-log'}),Object.assign(log,{name:'log',id:'bug-log',value:draft.log||''}),hint),
  field('mods',w('bug.mods'),input('text'),{optional:true}),
  field('contact',w('bug.contact'),input('text',{placeholder:w('bug.contact.hint'),autocomplete:'email'}),{optional:true}),
  trap,h('div','wiki-actions',send,status));
 form.querySelector('[name=log]').previousSibling.append(el('span','wiki-optional',` · ${w('bug.optional')}`));
 form.addEventListener('input',e=>{const f=e.target;if(f.name&&f.name!=='botcheck')draft[f.name]=f.value});
 const done=()=>{const again=el('button','btn btn-ghost',w('bug.again'));again.type='button';
  again.addEventListener('click',()=>{sent=false;form.replaceWith(bugForm())});form.replaceChildren(el('p','wiki-note is-ok',w('bug.sent')),h('div','wiki-actions',again))};
 if(sent){done();return form}
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(!formKey){status.textContent=w('bug.nokey');return}
  const d=Object.fromEntries(new FormData(form)),where={sp:'Singleplayer',mp:'Multiplayer',both:'Singleplayer e multiplayer'}[d.where];
  const body={access_key:formKey,subject:`Terrassic · bug ${d.version} ${d.loader}: ${d.what.trim().slice(0,60)}`,from_name:'Wiki do Terrassic',botcheck:d.botcheck||'',
   'Versão do Terrassic':d.version,'Loader':d.loader,'Onde':where,'O que aconteceu':d.what,'Passos':d.steps||'-','Log':d.log||'-','Outros mods':d.mods||'-','Contato':d.contact||'-','Idioma':getLang(),'Navegador':navigator.userAgent};
  if(/^\S+@\S+\.\S+$/.test(d.contact||''))body.email=d.contact.trim();
  send.disabled=true;send.textContent=w('bug.sending');status.textContent='';
  // Sent as plain form data, like Web3Forms' own snippet: a JSON body makes the browser ask first (CORS preflight),
  // and their Cloudflare turns that question away.
  const data=new FormData();for(const [k,v] of Object.entries(body))data.append(k,v);
  try{const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{Accept:'application/json'},body:data}).then(r=>r.json());
   if(!r.success)throw new Error(r.message);sent=true;for(const k of ['what','steps','log','mods'])delete draft[k];done()}
  catch(err){console.warn(err);status.textContent=w('bug.error');send.disabled=false;send.textContent=w('bug.send')}
 });
 return form;
}
function reportSection(){
 if(!reporting())return null;
 const discord=links.discord&&h('div','wiki-mech wiki-discord',el('h3','wiki-h3',w('bug.discord.t')),el('p','',w('bug.discord.p')),h('p','wiki-actions',ext(links.discord,w('bug.discord.cta'),'btn btn-ghost')));
 return Object.assign(h('section','wiki-section',h('h2','wiki-h2',w('bug.t')),showForm&&el('p','lede',w('bug.lede')),showForm&&bugForm(),discord),{id:'reportar'});
}

function toc(){
 $('toc').setAttribute('aria-label',w('toc'));
 $('toc').replaceChildren(el('p','eyebrow',w('toc')),h('ol','',...SECTIONS().map(([id,label,depth])=>{const a=el('a','',label);a.href=`#${id}`;return h('li',depth?'is-sub':'',a)})));
}
// The entry of the section being read lights up in the table of contents.
let spy;const watch=()=>{spy?.disconnect();const ids=new Set(SECTIONS().map(s=>s[0]));const links=[...$('toc').querySelectorAll('a')];
 // On a phone the contents are a strip that scrolls sideways; it follows the entry that lit up.
 spy=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)for(const a of links){const on=a.hash===`#${e.target.id}`;a.classList.toggle('is-active',on);
  const toc=$('toc');if(on&&toc.scrollWidth>toc.clientWidth)toc.scrollTo({left:a.offsetLeft-24,behavior:'smooth'})}},{rootMargin:'-20% 0px -70% 0px'});
 for(const id of ids){const n=$(id);if(n)spy.observe(n)}};

function footer(){
 const out=[[links.download,'CurseForge ↗'],[links.modrinth,'Modrinth ↗'],[links.discord,'Discord ↗'],[links.donate,'Ko-fi ↗']].filter(([u])=>u).map(([u,l])=>ext(u,l));
 $('footer-links').replaceChildren(...out);
}

function render(){
 setLang(getLang());document.title=w('title');$('to-site').textContent=w('site');if(links.download)$('cta').href=links.download;
 $('conteudo').replaceChildren(...[start(),install(),play(),creatures(),eras(),roadmap(),faq(),reportSection()].filter(Boolean));toc();footer();watch();
}

setLang(detectLang());
// Open a creature's entry before going to it, from a link, the address or the back button.
const reveal=target=>{const d=target?.closest?.('details.sp');if(d){d.hidden=false;d.open=true;open.add(d.id)}};
initAnchors({prepare:reveal});
render();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);render()});
const fromAddress=()=>{const id=decodeURIComponent(location.hash.slice(1)),target=id&&$(id);if(!target)return;reveal(target);target.scrollIntoView({block:'start'})};
// Again once the fonts and pictures are in, since they change the height of everything above the target.
fromAddress();document.fonts?.ready.then(fromAddress);addEventListener('load',fromAddress,{once:true});addEventListener('popstate',fromAddress);
