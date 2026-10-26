import {SPRITES} from './generated/species.js';
import {assetUrl} from './assets.js';
// Sprites come from one atlas of 32 px cells (spawn eggs, items, egg blocks) built by scripts/import-mod.py.
export function paintSprite(el,key,size=32){
 const i=SPRITES.index[key];if(i===undefined){el.hidden=true;return el}
 const s=size/SPRITES.cell;
 Object.assign(el.style,{width:`${size}px`,height:`${size}px`,backgroundImage:`url(${assetUrl('sprites.png')})`,backgroundSize:`${SPRITES.cols*SPRITES.cell*s}px ${SPRITES.rows*SPRITES.cell*s}px`,backgroundPosition:`-${(i%SPRITES.cols)*size}px -${Math.floor(i/SPRITES.cols)*size}px`});
 return el;
}
export const sprite=(key,size)=>{const el=document.createElement('span');el.className='sprite';el.setAttribute('aria-hidden','true');return paintSprite(el,key,size)};
