// The bite that closes the opening: the T. rex's jaws in pixel art, seen from inside the mouth.
// Both jaws are drawn once into offscreen canvases at 1 art pixel = PX screen pixels; every frame only places them,
// stretches the drool between the fangs and shakes the frame when the teeth meet.
const PX=4;
const C={skin:['#2d241c','#3a2f25','#4a3b2c','#6a553b'],palate:['#1a0c0e','#2a1214','#3a181a','#4e2224'],gum:['#4a1618','#6e2420','#8e342a','#b04a38'],
 tongue:['#5a1e22','#7a2c2c','#9a3e38','#b85a4a'],tooth:['#5e5244','#8a7c6a','#b9a785','#d8ccb2','#efe6d2','#fffaf0'],stain:'#a38a5c',drool:'rgba(239,230,210,.55)'};
function rnd(seed){return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}
const px=(g,x,y,c)=>{g.fillStyle=c;g.fillRect(x,y,1,1)};

// One jaw, upper orientation: skin at the top, then the palate with its ridges, the gum line along an arch, fangs below it.
// Returns the gum line per column and the tooth list, used for the drool.
function drawJaw(g,w,h,seed,{lower=false}={}){
 const r=rnd(seed),edge=Math.round(h*.62),arch=Math.round(h*.12);
 const gum=x=>edge-Math.round(arch*(1-Math.pow((x/w)*2-1,2)));
 g.clearRect(0,0,w,h);
 for(let x=0;x<w;x++){
  const e=gum(x);
  // Skin of the snout at the very top, mottled like the model's texture, shading into the palate.
  for(let y=0;y<e-6;y++){
   const t=y/(e-6),n=(Math.sin(x*1.7+y*.9)+Math.sin(x*.37-y*1.3))*.5;
   const pal=t<.35?C.skin:C.palate,k=Math.max(0,Math.min(3,Math.floor((t<.35?t/.35:(t-.35)/.65)*3.2+n*.7)));
   px(g,x,y,pal[k]);
  }
  // Ridges of the palate (or the tongue on the lower jaw), curving with the arch.
  for(let k=1;k<4;k++){const y=e-6-k*Math.round(h*.07)+Math.round(Math.sin(x*.08+k)*1.5);if(y>0&&(x+k*3)%9<6)px(g,x,y,(lower?C.tongue:C.palate)[3])}
  // The gum: a lit top row, a body and a dark row under it.
  for(let y=e-6;y<e;y++)px(g,x,y,C.gum[y===e-6?3:y===e-1?0:y<e-3?2:1]);
 }
 if(lower){
  // The tongue, filling the middle of the lower jaw behind the teeth.
  const cx=w/2,tw=w*.34,th=h*.38;
  for(let y=0;y<th;y++)for(let x=Math.floor(cx-tw);x<cx+tw;x++){
   const dx=(x-cx)/tw,dy=(th-y)/th;if(dx*dx+dy*dy*1.4>1)continue;
   const k=Math.max(0,Math.min(3,Math.floor((1-dy)*3+(Math.abs(dx)<.08?-1:0)+(x+y)%7/7)));
   const yy=Math.round(gum(x)-8-y*.9);if(yy>0)px(g,x,yy,C.tongue[k]);
  }
 }
 // Fangs, biggest at the front (middle of the screen), each curved slightly back towards the corner it sits in.
 const teeth=[];let x=1+Math.floor(r()*3);
 while(x<w-2){
  const front=1-Math.abs(x/w*2-1),wd=Math.round(4+front*5+r()*2),len=Math.round(10+front*22+r()*6),lean=(x/w-.5)*.45;
  const e=gum(x+wd/2)-1;teeth.push([x+wd/2,e+len]);
  for(let i=0;i<len;i++){
   const t=i/len,half=Math.max(.6,wd/2*(1-Math.pow(t,1.6)*.95)),cx=x+wd/2+lean*i*i/len;
   const left=Math.floor(cx-half),right=Math.ceil(cx+half)-1;
   for(let dx=left;dx<=right;dx++){
    const u=(dx-left)/Math.max(1,right-left);
    let c=C.tooth[u<.2?5:u<.45?4:u<.75?3:2];
    if(i<3)c=i===0?C.gum[0]:C.stain;                              // the root, stained where it meets the gum
    if(dx===right||(i===len-1))c=C.tooth[1];                       // shadow edge
    if(dx===right&&i%3===1&&i>3)c=C.tooth[0];                      // serrations on the back edge
    if(i>=len-2&&u>.3)c=C.tooth[4];
    px(g,dx,e+i,c);
   }
  }
  x+=wd+1+Math.round(r()*2+(1-front)*2);
 }
 return {gum,teeth};
}

export function initBite(host,stage){
 const view=document.createElement('canvas');view.className='bite';host.replaceChildren(view);
 const g=view.getContext('2d');let top,bottom,info,w,h;
 const build=()=>{
  w=Math.ceil(innerWidth/PX);h=Math.ceil(innerHeight/PX);view.width=w;view.height=h;
  const jh=Math.ceil(h*.62);top=document.createElement('canvas');bottom=document.createElement('canvas');top.width=bottom.width=w;top.height=bottom.height=jh;
  info={top:drawJaw(top.getContext('2d'),w,jh,1203),bottom:drawJaw(bottom.getContext('2d'),w,jh,66,{lower:true}),jh};
 };
 build();addEventListener('resize',build);
 return k=>{
  host.style.opacity=k>0?1:0;if(k<=0){stage.style.transform='';return}
  // Slow at first, then the jaws snap shut; they overlap a little when closed, like a real bite.
  const e=k<.7?.55*Math.pow(k/.7,2):.55+.45*(1-Math.pow(1-(k-.7)/.3,3)),jh=info.jh;
  const ty=Math.round(-jh+e*(h*.5+jh*.24)),by=Math.round(h-(-jh+e*(h*.5+jh*.24))-jh);
  g.clearRect(0,0,w,h);g.fillStyle=`rgba(14,11,14,${(e*e*.9).toFixed(3)})`;g.fillRect(0,0,w,h);
  // Drool strands between the fangs once the jaws are close: a sagging line that thins out as they meet.
  const gap=by-(ty+jh)+jh*.5;
  if(e>.45&&gap>2){g.fillStyle=C.drool;for(const [i,[tx,tip]] of info.top.teeth.entries()){if(i%5!==2)continue;const y0=ty+tip,y1=Math.round(by+jh-info.bottom.gum(Math.round(tx))+6);if(y1-y0<3)continue;const sag=2+Math.sin(i*1.7)*3;for(let y=y0;y<y1;y++){const t=(y-y0)/(y1-y0);if(e>.9&&t>.35&&t<.65)continue;g.fillRect(Math.round(tx+Math.sin(t*Math.PI)*sag),y,1,1)}}}
  g.drawImage(top,0,ty);g.save();g.translate(0,by+jh);g.scale(1,-1);g.drawImage(bottom,0,0);g.restore();
  // Shake on impact.
  const hit=k>.94?Math.sin(k*900)*(1-k)*60:0;stage.style.transform=hit?`translate(${hit.toFixed(1)}px,${(hit*.6).toFixed(1)}px)`:'';
 };
}
