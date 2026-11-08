import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Content Security Policy for the published site. The cloud key and passphrase live in
// localStorage, so the page may only run its own scripts and only talk to known services.
// Build-only: Vite's dev server injects inline scripts that this policy would block.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co https://api.open-meteo.com https://archive-api.open-meteo.com https://nominatim.openstreetmap.org",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

const cspPlugin = {
  name: 'gezginogi-csp',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`)
};

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin],
  server: {
    port: 5173,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'leaflet-vendor': ['leaflet'],
          'icons-vendor': ['lucide-react']
        }
      }
    }
  }
});
