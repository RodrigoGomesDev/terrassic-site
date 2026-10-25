// Compile numeric GeckoLib/Bedrock channels once, then sample them at display rate.
// Two inputs are accepted: the mod's raw animation.json clips and the compact clips written by
// scripts/import-mod.py ({len, loop, bones:{bone:{rotation:{time:[x,y,z]}}}}, Catmull-Rom by default).
const vector=v=>Array.isArray(v)?v.map(n=>Number.isFinite(Number(n))?Number(n):0):vector(v?.post??v?.vector??[0,0,0]);
export function compileTrack(raw,{monotone=false,mode='linear'}={}){
 if(Array.isArray(raw))return {constant:vector(raw)};
 const keys=Object.entries(raw||{}).map(([t,v])=>({t:Number(t),v:vector(v),mode:v?.lerp_mode||mode})).filter(k=>Number.isFinite(k.t)).sort((a,b)=>a.t-b.t);
 return {keys,monotone};
}
export function compileClip(raw,{compact='len' in (raw||{})}={}){
 const mode=compact?'catmullrom':'linear';
 return {length:raw.len??raw.animation_length??4,loop:raw.loop===true,bones:Object.fromEntries(Object.entries(raw.bones||{}).map(([name,b])=>[name,Object.fromEntries(['rotation','position','scale'].filter(c=>b[c]).map(c=>[c,compileTrack(b[c],{monotone:name==='jaw'&&c==='rotation',mode})]))]))};
}
export function sampleTrack(track,time,length=4,loop=false){
 if(!track)return [0,0,0];if(track.constant)return track.constant;
 const keys=track.keys;if(!keys.length)return [0,0,0];if(keys.length===1)return keys[0].v;
 const t=loop?((time%length)+length)%length:Math.max(keys[0].t,Math.min(time,keys.at(-1).t));
 let i=0;while(i<keys.length-2&&keys[i+1].t<t)i++;
 const a=keys[i],b=keys[i+1],span=b.t-a.t;if(span<=0)return b.v;
 const u=Math.max(0,Math.min(1,(t-a.t)/span));
 if(a.mode==='step')return a.v;
 if(a.mode!=='catmullrom'&&a.mode!=='catmull_rom'&&b.mode!=='catmullrom'&&b.mode!=='catmull_rom')return a.v.map((v,n)=>v+(b.v[n]-v)*u);
 let prev=keys[i-1],next=keys[i+2];
 // Reuse neighbors across a duplicated loop endpoint to keep velocity continuous.
 if(!prev&&loop&&keys.length>2)prev={...keys.at(-2),t:keys.at(-2).t-length};
 if(!next&&loop&&keys.length>2)next={...keys[1],t:keys[1].t+length};
 const u2=u*u,u3=u2*u;
 return a.v.map((v,n)=>{
  let m0=prev?(b.v[n]-prev.v[n])/(b.t-prev.t):0,m1=next?(next.v[n]-a.v[n])/(next.t-a.t):0;
  // Shape-preserving tangents prevent the jaw from overshooting a closed pose.
  if(track.monotone){
   const harmonic=(left,right,h0,h1)=>{if(left*right<=0)return 0;const w0=2*h1+h0,w1=h1+2*h0;return (w0+w1)/(w0/left+w1/right)};
   const slope=(b.v[n]-v)/span;
   m0=prev?harmonic((v-prev.v[n])/(a.t-prev.t),slope,a.t-prev.t,span):0;
   m1=next?harmonic(slope,(next.v[n]-b.v[n])/(next.t-b.t),span,next.t-b.t):0;
  }
  return (2*u3-3*u2+1)*v+(u3-2*u2+u)*span*m0+(-2*u3+3*u2)*b.v[n]+(u3-u2)*span*m1;
 });
}
const ONE=[1,1,1];
export function sampleBone(clip,name,time){const b=clip?.bones[name];return {rotation:sampleTrack(b?.rotation,time,clip?.length,clip?.loop),position:sampleTrack(b?.position,time,clip?.length,clip?.loop),scale:b?.scale?sampleTrack(b.scale,time,clip?.length,clip?.loop):ONE};}
export function actionWeight(time,length){const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};return smooth(time/.2)*smooth((length-time)/.35);}
// Weight of the incoming clip during a cross-fade: eased so the hand-off has no visible corner.
export function fadeWeight(elapsed,duration=.35){const x=Math.max(0,Math.min(1,elapsed/duration));return x*x*(3-2*x);}
