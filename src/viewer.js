import * as THREE from 'three';
import {compileClip,sampleBone,actionWeight} from './animation.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const radians = n => (Number(n)||0)*Math.PI/180;
const assets = new Map();
async function getAssets(id){
 if(!assets.has(id)) assets.set(id,Promise.all([fetch(`/assets/${id}/model.json`).then(checkJSON),fetch(`/assets/${id}/animations.json`).then(checkJSON),id==='tyrannosaurus'?fetch(`/assets/${id}/presentation-roar.json`).then(checkJSON):Promise.resolve(null)]).catch(e=>{assets.delete(id);throw e}));
 return assets.get(id);
}
async function checkJSON(r){if(!r.ok)throw new Error('Recurso não encontrado');return r.json()}
export function createModel(data,texture,sex){
 const root=new THREE.Group(), bones=new Map(), material=new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0,alphaTest:.3,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:0});
 const elements=new Map(data.elements.map(e=>[e.uuid,e]));
 const depthLayers=new Map(data.elements.map((e,i)=>[e.uuid,-(i+1)*.25]));
 function walk(item,parent,pivot=[0,0,0],hidden=false){
  if(typeof item==='string'){
   const e=elements.get(item);if(!e||e.visibility===false||hidden||e.type!=='cube')return;
   const from=e.from,to=e.to,size=from.map((n,i)=>Math.max(.005,to[i]-n+2*(e.inflate||0)));
   const geo=new THREE.BoxGeometry(...size),uv=geo.attributes.uv;
   // Blockbench per-face UVs: BoxGeometry material order is east, west, up, down, south, north.
   ['east','west','up','down','south','north'].forEach((face,i)=>{
    const f=e.faces[face],v=f?.uv||[0,0,0,0],w=data.resolution.width,h=data.resolution.height;
    const coords=[[v[0]/w,1-v[1]/h],[v[2]/w,1-v[1]/h],[v[0]/w,1-v[3]/h],[v[2]/w,1-v[3]/h]];
    if(f?.rotation){for(let j=0;j<Math.round(f.rotation/90);j++){const c=[...coords];[coords[0],coords[1],coords[3],coords[2]]=[c[2],c[0],c[1],c[3]];}}
    for(let j=0;j<4;j++)uv.setXY(i*4+j,...coords[j]);
   });
   const mesh=new THREE.Mesh(geo,material);mesh.name=e.name;
   // Authored skin cubes can share a coplanar boundary across moving bones.
   // A tiny deterministic depth bias keeps those layers stable without moving vertices.
   mesh.onBeforeRender=(_renderer,_scene,_camera,_geometry,mat)=>{mat.polygonOffsetUnits=depthLayers.get(e.uuid)};
   const origin=e.origin||[0,0,0],holder=new THREE.Group();
   holder.position.set(...origin.map((v,i)=>v-pivot[i]));holder.rotation.set(...(e.rotation||[0,0,0]).map(radians),'ZYX');
   mesh.position.set(...from.map((v,i)=>(v+to[i])/2-origin[i]));holder.add(mesh);parent.add(holder);return;
  }
  const origin=item.origin||[0,0,0],group=new THREE.Group();group.name=item.name;
  group.position.set(...origin.map((v,i)=>v-pivot[i]));group.rotation.set(...(item.rotation||[0,0,0]).map(radians),'ZYX');
  group.userData.baseRotation=group.rotation.clone();group.userData.basePosition=group.position.clone();
  const hide=hidden||item.visibility===false||/saddle/.test(item.name)||(sex==='male'?/^female/.test(item.name):/^male/.test(item.name));
  group.visible=!hide;parent.add(group);bones.set(item.name,group);
  for(const child of item.children||[])walk(child,group,origin,hide);
 }
 for(const b of data.outliner)walk(b,root);
 return {root,bones,material};
}
export class CreatureViewer{
 constructor(container,{hero=false,onLoad=()=>{},onError=()=>{}}={}){
  this.container=container;this.hero=hero;this.onLoad=onLoad;this.onError=onError;this.autoRotate=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.active=true;this.request=0;this.sex='male';this.animation='idle';this.model=null;this.start=performance.now();
  try{this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){this.onError(e);return;}
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0,0);container.append(this.renderer.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.1,40);this.camera.position.set(4,2,-6);
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.enablePan=false;this.controls.enableZoom=!hero;this.controls.autoRotate=this.autoRotate;this.controls.autoRotateSpeed=.65;this.controls.maxPolarAngle=Math.PI*.8;this.controls.minDistance=2;this.controls.maxDistance=15;
  if(hero){this.controls.enableRotate=false;this.controls.autoRotate=false;this.renderer.domElement.style.pointerEvents='none'}
  this.scene.add(new THREE.HemisphereLight(0xffead8,0x60516d,2.5));const key=new THREE.DirectionalLight(0xffe8c4,3.2);key.position.set(-3,5,-4);this.scene.add(key);const rim=new THREE.DirectionalLight(0xffb044,3.7);rim.position.set(3,2,2);this.scene.add(rim);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  this.intersectionObserver=new IntersectionObserver(entries=>{this.active=entries[0].isIntersecting},{rootMargin:'120px'});this.intersectionObserver.observe(container);
  this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
  this.contextLost=e=>{e.preventDefault();this.active=false;this.onError(new Error('WebGL indisponível'))};this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost);
 }
 resize(){if(!this.renderer)return;const w=this.container.clientWidth,h=this.container.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/Math.max(h,1);this.camera.updateProjectionMatrix();this.onResize?.();}
 async load(id,sex=this.sex){
  if(!this.renderer)return;
  const request=++this.request;this.id=id;this.sex=sex;
  try{
   const [data,animations,presentation]=await getAssets(id);const texture=await new THREE.TextureLoader().loadAsync(`/assets/${id}/${sex}.png`);
   if(request!==this.request){texture.dispose();return}
   texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;
   const next=createModel(data,texture,sex);this.clearModel();this.texture=texture;this.model=next;this.animations={...animations.animations,...(presentation?{[`animation.${id}.presentation_roar`]:presentation}:{})};this.clips=Object.fromEntries(Object.entries(this.animations).map(([name,raw])=>[name.split('.').at(-1),compileClip(raw)]));this.action=null;
   const box=new THREE.Box3().setFromObject(next.root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   const scale=4/Math.max(size.x,size.y,size.z);next.root.position.copy(center).multiplyScalar(-scale);next.root.scale.setScalar(scale);
   const wrapper=new THREE.Group();wrapper.add(next.root);this.wrapper=wrapper;this.scene.add(wrapper);this.setAnimation(this.animation);this.reset();this.start=performance.now();
   this.container.querySelector('.model-fallback')?.setAttribute('hidden','');this.onLoad(Object.keys(this.animations).map(k=>k.split('.').at(-1)));
  }catch(e){if(request===this.request)this.onError(e)}
 }
 clearModel(){if(!this.model)return;this.scene.remove(this.wrapper);this.model.root.traverse(o=>{o.geometry?.dispose()});this.model.material.dispose();this.texture?.dispose();this.model=null;}
 setAnimation(name){this.animation=name;this.start=performance.now()}
 playAction(name){const clip=this.clips?.[name];if(!clip)return false;this.action={name,start:performance.now(),clip};return true;}
 reset(){if(!this.controls)return;this.camera.position.set(this.hero?-4.6:4.4,this.hero?1.6:2,this.hero?-5.5:-5.9);this.controls.target.set(0,0,0);this.controls.update();this.controls.saveState();}
 tick(now){this.raf=requestAnimationFrame(this.tick);if(!this.active||document.hidden||!this.renderer)return;
  if(this.model){
   const clip=this.clips?.[this.animation]||this.clips?.idle;
   const time=this.reducedMotion?0:((now-this.start)/1000);
   const action=this.action,actionTime=action?(now-action.start)/1000:0;
   if(action&&actionTime>=action.clip.length){this.action=null;this.onActionEnd?.();}
   const weight=this.action?actionWeight(actionTime,action.clip.length):0;this.actionBlend=weight;
   for(const [name,bone] of this.model.bones){
    bone.rotation.copy(bone.userData.baseRotation);bone.position.copy(bone.userData.basePosition);
    const base=sampleBone(clip,name,time),pose=weight?sampleBone(action.clip,name,actionTime):base;
    const r=base.rotation.map((v,i)=>THREE.MathUtils.lerp(v,pose.rotation[i],weight));
    const p=base.position.map((v,i)=>THREE.MathUtils.lerp(v,pose.position[i],weight));
    // Bedrock animation channels use (-x, -y, z) relative to the Blockbench rig.
    bone.rotation.x-=radians(r[0]);bone.rotation.y-=radians(r[1]);bone.rotation.z+=radians(r[2]);
    bone.position.x-=p[0];bone.position.y+=p[1];bone.position.z+=p[2];
   }
   if(this.hero)this.wrapper.rotation.y=-.15+(this.reducedMotion?0:Math.sin(now*.00013)*.12);
  }
  this.controls.autoRotate=!this.hero&&this.autoRotate;this.controls.update();this.beforeRender?.(now);this.renderer.render(this.scene,this.camera);
 }
 dispose(){cancelAnimationFrame(this.raf);this.request++;this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();this.controls?.dispose();this.clearModel();this.renderer?.dispose();this.renderer?.domElement.remove();}
}
