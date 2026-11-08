/**
 * Production entry: serves the TanStack Start fetch handler (dist/server/server.js)
 * with the static client build (dist/client) mounted in front of it.
 */
import { serve } from 'srvx'
import { staticMiddleware } from 'srvx/static'
import server from './dist/server/server.js'

const port = Number(process.env.PORT ?? 3000)

serve({
  port,
  fetch: server.fetch,
  middleware: [staticMiddleware({ dir: './dist/client' })],
})

console.log(`lets-learn-hangul listening on http://localhost:${port}`)
