import * as THREE from 'three';
import {SPECIES} from './generated/species.js';
import {spawn,createModel,assetUrl,Animator} from './rig.js';
import {compileClip} from './animation.js';
import {floatingIsland} from './blocks.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,damp=THREE.MathUtils.damp;
const smooth=(p,a,b)=>{const x=clamp((p-a)/(b-a),0,1);return x*x*x*(x*(x*6-15)+10)};
const rex=SPECIES.find(s=>s.id==='tyrannosaurus');

// The meteor's flight, in metres: from deep in the sky, behind the island, to just past the T. rex.
const PATH=new THREE.QuadraticBezierCurve3(new THREE.Vector3(120,105,-260),new THREE.Vector3(46,64,-120),new THREE.Vector3(-15,-1,-30));
// The roar is scrubbed by the scroll between these two points of the film.
export const ROAR=[.36,.84];

async function loadMeteor(){
 const [data,map,glow]=await Promise.all([fetch(assetUrl('meteor/meteor.json')).then(r=>r.json()),...['meteor','meteor_glow'].map(n=>new THREE.TextureLoader().loadAsync(assetUrl(`meteor/${n}.png`)))]);
 for(const t of [map,glow]){t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace}
 const model=createModel(data,map);Object.assign(model.material,{emissive:new THREE.Color(0xffffff),emissiveMap:glow,emissiveIntensity:2.2});
 const holder=new THREE.Group(),spin=new THREE.Group();spin.add(model.root);holder.add(spin);model.root.position.y=-24/16;model.root.scale.setScalar(1/16);
 const clips={fall:compileClip(data.animations.fall)};return {holder,model,animator:new Animator(model,clips,{name:'fall'})};
}

// Square embers and smoke puffs, like the game's particles.
class Trail{
 constructor(scene,count=360){
  this.mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.95,depthWrite:false}),count);
  this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.mesh.frustumCulled=false;this.parts=Array.from({length:count},()=>({life:0}));this.next=0;scene.add(this.mesh);
  this.m=new THREE.Matrix4();this.c=new THREE.Color();this.q=new THREE.Quaternion();this.hot=new THREE.Color(0xffc45c);this.cool=new THREE.Color(0xf07a1a);this.smoke=new THREE.Color(0x5a4a50);this.zero=new THREE.Vector3();
 }
 emit(at,dir,n,size){for(let i=0;i<n;i++){const p=this.parts[this.next];this.next=(this.next+1)%this.parts.length;p.life=p.max=.8+Math.random()*1.4;p.pos=at.clone().add(new THREE.Vector3((Math.random()-.5)*size,(Math.random()-.5)*size,(Math.random()-.5)*size));p.vel=dir.clone().multiplyScalar(-2-Math.random()*4).add(new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.5,(Math.random()-.5)*2));p.size=size*(.25+Math.random()*.35);p.smoke=Math.random()<.35}}
 update(dt){const v=new THREE.Vector3();this.parts.forEach((p,i)=>{if(p.life>0){p.life-=dt;p.pos.addScaledVector(p.vel,dt)}const k=Math.max(0,p.life/(p.max||1)),s=p.life>0?p.size*(p.smoke?1.6-k*.6:k):0;
  this.m.compose(p.pos||this.zero,this.q,v.set(s,s,s));this.mesh.setMatrixAt(i,this.m);this.c.copy(p.smoke?this.smoke:this.cool).lerp(this.hot,p.smoke?0:k*k);this.mesh.setColorAt(i,this.c)});
  this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true}
}

// Flat blocky clouds drifting over the amber sky.
function clouds(){const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color:0xfff4dc,transparent:true,opacity:.55,depthWrite:false});
 [[-60,48,-120,36,14],[30,58,-160,48,18],[90,44,-90,28,12],[-110,62,-200,56,20],[0,70,-230,40,16],[140,64,-180,44,14]].forEach(([x,y,z,w,d])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,3,d),mat);m.position.set(x,y,z);g.add(m)});return g}

export class Hero{
 constructor(host,{onProgress=()=>{},onReady=()=>{},onFail=()=>{}}={}){
  this.host=host;this.onProgress=onProgress;this.onRoar=()=>{};this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.mobile=innerWidth<760;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){onFail(e);return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.5:1.75));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.setClearColor(0,0);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.3,1200);
  this.scene.add(new THREE.HemisphereLight(0xfff0d0,0x6b4a2a,1.9));
  const sun=new THREE.DirectionalLight(0xfff1d6,2.6);sun.position.set(24,40,30);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;this.scene.add(sun);
  this.fire=new THREE.PointLight(0xff8a2a,0,160,1.4);this.scene.add(this.fire);
  this.island=floatingIsland();this.scene.add(this.island,clouds());this.trail=new Trail(this.scene);
  this.progress=0;this.target=0;this.time=0;this.last=performance.now();this.pointer=new THREE.Vector2();this.look=new THREE.Vector2();this.visible=true;this.roarPlayed=false;
  this.tick=this.tick.bind(this);new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  addEventListener('pointermove',e=>{this.pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5)},{passive:true});
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting},{rootMargin:'60px'}).observe(host);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.visible=false;onFail(new Error('webgl'))});
  Promise.all([spawn(rex,{shadows:true}).then(c=>{this.rex=c;c.holder.position.set(1,0,1.5);c.holder.rotation.y=-2.86;this.scene.add(c.holder);onProgress(.6);onReady()}),
   loadMeteor().then(m=>{this.meteor=m;this.scene.add(m.holder);onProgress(1)})]).catch(e=>{console.warn(e);onFail(e)});
  requestAnimationFrame(this.tick);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.portrait=w<h;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.fov=this.portrait?50:32;this.camera.updateProjectionMatrix()}
 setProgress(p){this.target=this.reduced?.62:clamp(p,0,1)}
 tick(now){
  requestAnimationFrame(this.tick);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;if(!this.visible||document.hidden)return;this.step(dt);
 }
 step(dt){
  this.time+=dt;this.progress=this.reduced?this.target:damp(this.progress,this.target,6,dt);const p=this.progress;
  // The meteor: far and slow at first, then it falls fast. Its glow lights the island from above.
  const u=Math.pow(smooth(p,.06,.97),1.6),pos=PATH.getPoint(u),dir=PATH.getTangent(u).normalize(),near=smooth(u,.35,1);
  if(this.meteor){const m=this.meteor;m.holder.position.copy(pos);m.holder.lookAt(pos.clone().sub(dir));m.holder.scale.setScalar(lerp(2.2,3.6,near));m.animator.update(this.reduced?0:dt);
   if(!this.reduced&&p>.04&&p<.99)this.trail.emit(pos.clone().addScaledVector(dir,-4),dir,Math.ceil(2+near*6),lerp(2.2,4.2,near));}
  this.trail.update(this.reduced?0:dt);this.fire.position.copy(pos);this.fire.intensity=near*near*900;
  // The T. rex: idle, then the roar follows the scroll; it is louder in the pose the closer the meteor is.
  if(this.rex){const a=this.rex.animator,w=smooth(p,ROAR[0]-.03,ROAR[0]+.02)*(1-smooth(p,ROAR[1],ROAR[1]+.05));
   a.scrub('roar',(p-ROAR[0])/(ROAR[1]-ROAR[0])*a.clips.roar.length,w);a.update(this.reduced?0:dt);
   if(p>ROAR[0]+.01&&!this.roarPlayed){this.roarPlayed=true;this.onRoar()}if(p<ROAR[0]-.04)this.roarPlayed=false;}
  // Camera: a slow dolly towards the animal, a tilt up to the sky and a shake as the meteor arrives.
  this.look.x=damp(this.look.x,this.pointer.x,3,dt);this.look.y=damp(this.look.y,this.pointer.y,3,dt);
  const k=smooth(p,0,.85),shake=this.reduced?0:near*near*.22*(Math.sin(this.time*47)+Math.sin(this.time*31.7)),far=this.portrait?1.45:1;
  const side=this.portrait?0:1;
  this.camera.position.set(lerp(20,8,k)*far+this.look.x*1.5+shake,lerp(7,3.4,k)-this.look.y*.8+shake*.6,lerp(44,19,k)*far);
  this.camera.lookAt(lerp(-9*side,-3*side,k),lerp(3.5,6.8,k)+(this.portrait?2:0),lerp(0,-6,k));
  this.renderer.render(this.scene,this.camera);
 }
}
