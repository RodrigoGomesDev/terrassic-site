import * as THREE from 'three';
import {CreatureViewer} from './viewer.js';
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const ease=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)};
const segment=(p,a,b)=>ease((p-a)/(b-a));
export const scrollYaw=p=>lerp(-.2,.62,segment(p,.15,.45))-segment(p,.4,.58)*.57;
export class ScrollScene extends CreatureViewer{
 constructor(container,{onProgress=()=>{},onLoaded=()=>{},onFailure=()=>{}}={}){
  super(container,{hero:true,onError:onFailure});if(!this.renderer)return;
  this.film=document.querySelector('.film');this.stage=document.getElementById('stage');this.onProgress=onProgress;this.loaded=onLoaded;this.progress=0;this.targetProgress=0;this.manualJaw=false;this.inGallery=false;this.lastFrame=performance.now();this.pointer=new THREE.Vector2();this.background=new THREE.Color();this.autoRotate=false;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.scene.children.filter(o=>o.isLight).forEach(o=>this.scene.remove(o));
  this.scene.add(new THREE.HemisphereLight(0xfff6df,0x8c7f69,2));
  const key=new THREE.DirectionalLight(0xffefd3,3.5);key.position.set(3,5,-4);this.scene.add(key);
  const fill=new THREE.DirectionalLight(0xd7e4ef,1.5);fill.position.set(-4,1,-1);this.scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffc674,2.3);rim.position.set(-2,3,5);this.scene.add(rim);
  this.controls.enabled=false;this.controls.enableZoom=false;this.controls.minDistance=3;this.controls.maxDistance=12;
  this.container.querySelector('canvas').style.pointerEvents='auto';this.renderer.domElement.style.touchAction='pan-y';
  this.handleScroll=()=>{const r=this.film.getBoundingClientRect();this.targetProgress=this.reducedMotion?.96:clamp(-r.top/Math.max(1,this.film.offsetHeight-innerHeight),0,1)};
  this.handlePointer=e=>{if(this.reducedMotion)return;this.pointer.set((e.clientX/innerWidth-.5)*.13,(e.clientY/innerHeight-.5)*.07)};
  this.handleResize=()=>{this.handleScroll();if(this.inGallery)this.reset()};
  window.addEventListener('scroll',this.handleScroll,{passive:true});window.addEventListener('pointermove',this.handlePointer,{passive:true});window.addEventListener('resize',this.handleResize,{passive:true});
  this.beforeRender=now=>this.updateFilm(now);this.onLoad=animations=>{this.model.root.updateMatrixWorld(true);this.manualJaw=false;this.loaded(animations);if(this.inGallery)this.reset()};
  this.handleScroll();this.progress=this.targetProgress;this.load('tyrannosaurus');
 }
 reset(){if(!this.camera||!this.controls)return;const mobile=this.container.clientWidth<701;this.camera.position.set(mobile?6.3:4.8,mobile?2.2:1.5,mobile?-9:-6.7);this.controls.target.set(0,mobile?-.8:-.65,0);this.camera.lookAt(this.controls.target);this.controls.update();}
 setManualJaw(open){this.manualJaw=open}
 setGallery(enabled){if(this.inGallery===enabled)return;this.inGallery=enabled;this.hero=!enabled;this.controls.enabled=enabled;this.controls.enableRotate=enabled;this.controls.enableZoom=false;this.controls.enableDamping=true;this.stage.classList.toggle('is-gallery',enabled);document.getElementById('gallery').inert=!enabled;if(enabled){this.controls.update()}else{this.setAnimation('idle');if(this.id!=='tyrannosaurus'||this.sex!=='male')this.load('tyrannosaurus','male')}}
 updateFilm(now){
  const dt=Math.min((now-this.lastFrame)/1000,.08);this.lastFrame=now;
  this.progress=this.reducedMotion?.96:lerp(this.progress,this.targetProgress,1-Math.exp(-dt*7));const p=this.progress,mobile=this.container.clientWidth<701;
  this.setGallery(p>.895);this.onProgress(p);
  const amber=new THREE.Color('#dbb15b'),paper=new THREE.Color('#e5dfd0'),basalt=new THREE.Color('#18191a');
  this.background.copy(amber).lerp(paper,segment(p,.13,.32)).lerp(basalt,segment(p,.43,.58)).lerp(paper,segment(p,.78,.91));
  const dark=segment(p,.43,.58)*(1-segment(p,.78,.91));const ink=new THREE.Color('#25231f').lerp(new THREE.Color('#e8d5ac'),dark);
  this.stage.style.setProperty('--stage-bg',`#${this.background.getHexString()}`);this.stage.style.setProperty('--stage-ink',`#${ink.getHexString()}`);
  this.stage.style.setProperty('--intro',1-segment(p,.08,.2));this.stage.style.setProperty('--word-y',`${-p*180}px`);
  this.stage.style.setProperty('--turn',segment(p,.15,.22)*(1-segment(p,.38,.46)));this.stage.style.setProperty('--jaw',segment(p,.49,.56)*(1-segment(p,.76,.83)));this.stage.style.setProperty('--roar',dark*.12);this.stage.style.setProperty('--gallery',segment(p,.86,.94));
  if(!this.model)return;
  // Override the jaw after the normal idle animation has been applied.
  const opening=Math.max(segment(p,.57,.71)*(1-segment(p,.76,.85))*(1-(this.actionBlend||0)),this.manualJaw?1:0);
  const jaw=this.model.bones.get('jaw');if(jaw){const base=jaw.userData.baseRotation.x;const animatedOpen=base-jaw.rotation.x;jaw.rotation.x=base-Math.max(animatedOpen,opening*THREE.MathUtils.degToRad(44));}
  if(this.id==='tyrannosaurus'){
   const neck=this.model.bones.get('neck1'),skull=this.model.bones.get('skull');if(neck)neck.rotation.x+=opening*.12;if(skull)skull.rotation.x+=opening*.055;
  }
  if(this.inGallery){this.wrapper.position.set(0,mobile?.5:.35,0);this.wrapper.scale.setScalar(mobile?.85:1);return;}
  const settle=segment(p,.78,.895);this.wrapper.position.set(0,lerp(-.1,mobile?.5:.35,settle),0);this.wrapper.scale.setScalar(lerp(mobile?.8:1.12,mobile?.85:1,settle));
  this.wrapper.rotation.set(0,scrollYaw(p),0);
  this.model.root.updateMatrixWorld(true);this.wrapper.updateMatrixWorld(true);
  const head=this.model.bones.get('jaw')||this.model.bones.get('head');const headPosition=new THREE.Vector3();head?.getWorldPosition(headPosition);
  const approach=segment(p,.45,.59)*(1-segment(p,.77,.89));
  const base=new THREE.Vector3(lerp(mobile?5.1:4.8,mobile?6.3:4.8,settle),lerp(mobile?1.9:1.7,mobile?2.2:1.5,settle),lerp(mobile?-7.2:-6.6,mobile?-9:-6.7,settle));
  const headCamera=headPosition.clone().add(new THREE.Vector3(mobile?2.4:1.8,mobile?.45:.35,mobile?-2.5:-1.9));
  const target=new THREE.Vector3(0,lerp(mobile?.1:0,mobile?-.8:-.65,settle),0).lerp(headPosition.clone().add(new THREE.Vector3(mobile?.25:0,mobile?.2:-.15,mobile?-.1:-.17)),approach);
  this.camera.position.copy(base.lerp(headCamera,approach));if(!this.reducedMotion){this.camera.position.x+=this.pointer.x;this.camera.position.y+=this.pointer.y;}
  this.camera.lookAt(target);this.controls.target.copy(target);
 }
 dispose(){window.removeEventListener('scroll',this.handleScroll);window.removeEventListener('pointermove',this.handlePointer);window.removeEventListener('resize',this.handleResize);super.dispose()}
}
