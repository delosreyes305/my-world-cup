// ─── News Service — NewsAPI ──────────────────────────
// https://newsapi.org/docs
// Uses CORS proxy (allorigins.win) to bypass client-side CORS restrictions

import { get } from './http.js'
import { NEWS } from '../data/mockData.js'

const BASE = '/api/news'   // proxied: Vite in dev, Vercel rewrite in prod
const KEY  = import.meta.env.VITE_NEWS_API_KEY || ''
const isMock = !KEY || KEY === 'TU_CLAVE_AQUI'

const QUERIES = {
  all:          'FIFA "World Cup 2026"',
  breaking:     'FIFA "World Cup 2026" breaking',
  match_report: 'FIFA "World Cup 2026" match goal score',
  injury:       'FIFA "World Cup 2026" injury player',
  transfer:     'FIFA "World Cup 2026" transfer signing',
  trending:     'FIFA "World Cup 2026" reaction',
}

export async function getNews(category = 'all', pageSize = 18) {
  if (isMock) {
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

  const q = QUERIES[category] || QUERIES.all
  const url = `${BASE}/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${KEY}`

  const data = await get(url)
  const SOCCER_TERMS = /soccer|football|fifa|world cup|goal|messi|ronaldo|mbappé|neymar|premier|liga|bundesliga|serie a|ligue 1/i
  return (data.articles || [])
    .filter(a => a.title && a.title !== '[Removed]')
    .filter(a => SOCCER_TERMS.test(a.title) || SOCCER_TERMS.test(a.description || ''))
    .map(normalizeArticle)
}

export async function getHeadlines(pageSize = 6) {
  if (isMock) return NEWS.slice(0, 6)

  const url = `${BASE}/top-headlines?q=World+Cup+2026&language=en&pageSize=${pageSize}&apiKey=${KEY}`
  const data = await get(url)
  return (data.articles || []).map(normalizeArticle)
}

// ─── Normalizador ────────────────────────────────────

function normalizeArticle(a) {
  const title = a.title?.toLowerCase() || ''
  let cat = 'WORLD CUP'
  if (title.includes('injur') || title.includes('doubt') || title.includes('miss')) cat = 'INJURY'
  else if (title.includes('transfer') || title.includes('sign') || title.includes('deal')) cat = 'TRANSFER'
  else if (title.includes('goal') || title.includes('beat') || title.includes('win') || title.includes('score')) cat = 'MATCH REPORT'
  else if (title.includes('break') || title.includes('confirm') || title.includes('announce')) cat = 'BREAKING'
  else if (title.includes('trend') || title.includes('viral') || title.includes('reaction')) cat = 'TRENDING'

  const emojiMap = {
    'INJURY': '🚑', 'TRANSFER': '💰', 'MATCH REPORT': '⚽',
    'BREAKING': '⚡', 'WORLD CUP': '🏆', 'TRENDING': '🔥',
  }
  const colorMap = {
    'BREAKING': '#f0b429', 'MATCH REPORT': '#3b82f6', 'INJURY': '#ef4444',
    'WORLD CUP': '#10b981', 'TRANSFER': '#f97316', 'TRENDING': '#06b6d4',
  }

  return {
    id:      a.url,
    cat,
    emoji:   emojiMap[cat]  || '📰',
    color:   colorMap[cat]  || '#64748b',
    title:   a.title,
    excerpt: a.description || '',
    url:     a.url,
    image:   a.urlToImage  || null,
    source:  a.source?.name || '',
    time:    relativeTime(a.publishedAt),
  }
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
