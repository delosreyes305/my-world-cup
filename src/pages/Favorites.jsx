import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LangContext'
import MatchCard from '../components/common/MatchCard'
import '../components/common/MatchCard.css'

export default function Favorites() {
  const { favorites, toggleFav } = useApp()
  const { t } = useLang()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('teams')

  // favorites now stores full objects — no secondary lookup against mock data needed
  const favTeams   = (favorites.teams   || []).filter(x => x?.id != null)
  const favPlayers = (favorites.players || []).filter(x => x?.id != null)
  const favMatches = (favorites.matches || []).filter(x => x?.id != null)

  const isEmpty = !favTeams.length && !favPlayers.length && !favMatches.length

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-24">
        <h1 className="section-title"> <span>{t('nav','favorites')}</span></h1>
        <div className="flex gap-8">
          <span className="badge badge-gold">{favTeams.length} {t('favorites','tab_teams')}</span>
          <span className="badge badge-blue">{favPlayers.length} {t('favorites','tab_players')}</span>
          <span className="badge badge-green">{favMatches.length} {t('favorites','tab_matches')}</span>
        </div>
      </div>

      {isEmpty ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💔</div>
          <h2 className="fw-600 mb-8" style={{ fontSize: 20 }}>{t('favorites','no_favs')}</h2>
          <p className="text-muted mb-24">{t('favorites','no_favs_sub')}</p>
          <div className="flex gap-8" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={() => navigate('/teams')}>{t('favorites','browse_teams')}</button>
            <button className="btn btn-outline" onClick={() => navigate('/players')}>{t('favorites','browse_players')}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="tabs" role="tablist" aria-label={t('nav','favorites')}>
            {['teams','players','matches'].map(tab => (
              <button
                key={tab}
                className={`tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab === 'teams'   && `${t('favorites','tab_teams')} (${favTeams.length})`}
                {tab === 'players' && `${t('favorites','tab_players')} (${favPlayers.length})`}
                {tab === 'matches' && `${t('favorites','tab_matches')} (${favMatches.length})`}
              </button>
            ))}
          </div>

          {/* Teams */}
          {activeTab === 'teams' && (
            favTeams.length === 0
              ? <p className="text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>{t('favorites','no_teams')}</p>
              : <div className="grid-4">
                  {favTeams.map(team => (
                    <div key={team.id} className="card card-clickable" style={{ textAlign: 'center' }} onClick={() => navigate(`/teams/${team.id}`, { state: { team } })}>
                      {team.flag && typeof team.flag === 'string' && team.flag.startsWith('http')
                        ? <img src={team.flag} alt={team.name} style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 8 }} onError={e => { e.target.style.display = 'none' }} />
                        : <div style={{ fontSize: 48, marginBottom: 8 }}>{team.flag || '🏳️'}</div>
                      }
                      <div className="fw-600 mb-4">{team.name}</div>
                      <div className="caption mb-12">{team.rank ? `FIFA #${team.rank}` : team.confederation || '—'}</div>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={e => { e.stopPropagation(); toggleFav('teams', team) }}
                      >
                        ♥ {t('favorites','remove')}
                      </button>
                    </div>
                  ))}
                </div>
          )}

          {/* Players */}
          {activeTab === 'players' && (
            favPlayers.length === 0
              ? <p className="text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>{t('favorites','no_players')}</p>
              : <div className="grid-2">
                  {favPlayers.map(player => (
                    <div key={player.id} className="card card-clickable flex gap-12" style={{ alignItems: 'flex-start' }} onClick={() => navigate(`/players/${player.id}`, { state: { player } })}>
                      {player.photo
                        ? <img src={player.photo} alt={player.name} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(240,180,41,0.2)', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                        : <div style={{ fontSize: 28, width: 50, height: 50, borderRadius: '50%', background: 'rgba(240,180,41,0.08)', border: '2px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>★</div>
                      }
                      <div style={{ flex: 1 }}>
                        <div className="fw-600 mb-4">{player.name} {player.flag}</div>
                        <div className="caption mb-8">{player.pos} · {player.club}</div>
                        <div className="flex gap-12">
                          <div className="pstat"><div className="pstat-val">{player.goals}</div><div className="pstat-lbl">{t('common','goals')}</div></div>
                          <div className="pstat"><div className="pstat-val">{player.assists}</div><div className="pstat-lbl">{t('common','assists')}</div></div>
                          <div className="pstat"><div className="pstat-val">{player.rating}</div><div className="pstat-lbl">{t('common','rating')}</div></div>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); toggleFav('players', player) }}>♥</button>
                    </div>
                  ))}
                </div>
          )}

          {/* Matches */}
          {activeTab === 'matches' && (
            favMatches.length === 0
              ? <p className="text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>{t('favorites','no_matches')}</p>
              : <div className="grid-2">
                  {favMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
          )}
        </>
      )}
    </div>
  )
}
