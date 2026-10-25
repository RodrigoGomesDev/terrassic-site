import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {assetUrl} from './rig.js';
import SPIN from './blockspin.json';
// Scenery built from the mod's own 16×16 block textures (copied by scripts/import-mod.py), 1 block = 1 m.

const textures=new Map();
export function blockTexture(name){
 if(!textures.has(name)){const t=new THREE.TextureLoader().load(assetUrl(`blocks/${name}.png`));t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;textures.set(name,t)}
 return textures.get(name);
}
const materials=new Map();
function material(name,{cutout=false,glow=0}={}){
 const key=`${name}|${cutout}|${glow}`;
 if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({map:blockTexture(name),roughness:1,metalness:0,alphaTest:cutout?.5:0,transparent:false,side:cutout?THREE.DoubleSide:THREE.FrontSide,emissive:glow?0xffffff:0x000000,emissiveMap:glow?blockTexture(name):null,emissiveIntensity:glow}));
 return materials.get(key);
}
// Block kinds: [side, top, bottom] textures, like a Minecraft block model.
export const KINDS={
 fern_ground:['fern_litter_side','fern_litter','lateritic_soil'],needle_ground:['needle_litter_side','needle_litter','lateritic_soil'],
 soil:['lateritic_soil'],earth:['packed_earth_floor'],mud:['cracked_mud'],ash:['volcanic_ash'],salt:['salt_crust','salt_crust','cracked_mud'],
 chalk:['chalk'],limestone:['limestone'],shale:['shale'],laterite:['laterite'],stone:['gneiss_stacked'],flagstone:['gneiss_stacked','gneiss_flagstone','gneiss_stacked'],
 lime_flag:['limestone','limestone_flagstone','limestone'],water:['basin_water'],amber:['amber_block',null,null,1.2],fossil:['fossil_rock'],
 metasequoia:['metasequoia_log','metasequoia_log_top'],ginkgo:['ginkgo_log','ginkgo_log_top'],ginkgo_leaves:['ginkgo_leaves',null,null,0,true],araucaria:['araucaria_log','araucaria_log_top'],magnolia:['magnolia_log','magnolia_log_top'],
 tree_fern:['tree_fern_log','tree_fern_log_top'],podocarpus:['podocarpus_log','podocarpus_log_top'],taxodium:['taxodium_log','taxodium_log_top'],
 metasequoia_leaves:['metasequoia_leaves',null,null,0,true],araucaria_leaves:['araucaria_leaves',null,null,0,true],magnolia_leaves:['magnolia_leaves',null,null,0,true],
 tree_fern_leaves:['tree_fern_leaves',null,null,0,true],podocarpus_leaves:['podocarpus_leaves',null,null,0,true],taxodium_leaves:['taxodium_leaves',null,null,0,true],
 menhir:['menhir','menhir_top'],bones:['bone_pile'],
};
const box=new THREE.BoxGeometry(1,1,1);
// Random turn per block (src/blockspin.json), like Minecraft: tops turn in steps of 90°, sides mirror.
const FULL=new Set(SPIN.full),HALF=new Set(SPIN.half),MIRROR=new Set(SPIN.mirror);
const hash=(x,y,z)=>{let h=(x*73856093)^(y*19349663)^(z*83492791);h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0};
const variants=new Map();
function variant(side,top,bottom,v){
 const key=`${side}|${top}|${bottom}|${v}`;if(variants.has(key))return variants.get(key);
 const g=box.clone(),uv=g.attributes.uv,turn=v%4,flip=v>>2;
 // BoxGeometry face order: east, west, up, down, south, north; four vertices each.
 for(let f=0;f<6;f++){
  const tex=f===2?top:f===3?bottom:side,flat=f===2||f===3;
  const spins=FULL.has(tex)||HALF.has(tex);if(!(spins||MIRROR.has(tex)))continue;
  const steps=flat?(FULL.has(tex)?turn:HALF.has(tex)?(turn%2)*2:0):0;
  const pts=[0,1,2,3].map(i=>[uv.getX(f*4+i),uv.getY(f*4+i)]);
  for(let i=0;i<4;i++){let [u,w]=pts[i];if(flip)u=1-u;for(let k=0;k<steps;k++)[u,w]=[w,1-u];uv.setXY(f*4+i,u,w)}
 }
 variants.set(key,g);return g;
}

export class Voxels{
 constructor(){this.cells=new Map();this.plants=new Map()}
 key(x,y,z){return `${x},${y},${z}`}
 set(x,y,z,kind){this.cells.set(this.key(x,y,z),{x,y,z,kind})}
 has(x,y,z){return this.cells.has(this.key(x,y,z))}
 get(x,y,z){return this.cells.get(this.key(x,y,z))}
 // Cross-shaped plants, the way the game draws ferns and grass.
 plant(x,y,z,name,scale=1){(this.plants.get(name)||this.plants.set(name,[]).get(name)).push([x,y,z,scale])}
 build({shadows=true}={}){
  const group=new THREE.Group(),byKind=new Map(),m=new THREE.Matrix4();
  for(const c of this.cells.values()){
   // Skip blocks buried on all six sides: they can never be seen.
   if(this.has(c.x+1,c.y,c.z)&&this.has(c.x-1,c.y,c.z)&&this.has(c.x,c.y+1,c.z)&&this.has(c.x,c.y-1,c.z)&&this.has(c.x,c.y,c.z+1)&&this.has(c.x,c.y,c.z-1))continue;
   (byKind.get(c.kind)||byKind.set(c.kind,[]).get(c.kind)).push(c);
  }
  for(const [kind,list] of byKind){
   const [side,top=side,bottom=top,glow=0,cutout=false]=KINDS[kind];
   const t=top||side,b=bottom||side,mats=[side,side,t,b,side,side].map(n=>material(n,{cutout,glow}));
   const groups=new Map();for(const c of list){const v=hash(c.x,c.y,c.z)%8;(groups.get(v)||groups.set(v,[]).get(v)).push(c)}
   for(const [v,cells] of groups){
    const mesh=new THREE.InstancedMesh(variant(side,t,b,v),mats,cells.length);cells.forEach((c,i)=>mesh.setMatrixAt(i,m.makeTranslation(c.x+.5,c.y+.5,c.z+.5)));
    mesh.castShadow=shadows&&!cutout;mesh.receiveShadow=shadows;group.add(mesh);
   }
  }
  const a=new THREE.PlaneGeometry(1,1),b2=new THREE.PlaneGeometry(1,1);a.rotateY(Math.PI/4);b2.rotateY(-Math.PI/4);a.translate(0,.5,0);b2.translate(0,.5,0);const cross=mergeGeometries([a,b2]);
  for(const [name,list] of this.plants){
   const mesh=new THREE.InstancedMesh(cross,material(name,{cutout:true}),list.length);
   list.forEach(([x,y,z,s],i)=>mesh.setMatrixAt(i,m.makeScale(s,s,s).setPosition(x+.5,y,z+.5)));mesh.castShadow=shadows;group.add(mesh);
  }
  return group;
 }
}

export function seeded(seed){return ()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646}}

// A tree in the style of the game: a log column and a blob of leaves.
export function tree(v,x,y,z,kind,height,rnd,{crown='cone'}={}){
 for(let i=0;i<height;i++)v.set(x,y+i,z,kind);
 const leaves=`${kind}_leaves`;
 if(crown==='cone'){for(let i=2;i<height+2;i++){const r=Math.max(0,Math.round((height+2-i)*.38));for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(dx*dx+dz*dz>r*r+.5||(dx===0&&dz===0&&i<height))continue;if(rnd()<.1)continue;v.set(x+dx,y+i,z+dz,leaves)}}v.set(x,y+height+1,z,leaves);v.set(x,y+height+2,z,leaves)}
 if(crown==='flat'){for(let layer=0;layer<2;layer++){const r=3-layer;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.abs(dx)+Math.abs(dz)>r+1||rnd()<.12)continue;v.set(x+dx,y+height+layer,z+dz,leaves)}}}
 if(crown==='round'){for(let dy=-1;dy<=2;dy++){const r=dy===2?1:2;for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(dx*dx+dz*dz+dy*dy>6||(dx===0&&dz===0&&dy<1)||rnd()<.1)continue;v.set(x+dx,y+height+dy,z+dz,leaves)}}}
 if(crown==='umbrella'){for(const [layer,r] of [[0,3],[1,4],[2,3]])for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(dx*dx+dz*dz>r*r+1||rnd()<.08)continue;v.set(x+dx,y+height-1+layer,z+dz,leaves)}}
 if(crown==='palm'){for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[2,0],[-2,0],[0,2],[0,-2]])v.set(x+dx,y+height-(Math.abs(dx+dz)>1?1:0),z+dz,leaves);v.set(x,y+height,z,leaves)}
}

// The floating island of the opening: a chunk of Cretaceous ground with the mod's plants, a metasequoia and Temporal Amber.
export function floatingIsland({radius=11,seed=1203}={}){
 const v=new Voxels(),rnd=seeded(seed);
 for(let x=-radius-2;x<=radius+2;x++)for(let z=-radius-2;z<=radius+2;z++){
  const edge=radius+Math.sin(Math.atan2(z,x)*3+1)*1.4+Math.sin(Math.atan2(z,x)*7)*.8,r=Math.hypot(x,z*1.15);if(r>edge)continue;
  const depth=Math.max(1,Math.round((edge-r)*.9+rnd()*2));
  for(let d=0;d<depth;d++){const y=-1-d;v.set(x,y,z,d===0?'fern_ground':d<3?'soil':rnd()<.07?'fossil':rnd()<.5?'shale':'limestone')}
 }
 v.set(4,-2,-8,'amber');v.set(-7,-3,5,'amber');
 tree(v,-8,0,-6,'metasequoia',9,rnd);tree(v,8,0,-7,'tree_fern',5,rnd,{crown:'palm'});
 const plants=['cretaceous_grass','bracken','royal_fern','horsetail','clubmoss','bracken','cretaceous_grass'];
 for(let i=0;i<110;i++){const x=Math.round((rnd()-.5)*radius*2),z=Math.round((rnd()-.5)*radius*1.7);if(!v.has(x,-1,z)||v.has(x,0,z))continue;if(Math.hypot(x,z)<4.5&&rnd()<.85)continue;v.plant(x,0,z,plants[Math.floor(rnd()*plants.length)],.8+rnd()*.5)}
 v.plant(6,0,4,'young_cycad',1.4);v.plant(-4,0,8,'williamsonia',1.2);v.plant(-10,0,1,'cycad_bottom',1.3);
 return v.build();
}

// A square plinth for the bestiary: flagstones on top, stacked stone on the sides.
export function plinth(radius){
 const v=new Voxels();for(let x=-radius;x<=radius;x++)for(let z=-radius;z<=radius;z++){if(Math.hypot(x,z)>radius+.4)continue;v.set(x,-1,z,'flagstone');if(Math.hypot(x,z)>radius-1.2)v.set(x,-2,z,'stone')}
 return v.build();
}

// One small slab of ground per era, for the chapter cards.
export const ERA_SCENES={
 late:{ground:'soil',under:'shale',patch:'ash',trees:[['metasequoia',7,'cone'],['ginkgo',5,'umbrella']],plants:['bracken','royal_fern'],extra:'amber'},
 early:{ground:'ash',under:'shale',trees:[['podocarpus',5,'round'],['taxodium',6,'cone']],plants:['horsetail','clubmoss','bracken'],water:true},
 jurassic:{ground:'needle_ground',under:'soil',trees:[['araucaria',9,'flat'],['tree_fern',4,'palm']],plants:['bracken','royal_fern','young_cycad','williamsonia']},
 triassic:{ground:'laterite',under:'limestone',trees:[['tree_fern',3,'palm']],plants:['horsetail','clubmoss'],extra:'salt',rocks:'menhir'},
 ice:{ground:'chalk',under:'limestone',trees:[['metasequoia',5,'cone']],plants:['lichen'],rocks:'bones'},
};
export function eraSlab(id,{w=9,d=6,seed=7}={}){
 const s=ERA_SCENES[id],v=new Voxels(),rnd=seeded(seed);
 for(let x=-w;x<=w;x++)for(let z=-d;z<=d;z++){const wet=s.water&&z>d-3;v.set(x,-1,z,wet?'water':s.extra==='salt'&&rnd()<.25?'salt':s.patch&&Math.sin(x*.6)+Math.cos(z*.7)>1.1?s.patch:s.ground);v.set(x,-2,z,s.under);v.set(x,-3,z,s.under)}
 s.trees.forEach(([kind,h,crown],i)=>{for(let n=0;n<2;n++){const x=Math.round(-w+2+rnd()*(w*2-4)),z=Math.round(-d+1+rnd()*2);tree(v,x,0,z,kind,h+Math.round(rnd()*2),rnd,{crown})}});
 if(s.extra==='amber')v.set(3,-1,1,'amber');
 if(s.rocks)for(let i=0;i<3;i++){const x=Math.round(-w+2+rnd()*(w*2-4)),z=Math.round(rnd()*d-1);v.set(x,0,z,s.rocks);if(s.rocks==='menhir')v.set(x,1,z,'menhir')}
 for(let i=0;i<(s.plants.length>2?60:25);i++){const x=Math.round((rnd()-.5)*w*2),z=Math.round((rnd()-.5)*d*2);if(v.has(x,0,z)||!v.has(x,-1,z)||v.get(x,-1,z).kind==='water')continue;v.plant(x,0,z,s.plants[Math.floor(rnd()*s.plants.length)],.7+rnd()*.5)}
 return v.build({shadows:false});
}
