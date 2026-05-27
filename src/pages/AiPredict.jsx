import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { TEAMS } from '../data/mockData'
import { getMatchPredictionAI } from '../services/aiService'

function calcProbability(t1, t2) {
  const score = f => (f || []).reduce((a, v) => a + (v==='W'?3:v==='D'?1:0), 0)
  const rankDiff = (t2.rank || 10) - (t1.rank || 10)
  const base = 45 + Math.min(15, rankDiff * 0.6) + (score(t1.form) - score(t2.form)) * 2
  const p1   = Math.min(75, Math.max(25, Math.round(base)))
  const draw = Math.round(12 + Math.random() * 8)
  return { p1, draw, p2: Math.max(5, 100 - p1 - draw) }
}

export default function AiPredict() {
  const { t, lang }    = useLang()
  const [t1Id, setT1]  = useState('')
  const [t2Id, setT2]  = useState('')
  const [loading, setL] = useState(false)
  const [result, setR]  = useState(null)
  const [error, setE]   = useState(null)

  const team1 = TEAMS.find(t => t.id === Number(t1Id))
  const team2 = TEAMS.find(t => t.id === Number(t2Id))
  const ok    = team1 && team2 && t1Id !== t2Id

  const run = async () => {
    if (!ok) return
    setL(true); setE(null); setR(null)
    const probs = calcProbability(team1, team2)
    try {
      const analysis = await getMatchPredictionAI(team1, team2)
      setR({ probs, analysis, team1, team2 })
    } catch (err) {
      const fb = `**${team1.flag} ${team1.name}** llegan como favoritos según el ranking FIFA (#${team1.rank}), con forma ${team1.form?.join('-') || 'N/A'} y un plantel que incluye jugadores de élite global.\n\n**${team2.flag} ${team2.name}** (FIFA #${team2.rank}) mostrarán su variante táctica más compacta, buscando el contragolpe y el error rival.\n\n🔮 **Predicción: ${team1.name} 1–0 ${team2.name}** — Diferencia ajustada en un duelo táctico de alta intensidad.`
      setR({ probs, analysis: fb, team1, team2 })
      setE('Análisis offline (API no disponible)')
    } finally {
      setL(false)
    }
  }

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-16">
        <h1 className="section-title"> <span>{t('predict','title')}</span></h1>
        <span className="badge badge-gold">Claude Sonnet</span>
      </div>

      {/* Selector */}
      <div className="card mb-16">
        <div className="label mb-16">{t('predict','label')}</div>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
          <select className="select-dark" style={{ flex:1, minWidth:150 }}
            value={t1Id} onChange={e => setT1(e.target.value)} aria-label="Equipo 1">
            <option value="">— {t('predict','team1')} —</option>
            {TEAMS.map(tm => <option key={tm.id} value={tm.id}>{tm.flag} {tm.name}</option>)}
          </select>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--text3)', flexShrink:0 }}>VS</div>
          <select className="select-dark" style={{ flex:1, minWidth:150 }}
            value={t2Id} onChange={e => setT2(e.target.value)} aria-label="Equipo 2">
            <option value="">— {t('predict','team2')} —</option>
            {TEAMS.map(tm => <option key={tm.id} value={tm.id}>{tm.flag} {tm.name}</option>)}
          </select>
        </div>

        {/* Preview rápido */}
        {team1 && team2 && t1Id !== t2Id && (
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16,
            background:'rgba(255,255,255,.03)', borderRadius:'var(--radius-sm)', padding:'10px 14px' }}>
            <span style={{ fontSize:12, color:'var(--text3)' }}>
              {team1.flag} Forma: <strong>{team1.form?.join(' ')}</strong>
            </span>
            <span style={{ fontSize:12, color:'var(--text3)' }}>
              Forma: <strong>{team2.form?.join(' ')}</strong> {team2.flag}
            </span>
          </div>
        )}

        <button className="btn btn-gold btn-lg" onClick={run}
          disabled={!ok || loading} aria-busy={loading}>
          {loading
            ? <><div className="ai-dots" aria-hidden="true"><span/><span/><span/></div> Analizando...</>
            : ` ${t('predict','generate')}`}
        </button>
        {t1Id && t2Id && t1Id === t2Id &&
          <p className="caption mt-8" style={{ color:'var(--red)' }}>Selecciona dos equipos distintos.</p>}
      </div>

      {/* Resultado */}
      {result && (
        <div className="animate-fade">
          {error && <p className="caption mb-8" style={{ color:'var(--text3)', fontStyle:'italic' }}>ℹ️ {error}</p>}

          {/* Probabilidades */}
          <div className="card mb-16">
            <div className="label mb-12">{t('predict','win_prob')}</div>
            <div style={{ display:'flex', height:12, borderRadius:6, overflow:'hidden', marginBottom:10 }}>
              <div style={{ flex:result.probs.p1, background:'var(--blue)' }} />
              <div style={{ flex:result.probs.draw, background:'var(--text3)' }} />
              <div style={{ flex:result.probs.p2, background:'var(--gold)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span>{result.team1.flag} {result.team1.name} <strong style={{ color:'var(--gold)' }}>{result.probs.p1}%</strong></span>
              <span style={{ color:'var(--text3)' }}>Empate {result.probs.draw}%</span>
              <span><strong style={{ color:'var(--gold)' }}>{result.probs.p2}%</strong> {result.team2.name} {result.team2.flag}</span>
            </div>

            <div className="divider" />
            <div className="label mb-12">Comparativa</div>
            <div className="grid-3">
              {[
                { label:'FIFA Rank', v1:`#${result.team1.rank}`, v2:`#${result.team2.rank}` },
                { label:'Forma',     v1:result.team1.form?.join(' '), v2:result.team2.form?.join(' ') },
                { label:'Títulos WC', v1:result.team1.titles, v2:result.team2.titles },
              ].map(s => (
                <div key={s.label} className="card-sm" style={{ textAlign:'center' }}>
                  <div className="label">{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>
                    <span style={{ color:'var(--gold)' }}>{s.v1}</span>
                    <span style={{ color:'var(--text3)', margin:'0 6px' }}>vs</span>
                    <span style={{ color:'var(--gold)' }}>{s.v2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análisis IA */}
          <div className="card">
            <div className="flex-between mb-16">
              <h2 className="fw-600" style={{ fontSize:15 }}>🤖 {t('predict','analysis')}</h2>
              <span className="badge badge-gold">Claude AI</span>
            </div>
            <div style={{ fontSize:14, lineHeight:1.9, color:'var(--text2)', whiteSpace:'pre-line' }}
              aria-live="polite"
              dangerouslySetInnerHTML={{ __html: result.analysis
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
