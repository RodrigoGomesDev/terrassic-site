import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {compileClip,compileTrack,sampleTrack,actionWeight} from '../src/animation.js';
import {createModel} from '../src/viewer.js';
import {scrollYaw} from '../src/scroll-scene.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url)));
const close=(a,b,epsilon=1e-5)=>assert.ok(Math.abs(a-b)<epsilon,`${a} != ${b}`);
test('looped idle keeps its velocity across the last/first key',()=>{
 const raw=json('../public/assets/tyrannosaurus/animations.json').animations['animation.tyrannosaurus.idle'];const clip=compileClip(raw),track=clip.bones.body.rotation,dt=1e-4;
 for(let axis=0;axis<3;axis++){const start=sampleTrack(track,0,clip.length,true)[axis],end=sampleTrack(track,clip.length,clip.length,true)[axis];close(start,end);const left=(start-sampleTrack(track,clip.length-dt,clip.length,true)[axis])/dt,right=(sampleTrack(track,dt,clip.length,true)[axis]-start)/dt;close(left,right,.01);}
});
test('cubic motion crosses interior keys without a velocity corner',()=>{
 const track=compileTrack({'0':{post:[0,0,0],lerp_mode:'catmullrom'},'.7':{post:[14,0,0],lerp_mode:'catmullrom'},'1.8':{post:[9,0,0],lerp_mode:'catmullrom'},'3':{post:[0,0,0],lerp_mode:'catmullrom'}}),dt=1e-5;
 for(const t of [.7,1.8]){const center=sampleTrack(track,t,3)[0],left=(center-sampleTrack(track,t-dt,3)[0])/dt,right=(sampleTrack(track,t+dt,3)[0]-center)/dt;close(left,right,.005);}
});
test('presentation roar returns to rest and jaw stays inside authored limits at 120Hz',()=>{
 const clip=compileClip(json('../public/assets/tyrannosaurus/presentation-roar.json'));const jaw=clip.bones.jaw.rotation;
 for(let t=0;t<=clip.length;t+=1/120){for(const tracks of Object.values(clip.bones))for(const track of Object.values(tracks))assert.ok(sampleTrack(track,t,clip.length).every(Number.isFinite));const angle=sampleTrack(jaw,t,clip.length)[0];assert.ok(angle>=-.001&&angle<=41.1,`jaw ${angle}`);}
 for(const tracks of Object.values(clip.bones))for(const track of Object.values(tracks))for(const value of sampleTrack(track,clip.length,clip.length))close(value,0);
 close(actionWeight(0,clip.length),0);close(actionWeight(clip.length,clip.length),0);close(actionWeight(1,clip.length),1);
});
test('a ray through the real cheek does not see two faces at the same depth',()=>{
 const data=json('../public/assets/tyrannosaurus/model.json'),texture=new THREE.Texture(),model=createModel(data,texture,'male');model.root.updateMatrixWorld(true);
 let jugal,temporal;model.root.traverse(o=>{if(o.name==='jugal_l')jugal=o;if(o.name==='temporal')temporal=o;});assert.ok(jugal&&temporal);
 const skull=model.bones.get('skull');const origin=skull.localToWorld(new THREE.Vector3(20,2.3,-4.5938));const direction=new THREE.Vector3(-1,0,0).transformDirection(skull.matrixWorld);const hits=new THREE.Raycaster(origin,direction).intersectObjects([jugal,temporal]);
 assert.ok(hits.length>=2);for(let i=1;i<hits.length;i++)assert.ok(Math.abs(hits[i].distance-hits[i-1].distance)>1e-5,'coplanar cheek faces compete for depth');
 model.root.traverse(o=>o.geometry?.dispose());model.material.dispose();texture.dispose();
});

test('scroll uses a small, continuous change of perspective instead of a complete turn',()=>{
 const values=Array.from({length:1001},(_,i)=>scrollYaw(i/1000));assert.ok(Math.max(...values)-Math.min(...values)<Math.PI/2);
 for(let i=1;i<values.length;i++)assert.ok(Math.abs(values[i]-values[i-1])<.025);
 close(values[0],-.2);close(values.at(-1),.05);
});
