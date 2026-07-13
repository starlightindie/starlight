import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'dist', emptyOutDir: true, sourcemap: true,
    rollupOptions: { input: { background: resolve(__dirname,'src/background/index.ts'), content: resolve(__dirname,'src/content/index.ts'), popup: resolve(__dirname,'src/popup/index.html'), options: resolve(__dirname,'src/options/index.html') }, output: { entryFileNames: 'assets/[name].js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } }
  }
});
