import {SPECIES,LORE} from './generated/species.js';
import {t,pick,getLang} from './i18n.js';
import {sprite,paintSprite} from './sprites.js';
import {assetUrl} from './rig.js';
import {picture} from './pictures.js';
import {isReady,story} from './site-config.js';
import {PLANNED} from './planned.js';
const $=id=>document.getElementById(id);
const GROUPS=['all','predator','herbivore','flyer','water'];
const GUIDE_KEYS=['sci','behavior','taming','utility'];
// The animals in the game, then the Cretaceous ones still on the plan (no model yet, only name and size).
const ALL=[...SPECIES,...PLANNED];
// The ruler ends at the next 10 m above the longest animal, and its labels are drawn from that same number.
const MAX_LENGTH=Math.ceil(Math.max(...ALL.map(s=>s.length))/10)*10;
const dietLabel=d=>LORE.diets[d]?pick(LORE.diets[d]):t(`diet.${d}`);
const fmt=n=>new Intl.NumberFormat(getLang()==='en'?'en':getLang()==='es'?'es':'pt-BR',{maximumFractionDigits:2}).format(n);
// The mod lists pterosaurs by wingspan.
const lengthLabel=s=>s.wing||s.group==='flyer'&&['pteranodon','quetzalcoatlus','hatzegopteryx','ichthyornis'].includes(s.id)?'fact.wing':'fact.length';

export function initBestiary({viewerReady,thumbnailer}){
 let selected=SPECIES.find(s=>s.id==='tyrannosaurus'),sex='male',group='all',query='',sort='size',guideKey='sci',viewer=null,anim='idle';
 const roster=$('roster'),cards=new Map();
 $('dossier-ruler').querySelector('.ruler-scale').replaceChildren(...Array.from({length:MAX_LENGTH/10+1},(_,i)=>Object.assign(document.createElement('span'),{textContent:i?`${i*10} m`:'0'})));
 // Cards: thumbnails are rendered from the real models the first time a card comes near the screen.
 for(const s of PLANNED){
  const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='card is-planned';b.dataset.id=s.id;
  b.innerHTML=`<span class="card-meta"><span class="card-name"></span><span class="card-sub"></span><span class="soon-tag"></span></span>`;
  b.addEventListener('click',()=>{select(s);document.getElementById('stage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})});
  li.append(b);cards.set(s.id,{li,button:b});
 }
 // The list is split in three parts with their own heading: new model, in the game but being remade, not in the game
 // yet. The two long parts show their first row or two and open the rest on request, so the page does not turn into
 // 120 cards to scroll past; a search or a filter always shows every match.
 const PART_KEYS=['best.partReady','best.partRemake','best.plannedHead'],PREVIEW=12,open=new Set();
 const heads=PART_KEYS.map(()=>Object.assign(document.createElement('li'),{className:'roster-head'}));
 const mores=PART_KEYS.map((_,i)=>{const li=document.createElement('li');li.className='roster-more';const b=document.createElement('button');b.type='button';b.className='chip';
  b.addEventListener('click',()=>{open.add(i);renderRoster();roster.querySelectorAll('.card')[0]&&cards.get(b.dataset.next)?.button.focus()});li.append(b);return li});
 for(const s of SPECIES){
  const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='card';b.dataset.id=s.id;
  b.innerHTML=`<span class="card-art"><img alt="" decoding="async"></span><span class="card-meta"><span class="card-name"></span><span class="card-sub"></span></span>`;
  // Not ready under the new model standard: the card shows only the silhouette and a "Coming soon" tag.
  if(!isReady(s.id)){b.classList.add('is-soon');b.querySelector('.card-art').append(Object.assign(document.createElement('span'),{className:'soon-tag'}))}
  b.querySelector('.card-art').prepend(sprite(`egg:${s.id}`,24));
  b.addEventListener('click',()=>{select(s);document.getElementById('stage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})});
  li.append(b);cards.set(s.id,{li,button:b,img:b.querySelector('img')});
 }
 const thumbs=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;thumbs.unobserve(e.target);const s=SPECIES.find(x=>x.id===e.target.dataset.id),card=cards.get(s.id);picture(s.id,()=>thumbnailer().then(t=>t.request(s))).then(url=>{card.img.src=url;card.button.classList.add('has-art')}).catch(()=>card.button.classList.add('no-art'))}},{rootMargin:'300px'});
 for(const s of SPECIES)thumbs.observe(cards.get(s.id).button);

 const filters=$('filters');
 for(const g of GROUPS){const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.group=g;b.addEventListener('click',()=>{group=g;renderRoster()});filters.append(b)}
 // Search ignores case and accents, and also finds the short names people use ("rex" for the Tyrannosaurus).
 const norm=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),ALIAS={tyrannosaurus:'t. rex trex',velociraptor:'raptor',triceratops:'trike'};
 $('search').addEventListener('input',e=>{query=norm(e.target.value.trim());renderRoster()});
 $('sort').addEventListener('change',e=>{sort=e.target.value;renderRoster()});

 function visible(){
  const list=ALL.filter(s=>(group==='all'||s.group===group)&&(!query||[...Object.values(s.name),s.id,ALIAS[s.id]||''].some(n=>norm(n).includes(query))));
  const name=s=>pick(s.name);
  const done=s=>s.planned?2:isReady(s.id)?0:1;
  // Finished animals first, then the ones in the game being remade, then the ones still on the plan.
  return list.sort((a,b)=>done(a)-done(b)||(sort==='name'?name(a).localeCompare(name(b)):b.length-a.length));
 }
 function renderRoster(){
  for(const b of filters.children){b.textContent=t(`group.${b.dataset.group}`);b.setAttribute('aria-pressed',String(b.dataset.group===group))}
  const list=visible(),items=[],part=s=>s.planned?2:isReady(s.id)?0:1,narrowed=query||group!=='all';
  for(let i=0;i<3;i++){const inPart=list.filter(s=>part(s)===i);if(!inPart.length)continue;
   heads[i].textContent=t(PART_KEYS[i],{n:inPart.length});items.push(heads[i]);
   const shown=narrowed||open.has(i)||inPart.length<=PREVIEW+2?inPart:inPart.slice(0,PREVIEW);
   items.push(...shown.map(s=>cards.get(s.id).li));
   if(shown.length<inPart.length){const btn=mores[i].firstChild;btn.textContent=t('best.showAll',{n:inPart.length});btn.dataset.next=inPart[PREVIEW].id;items.push(mores[i])}}
  roster.replaceChildren(...items);
  list.forEach(s=>{const c=cards.get(s.id);
   c.button.querySelector('.card-name').textContent=pick(s.name);c.button.querySelector('.soon-tag')?.replaceChildren(t('soon'));c.button.querySelector('.card-sub').textContent=s.planned?`${fmt(s.length)} m\n${pick(LORE.eras[s.era])}`:`${fmt(s.length)} m · ${t(`one.${s.group}`)}`;
   c.button.setAttribute('aria-label',s.planned?`${pick(s.name)}, ${t('soon')}`:t('best.view',{name:pick(s.name)}));c.button.setAttribute('aria-pressed',String(s===selected))});
  $('roster-count').textContent=list.length?t('best.count',{n:list.length,total:ALL.length}):t('best.none');
 }

 function renderDossier(){
  const s=selected;$('dossier-name').textContent=pick(s.name);$('dossier-latin').textContent=s.name.en;$('dossier-group').textContent=t(`one.${s.group}`);
  paintSprite($('dossier-egg'),`egg:${s.id}`,40);
  const facts=[[lengthLabel(s),`${fmt(s.length)} m`],['fact.diet',dietLabel(s.diet)],['fact.era',pick(LORE.eras[s.era])],...s.planned?[['fact.version',t('best.notYet')]]:[['fact.mount',t(`mount.${s.mount}`)],['fact.tame',t(`tame.${s.tame}`)]]];
  $('dossier-facts').replaceChildren(...facts.map(([k,v])=>{const d=document.createElement('div');d.innerHTML='<dt></dt><dd></dd>';d.firstChild.textContent=t(k);d.lastChild.textContent=v;return d}));
  $('ruler-fill').style.width=`${s.length/MAX_LENGTH*100}%`;
  // Animals still on the plan have no guide yet: only the facts above and the "coming soon" line.
  $('guide-tabs').hidden=$('guide-text').hidden=!!s.planned;$('stage').classList.toggle('is-planned',!!s.planned);
  $('stage-planned').hidden=!s.planned;$('stage-planned').textContent=t('best.plannedStage',{name:pick(s.name)});
  if(s.planned){$('dossier-egg').hidden=true;$('dossier-note').hidden=true;$('dossier-soon').hidden=false;$('dossier-soon-tag').textContent=t('soon');$('dossier-soon-text').textContent=t('best.planned');$('stage').classList.remove('is-soon');$('sound-toggle').hidden=true;$('anim-chips').replaceChildren();return}
  const tabs=$('guide-tabs');tabs.replaceChildren(...GUIDE_KEYS.map(k=>{const b=document.createElement('button');b.type='button';b.role='tab';b.textContent=t(`guide.${k}`);b.setAttribute('aria-selected',String(k===guideKey));b.tabIndex=k===guideKey?0:-1;b.addEventListener('click',()=>{guideKey=k;renderDossier()});return b}));
  const text=$('guide-text');text.textContent=pick(s.guide[guideKey]);text.classList.remove('swap');void text.offsetWidth;text.classList.add('swap');
  $('note-text').textContent=pick(s.guide.note);$('dossier-note').hidden=!story||!pick(s.guide.note);
  const soon=!isReady(s.id);$('dossier-soon').hidden=!soon;$('dossier-soon-tag').textContent=t('soon');$('dossier-soon-text').textContent=t('best.soon');
  $('stage').classList.toggle('is-soon',soon);
  $('stage-canvas').setAttribute('aria-label',t('best.canvas',{name:pick(s.name)}));
  $('sound-toggle').hidden=s.id!=='tyrannosaurus'||!viewer;
  renderAnims();
 }
 function renderAnims(){
  const host=$('anim-chips');host.replaceChildren(...selected.anims.map(a=>{const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.anim=a;b.textContent=t(`anim.${a}`)!==`anim.${a}`?t(`anim.${a}`):a;b.setAttribute('aria-pressed',String(a===anim));b.addEventListener('click',()=>playAnim(a));return b}));
 }
 const roar=new Audio(assetUrl('audio/tyrannosaurus-roar-pixabay.mp3'));roar.preload='none';roar.volume=.5;let sound=false;
 $('sound-toggle').addEventListener('click',()=>{sound=!sound;$('sound-toggle').setAttribute('aria-pressed',String(sound));if(!sound)roar.pause()});
 function playAnim(a){
  const clip=viewer?.current?.animator.clips[a];if(!clip)return;
  if(clip.loop)anim=a;viewer.play(a);
  if(a==='roar'&&sound&&selected.id==='tyrannosaurus'){roar.currentTime=0;roar.play().catch(()=>{})}
  for(const b of $('anim-chips').children){b.setAttribute('aria-pressed',String(b.dataset.anim===anim));b.classList.toggle('is-playing',!clip.loop&&b.dataset.anim===a)}
 }
 function select(s){
  if(s!==selected){selected=s;anim=s.anims?.includes(anim)?anim:'idle'}
  for(const {button} of cards.values())button.setAttribute('aria-pressed',String(button.dataset.id===s.id));
  renderDossier();
  // Without 3D the stage shows the animal's baked picture instead of staying empty.
  if(s.planned){$('stage-status').textContent='';return}
  if($('stage').classList.contains('is-static'))picture(s.id).then(url=>{$('stage-canvas').style.backgroundImage=`url(${url})`}).catch(()=>{});
  if(viewer){$('stage-status').textContent=t('best.loading');viewer.show(s,sex).then(()=>{$('stage-status').textContent='';if(viewer.current&&anim!=='idle')viewer.play(anim)})}
 }
 for(const v of ['male','female'])$(`sex-${v}`).addEventListener('click',()=>{sex=v;$('sex-male').setAttribute('aria-pressed',String(v==='male'));$('sex-female').setAttribute('aria-pressed',String(v==='female'));select(selected)});
 $('zoom-in').addEventListener('click',()=>viewer?.setZoom(viewer.zoom*.8));$('zoom-out').addEventListener('click',()=>viewer?.setZoom(viewer.zoom*1.25));
 $('stage-canvas').addEventListener('keydown',e=>{if(!viewer)return;if(e.key==='+'||e.key==='=')viewer.setZoom(viewer.zoom*.8);if(e.key==='-')viewer.setZoom(viewer.zoom*1.25);if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();viewer.controls.autoRotate=false;const off=viewer.camera.position.clone().sub(viewer.controls.target);off.applyAxisAngle({x:0,y:1,z:0},e.key==='ArrowLeft'?.2:-.2);viewer.camera.position.copy(viewer.controls.target).add(off)}});

 const still=()=>{$('stage').classList.add('is-static');$('stage-status').textContent=t('best.static');select(selected)};
 viewerReady.then(v=>{viewer=v;if(!v)return still();
  v.onActionEnd=()=>{for(const b of $('anim-chips').children)b.classList.remove('is-playing')};select(selected)}).catch(still);
 const refresh=()=>{renderRoster();renderDossier()};refresh();
 return {refresh};
}
