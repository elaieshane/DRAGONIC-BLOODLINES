import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

const craftpixPlugin = {
  name: 'craftpix-serve',
  configureServer(server: any) {
    return () => {
      server.middlewares.use((req: any, res: any, next: any) => {
        const craftpixMatch = req.url.match(/^\/craftpix-net-[^/]+\//);
        if (craftpixMatch) {
          const filePath = path.join(__dirname, '..', req.url);
          try {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath);
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
              res.end(content);
              return;
            }
          } catch (e) {
            // Fallback to next middleware
          }
        }
        next();
      });
    };
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), craftpixPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow the dev server to serve files from the parent Bloodlines folder
      // so all /craftpix-net-* URLs resolve to the actual asset packs.
      fs: {
        allow: [
          path.resolve(__dirname, '..'),  // Bloodlines/ parent folder
          path.resolve(__dirname),        // DRAGONIC-BLOODLINES/ project root
        ],
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
