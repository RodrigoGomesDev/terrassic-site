import {SPECIES,LORE} from './generated/species.js';
import {ERAS,VERSIONS,GUIDE_LEVELS,TOOLS,WEAPONS,INSTALL,INSTALL_TABS,FAQ} from './content.js';
import {t,pick} from './i18n.js';
import {report,story,isReady} from './site-config.js';
import {sprite,paintSprite} from './sprites.js';
import {picture} from './pictures.js';
import {eggCanvas,eggStage} from './egg.js';
const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
// Scroll progress of a tall section whose child sticks to the viewport: 0 when it reaches the top, 1 when it leaves.
const pinProgress=section=>{const r=section.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight),0,1)};
const scrollers=[];export const onScroll=fn=>scrollers.push(fn);
let ticking=false;const frame=()=>{ticking=false;for(const fn of scrollers)fn()};
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(frame)}},{passive:true});addEventListener('resize',()=>requestAnimationFrame(frame));

// The opening film: scroll progress drives the sky colour, the captions, the flash and the 3D scene.
const SKY=[[0,[219,177,91]],[.84,[219,177,91]],[1,[20,16,20]]];
const sky=p=>{let i=0;while(i<SKY.length-2&&SKY[i+1][0]<p)i++;const [a,ca]=SKY[i],[b,cb]=SKY[i+1],k=smooth((p-a)/(b-a));return `rgb(${ca.map((v,j)=>Math.round(v+(cb[j]-v)*k)).join(',')})`};
export function initFilm(){
 const film=$('inicio'),stage=$('film-stage'),listeners=[];
 // Without story mode there is no notebook quote nor chapter card: the T. rex roars and the camera dives on its own.
 const win=(p,a,b,c,d)=>story?smooth((p-a)/(b-a))*(1-smooth((p-c)/(d-c))):0;
 const update=()=>{
  const p=reduced?.62:pinProgress(film);
  stage.style.setProperty('--film-bg',sky(p));stage.style.setProperty('--intro',(1-smooth(p/.1)).toFixed(3));
  stage.style.setProperty('--quote',win(p,.1,.15,.26,.31).toFixed(3));stage.style.setProperty('--chapter',win(p,.34,.39,.5,.56).toFixed(3));
  // The dive into the mouth breaks into big blocks (hero.js), then fades to the dark of the story in steps.
  stage.style.setProperty('--fade',(Math.round(smooth((p-.86)/.1)*6)/6).toFixed(3));
  $('film-fill').style.width=`${p*100}%`;$('scroll-label').textContent=t(p<.3?'film.scroll':p<.84?'film.scroll2':'film.scroll3');
  $('topbar').classList.toggle('on-light',film.getBoundingClientRect().bottom>innerHeight*.5&&p<.9);
  for(const fn of listeners)fn(p);
 };
 onScroll(update);
 const render=()=>{if(story){const page=LORE.pages.find(x=>x.day===1203)||LORE.pages.at(-1),text=pick(page.text);$('film-quote').textContent=text.slice(0,text.indexOf('.')+1);$('film-cite').textContent=`${t('best.noteBy')} · ${t('book.day')} ${page.day}`}update()};
 return {render,listen:fn=>{listeners.push(fn);fn(reduced?.62:pinProgress(film))}};
}

export function initHeader(){
 const bar=$('topbar');
 // On small screens the sections sit behind a Menu button; choosing one, or Esc, closes it again.
 const toggle=$('nav-toggle'),setOpen=o=>{bar.classList.toggle('is-open',o);toggle.setAttribute('aria-expanded',String(o))};
 toggle.addEventListener('click',()=>setOpen(!bar.classList.contains('is-open')));
 for(const a of document.querySelectorAll('.nav a'))a.addEventListener('click',()=>setOpen(false));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&bar.classList.contains('is-open')){setOpen(false);toggle.focus()}});
 const links=[...document.querySelectorAll('.nav a[href^="#"]:not(.nav-play)')],targets=links.map(a=>document.querySelector(a.getAttribute('href')));
 onScroll(()=>{bar.classList.toggle('is-solid',scrollY>40);
  const mid=innerHeight*.4;let active=-1;targets.forEach((s,i)=>{const r=s?.getBoundingClientRect();if(r&&r.top<mid&&r.bottom>mid)active=i});links.forEach((a,i)=>a.classList.toggle('is-active',i===active))});
}

// The intro screen of the mod, line by line, driven by scroll, while a meteor falls behind the text.
export function initStory(){
 const section=$('historia'),host=$('story-lines'),listeners=[];
 const canvas=$('story-sky'),g=canvas.getContext('2d');let motes=[];
 const size=()=>{canvas.width=canvas.clientWidth*Math.min(devicePixelRatio,1.5);canvas.height=canvas.clientHeight*Math.min(devicePixelRatio,1.5);motes=Array.from({length:110},()=>({x:Math.random(),y:Math.random(),s:.4+Math.random()*1.6,v:.02+Math.random()*.05,p:Math.random()*6}))};
 size();addEventListener('resize',size);
 let lines=[],p=0,visible=false;
 const render=()=>{
  const kicker=host.firstElementChild;host.replaceChildren(kicker,...LORE.intro.map(l=>el('p','story-line',pick(l))),el('p','story-era',pick(LORE.era)));
  lines=[...host.querySelectorAll('.story-line,.story-era')];update();
 };
 const update=()=>{
  p=reduced?1:pinProgress(section);const n=lines.length;
  const q=p*(n-.35)+.25;lines.forEach((l,i)=>{const a=smooth((q-i)*2.4),out=i<n-1?smooth((q-i-.72)*2.4):0;l.style.setProperty('--in',a.toFixed(3));l.style.setProperty('--out',out.toFixed(3))});
  section.style.setProperty('--flash',(smooth((p-.735)/.03)*(1-smooth((p-.78)/.12))).toFixed(3));section.style.setProperty('--p',p);for(const fn of listeners)fn(p);
 };
 new IntersectionObserver(([e])=>{visible=e.isIntersecting}).observe(section);
 const draw=now=>{requestAnimationFrame(draw);if(!visible||reduced&&motes.drawn)return;motes.drawn=true;
  const w=canvas.width,h=canvas.height;g.clearRect(0,0,w,h);
  for(const m of motes){const y=((m.y-now*.00001*m.v*60+1)%1)*h,x=(m.x+Math.sin(now*.0004+m.p)*.01)*w,a=(.25+.75*Math.abs(Math.sin(now*.001+m.p)))*(.35+p*.65);g.fillStyle=`rgba(242,181,68,${a*.7})`;g.fillRect(x,y,m.s*2,m.s*2)}};
 requestAnimationFrame(draw);onScroll(update);render.listen=fn=>{listeners.push(fn);fn(p)};return render;
}

// Katarina's notebook: the Incident Report and her diary pages, in the mod's own words.
export function initNotebook(){
 let book='report',page=0;
 const books={report:()=>LORE.report.map(r=>({title:pick(r.title),text:pick(r.text)})),katarina:()=>LORE.pages.map(p=>({title:`${t('book.day')} ${p.day}`,text:pick(p.text)}))};
 const render=()=>{
  const pages=books[book](),tabs=$('notebook-tabs');page=clamp(page,0,pages.length-1);
  tabs.replaceChildren(...Object.keys(books).map(k=>{const b=el('button','',t(`book.${k}`));b.type='button';b.role='tab';b.setAttribute('aria-selected',String(k===book));b.addEventListener('click',()=>{book=k;page=0;render()});return b}));
  const art=$('notebook-page'),p=pages[page];art.replaceChildren(el('h3','',p.title),...p.text.split('\n\n').map(x=>el('p','',x)));
  art.classList.toggle('typed',book==='report');art.classList.remove('turn');void art.offsetWidth;art.classList.add('turn');
  $('page-count').textContent=`${page+1} / ${pages.length}`;$('page-prev').disabled=page===0;$('page-next').disabled=page===pages.length-1;
 };
 $('page-prev').addEventListener('click',()=>{page--;render()});$('page-next').addEventListener('click',()=>{page++;render()});
 return render;
}

// Chapters on a horizontal track that follows the vertical scroll; each era paints its own landscape.
function landscape(canvas,era,seed){
 const w=canvas.width=240,h=canvas.height=150,g=canvas.getContext('2d'),c=era.colors;let s=seed;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
 const px=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),ww,hh)};
 const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,c[0]);sky.addColorStop(.75,c[1]);g.fillStyle=sky;g.fillRect(0,0,w,h);
 for(let i=0;i<22;i++)px(rnd()*w,rnd()*55,1,1,'rgba(255,240,210,.5)');
 const sx=40+rnd()*150,sy=48;for(let y=-7;y<=7;y++){const half=Math.round(Math.sqrt(49-y*y));px(sx-half,sy+y,half*2,1,'rgba(255,226,170,.75)')}
 if(era.id==='early'){for(let y=0;y<46;y++){const half=4+y*.9;px(170-half,58+y,half*2,1,'#2a2329')}for(let i=0;i<40;i++)px(166+rnd()*10-i*.4,58-i*1.2,3+rnd()*6,2,'rgba(138,124,106,.55)');px(166,56,8,3,'#f07a1a')}
 if(era.id==='late')for(let i=0;i<4;i++){const x=rnd()*w,y=rnd()*40;for(let k=0;k<10;k++)px(x-k*2,y+k,2,1,`rgba(255,210,122,${1-k/10})`)}
 const ridge=(base,amp,col,step)=>{let y=base;for(let x=0;x<w;x+=step){y=clamp(y+(rnd()-.5)*amp,base-amp*1.5,base+amp);px(x,y,step,h-y,col)}};
 ridge(92,10,c[3]+'aa',6);ridge(112,8,c[2],4);
 const tree=(x,base,kind)=>{
  if(kind==='conifer'){px(x,base-14,2,14,'#3b2a1a');for(let k=0;k<6;k++)px(x-6+k,base-26+k*2.4,13-k*2,3,'#2f5a35')}
  if(kind==='araucaria'){px(x,base-30,2,30,'#3b2a1a');px(x-7,base-34,16,4,'#28503a');px(x-4,base-37,10,3,'#3b6b3c')}
  if(kind==='fern'){for(let k=-3;k<=3;k++)px(x+k*2,base-6+Math.abs(k),2,6-Math.abs(k),'#55803a')}
  if(kind==='mesa'){px(x-12,base-22,26,22,'#7a3a20');px(x-14,base-24,30,3,'#9a4a28')}
  if(kind==='ice'){px(x-16,base-10,34,10,'#dfe8ee');px(x-10,base-16,20,6,'#eef3f6')}
 };
 const kinds={late:['conifer','conifer','fern'],early:['conifer','fern','fern'],jurassic:['araucaria','araucaria','fern'],triassic:['mesa','fern'],ice:['ice','ice','conifer']}[era.id];
 for(let i=0;i<9;i++)tree(8+i*27+rnd()*10,124+rnd()*4,kinds[Math.floor(rnd()*kinds.length)]);
 ridge(132,4,c[3],3);
 if(era.id==='ice')for(let i=0;i<60;i++)px(rnd()*w,rnd()*h,1,1,'rgba(255,255,255,.8)');
 return canvas;
}
// Each chapter card gets a slab of that era's blocks from the mod, rendered once by the shared thumbnail renderer.
const eraArt=new Map();
const eraImage=url=>{const img=el('img','era-photo');img.alt='';img.src=url;return img};
// Only animals whose new model is ready stand on the dioramas (the baked pictures follow this list: npm run thumbs).
export const ERA_ANIMALS=Object.fromEntries(Object.entries({late:[['tyrannosaurus',2,1,-2.2],['triceratops',-5,2,-1.1]],jurassic:[['stegosaurus',0,1,-1.9],['dilophosaurus',-6,2,-.9]]}).map(([k,v])=>[k,v.filter(([id])=>isReady(id))]));
export function paintEras(thumbnailer){
 const section=$('eras');
 const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();
  for(const e of ERAS){const list=()=>(ERA_ANIMALS[e.id]||[]).map(([id,x,z,r])=>[SPECIES.find(s=>s.id===id),x,z,r]);
   picture(`era-${e.id}`,()=>thumbnailer().then(t=>t.eraScene(e.id,list()))).then(url=>{eraArt.set(e.id,url);const host=document.querySelector(`.era-art[data-era="${e.id}"]`);if(host&&!host.querySelector('.era-photo'))host.append(eraImage(url))}).catch(()=>{})}
 },{rootMargin:'800px'});io.observe(section);
}
export function initEras(){
 const track=$('eras-track');
 return ()=>track.replaceChildren(...ERAS.map((e,i)=>{
   const card=el('article',`era era-${e.id}`);card.style.setProperty('--era-a',e.colors[1]);
   const art=el('div','era-art');art.append(landscape(document.createElement('canvas'),e,(i+3)*7919));if(eraArt.has(e.id))art.append(eraImage(eraArt.get(e.id)));art.dataset.era=e.id;
   // Without the story the chapters are only a promise: the diorama shows as a silhouette, like the animals being remade.
   if(story)art.style.background=e.colors[0];else art.append(el('span','soon-tag',t('soon')));
   const body=el('div','era-body');
   body.append(el('p','era-n',pick(e.n)),el('h3','',pick(e.name)),el('p','era-when',`${pick(e.era)}${e.ma?` · ${e.ma[0]}–${e.ma[1]} Ma`:''}`),el('p','era-land',pick(e.land)));
   const dl=el('dl','era-facts');for(const [k,v] of story?[['eras.where',e.where],['eras.event',e.event],['eras.boss',e.boss],['eras.plants',e.plants]]:[['eras.where',e.where],['eras.plants',e.plants]]){const d=el('div');d.append(el('dt','',t(k)),el('dd','',pick(v)));dl.append(d)}
   const fauna=el('p','era-fauna');fauna.append(el('span','',t('eras.fauna')),document.createTextNode(e.fauna.map(f=>typeof f==='string'?f:pick(f)).join(' · ')));
   const status=story?el('span',`status status-${e.status}`,`${e.version} · ${t(e.status==='wip'?'road.wip':'road.plan')}`):null;
   body.append(dl,fauna);if(status)body.append(status);card.append(art,body);return card;
  }));
}

export function initMechanics(thumbnailer){
 // The egg in pixel art: whole, a crack, cracked across, then it hatches and starts again.
 const stage=$('egg-stage'),egg=eggCanvas(),eg=egg.getContext('2d');let step=0;
 $('egg-sprite').replaceWith(egg);eggStage(eg,0);
 // The hatched stage lasts longer, so the baby has time to peek out.
 const next=()=>{step=(step+1)%4;stage.dataset.step=step;eggStage(eg,step,0);
  if(step===3){const t0=performance.now(),run=now=>{const t=(now-t0)/2600;eggStage(eg,3,Math.min(1,t));if(t<1)requestAnimationFrame(run)};requestAnimationFrame(run)}
  setTimeout(next,step===3?3000:1600)};
 if(!reduced)setTimeout(next,1600);
 for(const s of document.querySelectorAll('[data-sprite]'))paintSprite(s,s.dataset.sprite,Number(s.dataset.size)||32);
 const para=SPECIES.find(s=>s.id==='parasaurolophus');$('sex-pair').classList.toggle('is-soon',!isReady(para.id));
 const pair=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;pair.disconnect();for(const sex of ['male','female'])picture(`parasaurolophus-${sex}`,()=>thumbnailer().then(t=>t.request(para,sex))).then(url=>{const img=$(`pair-${sex}`);img.src=url;img.alt=`${pick(para.name)}, ${t(`best.${sex}`).toLowerCase()}`}).catch(()=>{})},{rootMargin:'400px'});pair.observe($('sex-pair'));
 // The weapons' 3D stage loads only when the card comes near.
 let weapon='blowgun',armsStage=null;
 const showWeapon=()=>{const w=WEAPONS.find(x=>x.id===weapon);$('arms-caption').textContent=pick(w.name);armsStage?.show(w)};
 const armsIO=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;armsIO.disconnect();
  import('./items3d.js').then(({WeaponStage})=>{const s=new WeaponStage($('arms-stage'));if(!s.renderer){$('arms-stage').hidden=true;return}armsStage=s;showWeapon()}).catch(()=>{$('arms-stage').hidden=true})},{rootMargin:'400px'});
 armsIO.observe($('arms-stage'));
 return ()=>{
  $('levels').replaceChildren(...GUIDE_LEVELS.map((l,i)=>{const li=el('li');li.style.setProperty('--i',i);li.append(el('strong','',pick(l.name)),el('span','',pick(!story&&l.howSoon?l.howSoon:l.how)));return li}));
  $('tools').replaceChildren(...TOOLS.map(x=>{const li=el('li');li.append(sprite(x.sprite,32),el('span','',pick(x.name)));return li}));
  // Each slot is a button: it shows that weapon on the 3D stage above, doing what it does in the game.
  $('weapons').replaceChildren(...WEAPONS.map(w=>{const li=el('li');const b=el('button','slot');b.type='button';b.dataset.weapon=w.id;b.setAttribute('aria-pressed',String(w.id===weapon));
   b.append(sprite(w.sprite,32));const d=el('div');d.append(el('span','slot-name',pick(w.name)),el('span','slot-dmg',w.note?pick(w.note):w.thrown?`${w.dmg} · ${w.thrown} ${t('mech.thrown')}`:w.dmg));b.append(d);
   b.addEventListener('click',()=>{weapon=w.id;for(const x of $('weapons').querySelectorAll('.slot'))x.setAttribute('aria-pressed',String(x.dataset.weapon===weapon));showWeapon()});li.append(b);return li}));
  showWeapon();
  $('journal').hidden=!story;
  const themes=Object.keys(LORE.themes);
  $('journal').replaceChildren(...themes.map(th=>{const col=el('div','journal-col');col.append(el('h4','',pick(LORE.themes[th])));const ul=el('ul');for(const o of LORE.objectives.filter(o=>o.theme===th)){const li=el('li');li.title=pick(o.text);li.append(el('span','check'),el('span','',pick(o.title)));ul.append(li)}col.append(ul);return col}));
 };
}

export function initInstall(links){
 let loader=INSTALL_TABS[0][0];const tabs=$('install-tabs'),ids=INSTALL_TABS.map(([id])=>id);
 tabs.replaceChildren(...INSTALL_TABS.map(([id,label])=>{const b=el('button','',label);b.type='button';b.setAttribute('role','tab');b.id=`tab-${id}`;
  b.addEventListener('click',()=>{loader=id;render()});
  b.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const k=(ids.indexOf(loader)+(e.key==='ArrowRight'?1:-1)+ids.length)%ids.length;loader=ids[k];render();$(`tab-${loader}`).focus()});return b}));
 const render=()=>{for(const n of ids){const tab=$(`tab-${n}`);tab.setAttribute('aria-selected',String(n===loader));tab.tabIndex=n===loader?0:-1}
  $('steps').replaceChildren(...INSTALL[loader].map(s=>el('li','',pick(s).replace('{v}',links.version))));
  if(links.download)for(const id of ['download','hero-download'])$(id).href=links.download;
  for(const id of ['discord','foot-discord']){$(id).hidden=!links.discord;if(links.discord)$(id).href=links.discord}
  // The wiki only has a report section once the form has its key or there is a Discord (same rule as wiki.js).
  $('report-link').hidden=!(report.web3formsKey||links.discord||import.meta.env.DEV)};
 return render;
}

export function initFaq(){
 return ()=>$('faq').replaceChildren(...FAQ.map(f=>story||!f.aSoon?f:{...f,a:f.aSoon}).map(f=>{const d=el('details');const s=el('summary');s.append(el('span','',pick(f.q)),el('i','','+'));d.append(s,el('p','',pick(f.a)));return d}));
}
