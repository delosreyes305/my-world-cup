import React, { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useApi } from '../hooks/useApi'
import { getTeams } from '../services/sportsService'
import { getMatchPredictionAI } from '../services/aiService'

// ─── Inline flag — handles both URL logos and emoji flags ──
function TeamFlag({ flag, name, size = 20 }) {
  if (!flag) return null
  if (typeof flag === 'string' && flag.startsWith('http')) {
    return (
      <img src={flag} alt={name || ''}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: 2, verticalAlign: 'middle', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{flag}</span>
}

function calcProbability(t1, t2) {
  const score = f => (f || []).reduce((a, v) => a + (v === 'W' ? 3 : v === 'D' ? 1 : 0), 0)
  const rankDiff = (t2.rank || 50) - (t1.rank || 50)
  const base = 45 + Math.min(15, rankDiff * 0.6) + (score(t1.form) - score(t2.form)) * 2
  const p1   = Math.min(75, Math.max(25, Math.round(base)))
  const draw = Math.round(12 + Math.random() * 8)
  return { p1, draw, p2: Math.max(5, 100 - p1 - draw) }
}

export default function AiPredict() {
  const { t, lang }  = useLang()
  const { state }    = useLocation()

  // Load all 48 WC teams from the API (cached 1 h)
  const { data: teamsRaw, loading: teamsLoad } = useApi(getTeams, { ttl: 3_600_000 })

  // Sort alphabetically for a clean dropdown
  const teams = useMemo(() =>
    teamsRaw ? [...teamsRaw].sort((a, b) => a.name.localeCompare(b.name)) : []
  , [teamsRaw])

  // Pre-select team 1 if navigated from a team profile
  const [t1Id, setT1] = useState(() => state?.preselect ? String(state.preselect) : '')
  const [t2Id, setT2] = useState('')
  const [loading, setL] = useState(false)
  const [result,  setR] = useState(null)
  const [error,   setE] = useState(null)

  const team1 = teams.find(t => t.id === Number(t1Id))
  const team2 = teams.find(t => t.id === Number(t2Id))
  const ok    = team1 && team2 && t1Id !== t2Id

  const run = async () => {
    if (!ok) return
    setL(true); setE(null); setR(null)
    const probs = calcProbability(team1, team2)
    try {
      const analysis = await getMatchPredictionAI(team1, team2)
      setR({ probs, analysis, team1, team2 })
    } catch (err) {
      const fb = `**${team1.name}** llegan como favoritos según el ranking FIFA (#${team1.rank || '—'}), con un plantel que incluye jugadores de élite global.\n\n**${team2.name}** (FIFA #${team2.rank || '—'}) mostrarán su variante táctica más compacta, buscando el contragolpe y el error rival.\n\n**Predicción: ${team1.name} 1–0 ${team2.name}** — Diferencia ajustada en un duelo táctico de alta intensidad.`
      setR({ probs, analysis: fb, team1, team2 })
      setE(lang === 'es' ? 'Análisis offline (API no disponible)' : 'Offline analysis (API unavailable)')
    } finally {
      setL(false)
    }
  }

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-16">
        <h1 className="section-title"><span>{t('predict', 'title')}</span></h1>
        <span className="badge badge-gold">Claude Sonnet</span>
      </div>

      {/* ── Team selector ── */}
      <div className="card mb-16">
        <div className="label mb-16">{t('predict', 'label')}</div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>

          {/* Team 1 */}
          <div style={{ flex: 1, minWidth: 150 }}>
            {team1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TeamFlag flag={team1.flag} name={team1.name} size={22} />
                <span className="fw-600" style={{ fontSize: 13, color: 'var(--text)' }}>{team1.name}</span>
                {team1.rank && (
                  <span className="caption" style={{ color: 'var(--text3)' }}>#{team1.rank}</span>
                )}
              </div>
            )}
            <select className="select-dark" style={{ width: '100%' }}
              value={t1Id} onChange={e => setT1(e.target.value)}
              aria-label={t('predict', 'team1')}
              disabled={teamsLoad}>
              <option value="">— {t('predict', 'team1')} —</option>
              {teams.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text3)', flexShrink: 0 }}>VS</div>

          {/* Team 2 */}
          <div style={{ flex: 1, minWidth: 150 }}>
            {team2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TeamFlag flag={team2.flag} name={team2.name} size={22} />
                <span className="fw-600" style={{ fontSize: 13, color: 'var(--text)' }}>{team2.name}</span>
                {team2.rank && (
                  <span className="caption" style={{ color: 'var(--text3)' }}>#{team2.rank}</span>
                )}
              </div>
            )}
            <select className="select-dark" style={{ width: '100%' }}
              value={t2Id} onChange={e => setT2(e.target.value)}
              aria-label={t('predict', 'team2')}
              disabled={teamsLoad}>
              <option value="">— {t('predict', 'team2')} —</option>
              {teams.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Same-team warning */}
        {t1Id && t2Id && t1Id === t2Id && (
          <p className="caption mb-8" style={{ color: 'var(--red)' }}>
            {lang === 'es' ? 'Selecciona dos equipos distintos.' : 'Select two different teams.'}
          </p>
        )}

        <button className="btn btn-gold btn-lg" onClick={run}
          disabled={!ok || loading || teamsLoad} aria-busy={loading}>
          {loading
            ? <><div className="ai-dots" aria-hidden="true"><span /><span /><span /></div> {lang === 'es' ? 'Analizando...' : 'Analyzing...'}</>
            : t('predict', 'generate')}
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="animate-fade">
          {error && (
            <p className="caption mb-8" style={{ color: 'var(--text3)', fontStyle: 'italic' }}>
              {error}
            </p>
          )}

          {/* Win probability bar */}
          <div className="card mb-16">
            <div className="label mb-12">{t('predict', 'win_prob')}</div>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ flex: result.probs.p1, background: 'var(--blue)' }} />
              <div style={{ flex: result.probs.draw, background: 'var(--text3)' }} />
              <div style={{ flex: result.probs.p2, background: 'var(--gold)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TeamFlag flag={result.team1.flag} name={result.team1.name} size={18} />
                {result.team1.name}
                <strong style={{ color: 'var(--gold)' }}>{result.probs.p1}%</strong>
              </span>
              <span style={{ color: 'var(--text3)' }}>
                {lang === 'es' ? 'Empate' : 'Draw'} {result.probs.draw}%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ color: 'var(--gold)' }}>{result.probs.p2}%</strong>
                {result.team2.name}
                <TeamFlag flag={result.team2.flag} name={result.team2.name} size={18} />
              </span>
            </div>

            <div className="divider" />
            <div className="label mb-12">{lang === 'es' ? 'Comparativa' : 'Comparison'}</div>
            <div className="grid-3">
              {[
                {
                  label: 'FIFA Rank',
                  v1: result.team1.rank ? `#${result.team1.rank}` : '—',
                  v2: result.team2.rank ? `#${result.team2.rank}` : '—',
                },
                {
                  label: lang === 'es' ? 'Forma' : 'Form',
                  v1: result.team1.form?.join(' ') || '—',
                  v2: result.team2.form?.join(' ') || '—',
                },
                {
                  label: lang === 'es' ? 'Títulos WC' : 'WC Titles',
                  v1: result.team1.titles || '—',
                  v2: result.team2.titles || '—',
                },
              ].map(s => (
                <div key={s.label} className="card-sm" style={{ textAlign: 'center' }}>
                  <div className="label">{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: 'var(--gold)' }}>{s.v1}</span>
                    <span style={{ color: 'var(--text3)', margin: '0 6px' }}>vs</span>
                    <span style={{ color: 'var(--gold)' }}>{s.v2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="card">
            <div className="flex-between mb-16">
              <h2 className="fw-600" style={{ fontSize: 15 }}>{t('predict', 'analysis')}</h2>
              <span className="badge badge-gold">Claude AI</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text2)', whiteSpace: 'pre-line' }}
              aria-live="polite"
              dangerouslySetInnerHTML={{
                __html: result.analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
