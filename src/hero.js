import * as THREE from 'three';
import {SPECIES} from './generated/species.js';
import {spawn} from './rig.js';
import {createSky,createTerrain,createMotes,heightAt} from './world.js';
const byId=Object.fromEntries(SPECIES.map(s=>[s.id,s]));
const ease=t=>t*t*(3-2*t),clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,damp=THREE.MathUtils.damp;
const loop=(cx,cz,rx,rz,turn=1,phase=0)=>new THREE.CatmullRomCurve3(Array.from({length:16},(_,i)=>{const a=phase+turn*i/16*Math.PI*2;return new THREE.Vector3(cx+Math.cos(a)*rx,0,cz+Math.sin(a)*rz)}),true);

// Who lives in the clearing, and how each one moves. Speeds are metres per second at the in-game scale.
const CAST=[
 {id:'tyrannosaurus',role:'stalker',path:loop(7,5,9,5,1),speed:3.2,walk:'walk',mobile:true},
 {id:'parasaurolophus',role:'herd',path:loop(0,-6,30,15,-1),speed:2.6,offset:0,mobile:true},
 {id:'parasaurolophus',role:'herd',path:loop(0,-6,30,15,-1),speed:2.6,offset:.035,sex:'female'},
 {id:'corythosaurus',role:'herd',path:loop(0,-6,30,15,-1),speed:2.6,offset:.07},
 {id:'brachiosaurus',role:'herd',path:loop(-4,-38,34,5,1,.6),speed:1.6,offset:0,mobile:true},
 {id:'triceratops',role:'grazer',at:[-17,9],face:.8,mobile:true},
 {id:'triceratops',role:'grazer',at:[-23,2],face:2.1,sex:'female'},
 {id:'velociraptor',role:'herd',path:loop(4,-4,40,24,1,2.4),speed:9,offset:0,walk:'run'},
 {id:'velociraptor',role:'herd',path:loop(4,-4,40,24,1,2.4),speed:9,offset:-.012,walk:'run',sex:'female'},
 {id:'velociraptor',role:'herd',path:loop(4,-4,40,24,1,2.4),speed:9,offset:-.022,walk:'run'},
 {id:'pteranodon',role:'flyer',center:[0,-12],radius:28,height:19,speed:9,offset:0,mobile:true},
 {id:'pteranodon',role:'flyer',center:[6,-6],radius:20,height:24,speed:8,offset:2.2,sex:'female'},
 {id:'quetzalcoatlus',role:'flyer',center:[-10,-30],radius:40,height:32,speed:7,offset:4},
];

export class Hero{
 constructor(canvasHost,{onProgress=()=>{},onReady=()=>{},onFail=()=>{}}={}){
  this.host=canvasHost;this.onProgress=onProgress;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.mobile=innerWidth<760||(navigator.hardwareConcurrency||8)<=2;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){onFail(e);return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.25:1.6));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.15;
  r.shadowMap.enabled=!this.mobile;r.shadowMap.type=THREE.PCFSoftShadowMap;canvasHost.append(r.domElement);
  this.scene=new THREE.Scene();this.scene.fog=new THREE.Fog(0x9a5a46,38,165);
  this.camera=new THREE.PerspectiveCamera(36,1,.3,900);
  this.sky=createSky();this.scene.add(this.sky);this.scene.add(createTerrain());this.motes=createMotes(this.mobile?180:420);this.scene.add(this.motes);
  this.scene.add(new THREE.HemisphereLight(0xb89ac0,0x4a3626,1.25));
  const sun=new THREE.DirectionalLight(0xffc98a,3.1);sun.position.set(-48,26,22);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-50,right:50,top:40,bottom:-40,near:1,far:160});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;this.scene.add(sun);
  const fill=new THREE.DirectionalLight(0xffe0bd,1.5);fill.position.set(12,14,44);this.scene.add(fill);
  const rim=new THREE.DirectionalLight(0xf07a1a,1.4);rim.position.set(30,12,-60);this.scene.add(rim);
  this.creatures=[];this.time=0;this.last=performance.now();this.pointer=new THREE.Vector2();this.look=new THREE.Vector2();this.scroll=0;this.visible=true;
  this.resize=this.resize.bind(this);this.tick=this.tick.bind(this);
  new ResizeObserver(this.resize).observe(canvasHost);this.resize();
  addEventListener('pointermove',e=>{this.pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5)},{passive:true});
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting},{rootMargin:'80px'}).observe(canvasHost);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.visible=false;onFail(new Error('webgl'))});
  this.populate(onReady);requestAnimationFrame(this.tick);
 }
 async populate(onReady){
  const cast=this.mobile?CAST.filter(c=>c.mobile):CAST;let loaded=0;
  for(const c of cast){
   try{
    const creature=await spawn(byId[c.id],{sex:c.sex||'male',shadows:!this.mobile,merge:true,animation:c.role==='flyer'?'fly':c.role==='grazer'?'idle':c.walk||'walk'});
    Object.assign(creature,{cfg:c,u:(c.offset||0)+.001,speedNow:c.role==='stalker'?0:c.speed,state:'walk',stateTime:0,heading:c.face||0,bank:0,fade:0});
    creature.model.material.transparent=true;creature.model.material.opacity=0;
    if(c.role==='grazer'){creature.holder.position.set(c.at[0],heightAt(...c.at),c.at[1]);creature.holder.rotation.y=c.face;creature.nextGraze=2+Math.random()*4}
    if(c.role==='stalker'){creature.state='idle';creature.stateTime=-1.5}
    this.scene.add(creature.holder);this.creatures.push(creature);this.place(creature,0);
   }catch(e){console.warn(e)}
   this.onProgress(++loaded/cast.length);if(loaded===1)onReady();
  }
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.portrait=w<h;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.fov=w<h?52:36;this.camera.updateProjectionMatrix()}
 setScroll(p){this.scroll=clamp(p,0,1)}
 // Moves one creature along its path and keeps its feet on the ground.
 place(c,dt){
  const cfg=c.cfg,a=c.animator;
  if(cfg.role==='flyer'){
   c.u+=dt*cfg.speed/cfg.radius;const ang=c.u+cfg.offset,y=cfg.height+Math.sin(c.u*1.7+cfg.offset)*3;
   c.holder.position.set(cfg.center[0]+Math.cos(ang)*cfg.radius,y,cfg.center[1]+Math.sin(ang)*cfg.radius);
   // Tangent of a counter-clockwise circle; the model looks down -Z.
   c.holder.rotation.set(0,Math.atan2(Math.sin(ang),-Math.cos(ang)),0);
   const gliding=Math.sin(c.u*.6+cfg.offset)>.25;a.play(gliding&&a.has('glide')?'glide':'fly',{fade:.8});
   c.bank=damp(c.bank,gliding?.32:.18,2,dt);c.holder.rotateZ(-c.bank);return;
  }
  if(cfg.role==='grazer'){c.nextGraze-=dt;if(c.nextGraze<0&&!a.acting){a.trigger(a.has('graze')?'graze':'eat');c.nextGraze=5+Math.random()*6}return}
  if(cfg.role==='stalker'){
   c.stateTime+=dt;
   if(c.state==='walk'&&c.stateTime>10){c.state='idle';c.stateTime=0}
   else if(c.state==='idle'&&c.stateTime>1.6&&!c.roared){c.roared=true;if(!this.reduced)a.trigger('roar')}
   else if(c.state==='idle'&&c.stateTime>5){c.state='walk';c.stateTime=0;c.roared=false}
   c.speedNow=damp(c.speedNow,c.state==='walk'&&!this.reduced?cfg.speed:0,2.2,dt);
   a.play(c.speedNow>.5?'walk':'idle',{fade:.6});if(c.speedNow>.5)a.speed=clamp(c.speedNow/cfg.speed,.55,1.1);else a.speed=1;
  }else c.speedNow=this.reduced?0:cfg.speed;
  const length=c.length??=cfg.path.getLength();c.u=(c.u+dt*c.speedNow/length+1)%1;
  const p=cfg.path.getPointAt(c.u),t=cfg.path.getTangentAt(c.u);
  c.holder.position.set(p.x,heightAt(Math.round(p.x),Math.round(p.z)),p.z);
  const target=Math.atan2(-t.x,-t.z);let d=target-c.heading;d=Math.atan2(Math.sin(d),Math.cos(d));c.heading+=d*Math.min(1,dt*4);c.holder.rotation.y=c.heading;
 }
 tick(now){
  requestAnimationFrame(this.tick);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
  if(!this.visible||document.hidden)return;this.time+=dt;
  for(const c of this.creatures){this.place(c,dt);c.animator.update(this.reduced&&c.cfg.role!=='flyer'?0:dt);
   if(c.fade<1){c.fade=Math.min(1,c.fade+dt*1.2);c.model.material.opacity=ease(c.fade);if(c.fade>=1){c.model.material.transparent=false;c.model.material.needsUpdate=true}}}
  this.sky.material.uniforms.time.value=this.time;this.motes.material.uniforms.time.value=this.time;this.motes.material.uniforms.pixel.value=this.renderer.getPixelRatio();
  // A slow cinematic drift, the pointer adds a little parallax and scrolling lifts the camera over the clearing.
  this.look.x=damp(this.look.x,this.pointer.x,3,dt);this.look.y=damp(this.look.y,this.pointer.y,3,dt);
  const s=ease(this.scroll),drift=this.reduced?0:Math.sin(this.time*.05)*.18,yaw=drift+this.look.x*.1;
  const dist=lerp(31,38,s),height=lerp(4.6,16,s)-this.look.y*1.4;
  this.camera.position.set(Math.sin(yaw)*dist+2,height,Math.cos(yaw)*dist+2);
  this.camera.lookAt(lerp(this.portrait?8.5:1,0,s),lerp(4.4,2,s),lerp(0,-6,s));
  this.renderer.render(this.scene,this.camera);
 }
}
