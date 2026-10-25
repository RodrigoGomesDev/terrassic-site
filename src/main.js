import {detectLang,setLang,t} from './i18n.js';
import {links} from './site-config.js';
import {initHeader,initMarquee,initStory,initNotebook,initEras,initMechanics,initRoadmap,initInstall,initFaq,initMotion,onScroll} from './sections.js';
import {initBestiary} from './bestiary.js';
const $=id=>document.getElementById(id);

// Text first: the page reads correctly before any 3D has loaded.
setLang(detectLang());
initHeader();initMotion();
const renders=[initMarquee(),initStory(),initNotebook(),initEras(),initRoadmap(),initInstall(links),initFaq()];

// Three.js is loaded on demand so the copy is never blocked by WebGL.
const three=import('./viewer.js').catch(()=>null);
const thumbnailer=await three.then(m=>{try{const t=m&&new m.Thumbnailer();return t?.renderer?t:null}catch{return null}});
renders.push(initMechanics(thumbnailer));
const viewerReady=three.then(m=>{if(!m)return null;const v=new m.SpecimenViewer($('stage-canvas'));return v.renderer?v:null}).catch(()=>null);
const bestiary=initBestiary({viewerReady,thumbnailer});
const refreshAll=()=>{for(const r of renders)r();bestiary.refresh()};refreshAll();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);refreshAll();heroStatus()});

let heroLoaded=0;const heroStatus=()=>{$('hero-status').textContent=heroLoaded>=1?t('hero.ready'):t('hero.loading')};
import('./hero.js').then(({Hero})=>{
 const hero=new Hero($('hero-canvas'),{
  onProgress:p=>{heroLoaded=p;$('hero-meter').style.width=`${p*100}%`;if(p>=1){heroStatus();document.querySelector('.hero').classList.add('is-loaded')}},
  onReady:()=>document.querySelector('.hero').classList.add('is-live'),
  onFail:()=>document.querySelector('.hero').classList.add('no-webgl')});
 if(!hero.renderer)return document.querySelector('.hero').classList.add('no-webgl');
 const heroEl=document.querySelector('.hero');onScroll(()=>{const p=Math.min(1,scrollY/heroEl.offsetHeight);hero.setScroll(p);heroEl.style.setProperty('--hero-p',p.toFixed(3))});
}).catch(()=>document.querySelector('.hero').classList.add('no-webgl'));
