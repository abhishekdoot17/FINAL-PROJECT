'use client';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { reportsApi } from '@/lib/api';

const CATEGORIES = [
  { value: 'pollution', label: '🏭 Air & Water Pollution' },
  { value: 'traffic', label: '🚗 Traffic Congestion' },
  { value: 'waste', label: '🗑️ Waste Management' },
  { value: 'housing', label: '🏚️ Housing & Slums' },
  { value: 'infrastructure', label: '🏗️ Infrastructure Gaps' },
  { value: 'overcrowding', label: '👥 Overcrowding' },
  { value: 'other', label: '📌 Other' },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

export default function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: searchParams.get('category') || '',
    city: '',
    state: '',
    locality: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ua_user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm(f => ({ ...f, city: u.city || '', state: u.state || '' }));
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 5);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (i: number) => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.description.length < 20) { setError('Description must be at least 20 characters.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach(f => fd.append('images', f));
      await reportsApi.create(fd);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card glass animate-in" style={{ textAlign: 'center', maxWidth: 480, padding: '48px 36px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ color: 'var(--success)', marginBottom: 12 }}>Report Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            Your report is pending admin review. Once approved, it will appear publicly on the platform.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn btn-primary">View My Reports</Link>
            <button className="btn btn-secondary" onClick={() => {
              setSuccess(false);
              setForm({ title: '', description: '', category: '', city: user?.city || '', state: user?.state || '', locality: '' });
              setFiles([]); setPreviews([]);
            }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="animate-in" style={{ marginBottom: 36 }}>
          <div className="section-tag">📋 Citizen Report</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 12, marginBottom: 8 }}>
            Report an Urban Issue
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Help hold authorities accountable. Your report — with photos and details — drives real civic action.
          </p>
        </div>

        <div className="card glass animate-in" style={{ padding: '36px 32px' }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="report-title">
                Title <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                id="report-title"
                type="text"
                className="form-input"
                placeholder="e.g. Broken road causing accidents near MG Road junction"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required minLength={5} maxLength={100}
              />
              <span className="form-label" style={{ marginTop: 4, display: 'block' }}>{form.title.length}/100</span>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="report-category">
                Category <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                id="report-category"
                className="form-select"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="report-desc">
                Description <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <textarea
                id="report-desc"
                className="form-textarea"
                placeholder="Describe the issue in detail — what's happening, how long it's been there, who's affected, and any previous complaints filed."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required minLength={20} maxLength={2000}
                style={{ minHeight: 140 }}
              />
              <span className="form-label" style={{ marginTop: 4, display: 'block' }}>{form.description.length}/2000 (min 20)</span>
            </div>

            {/* Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="report-city">City <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  id="report-city"
                  type="text"
                  className="form-input"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="report-state">State <span style={{ color: 'var(--error)' }}>*</span></label>
                <select
                  id="report-state"
                  className="form-select"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  required
                >
                  <option value="">State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="report-locality">Locality</label>
                <input
                  id="report-locality"
                  type="text"
                  className="form-input"
                  placeholder="Ward 12, Andheri"
                  value={form.locality}
                  onChange={e => setForm(f => ({ ...f, locality: e.target.value }))}
                />
              </div>
            </div>

            {/* Photos */}
            <div className="form-group">
              <label className="form-label">Photos (up to 5, max 5MB each)</label>
              <div
                style={{
                  border: '2px dashed var(--border)', borderRadius: 10,
                  padding: '28px', textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handleFiles({ target: { files: e.dataTransfer.files } } as any);
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--saffron)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click or drag photos here</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>JPEG, PNG, WEBP accepted</p>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
              </div>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                  {previews.map((p, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img
                        src={p} alt={`preview-${i}`}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--error)', border: 'none', color: '#fff',
                          fontSize: '0.7rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Submitting...</>
                : '📤 Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
