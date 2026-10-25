import * as THREE from 'three';
import {loadMeteor,Trail} from './hero.js';
import {QualityGuard} from './rig.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,damp=THREE.MathUtils.damp;
const smooth=(p,a,b)=>{const x=clamp((p-a)/(b-a),0,1);return x*x*x*(x*(x*6-15)+10)};
// The story's meteor: it falls from the top of the screen while the intro is read and bursts on "Então veio a luz".
export class StoryMeteor{
 constructor(host,{impact=.66}={}){
  this.host=host;this.impact=impact;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.25:1.5));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.setClearColor(0,0);host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(40,1,.1,200);this.camera.position.set(0,0,30);
  this.scene.add(new THREE.HemisphereLight(0xffe0b0,0x2a1a2a,1.4));const key=new THREE.DirectionalLight(0xffc070,2);key.position.set(5,10,10);this.scene.add(key);
  this.trail=new Trail(this.scene,300);this.guard=new QualityGuard(r);
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
  // From above the top edge to the lower third, leaning a little, faster as it falls.
  const u=Math.pow(smooth(p,.02,this.impact),1.35),from=new THREE.Vector3(w*.66,h*1.3,-8),to=new THREE.Vector3(w*.2,-h*.4,-2);
  const pos=from.clone().lerp(to,u),dir=to.clone().sub(from).normalize(),landed=p>=this.impact,m=this.meteor;
  m.holder.visible=!landed&&p>.01;m.holder.position.copy(pos);m.holder.lookAt(pos.clone().sub(dir));m.holder.scale.setScalar(lerp(.6,1.15,u));m.animator.update(this.reduced?0:dt);
  if(!landed&&p>.01&&!this.reduced)this.trail.emit(pos.clone().addScaledVector(dir,-2.5),dir,Math.ceil(2+u*5),lerp(1.2,2.4,u));
  if(landed&&!this.burst){this.burst=true;if(!this.reduced)for(let i=0;i<8;i++)this.trail.emit(to.clone(),new THREE.Vector3(Math.random()-.5,Math.random()-.5,.3).normalize(),20,3.2)}
  if(p<this.impact-.03)this.burst=false;
  this.trail.update(this.reduced?0:dt);this.renderer.render(this.scene,this.camera);
 }
}
