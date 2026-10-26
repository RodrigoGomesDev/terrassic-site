import {defineConfig} from 'vite';
// Relative base: the build works from any folder or host path (GitHub Pages, a preview page).
// Two pages: the home page and the wiki (wiki/index.html, served at /wiki/).
export default defineConfig({base:'./',build:{assetsDir:'static',rollupOptions:{input:{main:'index.html',wiki:'wiki/index.html'}},chunkSizeWarningLimit:900,assetsInlineLimit:20000}});
