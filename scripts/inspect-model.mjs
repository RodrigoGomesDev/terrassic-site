// Folha de inspeção de um modelo, desenhado pelo motor do próprio site: cabeça, braços (ou nadadeiras) e cauda, de
// vários lados, perto. Serve para pegar antes da publicação o que só aparece de um ângulo: face que some de um lado,
// caixa aberta vista por dentro, olho ou dente fora do lugar. Compare com o jogo (o site desenha como o jogo: as duas
// faces de cada superfície, entityCutoutNoCull). O que estiver errado na folha e também no jogo é do modelo: vai para
// o agente de modelos; o que só estiver errado aqui é do site.
//
// Uso: npm run build && node scripts/inspect-model.mjs styracosaurus deinosuchus   (grava inspect/<id>.png)
// Precisa do Google Chrome; CHROME=/caminho muda o executável.
import {createServer} from 'vite';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync} from 'node:fs';

const ids=process.argv.slice(2);
if(!ids.length){console.error('Uso: node scripts/inspect-model.mjs <espécie> [outras...]');process.exit(1)}
const out=new URL('../inspect/',import.meta.url);mkdirSync(out,{recursive:true});
const server=await createServer({root:new URL('..',import.meta.url).pathname,server:{port:4197,strictPort:true},logLevel:'error'});
await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=metal','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage();page.on('pageerror',e=>console.error('página:',e.message));
 await page.goto('http://localhost:4197/?bake');await page.waitForFunction(()=>window.__cards,null,{timeout:60000});
 for(const id of ids){
  const url=await page.evaluate(async(id)=>{
   const src=await (await fetch('/src/rig.js')).text(),THREE=await import(src.match(/from\s*["']([^"']*three[^"']*)["']/)[1]);
   const {spawn}=await import('/src/rig.js'),{SPECIES}=await import('/src/generated/species.js');
   const s=SPECIES.find(x=>x.id===id);if(!s)return null;
   const c=await spawn(s,{animation:'idle',silhouette:null});c.animator.current.time=0;c.animator.update(1.3);
   const W=400,H=300,r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(W,H);r.outputColorSpace=THREE.SRGBColorSpace;r.setClearColor(0x2a2329);
   const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x555555,2.6));const k=new THREE.DirectionalLight(0xffffff,1.2);k.position.set(-3,5,-2);scene.add(k);scene.add(c.holder);c.holder.updateMatrixWorld(true);
   const names=[...c.model.bones.keys()],find=(re)=>names.find(n=>re.test(n)&&c.model.bones.get(n).visible);
   // as partes que mais escondem defeito: cabeça, um braço (ou nadadeira), a cauda
   const parts=[['cabeça',find(/^skull$/)||find(/^head$/)],['braço',find(/^(forearm|arm|flipper|fore)_?l/)||find(/^(arm|flipper)/)],['cauda',find(/^tail\d?$/)||find(/^tail/)]].filter(([,b])=>b);
   const views=[['esquerda',[-1,.3,-.35]],['direita',[1,.3,-.35]],['cima',[.05,1,-.15]]];
   const sheet=document.createElement('canvas');sheet.width=W*views.length;sheet.height=H*parts.length;const g=sheet.getContext('2d');
   const cam=new THREE.PerspectiveCamera(32,W/H,.01,200),whole=new THREE.Box3().setFromObject(c.model.root).getSize(new THREE.Vector3()).length();
   parts.forEach(([label,bone],row)=>{
    const box=new THREE.Box3();c.model.bones.get(bone).traverse(o=>{if(o.isMesh)box.expandByObject(o)});
    const p=box.getCenter(new THREE.Vector3()),d=Math.max(box.getSize(new THREE.Vector3()).length()*1.6,whole*.12);
    views.forEach(([v,dir],col)=>{cam.position.copy(p).addScaledVector(new THREE.Vector3(...dir).normalize(),d);cam.lookAt(p);r.render(scene,cam);
     g.drawImage(r.domElement,col*W,row*H);g.fillStyle='#fff';g.font='15px sans-serif';g.fillText(`${label} (${bone}) · ${v}`,col*W+8,row*H+20)});
   });
   r.dispose();c.dispose();return sheet.toDataURL('image/png');
  },id);
  if(!url){console.error(`${id}: não está em species.js`);continue}
  writeFileSync(new URL(`${id}.png`,out),Buffer.from(url.split(',')[1],'base64'));console.log(`inspect/${id}.png`);
 }
}finally{await browser.close();await server.close()}
