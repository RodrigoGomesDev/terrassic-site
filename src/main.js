import {detectLang,setLang,t} from './i18n.js';
import {links} from './site-config.js';
import {initFilm,initHeader,initMarquee,initStory,initNotebook,initEras,initMechanics,initRoadmap,initInstall,initFaq,initMotion,onScroll,paintEras} from './sections.js';
import {initBestiary} from './bestiary.js';
const $=id=>document.getElementById(id);

// Text first: the page reads correctly before any 3D has loaded.
setLang(detectLang());
initHeader();initMotion();
const {render:renderFilm,listen:filmProgress}=initFilm();
const renders=[renderFilm,initMarquee(),initStory(),initNotebook(),initEras(),initRoadmap(),initInstall(links),initFaq()];

// Three.js is loaded on demand so the copy is never blocked by WebGL.
const three=import('./viewer.js').catch(()=>null);
const thumbnailer=await three.then(m=>{try{const t=m&&new m.Thumbnailer();return t?.renderer?t:null}catch{return null}});
renders.push(initMechanics(thumbnailer));paintEras(thumbnailer);
const viewerReady=three.then(m=>{if(!m)return null;const v=new m.SpecimenViewer($('stage-canvas'));return v.renderer?v:null}).catch(()=>null);
const bestiary=initBestiary({viewerReady,thumbnailer});
const refreshAll=()=>{for(const r of renders)r();bestiary.refresh()};refreshAll();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);refreshAll();heroStatus()});

let heroLoaded=0;const heroStatus=()=>{$('hero-status').textContent=heroLoaded>=1?t('hero.ready'):t('hero.loading')};
const film=document.querySelector('.film');
import('./hero.js').then(({Hero})=>{
 const hero=new Hero($('hero-canvas'),{
  onProgress:p=>{heroLoaded=p;$('hero-meter').style.width=`${p*100}%`;if(p>=1){heroStatus();film.classList.add('is-loaded')}},
  onReady:()=>film.classList.add('is-live'),
  onFail:()=>film.classList.add('no-webgl')});
 if(!hero.renderer)return film.classList.add('no-webgl');
 if(import.meta.env.DEV)window.__hero=hero;
 // The roar is heard only after the visitor turns the sound on (browsers block sound that starts by itself).
 const roar=new Audio(new URL('assets/audio/tyrannosaurus.ogg',document.baseURI).href);roar.preload='none';roar.volume=.9;let sound=false;
 $('hero-sound').addEventListener('click',e=>{sound=!sound;e.currentTarget.setAttribute('aria-pressed',String(sound));if(sound){roar.load();if(hero.rex?.animator.scrubbing){roar.currentTime=0;roar.play().catch(()=>{})}}else roar.pause()});
 hero.onRoar=()=>{if(sound&&hero.visible)setTimeout(()=>{roar.currentTime=0;roar.play().catch(()=>{})},350)};
 filmProgress(p=>hero.setProgress(p));
}).catch(()=>film.classList.add('no-webgl'));
