# Vite Plugin API Reference

## Table of Contents

- [Plugin Structure](#plugin-structure)
- [Conventions](#conventions)
- [Universal Hooks](#universal-hooks)
- [Vite-Specific Hooks](#vite-specific-hooks)
- [Virtual Modules](#virtual-modules)
- [Plugin Ordering](#plugin-ordering)
- [Hook Filters](#hook-filters)
- [Client-Server Communication](#client-server-communication)

## Plugin Structure

A Vite plugin is a factory function returning a plugin object:

```ts
export default function myPlugin(options?: MyOptions) {
  return {
    name: 'vite-plugin-my-plugin',
    // hooks...
  }
}
```

Naming: `vite-plugin-` prefix for Vite-only plugins, `rolldown-plugin-` for universal ones.

## Conventions

- Add `vite-plugin` keyword in `package.json`
- Framework-specific: `vite-plugin-vue-*`, `vite-plugin-react-*`
- Prefix virtual module ids with `virtual:`, resolve with `\0` prefix internally

## Universal Hooks

Called on server start (once): `options`, `buildStart`

Called per module request: `resolveId`, `load`, `transform`

Called on server close: `buildEnd`, `closeBundle`

**Not called in dev**: `moduleParsed` (skipped for performance), output generation hooks (except `closeBundle`).

## Vite-Specific Hooks

### `config(config, env)`
Modify config before resolution. Return partial config (deep-merged) or mutate directly.
- Kind: async, sequential

### `configResolved(config)`
Read final resolved config. Store it for use in other hooks.
- Kind: async, parallel

### `configureServer(server)`
Add custom middlewares. Return a function to inject middleware AFTER internal ones.

```ts
configureServer(server) {
  return () => {
    server.middlewares.use((req, res, next) => { /* post middleware */ })
  }
}
```

### `configurePreviewServer(server)`
Same as `configureServer` but for `vite preview`.

### `transformIndexHtml(html, ctx)`
Transform HTML entry files. Return: string, tag descriptors array, or `{ html, tags }`.

```ts
transformIndexHtml(html) {
  return html.replace(/<title>(.*?)<\/title>/, '<title>New Title</title>')
}
```

Tag descriptor:

```ts
interface HtmlTagDescriptor {
  tag: string
  attrs?: Record<string, string | boolean>
  children?: string | HtmlTagDescriptor[]
  injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
}
```

### `handleHotUpdate(ctx)`
Custom HMR handling. Return filtered modules, empty array for full reload, or send custom events.

```ts
handleHotUpdate({ server, modules }) {
  server.ws.send({ type: 'custom', event: 'my-update', data: {} })
  return []
}
```

## Virtual Modules

```ts
import { exactRegex } from '@rolldown/pluginutils'

export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedId = '\0' + virtualModuleId

  return {
    name: 'my-plugin',
    resolveId: {
      filter: { id: exactRegex(virtualModuleId) },
      handler() { return resolvedId },
    },
    load: {
      filter: { id: exactRegex(resolvedId) },
      handler() { return `export const msg = "from virtual module"` },
    },
  }
}
```

## Plugin Ordering

Resolution order: Alias → `enforce: 'pre'` → Vite core → no enforce → Vite build → `enforce: 'post'` → Vite post build.

Conditional application:

```ts
{ apply: 'build' }   // build only
{ apply: 'serve' }   // dev only
{ apply(config, { command }) { return command === 'build' && !config.build.ssr } }
```

## Hook Filters

Reduce overhead by filtering which files trigger hooks:

```ts
transform: {
  filter: { id: /\.js$/ },
  handler(code, id) {
    if (!/\.js$/.test(id)) return null  // backward compat guard
    return { code: transformCode(code), map: null }
  },
}
```

## Client-Server Communication

Server → Client:

```ts
// plugin
configureServer(server) {
  server.ws.send('my:greetings', { msg: 'hello' })
}

// client
import.meta.hot.on('my:greetings', (data) => console.log(data.msg))
```

Client → Server:

```ts
// client
import.meta.hot.send('my:from-client', { msg: 'Hey!' })

// plugin
configureServer(server) {
  server.ws.on('my:from-client', (data, client) => {
    client.send('my:ack', { msg: 'Got it!' })
  })
}
```

Always prefix event names to avoid collisions (e.g. `my-plugin:event-name`).

## Output Bundle Metadata

During build, chunks have `viteMetadata`:

```ts
generateBundle(_, bundle) {
  for (const output of Object.values(bundle)) {
    const css = output.viteMetadata?.importedCss    // Set<string>
    const assets = output.viteMetadata?.importedAssets  // Set<string>
  }
}
```

## Debug Tools

- `vite-plugin-inspect`: inspect intermediate plugin state at `/__inspect/`
- `vite --debug plugin-transform`: log transform durations
- `this.meta.viteVersion`: check Vite version in plugin context
- `this.meta.rolldownVersion`: detect Rolldown-powered Vite (v8+)
