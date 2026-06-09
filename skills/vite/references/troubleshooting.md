# Vite Troubleshooting Reference

## Dev Server Issues

### Requests stall forever (Linux)
Cause: file descriptor or inotify limits too low.
```bash
ulimit -Sn 10000
sudo sysctl fs.inotify.max_user_watches=524288
```

### ENOSPC: System limit for file watchers
Same root cause as above — increase `max_user_watches`.

### 431 Request Header Fields Too Large
Cookie or header is too large. Delete stale cookies or use `--max-http-header-size`.

### Network requests stop loading (HTTPS)
Self-signed cert causes Chrome to ignore caching. Use a trusted cert or:
```bash
# macOS
security add-trusted-cert -d -r trustRoot -k ~/Library/Keychains/login.keychain-db your-cert.cer
```

### Dev Containers / VS Code Port Forwarding
Set `server.host: '127.0.0.1'` — VS Code port forwarding doesn't support IPv6.

### WSL2 file watching broken
Files edited by Windows apps aren't detected. Edit from WSL2 side, or set `server.watch: { usePolling: true }` (CPU-heavy).

## HMR Issues

### File change detected but HMR not working
Check import casing: `import './Foo.js'` vs `'./foo.js'` — case mismatch breaks HMR silently.

### Full reload instead of HMR
- Circular dependencies — run `vite --debug hmr` to find the cycle
- Module not handled by any HMR handler

## Build Issues

### CORS error opening built file
Don't open `dist/index.html` via `file://` — use `npx vite preview` or an HTTP server.

### `Failed to fetch dynamically imported module`
Causes:
1. **Version skew** — old cached HTML references deleted chunks. Keep previous deployment chunks temporarily.
2. **Network errors** — unstable connection.
3. **Browser extensions** — ad-blockers blocking chunk requests. Rename chunks via `build.rolldownOptions.output.chunkFileNames`.

Handle gracefully:
```js
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload()
})
```

### No such file or directory (case sensitivity)
Developed on macOS/Windows (case-insensitive), built on Linux (case-sensitive). Fix import casing.

## Config Issues

### ESM-only package error with require()
Config file using `require()` on ESM package. Fix:
- Add `"type": "module"` to `package.json`, or
- Rename config to `vite.config.mjs` / `vite.config.mts`

## Dependency Optimization

### Outdated pre-bundled deps with linked packages
`npm link` doesn't trigger re-optimization. Run `vite --force` after linking/unlinking. Prefer `npm overrides` / `pnpm overrides` over `npm link`.

## Performance Profiling

```bash
vite --profile --open          # dev server CPU profile
vite build --profile           # build CPU profile
vite --debug plugin-transform  # log transform durations
```

Inspect profile at https://www.speedscope.app/. Install `vite-plugin-inspect` for intermediate state inspection at `/__inspect/`.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `envPrefix: ''` | Never — leaks all env vars. Use `define` for individual vars |
| Secrets in `VITE_*` vars | Move to server-side. `VITE_*` is bundled into output |
| `vite preview` as production server | Use nginx, Caddy, or a Node server |
| Missing `"isolatedModules": true` | Required in tsconfig for Oxc transpilation |
| Relative paths in `resolve.alias` | Use absolute paths (`resolve(import.meta.dirname, 'src')`) |
| `server.allowedHosts: true` | Enables DNS rebinding attacks. Use explicit list |
