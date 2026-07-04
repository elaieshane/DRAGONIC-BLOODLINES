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
        // Check if this is a craftpix request
        if (req.url.startsWith('/craftpix-net-')) {
          // Extract the path without query params
          const urlPath = req.url.split('?')[0];
          // Resolve to parent Bloodlines directory
          const filePath = path.join(__dirname, '..', urlPath);
          
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
              res.setHeader('Cache-Control', 'public, max-age=3600');
              res.end(content);
              return;
            }
          } catch (e) {
            // Fall through to next middleware
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
    build: {
      // Optimize CSS and JS output for faster loading
      cssMinify: 'lightningcss',
      minify: 'terser',
      // Aggressive code splitting to reduce main bundle
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendors into separate chunks for better caching
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'react-vendor';
              }
              if (id.includes('lucide')) {
                return 'icons-vendor';
              }
              return 'common-vendor';
            }
            // Split game components by feature
            if (id.includes('src/components')) {
              return 'components';
            }
            if (id.includes('src/utils')) {
              return 'utils';
            }
          },
        },
      },
      // Reduce CSS inlining to allow better parallelization of font loading
      cssCodeSplit: true,
      // Target modern browsers for smaller output
      target: 'es2020',
      // Optimize chunk sizes
      chunkSizeWarningLimit: 1000,
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
