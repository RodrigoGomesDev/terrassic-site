// One loading screen for the whole site: it stays up until the fonts, the T. rex of the opening (first frame drawn),
// the story's meteor and every baked picture are ready, so nothing pops in or stutters afterwards. It never blocks
// for good: after a time limit the site opens with whatever has arrived.
const LIMIT=15000;
export function createLoader(){
 const screen=document.getElementById('loader'),bar=document.getElementById('loader-bar'),pct=document.getElementById('loader-pct');
 const jobs=new Map();let finished=false,open;
 const ready=new Promise(r=>{open=r});
 const paint=()=>{
  let sum=0,w=0;for(const j of jobs.values()){sum+=j.p*j.weight;w+=j.weight}
  const p=w?sum/w:0,cells=Math.round(p*20);
  bar.style.setProperty('--cells',cells);pct.textContent=`${Math.round(p*100)}%`;
  if(!finished&&w&&[...jobs.values()].every(j=>j.p>=1))finish();
 };
 const finish=()=>{
  if(finished)return;finished=true;bar.style.setProperty('--cells',20);pct.textContent='100%';
  // A short beat on the full bar, then the screen lifts.
  setTimeout(()=>{screen.classList.add('is-done');document.documentElement.classList.remove('is-loading');open();setTimeout(()=>screen.remove(),700)},250);
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
