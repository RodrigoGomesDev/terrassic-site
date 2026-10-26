// Files in public/assets, found from this module's own address (src/ in development, static/ in the build), so the
// same code works on the home page, on /wiki/ and from any host folder, without loading three.js. (The address goes
// through a variable so Vite does not try to bundle the folder as if it were one file.)
const here=import.meta.url;
export const assetUrl=path=>new URL(`../assets/${path}`,here).href;
