import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { PLAYERS, TEAMS } from '../data/mockData'
import { useApp } from '../context/AppContext'

function StatBar({ label, value, max }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="stat-bar">
      <div className="stat-bar-header">
        <span>{label}</span>
        <span className="text-gold">{pct.toFixed(0)}%</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function PlayerDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { state }    = useLocation()
  const { toggleFav, isFav } = useApp()

  // API players are passed via navigation state; mock players fall back to PLAYERS array
  const player = state?.player ?? PLAYERS.find(p => p.id === Number(id))

  if (!player) return (
    <div className="page-content" style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h2>Player not found</h2>
      <button className="btn btn-outline mt-16" onClick={() => navigate('/players')}>← Back</button>
    </div>
  )

  const posColor = { FW: 'var(--red)', MF: 'var(--blue)', DF: 'var(--green)', GK: 'var(--gold)' }
  const team = TEAMS.find(t => t.name === player.nation)

  return (
    <div className="page-content page-enter">
      <button className="btn btn-ghost btn-sm mb-24" onClick={() => navigate('/players')}>← Back</button>

      {/* Header */}
      <div className="card mb-16">
        <div className="flex-center gap-24" style={{ flexWrap: 'wrap' }}>
          {player.photo ? (
            <img src={player.photo} alt={player.name}
              style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(240,180,41,0.2)', flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <div style={{ fontSize: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(240,180,41,0.08)', border: '2px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
              {player.emoji || '⭐'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div className="flex-center gap-12 mb-8" style={{ flexWrap: 'wrap' }}>
              <h1 className="fw-600" style={{ fontSize: 26 }}>{player.name}</h1>
              <span style={{ fontSize: 24 }} aria-label={player.nation}>{player.flag}</span>
              <span className="badge" style={{ background: `${posColor[player.pos]}22`, color: posColor[player.pos], border: `1px solid ${posColor[player.pos]}44` }}>
                {player.pos}
              </span>
            </div>
            <div className="caption" style={{ marginBottom: 12 }}>
              {[player.club, player.nation, `Age ${player.age}`].filter(Boolean).join(' · ')}
            </div>
            <div className="flex gap-8 flex-wrap">
              <button
                className={`btn btn-sm ${isFav('players', player.id) ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => toggleFav('players', player)}
              >
                {isFav('players', player.id) ? '♥ Favorited' : '♡ Add to Favorites'}
              </button>
              {team && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  View {team.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tournament stats */}
      <div className="grid-4 mb-16">
        {[
          { label: 'Goals',     val: player.goals },
          { label: 'Assists',   val: player.assists },
          { label: 'Rating',    val: player.rating },
          { label: 'Market Val',val: player.val },
        ].map(s => (
          <div key={s.label} className="card-sm" style={{ textAlign: 'center' }}>
            <div className="label">{s.label}</div>
            <div className="val text-gold">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-16">
        {/* Personal info */}
        <div className="card">
          <h2 className="fw-600 mb-16" style={{ fontSize: 15 }}>ℹ️ Player Info</h2>
          {[
            { label: 'Nationality', val: `${player.nation} ${player.flag}` },
            { label: 'Club',        val: player.club || '—' },
            { label: 'Position',    val: player.pos },
            { label: 'Age',         val: player.age },
            { label: 'Height',      val: player.height },
            { label: 'Weight',      val: player.weight },
            { label: 'Int\'l Caps', val: player.caps },
            { label: 'Int\'l Goals',val: player.intlGoals },
          ].map(({ label, val }) => (
            <div key={label} className="flex-between" style={{ marginBottom: 10 }}>
              <span className="label" style={{ marginBottom: 0 }}>{label}</span>
              <span className="fw-600">{val}</span>
            </div>
          ))}
        </div>

        {/* Performance bars */}
        <div className="card">
          <h2 className="fw-600 mb-16" style={{ fontSize: 15 }}>📈 Performance</h2>
          <StatBar label="Scoring" value={player.goals} max={10} />
          <StatBar label="Creativity" value={player.assists} max={8} />
          <StatBar label="Overall Rating" value={player.rating} max={10} />
          <StatBar label="Int'l Goals"  value={player.intlGoals} max={120} />

          <div className="divider" />
          <div className="label mb-8">Market Value</div>
          <div className="val text-gold">{player.val}</div>
        </div>
      </div>
    </div>
  )
}
