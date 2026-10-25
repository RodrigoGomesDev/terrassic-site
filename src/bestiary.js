import {SPECIES,LORE} from './generated/species.js';
import {t,pick,getLang} from './i18n.js';
import {sprite,paintSprite} from './sprites.js';
import {assetUrl} from './rig.js';
const $=id=>document.getElementById(id);
const GROUPS=['all','predator','herbivore','flyer','water'];
const GUIDE_KEYS=['sci','behavior','taming','utility'];
const MAX_LENGTH=Math.max(...SPECIES.map(s=>s.length));
const ver=v=>v.slice(1).split('.').map(Number);
const fmt=n=>new Intl.NumberFormat(getLang()==='en'?'en':getLang()==='es'?'es':'pt-BR',{maximumFractionDigits:2}).format(n);
// The mod lists pterosaurs by wingspan.
const lengthLabel=s=>s.group==='flyer'&&['pteranodon','quetzalcoatlus','hatzegopteryx','ichthyornis'].includes(s.id)?'fact.wing':'fact.length';

export function initBestiary({viewerReady,thumbnailer}){
 let selected=SPECIES.find(s=>s.id==='tyrannosaurus'),sex='male',group='all',query='',sort='size',guideKey='sci',viewer=null,anim='idle';
 const roster=$('roster'),cards=new Map();
 // Cards: thumbnails are rendered from the real models the first time a card comes near the screen.
 for(const s of SPECIES){
  const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.className='card';b.dataset.id=s.id;
  b.innerHTML=`<span class="card-art"><img alt="" decoding="async"><span class="card-glow"></span></span><span class="card-meta"><span class="card-name"></span><span class="card-sub"></span></span>`;
  b.querySelector('.card-art').prepend(sprite(`egg:${s.id}`,24));
  b.addEventListener('click',()=>{select(s);document.getElementById('stage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})});
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.setProperty('--mx',`${(e.clientX-r.left)/r.width*100}%`);b.style.setProperty('--my',`${(e.clientY-r.top)/r.height*100}%`)});
  li.append(b);cards.set(s.id,{li,button:b,img:b.querySelector('img')});
 }
 const thumbs=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;thumbs.unobserve(e.target);const s=SPECIES.find(x=>x.id===e.target.dataset.id),card=cards.get(s.id);thumbnailer?.request(s).then(url=>{card.img.src=url;card.button.classList.add('has-art')}).catch(()=>card.button.classList.add('no-art'))}},{rootMargin:'300px'});
 for(const {button} of cards.values())thumbs.observe(button);

 const filters=$('filters');
 for(const g of GROUPS){const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.group=g;b.addEventListener('click',()=>{group=g;renderRoster()});filters.append(b)}
 $('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderRoster()});
 $('sort').addEventListener('change',e=>{sort=e.target.value;renderRoster()});

 function visible(){
  const list=SPECIES.filter(s=>(group==='all'||s.group===group)&&(!query||Object.values(s.name).some(n=>n.toLowerCase().includes(query))));
  const name=s=>pick(s.name);
  return list.sort(sort==='name'?(a,b)=>name(a).localeCompare(name(b)):sort==='version'?(a,b)=>{const x=ver(a.version),y=ver(b.version);return x[0]-y[0]||x[1]-y[1]||b.length-a.length}:(a,b)=>b.length-a.length);
 }
 function renderRoster(){
  for(const b of filters.children){b.textContent=t(`group.${b.dataset.group}`);b.setAttribute('aria-pressed',String(b.dataset.group===group))}
  const list=visible();roster.replaceChildren(...list.map(s=>cards.get(s.id).li));
  list.forEach((s,i)=>{const c=cards.get(s.id);c.li.style.setProperty('--i',Math.min(i,16));c.li.classList.remove('enter');void c.li.offsetWidth;c.li.classList.add('enter');
   c.button.querySelector('.card-name').textContent=pick(s.name);c.button.querySelector('.card-sub').textContent=`${fmt(s.length)} m · ${t(`one.${s.group}`)}`;
   c.button.setAttribute('aria-label',t('best.view',{name:pick(s.name)}));c.button.setAttribute('aria-pressed',String(s===selected))});
  $('roster-count').textContent=list.length?t('best.count',{n:list.length,total:SPECIES.length}):t('best.none');
 }

 function renderDossier(){
  const s=selected;$('dossier-name').textContent=pick(s.name);$('dossier-latin').textContent=s.name.en;$('dossier-group').textContent=t(`one.${s.group}`);
  paintSprite($('dossier-egg'),`egg:${s.id}`,40);
  const facts=[[lengthLabel(s),`${fmt(s.length)} m`],['fact.diet',pick(LORE.diets[s.diet])],['fact.era',pick(LORE.eras[s.era])],['fact.mount',t(`mount.${s.mount}`)],['fact.tame',t(`tame.${s.tame}`)],['fact.version',s.version==='v0.2'?t('ver.base'):t('ver.next',{v:s.version})]];
  $('dossier-facts').replaceChildren(...facts.map(([k,v])=>{const d=document.createElement('div');d.innerHTML='<dt></dt><dd></dd>';d.firstChild.textContent=t(k);d.lastChild.textContent=v;return d}));
  $('ruler-fill').style.width=`${s.length/MAX_LENGTH*100}%`;$('ruler-human').style.left=`${1.8/MAX_LENGTH*100}%`;
  const tabs=$('guide-tabs');tabs.replaceChildren(...GUIDE_KEYS.map(k=>{const b=document.createElement('button');b.type='button';b.role='tab';b.textContent=t(`guide.${k}`);b.setAttribute('aria-selected',String(k===guideKey));b.tabIndex=k===guideKey?0:-1;b.addEventListener('click',()=>{guideKey=k;renderDossier()});return b}));
  const text=$('guide-text');text.textContent=pick(s.guide[guideKey]);text.classList.remove('swap');void text.offsetWidth;text.classList.add('swap');
  $('note-text').textContent=pick(s.guide.note);
  $('stage-canvas').setAttribute('aria-label',t('best.canvas',{name:pick(s.name)}));
  $('sound-toggle').hidden=s.id!=='tyrannosaurus'||!viewer;
  renderAnims();
 }
 function renderAnims(){
  const host=$('anim-chips');host.replaceChildren(...selected.anims.map(a=>{const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.anim=a;b.textContent=t(`anim.${a}`)!==`anim.${a}`?t(`anim.${a}`):a;b.setAttribute('aria-pressed',String(a===anim));b.addEventListener('click',()=>playAnim(a));return b}));
 }
 const roar=new Audio(assetUrl('audio/tyrannosaurus.ogg'));roar.preload='none';roar.volume=.5;let sound=false;
 $('sound-toggle').addEventListener('click',()=>{sound=!sound;$('sound-toggle').setAttribute('aria-pressed',String(sound));if(!sound)roar.pause()});
 function playAnim(a){
  const clip=viewer?.current?.animator.clips[a];if(!clip)return;
  if(clip.loop)anim=a;viewer.play(a);
  if(a==='roar'&&sound&&selected.id==='tyrannosaurus'){roar.currentTime=0;roar.play().catch(()=>{})}
  for(const b of $('anim-chips').children){b.setAttribute('aria-pressed',String(b.dataset.anim===anim));b.classList.toggle('is-playing',!clip.loop&&b.dataset.anim===a)}
 }
 function select(s){
  if(s!==selected){selected=s;anim=s.anims.includes(anim)?anim:'idle'}
  for(const {button} of cards.values())button.setAttribute('aria-pressed',String(button.dataset.id===s.id));
  renderDossier();
  if(viewer){$('stage-status').textContent=t('best.loading');viewer.show(s,sex).then(()=>{$('stage-status').textContent='';if(viewer.current&&anim!=='idle')viewer.play(anim)})}
 }
 for(const v of ['male','female'])$(`sex-${v}`).addEventListener('click',()=>{sex=v;$('sex-male').setAttribute('aria-pressed',String(v==='male'));$('sex-female').setAttribute('aria-pressed',String(v==='female'));select(selected)});
 $('scale-toggle').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(on));viewer?.setScale(on)});
 $('zoom-in').addEventListener('click',()=>viewer?.setZoom(viewer.zoom*.8));$('zoom-out').addEventListener('click',()=>viewer?.setZoom(viewer.zoom*1.25));
 $('stage-canvas').addEventListener('keydown',e=>{if(!viewer)return;if(e.key==='+'||e.key==='=')viewer.setZoom(viewer.zoom*.8);if(e.key==='-')viewer.setZoom(viewer.zoom*1.25);if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();viewer.controls.autoRotate=false;const off=viewer.camera.position.clone().sub(viewer.controls.target);off.applyAxisAngle({x:0,y:1,z:0},e.key==='ArrowLeft'?.2:-.2);viewer.camera.position.copy(viewer.controls.target).add(off)}});

 viewerReady.then(v=>{viewer=v;if(!v){$('stage').classList.add('is-static');$('stage-status').textContent=t('best.static');return}
  v.onActionEnd=()=>{for(const b of $('anim-chips').children)b.classList.remove('is-playing')};select(selected)}).catch(()=>{$('stage').classList.add('is-static');$('stage-status').textContent=t('best.static')});
 const refresh=()=>{renderRoster();renderDossier()};refresh();
 return {refresh};
}
