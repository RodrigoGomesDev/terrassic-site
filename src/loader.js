// One loading screen for the whole site: it stays up until the fonts, the T. rex of the opening (first frame drawn),
// the story's meteor and every baked picture are ready, so nothing pops in or stutters afterwards. It never blocks
// for good: after a time limit the site opens with whatever has arrived.
// The title, carved in dark stone exactly where the opening shows it, lights up from left to right as things arrive;
// the line under it says what is still on its way (loader.<job> in i18n.js). At the end the amber sky floods in
// around the title and the screen fades onto the opening, the same title in the same place.
import {t} from './i18n.js';
const LIMIT=15000;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createLoader(){
 const screen=document.getElementById('loader'),title=document.getElementById('loader-title'),pct=document.getElementById('loader-pct'),text=document.getElementById('loader-text');
 const jobs=new Map();let finished=false,closing=false,open,target=0,shown=0;
 const ready=new Promise(r=>{open=r});
 // Embers drifting up from the Rift on the horizon, each with its own size, place, pace and sway.
 for(const m of screen.querySelectorAll('.loader-motes i')){const r=Math.random();
  for(const [k,v] of [['left',`${2+Math.random()*96}%`],['--s',`${2+Math.round(r*r*4)}px`],['--o',`${.35+r*.65}`],['--d',`${6+Math.random()*9}s`],['--delay',`${-Math.random()*14}s`],['--drift',`${(Math.random()-.5)*80}px`]])m.style.setProperty(k,v)}
 // Sit on the opening's title, so the hand-over is seamless (centred if the page is not at its top).
 const place=()=>{const r=document.querySelector('.film-word img')?.getBoundingClientRect();
  const ok=r&&r.width>0&&r.top>=0&&r.bottom<=innerHeight;title.classList.toggle('is-placed',!!ok);
  Object.assign(title.style,ok?{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`}:{left:'',top:'',width:''});
  const b=title.getBoundingClientRect();screen.style.setProperty('--line-top',`${b.bottom+Math.max(20,b.height*.18)}px`);screen.style.setProperty('--ty',`${(b.top+b.height/2)/innerHeight*100}%`)};
 place();addEventListener('resize',place);document.querySelector('.film-word img')?.addEventListener('load',place,{once:true});
 const say=key=>{const s=t(key);if(text.textContent!==s)text.textContent=s};
 const update=()=>{
  let sum=0,w=0;for(const j of jobs.values()){sum+=j.p*j.weight;w+=j.weight}
  target=w?sum/w:0;const waiting=[...jobs].find(([,j])=>j.p<1);say(waiting?`loader.${waiting[0]}`:'loader.done');
  if(!finished&&w&&!waiting)finished=true;
 };
 // The light moves smoothly towards the real progress (never faster than a full sweep in about a second, and in
 // steps of the title's own pixels), so a fast load still reads and a slow one never sits still.
 let last=performance.now();
 const tick=now=>{if(closing)return;const dt=Math.min(.1,(now-last)/1000);last=now;
  const goal=finished?1:target;shown=reduced?goal:Math.min(goal,shown+Math.max(.05,(goal-shown)*3.5)*dt);
  screen.style.setProperty('--p',(Math.floor(shown*120)/120).toFixed(4));pct.textContent=`${Math.round(shown*100)}%`;
  if(finished&&shown>=1)close();else requestAnimationFrame(tick)};
 requestAnimationFrame(tick);
 const close=()=>{
  closing=true;screen.style.setProperty('--p',1);pct.textContent='100%';say('loader.done');
  const lift=()=>{screen.classList.add('is-done');document.documentElement.classList.remove('is-loading');open();setTimeout(()=>screen.remove(),700)};
  if(reduced)return setTimeout(lift,150);
  // A beat on the lit title, then the amber floods out from it and the screen lifts onto the opening.
  const r=title.getBoundingClientRect();screen.style.setProperty('--fx',`${r.left+r.width/2}px`);screen.style.setProperty('--fy',`${r.top+r.height/2}px`);
  setTimeout(()=>{screen.classList.add('is-flooding');setTimeout(lift,950)},300);
 };
 setTimeout(()=>{finished=true},LIMIT);
 return {
  ready,
  // track(name, weight) gives a job whose progress goes from 0 to 1; it is done at 1 (or when it fails).
  track(name,weight=1){const j={p:0,weight};jobs.set(name,j);update();return {set:p=>{j.p=Math.max(j.p,Math.min(1,p));update()},done:()=>{j.p=1;update()}}},
  // wait(name, weight, promise): a job that is done when the promise settles, whatever the result.
  wait(name,weight,promise){const j=this.track(name,weight);Promise.resolve(promise).catch(()=>{}).finally(j.done);return promise},
 };
}
// Waits until an image has arrived in the browser cache (or failed), without keeping it.
export const preloadImage=src=>new Promise(r=>{const i=new Image();i.onload=i.onerror=()=>r();i.src=src});
