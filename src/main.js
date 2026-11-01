import {detectLang,setLang} from './i18n.js';
import {links,story,models} from './site-config.js';
import {initAnchors} from './anchors.js';
import {initHeader,initStory,initNotebook,initEras,initMechanics,initInstall,initFaq,paintEras} from './sections.js';
import {initBestiary} from './bestiary.js';
import {lazyThumbnailer} from './pictures.js';
import {SPECIES} from './generated/species.js';
const $=id=>document.getElementById(id);

// The text is on the page from the start; pictures and 3D come in after it, without a loading screen.
setLang(detectLang());
// Story mode is off in the mod: the story sequence and the notebook give way to one "coming soon" block.
if(!story){$('historia').hidden=true;$('cronica').hidden=true;$('historia-em-breve').hidden=false;
 for(const a of document.querySelectorAll('a[href="#historia"]'))a.setAttribute('href','#historia-em-breve');}
for(const b of document.querySelectorAll('[data-story-soon]'))b.hidden=story;
initHeader();initAnchors();
const renders=[initEras(),initInstall(links),initFaq()];
const storyRender=story?initStory():null;if(story)renders.push(storyRender,initNotebook());

// Three.js only loads when a 3D scene is about to be seen.
let three=null;const loadThree=()=>three??=import('./viewer.js').catch(()=>null);
const thumbnailer=lazyThumbnailer(()=>loadThree().then(m=>m||Promise.reject(new Error('three'))));
renders.push(initMechanics(thumbnailer));paintEras(thumbnailer);
const near=(el,margin='400px')=>new Promise(r=>{const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){io.disconnect();r()}},{rootMargin:margin});io.observe(el)});
const viewerReady=near($('stage')).then(loadThree).then(m=>{if(!m)return null;const v=new m.SpecimenViewer($('stage-canvas'));return v.renderer?v:null}).catch(()=>null);
const bestiary=initBestiary({viewerReady,thumbnailer});
const refreshAll=()=>{for(const r of renders)r();bestiary.refresh()};refreshAll();
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{setLang(b.dataset.lang);refreshAll()});

// The opening shows the most recent finished animal. Without 3D, its baked picture stands in the same place.
const hero=SPECIES.find(s=>s.id===models.ready.at(-1));
const heroBox=$('hero-canvas');
const still=()=>{if(hero)heroBox.style.backgroundImage=`url(${new URL(`assets/thumbs/${hero.id}.webp`,document.baseURI).href})`;heroBox.classList.add('is-still')};
if(!hero)heroBox.hidden=true;
else{const start=()=>import('./hero.js').then(({Hero})=>{const h=new Hero(heroBox,hero,{onReady:()=>heroBox.classList.add('is-live'),onFail:still});if(import.meta.env.DEV)window.__hero=h;if(!h.renderer)still()}).catch(still);
 // After the page has painted its text, so the 3D never holds it back.
 if(document.readyState==='complete')requestAnimationFrame(start);else addEventListener('load',start,{once:true});}

// The story's meteor is loaded only when the story comes near.
if(story)near($('historia'),'600px').then(()=>import('./storyfx.js')).then(({StoryMeteor})=>{const fx=new StoryMeteor($('story-meteor'));if(fx.renderer)storyRender.listen(p=>fx.setProgress(p))}).catch(()=>{});

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
