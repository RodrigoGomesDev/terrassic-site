// In-page links (header, buttons, skip link): the browser scrolls (smoothly unless the visitor asked for less motion,
// see html{scroll-behavior} in the CSS) and focus moves to the target. prepare(target) runs first (the wiki opens a
// closed entry there); the returned go(target) does the same from code.
export function initAnchors({prepare=()=>{}}={}){
 const go=target=>{
  target.scrollIntoView({block:'start'});
  if(!target.matches('a,button,input,select,textarea,[tabindex]'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 };
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const target=a.hash.length>1&&document.getElementById(decodeURIComponent(a.hash.slice(1)));if(!target)return;
  e.preventDefault();if(location.hash!==a.hash)history.pushState(null,'',a.hash);prepare(target);go(target);
 });
 return go;
}
