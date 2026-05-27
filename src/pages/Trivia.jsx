import React, { useState, useCallback } from 'react'
import { useLang } from '../context/LangContext'
import { generateTriviaQuestion } from '../services/aiService'
import { TRIVIA_BANK, FUN_FACTS } from '../data/mockData'

function pickLocal(exclude) {
  const pool = TRIVIA_BANK.filter(q => q.id !== exclude?.id)
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function Trivia() {
  const { t, lang } = useLang()
  const [current,  setCurrent ] = useState(() => pickLocal(null))
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected ] = useState(null)
  const [score,    setScore    ] = useState({ correct:0, total:0 })
  const [aiLoading,setAiL     ] = useState(false)

  const next = useCallback(async () => {
    setAiL(true)
    setAnswered(false); setSelected(null)
    try {
      const aiQ = await generateTriviaQuestion(lang)
      if (aiQ) { setCurrent(aiQ); setAiL(false); return }
    } catch { /* fallback */ }
    setCurrent(pickLocal(current))
    setAiL(false)
  }, [current, lang])

  const answer = (idx) => {
    setSelected(idx); setAnswered(true)
    setScore(s => ({
      correct: s.correct + (idx === current.correct ? 1 : 0),
      total:   s.total   + 1,
    }))
  }

  const accuracy = score.total > 0 ? Math.round(score.correct / score.total * 100) : 0

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-16">
        <h1 className="section-title"> <span>{t('trivia','title')}</span></h1>
        {score.total > 0 && (
          <div className="flex gap-8">
            <span className="badge badge-gold">🏆 {score.correct}/{score.total}</span>
            <span className="badge badge-green">{accuracy}%</span>
          </div>
        )}
      </div>

      {/* Tarjeta de pregunta */}
      {aiLoading ? (
        <div className="card" style={{ textAlign:'center', padding:'48px' }}>
          <div className="ai-dots" aria-hidden="true" style={{ marginBottom:12, justifyContent:'center', display:'flex', gap:4 }}>
            <span/><span/><span/>
          </div>
          <p className="text-muted">Generando pregunta con IA...</p>
        </div>
      ) : current && (
        <div className="card mb-16" style={{
          background:'linear-gradient(135deg,rgba(240,180,41,.07),rgba(240,180,41,.02))',
          border:'1px solid rgba(240,180,41,.2)', borderRadius:'var(--radius-lg)', padding:32, textAlign:'center'
        }}>
          <div style={{ fontSize:52, marginBottom:16 }} aria-hidden="true">{current.emoji}</div>
          <h2 style={{ fontSize:18, fontWeight:600, lineHeight:1.4, marginBottom:28 }}>{current.q}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }} role="group">
            {current.opts.map((opt, i) => {
              let cls = 'trivia-opt'
              if (answered) {
                if (i === current.correct)                 cls += ' correct'
                else if (i === selected && i !== current.correct) cls += ' wrong'
                else cls += ' disabled'
              }
              return (
                <button key={i} className={cls}
                  onClick={() => !answered && answer(i)} disabled={answered}>
                  <span style={{ marginRight:8, fontWeight:700, color:'var(--text3)' }}>
                    {['A','B','C','D'][i]}.
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Resultado */}
      {answered && (
        <div className="card mb-24 animate-fade">
          <div style={{
            background: selected === current?.correct ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
            border:`1px solid ${selected===current?.correct?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'}`,
            borderRadius:'var(--radius-sm)', padding:16, marginBottom:16
          }} role="alert" aria-live="polite">
            <div style={{ fontSize:18, marginBottom:6 }}>
              {selected === current?.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}
            </div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
              💡 {current?.explain}
            </div>
          </div>
          <button className="btn btn-gold" onClick={next}>
            🎲 {t('trivia','next')}
          </button>
        </div>
      )}

      {/* Barra de progreso */}
      {score.total > 0 && (
        <div className="card mb-24">
          <div className="flex-between mb-8">
            <span className="label" style={{ marginBottom:0 }}>Tu puntuación</span>
            <span style={{ color:'var(--gold)', fontWeight:600 }}>{score.correct}/{score.total}</span>
          </div>
          <div className="stat-bar-track">
            <div className="stat-bar-fill" style={{ width:`${accuracy}%` }} />
          </div>
          <p className="caption mt-8">
            {accuracy >= 80 ? '🔥 ¡Eres un genio del fútbol!' : accuracy >= 50 ? '👍 ¡No está mal!' : '📚 ¡Sigue aprendiendo!'}
          </p>
        </div>
      )}

      <div className="divider" />

      {/* Fun Facts */}
      <section aria-labelledby="facts-heading">
        <h2 className="section-title mb-16" id="facts-heading">
           <span>{t('trivia','fun_facts')}</span>
        </h2>
        <div className="grid-2">
          {FUN_FACTS.map((f, i) => (
            <div key={i} className="card-sm flex gap-12" style={{ alignItems:'flex-start' }}>
              <span style={{ fontSize:28, flexShrink:0 }} aria-hidden="true">{f.emoji}</span>
              <p style={{ fontSize:13, lineHeight:1.7, color:'var(--text2)' }}>{f.fact}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
