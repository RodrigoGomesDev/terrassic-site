// Discord art, drawn in the browser (?bake mode) and saved as PNG by scripts/bake-cards.mjs:
//  - a release card per species (the post that announces a redesigned animal), and
//  - a header banner per channel.
// Style: the background is painted small and enlarged without smoothing (pixels, like the game), in the brand light
// (the purple and orange sunset of the mod's docs/IDENTIDADE.md, colours from its TerrassicPalette). Texts use the
// brand fonts at their native size (Sedimento 8 px, Entalhe 12 px) and are enlarged in whole steps, so they stay as
// crisp as the TERRASSIC sign. The animal is the game model, lit like the site thumbnails.
import {SPECIES} from './generated/species.js';

export const PAL={
 basalt950:'#0E0B0E',basalt900:'#141014',basalt800:'#1C181E',basalt700:'#2A2329',basalt600:'#3A3036',
 stone400:'#8A7C6A',stone300:'#B3A48C',stone200:'#D8CCB2',bone100:'#EFE6D2',
 amber700:'#B9771C',amber600:'#D9952C',amber500:'#F2B544',amber300:'#FFD27A',
 rift500:'#F07A1A',dusk700:'#3A2240',dusk500:'#5E3866',fern400:'#7FAF55',blood500:'#C4473A',sky400:'#8FB4C8',
};

// The Discord server is organised in English (the shared language), with Portuguese and Spanish sections, so the art
// does the same: English labels, the scientific name as the big title (the same in every language) and the
// Portuguese and Spanish names right under it.
const EN={
 group:{predator:'Predator',herbivore:'Herbivore',flyer:'Flyer',water:'Aquatic'},
 diet:{carnivore:'Carnivore',herbivore:'Herbivore',omnivore:'Omnivore',piscivore:'Piscivore'},
 era:{late_cretaceous:'Late Cretaceous',jurassic:'Jurassic'},
 mount:{ride:'Rideable',platform:'Platform saddle',shoulder:'Shoulder pet',none:null},
};
// Chips under the name: type, diet only when it says something new, mount, era.
const chips=s=>[EN.group[s.group],EN.diet[s.diet]!==EN.group[s.group]?EN.diet[s.diet]:null,EN.mount[s.mount],EN.era[s.era]??s.era].filter(Boolean);
const meters=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);

// ---- pixel helpers -------------------------------------------------------------------------------------------------
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`};
function rng(seed){let s=seed>>>0||1;return ()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>14)>>>0)/4294967296))}
const seedOf=str=>[...str].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);

// A text drawn at the font's native pixel size, alpha snapped to on/off, then enlarged `scale` times without smoothing.
// `trimY:false` keeps the full line height, so texts with and without accents line up (the chips).
export function pixelText(text,{font='Sedimento',px=8,scale=4,color=PAL.stone200,shadow=null,spacing=1,trimY=true}={}){
 const probe=canvas(1,1).getContext('2d');probe.font=`${px}px ${font}`;
 // generous room above the baseline: accents (Ã, Õ, É) sit above the capitals and would be cut off
 const chars=[...text],w=Math.ceil(chars.reduce((n,ch)=>n+probe.measureText(ch).width,0)+spacing*(chars.length-1))+2,h=Math.ceil(px*2.2)+4,base=Math.ceil(px*1.5)+2;
 const small=canvas(w,h),g=small.getContext('2d');g.font=`${px}px ${font}`;g.textBaseline='alphabetic';g.fillStyle='#fff';
 let x=1;for(const ch of chars){g.fillText(ch,Math.round(x),base);x+=g.measureText(ch).width+spacing}
 const img=g.getImageData(0,0,w,h),[r,gg,b]=hex(color);
 for(let i=0;i<img.data.length;i+=4){const on=img.data[i+3]>=110;img.data[i]=r;img.data[i+1]=gg;img.data[i+2]=b;img.data[i+3]=on?255:0}
 g.putImageData(img,0,0);
 const off=shadow?1:0,out=canvas((w+off)*scale,(h+off)*scale),o=out.getContext('2d');o.imageSmoothingEnabled=false;
 if(shadow){const sh=canvas(w,h),sg=sh.getContext('2d');sg.drawImage(small,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle=shadow;sg.fillRect(0,0,w,h);o.drawImage(sh,scale,scale,w*scale,h*scale)}
 o.drawImage(small,0,0,w*scale,h*scale);
 return trim(out,trimY);
}
// Cut the empty rows/columns around a drawing (so layout positions mean "where the ink is").
function trim(c,trimY=true){
 const g=c.getContext('2d'),{data,width,height}=g.getImageData(0,0,c.width,c.height);let x0=width,y0=height,x1=-1,y1=-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 if(x1<0)return c;if(!trimY){y0=0;y1=height-1}
 const out=canvas(x1-x0+1,y1-y0+1);out.getContext('2d').drawImage(c,-x0,-y0);return out;
}
// The biggest whole enlargement (from `scales`, largest first) that keeps a text within `maxWidth`.
function fitText(text,opts,maxWidth,scales){for(const scale of scales){const c=pixelText(text,{...opts,scale});if(c.width<=maxWidth)return c}return pixelText(text,{...opts,scale:scales.at(-1)})}

// ---- the brand landscape --------------------------------------------------------------------------------------------
// Sky dithered between posterised steps (stippled like a hand-painted pixel sunset, not a smooth digital gradient —
// an even scanline gradient is the one thing that reads as machine-made at a glance), a low pixel sun, far hills in
// dusk, near ground in basalt. Painted at 1/`px` size.
const BAYER4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]].map(row=>row.map(v=>(v+.5)/16));
export function landscape(width,height,{seed='terrassic',px=8,horizon=.74,sunX=.68,sunR=.17}={}){
 const w=Math.ceil(width/px),h=Math.ceil(height/px),c=canvas(w,h),g=c.getContext('2d'),R=rng(seedOf(seed));
 const stops=[[0,PAL.dusk700],[.38,PAL.dusk500],[.62,'#9A3E4C'],[.82,PAL.rift500],[1,PAL.amber500]],steps=9;
 const sky=t=>{for(let i=1;i<stops.length;i++)if(t<=stops[i][0]){const [a,ca]=stops[i-1],[b,cb]=stops[i];return mix(ca,cb,(t-a)/(b-a))}return stops.at(-1)[1]};
 const hy=Math.round(h*horizon);
 for(let y=0;y<hy;y++){
  const pos=(y/Math.max(1,hy-1))*(steps-1),i=Math.floor(pos),frac=pos-i;
  const a=sky(i/(steps-1)),b=sky(Math.min(i+1,steps-1)/(steps-1));
  for(let x=0;x<w;x++){g.fillStyle=frac>BAYER4[y&3][x&3]?b:a;g.fillRect(x,y,1,1)}
 }
 // the sun: two rings, sitting on the horizon
 const cx=Math.round(w*sunX),cy=hy-Math.round(h*sunR*.35),r=Math.round(h*sunR);
 for(const [rr,col] of [[r,PAL.amber500],[Math.round(r*.72),PAL.amber300]])for(let y=-rr;y<=rr;y++)for(let x=-rr;x<=rr;x++)if(x*x+y*y<=rr*rr&&cy+y<hy){g.fillStyle=col;g.fillRect(cx+x,cy+y,1,1)}
 // far hills (dusk) and a near ridge (basalt), stepped like blocks
 const ridge=(base,amp,step,col)=>{g.fillStyle=col;let y=base;for(let x=0;x<w;x+=step){y=Math.max(base-amp,Math.min(base+amp,y+Math.round((R()-.5)*amp)));g.fillRect(x,y,step,h-y)}};
 ridge(hy-Math.round(h*.05),Math.max(2,Math.round(h*.05)),2,mix(PAL.dusk500,PAL.dusk700,.55));
 ridge(hy+1,Math.max(1,Math.round(h*.025)),3,PAL.basalt700);
 g.fillStyle=PAL.basalt800;g.fillRect(0,hy+Math.round(h*.06),w,h);
 const out=canvas(width,height),o=out.getContext('2d');o.imageSmoothingEnabled=false;o.drawImage(c,0,0,w*px,h*px);
 return {canvas:out,groundY:(hy+1)*px};
}

// Where the opaque pixels of a render are (the animal, without the empty margin).
function inkBox(c){
 const {data,width,height}=c.getContext('2d').getImageData(0,0,c.width,c.height);let x0=width,y0=height,x1=-1,y1=-1;
 for(let y=0;y<height;y+=2)for(let x=0;x<width;x+=2)if(data[(y*width+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 return x1<0?{x:0,y:0,w:width,h:height}:{x:x0,y:y0,w:x1-x0+2,h:y1-y0+2};
}
// The animal standing on the ground line: scaled to fit `box`, feet on `groundY`, with a pixel shadow under it.
function stand(g,render,{cx,groundY,maxW,maxH,shadow=true}){
 const ink=inkBox(render),k=Math.min(maxW/ink.w,maxH/ink.h),w=ink.w*k,h=ink.h*k,x=cx-w/2,y=groundY-h+h*.04;
 if(shadow){const sw=Math.round(w*.42),sh=Math.max(2,Math.round(h*.035)),p=6,sc=canvas(sw*2/p,sh*2/p),sg=sc.getContext('2d');
  sg.fillStyle='rgba(14,11,14,.55)';sg.beginPath();sg.ellipse(sc.width/2,sc.height/2,sc.width/2,sc.height/2,0,0,Math.PI*2);sg.fill();
  g.imageSmoothingEnabled=false;g.drawImage(sc,cx-sw,groundY-sh*.6,sw*2,sh*2)}
 g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(render,ink.x,ink.y,ink.w,ink.h,x,y,w,h);
 return {x,y,w,h};
}
// A flat silhouette of the render (for the scale figure).
function silhouette(render,color){const ink=inkBox(render),c=canvas(ink.w,ink.h),g=c.getContext('2d');g.drawImage(render,ink.x,ink.y,ink.w,ink.h,0,0,ink.w,ink.h);g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c}

// A blocky player, 1.8 blocks tall at `s` pixels per block (head, body, legs).
function player(g,x,baseY,s,color){
 g.fillStyle=color;const u=s/8;// 1 block = 8 "texture pixels"
 g.fillRect(x+2*u,baseY-14.4*u,4*u,4*u);// head
 g.fillRect(x+2*u,baseY-10.4*u,4*u,5.2*u);g.fillRect(x+.6*u,baseY-10.4*u,1.4*u,4.6*u);g.fillRect(x+6*u,baseY-10.4*u,1.4*u,4.6*u);// body, arms
 g.fillRect(x+2*u,baseY-5.2*u,1.9*u,5.2*u);g.fillRect(x+4.1*u,baseY-5.2*u,1.9*u,5.2*u);// legs
 return 8*u;
}
function loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
function chip(text){const t=pixelText(text,{scale:3,color:PAL.stone200,trimY:false}),px=16,py=4,c=canvas(t.width+px*2,t.height+py*2),g=c.getContext('2d');
 g.fillStyle='rgba(28,24,30,.86)';g.fillRect(0,0,c.width,c.height);g.fillStyle=PAL.amber700;for(const [x,y,w,h] of [[0,0,c.width,3],[0,c.height-3,c.width,3],[0,0,3,c.height],[c.width-3,0,3,c.height]])g.fillRect(x,y,w,h);
 g.drawImage(t,px,py+3);return c}

async function fonts(){await Promise.all(['12px Entalhe','8px Sedimento'].map(f=>document.fonts.load(f)));await document.fonts.ready}

// ---- the release card --------------------------------------------------------------------------------------------
// 1600 x 900: landscape, the animal on the right, the name and its real scale on the left.
export async function speciesCard(thumbnailer,species,{width=1600,height=900,sex='male',label='NEW IN TERRASSIC',site='terrassic.vercel.app/wiki',logo}={}){
 await fonts();
 const out=canvas(width,height),g=out.getContext('2d');
 const land=landscape(width,height,{seed:species.id,sunX:.66});g.drawImage(land.canvas,0,0);
 // left shade, so the text always reads over the sky
 const shade=g.createLinearGradient(0,0,width*.62,0);shade.addColorStop(0,'rgba(20,16,20,.88)');shade.addColorStop(.55,'rgba(20,16,20,.55)');shade.addColorStop(1,'rgba(20,16,20,0)');
 g.fillStyle=shade;g.fillRect(0,0,width,height);
 const render=await thumbnailer.still(species,{width:1500,height:1000,sex});
 stand(g,render,{cx:width*.72,groundY:land.groundY+18,maxW:width*.52,maxH:height*.6});

 const left=84;let y=96;
 const lab=pixelText(label,{scale:3,color:PAL.amber500,spacing:2});g.drawImage(lab,left,y);y+=lab.height+34;
 const name=fitText(species.name.en.toLocaleUpperCase('en-US'),{font:'Entalhe',px:12,color:PAL.bone100,shadow:PAL.basalt950},width*.5,[8,7,6,5,4]);
 g.drawImage(name,left,y);y+=name.height+22;
 const sci=pixelText([...new Set([species.name.pt,species.name.es])].join(' · '),{scale:4,color:PAL.stone300});g.drawImage(sci,left,y);y+=sci.height+40;
 let x=left;for(const text of chips(species)){const c=chip(text);if(x+c.width>width*.52){x=left;y+=c.height+12}g.drawImage(c,x,y);x+=c.width+14}
 y+=chip('X').height+44;

 // the real scale: a player next to the animal's silhouette, both at the same pixels per block
 const tall=species.hitbox?.[1]??2,figH=150,s=Math.min(figH/Math.max(tall,1.8),60),base=Math.min(y+figH,height-150);
 const pw=player(g,left,base,s,PAL.stone300);
 const sil=silhouette(render,PAL.amber500),k=(tall*s)/sil.height;g.imageSmoothingEnabled=true;g.drawImage(sil,left+pw+28,base-sil.height*k,sil.width*k,sil.height*k);
 g.fillStyle=PAL.basalt600;g.fillRect(left-8,base,Math.max(pw+28+sil.width*k+16,420),3);
 const cap=pixelText(`${meters(species.length)} m long · ${meters(tall)} m tall`,{scale:3,color:PAL.stone200});
 g.drawImage(cap,left,base+18);
 const unit=pixelText('1 block · 1 bloco · 1 bloque = 1 m',{scale:2,color:PAL.stone400});g.drawImage(unit,left,base+18+cap.height+12);

 // footer: the sign and the address
 if(logo){const lh=46,lw=logo.width*lh/logo.height;g.imageSmoothingEnabled=false;g.drawImage(logo,left,height-lh-44,lw,lh)}
 const url=pixelText(site,{scale:3,color:PAL.stone400});g.drawImage(url,width-url.width-60,height-url.height-56);
 return out;
}

// ---- channel banners ------------------------------------------------------------------------------------------------
// A wide header for the top of a channel: the title in Entalhe, a line in Sedimento and one to three animals.
export async function channelBanner(thumbnailer,{title,subtitle='',species=[],width=1920,height=480,seed,logo}={}){
 await fonts();
 const out=canvas(width,height),g=out.getContext('2d');
 const land=landscape(width,height,{seed:seed||title,horizon:.78,sunX:.74,sunR:.24});g.drawImage(land.canvas,0,0);
 const shade=g.createLinearGradient(0,0,width*.6,0);shade.addColorStop(0,'rgba(20,16,20,.82)');shade.addColorStop(.6,'rgba(20,16,20,.35)');shade.addColorStop(1,'rgba(20,16,20,0)');
 g.fillStyle=shade;g.fillRect(0,0,width,height);
 // cx, height share, width share — kept clear of the text block (width*.46) on the left and the canvas edge on the
 // right (cx + mw/2 never passes .96), so no creature overlaps the title or gets its tail clipped off.
 const list=species.map(id=>SPECIES.find(s=>s.id===id)).filter(Boolean),slots=[[.66,.62,.32],[.87,.4,.18],[.5,.28,.14]];
 // biggest first, behind; smaller ones in front
 const renders=await Promise.all(list.map(s=>thumbnailer.still(s,{width:1100,height:740}).then(r=>({s,r}))));
 renders.sort((a,b)=>(b.s.hitbox?.[1]??0)-(a.s.hitbox?.[1]??0)).forEach(({r},i)=>{const [cx,hk,mw]=slots[i]||slots[0];stand(g,r,{cx:width*cx,groundY:land.groundY+10,maxW:width*mw,maxH:height*hk*1.2})});
 const left=Math.round(height*.17);
 const t=fitText(title.toLocaleUpperCase('en-US'),{font:'Entalhe',px:12,color:PAL.bone100,shadow:PAL.basalt950},width*.46,[10,9,8,7,6,5]);
 const sub=subtitle?fitText(subtitle,{color:PAL.amber500},width*.44,[4,3]):null;
 const block=t.height+(sub?sub.height+26:0);let y=Math.round((height-block)/2)-10;
 g.drawImage(t,left,y);y+=t.height+26;if(sub)g.drawImage(sub,left,y);
 if(logo){const lh=34,lw=logo.width*lh/logo.height;g.imageSmoothingEnabled=false;g.drawImage(logo,width-lw-40,30,lw,lh)}
 return out;
}

export const loadLogo=url=>loadImage(url);

// One header per channel that shows information (Discord has no channel banner: big servers post a 4:1 image at the
// top of each read-only channel). Only animals with the new model; change the list when channels change.
// Keys are the channel names of the Discord server (English base); the subtitle carries Portuguese and Spanish.
export const BANNERS=[
 {key:'welcome',title:'Welcome',subtitle:'Boas-vindas · Bienvenida',species:['tyrannosaurus','velociraptor']},
 {key:'rules',title:'Rules',subtitle:'Regras · Reglas',species:['triceratops']},
 {key:'links',title:'Links',subtitle:'Download · Wiki · Site',species:['pteranodon']},
 {key:'faq',title:'FAQ',subtitle:'Dúvidas frequentes · Preguntas frecuentes',species:['protoceratops']},
 {key:'announcements',title:'Announcements',subtitle:'Anúncios · Anuncios',species:['giganotosaurus','tyrannosaurus']},
 {key:'devlog',title:'Devlog',subtitle:'Diário de desenvolvimento · Diario de desarrollo',species:['carnotaurus']},
 {key:'new-species',title:'New species',subtitle:'Novas espécies · Nuevas especies',species:['parasaurolophus','gallimimus']},
 {key:'builds',title:'Builds',subtitle:'Versões novas · Nuevas versiones',species:['ankylosaurus']},
 {key:'support',title:'Support',subtitle:'Suporte · Soporte',species:['spinosaurus']},
 {key:'bug-reports',title:'Bug reports',subtitle:'Relatos de bug · Reportes de errores',species:['pachycephalosaurus']},
 {key:'suggestions',title:'Suggestions',subtitle:'Sugestões · Sugerencias',species:['velociraptor']},
 {key:'screenshots',title:'Screenshots',subtitle:'Capturas de tela · Capturas de pantalla',species:['tyrannosaurus','triceratops']},
 {key:'fan-art',title:'Fan art',subtitle:'Arte dos fãs · Arte de fans',species:['gallimimus']},
 {key:'test-builds',title:'Field lab',subtitle:'Laboratório de campo · Laboratorio de campo',species:['protoceratops','velociraptor']},
];
