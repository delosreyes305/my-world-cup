import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LangProvider } from './context/LangContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'
import Bracket from './pages/Bracket'
import News from './pages/News'
import Trivia from './pages/Trivia'
import AiPredict from './pages/AiPredict'
import Favorites from './pages/Favorites'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="matches" element={<Matches />} />
              <Route path="matches/:id" element={<MatchDetail />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:id" element={<TeamDetail />} />
              <Route path="players" element={<Players />} />
              <Route path="players/:id" element={<PlayerDetail />} />
              <Route path="bracket" element={<Bracket />} />
              <Route path="news" element={<News />} />
              <Route path="trivia" element={<Trivia />} />
              <Route path="predict" element={<AiPredict />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LangProvider>
  )
}
