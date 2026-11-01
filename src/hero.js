import * as THREE from 'three';
import {SPECIES} from './generated/species.js';
import {spawn,createModel,assetUrl,Animator,QualityGuard} from './rig.js';
import {compileClip} from './animation.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp,damp=THREE.MathUtils.damp;
const smooth=(p,a,b)=>{const x=clamp((p-a)/(b-a),0,1);return x*x*x*(x*(x*6-15)+10)};
const rex=SPECIES.find(s=>s.id==='tyrannosaurus');

// The opening, scrubbed by the scroll: the T. rex roars while the camera pulls back, then it opens its jaw and the
// camera dives into the mouth until it swallows the screen.
export const ROAR=[.06,.5],GAPE=[.56,.86],SWALLOW=[.8,1];

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

export class Hero{
 constructor(host,{onProgress=()=>{},onReady=()=>{},onFail=()=>{},avoid=()=>[]}={}){
  this.host=host;this.onProgress=onProgress;this.avoid=avoid;this.fit={s:1,x:0,y:0,o:1};this.snap=true;this.onRoar=()=>{};this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.mobile=innerWidth<760;
  try{this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){onFail(e);return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,this.mobile?1.5:1.75));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.setClearColor(0,0);
  r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(30,1,.05,400);
  this.scene.add(new THREE.HemisphereLight(0xfff0d0,0x7a5a32,2));
  const sun=new THREE.DirectionalLight(0xfff1d6,2.6);sun.position.set(-10,22,18);sun.castShadow=true;sun.shadow.mapSize.set(this.mobile?1024:2048,this.mobile?1024:2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:80});sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;this.scene.add(sun);this.guard=new QualityGuard(r,{shadows:[sun]});
  const rim=new THREE.DirectionalLight(0xf07a1a,1.4);rim.position.set(12,8,-14);this.scene.add(rim);
  // A neutral floor that only catches the shadow, so the animal stands on the page colour.
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({color:0x3b2a1a,opacity:.28}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
  this.progress=0;this.target=0;this.time=0;this.last=performance.now();this.pointer=new THREE.Vector2();this.look=new THREE.Vector2();this.visible=true;this.roarPlayed=false;
  this.head=new THREE.Vector3();this.mouth=new THREE.Vector3();this.tmp=new THREE.Vector3();
  this.tick=this.tick.bind(this);new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  addEventListener('pointermove',e=>{this.pointer.set(e.clientX/innerWidth-.5,e.clientY/innerHeight-.5)},{passive:true});
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting},{rootMargin:'60px'}).observe(host);
  r.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.visible=false;onFail(new Error('webgl'))});
  spawn(rex,{shadows:true}).then(c=>{this.rex=c;c.holder.rotation.y=-2.55;this.scene.add(c.holder);onProgress(1);onReady()}).catch(e=>{console.warn(e);onFail(e)});
  requestAnimationFrame(this.tick);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.w=w;this.h=h;this.portrait=w<h;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(1,h);this.camera.fov=this.portrait?48:30;
  // On a phone the animal is drawn higher, between the title and the copy; frame() then keeps it clear of the text.
  this.lift=this.portrait?h*.14:0;this.lens(1,0,this.lift)}
 lens(zoom,x,y){this.camera.zoom=zoom;this.camera.setViewOffset(this.w,this.h,x,y,this.w,this.h);this.camera.updateProjectionMatrix()}
 // The animal's outline on screen (px from the stage's corner), from the boxes of its blocks, with the plain lens.
 outline(){
  this.lens(1,0,this.lift);this.camera.updateMatrixWorld();const v=this.tmp,b={l:1e9,t:1e9,r:-1e9,btm:-1e9};
  for(const m of this.rex.model.meshes){if(!m.visible)continue;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const {min,max}=m.geometry.boundingBox;
   for(let i=0;i<8;i++){v.set(i&1?max.x:min.x,i&2?max.y:min.y,i&4?max.z:min.z).applyMatrix4(m.matrixWorld).project(this.camera);if(v.z>1)continue;
    const x=(v.x+1)/2*this.w,y=(1-v.y)/2*this.h;b.l=Math.min(b.l,x);b.r=Math.max(b.r,x);b.t=Math.min(b.t,y);b.btm=Math.max(b.btm,y)}}
  return b;
 }
 // Keeps the animal off the copy: finds the free part of the visible stage beside the captions shown right now and
 // pans the lens (shrinking it only when it has to) so the animal's outline fits there. Fades out before the dive.
 frame(dt,weight){
  const host=this.host.getBoundingClientRect(),H=Math.min(this.h,innerHeight-host.top),pad=12;
  const box=this.outline(),cx=this.w/2,cy=this.h/2;
  // A part of the animal already past an edge of the screen may stay there, so each edge reaches as far as it does
  // (but nothing hidden may come into view by the move).
  const B={l:box.l,t:box.t,r:box.r,b:box.btm},E={l:Math.min(0,B.l),t:Math.min(0,B.t),r:Math.max(this.w,B.r),b:Math.max(H,B.b)};
  let want={s:1,x:0,y:0};
  const blocks=weight>0&&B.r>0&&B.l<this.w&&B.b>0&&B.t<H?this.avoid().map(r=>({l:r.left-host.left-pad,t:r.top-host.top-pad,r:r.right-host.left+pad,b:r.bottom-host.top+pad})).filter(o=>o.r>0&&o.l<this.w&&o.b>0&&o.t<H):[];
  if(blocks.length&&blocks.some(o=>o.l<B.r&&o.r>B.l&&o.t<B.b&&o.b>B.t)){
   // Candidate free rectangles: every mix of edges taken from the screen and the blocks that crosses no block.
   const xs0=[E.l,...blocks.map(o=>o.r)],xs1=[E.r,...blocks.map(o=>o.l)],ys0=[E.t,...blocks.map(o=>o.b)],ys1=[E.b,...blocks.map(o=>o.t)];
   const bw=B.r-B.l,bh=B.b-B.t,bx=(B.l+B.r)/2,by=(B.t+B.b)/2;let best=null;
   for(const l of xs0)for(const r of xs1)for(const t of ys0)for(const b of ys1){
    if(r-l<40||b-t<40||blocks.some(o=>o.l<r&&o.r>l&&o.t<b&&o.b>t))continue;
    const s=Math.min(1,(r-l)/bw,(b-t)/bh),w2=bw*s/2,h2=bh*s/2;
    // Where the outline lands after zooming about the centre of the lens, then the least move that puts it inside.
    const zx=cx+(bx-cx)*s,zy=cy+(by+this.lift-cy)*s-this.lift,tx=clamp(zx,l+w2,r-w2),ty=clamp(zy,t+h2,b-h2);
    const score=Math.round(s*50)*1e6-Math.hypot(tx-bx,ty-by);
    if(!best||score>best.score)best={score,s,x:zx-tx,y:zy-ty};
   }
   // On a short screen there may be no room at all: rather than a tiny animal in a corner, it waits out of sight
   // until the captions scroll away.
   want=best&&best.s>=.5?{s:best.s,x:best.x,y:best.y,o:1}:{s:1,x:0,y:0,o:0};
  }
  const f=this.fit,k=this.reduced?1:1-Math.exp(-5*dt),to={s:lerp(1,want.s,weight),x:want.x*weight,y:want.y*weight,o:lerp(1,want.o??1,weight)};
  for(const key of ['s','x','y','o'])f[key]+=(to[key]-f[key])*(this.snap?1:k);this.snap=false;
  this.renderer.domElement.style.opacity=f.o>.99?'':f.o.toFixed(3);
  // zoom scales about the centre of the lens; the view offset then slides the picture by (x, y) px.
  this.lens(f.s,f.x,f.y+this.lift);
 }
 setProgress(p){this.target=this.reduced?.3:clamp(p,0,1)}
 tick(now){
  requestAnimationFrame(this.tick);const ms=now-this.last,dt=Math.min(.05,ms/1000);this.last=now;if(!this.visible||document.hidden)return;if(!this.pixLevel)this.guard?.frame(ms);this.step(dt);
 }
 step(dt){
  this.time+=dt;this.progress=this.reduced?this.target:damp(this.progress,this.target,6,dt);const p=this.progress;
  // The end of the dive: the picture breaks into ever bigger blocks, in steps, like the game's own pixels (the
  // canvas is drawn at a lower resolution each step and shown with image-rendering: pixelated).
  const lv=this.reduced?0:Math.min(6,Math.floor(clamp((p-.74)/.16,0,1)*7));
  if(lv!==(this.pixLevel||0)){if(!this.pixLevel)this.baseRatio=this.renderer.getPixelRatio();this.pixLevel=lv;this.renderer.setPixelRatio(lv?this.baseRatio/2**lv:this.baseRatio);this.resize()}
  if(!this.rex){this.renderer.render(this.scene,this.camera);return}
  const a=this.rex.animator,bones=this.rex.model.bones;
  // The roar follows the scroll; after it, the jaw opens wide and stays open for the swallow.
  const w=smooth(p,ROAR[0]-.04,ROAR[0]+.02)*(1-smooth(p,ROAR[1],ROAR[1]+.05));
  a.scrub('roar',(p-ROAR[0])/(ROAR[1]-ROAR[0])*a.clips.roar.length,w);a.update(this.reduced?0:dt);
  if(p>ROAR[0]+.01&&!this.roarPlayed){this.roarPlayed=true;this.onRoar()}if(p<ROAR[0]-.04)this.roarPlayed=false;
  const gape=smooth(p,GAPE[0],GAPE[1]),jaw=bones.get('jaw'),neck=bones.get('neck1'),skull=bones.get('skull');
  if(jaw){const open=gape*THREE.MathUtils.degToRad(52);jaw.rotation.x=Math.min(jaw.rotation.x,jaw.userData.baseRotation.x-open)}
  if(neck)neck.rotation.x+=gape*.16;if(skull)skull.rotation.x+=gape*.1;
  this.rex.holder.updateMatrixWorld(true);
  (skull||bones.get('head')).getWorldPosition(this.head);
  // The mouth: just above the lower jaw's teeth, measured from the jaw's own blocks (bone pivots sit at the hinge).
  if(jaw){this.box=(this.box||new THREE.Box3()).setFromObject(jaw);this.box.getCenter(this.mouth);this.mouth.y=this.box.max.y+.55}else this.mouth.copy(this.head);
  // Camera: close on the face, pull back to the whole animal while it roars, then fly into the open mouth.
  this.look.x=damp(this.look.x,this.pointer.x,3,dt);this.look.y=damp(this.look.y,this.pointer.y,3,dt);
  const far=this.portrait?1.5:1,out=smooth(p,0,.32)*(1-smooth(p,.5,.78)),dive=smooth(p,.62,.98);
  // Front three-quarter direction the animal faces (the model looks down -Z, turned by its yaw).
  const yaw=this.rex.holder.rotation.y,front=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),sideV=new THREE.Vector3(front.z,0,-front.x);
  const target=this.head.clone().lerp(new THREE.Vector3(0,4.2,0),out*.75);
  // Into the mouth: aim just above the lower teeth.
  const mouth=this.mouth.clone();
  const dist=lerp(lerp(9,30,out),1.1,dive)*far;
  const eye=target.clone().lerp(mouth,dive).addScaledVector(front,dist).addScaledVector(sideV,lerp(dist*.35,0,dive)).add(new THREE.Vector3(0,lerp(dist*.12,.15,dive),0));
  const look=target.lerp(mouth,dive);
  const shake=this.reduced?0:w*.06*(Math.sin(this.time*39)+Math.sin(this.time*27))*(1-dive);
  this.camera.position.copy(eye.lerp(mouth.clone().addScaledVector(front,-.6),smooth(p,.9,1))).add(new THREE.Vector3(this.look.x*(1-dive)+shake,-this.look.y*.5*(1-dive)+shake,0));
  this.camera.lookAt(look);
  // The captions are gone by .56; the fit lets go before the dive so the camera still flies into the mouth.
  this.frame(dt,1-smooth(p,.56,.64));
  this.renderer.render(this.scene,this.camera);
 }
}
