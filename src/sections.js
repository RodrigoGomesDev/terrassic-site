import {SPECIES,LORE} from './generated/species.js';
import {ERAS,VERSIONS,GUIDE_LEVELS,TOOLS,WEAPONS,INSTALL,FAQ} from './content.js';
import {t,pick} from './i18n.js';
import {sprite,paintSprite} from './sprites.js';
import {picture} from './pictures.js';
import {initBite} from './bite.js';
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
 const film=$('inicio'),stage=$('film-stage'),listeners=[],bite=initBite($('film-jaws'),$('hero-canvas'));
 const update=()=>{
  const p=reduced?.62:pinProgress(film),win=(a,b,c,d)=>smooth((p-a)/(b-a))*(1-smooth((p-c)/(d-c)));
  stage.style.setProperty('--film-bg',sky(p));stage.style.setProperty('--intro',(1-smooth(p/.1)).toFixed(3));
  stage.style.setProperty('--quote',win(.1,.15,.26,.31).toFixed(3));stage.style.setProperty('--chapter',win(.34,.39,.5,.56).toFixed(3));
  // The dive into the mouth ends with the jaws biting shut, then a fade to the dark of the story.
  bite(reduced?0:clamp((p-.83)/.12,0,1));stage.style.setProperty('--fade',smooth((p-.95)/.05).toFixed(3));
  $('film-fill').style.width=`${p*100}%`;$('scroll-label').textContent=t(p<.3?'film.scroll':p<.84?'film.scroll2':'film.scroll3');
  $('topbar').classList.toggle('on-light',film.getBoundingClientRect().bottom>innerHeight*.5&&p<.9);
  for(const fn of listeners)fn(p);
 };
 onScroll(update);
 const render=()=>{const page=LORE.pages.find(x=>x.day===1203)||LORE.pages.at(-1),text=pick(page.text);$('film-quote').textContent=text.slice(0,text.indexOf('.')+1);$('film-cite').textContent=`Katarina · ${t('book.day')} ${page.day}`;update()};
 return {render,listen:fn=>{listeners.push(fn);fn(reduced?.62:pinProgress(film))}};
}

export function initHeader(){
 const bar=$('topbar'),links=[...document.querySelectorAll('.nav a')],targets=links.map(a=>document.querySelector(a.getAttribute('href')));
 onScroll(()=>{bar.classList.toggle('is-solid',scrollY>40);
  const mid=innerHeight*.4;let active=-1;targets.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<mid)active=i});links.forEach((a,i)=>a.classList.toggle('is-active',i===active))});
}

export function initMarquee(){
 const names=SPECIES.map(s=>s.id);const half=Math.ceil(names.length/2);
 const fill=(host,ids)=>{const row=()=>{const frag=document.createDocumentFragment();for(const id of ids){const s=SPECIES.find(x=>x.id===id),item=el('span','marquee-item');item.append(sprite(`egg:${id}`,28),el('span','',pick(s.name)));frag.append(item)}return frag};host.replaceChildren(row(),row())};
 return ()=>{fill($('marquee-a'),names.slice(0,half));fill($('marquee-b'),names.slice(half))};
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
export const ERA_ANIMALS={late:[['tyrannosaurus',2,1,-2.2],['triceratops',-5,2,-1.1]],jurassic:[['stegosaurus',0,1,-1.9],['dilophosaurus',-6,2,-.9]]};
export function paintEras(thumbnailer){
 const section=$('eras');
 const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();
  for(const e of ERAS){const list=()=>(ERA_ANIMALS[e.id]||[]).map(([id,x,z,r])=>[SPECIES.find(s=>s.id===id),x,z,r]);
   picture(`era-${e.id}`,()=>thumbnailer().then(t=>t.eraScene(e.id,list()))).then(url=>{eraArt.set(e.id,url);const host=document.querySelector(`.era-art[data-era="${e.id}"]`);if(host&&!host.querySelector('.era-photo'))host.append(eraImage(url))}).catch(()=>{})}
 },{rootMargin:'800px'});io.observe(section);
}
export function initEras(){
 const section=$('eras'),track=$('eras-track'),fill=$('timeline-fill'),ticks=$('timeline-ticks');
 const render=()=>{
  track.replaceChildren(...ERAS.map((e,i)=>{
   const card=el('article',`era era-${e.id}`);card.style.setProperty('--era-a',e.colors[1]);
   const art=el('div','era-art');art.append(landscape(document.createElement('canvas'),e,(i+3)*7919));if(eraArt.has(e.id))art.append(eraImage(eraArt.get(e.id)));art.dataset.era=e.id;art.style.background=`linear-gradient(180deg,${e.colors[0]},${e.colors[1]})`;
   const body=el('div','era-body');
   body.append(el('p','era-n',pick(e.n)),el('h3','',pick(e.name)),el('p','era-when',`${pick(e.era)}${e.ma?` · ${e.ma[0]}–${e.ma[1]} Ma`:''}`),el('p','era-land',pick(e.land)));
   const dl=el('dl','era-facts');for(const [k,v] of [['eras.where',e.where],['eras.event',e.event],['eras.boss',e.boss],['eras.plants',e.plants]]){const d=el('div');d.append(el('dt','',t(k)),el('dd','',pick(v)));dl.append(d)}
   const fauna=el('p','era-fauna');fauna.append(el('span','',t('eras.fauna')),document.createTextNode(e.fauna.map(f=>typeof f==='string'?f:pick(f)).join(' · ')));
   const status=el('span',`status status-${e.status}`,`${e.version} · ${t(e.status==='wip'?'road.wip':'road.plan')}`);
   body.append(dl,fauna,status);card.append(art,body);return card;
  }));
  const labels=['66 Ma','100 Ma','145 Ma','201 Ma','252 Ma',pick({pt:'Era do Gelo',en:'Ice Age',es:'Edad de Hielo'})];
  ticks.replaceChildren(...labels.map((x,i)=>{const s=el('span','',x);s.style.left=`${i/(labels.length-1)*100}%`;return s}));update();
 };
 const update=()=>{
  if(innerWidth<760||reduced){track.style.transform='';fill.style.width='100%';return}
  const p=pinProgress(section),max=track.scrollWidth-track.clientWidth;track.style.transform=`translate3d(${-p*max}px,0,0)`;fill.style.width=`${p*100}%`;
  [...track.children].forEach((c,i)=>{const r=c.getBoundingClientRect(),center=(r.left+r.width/2)/innerWidth-.5;c.style.setProperty('--tilt',center.toFixed(3))});
 };
 const fit=()=>{section.style.height=innerWidth<760||reduced?'auto':`${track.scrollWidth-track.clientWidth+innerHeight*1.15}px`;update()};
 addEventListener('resize',fit);onScroll(update);
 return ()=>{render();requestAnimationFrame(fit)};
}

export function initMechanics(thumbnailer){
 // Egg block: the mod's three crack stages, then it hatches and starts again.
 const egg=$('egg-sprite'),stage=$('egg-stage');let step=0;
 const stages=['block:triceratops_egg_0','block:triceratops_egg_1','block:triceratops_egg_2'];paintSprite(egg,stages[0],96);egg.style.width='78px';egg.style.backgroundPosition=egg.style.backgroundPosition.replace(/^-?\d+px/,m=>`${parseInt(m)-9}px`);
 if(!reduced)setInterval(()=>{step=(step+1)%4;stage.dataset.step=step;if(step<3){paintSprite(egg,stages[step],96);egg.style.width='78px';egg.style.backgroundPosition=egg.style.backgroundPosition.replace(/^-?\d+px/,m=>`${parseInt(m)-9}px`)}},1600);
 for(const s of document.querySelectorAll('[data-sprite]'))paintSprite(s,s.dataset.sprite,32);
 const para=SPECIES.find(s=>s.id==='parasaurolophus');
 const pair=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;pair.disconnect();for(const sex of ['male','female'])picture(`parasaurolophus-${sex}`,()=>thumbnailer().then(t=>t.request(para,sex))).then(url=>{$(`pair-${sex}`).src=url}).catch(()=>{})},{rootMargin:'400px'});pair.observe($('sex-pair'));
 return ()=>{
  $('levels').replaceChildren(...GUIDE_LEVELS.map((l,i)=>{const li=el('li');li.style.setProperty('--i',i);li.append(el('strong','',pick(l.name)),el('span','',pick(l.how)));return li}));
  $('tools').replaceChildren(...TOOLS.map(x=>{const li=el('li');li.append(sprite(x.sprite,32),el('span','',pick(x.name)));return li}));
  $('weapons').replaceChildren(...WEAPONS.map(w=>{const li=el('li','slot');li.append(sprite(w.sprite,32));const d=el('div');d.append(el('span','slot-name',pick(w.name)),el('span','slot-dmg',w.thrown?`${w.dmg} · ${w.thrown} ${t('mech.thrown')}`:w.dmg));li.append(d);return li}));
  const themes=Object.keys(LORE.themes);
  $('journal').replaceChildren(...themes.map(th=>{const col=el('div','journal-col');col.append(el('h4','',pick(LORE.themes[th])));const ul=el('ul');for(const o of LORE.objectives.filter(o=>o.theme===th)){const li=el('li');li.title=pick(o.text);li.append(el('span','check'),el('span','',pick(o.title)));ul.append(li)}col.append(ul);return col}));
 };
}

export function initRoadmap(){
 const host=$('versions');
 const render=()=>host.replaceChildren(...VERSIONS.map(v=>{const li=el('li',`version is-${v.status}`);const head=el('div','version-head');head.append(el('span','version-tag',v.v),el('span',`status status-${v.status}`,t(v.status==='done'?'road.done':v.status==='wip'?'road.wip':'road.plan')));
  li.append(head,el('h3','',pick(v.name)));if(v.detail)li.append(el('p','',pick(v.detail)));if(v.add)li.append(el('p','version-add',t('road.new',{n:v.add})));return li}));
 const made=$('road-made'),bar=$('road-progress');let counted=false;
 new IntersectionObserver(([e])=>{if(!e.isIntersecting||counted)return;counted=true;const start=performance.now(),total=SPECIES.length;
  const step=now=>{const k=reduced?1:smooth((now-start)/1400);made.textContent=Math.round(total*k);bar.style.width=`${total/152*100*k}%`;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)},{threshold:.4}).observe(made);
 onScroll(()=>{const items=host.children;for(const li of items){const r=li.getBoundingClientRect();li.classList.toggle('is-lit',r.top<innerHeight*.7)}});
 return render;
}

export function initInstall(links){
 let loader='fabric';
 const render=()=>{for(const n of ['fabric','forge']){const tab=$(`tab-${n}`);tab.setAttribute('aria-selected',String(n===loader));tab.tabIndex=n===loader?0:-1}
  $('steps').replaceChildren(...INSTALL[loader].map(s=>el('li','',pick(s))));
  if(links.download)$('download').href=links.download;$('modrinth').hidden=!links.modrinth;if(links.modrinth)$('modrinth').href=links.modrinth};
 for(const n of ['fabric','forge']){$(`tab-${n}`).addEventListener('click',()=>{loader=n;render()});$(`tab-${n}`).addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();loader=n==='fabric'?'forge':'fabric';render();$(`tab-${loader}`).focus()}})}
 return render;
}

export function initFaq(){
 return ()=>$('faq').replaceChildren(...FAQ.map(f=>{const d=el('details');const s=el('summary');s.append(el('span','',pick(f.q)),el('i','','+'));d.append(s,el('p','',pick(f.a)));return d}));
}

// Motion that is purely decorative: reveals, magnetic buttons and the hero copy parallax.
export function initMotion(){
 if(!reduced&&'IntersectionObserver' in window){document.documentElement.classList.add('motion');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(x=>io.observe(x));}
 if(!reduced&&matchMedia('(pointer: fine)').matches)for(const b of document.querySelectorAll('.magnetic')){
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.28}px)`});
  b.addEventListener('pointerleave',()=>{b.style.transform=''});
 }
}
