/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// src/pages/*.html を全部エントリーポイントとして自動収集する（MPA）。
// ページを増やすときは `src/pages/xxx.html` と `src/entries/xxx.tsx` を足すだけでよい。
const htmlEntries = Object.fromEntries(
  fs
    .globSync('src/pages/*.html', { cwd: dirname })
    .map((file) => [
      path.basename(file, '.html'),
      path.resolve(dirname, file),
    ])
);

// ビルド時に src/pages/xxx.html を dist/xxx.html（フラット）へ書き出す。
// dev の URL には影響しない（build の出力パスだけを変える）。
function flattenHtmlOutput() {
  return {
    name: 'flatten-html-output',
    enforce: 'post' as const,
    writeBundle(
      options: { dir?: string },
      bundle: Record<string, { type: string; fileName: string }>
    ) {
      const outDir = options.dir ?? path.resolve(dirname, 'dist');
      for (const chunk of Object.values(bundle)) {
        if (
          chunk.type === 'asset' &&
          chunk.fileName.endsWith('.html') &&
          chunk.fileName.includes('/')
        ) {
          const from = path.join(outDir, chunk.fileName);
          const to = path.join(outDir, path.basename(chunk.fileName));
          fs.renameSync(from, to);
        }
      }
      // 空になった dist/src を掃除する。
      const srcDir = path.join(outDir, 'src');
      if (fs.existsSync(srcDir)) fs.rmSync(srcDir, { recursive: true, force: true });
    },
  };
}

// dev サーバーで `/`・`/xxx.html` を `src/pages/xxx.html` に振り分ける。
// これで build 後（dist/xxx.html）と同じ URL で開ける。
function pagesDevRouter() {
  return {
    name: 'pages-dev-router',
    configureServer(server: { middlewares: { use: (fn: (req: { url?: string }, res: unknown, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const [pathname, query = ''] = req.url.split('?');
          const name = pathname === '/' ? 'index' : pathname.match(/^\/([^/]+)\.html$/)?.[1];
          if (name && fs.existsSync(path.resolve(dirname, `src/pages/${name}.html`))) {
            req.url = `/src/pages/${name}.html${query ? `?${query}` : ''}`;
          }
        }
        next();
      });
    },
  };
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), pagesDevRouter(), flattenHtmlOutput()],
  build: {
    rollupOptions: {
      input: htmlEntries,
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