import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useApi, useApiPolling } from '../hooks/useApi'
import { getLiveMatches, getStandings, getTopScorers, getTeams } from '../services/sportsService'
import { getNews } from '../services/newsService'
import { TEAMS, GROUPS } from '../data/mockData'
import MatchCard from '../components/common/MatchCard'
import ApiStatus from '../components/common/ApiStatus'
import '../components/common/MatchCard.css'
import './Home.css'

function Hero() {
  const { t } = useLang()
  return (
    <div className="hero" role="banner">
      <div className="hero-badge">
        <span className="live-dot" aria-hidden="true" />
        FIFA WORLD CUP 2026 — USA · CANADA · MEXICO
      </div>
      <h1 className="hero-title">MY WORLD CUP</h1>
      <p className="hero-subtitle">{t('home','hero_sub')}</p>
      <div className="hero-stats" role="list">
        {[
          { num:'48',  label:t('common','teams')    },
          { num:'104', label:t('common','matches')   },
          { num:'16',  label:t('common','venues')    },
          { num:'3',   label:t('common','countries') },
        ].map(({ num, label }) => (
          <div key={label} className="hero-stat" role="listitem">
            <div className="hero-stat-num">{num}</div>
            <div className="hero-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupTable({ group, groups, lang }) {
  const teams = (groups || GROUPS)[group]
  if (!teams) return null
  return (
    <table className="data-table" aria-label={`Group ${group} standings`}>
      <thead><tr>
        <th style={{ width:28 }}>#</th><th>{lang === 'es' ? 'Equipo' : 'Team'}</th>
        <th>MP</th><th>W</th><th>D</th><th>L</th><th>GD</th>
        <th className="text-gold">Pts</th>
      </tr></thead>
      <tbody>
        {teams.map((t, i) => {
          const gd = t.gf - t.ga
          return (
            <tr key={t.name}>
              <td><div className={`standing-pos${i<2?' qualify':''}`}>{i+1}</div></td>
              <td>
                {typeof t.flag === 'string' && t.flag.startsWith('http')
                  ? <img src={t.flag} alt="" style={{ width:20, marginRight:6, verticalAlign:'middle' }} />
                  : <span style={{ marginRight:6, fontSize:16 }}>{t.flag}</span>
                }
                {t.name}
              </td>
              <td>{t.mp}</td><td>{t.w}</td><td>{t.d}</td><td>{t.l}</td>
              <td className={gd>0?'text-green':gd<0?'text-red':'text-muted'}>{gd>0?'+':''}{gd}</td>
              <td className="text-gold fw-600">{t.pts}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function Home() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [activeGroup, setActiveGroup] = React.useState('A')

  const { data: liveMatches, loading: liveLoad } = useApiPolling(getLiveMatches, 30_000)
  const { data: standings  }                      = useApi(getStandings,   { ttl: 3_600_000 })
  const { data: allTeams   }                      = useApi(getTeams,       { ttl: 3_600_000 })
  const { data: headlines  }                      = useApi(getNews, 'all', 6, { ttl: 120_000 })
  const { data: scorers, loading: scorersLoad }   = useApi(getTopScorers,  { ttl: 3_600_000 })

  // Sort: rating first → goals as tiebreaker
  const topPlayers = useMemo(() => {
    if (!scorers) return []
    return [...scorers]
      .sort((a, b) =>
        (parseFloat(b.rating) - parseFloat(a.rating)) ||
        (b.goals - a.goals)
      )
      .slice(0, 4)
  }, [scorers])

  // FIFA ranking: top 5 by rank — use API data (has TEAM_METADATA ranks, no dupes),
  // fall back to fixed mock TEAMS only when API hasn't loaded yet
  const rankedTeams = useMemo(() =>
    [...(allTeams || TEAMS)]
      .filter(t => t.rank)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
  , [allTeams])

  const displayMatches = liveMatches?.length ? liveMatches.slice(0,4) : []

  return (
    <div className="page-content page-enter">
      <Hero />

      {/* Live matches */}
      <section className="mb-24">
        <div className="section-header">
          <h2 className="section-title"> <span>{t('home','live_today')}</span></h2>
          <button className="see-all" onClick={() => navigate('/matches')}>{t('common','see_all')} →</button>
        </div>
        {liveLoad ? (
          <div className="grid-2">
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:145, borderRadius:'var(--radius)' }} />)}
          </div>
        ) : displayMatches.length ? (
          <div className="grid-2">
            {displayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          <div className="card" style={{ textAlign:'center', padding:'32px', color:'var(--text3)' }}>
            {t('home','no_live')}{' '}
            <button className="see-all" onClick={() => navigate('/matches')}>{t('common','see_all')} →</button>
          </div>
        )}
      </section>

      {/* Groups + Ranking */}
      <section className="grid-2 mb-24">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header mb-16">
            <h2 className="section-title"> <span>{t('home','group_stage')}</span></h2>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <div className="scroll-tabs" role="tablist" style={{ marginBottom: 16 }}>
              {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
                <button key={g} className={`scroll-tab${activeGroup===g?' active':''}`}
                  onClick={() => setActiveGroup(g)} role="tab" aria-selected={activeGroup===g}
                  style={{ padding: '5px 12px', fontSize: 11 }}>
                  {g}
                </button>
              ))}
            </div>
            <GroupTable group={activeGroup} groups={standings} lang={lang} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header mb-16">
            <h2 className="section-title"><span>{t('home','ranking')}</span></h2>
          </div>
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
            {rankedTeams.map((team, i) => (
              <button key={team.id}
                className="card-clickable"
                onClick={() => navigate(`/teams/${team.id}`)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px',
                  background: i === 0 ? 'rgba(240,180,41,0.06)' : 'transparent',
                  borderLeft: i === 0 ? '3px solid var(--gold)' : '3px solid transparent',
                  borderBottom: i < rankedTeams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.2s',
                }}>

                {/* Rank number */}
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                  background: i === 0 ? 'var(--gold-grad)' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? 'var(--navy)' : 'var(--text3)',
                }}>
                  {team.rank}
                </div>

                {/* Flag */}
                <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {typeof team.flag === 'string' && team.flag.startsWith('http')
                    ? <img src={team.flag} alt={team.name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 3 }} onError={e => { e.target.style.display = 'none' }} />
                    : <span style={{ fontSize: 22 }}>{team.flag}</span>
                  }
                </div>

                {/* Name + confederation */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-600" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                    {team.name}
                  </div>
                  <div className="caption" style={{ fontSize: 10 }}>{team.confederation}</div>
                </div>

                {/* Points / titles */}
                {team.titles > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, flexShrink: 0 }}>
                    {team.titles}x WC
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Scorers leaderboard ── */}
      <section className="mb-24">
        <div className="section-header">
          <h2 className="section-title"><span>{t('home','top_players')}</span></h2>
          <button className="see-all" onClick={() => navigate('/players')}>{t('common','see_all')} →</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Loading skeleton */}
          {scorersLoad && topPlayers.length === 0 && (
            [1,2,3,4].map(i => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="skeleton" style={{ width:28, height:28, borderRadius:6, flexShrink:0 }} />
                <div className="skeleton" style={{ width:44, height:44, borderRadius:'50%', flexShrink:0 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                  <div className="skeleton" style={{ width:'55%', height:13, borderRadius:4 }} />
                  <div className="skeleton" style={{ width:'35%', height:10, borderRadius:4 }} />
                  <div className="skeleton" style={{ width:'80%', height:3, borderRadius:2 }} />
                </div>
                <div className="skeleton" style={{ width:60, height:32, borderRadius:6 }} />
              </div>
            ))
          )}

          {/* Player rows */}
          {topPlayers.map((p, i) => {
            const BG_COLORS   = ['rgba(240,180,41,0.06)', 'rgba(255,255,255,0.02)', 'transparent', 'transparent']
            const LEFT_BORDER = ['3px solid var(--gold)', '3px solid transparent', '3px solid transparent', '3px solid transparent']
            const maxGoals    = Math.max(topPlayers[0]?.goals || 0, 1)
            const goalPct     = Math.round(((p.goals || 0) / maxGoals) * 100)

            return (
              <button
                key={p.id}
                onClick={() => navigate(`/players/${p.id}`, { state: { player: p } })}
                aria-label={`#${i + 1} ${p.name}`}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  background: BG_COLORS[i],
                  borderLeft: LEFT_BORDER[i],
                  borderBottom: i < topPlayers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.2s',
                }}
              >
                {/* Rank number badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                  background: i === 0 ? 'var(--gold-grad)' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? 'var(--navy)' : 'var(--text3)',
                }}>
                  {i + 1}
                </div>

                {/* Photo */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(240,180,41,0.08)',
                  border: `2px solid ${i === 0 ? 'rgba(240,180,41,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', fontSize: 22,
                }}>
                  {p.photo
                    ? <img src={p.photo} alt={p.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { e.target.style.display = 'none' }} />
                    : (p.emoji || '★')
                  }
                </div>

                {/* Name + subtitle + goal bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span className="fw-600" style={{ fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--text)' }}>
                      {p.name}
                    </span>
                    {p.flag && <span style={{ opacity:0.5, fontSize:12, flexShrink:0 }}>{p.flag}</span>}
                  </div>
                  <div className="caption" style={{ fontSize:10, marginBottom:7 }}>
                    {[p.pos, p.club || p.nation].filter(Boolean).join(' · ')}
                  </div>
                  {/* Goals bar */}
                  <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2 }}>
                    <div style={{
                      width: `${goalPct || 3}%`, height:'100%', borderRadius:2,
                      background: i === 0 ? 'var(--gold-grad)' : 'rgba(240,180,41,0.3)',
                      transition: 'width 0.9s ease',
                    }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display:'flex', gap:14, flexShrink:0, textAlign:'center' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize: i === 0 ? 24 : 18, color:'var(--gold)', lineHeight:1 }}>
                      {p.goals ?? 0}
                    </div>
                    <div className="caption" style={{ fontSize:9 }}>{t('common','goals_abbr')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>{p.assists ?? 0}</div>
                    <div className="caption" style={{ fontSize:9 }}>{t('common','assists_abbr')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--electric)' }}>{p.rating}</div>
                    <div className="caption" style={{ fontSize:9 }}>{t('common','rating_abbr')}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* News */}
      <section>
        <div className="section-header">
          <h2 className="section-title"> <span>{t('home','latest_news')}</span></h2>
          <button className="see-all" onClick={() => navigate('/news')}>{t('common','see_all')} →</button>
        </div>
        <div className="grid-3">
          {(headlines || []).slice(0, 6).map((n, i) => (
            <article key={n.id || i} className="news-card card card-clickable"
              onClick={() => n.url && window.open(n.url, '_blank', 'noopener')}>
              <div className="news-img"
                style={n.image ? {} : { background: `linear-gradient(135deg,${n.color}22,${n.color}08)` }}>
                {n.image
                  ? <img src={n.image} alt={n.title}
                      onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = `linear-gradient(135deg,${n.color}22,${n.color}08)`; e.target.parentNode.innerHTML += n.emoji }}
                    />
                  : n.emoji
                }
              </div>
              <div className="news-body">
                <div className="news-cat" style={{ color: n.color }}>{n.cat}</div>
                <h3 className="news-title">{n.title}</h3>
                <div className="caption">{n.time}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
