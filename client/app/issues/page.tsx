'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { issuesApi } from '@/lib/api';

const COLORS: Record<string, string> = {
  pollution: '#ef4444', traffic: '#f97316', waste: '#84cc16',
  housing: '#8b5cf6', infrastructure: '#06b6d4', overcrowding: '#ec4899',
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.getAll()
      .then(d => setIssues(d.issues || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section">
      <div className="container">
        <div className="section-header animate-in">
          <div className="section-tag">Urban Crisis India</div>
          <h1 className="section-title">Urban Issues Facing India</h1>
          <p className="section-subtitle">
            Deep-dive into the systemic problems plaguing India's rapidly growing cities — with data, causes, solutions, and government schemes.
          </p>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /><span>Loading issues...</span></div>
        ) : (
          <div style={{ display: 'grid', gap: 28 }}>
            {issues.map((issue, i) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                style={{ textDecoration: 'none', animation: `fadeIn 0.5s ease ${i * 0.07}s both`, display: 'block' }}
              >
                <div className="card glass glass-hover" style={{
                  display: 'flex', gap: 28, alignItems: 'flex-start',
                  borderLeft: `5px solid ${COLORS[issue.id] || '#ff9933'}`,
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                    background: `${COLORS[issue.id] || '#ff9933'}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem',
                  }}>
                    {issue.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{issue.title}</h2>
                      <span style={{ color: COLORS[issue.id], fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {issue.titleHi}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                      {issue.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        📋 Scheme: <strong style={{ color: 'var(--text-secondary)' }}>{issue.govtScheme}</strong>
                      </span>
                      <span style={{ color: COLORS[issue.id] || 'var(--saffron)', fontWeight: 600, fontSize: '0.9rem' }}>
                        View details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
