import {assetUrl} from './rig.js';
// Thumbnails are baked into static images (scripts/bake-thumbs.mjs). If one is missing, it is rendered in the browser.
export function picture(name,render){
 return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img.src);img.onerror=()=>resolve(null);img.src=assetUrl(`thumbs/${name}.webp`)})
  .then(url=>url||render?.()||Promise.reject(new Error(`no picture: ${name}`)));
}
// The renderer for missing pictures is created only when one is needed.
let thumbnailer=null;
export function lazyThumbnailer(load){return ()=>thumbnailer??=load().then(m=>{const t=new m.Thumbnailer();return t.renderer?t:Promise.reject(new Error('webgl'))})}
