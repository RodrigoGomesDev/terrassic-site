// Preencha apenas URLs oficiais. Links ausentes não viram botões vazios no site.
export const links={
 download:'https://www.curseforge.com/minecraft/mc-mods/terrassic', // página pública com os arquivos da versão.
 modrinth:null, // 'https://modrinth.com/mod/terrassic' volta quando o Modrinth aprovar o mod; enquanto for null, o site não mostra o Modrinth.
 wiki:'./wiki/', // a wiki do próprio site (wiki/index.html); no CurseForge e no Modrinth use o endereço completo, terminado em /wiki/.
 report:'./wiki/#reportar', // onde se reporta um bug; no CurseForge e no Modrinth ("Issues") use o endereço completo.
 donate:'https://ko-fi.com/terrassic',
 version:'1.1.4',
 discord:'https://discord.gg/ymRsGgUnWW', // Convite permanente (Configurações do servidor › Convites › "Nunca expira"). Aparece no rodapé, na instalação e em "Reportar um problema".
 trailer:null,
};

// Espécies cujo modelo novo (estudo próprio, aprovado pelo Rodrigo) já está pronto. As outras aparecem no site
// como silhueta com "Em breve": no bestiário, nas miniaturas e na abertura. Ex.: ready:['carnotaurus'].
export const models={
 ready:['velociraptor','spinosaurus','pteranodon','tyrannosaurus','carnotaurus','giganotosaurus','protoceratops','triceratops','gallimimus','pachycephalosaurus','parasaurolophus','ankylosaurus'],
};
export const isReady=id=>models.ready.includes(id);

// Modo história (Dra. Katyusha, a Fenda, os capítulos): desligado no mod. Com false, o site mostra só um aviso
// "Em breve" no lugar da sequência da história, do caderno, dos capítulos e das notas da Katyusha.
export const story=false;

// Formulário "Reportar um problema" da wiki: cada relato chega no seu e-mail pelo Web3Forms (grátis, sem servidor).
// Crie a chave em https://web3forms.com com o e-mail que vai receber os relatos e cole aqui. A chave pode ficar no
// código do site: ela só permite enviar para esse e-mail. Sem chave, o formulário não aparece no site publicado.
export const report={
 web3formsKey:'60b25c0a-3bd1-4d2c-b0af-8e5aa0f8bb22',
};
