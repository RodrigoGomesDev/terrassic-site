import {defineConfig} from 'vite';
// Relative base: the build works from any folder or host path (GitHub Pages, a preview page).
export default defineConfig({base:'./',build:{assetsDir:'static',chunkSizeWarningLimit:900}});
