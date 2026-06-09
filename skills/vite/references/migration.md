# Vite Migration Guide

## Table of Contents

- [Vite 7 → Vite 8](#vite-7--vite-8)
- [Vite 6 → Vite 7](#vite-6--vite-7)
- [Quick Checklist](#quick-checklist)

## Vite 7 → Vite 8

Vite 8 replaces esbuild and Rollup with **Rolldown** and **Oxc**. This is the biggest architectural change.

### Gradual Migration Path

Use `rolldown-vite` as an intermediate step:

```json
// Step 1: Try Rolldown on Vite 7 first
{ "vite": "npm:rolldown-vite@7.2.2" }

// Step 2: Then upgrade to Vite 8
{ "vite": "^8.0.0" }
```

### Config Renames (Deprecated → New)

| Deprecated | New | Notes |
|-----------|-----|-------|
| `build.rollupOptions` | `build.rolldownOptions` | Auto-aliased, but migrate |
| `worker.rollupOptions` | `worker.rolldownOptions` | Same |
| `esbuild` (config option) | `oxc` | Auto-converted, see below |
| `optimizeDeps.esbuildOptions` | `optimizeDeps.rolldownOptions` | Auto-converted |
| `transformWithEsbuild()` | `transformWithOxc()` | API function |
| `build.commonjsOptions` | — | Now no-op |

### esbuild → oxc Option Mapping

```ts
// Before (Vite 7)
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: '@emotion/react',
    jsxInject: `import React from 'react'`,
    define: { DEBUG: 'true' },
  },
})

// After (Vite 8)
export default defineConfig({
  oxc: {
    jsx: { runtime: 'automatic', importSource: '@emotion/react' },
    jsxInject: `import React from 'react'`,
    define: { DEBUG: 'true' },
  },
})
```

Full JSX mapping:

| esbuild | oxc |
|---------|-----|
| `jsx: 'automatic'` | `jsx: { runtime: 'automatic' }` |
| `jsx: 'transform'` | `jsx: { runtime: 'classic' }` |
| `jsx: 'preserve'` | `jsx: 'preserve'` |
| `jsxImportSource` | `jsx.importSource` |
| `jsxFactory` | `jsx.pragma` |
| `jsxFragment` | `jsx.pragmaFrag` |
| `jsxDev` | `jsx.development` |
| `jsxSideEffects` | `jsx.pure` |

### Build Changes

**Minification**: Default minifier is now Oxc (30-90x faster than terser). `build.minify: 'esbuild'` still works but is deprecated.

**CSS Minification**: Default is now Lightning CSS. Use `build.cssMinify: 'esbuild'` to revert (requires installing esbuild).

**Browser targets**: Updated baseline — Chrome 111, Edge 111, Firefox 114, Safari 16.4.

**`build()` error handling**:

```ts
// Vite 8 throws BundleError with .errors array
try {
  await build()
} catch (e) {
  if (e.errors) {
    for (const error of e.errors) {
      console.log(error.code)
    }
  }
}
```

### CJS Interop Change

Default import from CJS modules is now `module.exports` (not `module.exports.default`) when:
- Importer is `.mjs`/`.mts` or in a `"type": "module"` package
- Importee's `module.exports.__esModule` is not `true`

Temporary escape hatch: `legacy.inconsistentCjsInterop: true`.

### Plugin Author Changes

- Return `moduleType: 'js'` from `load`/`transform` hooks when converting non-JS to JS:

```ts
load(id) {
  if (id.endsWith('.txt')) {
    return {
      code: `export default ${JSON.stringify(content)}`,
      moduleType: 'js',  // Required in Vite 8
    }
  }
}
```

- `moduleParsed` hook is NOT called in dev (performance)
- All parallel hooks run sequentially in Rolldown
- `bundle` object in `generateBundle` is not shared across hooks
- `structuredClone(bundle)` → use `structuredClone({ ...bundle })`

### Removed Features

- `output.format: 'system'` and `'amd'` — not supported by Rolldown
- `shouldTransformCachedModule`, `resolveImportMeta`, `renderDynamicImport`, `resolveFileUrl` hooks
- Object form `output.manualChunks` — use `codeSplitting` instead
- Extglobs in glob patterns
- `import.meta.url` polyfill in UMD/IIFE (replaced with `undefined`)

### Require Calls for External Modules

`require()` for externalized modules is now preserved (not converted to `import`). To convert:

```ts
import { defineConfig, esmExternalRequirePlugin } from 'vite'

export default defineConfig({
  plugins: [
    esmExternalRequirePlugin({ external: ['react', /^node:/] }),
  ],
})
```

### Not Yet Supported

- Native decorator lowering (use Babel `@babel/plugin-proposal-decorators` or SWC as workaround)
- `esbuild.supported` option (track oxc-project/oxc#15373)
- Property mangling (`mangleProps`, `reserveProps`)

## Vite 6 → Vite 7

See the full guide at https://v7.vite.dev/guide/migration

Key changes:
- Node.js 18 minimum
- Environment API introduced (experimental)
- `server.hmr` WebSocket options moved to `server.ws`
- `configureServer` hook ordering changes

## Quick Checklist

### Upgrading to Vite 8

1. Update `package.json`: `"vite": "^8.0.0"`
2. Rename `build.rollupOptions` → `build.rolldownOptions`
3. Rename `esbuild` config → `oxc` config
4. Rename `optimizeDeps.esbuildOptions` → `optimizeDeps.rolldownOptions`
5. Replace `transformWithEsbuild()` → `transformWithOxc()` in custom code
6. Add `moduleType: 'js'` in plugin `load`/`transform` hooks that output JS from non-JS files
7. Check CJS default imports — verify behavior matches expectations
8. Remove uses of `output.format: 'system'` or `'amd'`
9. Replace `output.manualChunks` (object form) with `codeSplitting`
10. If using `esbuild` directly: install it as explicit `devDependency`
11. Run `vite --force` to rebuild dep cache
12. Test dev server and production build
