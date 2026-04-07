'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { reportsApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CAT_COLORS: Record<string, string> = {
  pollution: '#ef4444', traffic: '#f97316', waste: '#84cc16',
  housing: '#8b5cf6', infrastructure: '#06b6d4', overcrowding: '#ec4899', other: '#94a3b8',
};
const CAT_EMOJIS: Record<string, string> = {
  pollution: '🏭', traffic: '🚗', waste: '🗑️',
  housing: '🏚️', infrastructure: '🏗️', overcrowding: '👥', other: '📌',
};

const CATEGORIES = ['pollution', 'traffic', 'waste', 'housing', 'infrastructure', 'overcrowding', 'other'];

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', city: '' });
  const [search, setSearch] = useState('');
  const [upvoting, setUpvoting] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  const LIMIT = 12;

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('ua_token'));
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(LIMIT),
        status: 'approved',
      };
      if (filter.category) params.category = filter.category;
      if (search.trim()) params.city = search.trim();
      const data = await reportsApi.getAll(params);
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpvote = async (id: string) => {
    if (!loggedIn) { window.location.href = '/login'; return; }
    setUpvoting(id);
    try {
      const data = await reportsApi.upvote(id);
      setReports(rs => rs.map(r => r._id === id ? { ...r, upvotes: data.upvotes } : r));
      setUpvotedIds(prev => {
        const next = new Set(prev);
        data.upvoted ? next.add(id) : next.delete(id);
        return next;
      });
    } catch {} finally {
      setUpvoting(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="section-header animate-in">
          <div className="section-tag">📋 Citizen Reports</div>
          <h1 className="section-title">Public Issue Reports</h1>
          <p className="section-subtitle">
            Browse approved citizen reports from across India. Upvote the issues that matter most to amplify their impact.
          </p>
        </div>

        {/* Filters */}
        <div className="card glass" style={{ padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ flex: 1, minWidth: 200, marginBottom: 0 }}
            placeholder="🔍 Search by city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-select"
            style={{ width: 200, marginBottom: 0 }}
            value={filter.category}
            onChange={e => { setFilter(f => ({ ...f, category: e.target.value })); setPage(1); }}
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {total} report{total !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Category quick-filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          <button
            onClick={() => { setFilter(f => ({ ...f, category: '' })); setPage(1); }}
            style={{
              padding: '6px 16px', borderRadius: 100, border: `1px solid ${!filter.category ? 'var(--saffron)' : 'var(--border)'}`,
              background: !filter.category ? 'rgba(255,153,51,0.12)' : 'transparent',
              color: !filter.category ? 'var(--saffron)' : 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => { setFilter(f => ({ ...f, category: c })); setPage(1); }}
              style={{
                padding: '6px 16px', borderRadius: 100,
                border: `1px solid ${filter.category === c ? CAT_COLORS[c] : 'var(--border)'}`,
                background: filter.category === c ? `${CAT_COLORS[c]}18` : 'transparent',
                color: filter.category === c ? CAT_COLORS[c] : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500,
              }}
            >
              {CAT_EMOJIS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports grid */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading reports...</span></div>
        ) : reports.length === 0 ? (
          <div className="card glass" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No reports found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              {filter.category || search ? 'Try clearing your filters.' : 'Be the first to report an urban issue!'}
            </p>
            <Link href="/report" className="btn btn-primary">📋 File a Report</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {reports.map((r, i) => (
              <div
                key={r._id}
                className="card glass"
                style={{
                  borderLeft: `4px solid ${CAT_COLORS[r.category] || '#999'}`,
                  animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}
              >
                {/* Image */}
                {r.images?.[0] && (
                  <img
                    src={`${API_URL}${r.images[0]}`}
                    alt={r.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, display: 'block' }}
                  />
                )}

                {/* Category + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                    background: `${CAT_COLORS[r.category] || '#999'}18`,
                    color: CAT_COLORS[r.category] || '#999',
                    border: `1px solid ${CAT_COLORS[r.category] || '#999'}30`,
                  }}>
                    {CAT_EMOJIS[r.category] || '📌'} {r.category}
                  </span>
                  {r.images?.length > 1 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🖼️ {r.images.length} photos
                    </span>
                  )}
                </div>

                {/* Title & description */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{r.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {r.description?.slice(0, 130)}{r.description?.length > 130 ? '...' : ''}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📍 {r.city}, {r.state}</span>
                  {r.locality && <span>• {r.locality}</span>}
                  <span>📅 {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {r.userId?.name && <span>👤 {r.userId.name}</span>}
                </div>

                {/* Upvote */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => handleUpvote(r._id)}
                    disabled={upvoting === r._id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                      background: upvotedIds.has(r._id) ? 'rgba(255,153,51,0.15)' : 'var(--surface-2)',
                      color: upvotedIds.has(r._id) ? 'var(--saffron)' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}
                    title={loggedIn ? 'Upvote this report' : 'Login to upvote'}
                  >
                    {upvotedIds.has(r._id) ? '▲' : '△'} {r.upvotes || 0} Upvote{r.upvotes !== 1 ? 's' : ''}
                  </button>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {r.images?.length || 0} 📷
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(n);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
                      background: page === item ? 'var(--saffron)' : 'var(--surface-2)',
                      color: page === item ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}

        {/* CTA */}
        {!loggedIn && (
          <div className="card glass" style={{ textAlign: 'center', padding: '40px 32px', marginTop: 48, background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(18,136,7,0.06))' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🇮🇳</div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Spot an Issue in Your City?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>
              Register for free and start making your city better, one report at a time.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn btn-primary btn-lg">🚀 Join Now</Link>
              <Link href="/login" className="btn btn-secondary btn-lg">🔓 Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
