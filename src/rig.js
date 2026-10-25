import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {compileClip,sampleBone,actionWeight,fadeWeight} from './animation.js';
const radians=n=>(Number(n)||0)*Math.PI/180;
const BASE=import.meta.env?.BASE_URL??'/';
export const assetUrl=path=>`${BASE}assets/${path}`;

// Clips made for the site on the mod's rig (scripts/web-roar.py); they replace the game clip of the same name.
const WEB_CLIPS={tyrannosaurus:{roar:'species/tyrannosaurus.roar.json'}};
// One request per species, shared by the hero, the bestiary viewer and the thumbnails.
const cache=new Map(),textures=new Map();
export function loadSpecies(id){
 const get=path=>fetch(assetUrl(path)).then(r=>{if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json()});
 if(!cache.has(id))cache.set(id,Promise.all([get(`species/${id}.json`),...Object.entries(WEB_CLIPS[id]||{}).map(([name,path])=>get(path).then(raw=>[name,raw]).catch(()=>null))]).then(([data,...extra])=>{
  const clips=Object.fromEntries(Object.entries(data.animations).map(([k,v])=>[k,compileClip(v)]));
  for(const e of extra)if(e)clips[e[0]]=compileClip(e[1]);
  return {...data,clips};
 }).catch(e=>{cache.delete(id);throw e}));
 return cache.get(id);
}
export function loadTexture(id,sex){
 const key=`${id}_${sex}`;
 if(!textures.has(key))textures.set(key,new THREE.TextureLoader().loadAsync(assetUrl(`species/${key}.png`)).then(t=>{t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return t}).catch(e=>{textures.delete(key);throw e}));
 return textures.get(key);
}
export function addClip(id,name,raw){return loadSpecies(id).then(d=>{d.clips[name]=compileClip(raw);return d})}

// Builds the Blockbench rig (16 px = 1 m) from the compact model. BoxGeometry face order: east, west, up, down, south, north.
// merge: one draw call per bone (for scenes with many creatures); the per-cube depth bias becomes a tiny inflate.
export function createModel(data,texture,sex='male',{shadows=false,merge=false}={}){
 const model=data.model??data,root=new THREE.Group(),bones=new Map(),[w,h]=model.res;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:1,metalness:0,alphaTest:.3,side:THREE.FrontSide,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:0});
 const meshes=[];
 function cube(index,parent,pivot){
  const [name,from,to,origin,rotation,inflate,faces]=model.cubes[index];
  const size=from.map((n,i)=>Math.max(.005,to[i]-n+2*(inflate||0)+(merge?index*.0016:0)));
  const geo=new THREE.BoxGeometry(...size),uv=geo.attributes.uv;
  faces.forEach((f,i)=>{
   const coords=[[f[0]/w,1-f[1]/h],[f[2]/w,1-f[1]/h],[f[0]/w,1-f[3]/h],[f[2]/w,1-f[3]/h]];
   for(let j=0;j<Math.round((f[4]||0)/90);j++){const c=[...coords];[coords[0],coords[1],coords[3],coords[2]]=[c[2],c[0],c[1],c[3]];}
   for(let j=0;j<4;j++)uv.setXY(i*4+j,...coords[j]);
  });
  if(merge){const m=new THREE.Matrix4().compose(new THREE.Vector3(...origin.map((v,i)=>v-pivot[i])),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation.map(radians),'ZYX')),new THREE.Vector3(1,1,1)).multiply(new THREE.Matrix4().makeTranslation(...from.map((v,i)=>(v+to[i])/2-origin[i])));geo.applyMatrix4(m);(parent.userData.parts??=[]).push(geo);return;}
  const mesh=new THREE.Mesh(geo,material);mesh.name=name;mesh.castShadow=shadows;mesh.receiveShadow=shadows;
  // Skin cubes can share a coplanar boundary across moving bones; a tiny per-cube depth bias keeps them stable.
  const bias=-(index+1)*.25;mesh.onBeforeRender=(_r,_s,_c,_g,mat)=>{mat.polygonOffsetUnits=bias};
  const holder=new THREE.Group();holder.position.set(...origin.map((v,i)=>v-pivot[i]));holder.rotation.set(...rotation.map(radians),'ZYX');
  mesh.position.set(...from.map((v,i)=>(v+to[i])/2-origin[i]));holder.add(mesh);parent.add(holder);meshes.push(mesh);
 }
 function bone(b,parent,pivot,hidden){
  const group=new THREE.Group();group.name=b.n;group.position.set(...b.o.map((v,i)=>v-pivot[i]));group.rotation.set(...(b.r||[0,0,0]).map(radians),'ZYX');
  group.userData.baseRotation=group.rotation.clone();group.userData.basePosition=group.position.clone();
  const hide=hidden||b.h||/saddle/.test(b.n)||(sex==='male'?/^female/.test(b.n):/^male/.test(b.n));
  group.visible=!hide;parent.add(group);bones.set(b.n,group);
  for(const k of b.k)typeof k==='number'?cube(k,group,b.o):bone(k,group,b.o,hide);
  if(group.userData.parts){const mesh=new THREE.Mesh(mergeGeometries(group.userData.parts),material);mesh.castShadow=shadows;mesh.receiveShadow=shadows;for(const g of group.userData.parts)g.dispose();delete group.userData.parts;group.add(mesh);meshes.push(mesh);}
 }
 for(const b of model.bones)bone(b,root,[0,0,0],false);
 return {root,bones,material,meshes,dispose(){for(const m of meshes)m.geometry.dispose();material.dispose()}};
}

// Plays the mod's clips with cross-fades between loops and one-shot actions layered on top.
export class Animator{
 constructor(model,clips,{name='idle',fade=.35}={}){this.model=model;this.clips=clips;this.fade=fade;this.current={name,clip:clips[name]||clips.idle,time:Math.random()*4};this.previous=null;this.action=null;this.speed=1;}
 has(name){return !!this.clips[name]}
 play(name,{fade=this.fade,restart=false}={}){
  if(!this.clips[name])return false;if(this.current.name===name&&!restart)return true;
  this.previous={...this.current,elapsed:0,duration:fade};this.current={name,clip:this.clips[name],time:0};return true;
 }
 // Holds a clip at a given time and weight, for poses driven by the page scroll instead of the clock.
 scrub(name,time,weight){const clip=this.clips[name];this.scrubbing=clip&&weight>0?{clip,time:Math.max(0,Math.min(clip.length,time)),weight}:null}
 trigger(name,onEnd){const clip=this.clips[name];if(!clip)return false;this.action={name,clip,time:0,onEnd};return true;}
 get acting(){return !!this.action}
 update(dt){
  dt*=this.speed;this.current.time+=dt;
  if(this.previous){this.previous.time+=dt;this.previous.elapsed+=dt/this.speed;if(this.previous.elapsed>=this.previous.duration)this.previous=null;}
  let actionW=0;if(this.action){this.action.time+=dt;if(this.action.time>=this.action.clip.length){const end=this.action.onEnd;this.action=null;end?.()}else actionW=actionWeight(this.action.time,this.action.clip.length);}
  // A non-looping base clip (eat, call…) holds its last pose; loops wrap inside sampleTrack.
  const fadeW=this.previous?fadeWeight(this.previous.elapsed,this.previous.duration):1;
  for(const [name,bone] of this.model.bones){
   bone.rotation.copy(bone.userData.baseRotation);bone.position.copy(bone.userData.basePosition);
   let s=sampleBone(this.current.clip,name,this.current.time);
   if(this.previous)s=mix(sampleBone(this.previous.clip,name,this.previous.time),s,fadeW);
   if(actionW)s=mix(s,sampleBone(this.action.clip,name,this.action.time),actionW);
   if(this.scrubbing)s=mix(s,sampleBone(this.scrubbing.clip,name,this.scrubbing.time),this.scrubbing.weight);
   // Bedrock animation channels use (-x, -y, z) relative to the Blockbench rig.
   bone.rotation.x-=radians(s.rotation[0]);bone.rotation.y-=radians(s.rotation[1]);bone.rotation.z+=radians(s.rotation[2]);
   bone.position.x-=s.position[0];bone.position.y+=s.position[1];bone.position.z+=s.position[2];
   bone.scale.set(s.scale[0],s.scale[1],s.scale[2]);
  }
 }
}
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function mix(a,b,t){return {rotation:lerp(a.rotation,b.rotation,t),position:lerp(a.position,b.position,t),scale:lerp(a.scale,b.scale,t)}}

// A creature placed in a scene in metres: the rig is scaled from model pixels with the mod's own MODEL_SCALE.
export async function spawn(species,{sex='male',shadows=false,animation='idle',merge=false}={}){
 const [data,texture]=await Promise.all([loadSpecies(species.id),loadTexture(species.id,sex)]);
 const model=createModel(data,texture,sex,{shadows,merge});
 const holder=new THREE.Group();holder.add(model.root);model.root.scale.setScalar(species.scale/16);
 const animator=new Animator(model,data.clips,{name:data.clips[animation]?animation:'idle'});
 return {species,holder,model,animator,data,dispose(){model.dispose()}};
}
