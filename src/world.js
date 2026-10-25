import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// A small Late Cretaceous clearing built from 1 m voxels: everything here is generated, no textures are loaded.
export const PALETTE={basalt:0x1c181e,dusk:0x3a2240,dusk2:0x5e3866,rift:0xf07a1a,amber:0xf2b544,amberLight:0xffd27a,fern:0x7faf55,leather:0x5a3620,sky:0x8fb4c8,bone:0xefe6d2};

// Deterministic value noise, enough for rolling hills.
function hash(x,z){let h=(x*374761393+z*668265263)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967295}
function smooth(t){return t*t*(3-2*t)}
export function noise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=smooth(xf),v=smooth(zf);const a=hash(xi,zi),b=hash(xi+1,zi),c=hash(xi,zi+1),d=hash(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
export function fbm(x,z){return noise(x,z)*.6+noise(x*2.1+7,z*2.1+3)*.3+noise(x*4.3+1,z*4.3+9)*.1}
export const random=(seed=>()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646})(20261025);

// Pixel noise for voxel faces, like a 16×16 block texture.
function blockTexture(){
 const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d'),img=g.createImageData(16,16);
 for(let i=0;i<256;i++){const n=200+Math.floor(hash(i%16,Math.floor(i/16)+41)*55);img.data.set([n,n,n,255],i*4)}
 g.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function createSky(){
 const geo=new THREE.SphereGeometry(500,32,16);
 const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{sun:{value:new THREE.Vector3(-.55,.12,-.83).normalize()},time:{value:0}},
  vertexShader:'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec3 vDir;uniform vec3 sun;uniform float time;
   void main(){float h=vDir.y;vec3 top=vec3(.13,.07,.16),mid=vec3(.37,.22,.40),low=vec3(.94,.48,.10),glow=vec3(1.,.82,.48);
    vec3 c=mix(low,mid,smoothstep(.0,.22,h));c=mix(c,top,smoothstep(.2,.75,h));
    float s=max(dot(vDir,sun),0.);c+=glow*pow(s,24.)*.9+vec3(.95,.45,.12)*pow(s,4.)*.35;
    c=mix(c,vec3(.11,.09,.12),smoothstep(.0,-.12,h));
    float bands=sin(h*90.+time*.05)*.012;gl_FragColor=vec4(c+bands,1.);}`});
 return new THREE.Mesh(geo,mat);
}

// Height in whole blocks; the centre stays flat so the animals walk on level ground.
export function heightAt(x,z){const r=Math.hypot(x/1.25,z);if(r<46)return 0;const ring=smooth(Math.min(1,(r-46)/44));return Math.round(fbm(x*.045,z*.045)*1.4+ring*(fbm(x*.03+4,z*.03)*9+2))}

export function createTerrain({radius=78}={}){
 const group=new THREE.Group(),tex=blockTexture(),box=new THREE.BoxGeometry(1,1,1);
 const ground=new THREE.MeshStandardMaterial({map:tex,roughness:1});
 // Grass on top, earth on the sides: chosen per face from the box normal.
 ground.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying float vTop;').replace('#include <begin_vertex>','#include <begin_vertex>\nvTop=step(.5,normal.y);');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying float vTop;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(vec3(.30,.22,.14)*(.7+.3*diffuseColor.g),diffuseColor.rgb,vTop);')};
 const cols=[];for(let x=-radius;x<=radius;x++)for(let z=-radius;z<=radius;z++){if(Math.hypot(x,z)>radius)continue;cols.push([x,z])}
 const mesh=new THREE.InstancedMesh(box,ground,cols.length);mesh.receiveShadow=true;const m=new THREE.Matrix4(),c=new THREE.Color();
 const grass=[new THREE.Color(0x6f9a47),new THREE.Color(0x7faf55),new THREE.Color(0x5f8a3f),new THREE.Color(0x8a9a4a)];
 cols.forEach(([x,z],i)=>{const h=heightAt(x,z),depth=h+6;m.makeScale(1,depth,1).setPosition(x,h-depth/2,z);mesh.setMatrixAt(i,m);
  const river=Math.abs(z+28-Math.sin(x*.07)*6)<3&&h<=1;c.copy(river?new THREE.Color(0xb7a37a):grass[Math.floor(hash(x,z+99)*grass.length)]);c.multiplyScalar(.85+hash(z,x)*.25);mesh.setColorAt(i,c)});
 group.add(mesh);
 // A shallow river behind the clearing.
 const water=new THREE.Mesh(new THREE.PlaneGeometry(radius*2.2,7,1,1),new THREE.MeshStandardMaterial({color:0x6f8fa0,roughness:.25,metalness:.1,transparent:true,opacity:.75}));
 water.rotation.x=-Math.PI/2;water.position.set(0,.45,-28);group.add(water);
 group.add(createTrees(radius,tex),createFerns());
 return group;
}

// Conifers and tree ferns as stacked voxels, kept outside the clearing.
function createTrees(radius,tex){
 const trunks=[],leaves=[];
 for(let i=0;i<150;i++){const a=random()*Math.PI*2,r=50+random()*(radius-50),x=Math.round(Math.cos(a)*r*1.25),z=Math.round(Math.sin(a)*r);if(Math.hypot(x,z)>radius-2||(z>16&&Math.abs(x)<40))continue;
  const base=heightAt(x,z)+.5,tall=9+Math.floor(random()*12);for(let y=0;y<tall;y++)trunks.push([x,base+y,z,1]);
  for(let y=Math.floor(tall*.35);y<tall+3;y++){const w=Math.max(0,Math.round((tall+3-y)*.34));for(let dx=-w;dx<=w;dx++)for(let dz=-w;dz<=w;dz++){if(Math.hypot(dx,dz)>w+.3||(dx===0&&dz===0&&y<tall))continue;if(random()<.12)continue;leaves.push([x+dx,base+y,z+dz])}}}
 const g=new THREE.Group(),box=new THREE.BoxGeometry(1,1,1),m=new THREE.Matrix4(),c=new THREE.Color();
 const t=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial({map:tex,color:0x5a3620,roughness:1}),trunks.length);trunks.forEach(([x,y,z],i)=>{t.setMatrixAt(i,m.makeTranslation(x,y,z))});t.castShadow=true;
 const l=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial({map:tex,roughness:1}),leaves.length);
 leaves.forEach(([x,y,z],i)=>{l.setMatrixAt(i,m.makeTranslation(x,y,z));c.setHex([0x2f5a35,0x3b6b3c,0x28503a,0x45703a][Math.floor(hash(x+y,z)*4)]);l.setColorAt(i,c)});l.castShadow=true;
 g.add(t,l);return g;
}
// Ferns and horsetails as crossed planes with a pixel sprite drawn here, like plants in the game.
function plantTexture(){
 const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');
 const px=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1)};
 for(let f=0;f<5;f++){const bx=2+f*3,lean=(f-2)*.55;for(let y=15;y>3+Math.abs(f-2);y--){const x=Math.round(bx+lean*(15-y)*.35);px(x,y,y%3?'#e8f0d8':'#c9dcae');if(y<13&&y%2===0){px(x-1,y,'#d6e6c0');px(x+1,y+1,'#b9d09c')}}}
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;
}
function createFerns(){
 const spots=[];for(let i=0;i<900;i++){const x=(random()-.5)*120,z=(random()-.5)*96;const r=Math.hypot(x/1.25,z);if(r>58||Math.abs(z+28-Math.sin(x*.07)*6)<3.5)continue;if(r<10&&random()<.8)continue;spots.push([x,heightAt(Math.round(x),Math.round(z)),z,.7+random()*1.1,random()*Math.PI])}
 const a=new THREE.PlaneGeometry(1,1),b=new THREE.PlaneGeometry(1,1);b.rotateY(Math.PI/2);a.translate(0,.5,0);b.translate(0,.5,0);
 const geo=mergeGeometries([a,b]);
 const mesh=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({map:plantTexture(),alphaTest:.5,side:THREE.DoubleSide,roughness:1}),spots.length),m=new THREE.Matrix4(),q=new THREE.Quaternion(),c=new THREE.Color();
 spots.forEach(([x,y,z,s,rot],i)=>{m.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(new THREE.Vector3(0,1,0),rot),new THREE.Vector3(s,s*1.2,s));mesh.setMatrixAt(i,m);c.setHex([0x6d9c3e,0x86b35a,0x55803a,0x9aa64a,0x4f7a3a][i%5]);mesh.setColorAt(i,c)});mesh.castShadow=true;return mesh;
}

// Temporal Amber motes drifting up through the scene.
export function createMotes(count=420){
 const geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3),seed=new Float32Array(count);
 for(let i=0;i<count;i++){pos.set([(random()-.5)*120,random()*30,(random()-.5)*90],i*3);seed[i]=random()*100}
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('seed',new THREE.BufferAttribute(seed,1));
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},pixel:{value:1}},
  vertexShader:`attribute float seed;uniform float time;uniform float pixel;varying float vA;void main(){vec3 p=position;p.y=mod(p.y+time*(.4+fract(seed)*.6),30.);p.x+=sin(time*.3+seed)*1.5;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+fract(seed*7.)*3.)*pixel*(60./-mv.z);vA=smoothstep(0.,4.,p.y)*smoothstep(30.,22.,p.y)*(.5+.5*sin(time*2.+seed*9.));}`,
  fragmentShader:'varying float vA;void main(){vec2 d=gl_PointCoord-.5;float a=smoothstep(.5,.0,length(d));gl_FragColor=vec4(1.,.78,.36,a*vA*.85);}'});
 return new THREE.Points(geo,mat);
}
