import React, { useState, useEffect, useMemo } from 'react'
import { useApiPolling, useApi } from '../../hooks/useApi'
import { getLiveMatches, getAllFixtures, getMatchEvents } from '../../services/sportsService'
import { useLang } from '../../context/LangContext'

// Map raw event type/detail → short label (null = skip this event)
function eventLabel(e) {
  const type   = (e.type   || '').toLowerCase()
  const detail = (e.detail || '').toLowerCase()
  if (type === 'goal') {
    if (detail.includes('own'))     return 'OG'
    if (detail.includes('penalty')) return 'PEN'
    return 'GOAL'
  }
  if (type === 'card') {
    if (detail.includes('red'))    return 'RED CARD'
    if (detail.includes('yellow')) return 'YELLOW CARD'
    return null
  }
  if (type === 'subst') return 'SUB'
  if (type === 'var')   return 'VAR'
  return null
}

export default function LiveTicker() {
  const { lang } = useLang()

  // ── Live matches (poll every 30 s) ──────────────────
  const { data: liveMatches } = useApiPolling(getLiveMatches, 30_000)
  const hasLive = !!(liveMatches?.length)

  // ── All fixtures (upcoming fallback) ────────────────
  const { data: allFixtures } = useApi(getAllFixtures, { ttl: 1_800_000, skip: hasLive })

  // ── Events for each live match ───────────────────────
  const [eventItems, setEventItems] = useState([])

  useEffect(() => {
    if (!hasLive || !liveMatches?.length) {
      setEventItems([])
      return
    }

    let cancelled = false

    Promise.all(
      liveMatches.map(m =>
        getMatchEvents(m.id)
          .then(evts => ({ m, evts: evts || [] }))
          .catch(()  => ({ m, evts: [] }))
      )
    ).then(results => {
      if (cancelled) return

      const items = []
      results.forEach(({ m, evts }) => {
        const score = `${m.team1} ${m.score1 ?? 0}–${m.score2 ?? 0} ${m.team2}`

        // Filter to notable events only
        const notable = evts.filter(e => eventLabel(e))

        if (notable.length) {
          notable.forEach(e => {
            const label = eventLabel(e)
            const who   = [e.player, e.team ? `(${e.team})` : null, e.time].filter(Boolean).join(' ')
            items.push(`${label}  ${who}  —  ${score}`)
          })
        } else {
          // No events yet — show current score + elapsed
          const elapsed = m.time ? `${m.time}` : ''
          items.push(`${score}${elapsed ? `  ${elapsed}` : ''}`)
        }
      })

      setEventItems(items)
    })

    return () => { cancelled = true }
  }, [hasLive, liveMatches]) // re-runs every time liveMatches updates (every 30 s)

  // ── Build ticker content ─────────────────────────────
  const { text, isLive, label } = useMemo(() => {
    // LIVE mode
    if (hasLive) {
      const items = eventItems.length
        ? eventItems
        : (liveMatches || []).map(m =>
            `${m.team1} ${m.score1 ?? 0}–${m.score2 ?? 0} ${m.team2}  ${m.time ?? ''}`
          )
      return {
        text:   items.join('          '),
        isLive: true,
        label:  lang === 'es' ? 'EN VIVO' : 'LIVE',
      }
    }

    // UPCOMING mode — next 8 scheduled matches sorted by date
    const upcoming = (allFixtures || [])
      .filter(m => m.status === 'upcoming')
      .sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date) - new Date(b.date)
      })
      .slice(0, 8)

    if (!upcoming.length) return { text: '', isLive: false, label: '' }

    const items = upcoming.map(m => {
      const parts = [`${m.team1} vs ${m.team2}`]
      if (m.date) {
        const dateStr = new Date(m.date).toLocaleDateString(
          lang === 'es' ? 'es-MX' : 'en-US',
          { month: 'short', day: 'numeric' }
        )
        parts.push(dateStr)
      }
      if (m.time)    parts.push(m.time)
      if (m.stadium) parts.push(m.stadium)   // city
      if (m.venue)   parts.push(m.venue)     // stadium name
      return parts.join('  ·  ')
    })

    return {
      text:   items.join('          '),
      isLive: false,
      label:  lang === 'es' ? 'PRÓXIMOS' : 'UPCOMING',
    }
  }, [hasLive, eventItems, liveMatches, allFixtures, lang])

  if (!text) return null

  // Speed proportional to content length (~60 chars/sec feels natural)
  const duration = Math.max(18, Math.round(text.length / 6))

  return (
    <div
      className={`live-ticker${isLive ? '' : ' upcoming-ticker'}`}
      role="marquee"
      aria-label={isLive ? 'Live match updates' : 'Upcoming matches'}
    >
      <div className="ticker-label">
        {isLive && <span className="live-dot" aria-hidden="true" />}
        {label}
      </div>

      {/* Duplicate text for seamless CSS loop (translateX 0 → -50%) */}
      <div className="ticker-scroll" aria-hidden="true">
        <span
          className="ticker-text"
          style={{ animationDuration: `${duration}s` }}
        >
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </span>
      </div>
    </div>
  )
}
