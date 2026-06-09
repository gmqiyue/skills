# Vite Config Quick Reference

## Table of Contents

- [Shared Options](#shared-options)
- [Server Options](#server-options)
- [Build Options](#build-options)
- [SSR Options](#ssr-options)
- [JavaScript API](#javascript-api)

## Shared Options

| Option | Default | Description |
|--------|---------|-------------|
| `root` | `process.cwd()` | Project root (where `index.html` lives) |
| `base` | `/` | Public base path for deployed assets |
| `mode` | `'development'`/`'production'` | Override mode for both serve and build |
| `define` | — | Global constant replacements (JSON-serializable or identifier) |
| `plugins` | `[]` | Array of Vite plugins |
| `publicDir` | `"public"` | Static assets dir, served at `/`. `false` to disable |
| `cacheDir` | `"node_modules/.vite"` | Cache dir for pre-bundled deps |
| `resolve.alias` | — | Import alias map. Use absolute paths |
| `resolve.extensions` | `['.mjs','.js','.mts','.ts','.jsx','.tsx','.json']` | Extensions to try on bare imports |
| `resolve.tsconfigPaths` | `false` | Use tsconfig paths for resolution (performance cost) |
| `css.modules` | — | CSS Modules config (passed to postcss-modules) |
| `css.postcss` | — | Inline PostCSS config or search dir |
| `css.preprocessorOptions` | — | Options for sass/less/stylus preprocessors |
| `css.transformer` | `'postcss'` | `'postcss'` or `'lightningcss'` (experimental) |
| `css.lightningcss` | — | Lightning CSS options |
| `json.namedExports` | `true` | Support named imports from JSON |
| `json.stringify` | `'auto'` | Stringify JSON imports > 10kB for perf |
| `oxc` | — | Oxc Transformer options (JSX, etc). Replaces `esbuild` |
| `envDir` | `root` | Directory to load `.env` files from. `false` to disable |
| `envPrefix` | `'VITE_'` | Prefix for client-exposed env vars. Never set to `''` |
| `appType` | `'spa'` | `'spa'`, `'mpa'`, or `'custom'` (SSR) |
| `logLevel` | `'info'` | `'info'`, `'warn'`, `'error'`, `'silent'` |

## Server Options

| Option | Default | Description |
|--------|---------|-------------|
| `server.host` | `'localhost'` | `'0.0.0.0'` or `true` for all interfaces |
| `server.port` | `5173` | Dev server port |
| `server.strictPort` | `false` | Exit if port in use |
| `server.https` | — | TLS options object |
| `server.open` | `false` | Auto-open browser |
| `server.proxy` | — | Proxy rules `{ '/api': 'http://...' }` |
| `server.cors` | restricted | CORS config. Don't set to `true` |
| `server.headers` | — | Custom response headers |
| `server.hmr` | — | HMR config. `{ overlay: false }` to disable error overlay |
| `server.ws` | — | WebSocket config. `false` to disable |
| `server.warmup` | — | `{ clientFiles: [...] }` pre-transform files |
| `server.watch` | — | Chokidar watcher options. `null` disables |
| `server.middlewareMode` | `false` | Use as middleware in custom server |
| `server.fs.strict` | `true` | Restrict file serving to workspace |
| `server.fs.allow` | workspace root | Allowed directories |
| `server.fs.deny` | `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']` | Blocked files |
| `server.allowedHosts` | `[]` | Hostnames allowed to respond to |
| `server.forwardConsole` | auto | Forward browser console/errors to terminal |

## Build Options

| Option | Default | Description |
|--------|---------|-------------|
| `build.target` | `'baseline-widely-available'` | Browser compat target. `'esnext'` for minimal transpile |
| `build.outDir` | `'dist'` | Output directory |
| `build.assetsDir` | `'assets'` | Assets subdir in outDir |
| `build.assetsInlineLimit` | `4096` | Inline assets < N bytes as base64 |
| `build.cssCodeSplit` | `true` | Split CSS per async chunk |
| `build.cssMinify` | `'lightningcss'` | CSS minifier |
| `build.sourcemap` | `false` | `true`, `'inline'`, `'hidden'` |
| `build.minify` | `'oxc'` | `'oxc'`, `'terser'`, `false` |
| `build.lib` | — | Library mode config |
| `build.rolldownOptions` | — | Pass-through Rolldown options |
| `build.manifest` | `false` | Generate `.vite/manifest.json` |
| `build.ssr` | `false` | SSR build entry |
| `build.watch` | `null` | Enable watch mode with `{}` |
| `build.emptyOutDir` | `true` if inside root | Clear outDir before build |
| `build.copyPublicDir` | `true` | Copy publicDir to outDir |
| `build.reportCompressedSize` | `true` | Report gzip sizes (slow for large projects) |
| `build.chunkSizeWarningLimit` | `500` | Chunk size warning threshold (kB) |

## SSR Options

| Option | Default | Description |
|--------|---------|-------------|
| `ssr.noExternal` | — | Force-transform listed dependencies |
| `ssr.external` | — | Force-externalize listed dependencies |
| `ssr.target` | `'node'` | `'node'` or `'webworker'` |
| `ssr.resolve.conditions` | — | Custom resolve conditions for SSR |

## JavaScript API

### Core Functions

```ts
import { createServer, build, preview, resolveConfig, mergeConfig, loadEnv, normalizePath } from 'vite'
```

- `createServer(config?)` → `Promise<ViteDevServer>` — create dev server
- `build(config?)` → `Promise<RollupOutput>` — production build
- `preview(config?)` → `Promise<PreviewServer>` — preview production build
- `loadEnv(mode, envDir, prefix?)` → env vars object
- `mergeConfig(defaults, overrides)` — deep merge two configs
- `normalizePath(path)` — normalize to POSIX separators

### ViteDevServer Key Members

- `server.middlewares` — Connect app for custom middleware
- `server.httpServer` — Node http.Server
- `server.ws` — WebSocket server
- `server.moduleGraph` — module relationship tracker
- `server.transformRequest(url)` — programmatic transform
- `server.transformIndexHtml(url, html)` — apply HTML transforms
- `server.ssrLoadModule(url)` — load module for SSR
- `server.ssrFixStacktrace(error)` — fix SSR error stack traces
- `server.listen(port?)` / `server.close()` — lifecycle
- `server.restart()` — restart server
