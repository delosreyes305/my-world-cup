import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useLang } from '../../context/LangContext'
import { TEAMS, PLAYERS, MATCHES } from '../../data/mockData'
import './SearchOverlay.css'

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useApp()
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  if (!searchOpen) return null

  const q = query.toLowerCase().trim()
  const teams   = q ? TEAMS.filter(t => t.name.toLowerCase().includes(q)) : []
  const players = q ? PLAYERS.filter(p => p.name.toLowerCase().includes(q)) : []
  const matches = q ? MATCHES.filter(m =>
    m.team1.toLowerCase().includes(q) || m.team2.toLowerCase().includes(q)
  ) : []

  const hasResults = teams.length || players.length || matches.length

  const go = (path) => { navigate(path); setSearchOpen(false) }

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={() => setSearchOpen(false)}
    >
      <div className="search-inner" onClick={e => e.stopPropagation()}>
        <div className="search-bar-wrap">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder={t('common', 'search_placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search"
          />
          <button className="search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
        </div>

        <div className="search-results">
          {!q && (
            <p className="search-hint">
              Start typing to search teams, players and matches...
            </p>
          )}

          {q && !hasResults && (
            <p className="search-no-results">No results for "{query}"</p>
          )}

          {teams.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Teams</div>
              {teams.map(team => (
                <button
                  key={team.id}
                  className="search-result-item"
                  onClick={() => go(`/teams/${team.id}`)}
                >
                  <span className="result-icon">{team.flag}</span>
                  <div>
                    <div className="result-name">{team.name}</div>
                    <div className="result-meta">FIFA #{team.rank} · {team.region}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {players.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Players</div>
              {players.map(player => (
                <button
                  key={player.id}
                  className="search-result-item"
                  onClick={() => go(`/players/${player.id}`)}
                >
                  <span className="result-icon">{player.emoji}</span>
                  <div>
                    <div className="result-name">{player.name}</div>
                    <div className="result-meta">{player.pos} · {player.nation} {player.flag}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matches.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Matches</div>
              {matches.map(match => (
                <button
                  key={match.id}
                  className="search-result-item"
                  onClick={() => go(`/matches/${match.id}`)}
                >
                  <span className="result-icon">⚽</span>
                  <div>
                    <div className="result-name">
                      {match.flag1} {match.team1} vs {match.team2} {match.flag2}
                    </div>
                    <div className="result-meta">{match.group} · {match.stadium}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
