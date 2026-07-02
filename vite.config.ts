/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// src/*.html を全部エントリーポイントとして自動収集する（MPA）。
// ページを増やすときは `src/xxx.html` と `src/entries/xxx.tsx` を足すだけでよい。
const htmlEntries = Object.fromEntries(
  fs
    .globSync('*.html', { cwd: path.resolve(dirname, 'src') })
    .map((file) => [
      path.basename(file, '.html'),
      path.resolve(dirname, 'src', file),
    ])
);

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  root: 'src',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: htmlEntries,
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // キャッシュバスティングが必要な場合はハッシュ付きに戻す
        // entryFileNames: 'assets/[name]-[hash].js',
        // chunkFileNames: 'assets/[name]-[hash].js',
        // assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});
