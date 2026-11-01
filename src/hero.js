import * as THREE from 'three';
import {spawn,createModel,assetUrl,Animator,QualityGuard} from './rig.js';
import {compileClip} from './animation.js';


export async function loadMeteor(){
 const [data,map,glow]=await Promise.all([fetch(assetUrl('meteor/meteor.json')).then(r=>r.json()),...['meteor','meteor_glow'].map(n=>new THREE.TextureLoader().loadAsync(assetUrl(`meteor/${n}.png`)))]);
 for(const t of [map,glow]){t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace}
 const model=createModel(data,map);Object.assign(model.material,{emissive:new THREE.Color(0xffffff),emissiveMap:glow,emissiveIntensity:2.2});
 const holder=new THREE.Group(),spin=new THREE.Group();spin.add(model.root);holder.add(spin);model.root.position.y=-24/16;model.root.scale.setScalar(1/16);
 const clips={fall:compileClip(data.animations.fall)};return {holder,model,animator:new Animator(model,clips,{name:'fall'})};
}

// Square embers and smoke puffs, like the game's particles.
export class Trail{
 constructor(scene,count=360){
  this.mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false}),count);
  this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.frustumCulled=false;this.parts=Array.from({length:count},()=>({life:0}));this.next=0;scene.add(this.mesh);
  this.m=new THREE.Matrix4();this.c=new THREE.Color();this.q=new THREE.Quaternion();this.hot=new THREE.Color(0xffc45c);this.cool=new THREE.Color(0xf07a1a);this.smoke=new THREE.Color(0xb3a48c);this.zero=new THREE.Vector3();
 }
 emit(at,dir,n,size){for(let i=0;i<n;i++){const p=this.parts[this.next];this.next=(this.next+1)%this.parts.length;p.life=p.max=.8+Math.random()*1.4;p.pos=at.clone().add(new THREE.Vector3((Math.random()-.5)*size,(Math.random()-.5)*size,(Math.random()-.5)*size));p.vel=dir.clone().multiplyScalar(-2-Math.random()*4).add(new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.5,(Math.random()-.5)*2));p.size=size*(.25+Math.random()*.35);p.smoke=Math.random()<.2}}
 update(dt){const v=new THREE.Vector3();this.parts.forEach((p,i)=>{if(p.life>0){p.life-=dt;p.pos.addScaledVector(p.vel,dt)}const k=Math.max(0,p.life/(p.max||1)),s=p.life>0?p.size*(p.smoke?.9*k+.3*(1-k)*k*4:k):0;
  this.m.compose(p.pos||this.zero,this.q,v.set(s,s,s));this.mesh.setMatrixAt(i,this.m);this.c.copy(p.smoke?this.smoke:this.cool).lerp(this.hot,p.smoke?0:k*k);this.mesh.setColorAt(i,this.c)});
  this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true}
}

// The opening: the most recent finished animal standing still on the page, in its own idle loop. Nothing follows the
// scroll or the mouse; the camera is fixed at a three-quarter view that shows the whole animal.
export class Hero{
 constructor(host,species,{onReady=()=>{},onFail=()=>{}}={}){
  this.host=host;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){onFail(e);return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.setClearColor(0,0);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(28,1,.1,400);
  this.scene.add(new THREE.HemisphereLight(0xfff0d0,0x7a5a32,2));
  const sun=new THREE.DirectionalLight(0xfff1d6,2.6);sun.position.set(-10,22,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:90});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;this.scene.add(sun);this.guard=new QualityGuard(r,{shadows:[sun]});
  // A floor that only catches the shadow, so the animal stands on the page colour.
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x3b2a1a,opacity:.25}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
  this.visible=true;this.last=performance.now();
  new ResizeObserver(()=>this.resize()).observe(host);
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting}).observe(host);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.visible=false;onFail(new Error('webgl'))});
  spawn(species,{shadows:true}).then(c=>{
   this.animal=c;c.holder.rotation.y=-1.1;this.scene.add(c.holder);c.holder.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(c.model.root);this.size=box.getSize(new THREE.Vector3());this.center=box.getCenter(new THREE.Vector3());
   c.holder.position.y=-box.min.y;this.center.y-=box.min.y;this.resize();onReady(c);
  }).catch(e=>{console.warn(e);onFail(e)});
  this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);
 }
 resize(){
  const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  if(!this.size)return;
  // Back off until the whole animal fits the box, from a front three-quarter view slightly above.
  const span=Math.max(this.size.x,this.size.z,this.size.y*1.4),fit=span/(2*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)))/Math.min(1,this.camera.aspect);
  const dir=new THREE.Vector3(-.62,.28,-.74).normalize();this.camera.position.copy(this.center).addScaledVector(dir,fit*1.3);this.camera.lookAt(this.center.x,this.center.y*.9,this.center.z);
 }
 tick(now){
  requestAnimationFrame(this.tick);const ms=now-this.last,dt=Math.min(.05,ms/1000);this.last=now;if(!this.visible||document.hidden)return;this.guard?.frame(ms);
  if(this.animal&&!this.reduced)this.animal.animator.update(dt);
  this.renderer.render(this.scene,this.camera);
 }
}
