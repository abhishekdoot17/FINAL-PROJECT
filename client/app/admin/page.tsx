'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

const CAT_COLORS: Record<string, string> = {
  pollution: '#ef4444', traffic: '#f97316', waste: '#84cc16',
  housing: '#8b5cf6', infrastructure: '#06b6d4', overcrowding: '#ec4899', other: '#94a3b8',
};
const CAT_EMOJIS: Record<string, string> = {
  pollution: '🏭', traffic: '🚗', waste: '🗑️',
  housing: '🏚️', infrastructure: '🏗️', overcrowding: '👥', other: '📌',
};

function Badge({ type }: { type: string }) {
  const cls = type === 'approved' ? 'badge-approved' : type === 'rejected' ? 'badge-rejected' : type === 'pending' ? 'badge-pending' : type === 'admin' ? 'badge-admin' : 'badge-user';
  return <span className={`badge ${cls}`}>{type}</span>;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'reports' | 'users'>('overview');

  // Reports
  const [reports, setReports] = useState<any[]>([]);
  const [repTotal, setRepTotal] = useState(0);
  const [repPage, setRepPage] = useState(1);
  const [repFilter, setRepFilter] = useState({ status: '', category: '', search: '' });
  const [repLoading, setRepLoading] = useState(false);
  const [updatingRep, setUpdatingRep] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usrTotal, setUsrTotal] = useState(0);
  const [usrPage, setUsrPage] = useState(1);
  const [usrSearch, setUsrSearch] = useState('');
  const [usrLoading, setUsrLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ua_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin') { router.push('/dashboard'); return; }
    adminApi.getStats().then(setStats).catch(() => router.push('/dashboard'));
  }, []);

  useEffect(() => {
    if (tab !== 'reports') return;
    setRepLoading(true);
    const params: any = { page: String(repPage), limit: '12' };
    if (repFilter.status) params.status = repFilter.status;
    if (repFilter.category) params.category = repFilter.category;
    if (repFilter.search) params.search = repFilter.search;
    adminApi.getReports(params)
      .then(d => { setReports(d.reports || []); setRepTotal(d.total || 0); })
      .finally(() => setRepLoading(false));
  }, [tab, repPage, repFilter]);

  useEffect(() => {
    if (tab !== 'users') return;
    setUsrLoading(true);
    const params: any = { page: String(usrPage), limit: '15' };
    if (usrSearch) params.search = usrSearch;
    adminApi.getUsers(params)
      .then(d => { setUsers(d.users || []); setUsrTotal(d.total || 0); })
      .finally(() => setUsrLoading(false));
  }, [tab, usrPage, usrSearch]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    setUpdatingRep(id);
    try {
      await adminApi.updateReportStatus(id, status, note);
      setReports(rs => rs.map(r => r._id === id ? { ...r, status } : r));
    } finally { setUpdatingRep(null); }
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Permanently delete this report?')) return;
    await adminApi.deleteReport(id);
    setReports(rs => rs.filter(r => r._id !== id));
    setRepTotal(t => t - 1);
  };

  const updateRole = async (id: string, role: string) => {
    await adminApi.updateUserRole(id, role);
    setUsers(us => us.map(u => u._id === id ? { ...u, role } : u));
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete user and all their reports?')) return;
    await adminApi.deleteUser(id);
    setUsers(us => us.filter(u => u._id !== id));
    setUsrTotal(t => t - 1);
  };

  if (!stats) return <div className="loading-page"><div className="spinner" /><span>Loading admin panel...</span></div>;

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="animate-in" style={{ marginBottom: 36 }}>
          <div className="section-tag">⚙️ Admin Panel</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 12, marginBottom: 4 }}>
            Urban Awareness Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage reports, users, and platform activity.</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 36 }}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'var(--info)' },
            { label: 'Total Reports', value: stats.totalReports, icon: '📋', color: 'var(--saffron)' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'var(--warning)' },
            { label: 'Approved', value: stats.approved, icon: '✅', color: 'var(--success)' },
            { label: 'Rejected', value: stats.rejected, icon: '❌', color: 'var(--error)' },
          ].map(s => (
            <div key={s.label} className="card glass" style={{ textAlign: 'center', borderTop: `3px solid ${s.color}`, padding: '20px 12px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {tab === 'overview' && stats.categoryStats?.length > 0 && (
          <div className="card glass" style={{ marginBottom: 28 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Reports by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.categoryStats.map((c: any) => {
                const pct = Math.round((c.count / stats.totalReports) * 100);
                return (
                  <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 120, fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {CAT_EMOJIS[c._id] || '📌'} {c._id}
                    </span>
                    <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: CAT_COLORS[c._id] || '#999', borderRadius: 4, transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ width: 60, fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>
                      {c.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {(['overview', 'reports', 'users'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.9rem', fontWeight: 600, borderRadius: '8px 8px 0 0',
              background: tab === t ? 'var(--surface-2)' : 'transparent',
              color: tab === t ? 'var(--saffron)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--saffron)' : '2px solid transparent',
            }}>
              {t === 'overview' ? '📊 Overview' : t === 'reports' ? '📋 Reports' : '👥 Users'}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="card glass">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Recent Reports</h3>
            {stats.recentReports?.slice(0, 5).map((r: any) => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{r.title}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    by {r.userId?.name || 'Anonymous'} · {r.city} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <Badge type={r.status} />
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTS TAB ── */}
        {tab === 'reports' && (
          <div>
            {/* Filters */}
            <div className="card glass" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input className="form-input" style={{ flex: 1, minWidth: 200, marginBottom: 0 }} placeholder="🔍 Search title or city..."
                value={repFilter.search} onChange={e => { setRepFilter(f => ({ ...f, search: e.target.value })); setRepPage(1); }} />
              <select className="form-select" style={{ width: 160, marginBottom: 0 }}
                value={repFilter.status} onChange={e => { setRepFilter(f => ({ ...f, status: e.target.value })); setRepPage(1); }}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select className="form-select" style={{ width: 180, marginBottom: 0 }}
                value={repFilter.category} onChange={e => { setRepFilter(f => ({ ...f, category: e.target.value })); setRepPage(1); }}>
                <option value="">All categories</option>
                {Object.keys(CAT_EMOJIS).map(c => <option key={c} value={c}>{CAT_EMOJIS[c]} {c}</option>)}
              </select>
            </div>

            {repLoading ? (
              <div className="loading-page"><div className="spinner" /></div>
            ) : reports.length === 0 ? (
              <div className="card glass" style={{ textAlign: 'center', padding: 40 }}>No reports found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reports.map(r => (
                  <div key={r._id} className="card glass" style={{ borderLeft: `4px solid ${CAT_COLORS[r.category] || '#999'}`, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span>{CAT_EMOJIS[r.category]}</span>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{r.title}</strong>
                          <Badge type={r.status} />
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                          {r.description?.slice(0, 120)}{r.description?.length > 120 ? '...' : ''}
                        </p>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                          <span>👤 {r.userId?.name || 'Unknown'} ({r.userId?.email})</span>
                          <span>📍 {r.city}, {r.state}</span>
                          <span>📅 {new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                        {r.status !== 'approved' && (
                          <button className="btn btn-sm btn-success"
                            disabled={updatingRep === r._id}
                            onClick={() => updateStatus(r._id, 'approved')}>
                            ✅ Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button className="btn btn-sm btn-danger"
                            disabled={updatingRep === r._id}
                            onClick={() => updateStatus(r._id, 'rejected')}>
                            ❌ Reject
                          </button>
                        )}
                        {r.status !== 'pending' && (
                          <button className="btn btn-sm btn-secondary"
                            disabled={updatingRep === r._id}
                            onClick={() => updateStatus(r._id, 'pending')}>
                            ⏳ Pending
                          </button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => deleteReport(r._id)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {repTotal > 12 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary btn-sm" disabled={repPage === 1} onClick={() => setRepPage(p => p - 1)}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Page {repPage} of {Math.ceil(repTotal / 12)}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={repPage >= Math.ceil(repTotal / 12)} onClick={() => setRepPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <div className="card glass" style={{ padding: '16px 20px', marginBottom: 20 }}>
              <input className="form-input" placeholder="🔍 Search by name or email..."
                value={usrSearch} onChange={e => { setUsrSearch(e.target.value); setUsrPage(1); }} style={{ marginBottom: 0 }} />
            </div>

            {usrLoading ? (
              <div className="loading-page"><div className="spinner" /></div>
            ) : (
              <div className="card glass" style={{ overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                      {['Name', 'Email', 'Location', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                            }}>{u.name?.[0]?.toUpperCase()}</div>
                            {u.name}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{[u.city, u.state].filter(Boolean).join(', ') || '—'}</td>
                        <td style={{ padding: '12px 16px' }}><Badge type={u.role} /></td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => updateRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                            >
                              {u.role === 'admin' ? '👤 Make User' : '⚙️ Make Admin'}
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {usrTotal > 15 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary btn-sm" disabled={usrPage === 1} onClick={() => setUsrPage(p => p - 1)}>← Prev</button>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Page {usrPage} of {Math.ceil(usrTotal / 15)}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={usrPage >= Math.ceil(usrTotal / 15)} onClick={() => setUsrPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
