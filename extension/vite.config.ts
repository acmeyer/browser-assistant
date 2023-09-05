import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import makeManifest from './utils/plugins/make-manifest';
import buildContentScript from './utils/plugins/build-content-script';
import { outputFolderName } from './utils/constants';

const root = resolve(__dirname, 'src');
const pagesDir = resolve(root, 'pages');
const assetsDir = resolve(root, 'assets');
const outDir = resolve(__dirname, outputFolderName);
const publicDir = resolve(__dirname, 'public');

export default defineConfig({
  resolve: {
    alias: {
      '@': root,
      '@src': root,
      '@assets': assetsDir,
      '@pages': pagesDir,
    },
  },
  plugins: [react(), makeManifest(), buildContentScript()],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === 'true',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(pagesDir, 'background', 'index.ts'),
        newtab: resolve(pagesDir, 'newtab', 'index.html'),
        sidepanel: resolve(pagesDir, 'sidepanel', 'index.html'),
        reader: resolve(root, 'lib', 'reader.ts'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'reader' ? `src/lib/${chunk.name}.js` : `src/pages/${chunk.name}/index.js`,
      },
    },
  },
});
