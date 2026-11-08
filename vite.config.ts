import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
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
  ],
})
