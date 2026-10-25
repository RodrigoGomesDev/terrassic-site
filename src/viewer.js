import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {spawn} from './rig.js';
import {plinth,eraSlab} from './blocks.js';
const damp=THREE.MathUtils.damp,ease=t=>t*t*(3-2*t);

// A blocky field assistant, 1.8 m tall, for scale. Drawn from boxes, in the notebook's paper and leather colours.
function fieldAssistant(){
 const g=new THREE.Group(),part=(w,h,d,x,y,z,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:1}));m.position.set(x,y,z);m.castShadow=true;g.add(m)};
 part(.22,.8,.22,-.12,.4,0,0x5a3620);part(.22,.8,.22,.12,.4,0,0x5a3620);part(.5,.7,.26,0,1.15,0,0xd8c79e);part(.18,.68,.18,-.35,1.16,0,0xd8c79e);part(.18,.68,.18,.35,1.16,0,0xd8c79e);part(.36,.36,.36,0,1.68,0,0xb08a64);part(.4,.08,.4,0,1.87,0,0x3b2a1a);
 return g;
}
export class SpecimenViewer{
 constructor(host,{onLoad=()=>{},onError=()=>{},onActionEnd=()=>{}}={}){
  this.host=host;this.onLoad=onLoad;this.onError=onError;this.onActionEnd=onActionEnd;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){onError(e);return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.1;r.setClearColor(0,0);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(30,1,.1,800);
  this.scene.add(new THREE.HemisphereLight(0xe6d6ee,0x3a2a20,2.2));
  this.key=new THREE.DirectionalLight(0xffdcae,3.2);this.key.castShadow=true;this.key.shadow.mapSize.set(2048,2048);this.key.shadow.bias=-.0005;this.key.shadow.normalBias=.03;this.scene.add(this.key,this.key.target);
  const rim=new THREE.DirectionalLight(0xf07a1a,2.2);rim.position.set(6,5,12);this.scene.add(rim);
  const cool=new THREE.DirectionalLight(0x8fb4c8,.8);cool.position.set(10,3,-8);this.scene.add(cool);
  this.assistant=fieldAssistant();this.scene.add(this.assistant);
  this.controls=new OrbitControls(this.camera,r.domElement);Object.assign(this.controls,{enableDamping:true,enablePan:false,enableZoom:false,rotateSpeed:.7,maxPolarAngle:Math.PI*.52,minPolarAngle:Math.PI*.08,autoRotate:!this.reduced,autoRotateSpeed:.55});
  this.controls.addEventListener('start',()=>{this.controls.autoRotate=false;this.host.classList.add('is-dragging')});this.controls.addEventListener('end',()=>this.host.classList.remove('is-dragging'));
  this.zoom=1;this.distance=10;this.frame={target:new THREE.Vector3(),distance:10};this.current=null;this.leaving=[];this.request=0;this.showScale=true;this.visible=true;this.last=performance.now();
  new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting},{rootMargin:'100px'}).observe(host);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.visible=false;onError(new Error('webgl'))});
  this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.updateProjectionMatrix()}
 async show(species,sex='male'){
  if(!this.renderer)return;const req=++this.request;
  try{
   const c=await spawn(species,{sex,shadows:true,animation:this.current?.animator.current.name||'idle'});
   if(req!==this.request){c.dispose();return}
   c.model.material.transparent=true;c.model.material.opacity=0;c.fade=0;
   if(this.current){this.current.out=0;this.leaving.push(this.current)}
   this.current=c;this.scene.add(c.holder);
   // Frame the animal by its measured size; small ones get a closer camera so they fill the stage.
   c.holder.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(c.model.root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   c.holder.position.y=-box.min.y;const span=Math.max(size.x,size.y*1.3,size.z,2.2);
   this.frame.target.set(center.x,size.y*.45,center.z);this.frame.distance=span*1.5+2.2;this.size=size;
   this.assistant.position.set(Math.max(size.x/2+1.4,1.6),0,size.z*.12);
   // A plinth of the mod's own flagstones; each block is 1 m, so it doubles as a scale grid.
   if(this.plinth)this.scene.remove(this.plinth);
   this.plinth=plinth(Math.ceil(Math.max(size.x,size.z)*.62+2));this.plinth.position.set(-.5,0,-.5);this.scene.add(this.plinth);
   const k=span*1.2;Object.assign(this.key.shadow.camera,{left:-k,right:k,top:k,bottom:-k,near:.5,far:k*6});this.key.shadow.camera.updateProjectionMatrix();
   this.key.position.set(-k*.9,k*1.6,-k*1.4);this.key.target.position.copy(this.frame.target);
   if(!this.placed){this.placed=true;this.controls.target.copy(this.frame.target);this.camera.position.set(-span*1.1,span*.55,-span*1.5).setLength(this.frame.distance).add(this.frame.target);this.distance=this.frame.distance}
   this.onLoad(c);
  }catch(e){if(req===this.request)this.onError(e)}
 }
 play(name){const a=this.current?.animator;if(!a)return;const clip=a.clips[name];if(!clip)return;if(clip.loop)a.play(name);else a.trigger(name,()=>this.onActionEnd(name));}
 setScale(on){this.showScale=on;this.assistant.visible=on}
 setZoom(f){this.zoom=THREE.MathUtils.clamp(f,.45,1.6)}
 resetView(){this.zoom=1;this.controls.autoRotate=!this.reduced}
 tick(now){
  requestAnimationFrame(this.tick);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;if(!this.visible||document.hidden)return;
  if(this.current){const c=this.current;c.animator.update(dt);
   // Flying clips lift the animal off the plinth.
   const air=/^(fly|glide)$/.test(c.animator.current.name)?Math.max(1.2,this.size.y*.55)+Math.sin(now*.0015)*.25:0;c.lift=damp(c.lift||0,air,3,dt);c.holder.position.y=(c.groundY??=c.holder.position.y)+c.lift;if(c.fade<1){c.fade=Math.min(1,c.fade+dt*2.2);c.model.material.opacity=ease(c.fade);c.holder.scale.setScalar(.94+.06*ease(c.fade));if(c.fade===1){c.model.material.transparent=false;c.model.material.needsUpdate=true}}}
  this.leaving=this.leaving.filter(c=>{c.out+=dt*3;c.model.material.opacity=1-ease(Math.min(1,c.out));c.animator.update(dt);if(c.out>=1){this.scene.remove(c.holder);c.dispose();return false}return true});
  // Glide the orbit target and distance to the new animal instead of cutting.
  this.controls.target.x=damp(this.controls.target.x,this.frame.target.x,4,dt);this.controls.target.y=damp(this.controls.target.y,this.frame.target.y,4,dt);this.controls.target.z=damp(this.controls.target.z,this.frame.target.z,4,dt);
  this.distance=damp(this.distance,this.frame.distance*this.zoom*Math.max(1,1.15/this.camera.aspect),4,dt);const off=this.camera.position.clone().sub(this.controls.target);off.setLength(this.distance);this.camera.position.copy(this.controls.target).add(off);
  this.controls.update();this.renderer.render(this.scene,this.camera);
 }
}

// One small renderer shared by every card: each animal is posed, photographed once and released.
export class Thumbnailer{
 constructor(){
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true})}catch{return}
  const r=this.renderer;r.setPixelRatio(1);r.setSize(360,240,false);r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.15;r.setClearColor(0,0);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(24,1.5,.1,800);
  this.scene.add(new THREE.HemisphereLight(0xe8d6f0,0x3a2a20,2));const key=new THREE.DirectionalLight(0xffdcae,3);key.position.set(-4,6,-5);this.scene.add(key);const rim=new THREE.DirectionalLight(0xf07a1a,2);rim.position.set(5,3,6);this.scene.add(rim);
  this.queue=[];this.busy=false;
 }
 // A chapter card: a slab of the era's blocks, optionally with an animal of that era standing on it.
 eraScene(id,speciesList=[]){return new Promise((resolve,reject)=>{if(!this.renderer)return reject(new Error('webgl'));this.queue.push({era:id,speciesList,resolve,reject});this.next()})}
 request(species,sex='male'){return new Promise((resolve,reject)=>{if(!this.renderer)return reject(new Error('webgl'));this.queue.push({species,sex,resolve,reject});this.next()})}
 async next(){
  if(this.busy||!this.queue.length)return;this.busy=true;const job=this.queue.shift();
  try{
   if(job.era){await this.renderEra(job);this.busy=false;this.next();return}
   const c=await spawn(job.species,{sex:job.sex,merge:true});c.animator.update(1.3);
   this.scene.add(c.holder);c.holder.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(c.model.root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   const span=Math.max(size.x,size.y*1.5,size.z*.8);this.camera.position.copy(center).add(new THREE.Vector3(-.78,.32,-.62).setLength(span*2.15));this.camera.lookAt(center);
   this.renderer.render(this.scene,this.camera);
   const blob=await new Promise(res=>this.renderer.domElement.toBlob(res,'image/webp',.9));
   this.scene.remove(c.holder);c.dispose();job.resolve(URL.createObjectURL(blob));
  }catch(e){job.reject(e)}
  this.busy=false;this.next();
 }
 async renderEra(job){
  const slab=eraSlab(job.era),group=new THREE.Group();group.add(slab);
  const animals=await Promise.all(job.speciesList.map(([sp,x,z,rot])=>spawn(sp,{merge:true}).then(c=>{c.animator.update(.8);c.holder.position.set(x,0,z);c.holder.rotation.y=rot;group.add(c.holder);return c})));
  // Textures load asynchronously; wait until every block image is ready before the photo.
  const maps=new Set();group.traverse(o=>{for(const m of [].concat(o.material||[]))if(m.map)maps.add(m.map)});
  await Promise.all([...maps].map(t=>t.image?.complete!==false&&t.image?Promise.resolve():new Promise(r=>{const i=setInterval(()=>{if(t.image){clearInterval(i);r()}},30)})));
  this.scene.add(group);group.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(slab),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  this.renderer.setSize(480,300,false);this.camera.aspect=1.6;this.camera.fov=26;this.camera.updateProjectionMatrix();
  this.camera.position.copy(center).add(new THREE.Vector3(-.55,.42,.75).setLength(Math.max(size.x,size.z)*1.95));this.camera.lookAt(center.x,center.y+1,center.z);
  this.renderer.render(this.scene,this.camera);
  const blob=await new Promise(res=>this.renderer.domElement.toBlob(res,'image/webp',.92));
  this.scene.remove(group);for(const a of animals)a.dispose();
  this.renderer.setSize(360,240,false);this.camera.aspect=1.5;this.camera.fov=24;this.camera.updateProjectionMatrix();
  job.resolve(URL.createObjectURL(blob));
 }
}
