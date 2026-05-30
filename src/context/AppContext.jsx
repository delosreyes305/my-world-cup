import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

const defaultFavs = { teams: [], players: [], matches: [] }

// frontend usa plural ('teams'), API usa singular ('team')
const SINGULAR = { teams: 'team', players: 'player', matches: 'match' }

function migrateFavs(raw) {
  const clean = arr =>
    Array.isArray(arr) ? arr.filter(x => x && typeof x === 'object' && x.id != null) : []
  return { teams: clean(raw?.teams), players: clean(raw?.players), matches: clean(raw?.matches) }
}

function loadLocalFavs() {
  try {
    const stored = JSON.parse(localStorage.getItem('mwc_favs'))
    return stored ? migrateFavs(stored) : defaultFavs
  } catch { return defaultFavs }
}

async function apiFetch(token, path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}

export function AppProvider({ children }) {
  const { user, token, authLoading, setAuthModalOpen } = useAuth()

  const [favorites,   setFavorites  ] = useState(defaultFavs)
  const [toast,       setToast      ] = useState(null)
  const [searchOpen,  setSearchOpen ] = useState(false)

  // ── Sincronizar favoritos cuando cambia el estado de auth ─────────
  useEffect(() => {
    if (authLoading) return   // esperar a que se valide el token guardado

    if (user && token) {
      // Logueado → cargar desde API
      apiFetch(token, '/api/favorites')
        .then(r => r.ok ? r.json() : defaultFavs)
        .then(data => setFavorites(migrateFavs(data)))
        .catch(() => setFavorites(defaultFavs))
    } else {
      // No logueado → localStorage
      setFavorites(loadLocalFavs())
    }
  }, [user, token, authLoading])

  // Persistir en localStorage solo cuando no hay sesión activa
  useEffect(() => {
    if (!user && !authLoading) {
      localStorage.setItem('mwc_favs', JSON.stringify(favorites))
    }
  }, [favorites, user, authLoading])

  const showToast = useCallback((msg, duration = 2500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }, [])

  // ── Toggle favorito ───────────────────────────────────────────────
  const toggleFav = useCallback(async (type, item) => {
    if (!item || item.id == null) return

    // Sin sesión → abrir modal de login
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    const arr  = favorites[type] || []
    const isIn = arr.some(x => x?.id === item.id)

    // Actualización optimista
    setFavorites(prev => {
      const list = prev[type] || []
      return {
        ...prev,
        [type]: isIn
          ? list.filter(x => x?.id !== item.id)
          : [...list, item],
      }
    })

    // Sincronizar con API
    const singularType = SINGULAR[type] || type
    try {
      if (isIn) {
        await apiFetch(token, `/api/favorites/${singularType}/${item.id}`, { method: 'DELETE' })
        showToast(user.first_name ? `Eliminado de favoritos` : 'Removed from favorites')
      } else {
        await apiFetch(token, '/api/favorites', {
          method: 'POST',
          body:   JSON.stringify({ type: singularType, item_id: item.id, item_data: item }),
        })
        showToast(`${item.name || 'Item'} agregado a favoritos ♥`)
      }
    } catch {
      // Revertir en caso de error
      setFavorites(prev => {
        const list = prev[type] || []
        return {
          ...prev,
          [type]: isIn ? [...list, item] : list.filter(x => x?.id !== item.id),
        }
      })
      showToast('Error al actualizar favoritos')
    }
  }, [user, token, favorites, setAuthModalOpen, showToast])

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
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider')
  return ctx
}
