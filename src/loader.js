// One loading screen for the whole site: it stays up until the fonts, the T. rex of the opening (first frame drawn),
// the story's meteor and every baked picture are ready, so nothing pops in or stutters afterwards. It never blocks
// for good: after a time limit the site opens with whatever has arrived.
// The progress is a block of Temporal Amber lighting up one row of its 16 pixels at a time; the line under it says
// what is still on its way (loader.<job> in i18n.js). At the end the amber floods the screen into the opening's sky.
import {t} from './i18n.js';
const LIMIT=15000,ROWS=16;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createLoader(){
 const screen=document.getElementById('loader'),amber=document.getElementById('loader-amber'),pct=document.getElementById('loader-pct'),text=document.getElementById('loader-text');
 const jobs=new Map();let finished=false,open;
 const ready=new Promise(r=>{open=r});
 // Embers drifting up, each with its own place, pace and sway.
 for(const m of screen.querySelectorAll('.loader-motes i'))for(const [k,v] of [['left',`${4+Math.random()*92}%`],['--d',`${7+Math.random()*7}s`],['--delay',`${-Math.random()*12}s`],['--drift',`${(Math.random()-.5)*60}px`]])m.style.setProperty(k,v);
 const say=key=>{const s=t(key);if(text.textContent!==s)text.textContent=s};
 const paint=()=>{
  let sum=0,w=0;for(const j of jobs.values()){sum+=j.p*j.weight;w+=j.weight}
  const p=w?sum/w:0;screen.style.setProperty('--rows',Math.floor(p*ROWS));pct.textContent=`${Math.round(p*100)}%`;
  const waiting=[...jobs].find(([,j])=>j.p<1);say(waiting?`loader.${waiting[0]}`:'loader.done');
  if(!finished&&w&&!waiting)finish();
 };
 const finish=()=>{
  if(finished)return;finished=true;screen.style.setProperty('--rows',ROWS);pct.textContent='100%';say('loader.done');
  const lift=()=>{screen.classList.add('is-done');document.documentElement.classList.remove('is-loading');open();setTimeout(()=>screen.remove(),600)};
  if(reduced)return setTimeout(lift,150);
  // A beat on the full block, then its light floods out from where it sits.
  const r=amber.getBoundingClientRect();screen.style.setProperty('--fx',`${r.left+r.width/2}px`);screen.style.setProperty('--fy',`${r.top+r.height/2}px`);
  setTimeout(()=>{screen.classList.add('is-flooding');setTimeout(lift,800)},350);
 };
 setTimeout(finish,LIMIT);
 return {
  ready,
  // track(name, weight) gives a job whose progress goes from 0 to 1; it is done at 1 (or when it fails).
  track(name,weight=1){const j={p:0,weight};jobs.set(name,j);paint();return {set:p=>{j.p=Math.max(j.p,Math.min(1,p));paint()},done:()=>{j.p=1;paint()}}},
  // wait(name, weight, promise): a job that is done when the promise settles, whatever the result.
  wait(name,weight,promise){const j=this.track(name,weight);Promise.resolve(promise).catch(()=>{}).finally(j.done);return promise},
 };
}
// Waits until an image has arrived in the browser cache (or failed), without keeping it.
export const preloadImage=src=>new Promise(r=>{const i=new Image();i.onload=i.onerror=()=>r();i.src=src});
