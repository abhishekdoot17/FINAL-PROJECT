'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { issuesApi } from '@/lib/api';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.getOne(id)
      .then(d => setIssue(d.issue))
      .catch(() => router.push('/issues'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /><span>Loading...</span></div>;
  if (!issue) return null;

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: '64px 0',
        background: `linear-gradient(135deg, ${issue.color}18, transparent)`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container animate-in">
          <Link href="/issues" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back to Issues
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 88, height: 88, borderRadius: 20, flexShrink: 0,
              background: `${issue.color}22`, border: `2px solid ${issue.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
            }}>
              {issue.emoji}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: issue.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Urban Issue</div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)', marginBottom: 8 }}>{issue.title}</h1>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: "'Noto Sans Devanagari', serif" }}>
                {issue.titleHi}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
          {/* Main */}
          <div>
            {/* Description */}
            <div className="card glass" style={{ marginBottom: 28 }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Overview</h2>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>{issue.description}</p>
              <p style={{ marginTop: 16, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '0.95rem' }}>
                {issue.descriptionHi}
              </p>
            </div>

            {/* Stats */}
            <div className="card glass" style={{ marginBottom: 28 }}>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Key Statistics</h2>
              <div className="grid-2">
                {issue.stats?.map((stat: any, i: number) => (
                  <div key={i} style={{
                    padding: '20px', borderRadius: 10,
                    background: `${issue.color}10`, border: `1px solid ${issue.color}25`,
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: issue.color, marginBottom: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Causes & Solutions */}
            <div className="grid-2" style={{ gap: 24 }}>
              <div className="card glass">
                <h3 style={{ color: 'var(--error)', marginBottom: 16 }}>⚡ Root Causes</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {issue.causes?.map((c: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--error)', marginTop: 2 }}>✗</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card glass">
                <h3 style={{ color: 'var(--success)', marginBottom: 16 }}>✅ Solutions</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {issue.solutions?.map((s: string, i: number) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--success)', marginTop: 2 }}>✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card glass" style={{ borderTop: `4px solid ${issue.color}` }}>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>🏛️ Government Scheme</h3>
              <p style={{ fontWeight: 600, color: 'var(--saffron)', marginBottom: 12 }}>{issue.govtScheme}</p>
              <a href={issue.govtUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Visit Official Site →
              </a>
            </div>
            <div className="card glass">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>📋 Report This Issue</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Spotted a related problem in your city? Report it and help drive civic action.
              </p>
              <Link href={`/report?category=${issue.id}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                File a Report
              </Link>
            </div>
            <div className="card glass">
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>🔗 All Issues</h3>
              <Link href="/issues" style={{ color: 'var(--saffron)', fontSize: '0.9rem' }}>← Back to all urban issues</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
