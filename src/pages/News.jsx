import React, { useState } from 'react'
import { useLang } from '../context/LangContext'
import { useApi } from '../hooks/useApi'
import { getNews } from '../services/newsService'
import ApiStatus from '../components/common/ApiStatus'
import NewsReader from '../components/common/NewsReader'

export default function News() {
  const { t, lang } = useLang()
  const [cat, setCat] = useState('all')
  const [reading, setReading] = useState(null)   // article open in reader

  // Tab definitions — keys stay stable, labels come from i18n
  const CATS = [
    { key: 'all',          label: t('news', 'tab_all')          },
    { key: 'breaking',     label: t('news', 'tab_breaking')     },
    { key: 'match_report', label: t('news', 'tab_match_report') },
    { key: 'injury',       label: t('news', 'tab_injury')       },
    { key: 'transfer',     label: t('news', 'tab_transfer')     },
    { key: 'trending',     label: t('news', 'tab_trending')     },
  ]

  // Re-fetch whenever category OR language changes (lang is part of the cache key)
  const { data: articles, loading, error, refetch } = useApi(
    getNews, cat, lang, { ttl: 120_000 }
  )

  return (
    <div className="page-content page-enter">
      <div className="section-header mb-16">
        <h1 className="section-title"><span>{t('nav', 'news')}</span></h1>
      </div>

      <div className="scroll-tabs" role="tablist">
        {CATS.map(c => (
          <button
            key={c.key}
            className={`scroll-tab${cat === c.key ? ' active' : ''}`}
            onClick={() => setCat(c.key)}
            role="tab"
            aria-selected={cat === c.key}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ApiStatus
        loading={loading} error={error} data={articles}
        skeleton="grid" skeletonCount={6} skeletonHeight={220}
        onRetry={refetch}
        emptyMessage={lang === 'es' ? 'No se encontraron artículos.' : 'No articles found.'}
      >
        <div className="grid-3" role="list">
          {(articles || []).map((article, i) => (
            <article
              key={article.id || i}
              className="news-article-card card card-clickable"
              role="listitem"
              tabIndex={0}
              onClick={() => setReading(article)}
              onKeyDown={e => e.key === 'Enter' && setReading(article)}
              aria-label={article.title}
            >
              {article.image ? (
                <img
                  src={article.image} alt=""
                  className="news-article-img"
                  style={{ objectFit: 'cover', width: '100%', height: 120 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div
                  className="news-article-img"
                  style={{ background: `linear-gradient(135deg,${article.color}22,${article.color}08)` }}
                />
              )}

              <div className="news-article-body">
                {/* Category badge — translated label */}
                <div
                  className="news-cat-tag"
                  style={{
                    color: article.color,
                    borderColor: `${article.color}44`,
                    background: `${article.color}12`,
                  }}
                >
                  {article.catLabel || article.cat}
                </div>

                <h2 className="news-article-title">{article.title}</h2>

                {article.excerpt && (
                  <p className="caption mt-8" style={{
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {article.excerpt}
                  </p>
                )}

                <div className="flex-between mt-8">
                  <time className="caption">{article.time}</time>
                  {article.source && (
                    <span className="caption" style={{ opacity: 0.6 }}>{article.source}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </ApiStatus>

      {/* In-app article reader */}
      <NewsReader article={reading} onClose={() => setReading(null)} />
    </div>
  )
}
