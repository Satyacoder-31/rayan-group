import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

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
