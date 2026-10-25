import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {compileClip,compileTrack,sampleTrack,actionWeight,fadeWeight} from '../src/animation.js';
import {createModel} from '../src/rig.js';
import {SPECIES} from '../src/generated/species.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const species=id=>json(`../public/assets/species/${id}.json`);
const close=(a,b,epsilon=1e-5)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`);

test('every species has a model, both textures and an idle loop',()=>{
 assert.ok(SPECIES.length>=59);
 for(const s of SPECIES){const d=species(s.id);assert.ok(d.model.cubes.length>0,s.id);assert.ok(d.animations.idle?.loop,`${s.id} idle`);
  for(const sex of ['male','female'])assert.ok(readFileSync(new URL(`../public/assets/species/${s.id}_${sex}.png`,import.meta.url)).length>100);
  for(const k of ['sci','behavior','taming','utility','note'])for(const l of ['pt','en','es'])assert.ok(s.guide[k][l],`${s.id} ${k} ${l}`);}
});
test('looped idle keeps its velocity across the last/first key',()=>{
 const clip=compileClip(species('tyrannosaurus').animations.idle),track=clip.bones.body.rotation,dt=1e-4;
 for(let axis=0;axis<3;axis++){const start=sampleTrack(track,0,clip.length,true)[axis],end=sampleTrack(track,clip.length,clip.length,true)[axis];close(start,end);const left=(start-sampleTrack(track,clip.length-dt,clip.length,true)[axis])/dt,right=(sampleTrack(track,dt,clip.length,true)[axis]-start)/dt;close(left,right,.01);}
});
test('cubic motion crosses interior keys without a velocity corner',()=>{
 const track=compileTrack({'0':{post:[0,0,0],lerp_mode:'catmullrom'},'.7':{post:[14,0,0],lerp_mode:'catmullrom'},'1.8':{post:[9,0,0],lerp_mode:'catmullrom'},'3':{post:[0,0,0],lerp_mode:'catmullrom'}}),dt=1e-5;
 for(const t of [.7,1.8]){const center=sampleTrack(track,t,3)[0],left=(center-sampleTrack(track,t-dt,3)[0])/dt,right=(sampleTrack(track,t+dt,3)[0]-center)/dt;close(left,right,.005);}
});
test('compact clips default to Catmull-Rom, like the mod',()=>{
 const clip=compileClip({len:2,loop:true,bones:{a:{rotation:{'0':[0,0,0],'1':[10,0,0],'2':[0,0,0]}}}});
 assert.equal(clip.bones.a.rotation.keys[0].mode,'catmullrom');assert.ok(sampleTrack(clip.bones.a.rotation,1,2,true)[0]>9.99);
});
test('cross-fades and one-shot actions start and end at rest',()=>{
 close(fadeWeight(0),0);close(fadeWeight(.35),1);close(actionWeight(0,2),0);close(actionWeight(2,2),0);close(actionWeight(1,2),1);
 for(let t=0;t<.35;t+=.01)assert.ok(fadeWeight(t+.01)>=fadeWeight(t));
});
test('a ray through the real cheek does not see two faces at the same depth',()=>{
 const texture=new THREE.Texture(),model=createModel(species('tyrannosaurus'),texture,'male');model.root.updateMatrixWorld(true);
 const meshes=[];model.root.traverse(o=>{if(o.isMesh&&/jugal|temporal/.test(o.name))meshes.push(o)});assert.ok(meshes.length>=2);
 const box=new THREE.Box3().setFromObject(meshes[0]),center=box.getCenter(new THREE.Vector3());
 const hits=new THREE.Raycaster(center.clone().add(new THREE.Vector3(40,0,0)),new THREE.Vector3(-1,0,0)).intersectObjects(meshes);
 for(let i=1;i<hits.length;i++)assert.ok(Math.abs(hits[i].distance-hits[i-1].distance)>1e-5||hits[i].object===hits[i-1].object,'coplanar cheek faces compete for depth');
 model.dispose();texture.dispose();
});
test('merged rigs keep one mesh per bone and every bone',()=>{
 const texture=new THREE.Texture(),d=species('brachiosaurus'),loose=createModel(d,texture),merged=createModel(d,texture,'male',{merge:true});
 assert.equal(merged.bones.size,loose.bones.size);assert.ok(merged.meshes.length<=merged.bones.size&&merged.meshes.length<loose.meshes.length);
 loose.dispose();merged.dispose();
});
test('the web roar starts and ends at rest and keeps the jaw inside the authored limits',()=>{
 const clip=compileClip(json('../public/assets/species/tyrannosaurus.roar.json'));
 for(let t=0;t<=clip.length;t+=1/120){const angle=sampleTrack(clip.bones.jaw.rotation,t,clip.length)[0];assert.ok(angle>=-.5&&angle<=46,`jaw ${angle} at ${t}`)}
 for(const tracks of Object.values(clip.bones))for(const track of Object.values(tracks)){for(const v of sampleTrack(track,0,clip.length))close(v,0,1e-3);for(const v of sampleTrack(track,clip.length,clip.length))close(v,0,1e-3)}
 assert.ok(Object.keys(clip.bones).length>=15,'head, neck, body, arms, tail and legs move');
});
test('the meteor model and its looping animation load in the site format',()=>{
 const d=json('../public/assets/meteor/meteor.json'),texture=new THREE.Texture(),model=createModel(d,texture);
 assert.ok(model.bones.has('rock')&&model.bones.has('flames'));const clip=compileClip(d.animations.fall);assert.ok(clip.loop);
 const r0=sampleTrack(clip.bones.rock.rotation,0,clip.length,true),r1=sampleTrack(clip.bones.rock.rotation,clip.length-1e-6,clip.length,true);close(Math.abs(r1[0]-r0[0]),360,.01);
 model.dispose();texture.dispose();
});
test('the island splits along the crack and every loose piece belongs to the break',()=>{
 const d=json('../public/assets/island/island.json'),texture=new THREE.Texture(),model=createModel(d,texture,'male',{merge:true,bias:false});
 assert.ok(model.bones.has('left')&&model.bones.has('right'));const clip=compileClip(d.animations.break);assert.equal(clip.loop,false);
 for(const name of model.bones.keys())if(name!=='root')assert.ok(clip.bones[name],`${name} has no motion`);
 for(const track of Object.values(clip.bones.left))for(const v of sampleTrack(track,0,clip.length))close(v,0,1e-3);
 model.dispose();texture.dispose();
});
