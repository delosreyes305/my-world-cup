import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─── Dev plugin: mirrors api/claude.js for local development ─────────────────
// In production Vercel routes /api/claude to the serverless function.
// In dev Vite handles it here using VITE_ANTHROPIC_API_KEY from .env
function claudeApiPlugin() {
  return {
    name: 'claude-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/claude', (req, res) => {
        if (req.method === 'OPTIONS') { res.statusCode = 200; return res.end() }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        const chunks = []
        req.on('data', c => chunks.push(c))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const body   = JSON.parse(Buffer.concat(chunks).toString())
            const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''

            if (!apiKey.startsWith('sk-ant-api')) {
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }))
            }

            const upstream = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type':     'application/json',
                'x-api-key':        apiKey,
                'anthropic-version':'2023-06-01',
              },
              body: JSON.stringify({
                model:      'claude-sonnet-4-5',
                max_tokens: body.max_tokens || 900,
                ...(body.system ? { system: body.system } : {}),
                messages:   [{ role: 'user', content: body.prompt }],
              }),
            })

            const data = await upstream.json()
            res.end(JSON.stringify(data))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), claudeApiPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api/football': {
        target:      'https://v3.football.api-sports.io',
        changeOrigin: true,
        rewrite:     p => p.replace(/^\/api\/football/, ''),
      },
      '/api/news': {
        target:      'https://newsapi.org/v2',
        changeOrigin: true,
        rewrite:     p => p.replace(/^\/api\/news/, ''),
      },
    },
  },
  build: { outDir: 'dist' },
})
