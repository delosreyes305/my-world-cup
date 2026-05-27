// ─── AI Service — Anthropic Claude ──────────────────
// Modelo: claude-sonnet-4-6
// https://docs.anthropic.com/en/api/messages
//
// PRODUCCION: nunca expongas la key en el frontend.
// Usa el proxy en /proxy/server.js que inyecta el header.

import { post } from './http.js'

const KEY   = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const BASE  = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'
// Real Anthropic keys always start with 'sk-ant-api'; any placeholder falls back to mock
const isMock = !KEY || !KEY.startsWith('sk-ant-api')

const CLAUDE_HEADERS = {
  'x-api-key': KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}

// ─────────────────────────────────────────────────────
// PREDICCIÓN DE PARTIDO
// ─────────────────────────────────────────────────────

export async function getMatchPredictionAI(team1, team2) {
  if (isMock) {
    return `**${team1.flag} ${team1.name}** (FIFA #${team1.rank}) llegan a este encuentro con forma ${team1.form?.join('-') || 'N/A'} y ${team1.titles} título(s) mundialista(s). Su entrenador ${team1.coach} apostará por presión alta y transiciones rápidas.\n\n**${team2.flag} ${team2.name}** (FIFA #${team2.rank}) con forma ${team2.form?.join('-') || 'N/A'}, buscará explotar la velocidad en los costados y aprovechar los balones parados, donde han sido letales en el torneo.\n\n🔮 **Predicción: ${team1.name} 1–0 ${team2.name}** — Un partido táctico y cerrado, decidido por un gol de jugada ensayada en el segundo tiempo. La experiencia mundialista marca la diferencia.`
  }

  const prompt = `You are a FIFA World Cup 2026 expert analyst. Write an exciting 3-paragraph match prediction for ${team1.flag} ${team1.name} vs ${team2.flag} ${team2.name}.

Team stats:
- ${team1.name}: FIFA #${team1.rank}, form: ${team1.form?.join('-') || 'N/A'}, ${team1.titles} WC title(s), coach: ${team1.coach || 'TBD'}
- ${team2.name}: FIFA #${team2.rank}, form: ${team2.form?.join('-') || 'N/A'}, ${team2.titles} WC title(s), coach: ${team2.coach || 'TBD'}

Para 1: Form + key players. Para 2: Tactical breakdown. Para 3: Final scoreline + reason.
Be specific, confident, engaging. Under 200 words. Use **bold** for team names.`

  const data = await post(BASE, {
    model: MODEL, max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  }, { headers: CLAUDE_HEADERS })

  return data.content?.find(c => c.type === 'text')?.text || 'Análisis no disponible.'
}

// ─────────────────────────────────────────────────────
// TRIVIA GENERATIVA
// ─────────────────────────────────────────────────────

export async function generateTriviaQuestion(lang = 'en') {
  if (isMock) return null   // caller usa banco local

  const prompt = lang === 'es'
    ? `Genera UNA pregunta de trivia difícil sobre la Copa del Mundo FIFA (cualquier edición). Responde SOLO en JSON sin markdown:
{"q":"pregunta","opts":["A","B","C","D"],"correct":0,"explain":"explicación","emoji":"emoji"}`
    : `Generate ONE hard FIFA World Cup trivia question (any edition). Respond ONLY in JSON, no markdown:
{"q":"question","opts":["A","B","C","D"],"correct":0,"explain":"explanation","emoji":"emoji"}`

  const data = await post(BASE, {
    model: MODEL, max_tokens: 250,
    messages: [{ role: 'user', content: prompt }],
  }, { headers: CLAUDE_HEADERS })

  const text = data.content?.find(c => c.type === 'text')?.text || ''
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('Respuesta inválida de IA')
  return JSON.parse(match[0])
}
