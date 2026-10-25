import {detectLang,setLang,t} from './i18n.js';
import {links} from './site-config.js';
import {initFilm,initHeader,initMarquee,initStory,initNotebook,initEras,initMechanics,initRoadmap,initInstall,initFaq,initMotion,onScroll,paintEras} from './sections.js';
import {initBestiary} from './bestiary.js';
import {lazyThumbnailer} from './pictures.js';
import {createLoader,preloadImage} from './loader.js';
import {SPECIES} from './generated/species.js';
import {ERAS} from './content.js';
const $=id=>document.getElementById(id);

// One loading screen until everything the visitor will see is ready (loader.js).
document.documentElement.classList.add('is-loading');
const loader=createLoader();
// Text first: the page reads correctly before any 3D has loaded.
setLang(detectLang());
initHeader();initMotion();
const {render:renderFilm,listen:filmProgress}=initFilm();
const renderStory=initStory();
const renders=[renderFilm,initMarquee(),renderStory,initNotebook(),initEras(),initRoadmap(),initInstall(links),initFaq()];

// Three.js is loaded on demand so the copy is never blocked by WebGL.
const three=import('./viewer.js').catch(()=>null);
const thumbnailer=lazyThumbnailer(()=>three.then(m=>m||Promise.reject(new Error('three'))));
renders.push(initMechanics(thumbnailer));paintEras(thumbnailer);
const viewerReady=three.then(m=>{if(!m)return null;const v=new m.SpecimenViewer($('stage-canvas'));return v.renderer?v:null}).catch(()=>null);
const bestiary=initBestiary({viewerReady,thumbnailer});
const refreshAll=()=>{for(const r of renders)r();bestiary.refresh()};refreshAll();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);refreshAll();heroStatus()});

const asset=p=>new URL(`assets/${p}`,document.baseURI).href;
loader.wait('fonts',1,document.fonts?.ready);loader.wait('3d',1,three);
loader.wait('meteor',1,Promise.all([import('./storyfx.js'),fetch(asset('meteor/meteor.json')),preloadImage(asset('meteor/meteor.png')),preloadImage(asset('meteor/meteor_glow.png'))]));
{const names=[...SPECIES.map(s=>s.id),'parasaurolophus-male','parasaurolophus-female',...ERAS.map(e=>`era-${e.id}`)],job=loader.track('pictures',3);let n=0;
 for(const name of names)preloadImage(asset(`thumbs/${name}.webp`)).then(()=>job.set(++n/names.length))}
const rexJob=loader.track('rex',6);
let heroLoaded=0;const heroStatus=()=>{$('hero-status').textContent=heroLoaded>=1?t('hero.ready'):t('hero.loading')};
const film=document.querySelector('.film');
// Without 3D the opening shows the baked picture of the T. rex where the model would stand.
const noGL=()=>{rexJob.done();film.classList.add('no-webgl');$('hero-canvas').style.backgroundImage=`url(${new URL('assets/thumbs/tyrannosaurus.webp',document.baseURI).href})`};
import('./hero.js').then(({Hero})=>{
 const hero=new Hero($('hero-canvas'),{
  onProgress:p=>{heroLoaded=p;rexJob.set(p*.9);$('hero-meter').style.width=`${p*100}%`;if(p>=1){heroStatus();film.classList.add('is-loaded')}},
  // The screen lifts only once the animal has been drawn (two frames after it is in the scene).
  onReady:()=>{film.classList.add('is-live');requestAnimationFrame(()=>requestAnimationFrame(rexJob.done))},
  onFail:noGL});
 if(!hero.renderer)return noGL();
 if(import.meta.env.DEV)window.__hero=hero;
 // The roar is heard only after the visitor turns the sound on (browsers block sound that starts by itself).
 const roar=new Audio(new URL('assets/audio/tyrannosaurus-roar-pixabay.mp3',document.baseURI).href);roar.preload='none';roar.volume=.9;let sound=false;
 $('hero-sound').addEventListener('click',e=>{sound=!sound;e.currentTarget.setAttribute('aria-pressed',String(sound));if(sound){roar.load();if(hero.rex?.animator.scrubbing){roar.currentTime=0;roar.play().catch(()=>{})}}else roar.pause()});
 hero.onRoar=()=>{if(sound&&hero.visible)setTimeout(()=>{roar.currentTime=0;roar.play().catch(()=>{})},350)};
 filmProgress(p=>hero.setProgress(p));
}).catch(noGL);

// The story's meteor is loaded only when the story comes near.
const storyIO=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;storyIO.disconnect();import('./storyfx.js').then(({StoryMeteor})=>{const fx=new StoryMeteor($('story-meteor'));if(fx.renderer)renderStory.listen(p=>fx.setProgress(p))}).catch(()=>{})},{rootMargin:'600px'});storyIO.observe($('historia'));

// Used by scripts/bake-thumbs.mjs to save the thumbnails as static images.
if(new URLSearchParams(location.search).has('bake'))window.__bake=async()=>{
 const t=await thumbnailer(),{SPECIES}=await import('./generated/species.js'),{ERAS}=await import('./content.js');
 const data=url=>fetch(url).then(r=>r.blob()).then(b=>new Promise(res=>{const f=new FileReader();f.onload=()=>res(f.result);f.readAsDataURL(b)}));
 const out={};for(const s of SPECIES)out[s.id]=await data(await t.request(s));
 const para=SPECIES.find(s=>s.id==='parasaurolophus');for(const sex of ['male','female'])out[`parasaurolophus-${sex}`]=await data(await t.request(para,sex));
 const {ERA_ANIMALS}=await import('./sections.js');
 for(const e of ERAS)out[`era-${e.id}`]=await data(await t.eraScene(e.id,(ERA_ANIMALS[e.id]||[]).map(([id,x,z,r])=>[SPECIES.find(s=>s.id===id),x,z,r])));
 return out;
};
