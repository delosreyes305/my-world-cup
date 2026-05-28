import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useApi } from '../hooks/useApi'
import { getNews } from '../services/newsService'
import ApiStatus from '../components/common/ApiStatus'

const CATS = [
  { key: 'all',          label: 'All'          },
  { key: 'breaking',     label: 'Breaking'     },
  { key: 'match_report', label: 'Match Report' },
  { key: 'injury',       label: 'Injury'       },
  { key: 'transfer',     label: 'Transfer'     },
  { key: 'trending',     label: 'Trending'     },
]

export default function News() {
  const { t } = useLang()
  const [cat, setCat] = useState('all')

  const { data: articles, loading, error, refetch } = useApi(getNews, cat, { ttl: 120_000 })

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-16">
        <h1 className="section-title"> <span>{t('nav', 'news')}</span></h1>
      </div>

      <div className="scroll-tabs" role="tablist">
        {CATS.map(c => (
          <button key={c.key} className={`scroll-tab${cat === c.key ? ' active' : ''}`}
            onClick={() => setCat(c.key)} role="tab" aria-selected={cat === c.key}>
            {c.label}
          </button>
        ))}
      </div>

      <ApiStatus loading={loading} error={error} data={articles}
        skeleton="grid" skeletonCount={6} skeletonHeight={220}
        onRetry={refetch} emptyMessage="No se encontraron artículos.">
        <div className="grid-3" role="list">
          {(articles || []).map((article, i) => (
            <article key={article.id || i} className="news-article-card card card-clickable"
              role="listitem" tabIndex={0}
              onClick={() => article.url && window.open(article.url, '_blank', 'noopener')}
              aria-label={article.title}>
              {article.image ? (
                <img src={article.image} alt="" className="news-article-img"
                  style={{ objectFit: 'cover', width: '100%', height: 120 }}
                  onError={e => { e.target.style.display='none' }} />
              ) : (
                <div className="news-article-img"
                  style={{ background: `linear-gradient(135deg,${article.color}22,${article.color}08)` }} />
              )}
              <div className="news-article-body">
                <div className="news-cat-tag"
                  style={{ color: article.color, borderColor:`${article.color}44`, background:`${article.color}12` }}>
                  {article.cat}
                </div>
                <h2 className="news-article-title">{article.title}</h2>
                {article.excerpt && (
                  <p className="caption mt-8" style={{ lineHeight:1.5, display:'-webkit-box',
                    WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {article.excerpt}
                  </p>
                )}
                <div className="flex-between mt-8">
                  <time className="caption">{article.time}</time>
                  {article.source && <span className="caption" style={{ opacity:.6 }}>{article.source}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </ApiStatus>
    </div>
  )
}
