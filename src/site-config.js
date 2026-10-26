// Preencha apenas URLs oficiais. Links ausentes não viram botões vazios no site.
export const links={
 download:'https://www.curseforge.com/minecraft/mc-mods/terrassic', // página pública com os arquivos da versão.
 modrinth:'https://modrinth.com/mod/terrassic', // ainda em análise no Modrinth (a página dá "não encontrado" para visitantes).
 wiki:'./wiki/', // a wiki do próprio site (wiki/index.html); no CurseForge e no Modrinth use o endereço completo, terminado em /wiki/.
 report:'./wiki/#reportar', // onde se reporta um bug; no CurseForge e no Modrinth ("Issues") use o endereço completo.
 donate:'https://ko-fi.com/terrassic',
 version:'0.2.0',
 discord:'https://discord.gg/ymRsGgUnWW', // Convite permanente (Configurações do servidor › Convites › "Nunca expira"). Aparece no rodapé, na instalação e em "Reportar um problema".
 trailer:null,
};

// Formulário "Reportar um problema" da wiki: cada relato chega no seu e-mail pelo Web3Forms (grátis, sem servidor).
// Crie a chave em https://web3forms.com com o e-mail que vai receber os relatos e cole aqui. A chave pode ficar no
// código do site: ela só permite enviar para esse e-mail. Sem chave, o formulário não aparece no site publicado.
export const report={
 web3formsKey:'60b25c0a-3bd1-4d2c-b0af-8e5aa0f8bb22',
};
