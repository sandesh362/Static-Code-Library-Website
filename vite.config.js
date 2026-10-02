import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is 100% static: `vite build` emits plain HTML/CSS/JS into `dist/`
// and nothing talks to a server at runtime. `base: './'` keeps every asset
// path relative so the build can be dropped into any folder, sub-path or
// static host (GitHub Pages, Netlify, S3, `python -m http.server`, ...).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // The preview host is dynamic in some sandboxes, so allow any host header.
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
});
