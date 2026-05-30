import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import { TEAM_ISO } from '../services/sportsService'
import './AccountPage.css'

// ── Formatea fecha ISO → "Mayo 2026" ────────────────────────────────
function formatDate(iso, lang) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'long', year: 'numeric',
    })
  } catch { return '—' }
}

// ── Imagen de bandera ────────────────────────────────────────────────
function TeamFlag({ name }) {
  const iso = TEAM_ISO[name]
  if (!iso) return <div className="account-fav-emoji"><i className="fa-solid fa-shield-halved" /></div>
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      className="account-fav-flag"
      onError={e => { e.target.style.display = 'none' }}
    />
  )
}

// ── Tabs de favoritos ────────────────────────────────────────────────
const FAV_TABS = ['teams', 'players', 'matches']

function FavTeams({ teams, navigate }) {
  if (!teams.length) return <EmptyFavs type="teams" />
  return (
    <div>
      {teams.map(team => (
        <button
          key={team.id}
          className="account-fav-item"
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          <TeamFlag name={team.name} />
          <div>
            <div className="account-fav-name">{team.name}</div>
            <div className="account-fav-sub">{team.confederation} · {team.titles > 0 ? `${team.titles}× 🏆` : '—'}</div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }} />
        </button>
      ))}
    </div>
  )
}

function FavPlayers({ players, navigate, t }) {
  if (!players.length) return <EmptyFavs type="players" />
  return (
    <div>
      {players.map(player => (
        <button
          key={player.id}
          className="account-fav-item"
          onClick={() => navigate(`/players/${player.id}`, { state: { player } })}
        >
          {player.photo
            ? <img src={player.photo} alt={player.name} className="account-fav-avatar" onError={e => { e.target.style.display = 'none' }} />
            : <div className="account-fav-emoji">{player.emoji || '⭐'}</div>
          }
          <div>
            <div className="account-fav-name">{player.name}</div>
            <div className="account-fav-sub">
              <span className="badge badge-blue" style={{ fontSize: 9, marginRight: 5 }}>{player.pos}</span>
              {player.nation} · {player.age} {t('player', 'yrs')}
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }} />
        </button>
      ))}
    </div>
  )
}

function FavMatches({ matches, navigate }) {
  if (!matches.length) return <EmptyFavs type="matches" />
  return (
    <div>
      {matches.map(match => (
        <button
          key={match.id}
          className="account-fav-item"
          onClick={() => navigate(`/matches/${match.id}`)}
        >
          <div className="account-fav-emoji">
            <i className="fa-solid fa-futbol" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <div className="account-fav-name">{match.team1} vs {match.team2}</div>
            <div className="account-fav-sub">{match.group} · {match.venue || match.stadium || '—'}</div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }} />
        </button>
      ))}
    </div>
  )
}

function EmptyFavs({ type }) {
  const icons = { teams: 'fa-shield-halved', players: 'fa-users', matches: 'fa-futbol' }
  return (
    <div className="account-favs-empty">
      <div className="account-favs-empty-icon">
        <i className={`fa-solid ${icons[type] || 'fa-heart'}`} />
      </div>
      <div className="account-favs-empty-title">No hay favoritos aquí aún</div>
      <div style={{ fontSize: 12 }}>Agrega tocando el botón ♥ en cualquier equipo, jugador o partido.</div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────
export default function AccountPage() {
  const { user, authLoading, logout } = useAuth()
  const { favorites }                 = useApp()
  const { lang, t }                   = useLang()
  const navigate                      = useNavigate()
  const [activeTab, setActiveTab]     = useState('teams')

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  if (authLoading || !user) return null

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
  const totalFavs = (favorites.teams?.length || 0) + (favorites.players?.length || 0) + (favorites.matches?.length || 0)

  const tabLabels = {
    teams:   lang === 'es' ? 'Equipos'   : 'Teams',
    players: lang === 'es' ? 'Jugadores' : 'Players',
    matches: lang === 'es' ? 'Partidos'  : 'Matches',
  }

  return (
    <div className="page-content page-enter">

      {/* ── Profile card ── */}
      <div className="account-profile-card">
        <div className="account-avatar" aria-hidden="true">{initials}</div>
        <div className="account-info">
          <div className="account-name">{user.first_name} {user.last_name}</div>
          <div className="account-email">{user.email}</div>
          <div className="account-since">
            <i className="fa-solid fa-calendar-days" aria-hidden="true" />
            {lang === 'es' ? 'Miembro desde' : 'Member since'} {formatDate(user.created_at, lang)}
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={logout}
          style={{ flexShrink: 0 }}
          aria-label="Log out"
        >
          <i className="fa-solid fa-arrow-right-from-bracket" />
          {lang === 'es' ? 'Salir' : 'Log Out'}
        </button>
      </div>

      {/* ── Estadísticas ── */}
      <div className="account-stats">
        <div className="account-stat-card">
          <div className="account-stat-val">{favorites.teams?.length || 0}</div>
          <div className="account-stat-lbl">{lang === 'es' ? 'Equipos' : 'Teams'}</div>
        </div>
        <div className="account-stat-card">
          <div className="account-stat-val">{favorites.players?.length || 0}</div>
          <div className="account-stat-lbl">{lang === 'es' ? 'Jugadores' : 'Players'}</div>
        </div>
        <div className="account-stat-card">
          <div className="account-stat-val">{favorites.matches?.length || 0}</div>
          <div className="account-stat-lbl">{lang === 'es' ? 'Partidos' : 'Matches'}</div>
        </div>
      </div>

      {/* ── Favoritos ── */}
      <div className="section-header mb-16">
        <h2 className="section-title">
          <span>
            <i className="fa-solid fa-heart" style={{ color: 'var(--gold)', marginRight: 8 }} aria-hidden="true" />
            {lang === 'es' ? 'Mis Favoritos' : 'My Favorites'}
          </span>
        </h2>
        {totalFavs > 0 && (
          <span className="badge">{totalFavs}</span>
        )}
      </div>

      {totalFavs === 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <EmptyFavs type="all" />
        </div>
      ) : (
        <>
          {/* Sub-tabs */}
          <div className="scroll-tabs mb-16" role="tablist">
            {FAV_TABS.map(tab => (
              <button
                key={tab}
                className={`scroll-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab" aria-selected={activeTab === tab}
              >
                {tabLabels[tab]}
                {favorites[tab]?.length > 0 && (
                  <span style={{
                    marginLeft: 6, fontSize: 10, background: 'rgba(240,180,41,0.15)',
                    color: 'var(--gold)', borderRadius: 10, padding: '1px 6px', fontWeight: 700,
                  }}>
                    {favorites[tab].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {activeTab === 'teams'   && <FavTeams   teams={favorites.teams || []}     navigate={navigate} />}
            {activeTab === 'players' && <FavPlayers players={favorites.players || []} navigate={navigate} t={t} />}
            {activeTab === 'matches' && <FavMatches matches={favorites.matches || []} navigate={navigate} />}
          </div>
        </>
      )}

    </div>
  )
}
