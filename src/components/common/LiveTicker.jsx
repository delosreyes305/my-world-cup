import React from 'react'

const TICKER_EVENTS = [
  "⚽ ARG 2-1 FRA — 73'",
  "🟨 Yellow: Mbappé (FRA) 71'",
  "⚽ GER 0-1 ESP — 62'",
  "🔄 Sub: Vinicius Jr → Rodrygo (BRA) 65'",
  "🇲🇦 MOR 1-0 POR — 44'",
  "✅ JPN 3-2 BEL — FT",
  "⏰ BRA vs NED kicks off at 18:00",
  "🔴 VAR Review underway: ARG vs FRA",
]

export default function LiveTicker() {
  return (
    <div className="live-ticker" role="marquee" aria-label="Live match updates">
      <div className="ticker-label">
        <span className="live-dot" aria-hidden="true" />
        LIVE
      </div>
      <div className="ticker-scroll" aria-hidden="true">
        <span className="ticker-text">
          {TICKER_EVENTS.join('   ·   ')}
        </span>
      </div>
    </div>
  )
}
