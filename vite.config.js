import { defineConfig } from 'vite';
import { resolve } from 'path';
import { globSync } from 'tinyglobby';

// Discover all HTML entry points in the project root and subdirectories
const htmlFiles = globSync('**/*.html', {
  ignore: ['node_modules/**', 'dist/**', '.vite/**']
});

const input = {};
htmlFiles.forEach((file) => {
  const name = file.replace(/\\/g, '/').replace(/\.html$/, '').replace(/\/index$/, '') || 'main';
  input[name] = resolve(import.meta.dirname, file);
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
