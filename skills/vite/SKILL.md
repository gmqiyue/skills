---
name: vite
description: Configures and troubleshoots Vite projects — config files, dev server, production builds, SSR, library mode, plugins, proxy, env variables, CSS, and performance. Use when creating or modifying vite.config.ts, debugging HMR or build issues, setting up proxies, writing Vite plugins, configuring library mode, or optimizing Vite performance. Don't use for framework-specific logic (React, Vue, Svelte internals) unless it touches Vite config.
metadata:
  version: "1.0.0"
  created: "2026-06-09"
  updated: "2026-06-09"
  author: gmqiyue
---

## Config File

Config lives in `vite.config.ts` (or `.js`, `.mjs`, `.mts`) at project root.

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // config options
})
```

Use `defineConfig` for type hints. For conditional config, export a function:

```ts
export default defineConfig(({ command, mode, isSsrBuild }) => {
  if (command === 'serve') {
    return { /* dev config */ }
  } else {
    return { /* build config */ }
  }
})
```

`command` is `'serve'` in dev, `'build'` in production.

## CLI Commands

| Command | Purpose |
|---------|---------|
| `vite` / `vite dev` / `vite serve` | Start dev server (default port 5173) |
| `vite build` | Production build to `dist/` |
| `vite preview` | Preview production build locally |

Key flags: `--host 0.0.0.0` (expose to LAN), `--port N`, `--mode staging`, `--force` (clear dep cache), `--open`, `--config path`.

## Env Variables and Modes

### .env Files (loaded in order, later wins)

```
.env                  # always loaded
.env.local            # always loaded, gitignored
.env.[mode]           # mode-specific
.env.[mode].local     # mode-specific, gitignored
```

### Client Exposure

Only `VITE_`-prefixed vars are exposed to client code via `import.meta.env.VITE_*`. Never put secrets in `VITE_*` vars — they are bundled into output.

### Built-in Constants

- `import.meta.env.MODE` — current mode string
- `import.meta.env.DEV` / `import.meta.env.PROD` — boolean, based on `NODE_ENV`
- `import.meta.env.BASE_URL` — the `base` config value
- `import.meta.env.SSR` — true in server context

### Using Env in Config

`.env` files are NOT loaded when the config is evaluated. Use `loadEnv` manually:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: { __APP_ENV__: JSON.stringify(env.APP_ENV) },
  }
})
```

### TypeScript Support

Augment `ImportMetaEnv` in `vite-env.d.ts` (no `import` statements in this file):

```ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}
```

## Dev Server

Key `server` options:

```ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4567',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': { target: 'ws://localhost:3000', ws: true },
    },
    warmup: {
      clientFiles: ['./src/components/Heavy.vue'],
    },
  },
})
```

### Security Gotchas

- `server.allowedHosts`: configure explicitly; setting to `true` enables DNS rebinding attacks.
- `server.cors`: don't set to `true` in production-like environments.

## Production Build

Key `build` options:

```ts
export default defineConfig({
  build: {
    target: 'es2015',              // default: 'baseline-widely-available'
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,               // false | true | 'inline' | 'hidden'
    minify: 'oxc',                 // default, or 'terser' | false
    cssMinify: 'lightningcss',     // default
    rolldownOptions: { /* ... */ },
    manifest: true,                // for backend integration
  },
})
```

### Multi-Page App

```ts
build: {
  rolldownOptions: {
    input: {
      main: resolve(import.meta.dirname, 'index.html'),
      nested: resolve(import.meta.dirname, 'nested/index.html'),
    },
  },
}
```

### Library Mode

```ts
build: {
  lib: {
    entry: resolve(import.meta.dirname, 'lib/main.js'),
    name: 'MyLib',
    fileName: 'my-lib',
  },
  rolldownOptions: {
    external: ['vue'],
    output: { globals: { vue: 'Vue' } },
  },
}
```

Set `package.json` exports:

```json
{
  "type": "module",
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

## CSS

- `.css` imports inject via `<style>` with HMR.
- `.module.css` → CSS Modules. Import returns `{ className: 'hashed' }`.
- Preprocessors: install `sass-embedded` (or `sass`), `less`, or `stylus` — no Vite plugin needed.
- `?inline` query suppresses injection: `import styles from './foo.css?inline'`.
- Lightning CSS is default for production minification. Opt into full Lightning CSS processing with `css.transformer: 'lightningcss'`.

## Resolve Aliases

```ts
resolve: {
  alias: {
    '@': resolve(import.meta.dirname, 'src'),
  },
}
```

Use absolute paths for aliases to file system locations. Use `resolve.tsconfigPaths: true` to respect `tsconfig.json` paths (has performance cost).

## Static Assets

- Files in `public/` are served at `/` as-is, never processed.
- Imported assets return resolved URL: `import logo from './logo.png'`.
- Special queries: `?url` (explicit URL), `?raw` (string content), `?worker` (web worker).

## Plugins

### Using Plugins

```ts
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins: [vue()] })
```

Falsy values are ignored — use for conditional plugins: `plugins: [condition && somePlugin()]`.

### Writing Plugins

See `references/plugin-api.md` for the full plugin authoring guide.

Quick inline plugin:

```ts
export default defineConfig({
  plugins: [{
    name: 'my-plugin',
    transform: {
      filter: { id: /\.custom$/ },
      handler(code, id) {
        return { code: transform(code), map: null }
      },
    },
  }],
})
```

Key Vite-specific hooks: `config`, `configResolved`, `configureServer`, `transformIndexHtml`, `handleHotUpdate`.

Plugin ordering: `enforce: 'pre'` runs before core, `enforce: 'post'` runs after. Use `apply: 'build'` or `apply: 'serve'` for conditional application.

## SSR

Basic structure:

```
index.html
server.js
src/
  main.js            # universal app code
  entry-client.js    # hydrates in browser
  entry-server.js    # renders with framework SSR API
```

Create Vite in middleware mode for SSR:

```ts
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})
app.use(vite.middlewares)
```

Build commands:

```bash
vite build --outDir dist/client
vite build --outDir dist/server --ssr src/entry-server.js
```

Key SSR config: `ssr.noExternal` (force transform), `ssr.external` (skip transform), `ssr.target` (`'node'` | `'webworker'`).

## Performance Tips

1. **Avoid barrel files** — import directly: `import { slash } from './utils/slash.js'`
2. **Use explicit extensions** — reduces filesystem probing
3. **Warm up heavy files** — `server.warmup.clientFiles: ['./src/components/Heavy.vue']`
4. **Use native CSS** over Sass/Less when possible
5. **Profile** — `vite --profile`, then inspect `.cpuprofile` in speedscope
6. **Debug transforms** — `vite --debug plugin-transform`
7. **Inspect plugins** — install `vite-plugin-inspect`, visit `/__inspect/`

## Common Gotchas

- `define` values must be JSON-serializable expressions or identifiers, not arbitrary code.
- `envPrefix` must never be `''` — it would leak all env vars to the client.
- `NODE_ENV` and `mode` are independent concepts. `--mode staging` doesn't change `NODE_ENV`.
- Config file `.env` vars: use `loadEnv()`, they're not in `process.env` at config time.
- HMR case sensitivity: `import './Foo.js'` vs `'./foo.js'` causes silent HMR failures.
- `vite preview` is NOT a production server.
- TypeScript: Vite transpiles only — no type checking. Run `tsc --noEmit` separately.
- Set `"isolatedModules": true` in `tsconfig.json` — required for Oxc transpilation.

## JavaScript API

Core functions exported from `'vite'`:

```ts
import {
  createServer,      // dev server → Promise<ViteDevServer>
  build,             // production build → Promise<RollupOutput>
  preview,           // preview server → Promise<PreviewServer>
  defineConfig,      // config type helper
  loadEnv,           // load .env files → Record<string, string>
  mergeConfig,       // deep merge two configs
  resolveConfig,     // resolve full config
  normalizePath,     // POSIX path normalization
  transformWithOxc,  // programmatic Oxc transform (replaces transformWithEsbuild)
  searchForWorkspaceRoot,  // find monorepo root
} from 'vite'
```

### createServer

```ts
const server = await createServer({
  root: import.meta.dirname,
  server: { port: 1337 },
})
await server.listen()
server.printUrls()
server.bindCLIShortcuts({ print: true })
```

Key `ViteDevServer` members:

- `server.middlewares` — Connect app for custom middleware
- `server.ws` — WebSocket server (`send`, `on`)
- `server.moduleGraph` — module import relationship tracker
- `server.transformRequest(url)` — programmatic module transform
- `server.transformIndexHtml(url, html)` — apply HTML transforms
- `server.ssrLoadModule(url)` — load module for SSR (auto-transforms ESM)
- `server.ssrFixStacktrace(error)` — fix SSR error stack traces
- `server.restart()` / `server.close()` — lifecycle

### build

```ts
import { build } from 'vite'
await build({
  root: './project',
  build: { rolldownOptions: { /* ... */ } },
})
```

In v8, `build()` throws `BundleError` (with `.errors` array) instead of raw errors.

### loadEnv

```ts
// Load all VITE_* vars for 'production' mode
const env = loadEnv('production', process.cwd())
// Load ALL vars (no prefix filter)
const allEnv = loadEnv('production', process.cwd(), '')
```

## Glob Import

`import.meta.glob` — import multiple modules by pattern:

```ts
// Lazy (dynamic import, code-split)
const modules = import.meta.glob('./dir/*.ts')
// modules = { './dir/foo.ts': () => import('./dir/foo.ts'), ... }

// Eager (static import, no code-split)
const modules = import.meta.glob('./dir/*.ts', { eager: true })

// Named import with tree-shaking
const setups = import.meta.glob('./dir/*.ts', { import: 'setup', eager: true })

// Multiple patterns, with exclusion
const modules = import.meta.glob(['./dir/*.ts', '!**/internal.*'])

// Raw string content
const shaders = import.meta.glob('./shaders/*.glsl', { query: '?raw', import: 'default' })
```

Arguments must be string literals — no variables or expressions.

## HMR API

Guard all HMR code for tree-shaking:

```ts
if (import.meta.hot) {
  // Self-accept: module handles its own update
  import.meta.hot.accept((newModule) => {
    if (newModule) { /* use updated exports */ }
  })

  // Accept dependency update
  import.meta.hot.accept('./dep.js', (newDep) => { newDep?.init() })

  // Cleanup side effects before module is replaced
  import.meta.hot.dispose((data) => { /* teardown */ })

  // Cleanup when module is removed from page entirely
  import.meta.hot.prune(() => { /* final cleanup */ })

  // Persist data across HMR updates
  import.meta.hot.data.count = (import.meta.hot.data.count || 0) + 1

  // Force propagation to importers
  import.meta.hot.invalidate('cannot self-update')

  // Custom events (plugin ↔ client communication)
  import.meta.hot.on('my:event', (payload) => { /* handle */ })
  import.meta.hot.send('my:event', { data: 'value' })
}
```

Built-in events: `vite:beforeUpdate`, `vite:afterUpdate`, `vite:beforeFullReload`, `vite:error`, `vite:ws:connect`, `vite:ws:disconnect`.

## Dependency Pre-Bundling

Vite pre-bundles `node_modules` deps on first run using Rolldown:
- Converts CJS/UMD to ESM
- Collapses many internal modules into one (e.g. lodash-es: 600+ files → 1)

Cache: `node_modules/.vite`. Invalidated by lockfile changes, config changes, or `NODE_ENV`.

Force re-bundle: `vite --force` or delete `node_modules/.vite`.

```ts
optimizeDeps: {
  include: ['linked-dep'],       // force pre-bundle (e.g. linked packages)
  exclude: ['small-esm-dep'],    // skip pre-bundling
}
```

## Migration

See `references/migration.md` for the full upgrade guide covering:
- v7 → v8 (Rolldown/Oxc migration, API renames)
- v6 → v7 breaking changes
