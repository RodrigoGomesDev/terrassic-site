import * as THREE from 'three';
import {loadMeteor,Trail} from './hero.js';
import {QualityGuard} from './rig.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,damp=THREE.MathUtils.damp;
const smooth=(p,a,b)=>{const x=clamp((p-a)/(b-a),0,1);return x*x*x*(x*(x*6-15)+10)};
// A soft round glow drawn on a canvas, used as an additive sprite around the meteor and for the burst.
function glowSprite(color){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),grad=g.createRadialGradient(64,64,0,64,64,64);
 grad.addColorStop(0,'rgba(255,240,200,1)');grad.addColorStop(.25,color);grad.addColorStop(1,'rgba(240,122,26,0)');g.fillStyle=grad;g.fillRect(0,0,128,128);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));return s;
}
// The story's meteor: it falls from the top of the screen while the intro is read, growing as it comes closer, and
// bursts low on the screen just after "Então veio a luz".
export class StoryMeteor{
 constructor(host,{impact=.75}={}){
  this.host=host;this.impact=impact;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.25:1.5));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.setClearColor(0,0);host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(40,1,.1,200);this.camera.position.set(0,0,30);
  this.scene.add(new THREE.HemisphereLight(0xffe0b0,0x2a1a2a,1.4));const key=new THREE.DirectionalLight(0xffc070,2);key.position.set(5,10,10);this.scene.add(key);
  this.trail=new Trail(this.scene,520);Object.assign(this.trail.mesh.material,{blending:THREE.AdditiveBlending,opacity:.85});this.guard=new QualityGuard(r);
  this.halo=glowSprite('rgba(255,170,70,.55)');this.flash=glowSprite('rgba(255,200,120,.8)');this.scene.add(this.halo,this.flash);this.flash.visible=false;
  this.progress=0;this.target=0;this.last=performance.now();this.visible=false;this.time=0;
  new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting},{rootMargin:'100px'}).observe(host);
  loadMeteor().then(m=>{this.meteor=m;this.scene.add(m.holder)});
  this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.updateProjectionMatrix();this.span=Math.tan(THREE.MathUtils.degToRad(20))*30}
 setProgress(p){this.target=clamp(p,0,1)}
 tick(now){
  requestAnimationFrame(this.tick);const ms=now-this.last,dt=Math.min(.05,ms/1000);this.last=now;if(!this.visible||document.hidden||!this.meteor)return;this.guard.frame(ms);this.time+=dt;
  this.progress=this.reduced?this.target:damp(this.progress,this.target,8,dt);const p=this.progress,h=this.span,w=h*this.camera.aspect;
  // A gentle curve from above the top edge to low on the screen; it speeds up and grows as it comes closer.
  const u=Math.pow(smooth(p,.02,this.impact),1.5),landed=p>=this.impact,m=this.meteor;
  const a=new THREE.Vector3(w*.7,h*1.35,-14),c=new THREE.Vector3(w*.55,h*.2,-8),b=new THREE.Vector3(w*.1,-h*.7,2);
  const curve=t=>a.clone().multiplyScalar((1-t)*(1-t)).add(c.clone().multiplyScalar(2*t*(1-t))).add(b.clone().multiplyScalar(t*t));
  const pos=curve(u),dir=curve(Math.min(1,u+.01)).sub(curve(Math.max(0,u-.01))).normalize(),size=lerp(.45,2,u*u);
  m.holder.visible=!landed&&p>.01;m.holder.position.copy(pos);m.holder.lookAt(pos.clone().sub(dir));m.holder.scale.setScalar(size);m.animator.update(this.reduced?0:dt);
  this.halo.visible=m.holder.visible;this.halo.position.copy(pos).addScaledVector(dir,-size*.8);this.halo.scale.setScalar(size*9*(1+Math.sin(this.time*9)*.05));this.halo.material.opacity=.35+u*.25;
  if(!landed&&p>.01&&!this.reduced)this.trail.emit(pos.clone().addScaledVector(dir,-size*1.6),dir,Math.ceil(3+u*8),lerp(.7,2.6,u));
  if(landed&&!this.burst){this.burst=true;this.flashT=0;if(!this.reduced)for(let i=0;i<10;i++)this.trail.emit(b.clone(),new THREE.Vector3(Math.random()-.5,Math.random()*.6-.1,.3).normalize(),26,3.6)}
  if(p<this.impact-.03)this.burst=false;
  // The burst: a quick bright flash that swells and fades.
  if(this.burst){this.flashT=(this.flashT||0)+dt;const f=Math.min(1,this.flashT/1.1);this.flash.visible=f<1;this.flash.position.copy(b);this.flash.scale.setScalar(lerp(4,48,1-Math.pow(1-f,3)));this.flash.material.opacity=1-f}else this.flash.visible=false;
  this.trail.update(this.reduced?0:dt);this.renderer.render(this.scene,this.camera);
 }
}
