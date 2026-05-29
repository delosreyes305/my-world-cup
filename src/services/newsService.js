// ─── News Service — NewsAPI ──────────────────────────
// https://newsapi.org/docs
// Uses CORS proxy (allorigins.win) to bypass client-side CORS restrictions

import { get } from './http.js'
import { NEWS } from '../data/mockData.js'

const BASE = '/api/news'   // proxied: Vite in dev, Vercel rewrite in prod
const KEY  = import.meta.env.VITE_NEWS_API_KEY || ''
const isMock = !KEY || KEY === 'TU_CLAVE_AQUI'

// ─── Query strings (EN) ─────────────────────────────
const QUERIES_EN = {
  all:          'FIFA "World Cup 2026"',
  breaking:     'FIFA "World Cup 2026" breaking',
  match_report: 'FIFA "World Cup 2026" match goal score',
  injury:       'FIFA "World Cup 2026" injury player',
  transfer:     'FIFA "World Cup 2026" transfer signing',
  trending:     'FIFA "World Cup 2026" reaction',
}

// ─── Query strings (ES) ─────────────────────────────
const QUERIES_ES = {
  all:          '"Copa del Mundo 2026" OR "Mundial 2026"',
  breaking:     '"Copa del Mundo 2026" últimas noticias urgente',
  match_report: '"Copa del Mundo 2026" partido gol resultado crónica',
  injury:       '"Copa del Mundo 2026" lesión jugador baja',
  transfer:     '"Copa del Mundo 2026" fichaje transferencia',
  trending:     '"Copa del Mundo 2026" reacción tendencia viral',
}

// ─── Soccer relevance filters ────────────────────────
const SOCCER_EN = /soccer|football|fifa|world cup|goal|messi|ronaldo|mbappé|neymar|premier|liga|bundesliga|serie a|ligue 1/i
const SOCCER_ES = /fútbol|mundial|copa del mundo|gol|messi|ronaldo|mbappé|neymar|selección|liga|bundesliga|premier/i

// ─── Mock fallback by category ───────────────────────
function mockByCategory(category) {
  const catMap = {
    all:          NEWS,
    breaking:     NEWS.filter(n => n.cat === 'BREAKING'),
    match_report: NEWS.filter(n => n.cat === 'MATCH REPORT'),
    injury:       NEWS.filter(n => n.cat === 'INJURY'),
    transfer:     NEWS.filter(n => n.cat === 'TRANSFER'),
    trending:     NEWS.filter(n => n.cat === 'TRENDING'),
    world_cup:    NEWS.filter(n => n.cat === 'WORLD CUP'),
  }
  return catMap[category]?.length ? catMap[category] : NEWS
}

export async function getNews(category = 'all', lang = 'en', pageSize = 18) {
  if (isMock) return mockByCategory(category)

  const isEs    = lang === 'es'
  const queries = isEs ? QUERIES_ES : QUERIES_EN
  const q       = queries[category] || queries.all
  const apiLang = isEs ? 'es' : 'en'
  const filter  = isEs ? SOCCER_ES : SOCCER_EN

  const url = `${BASE}/everything?q=${encodeURIComponent(q)}&language=${apiLang}&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${KEY}`

  try {
    const data = await get(url)

    // NewsAPI returns status:'error' with HTTP 200 for plan limits / bad keys
    if (data.status === 'error') {
      console.warn(`[newsService] API error (${data.code}): ${data.message} — using mock data`)
      return mockByCategory(category)
    }

    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .filter(a => filter.test(a.title) || filter.test(a.description || ''))
      .map(a => normalizeArticle(a, lang))

    // If the API returned nothing useful, fall back to mock
    if (articles.length === 0) return mockByCategory(category)

    return articles
  } catch (err) {
    console.warn('[newsService] Request failed, using mock data:', err.message)
    return mockByCategory(category)
  }
}

export async function getHeadlines(lang = 'en', pageSize = 6) {
  if (isMock) return NEWS.slice(0, 6)

  const isEs = lang === 'es'
  const q    = isEs ? 'Copa del Mundo 2026' : 'World Cup 2026'
  const url  = `${BASE}/top-headlines?q=${encodeURIComponent(q)}&language=${isEs ? 'es' : 'en'}&pageSize=${pageSize}&apiKey=${KEY}`
  const data = await get(url)
  return (data.articles || []).map(a => normalizeArticle(a, lang))
}

// ─── Normalizador ────────────────────────────────────

function normalizeArticle(a, lang = 'en') {
  const title = a.title?.toLowerCase() || ''
  const isEs  = lang === 'es'

  // Category detection — bilingual keyword matching
  let cat = 'WORLD CUP'
  if (isEs) {
    if (title.includes('lesión') || title.includes('lesion') || title.includes('baja') || title.includes('duda'))
      cat = 'INJURY'
    else if (title.includes('fichaje') || title.includes('transferencia') || title.includes('contrato') || title.includes('firma'))
      cat = 'TRANSFER'
    else if (title.includes('gol') || title.includes('derrota') || title.includes('victoria') || title.includes('empate') || title.includes('resultado'))
      cat = 'MATCH REPORT'
    else if (title.includes('urgente') || title.includes('confirma') || title.includes('anuncia') || title.includes('oficial'))
      cat = 'BREAKING'
    else if (title.includes('tendencia') || title.includes('viral') || title.includes('reacción') || title.includes('reaccion'))
      cat = 'TRENDING'
  } else {
    if (title.includes('injur') || title.includes('doubt') || title.includes('miss'))
      cat = 'INJURY'
    else if (title.includes('transfer') || title.includes('sign') || title.includes('deal'))
      cat = 'TRANSFER'
    else if (title.includes('goal') || title.includes('beat') || title.includes('win') || title.includes('score'))
      cat = 'MATCH REPORT'
    else if (title.includes('break') || title.includes('confirm') || title.includes('announce'))
      cat = 'BREAKING'
    else if (title.includes('trend') || title.includes('viral') || title.includes('reaction'))
      cat = 'TRENDING'
  }

  const emojiMap = {
    'INJURY': '🚑', 'TRANSFER': '💰', 'MATCH REPORT': '⚽',
    'BREAKING': '⚡', 'WORLD CUP': '🏆', 'TRENDING': '🔥',
  }
  const colorMap = {
    'BREAKING': '#f0b429', 'MATCH REPORT': '#3b82f6', 'INJURY': '#ef4444',
    'WORLD CUP': '#10b981', 'TRANSFER': '#f97316', 'TRENDING': '#06b6d4',
  }

  // Human-readable category label in the right language
  const catLabelEN = { 'INJURY': 'INJURY', 'TRANSFER': 'TRANSFER', 'MATCH REPORT': 'MATCH REPORT', 'BREAKING': 'BREAKING', 'WORLD CUP': 'WORLD CUP', 'TRENDING': 'TRENDING' }
  const catLabelES = { 'INJURY': 'LESIÓN', 'TRANSFER': 'FICHAJE', 'MATCH REPORT': 'CRÓNICA', 'BREAKING': 'URGENTE', 'WORLD CUP': 'MUNDIAL', 'TRENDING': 'TENDENCIA' }

  return {
    id:      a.url,
    cat,
    catLabel: isEs ? (catLabelES[cat] || cat) : (catLabelEN[cat] || cat),
    emoji:   emojiMap[cat]  || '📰',
    color:   colorMap[cat]  || '#64748b',
    title:   a.title,
    excerpt: a.description || '',
    url:     a.url,
    image:   a.urlToImage  || null,
    source:  a.source?.name || '',
    time:    relativeTime(a.publishedAt, lang),
  }
}

function relativeTime(iso, lang = 'en') {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (lang === 'es') {
    if (mins < 60)  return `hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
  }
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
