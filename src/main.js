import {detectLang,setLang,t} from './i18n.js';
import {links,story,models} from './site-config.js';
import {initAnchors} from './anchors.js';
import {initFilm,initHeader,initStory,initNotebook,initEras,initMechanics,initInstall,initFaq,paintEras} from './sections.js';
import {initBestiary} from './bestiary.js';
import {lazyThumbnailer} from './pictures.js';
import {createLoader,preloadImage} from './loader.js';
import {SPECIES} from './generated/species.js';
import {ERAS} from './content.js';
const $=id=>document.getElementById(id);

// One loading screen until everything the visitor will see first is ready (loader.js).
document.documentElement.classList.add('is-loading');
// Text first: the page reads correctly before any 3D has loaded (and the loading screen speaks the right language).
setLang(detectLang());
const loader=createLoader();
// Story mode is off in the mod: the opening of the story (the meteor) stays, marked "coming soon"; the notebook goes.
if(!story)$('cronica').hidden=true;
for(const b of document.querySelectorAll('[data-story-soon]'))b.hidden=story;
// Without story mode the journal card would only say "coming soon" again, so it goes.
$('tile-journal').hidden=!story;
// The eras are part of story mode: while it is off they show as "coming soon", pictures dimmed.
$('eras').classList.toggle('is-soon',!story);
initHeader();initAnchors();
const {render:renderFilm,listen:filmProgress}=initFilm();
const storyRender=initStory();
const renders=[renderFilm,storyRender,initEras(),initInstall(links),initFaq()];if(story)renders.push(initNotebook());

// Three.js only loads when a 3D scene is about to be seen.
const three=import('./viewer.js').catch(()=>null),loadThree=()=>three;
const thumbnailer=lazyThumbnailer(()=>loadThree().then(m=>m||Promise.reject(new Error('three'))));
renders.push(initMechanics(thumbnailer));paintEras(thumbnailer);
const near=(el,margin='400px')=>new Promise(r=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){io.disconnect();r()}},{rootMargin:margin});io.observe(el)});
const viewerReady=near($('stage')).then(loadThree).then(m=>{if(!m)return null;const v=new m.SpecimenViewer($('stage-canvas'));return v.renderer?v:null}).catch(()=>null);
const bestiary=initBestiary({viewerReady,thumbnailer});
const refreshAll=()=>{for(const r of renders)r();bestiary.refresh()};refreshAll();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);refreshAll();heroStatus()});

const asset=p=>new URL(`assets/${p}`,document.baseURI).href;
loader.wait('fonts',1,document.fonts?.ready);loader.wait('3d',1,three);
loader.wait('meteor',1,Promise.all([import('./storyfx.js'),fetch(asset('meteor/meteor.json')),preloadImage(asset('meteor/meteor.png')),preloadImage(asset('meteor/meteor_glow.png'))]));
// Only the pictures seen without scrolling far: the animals with their new model and the chapters.
{const names=[...models.ready,...ERAS.map(e=>`era-${e.id}`)],job=loader.track('pictures',3);let n=0;
 for(const name of names)preloadImage(asset(`thumbs/${name}.webp`)).then(()=>job.set(++n/names.length))}
const rexJob=loader.track('rex',6);
let heroLoaded=0;const heroStatus=()=>{$('hero-status').textContent=heroLoaded>=1?t('hero.ready'):t('hero.loading')};
const film=document.querySelector('.film');
// What the T. rex must never cover: the header, the status line, the scroll cue, the title and the captions on screen
// right now (tight boxes of their words, buttons and images, so a short line leaves its side free).
const stage=$('film-stage'),captions=[['.film-word','--intro'],['.film-intro','--intro'],['.film-quote','--quote'],['.film-chapter','--chapter']].map(([s,v])=>[document.querySelector(s),v]);
const inked=el=>{const rects=[],range=document.createRange(),walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
 for(let n=walk.nextNode();n;n=walk.nextNode())if(n.textContent.trim()){range.selectNodeContents(n);rects.push(...range.getClientRects())}
 for(const b of el.querySelectorAll('a,button,img'))rects.push(b.getBoundingClientRect());
 const u=rects.filter(r=>r.width&&r.height);return u.length?new DOMRect(Math.min(...u.map(r=>r.left)),Math.min(...u.map(r=>r.top)),Math.max(...u.map(r=>r.right))-Math.min(...u.map(r=>r.left)),Math.max(...u.map(r=>r.bottom))-Math.min(...u.map(r=>r.top))):null};
const heroAvoid=()=>[$('topbar'),document.querySelector('.film-top'),document.querySelector('.scroll-cue'),
 ...captions.filter(([,v])=>+(stage.style.getPropertyValue(v)||0)>.02).map(([el])=>el)].map(inked).filter(Boolean);
// Without 3D the opening shows the baked picture of the T. rex where the model would stand.
const noGL=()=>{rexJob.done();film.classList.add('no-webgl');$('hero-canvas').style.backgroundImage=`url(${asset('thumbs/tyrannosaurus.webp')})`};
import('./hero.js').then(({Hero})=>{
 const hero=new Hero($('hero-canvas'),{
  onProgress:p=>{heroLoaded=p;rexJob.set(p*.9);$('hero-meter').style.width=`${p*100}%`;if(p>=1){heroStatus();film.classList.add('is-loaded')}},
  // The screen lifts only once the animal has been drawn (two frames after it is in the scene).
  onReady:()=>{film.classList.add('is-live');requestAnimationFrame(()=>requestAnimationFrame(rexJob.done))},
  onFail:noGL,avoid:heroAvoid});
 if(!hero.renderer)return noGL();
 if(import.meta.env.DEV)window.__hero=hero;
 filmProgress(p=>hero.setProgress(p));
}).catch(noGL);

// The story's meteor is loaded only when the story comes near.
near($('historia'),'600px').then(()=>import('./storyfx.js')).then(({StoryMeteor})=>{const fx=new StoryMeteor($('story-meteor'));if(fx.renderer)storyRender.listen(p=>fx.setProgress(p))}).catch(()=>{});

// Used by scripts/bake-thumbs.mjs to save the thumbnails as static images.
if(new URLSearchParams(location.search).has('bake'))window.__bake=async()=>{
 const t=await thumbnailer(),{ERAS}=await import('./content.js');
 const data=url=>fetch(url).then(r=>r.blob()).then(b=>new Promise(res=>{const f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(b)}));
 const out={};for(const s of SPECIES)out[s.id]=await data(await t.request(s));
 const para=SPECIES.find(s=>s.id==='parasaurolophus');for(const sex of ['male','female'])out[`parasaurolophus-${sex}`]=await data(await t.request(para,sex));
 const {ERA_ANIMALS}=await import('./sections.js');
 for(const e of ERAS)out[`era-${e.id}`]=await data(await t.eraScene(e.id,(ERA_ANIMALS[e.id]||[]).map(([id,x,z,r])=>[SPECIES.find(s=>s.id===id),x,z,r])));
 return out;
};
