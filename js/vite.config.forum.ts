import { defineConfig } from 'vite';
import path from 'node:path';

// Custom plugin to handle Flarum's module.exports assignment pattern
function flarumModuleExports() {
  return {
    name: 'flarum-module-exports',
    generateBundle(options: any, bundle: any) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && chunk.isEntry) {
          // Add module.exports={} at the end like webpack does
          chunk.code = chunk.code + '\nmodule.exports={};';
        }
      }
    },
  };
}

export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: false,
  plugins: [flarumModuleExports()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: {
        forum: path.resolve(__dirname, 'forum.js'),
      },
      external: (id: string) => {
        if (id === '@flarum/core/admin' || id === '@flarum/core/forum') return true;
        if (id === 'jquery') return true;
        if (id === 'mithril') return true; // mithril is provided by Flarum core
        if (id.startsWith('flarum/')) return true; // legacy compat modules
        return false;
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: '[name].js',
        globals: (id: string) => {
          if (id === '@flarum/core/admin' || id === '@flarum/core/forum') return 'flarum.core';
          if (id === 'jquery') return 'jQuery';
          if (id === 'mithril') return 'flarum.core.compat[\'mithril\']';
          const compat = id.match(/^flarum\/(.+)$/);
          if (compat) return `flarum.core.compat['${compat[1]}']`;
          return id;
        },
      },
    },
  },
  esbuild: {
    jsxFactory: 'm',
    jsxFragment: "'['",
    tsconfigRaw: {
      compilerOptions: {
        isolatedModules: true,
      },
    },
  },
});

