import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// ─── Load .env manually so the key is always available in the
//     server middleware, regardless of Vite's internal timing ──
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    const lines   = fs.readFileSync(envPath, 'utf8').split('\n')
    const env     = {}
    for (const line of lines) {
      const m = line.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/)
      if (m) env[m[1]] = m[2]
    }
    return env
  } catch {
    return {}
  }
}

// ─── Dev plugin: mirrors api/claude.js for local development ─────────────────
// In production Vercel routes /api/claude to the serverless function.
// In dev Vite handles it here. The key is read directly from .env each request.
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
            const body = JSON.parse(Buffer.concat(chunks).toString())

            // Read .env fresh on every request so hot-reload works without restart
            const envVars = loadEnvFile()
            const apiKey  = envVars.VITE_ANTHROPIC_API_KEY
                         || process.env.VITE_ANTHROPIC_API_KEY
                         || process.env.ANTHROPIC_API_KEY
                         || ''

            if (!apiKey || !apiKey.startsWith('sk-ant-api')) {
              res.statusCode = 500
              return res.end(JSON.stringify({
                error: 'ANTHROPIC_API_KEY not configured — add VITE_ANTHROPIC_API_KEY to .env and restart',
              }))
            }

            const upstream = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type':      'application/json',
                'x-api-key':         apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model:      'claude-haiku-4-5',
                max_tokens: body.max_tokens || 900,
                ...(body.system ? { system: body.system } : {}),
                messages:   [{ role: 'user', content: body.prompt }],
              }),
            })

            const data = await upstream.json()

            // Surface upstream errors clearly instead of hiding them
            if (!upstream.ok || data.type === 'error') {
              res.statusCode = upstream.status || 500
              return res.end(JSON.stringify({
                error: `Anthropic API error (${data.error?.type || upstream.status}): ${data.error?.message || 'unknown'}`,
              }))
            }

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
        target:       'https://v3.football.api-sports.io',
        changeOrigin: true,
        rewrite:      p => p.replace(/^\/api\/football/, ''),
      },
      '/api/news': {
        target:       'https://newsapi.org/v2',
        changeOrigin: true,
        rewrite:      p => p.replace(/^\/api\/news/, ''),
      },
      // ── Flask backend (auth + favoritos) ──────────────────────────
      '/api/auth': {
        target:       'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/favorites': {
        target:       'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: { outDir: 'dist' },
})
