import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: '',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'), 
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    open: '/',
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache',
    },
    hmr: {
      overlay: false
    },
  },
  plugins: [
    {
      name: 'custom-middleware',
      configureServer(server) {
        server.middlewares.use('/sw.js', (req, res, next) => {
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Content-Type', 'application/javascript');
          next();
        });
        server.middlewares.use('/manifest.json', (req, res, next) => {
          res.setHeader('Content-Type', 'application/manifest+json');
          next();
        });
      },
    },
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});