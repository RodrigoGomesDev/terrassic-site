// Release announcements (scripts/announce-species.mjs): no network, no Discord.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readyFrom,released,message,imageFor,configAt,main} from '../scripts/announce-species.mjs';
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

test('cada espécie pronta tem cartão (npm run cards) ou ao menos miniatura', () => {
 for(const id of models.ready){const f=imageFor(id);assert.ok(f,`${id} sem imagem nenhuma`)}
});

test('sem webhook, mostra o aviso e sai sem erro', async () => {
 const lines=[];
 const code=await main({env:{IDS:'styracosaurus,deinosuchus,elasmosaurus'},log:(...a)=>lines.push(a.join(' '))});
 assert.equal(code,0);
 const out=lines.join('\n');
 for(const id of ['styracosaurus','deinosuchus','elasmosaurus'])assert.match(out,new RegExp(`o aviso de ${id} seria`));
 assert.equal((out.match(/<@&/g)||[]).length,0,'sem cargo configurado, ninguém é marcado');
});

test('push que libera mais de 5 espécies de uma vez não inunda o canal', async (t) => {
 if(configAt('e229ea0')===null)return t.skip('histórico raso (CI): o commit de exemplo não está disponível');
 const lines=[];
 const code=await main({env:{BEFORE:'e229ea0'},log:(...a)=>lines.push(a.join(' '))}); // de lá para cá: mais de 5
 assert.equal(code,0);
 assert.match(lines.join('\n'),/mais que 5, não aviso/);
 assert.doesNotMatch(lines.join('\n'),/seria:/);
});
