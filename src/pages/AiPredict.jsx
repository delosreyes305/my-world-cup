import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useApi } from '../hooks/useApi'
import { getTeams } from '../services/sportsService'
import { getMatchPredictionAI } from '../services/aiService'

// ── Inline flag renderer ─────────────────────────────────
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
  return <span style={{ fontSize: size * 0.9, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{flag}</span>
}

// ── Typewriter hook ──────────────────────────────────────
function useTypewriter(text, speed = 16) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!text) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return displayed
}

// ── Probability calculation ──────────────────────────────
function buildProbs(team1, team2, aiWinner, aiConfidence) {
  if (aiWinner && aiConfidence) {
    const t1wins = team1.name.toLowerCase().includes(aiWinner.toLowerCase()) ||
                   aiWinner.toLowerCase().includes(team1.name.toLowerCase().split(' ')[0])
    const conf = Math.min(80, Math.max(35, Number(aiConfidence) || 60))
    const draw = Math.round(10 + Math.random() * 8)
    if (t1wins) return { p1: conf, draw, p2: Math.max(5, 100 - conf - draw) }
    return { p1: Math.max(5, 100 - conf - draw), draw, p2: conf }
  }
  // Fallback based on FIFA rank
  const rankDiff = (team2.rank || 50) - (team1.rank || 50)
  const formScore = f => (f || []).reduce((a, v) => a + (v === 'W' ? 3 : v === 'D' ? 1 : 0), 0)
  const base = 45 + Math.min(15, rankDiff * 0.6) + (formScore(team1.form) - formScore(team2.form)) * 2
  const p1   = Math.min(75, Math.max(25, Math.round(base)))
  const draw = Math.round(12 + Math.random() * 8)
  return { p1, draw, p2: Math.max(5, 100 - p1 - draw) }
}

// ── Extract just "2-1" from "Brazil 2-1 France" ─────────
function parseNumericScore(score) {
  return score?.match(/\d+\s*[-–—]\s*\d+/)?.[0]?.replace(/\s+/g, '') || score || '?-?'
}

export default function AiPredict() {
  const { t, lang } = useLang()
  const { state }   = useLocation()

  const { data: teamsRaw, loading: teamsLoad } = useApi(getTeams, { ttl: 3_600_000 })
  const teams = useMemo(() =>
    teamsRaw ? [...teamsRaw].sort((a, b) => a.name.localeCompare(b.name)) : []
  , [teamsRaw])

  const [t1Id,    setT1]    = useState(() => state?.preselect ? String(state.preselect) : '')
  const [t2Id,    setT2]    = useState('')
  const [loading, setL]     = useState(false)
  const [result,  setR]     = useState(null)
  const [copied,  setCopied] = useState(false)

  const team1 = teams.find(t => t.id === Number(t1Id))
  const team2 = teams.find(t => t.id === Number(t2Id))
  const ready = team1 && team2 && t1Id !== t2Id

  // Typewriter only on the analysis text
  const analysisTyped = useTypewriter(result?.analysis || '', 16)
  const isTyping = result && analysisTyped.length < (result.analysis?.length || 0)

  // ── Generate prediction ──────────────────────────────
  const run = useCallback(async () => {
    if (!ready) return
    setL(true); setR(null)
    try {
      const prediction = await getMatchPredictionAI(team1, team2, lang)
      const probs = buildProbs(team1, team2, prediction.winner, prediction.confidence)
      setR({ ...prediction, probs, team1, team2 })
    } catch (err) {
      console.error('[AiPredict] run error:', err)
    } finally {
      setL(false)
    }
  }, [ready, team1, team2, lang])

  // ── Copy to clipboard ────────────────────────────────
  const copy = () => {
    if (!result) return
    const lines = [
      `⚽ ${result.team1.name} vs ${result.team2.name}`,
      `📊 ${t('predict', 'predicted_score')}: ${result.score}`,
      result.winner ? `🏆 ${t('predict', 'winner')}: ${result.winner} (${result.confidence}% ${t('predict', 'confidence')})` : '',
      '',
      result.tactics ? `🎯 ${t('predict', 'tactics')}: ${result.tactics}` : '',
      '',
      `🔮 ${t('predict', 'analysis')}: ${result.analysis}`,
    ].filter(l => l !== undefined).join('\n')
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="page-content page-enter">

      {/* ─── Header ─── */}
      <div className="section-header mb-16">
        <h1 className="section-title"><span>{t('predict', 'title')}</span></h1>
        <span className="badge badge-gold">Claude AI</span>
      </div>

      {/* ─── Team Selector ─── */}
      <div className="card mb-16">
        <div className="label mb-16">{t('predict', 'label')}</div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>

          {/* Team 1 */}
          <div style={{ flex: 1, minWidth: 150 }}>
            {team1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TeamFlag flag={team1.flag} name={team1.name} size={22} />
                <span className="fw-600" style={{ fontSize: 13 }}>{team1.name}</span>
                {team1.rank && <span className="caption" style={{ color: 'var(--text3)' }}>#{team1.rank}</span>}
              </div>
            )}
            <select className="select-dark" style={{ width: '100%' }}
              value={t1Id} onChange={e => { setT1(e.target.value); setR(null) }}
              aria-label={t('predict', 'team1')} disabled={teamsLoad}>
              <option value="">— {t('predict', 'team1')} —</option>
              {teams.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text3)',
            flexShrink: 0, paddingTop: team1 || team2 ? 28 : 8
          }}>VS</div>

          {/* Team 2 */}
          <div style={{ flex: 1, minWidth: 150 }}>
            {team2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TeamFlag flag={team2.flag} name={team2.name} size={22} />
                <span className="fw-600" style={{ fontSize: 13 }}>{team2.name}</span>
                {team2.rank && <span className="caption" style={{ color: 'var(--text3)' }}>#{team2.rank}</span>}
              </div>
            )}
            <select className="select-dark" style={{ width: '100%' }}
              value={t2Id} onChange={e => { setT2(e.target.value); setR(null) }}
              aria-label={t('predict', 'team2')} disabled={teamsLoad}>
              <option value="">— {t('predict', 'team2')} —</option>
              {teams.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
          </div>
        </div>

        {t1Id && t2Id && t1Id === t2Id && (
          <p className="caption mb-12" style={{ color: 'var(--red)' }}>
            {t('predict', 'same_team')}
          </p>
        )}

        <button className="btn btn-gold btn-lg" onClick={run}
          disabled={!ready || loading || teamsLoad} aria-busy={loading}>
          {loading
            ? <><div className="ai-dots" aria-hidden="true"><span /><span /><span /></div>&nbsp;{t('predict', 'analyzing')}</>
            : t('predict', 'generate')}
        </button>
      </div>

      {/* ─── Loading skeleton ─── */}
      {loading && (
        <div className="card mb-16" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div className="ai-dots" aria-hidden="true"
            style={{ justifyContent: 'center', display: 'flex', gap: 6, marginBottom: 16 }}>
            <span /><span /><span />
          </div>
          <p className="text-muted" style={{ fontSize: 14 }}>
            {lang === 'es'
              ? 'Claude está analizando el partido...'
              : 'Claude is analyzing the match...'}
          </p>
        </div>
      )}

      {/* ─── Result ─── */}
      {result && !loading && (
        <div className="animate-fade">

          {/* ── Score Banner ── */}
          <div className="card mb-16" style={{
            background: 'linear-gradient(135deg, rgba(240,180,41,.1), rgba(240,180,41,.03))',
            border: '1px solid rgba(240,180,41,.25)',
            padding: '28px 24px',
            textAlign: 'center',
          }}>
            <div className="caption mb-16" style={{
              color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 11
            }}>
              {t('predict', 'predicted_score')}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
              {/* Team 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                <TeamFlag flag={result.team1.flag} name={result.team1.name} size={44} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{result.team1.name}</span>
              </div>

              {/* Scoreline */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800,
                color: 'var(--gold)', letterSpacing: 4, lineHeight: 1, flexShrink: 0,
              }}>
                {parseNumericScore(result.score)}
              </div>

              {/* Team 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                <TeamFlag flag={result.team2.flag} name={result.team2.name} size={44} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{result.team2.name}</span>
              </div>
            </div>

            {/* Winner + confidence badges */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {result.winner && (
                <span className="badge badge-gold" style={{ fontSize: 13 }}>
                  🏆 {t('predict', 'winner')}: {result.winner}
                </span>
              )}
              {result.confidence != null && (
                <span className="badge badge-green" style={{ fontSize: 13 }}>
                  {result.confidence}% {t('predict', 'confidence')}
                </span>
              )}
            </div>
          </div>

          {/* ── Win Probability ── */}
          <div className="card mb-16">
            <div className="label mb-12">{t('predict', 'win_prob')}</div>

            {/* Segmented bar */}
            <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ flex: result.probs.p1, background: 'var(--blue)', transition: 'flex 1s ease' }} />
              <div style={{ flex: result.probs.draw, background: 'var(--text3)' }} />
              <div style={{ flex: result.probs.p2, background: 'var(--gold)', transition: 'flex 1s ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', flexShrink: 0 }} />
                {result.team1.name}&nbsp;<strong style={{ color: 'var(--gold)' }}>{result.probs.p1}%</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block', flexShrink: 0 }} />
                {t('predict', 'draw')} {result.probs.draw}%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', flexShrink: 0 }} />
                {result.team2.name}&nbsp;<strong style={{ color: 'var(--gold)' }}>{result.probs.p2}%</strong>
              </span>
            </div>

            {/* Comparison stats */}
            <div className="divider" />
            <div className="label mb-10">{t('predict', 'comparison')}</div>
            <div className="grid-3">
              {[
                { label: 'FIFA Rank', v1: result.team1.rank ? `#${result.team1.rank}` : '—', v2: result.team2.rank ? `#${result.team2.rank}` : '—' },
                { label: lang === 'es' ? 'Forma' : 'Form', v1: result.team1.form?.slice(-5).join(' ') || '—', v2: result.team2.form?.slice(-5).join(' ') || '—' },
                { label: lang === 'es' ? 'Títulos WC' : 'WC Titles', v1: result.team1.titles || '0', v2: result.team2.titles || '0' },
              ].map(s => (
                <div key={s.label} className="card-sm" style={{ textAlign: 'center' }}>
                  <div className="label" style={{ fontSize: 10 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    <span style={{ color: 'var(--blue)' }}>{s.v1}</span>
                    <span style={{ color: 'var(--text3)', margin: '0 6px' }}>vs</span>
                    <span style={{ color: 'var(--gold)' }}>{s.v2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Team Strengths ── */}
          {(result.team1_strengths?.length || result.team2_strengths?.length) && (
            <div className="card mb-16">
              <div className="label mb-12">{t('predict', 'strengths')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Team 1 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <TeamFlag flag={result.team1.flag} name={result.team1.name} size={18} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{result.team1.name}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {result.team1_strengths?.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--blue)', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>●</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Team 2 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <TeamFlag flag={result.team2.flag} name={result.team2.name} size={18} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{result.team2.name}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {result.team2_strengths?.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--gold)', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>●</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Key Players ── */}
          {(result.key_player_1 || result.key_player_2) && (
            <div className="card mb-16">
              <div className="label mb-12">{t('predict', 'key_players')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { player: result.key_player_1, team: result.team1, color: 'var(--blue)' },
                  { player: result.key_player_2, team: result.team2, color: 'var(--gold)' },
                ].map(({ player, team, color }) => player && (
                  <div key={team.id} style={{
                    background: 'var(--bg2)', border: `1px solid ${color}22`,
                    borderRadius: 'var(--radius-sm)', padding: '16px 12px', textAlign: 'center',
                  }}>
                    <div style={{ marginBottom: 10 }}>
                      <TeamFlag flag={team.flag} name={team.name} size={36} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text)' }}>
                      {player}
                    </div>
                    <div className="caption" style={{ color: 'var(--text3)', fontSize: 11 }}>
                      {team.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tactics ── */}
          {result.tactics && (
            <div className="card mb-16" style={{ borderLeft: '3px solid var(--gold)' }}>
              <div className="label mb-8">{t('predict', 'tactics')}</div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text2)', margin: 0 }}>
                {result.tactics}
              </p>
            </div>
          )}

          {/* ── AI Analysis (typewriter) ── */}
          <div className="card mb-16">
            <div className="flex-between mb-12">
              <div className="label" style={{ marginBottom: 0 }}>{t('predict', 'analysis')}</div>
              <span className="badge badge-gold" style={{ fontSize: 11 }}>Claude AI</span>
            </div>
            <p style={{
              fontSize: 14, lineHeight: 1.9, color: 'var(--text2)', margin: 0, minHeight: 60
            }} aria-live="polite">
              {analysisTyped}
              {isTyping && (
                <span style={{
                  display: 'inline-block', width: 2, height: '1.1em',
                  background: 'var(--gold)', marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'pulse 0.8s steps(2, start) infinite',
                }} aria-hidden="true" />
              )}
            </p>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={run} disabled={loading || !ready}>
              🎲 {t('predict', 'new_prediction')}
            </button>
            <button className="btn" onClick={copy}
              style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
              {copied ? `✅ ${t('predict', 'copied')}` : `📋 ${t('predict', 'copy')}`}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
