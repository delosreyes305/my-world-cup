import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

const defaultFavs = { teams: [], players: [], matches: [] }

// Migrate stored data: old format stored raw IDs (numbers); new format stores full objects.
// Any non-object entries are dropped — they can't be displayed without full data.
function migrateFavs(raw) {
  const clean = arr =>
    Array.isArray(arr) ? arr.filter(x => x && typeof x === 'object' && x.id != null) : []
  return {
    teams:   clean(raw?.teams),
    players: clean(raw?.players),
    matches: clean(raw?.matches),
  }
}

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mwc_favs'))
      return stored ? migrateFavs(stored) : defaultFavs
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

  // item must be a full object with at least { id, name }
  const toggleFav = useCallback((type, item) => {
    if (!item || item.id == null) return
    setFavorites(prev => {
      const arr = prev[type] || []
      const isIn = arr.some(x => x?.id === item.id)
      if (isIn) {
        showToast(`Removed from favorites`)
        return { ...prev, [type]: arr.filter(x => x?.id !== item.id) }
      } else {
        showToast(`${item.name || 'Item'} added to favorites ♥`)
        return { ...prev, [type]: [...arr, item] }
      }
    })
  }, [showToast])

  const isFav = useCallback((type, id) => {
    return (favorites[type] || []).some(x => x?.id === id)
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
