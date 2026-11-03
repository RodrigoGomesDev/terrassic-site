// Saves the Discord art drawn by src/cards.js:
//   public/assets/cards/<id>.webp     release card of each ready species (1600x900), also hosted by the site
//   art/discord/banners/<canal>.png   header banner of each channel (1920x480), uploaded to Discord by hand
// Uso: npm run build && npm run cards            (todas as espécies prontas e os banners)
//      npm run build && npm run cards -- triceratops ankylosaurus   (só esses cartões, sem banners)
// Precisa do Google Chrome instalado; CHROME=/caminho muda o executável. Rode quando liberar uma espécie nova:
// o aviso automático no Discord (.github/workflows/discord-species.yml) usa o cartão daqui.
import {preview} from 'vite';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync} from 'node:fs';

const only=process.argv.slice(2);
const cards=new URL('../public/assets/cards/',import.meta.url),banners=new URL('../art/discord/banners/',import.meta.url);
mkdirSync(cards,{recursive:true});mkdirSync(banners,{recursive:true});
const server=await preview({preview:{port:4198,strictPort:true}});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=metal','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>console.error('página:',e.message));
 await page.goto('http://localhost:4198/?bake');await page.waitForFunction(()=>window.__cards,null,{timeout:60000});
 const out=await page.evaluate(opts=>window.__cards(opts),only.length?{species:only,banners:false}:{});
 const save=(dir,name,url,ext)=>writeFileSync(new URL(`${name}.${ext}`,dir),Buffer.from(url.split(',')[1],'base64'));
 for(const [id,url] of Object.entries(out.cards))save(cards,id,url,'webp');
 for(const [key,url] of Object.entries(out.banners))save(banners,key,url,'png');
 console.log(`${Object.keys(out.cards).length} cartões em public/assets/cards/, ${Object.keys(out.banners).length} banners em art/discord/banners/`);
}finally{await browser.close();server.httpServer.close()}
