import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import chatHandler from './api/chat.js';
import gitHandler from './api/git.js';

function apiMiddlewarePlugin() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/chat')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            if (body) {
              try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
            }
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            try {
              await chatHandler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/git')) {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            if (body) {
              try { req.body = JSON.parse(body); } catch (e) { req.body = body; }
            }
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            try {
              await gitHandler(req, res);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

function findHtmlFiles(dir) {
  let files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', 'dist', '.git', '.vercel', '.vite'].includes(entry.name)) continue;
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = findHtmlFiles(resolve(import.meta.dirname));

const input = {};
htmlFiles.forEach((file) => {
  const relative = file.slice(resolve(import.meta.dirname).length + 1).replace(/\\/g, '/');
  const name = relative.replace(/\.html$/, '').replace(/\/index$/, '') || 'main';
  input[name] = file;
});

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [apiMiddlewarePlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
