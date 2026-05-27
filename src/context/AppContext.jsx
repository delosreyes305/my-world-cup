import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

const defaultFavs = { teams: [], players: [], matches: [] }

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mwc_favs')) || defaultFavs
    } catch {
      return defaultFavs
    }
  })

  const [toast, setToast] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('mwc_favs', JSON.stringify(favorites))
  }, [favorites])

  const showToast = useCallback((msg, duration = 2500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  const toggleFav = useCallback((type, id, name = '') => {
    setFavorites(prev => {
      const arr = prev[type] || []
      const isIn = arr.includes(id)
      if (isIn) {
        showToast(`Removed from favorites`)
        return { ...prev, [type]: arr.filter(x => x !== id) }
      } else {
        showToast(`${name || 'Item'} added to favorites ♥`)
        return { ...prev, [type]: [...arr, id] }
      }
    })
  }, [showToast])

  const isFav = useCallback((type, id) => {
    return (favorites[type] || []).includes(id)
  }, [favorites])

  return (
    <AppContext.Provider value={{
      favorites, toggleFav, isFav,
      toast, showToast,
      searchOpen, setSearchOpen,
    }}>
      {children}
      {toast && (
        <div className="notif-toast" role="alert" aria-live="polite">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
