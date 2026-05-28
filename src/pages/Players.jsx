import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import { getAllTeamPlayers, getTeams, IS_MOCK } from '../services/sportsService'
import ApiStatus from '../components/common/ApiStatus'

const POSITIONS  = ['All', 'FW', 'MF', 'DF', 'GK']

export default function Players() {
  const { t, lang }          = useLang()

  const POS_LABELS = {
    All: lang === 'es' ? 'Todas las posiciones' : 'All Positions',
    FW:  lang === 'es' ? 'Delanteros'  : 'Forwards',
    MF:  lang === 'es' ? 'Mediocampistas' : 'Midfielders',
    DF:  lang === 'es' ? 'Defensas'    : 'Defenders',
    GK:  lang === 'es' ? 'Porteros'    : 'Goalkeepers',
  }
  const SORT_OPT = [
    { val: 'alpha',   label: lang === 'es' ? 'A–Z'        : 'A–Z'      },
    { val: 'rating',  label: lang === 'es' ? 'Rating'     : 'Rating'   },
    { val: 'goals',   label: lang === 'es' ? 'Goles'      : 'Goals'    },
    { val: 'assists', label: lang === 'es' ? 'Asistencias': 'Assists'  },
  ]
  const { toggleFav, isFav } = useApp()
  const navigate             = useNavigate()

  // Filtros client-side (actúan sobre la página actual)
  const [pos,    setPos   ] = useState('All')
  const [sortBy, setSortBy] = useState('alpha')
  const [search, setSearch] = useState('')

  // Paginación y país seleccionado
  const [page,         setPage        ] = useState(1)
  const [selectedTeam, setSelectedTeam] = useState(null) // { id, name, flag } | null = Todos

  // ── Carga los 48 equipos para el filtro de país (caché 1h) ──
  const { data: teams } = useApi(getTeams, { ttl: 3_600_000 })

  // ── Carga el roster COMPLETO del equipo seleccionado (todas las páginas) ──
  // Esto permite que pos filter y búsqueda funcionen sobre todo el plantel,
  // no solo los 20 de la página activa.
  // En API mode sin equipo seleccionado → skip (endpoint global devuelve vacío).
  // En mock mode sin equipo → muestra todos los jugadores mock.
  const skipLoad = !IS_MOCK && selectedTeam === null
  const { data: allPlayers, loading, error, refetch } = useApi(
    getAllTeamPlayers,
    selectedTeam ? selectedTeam.id : null,
    { ttl: 3_600_000, skip: skipLoad },   // Cache 1h — el plantel no cambia
  )

  // Selección de país: resetea filtros y vuelve a página 1
  const handleTeamSelect = useCallback((team) => {
    setSelectedTeam(team)
    setPage(1)
    setPos('All')
    setSearch('')
  }, [])

  // Lista de países A→Z para el filtro de país
  const countryList = useMemo(() =>
    teams ? [...teams].sort((a, b) => a.name.localeCompare(b.name)) : [],
  [teams])

  // Filtro sobre el roster COMPLETO (pos + search + sort)
  const filtered = useMemo(() => {
    const raw = allPlayers ?? []
    let result = raw
      .filter(p => pos    === 'All' || p.pos === pos)
      .filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'rating')  return [...result].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    if (sortBy === 'goals')   return [...result].sort((a, b) => b.goals - a.goals)
    if (sortBy === 'assists') return [...result].sort((a, b) => b.assists - a.assists)
    return result // 'alpha' ya viene ordenado por apellido del servicio
  }, [allPlayers, pos, search, sortBy])

  // Paginación client-side sobre el resultado filtrado
  const PAGE_SIZE        = 20
  const totalPages       = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const displayedPlayers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 whenever a filter that changes result count is applied
  useEffect(() => { setPage(1) }, [pos, search, sortBy])

  return (
    <div className="page-content page-enter">

      {/* ── Header ── */}
      <div className="section-header mb-16">
        <h1 className="section-title"> <span>{t('nav', 'players')}</span></h1>
        <select className="select-dark" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPT.map(o => (
            <option key={o.val} value={o.val}>
              {lang === 'es' ? 'Ordenar: ' : 'Sort: '}{o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Buscador ── */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, color: 'var(--text3)', pointerEvents: 'none',
        }}>🔍</span>
        <input className="input" style={{ paddingLeft: 36 }}
          placeholder={lang === 'es' ? 'Buscar jugador...' : 'Search player...'}
          value={search}
          onChange={e => setSearch(e.target.value)} aria-label="Search player" />
      </div>

      {/* ── Filtro por posición ── */}
      <div className="scroll-tabs" role="tablist" aria-label={lang === 'es' ? 'Posición' : 'Position'}>
        {POSITIONS.map(p => (
          <button key={p}
            className={`scroll-tab${pos === p ? ' active' : ''}`}
            onClick={() => setPos(p)} role="tab" aria-selected={pos === p}>
            {POS_LABELS[p]}
          </button>
        ))}
      </div>

      {/* ── Filtro por país (todos los 48 equipos) ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="label mb-8">{t('common','filter_country')}</div>
        <div className="scroll-tabs" role="listbox" aria-label={t('common','filter_country')}>

          {/* Opción "Todos" */}
          <button
            className={`scroll-tab${selectedTeam === null ? ' active' : ''}`}
            onClick={() => handleTeamSelect(null)}
            role="option" aria-selected={selectedTeam === null}>
            {t('common','all_countries')}
          </button>

          {/* Un tab por cada equipo clasificado */}
          {countryList.map(team => (
            <button key={team.id}
              className={`scroll-tab${selectedTeam?.id === team.id ? ' active' : ''}`}
              onClick={() => handleTeamSelect(team)}
              role="option" aria-selected={selectedTeam?.id === team.id}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {team.flag && (
                typeof team.flag === 'string' && team.flag.startsWith('http')
                  ? <img src={team.flag} alt=""
                      style={{ width: 18, height: 18, objectFit: 'contain', borderRadius: 2 }} />
                  : <span aria-hidden="true">{team.flag}</span>
              )}
              {team.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contador de resultados ── */}
      {!loading && !error && !skipLoad && (
        <p className="caption mb-16" style={{ color: 'var(--text3)' }}>
          {`${filtered.length} ${lang === 'es' ? `jugador${filtered.length !== 1 ? 'es' : ''}` : `player${filtered.length !== 1 ? 's' : ''}`}`}
          {selectedTeam && ` — ${selectedTeam.name}`}
          {pos    !== 'All' && ` · ${POS_LABELS[pos]}`}
          {search && ` · "${search}"`}
          {` · ${lang === 'es' ? `Página ${page} de ${totalPages}` : `Page ${page} of ${totalPages}`}`}
        </p>
      )}

      {/* ── Prompt cuando no hay país seleccionado (modo API) ── */}
      {skipLoad && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
          <div className="fw-600" style={{ fontSize: 16, marginBottom: 8, color: 'var(--text1)' }}>
            {lang === 'es' ? 'Selecciona un país' : 'Select a country'}
          </div>
          <div style={{ fontSize: 14 }}>
            {lang === 'es'
              ? 'Elige una selección en el filtro de arriba para explorar su plantilla completa.'
              : 'Choose a team from the filter above to explore their full squad.'}
          </div>
        </div>
      )}

      {/* ── Grid de jugadores ── */}
      {!skipLoad && (
      <ApiStatus loading={loading} error={error}
        data={displayedPlayers.length ? displayedPlayers : null}
        skeleton="grid" skeletonCount={6} skeletonHeight={110}
        onRetry={refetch}
        emptyMessage={search || pos !== 'All'
          ? (lang === 'es' ? 'No hay jugadores con esos filtros. Prueba otra combinación.' : 'No players match these filters. Try a different combination.')
          : (lang === 'es' ? 'No hay jugadores disponibles.' : 'No players available.')}>
        <div className="grid-2" role="list">
          {displayedPlayers.map(player => (
            <article key={player.id} className="card card-clickable player-card-full"
              onClick={() => navigate(`/players/${player.id}`, { state: { player } })}
              role="listitem" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/players/${player.id}`, { state: { player } })}
              aria-label={`${player.name}, ${player.pos}`}>

              {player.photo ? (
                <img src={player.photo} alt={player.name}
                  style={{
                    width: 54, height: 54, borderRadius: '50%',
                    border: '2px solid rgba(240,180,41,.2)', objectFit: 'cover', flexShrink: 0,
                  }}
                  onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div className="player-avatar-med" aria-hidden="true">{player.emoji}</div>
              )}

              <div className="player-card-info">
                <div className="fw-600" style={{ fontSize: 15, marginBottom: 2 }}>
                  {player.name}
                  {player.flag && (
                    <span style={{ opacity: .6, fontSize: 13, marginLeft: 4 }}>{player.flag}</span>
                  )}
                </div>
                <div className="caption" style={{ marginBottom: 8 }}>
                  <span className="badge badge-blue" style={{ marginRight: 6, fontSize: 9 }}>
                    {player.pos}
                  </span>
                  {player.club} · {player.nation} · {player.age} {t('player','yrs')}
                </div>
                <div className="flex gap-16">
                  <div className="pstat">
                    <div className="pstat-val">{player.goals}</div>
                    <div className="pstat-lbl">{t('common', 'goals')}</div>
                  </div>
                  <div className="pstat">
                    <div className="pstat-val">{player.assists}</div>
                    <div className="pstat-lbl">{t('common', 'assists')}</div>
                  </div>
                  <div className="pstat">
                    <div className="pstat-val">{player.rating}</div>
                    <div className="pstat-lbl">{t('common', 'rating')}</div>
                  </div>
                  {player.val && player.val !== '—' && (
                    <div className="pstat">
                      <div className="pstat-val" style={{ fontSize: 11 }}>{player.val}</div>
                      <div className="pstat-lbl">{t('common','value')}</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`fav-btn${isFav('players', player.id) ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); toggleFav('players', player) }}
                aria-label={lang === 'es'
                  ? `${isFav('players', player.id) ? 'Quitar de' : 'Agregar a'} favoritos`
                  : `${isFav('players', player.id) ? 'Remove from' : 'Add to'} favorites`}>
                ♥
              </button>
            </article>
          ))}
        </div>
      </ApiStatus>
      )}

      {/* ── Paginación ── */}
      {!skipLoad && !loading && !error && totalPages > 1 && (
        <div className="flex-center gap-8 mt-24" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm"
            onClick={() => setPage(1)} disabled={page === 1}
            aria-label={lang === 'es' ? 'Primera página' : 'First page'}>
            ««
          </button>
          <button className="btn btn-outline btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            aria-label={lang === 'es' ? 'Página anterior' : 'Previous page'}>
            {lang === 'es' ? '← Anterior' : '← Previous'}
          </button>
          <span className="caption" style={{ padding: '0 12px', minWidth: 100, textAlign: 'center' }}>
            {lang === 'es' ? 'Página' : 'Page'} <strong>{page}</strong> {lang === 'es' ? 'de' : 'of'} <strong>{totalPages}</strong>
          </span>
          <button className="btn btn-outline btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            aria-label={lang === 'es' ? 'Página siguiente' : 'Next page'}>
            {lang === 'es' ? 'Siguiente →' : 'Next →'}
          </button>
          <button className="btn btn-outline btn-sm"
            onClick={() => setPage(totalPages)} disabled={page === totalPages}
            aria-label={lang === 'es' ? 'Última página' : 'Last page'}>
            »»
          </button>
        </div>
      )}

    </div>
  )
}
