// The bite that closes the opening: the T. rex's jaws in pixel art, drawn here at 1 px = PX screen pixels.
// The upper jaw comes down from the top and the lower one up from the bottom; the fangs interlock when it shuts.
const PX=6;
const C={dark:'#0e0b0e',throat:'#1c0e10',gum:'#5a1e1c',gumHi:'#7a2a24',gumLo:'#3a1214',lip:'#4a3628',lipHi:'#6b4c34',lipLo:'#2a1e16',
 tooth:['#8a7c6a','#b3a48c','#d8ccb2','#efe6d2','#fff6e0'],tip:'#c9b896'};
function rnd(seed){return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}

// One jaw, drawn pointing down (the lower jaw is the same drawing flipped). w×h in art pixels; the teeth hang below `edge`.
function drawJaw(g,w,h,edge,seed,offset){
 const r=rnd(seed);
 // Throat behind, then the lip with scales, then the gum line.
 g.clearRect(0,0,w,h);
 const curve=x=>Math.round(Math.pow((x/w-.5)*2,2)*3);
 for(let x=0;x<w;x++){
  const e=edge-curve(x);
  g.fillStyle=C.dark;g.fillRect(x,0,1,e-14);
  for(let y=e-14;y<e-4;y++){g.fillStyle=(x+Math.floor(y/2))%5===0?C.lipLo:(y===e-14||(x*7+y*3)%11===0)?C.lipHi:C.lip;g.fillRect(x,y,1,1)}
  for(let y=e-4;y<e;y++){g.fillStyle=y===e-4?C.gumHi:y===e-1?C.gumLo:C.gum;g.fillRect(x,y,1,1)}
 }
 // Fangs: big ones near the front (the middle of the screen), smaller towards the corners, each slightly curved back.
 let x=offset;
 while(x<w){
  const front=1-Math.abs(x/w-.5)*2,width=3+Math.round(front*3+r()*2),len=Math.round(6+front*10+r()*5),lean=(x/w-.5)*.35;
  const e=edge-curve(x)-1;
  for(let i=0;i<len;i++){
   const t=i/len,half=Math.max(.5,(width/2)*(1-t*t*.92)),cx=x+width/2+lean*i;
   for(let dx=Math.floor(cx-half);dx<Math.ceil(cx+half);dx++){
    const k=(dx-(cx-half))/(half*2);
    g.fillStyle=i>len-3?C.tip:C.tooth[k<.25?4:k<.5?3:k<.78?2:k<.92?1:0];g.fillRect(dx,e+i,1,1);
   }
  }
  // The root of the tooth sits in the gum.
  g.fillStyle=C.gumLo;g.fillRect(x,e,width,1);
  x+=width+2+Math.round(r()*3);
 }
}

export function initBite(host){
 const top=document.createElement('canvas'),bottom=document.createElement('canvas');top.className='bite bite-top';bottom.className='bite bite-bottom';host.replaceChildren(top,bottom);
 const draw=()=>{
  const w=Math.ceil(innerWidth/PX),h=Math.ceil(innerHeight*.62/PX),edge=h-22;
  for(const [c,seed,offset] of [[top,1203,1],[bottom,66,5]]){c.width=w;c.height=h;const g=c.getContext('2d');drawJaw(g,w,h,edge,seed,offset)}
 };
 draw();addEventListener('resize',draw);
 // 0 = open (off screen), 1 = shut: the fangs pass each other a little, like a real bite.
 return k=>{const e=k*k*(3-2*k);top.style.transform=`translateY(${(-100+e*100)}%)`;bottom.style.transform=`translateY(${(100-e*100)}%) scaleY(-1)`;host.style.opacity=k>0?1:0;host.style.background=`rgba(14,11,14,${(e*e).toFixed(3)})`};
}
