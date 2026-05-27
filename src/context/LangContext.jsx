import React, { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    nav: {
      home: 'Home', matches: 'Matches', teams: 'Teams', players: 'Players',
      bracket: 'Bracket', news: 'News', trivia: 'Trivia',
      predict: 'AI Predict', favorites: 'Favorites',
    },
    home: {
      hero_sub: 'Your ultimate companion for the greatest football tournament on Earth',
      live_today: 'Live & Today', top_players: 'Top Players',
      latest_news: 'Latest News', group_stage: 'Group Stage', ranking: 'Ranking',
    },
    common: {
      see_all: 'See all', teams: 'Teams', matches: 'Matches',
      venues: 'Venues', countries: 'Countries', loading: 'Loading...',
      goals: 'Goals', assists: 'Assists', rating: 'Rating',
      pts: 'Pts', coach: 'Coach', rank: 'Rank', titles: 'Titles',
      add_fav: 'Add to Favorites', favorited: 'Favorited',
      live: 'LIVE', full_time: 'Full Time', upcoming: 'Upcoming',
      search_placeholder: 'Search teams, players, matches...',
    },
    predict: {
      title: 'AI Match Predictor', label: 'Select two teams for AI match prediction',
      generate: 'Generate Prediction', team1: 'Team 1', team2: 'Team 2',
      win_prob: 'Win Probability', analysis: 'AI Analysis',
    },
    trivia: {
      title: 'Football Trivia', fun_facts: 'Fun Facts', next: 'Next Question',
    },
  },
  es: {
    nav: {
      home: 'Inicio', matches: 'Partidos', teams: 'Equipos', players: 'Jugadores',
      bracket: 'Cuadro', news: 'Noticias', trivia: 'Trivia',
      predict: 'IA Predictor', favorites: 'Favoritos',
    },
    home: {
      hero_sub: 'Tu compañero definitivo para el torneo de fútbol más grande del planeta',
      live_today: 'En Vivo & Hoy', top_players: 'Mejores Jugadores',
      latest_news: 'Últimas Noticias', group_stage: 'Fase de Grupos', ranking: 'Ranking',
    },
    common: {
      see_all: 'Ver todo', teams: 'Equipos', matches: 'Partidos',
      venues: 'Estadios', countries: 'Países', loading: 'Cargando...',
      goals: 'Goles', assists: 'Asistencias', rating: 'Rating',
      pts: 'Pts', coach: 'Técnico', rank: 'Ranking', titles: 'Títulos',
      add_fav: 'Agregar a Favoritos', favorited: 'En Favoritos',
      live: 'EN VIVO', full_time: 'Tiempo completo', upcoming: 'Próximo',
      search_placeholder: 'Buscar equipos, jugadores, partidos...',
    },
    predict: {
      title: 'Predictor IA', label: 'Selecciona dos equipos para predicción de IA',
      generate: 'Generar Predicción', team1: 'Equipo 1', team2: 'Equipo 2',
      win_prob: 'Probabilidad de Victoria', analysis: 'Análisis IA',
    },
    trivia: {
      title: 'Trivia de Fútbol', fun_facts: 'Datos Curiosos', next: 'Siguiente Pregunta',
    },
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mwc_lang') || 'en')

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en'
    setLang(next)
    localStorage.setItem('mwc_lang', next)
  }

  const t = (section, key) => translations[lang]?.[section]?.[key] || key

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, translations: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
