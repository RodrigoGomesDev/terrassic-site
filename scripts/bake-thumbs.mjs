// Saves the bestiary, chapter and male/female thumbnails as static images, so visitors never render them.
// Uso: npm run build && npm run thumbs   (precisa do Google Chrome instalado; CHROME=/caminho muda o executável)
import {preview} from 'vite';
import {chromium} from 'playwright-core';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=new URL('../public/assets/thumbs/',import.meta.url);mkdirSync(out,{recursive:true});
const server=await preview({preview:{port:4199,strictPort:true}});
const browser=await chromium.launch({executablePath:process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=metal','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage();
 await page.goto('http://localhost:4199/?bake');await page.waitForFunction(()=>window.__bake);
 const images=await page.evaluate(()=>window.__bake());
 for(const [name,url] of Object.entries(images))writeFileSync(new URL(`${name}.webp`,out),Buffer.from(url.split(',')[1],'base64'));
 console.log(`${Object.keys(images).length} miniaturas em public/assets/thumbs/`);
}finally{await browser.close();server.httpServer.close()}
