// Release announcements (scripts/announce-species.mjs): no network, no Discord.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readyFrom,released,message,imageFor,addedIds,main} from '../scripts/announce-species.mjs';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SPECIES} from '../src/generated/species.js';
import {models} from '../src/site-config.js';

test('lê a lista ready do site-config e acha só as espécies novas', () => {
 assert.deepEqual(readyFrom(" ready:['velociraptor','spinosaurus'],"),['velociraptor','spinosaurus']);
 assert.deepEqual(readyFrom(' ready:[],'),[]);
 assert.deepEqual(readyFrom('sem lista'),[]);
 assert.deepEqual(readyFrom("// Ex.: ready:['carnotaurus'].\nexport const models={\n ready:['tyrannosaurus'],\n};"),['tyrannosaurus'],'o exemplo do comentário não conta');
 assert.deepEqual(released(['a','b'],['a','b','c','d']),['c','d']);
 assert.deepEqual(released(['a','b'],['b']),[],'tirar uma espécie da lista não é lançamento');
});

test('todo aviso cabe nos limites do Discord e só a primeira espécie do push marca o cargo', () => {
 for(const id of models.ready){
  const s=SPECIES.find(x=>x.id===id),m=message(s,{role:'123',image:`${id}.webp`}),e=m.embeds[0];
  assert.ok(e.title.length<=256&&e.description.length<=4096&&e.fields.length<=25,id);
  for(const f of e.fields)assert.ok(f.name.length<=256&&f.value.length>=1&&f.value.length<=1024,`${id}/${f.name}`);
  const total=e.title.length+e.description.length+e.author.name.length+e.footer.text.length+e.fields.reduce((n,f)=>n+f.name.length+f.value.length,0);
  assert.ok(total<=6000,`${id}: ${total}`);
  assert.ok(m.content.length<=2000);
  assert.equal(e.image.url,`attachment://${id}.webp`);
  assert.match(e.url,new RegExp(`/wiki/#${id}$`));
  assert.deepEqual(m.allowed_mentions.roles,['123']);
  assert.ok(!e.fields.some(f=>/Português|Español/.test(f.name)),`${id}: o canal é em inglês, sem blocos de outros idiomas`);
  assert.doesNotMatch(m.content+e.footer.text,/chegou|llegó|Ficha|Guia de Campo/,`${id}: texto em português ou espanhol`);
  const kind=e.fields.find(f=>f.name==='Type').value.split(' · ');assert.equal(new Set(kind).size,kind.length,`${id}: tipo repetido`);
 }
 const s=SPECIES.find(x=>x.id==='triceratops');
 assert.deepEqual(message(s,{role:null}).allowed_mentions.roles,[]);
 assert.doesNotMatch(message(s,{role:null}).content,/<@&/);
});

test('só a imagem aprovada serve, e só imagem ADICIONADA conta como anúncio', () => {
 const root=mkdtempSync(join(tmpdir(),'announce-'));
 try{
  const base=pathToFileURL(root+'/');
  assert.equal(imageFor('styracosaurus',base),null,'sem a arte aprovada: nada (nunca o cartão automático)');
  mkdirSync(join(root,'public/assets/announce'),{recursive:true});
  writeFileSync(join(root,'public/assets/announce/styracosaurus.png'),'x');
  const f=imageFor('styracosaurus',base);
  assert.equal(f.name,'styracosaurus.png');assert.equal(f.type,'image/png');
 }finally{rmSync(root,{recursive:true,force:true})}
 assert.deepEqual(addedIds(['public/assets/announce/styracosaurus.webp','public/assets/announce/deinosuchus.png','public/assets/cards/elasmosaurus.webp','public/assets/announce/notas.txt']),['styracosaurus','deinosuchus']);
});

test('sem a imagem aprovada, não avisa (e sem webhook só mostra o que mandaria)', async () => {
 const lines=[];
 const code=await main({env:{IDS:'styracosaurus,deinosuchus,elasmosaurus'},log:(...a)=>lines.push(a.join(' '))});
 assert.equal(code,0);
 const out=lines.join('\n');
 for(const id of ['styracosaurus','deinosuchus','elasmosaurus']){
  if(imageFor(id))assert.match(out,new RegExp(`o aviso de ${id} seria`));
  else assert.match(out,new RegExp(`${id}: sem a imagem aprovada`));
 }
});

test('mais de 5 espécies de uma vez não inunda o canal', async () => {
 const lines=[];
 await main({env:{IDS:'a,b,c,d,e,f'},log:(...a)=>lines.push(a.join(' '))});
 assert.match(lines.join('\n'),/mais que 5, não aviso/);
});
