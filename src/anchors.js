// In-page links (header, buttons, skip link): an eased glide instead of the browser's jump. A far target, across the
// pinned film, story and eras, would race through every scene, so the page dips to dark under the header, cuts to
// just before it and glides the last stretch. Any wheel, touch or key from the visitor stops it. prepare(target) runs
// first (the wiki opens a closed entry there); the returned go(target) glides from code.
export function initAnchors({prepare=()=>{}}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const curtain=document.createElement('div');curtain.className='curtain';curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
 const ease=x=>x<.5?4*x*x*x:1-(-2*x+2)**3/2,wait=ms=>new Promise(r=>setTimeout(r,ms));
 // After the cut the scenes there may wake up (3D, pictures); the dark stays until frames are quick again.
 const settle=()=>new Promise(done=>{const t0=performance.now();let last=t0,calm=0;
  const f=now=>{calm=now-last<34?calm+1:0;last=now;calm>=3||now-t0>700?done():requestAnimationFrame(f)};requestAnimationFrame(f)});
 let job=0;const stop=()=>{job++;curtain.classList.remove('is-on')};
 for(const ev of ['wheel','touchstart','keydown'])addEventListener(ev,stop,{passive:true});
 // Time advances at most one short frame per frame, so a slow frame delays the glide instead of skipping ahead.
 const glide=(to,ms,id)=>new Promise(done=>{const from=scrollY;let last=performance.now(),t=0;
  const step=now=>{if(id!==job)return done(false);t+=Math.min(34,now-last);last=now;const k=Math.min(1,t/ms);scrollTo({top:from+(to-from)*ease(k),behavior:'instant'});k<1?requestAnimationFrame(step):done(true)};
  requestAnimationFrame(step)});
 const go=async target=>{
  const id=++job,top=()=>Math.max(0,target.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(target).scrollMarginTop)||0));
  let to=top(),dist=Math.abs(to-scrollY);
  if(reduced)scrollTo({top:to,behavior:'instant'});
  else{
   if(dist>innerHeight*2.5){
    curtain.classList.add('is-on');await wait(220);if(id!==job)return;
    scrollTo({top:to-Math.sign(to-scrollY)*innerHeight*.6,behavior:'instant'});await settle();if(id!==job)return;curtain.classList.remove('is-on');
    to=top();dist=Math.abs(to-scrollY);
   }
   if(!await glide(to,450+350*Math.min(1,dist/(innerHeight*2.5)),id))return;
  }
  if(!target.matches('a,button,input,select,textarea,[tabindex]'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 };
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const target=a.hash.length>1&&document.getElementById(decodeURIComponent(a.hash.slice(1)));if(!target)return;
  e.preventDefault();if(location.hash!==a.hash)history.pushState(null,'',a.hash);prepare(target);go(target);
 });
 return go;
}
