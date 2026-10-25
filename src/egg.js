// The hatching egg of the mechanics section as pixel art: a 16x20 egg with a dark outline, cream shell lit from the
// top left and rust spots, in four stages (whole, a crack, cracked across, open with the cap knocked off).
const W=16,H=20,TOP=6;
const C={line:'#2a2124',shell:['#fffaf0','#efe6d2','#d8ccb2','#b3a58a'],spot:['#b04a38','#8e342a'],inside:'#3a2a22'};
const SPOTS=[[4,6,2,1],[9,3,1,1],[11,8,2,2],[3,12,1,1],[7,14,2,1],[11,15,1,1],[6,10,1,1],[8,6,1,1],[5,17,2,1],[12,12,1,1]];
const crackY=x=>9+[0,1,0,-1,0,1,2,1,0,-1,0,1,0,-1,0,1][x];
const inEgg=(x,y)=>{
 if(y<0||y>=H)return false;
 const v=(y+.5)/H,hw=Math.sqrt(Math.max(0,1-(2*v-1)**2))*(1+.2*(2*v-1))*6.6;
 return Math.abs(x+.5-W/2)<=hw;
};

// Shell colour of one pixel: lit from the top left, a little dither, and the spots.
function shell(x,y){
 const nx=(x+.5-W/2)/8,ny=(y+.5-H*.55)/10,l=nx*.9+ny*.7+((x*7+y*13)%5-2)*.06;
 if(SPOTS.some(([sx,sy,sw,sh])=>x>=sx&&x<sx+sw&&y>=sy&&y<sy+sh))return C.spot[l>.3?1:0];
 return C.shell[Math.max(0,Math.min(3,Math.floor((l+.95)*1.9)))];
}

function draw(g,keep,dx=0,dy=0){
 const has=(x,y)=>inEgg(x,y)&&keep(x,y);
 for(let y=-1;y<=H;y++)for(let x=-1;x<=W;x++){
  if(has(x,y)){g.fillStyle=shell(x,y);g.fillRect(x+dx,y+dy+TOP,1,1)}
  else if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>has(x+a,y+b))){g.fillStyle=C.line;g.fillRect(x+dx,y+dy+TOP,1,1)}
 }
}

// A crack is one dark pixel line, stepping up or down between columns so it never breaks into a checkerboard.
function crack(g,from,to){
 g.fillStyle=C.line;
 for(let x=from;x<=to;x++){
  const y=crackY(x);if(!inEgg(x,y))continue;
  g.fillRect(x,y+TOP,1,1);
  if(x<to){const n=crackY(x+1);if(n!==y&&inEgg(x,n))g.fillRect(x,n+TOP,1,1)}
 }
}

export function eggStage(g,stage){
 g.clearRect(0,0,W,H+TOP);
 if(stage<3){
  draw(g,()=>true);
  if(stage===1)crack(g,9,15);
  if(stage===2){crack(g,0,15);g.fillStyle=C.line;g.fillRect(6,crackY(6)+1+TOP,1,2);g.fillRect(12,crackY(12)+1+TOP,1,1)}
  return;
 }
 // Open: the bottom shell with a jagged rim and the dark inside showing, the cap knocked up and to the left.
 draw(g,(x,y)=>y>crackY(x));
 for(let x=1;x<W-1;x++){const y=crackY(x)+1;if(inEgg(x-1,y)&&inEgg(x+1,y)){g.fillStyle=C.inside;g.fillRect(x,y+TOP,1,1)}}
 draw(g,(x,y)=>y<crackY(x),-2,-5);
 g.fillStyle=C.shell[1];for(const [x,y] of [[14,2],[1,4],[15,6]]){g.fillRect(x,y,1,1)}
}

export function eggCanvas(){
 const c=document.createElement('canvas');c.width=W;c.height=H+TOP;c.className='egg-pix';return c;
}
