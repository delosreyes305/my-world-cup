import React, { useMemo, useState, useEffect } from 'react'
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

// ── WC 2026 inaugural match ──────────────────────────
// Mexico 🇲🇽 vs Ecuador 🇪🇨 · Estadio Azteca · Jun 11 2026 22:00 UTC
const INAUGURAL_DATE = new Date('2026-06-11T22:00:00Z')
const INAUGURAL = {
  team1: 'Mexico', flag1: '🇲🇽',
  team2: 'Ecuador', flag2: '🇪🇨',
  venue: 'Estadio Azteca, Mexico City',
}

// ── Countdown hook ───────────────────────────────────
function useCountdown(target) {
  const calc = () => Math.max(0, target.getTime() - Date.now())
  const [ms, setMs] = useState(calc)
  useEffect(() => {
    if (ms <= 0) return
    const id = setInterval(() => setMs(calc), 1000)
    return () => clearInterval(id)
  })
  const days    = Math.floor(ms / 86400000)
  const hours   = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000)  / 60000)
  const seconds = Math.floor((ms % 60000)    / 1000)
  return { days, hours, minutes, seconds, expired: ms <= 0 }
}

// ── Countdown card ───────────────────────────────────
function InauguralCountdown({ lang }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(INAUGURAL_DATE)
  if (expired) return null

  const units = lang === 'es'
    ? [{ v: days, l: 'Días' }, { v: hours, l: 'Horas' }, { v: minutes, l: 'Min' }, { v: seconds, l: 'Seg' }]
    : [{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: minutes, l: 'Min' }, { v: seconds, l: 'Sec' }]

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(240,180,41,.08), rgba(240,180,41,.02))',
      border: '1px solid rgba(240,180,41,.2)',
      textAlign: 'center', padding: '24px 20px',
    }}>
      {/* Label */}
      <div className="caption mb-8" style={{ color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 10 }}>
        {lang === 'es' ? 'Partido Inaugural · FIFA World Cup 2026' : 'Opening Match · FIFA World Cup 2026'}
      </div>

      {/* Teams */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 36 }}>{INAUGURAL.flag1}</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{INAUGURAL.team1}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text3)' }}>VS</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 36 }}>{INAUGURAL.flag2}</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{INAUGURAL.team2}</span>
        </div>
      </div>

      {/* Countdown units */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        {units.map(({ v, l }) => (
          <div key={l} style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '10px 14px', minWidth: 52,
            border: '1px solid rgba(240,180,41,.15)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1, color: 'var(--gold)' }}>
              {String(v).padStart(2, '0')}
            </div>
            <div className="caption" style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      <div className="caption" style={{ color: 'var(--text3)', fontSize: 11 }}>
        {INAUGURAL.venue}
      </div>
    </div>
  )
}

// ── Hero ─────────────────────────────────────────────
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

// ── Group standings table ─────────────────────────────
function GroupTable({ group, groups, lang }) {
  const teams = (groups || GROUPS)[group]
  if (!teams) return null
  return (
    <div className="table-scroll-wrap">
      <table className="data-table" aria-label={`Group ${group} standings`} style={{ minWidth: 280 }}>
        <thead><tr>
          <th style={{ width: 26 }}>#</th>
          <th>{lang === 'es' ? 'Equipo' : 'Team'}</th>
          <th>MP</th>
          <th className="col-hide-xs">W</th>
          <th className="col-hide-xs">D</th>
          <th className="col-hide-xs">L</th>
          <th>GD</th>
          <th className="text-gold">Pts</th>
        </tr></thead>
        <tbody>
          {teams.map((t, i) => {
            const gd = t.gf - t.ga
            return (
              <tr key={t.name}>
                <td><div className={`standing-pos${i < 2 ? ' qualify' : ''}`}>{i + 1}</div></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {typeof t.flag === 'string' && t.flag.startsWith('http')
                    ? <img src={t.flag} alt="" style={{ width: 18, marginRight: 5, verticalAlign: 'middle' }} />
                    : <span style={{ marginRight: 5, fontSize: 14 }}>{t.flag}</span>
                  }
                  {t.name}
                </td>
                <td>{t.mp}</td>
                <td className="col-hide-xs">{t.w}</td>
                <td className="col-hide-xs">{t.d}</td>
                <td className="col-hide-xs">{t.l}</td>
                <td className={gd > 0 ? 'text-green' : gd < 0 ? 'text-red' : 'text-muted'}>{gd > 0 ? '+' : ''}{gd}</td>
                <td className="text-gold fw-600">{t.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ────────────────────────────────────
export default function Home() {
  const { t, lang } = useLang()
  const navigate = useNavigate()
  const [activeGroup, setActiveGroup] = React.useState('A')

  const { data: liveMatches, loading: liveLoad } = useApiPolling(getLiveMatches, 30_000)
  const { data: standings  }                      = useApi(getStandings,   { ttl: 3_600_000 })
  const { data: allTeams   }                      = useApi(getTeams,       { ttl: 3_600_000 })
  const { data: headlines  }                      = useApi(getNews, 'all', 6, { ttl: 120_000 })
  const { data: scorers, loading: scorersLoad }   = useApi(getTopScorers,  { ttl: 3_600_000 })

  const topPlayers = useMemo(() => {
    if (!scorers) return []
    return [...scorers]
      .sort((a, b) => (parseFloat(b.rating) - parseFloat(a.rating)) || (b.goals - a.goals))
      .slice(0, 4)
  }, [scorers])

  const rankedTeams = useMemo(() =>
    [...(allTeams || TEAMS)]
      .filter(t => t.rank)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
  , [allTeams])

  const displayMatches = liveMatches?.length ? liveMatches.slice(0, 4) : []

  return (
    <div className="page-content page-enter">
      <Hero />

      {/* ── Live & Upcoming matches ── */}
      <section className="mb-24">
        <div className="section-header">
          <h2 className="section-title"> <span>{t('home','live_today')}</span></h2>
          <button className="see-all" onClick={() => navigate('/matches')}>{t('common','see_all')} →</button>
        </div>

        {liveLoad ? (
          <div className="grid-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 145, borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : displayMatches.length ? (
          <div className="grid-2">
            {displayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Countdown to inaugural match */}
            <InauguralCountdown lang={lang} />
            <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>
              {t('home','no_live')}{' '}
              <button className="see-all" onClick={() => navigate('/matches')}>{t('common','see_all')} →</button>
            </div>
          </div>
        )}
      </section>

      {/* ── Groups + Ranking ── */}
      <section className="grid-2 mb-24">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="section-header mb-16">
            <h2 className="section-title"> <span>{t('home','group_stage')}</span></h2>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 0 }}>
            <div className="scroll-tabs" role="tablist" style={{ marginBottom: 14 }}>
              {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
                <button key={g}
                  className={`scroll-tab${activeGroup === g ? ' active' : ''}`}
                  onClick={() => setActiveGroup(g)}
                  role="tab" aria-selected={activeGroup === g}
                  style={{ padding: '5px 10px', fontSize: 11 }}>
                  {g}
                </button>
              ))}
            </div>
            <GroupTable group={activeGroup} groups={standings} lang={lang} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="section-header mb-16">
            <h2 className="section-title"><span>{t('home','ranking')}</span></h2>
          </div>
          <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', minWidth: 0 }}>
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
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                  background: i === 0 ? 'var(--gold-grad)' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? 'var(--navy)' : 'var(--text3)',
                }}>
                  {team.rank}
                </div>
                <div style={{ width: 28, height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {typeof team.flag === 'string' && team.flag.startsWith('http')
                    ? <img src={team.flag} alt={team.name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 3 }} onError={e => { e.target.style.display = 'none' }} />
                    : <span style={{ fontSize: 22 }}>{team.flag}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-600" style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                    {team.name}
                  </div>
                  <div className="caption" style={{ fontSize: 10 }}>{team.confederation}</div>
                </div>
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

      {/* ── Top Scorers ── */}
      <section className="mb-24">
        <div className="section-header">
          <h2 className="section-title"><span>{t('home','top_players')}</span></h2>
          <button className="see-all" onClick={() => navigate('/players')}>{t('common','see_all')} →</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
          {topPlayers.map((p, i) => {
            const BG   = ['rgba(240,180,41,0.06)', 'rgba(255,255,255,0.02)', 'transparent', 'transparent']
            const BDR  = ['3px solid var(--gold)', '3px solid transparent', '3px solid transparent', '3px solid transparent']
            const maxG = Math.max(topPlayers[0]?.goals || 0, 1)
            const pct  = Math.round(((p.goals || 0) / maxG) * 100)
            return (
              <button key={p.id}
                onClick={() => navigate(`/players/${p.id}`, { state: { player: p } })}
                aria-label={`#${i+1} ${p.name}`}
                style={{
                  width:'100%', textAlign:'left', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                  background: BG[i], borderLeft: BDR[i],
                  borderBottom: i < topPlayers.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition:'background 0.2s',
                }}>
                <div style={{
                  width:28, height:28, borderRadius:6, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-display)', fontSize:14, fontWeight:700,
                  background: i===0 ? 'var(--gold-grad)' : 'rgba(255,255,255,0.06)',
                  color: i===0 ? 'var(--navy)' : 'var(--text3)',
                }}>{i+1}</div>
                <div style={{
                  width:44, height:44, borderRadius:'50%', flexShrink:0,
                  background:'rgba(240,180,41,0.08)',
                  border:`2px solid ${i===0?'rgba(240,180,41,0.4)':'rgba(255,255,255,0.1)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  overflow:'hidden', fontSize:22,
                }}>
                  {p.photo
                    ? <img src={p.photo} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{e.target.style.display='none'}} />
                    : (p.emoji || '★')}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span className="fw-600" style={{ fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--text)' }}>{p.name}</span>
                    {p.flag && <span style={{ opacity:0.5, fontSize:12, flexShrink:0 }}>{p.flag}</span>}
                  </div>
                  <div className="caption" style={{ fontSize:10, marginBottom:7 }}>
                    {[p.pos, p.club || p.nation].filter(Boolean).join(' · ')}
                  </div>
                  <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2 }}>
                    <div style={{
                      width:`${pct||3}%`, height:'100%', borderRadius:2,
                      background: i===0 ? 'var(--gold-grad)' : 'rgba(240,180,41,0.3)',
                      transition:'width 0.9s ease',
                    }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:14, flexShrink:0, textAlign:'center' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:i===0?24:18, color:'var(--gold)', lineHeight:1 }}>{p.goals??0}</div>
                    <div className="caption" style={{ fontSize:9 }}>{t('common','goals_abbr')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)' }}>{p.assists??0}</div>
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

      {/* ── News ── */}
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
                style={n.image ? {} : { background:`linear-gradient(135deg,${n.color}22,${n.color}08)` }}>
                {n.image
                  ? <img src={n.image} alt={n.title}
                      onError={e => { e.target.style.display='none'; e.target.parentNode.style.background=`linear-gradient(135deg,${n.color}22,${n.color}08)`; e.target.parentNode.innerHTML+=n.emoji }} />
                  : n.emoji
                }
              </div>
              <div className="news-body">
                <div className="news-cat" style={{ color:n.color }}>{n.cat}</div>
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
