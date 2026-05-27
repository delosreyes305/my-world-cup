// ─── Sports Service — API-Football v3 ───────────────
// league=1  season=2026  →  FIFA World Cup 2026
// Docs: https://www.api-football.com/documentation-v3
//
// Si no hay clave en .env → usa mockData automáticamente.

import { get } from './http.js'
import {
  MATCHES, TEAMS, PLAYERS, GROUPS,
} from '../data/mockData.js'

// In dev: Vite proxy at /api/football → v3.football.api-sports.io (bypasses CORS)
// In prod: Vercel rewrite at /api/football → v3.football.api-sports.io (same bypass)
const BASE = import.meta.env.VITE_FOOTBALL_API_KEY
  ? '/api/football'
  : null
const KEY  = import.meta.env.VITE_FOOTBALL_API_KEY || ''

// ─── ¿Modo mock? ─────────────────────────────────────
const isMock = !KEY || KEY === 'TU_CLAVE_AQUI'
/** Expuesto para que los componentes puedan ajustar su UI según el modo */
export const IS_MOCK = isMock

const headers = { 'x-apisports-key': KEY }

const WC_LEAGUE  = 1
const WC_SEASON  = 2026

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

/** Convierte status code de la API → 'live' | 'ft' | 'upcoming' */
function mapStatus(short) {
  const live     = ['1H','2H','HT','ET','BT','P','INT','LIVE']
  const finished = ['FT','AET','PEN']
  if (live.includes(short))     return 'live'
  if (finished.includes(short)) return 'ft'
  return 'upcoming'
}

// ─────────────────────────────────────────────────────
// PARTIDOS
// ─────────────────────────────────────────────────────

/** Partidos en vivo del Mundial */
export async function getLiveMatches() {
  if (isMock) return MATCHES.filter(m => m.status === 'live')

  const data = await get(
    `${BASE}/fixtures?live=all&league=${WC_LEAGUE}`,
    { headers }
  )
  return (data.response || []).map(normalizeFixture)
}

/** Partidos por fecha (default: hoy) */
export async function getMatchesByDate(date = todayISO()) {
  if (isMock) return MATCHES

  const data = await get(
    `${BASE}/fixtures?date=${date}&league=${WC_LEAGUE}&season=${WC_SEASON}&timezone=America/New_York`,
    { headers }
  )
  return (data.response || []).map(normalizeFixture)
}

/** Todos los partidos del torneo */
export async function getAllFixtures() {
  if (isMock) return MATCHES

  const data = await get(
    `${BASE}/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}`,
    { headers }
  )
  return (data.response || []).map(normalizeFixture)
}

/** Estadísticas de un partido */
export async function getMatchStats(fixtureId) {
  if (isMock) return MOCK_STATS

  const data = await get(
    `${BASE}/fixtures/statistics?fixture=${fixtureId}`,
    { headers }
  )
  return normalizeStats(data.response || [])
}

/** Eventos (goles, tarjetas, cambios) de un partido */
export async function getMatchEvents(fixtureId) {
  if (isMock) return MOCK_EVENTS

  const data = await get(
    `${BASE}/fixtures/events?fixture=${fixtureId}`,
    { headers }
  )
  return (data.response || []).map(e => ({
    time:   `${e.time?.elapsed}'`,
    type:   e.type,
    detail: e.detail,
    team:   e.team?.name,
    player: e.player?.name,
  }))
}

// ─────────────────────────────────────────────────────
// TABLA DE POSICIONES
// ─────────────────────────────────────────────────────

export async function getStandings() {
  if (isMock) return GROUPS

  const data = await get(
    `${BASE}/standings?league=${WC_LEAGUE}&season=${WC_SEASON}`,
    { headers }
  )
  return normalizeStandings(data.response || [])
}

// ─────────────────────────────────────────────────────
// EQUIPOS
// ─────────────────────────────────────────────────────

/** Static confederation mapping for all 48 WC 2026 teams */
const CONFEDERATION_MAP = {
  // UEFA – 16
  Belgium: 'UEFA', France: 'UEFA', Croatia: 'UEFA', Sweden: 'UEFA',
  Switzerland: 'UEFA', 'Czech Republic': 'UEFA', Austria: 'UEFA',
  'Türkiye': 'UEFA', Norway: 'UEFA', Scotland: 'UEFA',
  'Bosnia & Herzegovina': 'UEFA', Netherlands: 'UEFA', Germany: 'UEFA',
  Spain: 'UEFA', England: 'UEFA', Portugal: 'UEFA',
  // CONMEBOL – 6
  Brazil: 'CONMEBOL', Uruguay: 'CONMEBOL', Colombia: 'CONMEBOL',
  Argentina: 'CONMEBOL', Paraguay: 'CONMEBOL', Ecuador: 'CONMEBOL',
  // CONCACAF – 6
  Panama: 'CONCACAF', Mexico: 'CONCACAF', USA: 'CONCACAF',
  Haiti: 'CONCACAF', Canada: 'CONCACAF', 'Curaçao': 'CONCACAF',
  // CAF – 10
  Senegal: 'CAF', Morocco: 'CAF', Egypt: 'CAF', 'Ivory Coast': 'CAF',
  Ghana: 'CAF', 'Congo DR': 'CAF', 'South Africa': 'CAF',
  Algeria: 'CAF', 'Cape Verde Islands': 'CAF', Tunisia: 'CAF',
  // AFC – 9
  Japan: 'AFC', 'South Korea': 'AFC', Australia: 'AFC', Iran: 'AFC',
  'Saudi Arabia': 'AFC', Jordan: 'AFC', Iraq: 'AFC',
  Uzbekistan: 'AFC', Qatar: 'AFC',
  // OFC – 1
  'New Zealand': 'OFC',
}

export async function getTeams() {
  if (isMock) return TEAMS

  const data = await get(
    `${BASE}/teams?league=${WC_LEAGUE}&season=${WC_SEASON}`,
    { headers }
  )
  return (data.response || []).map(r => {
    const confederation = CONFEDERATION_MAP[r.team.name] || 'Other'
    return {
      id:            r.team.id,
      name:          r.team.name,
      code:          r.team.code  || '',
      flag:          r.team.logo,        // HTTPS image URL
      country:       r.team.country,
      founded:       r.team.founded || null,
      confederation,
      region:        confederation,      // alias used by filter
      rank:          null,
      coach:         null,
      titles:        0,
      gf: 0, ga: 0, pts: 0,
      mp: 0, w: 0, d: 0, l: 0,
      form:          [],
      squad:         [],
      venue: {
        name:     r.venue?.name     || '',
        city:     r.venue?.city     || '',
        capacity: r.venue?.capacity || null,
        image:    r.venue?.image    || '',
      },
    }
  })
}

// ─────────────────────────────────────────────────────
// PARTIDOS DE UN EQUIPO
// ─────────────────────────────────────────────────────

/**
 * Todos los partidos del Mundial para un equipo específico.
 * @param {number} teamId
 */
export async function getTeamFixtures(teamId) {
  if (isMock) {
    // In mock, match by team name — look up from TEAMS
    const team = TEAMS.find(t => t.id === Number(teamId))
    const name = team?.name
    if (!name) return []
    return MATCHES.filter(m => m.team1 === name || m.team2 === name)
  }

  const data = await get(
    `${BASE}/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&team=${teamId}`,
    { headers }
  )
  return (data.response || []).map(normalizeFixture)
}

// ─────────────────────────────────────────────────────
// JUGADORES  ← con filtro por país
// ─────────────────────────────────────────────────────

/**
 * Top scorers del Mundial.
 * - Durante el torneo: usa el endpoint /topscorers (ordenado por goles WC).
 * - Pre-torneo (endpoint vacío): carga jugadores de los primeros 3 equipos del
 *   torneo en paralelo para mostrar datos reales de la API aunque no haya goles.
 */
export async function getTopScorers() {
  if (isMock) return [...PLAYERS].sort((a, b) => b.goals - a.goals || b.intlGoals - a.intlGoals)

  // 1. Intentar topscorers del torneo
  const topData = await get(
    `${BASE}/players/topscorers?league=${WC_LEAGUE}&season=${WC_SEASON}`,
    { headers }
  )
  const topScorers = (topData.response || []).map(normalizePlayer)
  if (topScorers.length > 0) return topScorers

  // 2. Pre-torneo: cargar squads de los primeros 3 equipos clasificados
  const teamsData = await get(
    `${BASE}/teams?league=${WC_LEAGUE}&season=${WC_SEASON}`,
    { headers }
  )
  const teamIds = (teamsData.response || []).slice(0, 3).map(r => r.team.id)
  if (!teamIds.length) return []

  const pages = await Promise.all(
    teamIds.map(tid =>
      get(`${BASE}/players?team=${tid}&season=${WC_SEASON}&page=1`, { headers })
    )
  )
  const players = pages
    .flatMap(p => (p.response || []).map(normalizePlayer))
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i) // dedup
  return players
}

/**
 * Jugadores de un equipo específico (para filtrar por país).
 * En mock: filtra PLAYERS por nation.
 * @param {number|string} teamId — ID del equipo en API-Football, o nombre para mock
 */
export async function getPlayersByTeam(teamId) {
  if (isMock) {
    // En mock, teamId es el nombre del país
    if (!teamId || teamId === 'all') return PLAYERS
    return PLAYERS.filter(p =>
      p.nation.toLowerCase() === String(teamId).toLowerCase()
    )
  }

  const data = await get(
    `${BASE}/players?team=${teamId}&season=${WC_SEASON}`,
    { headers }
  )
  return (data.response || []).map(normalizePlayer)
}

// ─────────────────────────────────────────────────────
// JUGADORES — Roster completo por equipo
// Carga TODAS las páginas de un equipo de una vez para que
// los filtros (posición, búsqueda) funcionen sobre el plantel
// completo y no solo sobre los 20 de la página activa.
// Docs: /players?team=ID&season=2026&page=N
// ─────────────────────────────────────────────────────

/** Ordena por apellido (última palabra del nombre) */
const byLastName = (a, b) =>
  a.name.split(' ').pop().localeCompare(b.name.split(' ').pop())

/**
 * Todos los jugadores de un equipo, todas las páginas, ordenados por apellido.
 * @param {number|null} teamId – ID del equipo; null = todos (solo mock)
 * @returns {Array} array plano de jugadores normalizados
 */
export async function getAllTeamPlayers(teamId) {
  if (isMock) {
    let all = [...PLAYERS]
    if (teamId !== null && teamId !== undefined) {
      const team   = TEAMS.find(t => t.id === Number(teamId))
      const nation = team?.name ?? String(teamId)
      all = all.filter(p => p.nation?.toLowerCase() === nation.toLowerCase())
    }
    return all.sort(byLastName)
  }

  if (teamId === null || teamId === undefined) return []

  // Fetch page 1 to know total pages, then fetch the rest concurrently
  const first = await get(
    `${BASE}/players?team=${teamId}&season=${WC_SEASON}&page=1`,
    { headers },
  )
  const total = first.paging?.total ?? 1

  const restPages = total > 1
    ? await Promise.all(
        Array.from({ length: total - 1 }, (_, i) =>
          get(`${BASE}/players?team=${teamId}&season=${WC_SEASON}&page=${i + 2}`, { headers })
        )
      )
    : []

  return [first, ...restPages]
    .flatMap(p => (p.response || []).map(normalizePlayer))
    .sort(byLastName)
}

// ─────────────────────────────────────────────────────
// PREDICCIONES
// ─────────────────────────────────────────────────────

export async function getMatchPrediction(fixtureId) {
  if (isMock) return { home: 52, draw: 22, away: 26 }

  const data = await get(
    `${BASE}/predictions?fixture=${fixtureId}`,
    { headers }
  )
  const pred = data.response?.[0]?.predictions
  return {
    home:   parseInt(pred?.percent?.home  || '50'),
    draw:   parseInt(pred?.percent?.draw  || '20'),
    away:   parseInt(pred?.percent?.away  || '30'),
    winner: pred?.winner?.name || null,
  }
}

// ─────────────────────────────────────────────────────
// NORMALIZADORES
// ─────────────────────────────────────────────────────

function normalizeFixture(raw) {
  const f = raw.fixture
  const h = raw.teams?.home
  const a = raw.teams?.away
  const g = raw.goals

  return {
    id:      f.id,
    team1:   h?.name,
    flag1:   h?.logo,   // URL — en componentes, usa <img src={flag1} />
    team2:   a?.name,
    flag2:   a?.logo,
    score1:  g?.home ?? null,
    score2:  g?.away ?? null,
    status:  mapStatus(f.status?.short),
    time:    f.status?.elapsed ? `${f.status.elapsed}'` : formatKickoff(f.date),
    group:   raw.league?.round || '',
    venue:   f.venue?.name || '',
    stadium: f.venue?.city || '',
    date:    f.date,
  }
}

function formatKickoff(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-US', { hour: '2-digit', minute: '2-digit' })
}

function normalizeStats(response) {
  const find = (arr, label) =>
    arr?.statistics?.find(s => s.type === label)?.value ?? 0

  const h = response[0]
  const a = response[1]

  return {
    possession:    { home: find(h, 'Ball Possession'), away: find(a, 'Ball Possession') },
    shots:         { home: find(h, 'Total Shots'),     away: find(a, 'Total Shots') },
    shotsOnTarget: { home: find(h, 'Shots on Goal'),   away: find(a, 'Shots on Goal') },
    corners:       { home: find(h, 'Corner Kicks'),    away: find(a, 'Corner Kicks') },
    fouls:         { home: find(h, 'Fouls'),           away: find(a, 'Fouls') },
    yellowCards:   { home: find(h, 'Yellow Cards'),    away: find(a, 'Yellow Cards') },
    xg:            { home: find(h, 'expected_goals'),  away: find(a, 'expected_goals') },
  }
}

function normalizeStandings(response) {
  if (!response.length) return {}
  const standings = response[0]?.league?.standings || []
  const groups = {}
  standings.forEach(group => {
    const letter = group[0]?.group?.replace('Group ', '') || '?'
    groups[letter] = group.map(t => ({
      flag: t.team.logo,
      name: t.team.name,
      mp:   t.all.played,
      w:    t.all.win,
      d:    t.all.draw,
      l:    t.all.lose,
      gf:   t.all.goals.for,
      ga:   t.all.goals.against,
      pts:  t.points,
    }))
  })
  return groups
}

/** Maps API position strings → 2-letter code used by the position filter */
function apiPos(position) {
  switch ((position || '').toLowerCase()) {
    case 'goalkeeper': return 'GK'
    case 'defender':   return 'DF'
    case 'midfielder': return 'MF'
    default:           return 'FW'  // Attacker / Forward / Striker
  }
}

function normalizePlayer(raw) {
  const p  = raw.player
  const st = raw.statistics?.[0] || {}

  // The endpoint /players?team=NationalTeamID returns the national team as st.team.name
  // which equals the player's nationality. Don't show it as "club" — it's not their club.
  const teamName   = st.team?.name || ''
  const nationality = p.nationality || ''
  const club = teamName && teamName !== nationality ? teamName : ''

  return {
    id:        p.id,
    name:      p.name,
    photo:     p.photo,     // URL from API
    emoji:     '⭐',
    flag:      '',
    pos:       apiPos(st.games?.position),
    club,
    age:       p.age,
    nation:    nationality,
    goals:     st.goals?.total    || 0,
    assists:   st.goals?.assists  || 0,
    rating:    parseFloat(st.games?.rating || '0').toFixed(1),
    val:       '—',
    height:    p.height,
    weight:    p.weight,
    caps:      st.games?.appearences || 0,
    intlGoals: st.goals?.total || 0,
  }
}

// ─────────────────────────────────────────────────────
// MOCK DATA EXTRAS
// ─────────────────────────────────────────────────────

const MOCK_STATS = {
  possession:    { home: 55, away: 45 },
  shots:         { home: 14, away: 8  },
  shotsOnTarget: { home: 6,  away: 3  },
  corners:       { home: 7,  away: 3  },
  fouls:         { home: 10, away: 13 },
  yellowCards:   { home: 1,  away: 2  },
  xg:            { home: 1.8,away: 0.9 },
}

const MOCK_EVENTS = [
  { time: "12'",  type: 'Goal',  detail: 'Normal Goal',  team: 'Team 1', player: 'Jugador' },
  { time: "26'",  type: 'Card',  detail: 'Yellow Card',  team: 'Team 2', player: 'Jugador' },
  { time: "45+2'",type: 'HT',   detail: 'Half Time',    team: null,     player: null       },
  { time: "63'",  type: 'Goal',  detail: 'Header',       team: 'Team 1', player: 'Jugador' },
  { time: "71'",  type: 'subst', detail: 'Substitution', team: 'Team 2', player: 'Jugador' },
  { time: "78'",  type: 'Goal',  detail: 'Penalty',      team: 'Team 2', player: 'Jugador' },
]
