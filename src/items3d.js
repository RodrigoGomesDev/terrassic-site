import * as THREE from 'three';
// The weapons in 3D, with the motion each one has in the game: the spear is raised and thrown and stays stuck in the
// ground shaking, the blowgun fills with breath and spits a dart, the bola spins and flies, the bow is drawn in three
// steps and lets the arrow go, the blades and clubs swing. The models are the mod's own (scripts/import-mod.py copies
// them to assets/items/): the box models the game draws in the hand, and the flat item pictures turned into
// pixel-thick blocks the way the game draws any item.
const url=n=>new URL(`assets/items/${n}`,document.baseURI).href;
const clamp=THREE.MathUtils.clamp,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const textures=new Map(),images=new Map();
const texture=name=>{if(!textures.has(name)){const t=new THREE.TextureLoader().load(url(`${name}.png`));t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;textures.set(name,t)}return textures.get(name)};
const image=name=>{if(!images.has(name))images.set(name,new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url(`${name}.png`)}));return images.get(name)};

// A vanilla item model (boxes in pixels, 0..16, faces with their own UVs) as a group in pixel units, centred on 8,8,8.
const FACES=['east','west','up','down','south','north'];
async function boxModel(name){
 const data=await fetch(url(`${name}.json`)).then(r=>r.json()),root=new THREE.Group();
 const mats=new Map(),mat=t=>{if(!mats.has(t))mats.set(t,new THREE.MeshLambertMaterial({map:texture(t),alphaTest:.5,side:THREE.DoubleSide}));return mats.get(t)};
 const none=new THREE.MeshBasicMaterial({visible:false});
 for(const e of data.elements){
  const [x0,y0,z0]=e.from,[x1,y1,z1]=e.to,size=[x1-x0,y1-y0,z1-z0];
  const geo=new THREE.BoxGeometry(Math.max(size[0],.01),Math.max(size[1],.01),Math.max(size[2],.01)),uv=geo.attributes.uv;
  const materials=FACES.map((f,i)=>{const face=e.faces[f];if(!face)return none;
   // The four corners of the face as the game reads them (top-left, top-right, bottom-right, bottom-left), turned by
   // the face's rotation, onto BoxGeometry's vertex order (top-left, top-right, bottom-left, bottom-right).
   const [u0,v0,u1,v1]=face.uv,c=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]],r=((face.rotation||0)/90)%4,at=k=>c[(k+4-r)%4];
   [at(0),at(1),at(3),at(2)].forEach(([u,v],k)=>uv.setXY(i*4+k,u/16,1-v/16));return mat(face.texture)});
  const mesh=new THREE.Mesh(geo,materials);mesh.position.set((x0+x1)/2-8,(y0+y1)/2-8,(z0+z1)/2-8);
  if(e.rotation){const {origin:[ox,oy,oz],axis,angle}=e.rotation,pivot=new THREE.Group();pivot.position.set(ox-8,oy-8,oz-8);
   mesh.position.sub(pivot.position);pivot.rotation[axis]=THREE.MathUtils.degToRad(angle);pivot.add(mesh);root.add(pivot)}
  else root.add(mesh);
 }
 return root;
}
// A flat item picture as the game draws it in the world: one pixel-thick block per opaque pixel, centred on 8,8.
async function flatModel(name){
 const img=await image(name),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
 const px=g.getImageData(0,0,c.width,c.height).data,cells=[];
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(px[i+3]>127)cells.push([x,y,px[i],px[i+1],px[i+2]])}
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),cells.length),m=new THREE.Matrix4(),col=new THREE.Color();
 cells.forEach(([x,y,r,gr,b],i)=>{m.makeTranslation(x+.5-c.width/2,c.height/2-y-.5,0);mesh.setMatrixAt(i,m);mesh.setColorAt(i,col.setRGB(r/255,gr/255,b/255,THREE.SRGBColorSpace))});
 const root=new THREE.Group();root.add(mesh);return root;
}

// What each weapon does on the stage, as a loop of `len` seconds. hold: the item in its idle place; play(t) moves it.
const KINDS={
 melee:{len:2.4,async build(w){const item=await flatModel(w.id);item.scale.setScalar(1.6);return {item}},
  // A swing from over the shoulder through the target and back, pivoting on the grip (lower left of the picture).
  play({item},t){const s=smooth(.55,.8,t)-smooth(1.1,1.7,t),wind=smooth(.2,.55,t)*(1-smooth(.55,.8,t));
   item.rotation.z=.6*wind-1.35*s;item.position.set(-2+8*s,-2+3*wind,0)}},
 spear:{len:3.6,async build(w){const item=await boxModel(`${w.id}_held`);return {item}},
  // Raised, aimed back like the trident, thrown in an arc and stuck in the ground, shaking.
  play({item},t){
   const raise=smooth(.2,.9,t),fly=clamp((t-1.1)/.8,0,1),stuck=t>=1.9;
   if(fly<=0){item.position.set(-14-4*raise,-6+3*raise,0);item.rotation.z=.25*raise-.1}
   else{const x=-18+40*fly,y=-3+14*fly-18*fly*fly,dy=14-36*fly;item.position.set(stuck?22:x,stuck?-9:y,0);
    item.rotation.z=stuck?-.55+.12*Math.sin((t-1.9)*40)*Math.exp(-(t-1.9)*3):Math.atan2(dy,40)-Math.PI/2}
   item.visible=t<3.4}},
 blowgun:{len:2.6,async build(w){const tube=await boxModel('blowgun_blowing'),item=new THREE.Group(),dart=await flatModel('tranq_dart');tube.rotation.y=-Math.PI/2;tube.position.set(-6,0,0);item.add(tube);item.scale.setScalar(1.5);dart.scale.setScalar(.8);dart.rotation.z=-Math.PI/4;
   const swirls=new THREE.Group();for(let i=0;i<10;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),new THREE.MeshBasicMaterial({color:i%2?0xb07cff:0x7d52d9,transparent:true}));swirls.add(p)}
   return {item,dart,swirls,extra:[dart,swirls]}},
  // The breath fills (the tube swells a little), the dart leaves the mouthpiece and the violet swirls trail it.
  play({item,dart,swirls},t){const breath=smooth(.1,1.1,t)*(1-smooth(1.15,1.25,t)),shot=clamp((t-1.2)/.9,0,1);
   item.scale.setScalar(1.5*(1+.04*breath));item.position.set(-1.2*smooth(1.15,1.3,t)*(1-smooth(1.4,2,t)),0,0);
   dart.visible=shot>0&&shot<1;dart.position.set(10+46*shot,0,0);
   swirls.children.forEach((p,i)=>{const k=clamp(shot*1.2-i*.06,0,1),a=i*1.1+t*12;p.visible=k>0&&k<1;p.position.set(8+46*k*.95,Math.cos(a)*2,Math.sin(a)*2);p.material.opacity=1-k})}},
 bola:{len:3,async build(){const item=await boxModel('bola_thrown');item.scale.setScalar(2.2);return {item}},
  // Spun overhead, faster and faster, then let go: it flies flat, still turning.
  play({item},t){const spin=smooth(0,1.4,t),fly=clamp((t-1.5)/1.1,0,1);
   item.rotation.set(0,(t*t*9)%(Math.PI*2)+fly*30,0);
   item.position.set(-8+50*fly,6+6*fly-16*fly*fly,0);item.scale.setScalar(2.2*(.9+.1*spin));item.visible=t<2.75}},
 bow:{len:2.8,async build(){const frames=await Promise.all(['hunting_bow','hunting_bow_pulling_0','hunting_bow_pulling_1','hunting_bow_pulling_2'].map(flatModel)),item=new THREE.Group();
   frames.forEach(f=>item.add(f));item.scale.setScalar(1.8);const arrow=await flatModel('flint_arrow');arrow.scale.setScalar(1.4);return {item,frames,arrow,extra:[arrow]}},
  // Drawn in the game's three steps, held, and loosed: the arrow leaves, the bow is back at rest.
  play({item,frames,arrow},t){const step=t<.3?0:t<.7?1:t<1.1?2:t<1.6?3:0;frames.forEach((f,i)=>f.visible=i===step);
   const fly=clamp((t-1.6)/.7,0,1);arrow.visible=t>=1.6&&fly<1;arrow.position.set(-2+50*fly,0,1);arrow.rotation.z=-Math.PI/4;
   // The picture holds the bow on the diagonal with the arrow towards the upper left; turned so it shoots to the right.
   item.rotation.z=-Math.PI*.75;item.position.set(-10,0,0)}},
};

export class WeaponStage{
 constructor(host){
  this.host=host;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true})}catch{return}
  const r=this.renderer;r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputColorSpace=THREE.SRGBColorSpace;r.setClearColor(0,0);host.append(r.domElement);
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(30,2,1,400);
  this.scene.add(new THREE.HemisphereLight(0xfff0d0,0x3a2a24,2.2));const sun=new THREE.DirectionalLight(0xfff1d6,1.6);sun.position.set(-20,40,30);this.scene.add(sun);
  this.holder=new THREE.Group();this.scene.add(this.holder);this.t=0;this.last=performance.now();this.visible=false;this.token=0;
  new ResizeObserver(()=>this.resize()).observe(host);this.resize();
  new IntersectionObserver(([e])=>{this.visible=e.isIntersecting}).observe(host);
  this.tick=this.tick.bind(this);requestAnimationFrame(this.tick);
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;
  // Wide enough for the whole throw: 70 px across on a wide stage, framed tighter on a narrow one.
  // Room for the whole throw: 64 px across and 40 px high, whichever the stage's shape makes the tighter fit.
  const k=Math.tan(THREE.MathUtils.degToRad(this.camera.fov)/2),dist=Math.max(20/k,32/k/this.camera.aspect);this.camera.position.set(2,3,dist);this.camera.lookAt(2,0,0);this.camera.updateProjectionMatrix()}
 async show(weapon){
  const kind=KINDS[weapon.kind]||KINDS.melee,token=++this.token,parts=await kind.build(weapon).catch(()=>null);
  if(token!==this.token||!parts)return;
  this.holder.clear();this.holder.add(parts.item,...(parts.extra||[]));
  // The bola is seen a little from above, so its stones read as a ring while it spins.
  this.holder.rotation.set(weapon.kind==='bola'?.45:0,0,0);
  this.parts=parts;this.kind=kind;this.t=this.reduced?kind.len*.3:0;
 }
 tick(now){requestAnimationFrame(this.tick);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
  if(!this.visible||document.hidden||!this.parts)return;
  if(!this.reduced)this.t=(this.t+dt)%this.kind.len;this.kind.play(this.parts,this.t);this.renderer.render(this.scene,this.camera)}
}
