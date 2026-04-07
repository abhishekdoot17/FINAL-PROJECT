'use client';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, reportsApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CAT_COLORS: Record<string, string> = {
  pollution: '#ef4444', traffic: '#f97316', waste: '#84cc16',
  housing: '#8b5cf6', infrastructure: '#06b6d4', overcrowding: '#ec4899', other: '#94a3b8',
};
const CAT_EMOJIS: Record<string, string> = {
  pollution: '🏭', traffic: '🚗', waste: '🗑️',
  housing: '🏚️', infrastructure: '🏗️', overcrowding: '👥', other: '📌',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reports' | 'profile'>('reports');
  const [profileForm, setProfileForm] = useState({ name: '', city: '', state: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
  ];

  useEffect(() => {
    const stored = localStorage.getItem('ua_user');
    const token = localStorage.getItem('ua_token');
    if (!stored || !token) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setProfileForm({ name: u.name || '', city: u.city || '', state: u.state || '', bio: u.bio || '' });
    reportsApi.getMy()
      .then(d => setReports(d.reports || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await reportsApi.delete(id);
      setReports(r => r.filter(rep => rep._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg('');
    try {
      const data = await authApi.updateProfile(profileForm);
      const updated = { ...user, ...data.user };
      setUser(updated);
      localStorage.setItem('ua_user', JSON.stringify(updated));
      setProfileMsg('Profile updated successfully!');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }); } catch {}
    localStorage.removeItem('ua_user');
    localStorage.removeItem('ua_token');
    router.push('/');
  };

  if (!user) return null;

  const approved = reports.filter(r => r.status === 'approved').length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const rejected = reports.filter(r => r.status === 'rejected').length;

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="animate-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--saffron), var(--saffron-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 12,
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Welcome, {user.name?.split(' ')[0]}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user.city && user.state ? `${user.city}, ${user.state}` : user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/report" className="btn btn-primary">📋 New Report</Link>
            {user.role === 'admin' && <Link href="/admin" className="btn btn-secondary">⚙️ Admin Panel</Link>}
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 36 }}>
          {[
            { label: 'Total Reports', value: reports.length, icon: '📋', color: 'var(--saffron)' },
            { label: 'Approved', value: approved, icon: '✅', color: 'var(--success)' },
            { label: 'Pending Review', value: pending, icon: '⏳', color: 'var(--warning)' },
            { label: 'Rejected', value: rejected, icon: '❌', color: 'var(--error)' },
          ].map(s => (
            <div key={s.label} className="card glass" style={{ textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {(['reports', 'profile'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.95rem', fontWeight: 600, borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                background: tab === t ? 'var(--surface-2)' : 'transparent',
                color: tab === t ? 'var(--saffron)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--saffron)' : '2px solid transparent',
              }}
            >
              {t === 'reports' ? '📋 My Reports' : '👤 Profile'}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {tab === 'reports' && (
          loading ? (
            <div className="loading-page"><div className="spinner" /><span>Loading reports...</span></div>
          ) : reports.length === 0 ? (
            <div className="card glass" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No reports yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Start making a difference by reporting urban issues in your city.</p>
              <Link href="/report" className="btn btn-primary">📋 File Your First Report</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reports.map(r => (
                <div key={r._id} className="card glass" style={{ borderLeft: `4px solid ${CAT_COLORS[r.category] || '#999'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span>{CAT_EMOJIS[r.category] || '📌'}</span>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>{r.title}</h3>
                        <StatusBadge status={r.status} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
                        {r.description?.slice(0, 160)}{r.description?.length > 160 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>📍 {r.city}, {r.state}</span>
                        <span>📅 {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {r.images?.length > 0 && <span>🖼️ {r.images.length} photo{r.images.length > 1 ? 's' : ''}</span>}
                      </div>
                      {r.adminNote && (
                        <div className="alert alert-info" style={{ marginTop: 10, fontSize: '0.82rem' }}>
                          <strong>Admin note:</strong> {r.adminNote}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      {r.images?.[0] && (
                        <img
                          src={`${API_URL}${r.images[0]}`}
                          alt="report"
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                        />
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                      >
                        {deleting === r._id ? '...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card glass" style={{ maxWidth: 560, padding: '32px' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 24 }}>Edit Profile</h2>
            {profileMsg && (
              <div className={`alert ${profileMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{profileMsg}</div>
            )}
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input id="profile-name" type="text" className="form-input" value={profileForm.name}
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} minLength={2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-city">City</label>
                  <input id="profile-city" type="text" className="form-input" placeholder="Mumbai" value={profileForm.city}
                    onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-state">State</label>
                  <select id="profile-state" className="form-select" value={profileForm.state}
                    onChange={e => setProfileForm(f => ({ ...f, state: e.target.value }))}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-bio">Bio</label>
                <textarea id="profile-bio" className="form-textarea" placeholder="Tell us about yourself..." value={profileForm.bio}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} maxLength={200} style={{ minHeight: 80 }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 20 }}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
