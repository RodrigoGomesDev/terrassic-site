// The bite that closes the opening, in the look of the game: big pixels, a few chunky stepped fangs and noisy
// mob-style skin on the jaws. Both jaws are drawn once into offscreen canvases; every frame only places
// them and shakes the scene when the teeth meet.
const C={gum:['#5a1e1c','#8e342a','#b04a38'],inside:'#140a0c',tooth:['#8a7c6a','#d8ccb2','#efe6d2','#fffaf0']};

// Mob-style skin: each art pixel picks one of a few browns at random (seeded, so it never flickers), darker away
// from the lip and with a few darker scale blotches, like a Minecraft mob texture blown up.
const SKIN=['#2a2119','#3a2e23','#4b3c2d','#5e4b38','#73604a'];
function skin(g,x0,y0,w,h,seed){
 let r=seed;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const t=y/h,n=rnd();
  g.fillStyle=SKIN[Math.max(0,Math.min(4,Math.floor(t*2.2+n*2.2)))];g.fillRect(x0+x,y0+y,1,1);
 }
 for(let i=0;i<w*h/90;i++){const x=Math.floor(rnd()*w),y=Math.floor(rnd()*h*.8);g.fillStyle=SKIN[0];g.fillRect(x0+x,y0+y,2,1)}
 g.fillStyle=SKIN[4];g.fillRect(x0,y0+h-1,w,1);   // lit lip edge
}

// One jaw pointing down: skin, a gum band and a few fangs; the lower jaw is the same drawing flipped.
function drawJaw(g,w,h,{count=7,shift=0,seed=7}={}){
 g.clearRect(0,0,w,h);
 const gumY=h-14,band=3;
 skin(g,0,0,w,gumY-band,seed);
 g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,gumY-band-2,w,2);
 for(let i=0;i<band;i++){g.fillStyle=C.gum[i===0?2:i===band-1?0:1];g.fillRect(0,gumY-band+i,w,1)}
 // Fangs: stepped like a staircase (the game draws teeth from blocks), the middle ones longest.
 const step=w/count;
 for(let i=0;i<count;i++){
  const cx=Math.round(step*(i+.5)+shift),front=1-Math.abs((i+.5)/count*2-1),tw=4+Math.round(front*2)*2,len=6+Math.round(front*6);
  for(let r=0;r<len;r++){
   const wd=Math.max(2,tw-Math.floor(r/3)*2),x=cx-Math.floor(wd/2);
   g.fillStyle=C.tooth[2];g.fillRect(x,gumY+r,wd,1);
   g.fillStyle=C.tooth[3];g.fillRect(x,gumY+r,1,1);            // lit left edge
   g.fillStyle=C.tooth[1];g.fillRect(x+wd-1,gumY+r,1,1);        // shaded right edge
   if(r===len-1){g.fillStyle=C.tooth[1];g.fillRect(x,gumY+r,wd,1)}
  }
 }
}

export function initBite(host,stage){
 const view=document.createElement('canvas');view.className='bite';host.replaceChildren(view);
 const g=view.getContext('2d');let top,bottom,w,h,jh;
 const build=()=>{
  // About 96 art pixels across, like a block face scaled up on screen.
  const px=Math.max(8,Math.round(innerWidth/96));w=Math.ceil(innerWidth/px);h=Math.ceil(innerHeight/px);view.width=w;view.height=h;
  jh=Math.ceil(h*.6);top=document.createElement('canvas');bottom=document.createElement('canvas');top.width=bottom.width=w;top.height=bottom.height=jh;
  drawJaw(top.getContext('2d'),w,jh,{count:7,seed:7});drawJaw(bottom.getContext('2d'),w,jh,{count:6,seed:91});
 };
 build();addEventListener('resize',build);
 return k=>{
  host.style.opacity=k>0?1:0;if(k<=0){stage.style.transform='';return}
  // Slow at first, then the jaws snap shut, the fangs passing each other a little.
  const e=k<.7?.5*Math.pow(k/.7,2):.5+.5*(1-Math.pow(1-(k-.7)/.3,3));
  const ty=Math.round(-jh+e*(h*.5+8)),by=h-ty-jh;
  g.clearRect(0,0,w,h);g.fillStyle=C.inside;g.globalAlpha=Math.min(1,e*e*1.1);g.fillRect(0,0,w,h);g.globalAlpha=1;
  g.drawImage(top,0,ty);g.save();g.translate(0,by+jh);g.scale(1,-1);g.drawImage(bottom,0,0);g.restore();
  const hit=k>.94?Math.sin(k*900)*(1-k)*60:0;stage.style.transform=hit?`translate(${hit.toFixed(1)}px,${(hit*.6).toFixed(1)}px)`:'';
 };
}
