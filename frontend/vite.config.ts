import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const spaRoutes = [
  'services',
  'about',
  'login',
  'admin',
  'admin/dashboard',
  'admin/services',
  'admin/inbox',
  'admin/history',
  'admin/users',
];

function vercelSpaStaticFallback() {
  return {
    name: 'vercel-spa-static-fallback',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtml)) return;

      fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));

      for (const route of spaRoutes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
        fs.copyFileSync(indexHtml, path.join(distDir, `${route}.html`));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelSpaStaticFallback()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
