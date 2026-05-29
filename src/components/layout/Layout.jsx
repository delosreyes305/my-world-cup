import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useApp } from '../../context/AppContext'
import SearchOverlay from '../common/SearchOverlay'
import LiveTicker from '../common/LiveTicker'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/',         key: 'home',      icon: <i className="fa-solid fa-house-user fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/matches',  key: 'matches',   icon: <i className="fa-solid fa-futbol fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/teams',    key: 'teams',     icon: <i className="fa-solid fa-shield-halved fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/players',  key: 'players',   icon: <i className="fa-solid fa-users fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/bracket',  key: 'bracket',   icon: <i className="fa-solid fa-trophy fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/news',     key: 'news',      icon: <i className="fa-solid fa-newspaper fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/trivia',   key: 'trivia',    icon: <i className="fa-solid fa-brain fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/predict',  key: 'predict',   icon: <i className="fa-solid fa-robot fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
  { path: '/favorites',key: 'favorites', icon: <i className="fa-solid fa-heart fa-lg" style={{"color": "rgb(240, 180, 41);"}}></i> },
]

export default function Layout() {
  const { lang, toggleLang, t } = useLang()
  const { setSearchOpen } = useApp()

  return (
    <div className="layout">
      {/* Live ticker */}
      <LiveTicker />

      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner container">
          <NavLink to="/" className="nav-logo" aria-label="My World Cup Home">
            <i className="fa-solid fa-earth fa-xl" style={{"color": "rgb(240, 180, 41);"}}></i> MWC
          </NavLink>

          <div className="nav-links" role="list">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                role="listitem"
              >
                <span aria-hidden="true">{item.icon}</span>
                <span className="nav-label">{t('nav', item.key)}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="lang-toggle"
              onClick={toggleLang}
              aria-label={`Switch to ${lang === 'en' ? 'Spanish' : 'English'}`}
            >
              <img
                src={`https://flagcdn.com/w40/${lang === 'en' ? 'us' : 'es'}.png`}
                alt={lang === 'en' ? 'US flag' : 'ES flag'}
                className="lang-flag"
              />
              <span>{lang === 'en' ? 'EN' : 'ES'}</span>
            </button>
            <button
              className="search-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <i className="fa-solid fa-magnifying-glass fa-lg" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main id="main-content" className="layout-main">
        <Outlet />
      </main>

      {/* Search overlay */}
      <SearchOverlay />
    </div>
  )
}
