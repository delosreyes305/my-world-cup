import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useLang } from '../../context/LangContext'
import { useApp } from '../../context/AppContext'
import SearchOverlay from '../common/SearchOverlay'
import LiveTicker from '../common/LiveTicker'
import './Layout.css'

const NAV_ITEMS = [
  { path: '/',         key: 'home',      icon: <i className="fa-solid fa-house-user"    aria-hidden="true" /> },
  { path: '/matches',  key: 'matches',   icon: <i className="fa-solid fa-futbol"         aria-hidden="true" /> },
  { path: '/teams',    key: 'teams',     icon: <i className="fa-solid fa-shield-halved"  aria-hidden="true" /> },
  { path: '/players',  key: 'players',   icon: <i className="fa-solid fa-users"          aria-hidden="true" /> },
  { path: '/bracket',  key: 'bracket',   icon: <i className="fa-solid fa-trophy"         aria-hidden="true" /> },
  { path: '/news',     key: 'news',      icon: <i className="fa-solid fa-newspaper"      aria-hidden="true" /> },
  { path: '/ranking',  key: 'ranking',   icon: <i className="fa-solid fa-ranking-star"   aria-hidden="true" /> },
  { path: '/trivia',   key: 'trivia',    icon: <i className="fa-solid fa-brain"          aria-hidden="true" /> },
  { path: '/predict',  key: 'predict',   icon: <i className="fa-solid fa-robot"          aria-hidden="true" /> },
  { path: '/favorites',key: 'favorites', icon: <i className="fa-solid fa-heart"          aria-hidden="true" /> },
]

export default function Layout() {
  const { lang, toggleLang, t } = useLang()
  const { setSearchOpen } = useApp()

  return (
    <div className="layout">
      {/* Live ticker */}
      <LiveTicker />

      {/* ── Top Navbar ── */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner container">

          {/* Logo */}
          <NavLink to="/" className="nav-logo" aria-label="My World Cup Home">
            <i className="fa-solid fa-earth fa-xl" style={{ color: 'rgb(240,180,41)' }} aria-hidden="true" /> MWC
          </NavLink>

          {/* Desktop nav links — hidden on mobile/tablet via CSS */}
          <div className="nav-links" role="list">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                role="listitem"
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span className="nav-label">{t('nav', item.key)}</span>
              </NavLink>
            ))}
          </div>

          {/* Language + Search — always visible */}
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

      {/* ── Bottom Nav (mobile / tablet only) ── */}
      <nav className="bottom-nav" role="navigation" aria-label="Page navigation">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{t('nav', item.key)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Search overlay */}
      <SearchOverlay />
    </div>
  )
}
