import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useApp } from '../context/AppContext'
import { useApi } from '../hooks/useApi'
import { getAllTeamPlayers, searchPlayers, getTeams, IS_MOCK } from '../services/sportsService'
import ApiStatus from '../components/common/ApiStatus'

const POSITIONS  = ['All', 'FW', 'MF', 'DF', 'GK']

// ── Simple debounce hook ─────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

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

  // Filters
  const [pos,    setPos   ] = useState('All')
  const [sortBy, setSortBy] = useState('alpha')
  const [search, setSearch] = useState('')

  // Pagination + selected team
  const [page,         setPage        ] = useState(1)
  const [selectedTeam, setSelectedTeam] = useState(null)

  // Debounce search for API calls (400 ms)
  const debouncedSearch = useDebounce(search, 400)

  // ── Global search mode: no team selected + search ≥ 3 chars (API mode only) ──
  const isGlobalSearch = !IS_MOCK && selectedTeam === null && debouncedSearch.trim().length >= 3

  // ── Load teams list for country filter (cached 1 h) ──
  const { data: teams } = useApi(getTeams, { ttl: 3_600_000 })

  // ── Load full squad when a team is selected ──────────────────────────────────
  // In mock with no team: loads all players. In API with no team: skip (use global search).
  const skipTeamLoad = !IS_MOCK && selectedTeam === null
  const { data: teamPlayers, loading: teamLoading, error: teamError, refetch } = useApi(
    getAllTeamPlayers,
    selectedTeam ? selectedTeam.id : null,
    { ttl: 3_600_000, skip: skipTeamLoad },
  )

  // ── Global search via API ─────────────────────────────────────────────────────
  const { data: searchResults, loading: searchLoading, error: searchError } = useApi(
    searchPlayers,
    debouncedSearch,
    { ttl: 60_000, skip: !isGlobalSearch || debouncedSearch.trim().length < 3 },
  )

  // Select which dataset to use
  const rawPlayers  = isGlobalSearch ? (searchResults || []) : (teamPlayers || [])
  const loading     = isGlobalSearch ? searchLoading : teamLoading
  const error       = isGlobalSearch ? searchError   : teamError

  // Team selection: reset filters + go to page 1
  const handleTeamSelect = useCallback((team) => {
    setSelectedTeam(team)
    setPage(1)
    setPos('All')
    setSearch('')
  }, [])

  // Country list A→Z
  const countryList = useMemo(() =>
    teams ? [...teams].sort((a, b) => a.name.localeCompare(b.name)) : [],
  [teams])

  // Client-side filter + sort (name filter only in team mode; global search already filtered)
  const filtered = useMemo(() => {
    let result = rawPlayers
      .filter(p => pos === 'All' || p.pos === pos)

    // In team mode, apply client-side name search
    if (!isGlobalSearch && search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name?.toLowerCase().includes(q))
    }

    if (sortBy === 'rating')  return [...result].sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    if (sortBy === 'goals')   return [...result].sort((a, b) => (b.goals || 0) - (a.goals || 0))
    if (sortBy === 'assists') return [...result].sort((a, b) => (b.assists || 0) - (a.assists || 0))
    return result // 'alpha' already sorted by last name from service
  }, [rawPlayers, pos, search, sortBy, isGlobalSearch])

  // Client-side pagination
  const PAGE_SIZE        = 20
  const totalPages       = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const displayedPlayers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [pos, search, sortBy, selectedTeam, debouncedSearch])

  // ── Show prompt when nothing is ready to show ────────────────────────────────
  // In API mode: no team AND search is too short → show the "select a country" prompt
  const showPrompt = !IS_MOCK && selectedTeam === null && debouncedSearch.trim().length < 3

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

      {/* ── Search bar ── */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, color: 'var(--text3)', pointerEvents: 'none',
        }} />
        <input className="input" style={{ paddingLeft: 36 }}
          placeholder={lang === 'es' ? 'Buscar jugador...' : 'Search player...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search player"
        />
        {/* Live indicator while API search is running */}
        {isGlobalSearch && searchLoading && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, color: 'var(--text3)',
          }}>
            {lang === 'es' ? 'Buscando…' : 'Searching…'}
          </span>
        )}
      </div>

      {/* ── Position filter ── */}
      <div className="scroll-tabs" role="tablist" aria-label={lang === 'es' ? 'Posición' : 'Position'}>
        {POSITIONS.map(p => (
          <button key={p}
            className={`scroll-tab${pos === p ? ' active' : ''}`}
            onClick={() => setPos(p)} role="tab" aria-selected={pos === p}>
            {POS_LABELS[p]}
          </button>
        ))}
      </div>

      {/* ── Country filter ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="label mb-8">{t('common','filter_country')}</div>
        <select
          className="select-dark"
          style={{ width: '100%' }}
          value={selectedTeam ? String(selectedTeam.id) : ''}
          onChange={e => {
            const val = e.target.value
            handleTeamSelect(val ? countryList.find(tm => String(tm.id) === val) ?? null : null)
          }}
          aria-label={t('common','filter_country')}
        >
          <option value="">{t('common','all_countries')}</option>
          {countryList.map(team => (
            <option key={team.id} value={String(team.id)}>
              {typeof team.flag === 'string' && !team.flag.startsWith('http')
                ? `${team.flag} ${team.name}`
                : team.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Result count ── */}
      {!loading && !error && !showPrompt && (
        <p className="caption mb-16" style={{ color: 'var(--text3)' }}>
          {isGlobalSearch
            ? `${filtered.length} ${lang === 'es' ? `resultado${filtered.length !== 1 ? 's' : ''}` : `result${filtered.length !== 1 ? 's' : ''}`} — "${debouncedSearch}"`
            : `${filtered.length} ${lang === 'es' ? `jugador${filtered.length !== 1 ? 'es' : ''}` : `player${filtered.length !== 1 ? 's' : ''}`}`
          }
          {selectedTeam && ` — ${selectedTeam.name}`}
          {pos    !== 'All' && ` · ${POS_LABELS[pos]}`}
          {!isGlobalSearch && search && ` · "${search}"`}
          {!isGlobalSearch && ` · ${lang === 'es' ? `Página ${page} de ${totalPages}` : `Page ${page} of ${totalPages}`}`}
        </p>
      )}

      {/* ── Prompt: select a country or type to search ── */}
      {showPrompt && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 16, color: 'var(--gold)' }}>
            <i className="fa-solid fa-flag fa-xl" aria-hidden="true" />
          </div>
          <div className="fw-600" style={{ fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>
            {lang === 'es' ? 'Selecciona un país o busca un jugador' : 'Select a country or search for a player'}
          </div>
          <div style={{ fontSize: 14 }}>
            {lang === 'es'
              ? 'Elige una selección del filtro de arriba, o escribe el nombre de un jugador en el buscador.'
              : 'Choose a team from the filter above, or type a player name in the search bar.'}
          </div>
        </div>
      )}

      {/* ── Player grid ── */}
      {!showPrompt && (
        <ApiStatus loading={loading} error={error}
          data={displayedPlayers.length ? displayedPlayers : null}
          skeleton="grid" skeletonCount={6} skeletonHeight={110}
          onRetry={refetch}
          emptyMessage={
            isGlobalSearch
              ? (lang === 'es' ? `No se encontraron jugadores para "${debouncedSearch}".` : `No players found for "${debouncedSearch}".`)
              : (search || pos !== 'All')
                ? (lang === 'es' ? 'No hay jugadores con esos filtros. Prueba otra combinación.' : 'No players match these filters. Try a different combination.')
                : (lang === 'es' ? 'No hay jugadores disponibles.' : 'No players available.')
          }>
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
                    {player.club && `${player.club} · `}{player.nation} · {player.age} {t('player','yrs')}
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

      {/* ── Pagination (team mode only) ── */}
      {!showPrompt && !isGlobalSearch && !loading && !error && totalPages > 1 && (
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
