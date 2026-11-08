import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { redact } from '@tanstack/redact/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

// Redact redirects `react`/`react-dom` imports to its own runtime, and for that
// to reach dependencies too the server build has to bundle them instead of
// leaving them to Node's resolver. This is build-only on purpose: during `vite
// dev` the SSR module runner would then inline CJS packages such as tslib
// (via react-remove-scroll → Radix), whose default-export interop it can't
// resolve, and every route would 500.
export default defineConfig(({ command }) => ({
  ssr: {
    // `false` is not a valid value here — omit it in dev instead.
    noExternal: command === 'build' ? true : undefined,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
  },
  plugins: [
    tailwindcss(),
    // tanstackStart() must run before the React plugin.
    tanstackStart(),
    // Nitro turns the Start server entry into a deployable build (.output/).
    // The same build targets Vercel, Node, Netlify, Cloudflare, … — on Vercel
    // the `tanstack-start` framework preset picks up `.vercel/output`.
    nitro(),
    viteReact(),
    // TanStack Redact replaces the React runtime with a smaller, synchronous
    // one — https://tanstack.com/redact/latest
    // Must come after the Start and React plugins. Kept on the default (full)
    // feature set: Radix's dialog and tooltip use portals, and Start needs
    // hydration, context, Suspense, lazy, memo and forwardRef.
    redact(),
  ],
}))
