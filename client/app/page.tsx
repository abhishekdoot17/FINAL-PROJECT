'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { issuesApi, reportsApi } from '@/lib/api';

const ISSUE_COLORS: Record<string, string> = {
  pollution: '#ef4444',
  traffic: '#f97316',
  waste: '#84cc16',
  housing: '#8b5cf6',
  infrastructure: '#06b6d4',
  overcrowding: '#ec4899',
};

const HERO_STATS = [
  { label: 'Cities monitored', value: '500+', icon: '🏙️' },
  { label: 'Issues reported', value: '12K+', icon: '📋' },
  { label: 'Citizens engaged', value: '50K+', icon: '👥' },
  { label: 'Resolved cases', value: '3.2K+', icon: '✅' },
];

const TICKER_ITEMS = [
  '🏭 Delhi AQI crosses 400 — "Severe" category',
  '🚗 Bengaluru commuters lose 243 hours/year in traffic',
  '🗑️ India generates 1.5 lakh MT of solid waste daily',
  '🏚️ 65 million+ urban slum dwellers in India',
  '💧 Only 28% of sewage treated before release',
  '🛣️ 40%+ of urban roads in poor condition',
];

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [issues, setIssues] = useState<any[]>([]);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    issuesApi.getAll().then(d => setIssues(d.issues || [])).catch(() => {});
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ── TICKER ── */}
      <div style={{
        background: 'linear-gradient(90deg, var(--saffron-dark), var(--saffron))',
        padding: '8px 0',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fff', whiteSpace: 'nowrap', letterSpacing: '0.08em' }}>LIVE</span>
          <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{TICKER_ITEMS[tickerIdx]}</span>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 70% 50%, rgba(255,153,51,0.08) 0%, transparent 60%), var(--navy)',
      }}>
        {/* bg circles */}
        {[
          { w: 600, h: 600, top: '-200px', right: '-200px', color: 'rgba(255,153,51,0.05)' },
          { w: 400, h: 400, bottom: '-150px', left: '-150px', color: 'rgba(18,136,7,0.07)' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.w, height: c.h, borderRadius: '50%',
            background: c.color, ...c,
            animation: 'float 8s ease-in-out infinite',
            animationDelay: `${i * 2}s`,
          }} />
        ))}

        <div className="container animate-in" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <div className="section-tag">🇮🇳 For every Indian citizen</div>
            <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.08, marginBottom: 24 }}>
              Raise Your Voice for{' '}
              <span className="gradient-text">Better Cities</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 560, marginBottom: 40, lineHeight: 1.8 }}>
              Report urban problems, track government action, and join millions of citizens
              building a cleaner, smarter, and more equitable India.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/report" className="btn btn-primary btn-lg">📋 Report an Issue</Link>
              <Link href="/issues" className="btn btn-secondary btn-lg">🔍 Explore Issues</Link>
              <Link href="/reports" className="btn btn-outline btn-lg">📂 Browse Reports</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container">
          <div className="grid-4">
            {HERO_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--saffron)' }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ISSUES ── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Urban Crisis</div>
            <h2 className="section-title">Critical Issues Facing Indian Cities</h2>
            <p className="section-subtitle">From choking pollution to crumbling infrastructure — understand the problems shaping millions of lives.</p>
          </div>
          <div className="grid-3">
            {(issues.length ? issues : Array(6).fill(null)).map((issue, i) => (
              <div key={issue?.id || i} className="card glass glass-hover" style={{
                borderLeft: `4px solid ${issue ? ISSUE_COLORS[issue.id] || '#ff9933' : 'var(--border)'}`,
                cursor: 'pointer',
                animation: `fadeIn 0.5s ease ${i * 0.08}s both`,
              }}>
                {issue ? (
                  <Link href={`/issues/${issue.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{issue.emoji}</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>{issue.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      {issue.description?.slice(0, 120)}...
                    </p>
                    <span style={{ color: ISSUE_COLORS[issue.id] || 'var(--saffron)', fontSize: '0.85rem', fontWeight: 600 }}>
                      Learn more →
                    </span>
                  </Link>
                ) : (
                  <div className="shimmer-bg" style={{ height: 150, borderRadius: 8 }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/issues" className="btn btn-outline btn-lg">View All Urban Issues →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">How It Works</div>
            <h2 className="section-title">Your Voice, Amplified</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '📸', title: 'Document the Problem', desc: 'Spot an issue? Photograph it, describe it, and mark your city. Takes under 2 minutes.' },
              { icon: '📤', title: 'Submit Your Report', desc: 'Submit with full context — location, category, and photos. Our system queues it for review.' },
              { icon: '📣', title: 'Drive Change', desc: 'Approved reports go live publicly. Upvote, share, and track progress toward resolution.' },
            ].map((step, i) => (
              <div key={i} className="card glass" style={{ textAlign: 'center', padding: '40px 28px' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,153,51,0.12)', border: '2px solid rgba(255,153,51,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', margin: '0 auto 20px',
                }}>{step.icon}</div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--saffron)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, margin: '0 auto 16px',
                }}>{i + 1}</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, rgba(255,153,51,0.12), rgba(18,136,7,0.08))',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🇮🇳</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: 16 }}>
            Be the Change <span className="gradient-text">India Needs</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 36 }}>
            Register for free and start making your city better, one report at a time.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary btn-lg">🚀 Join Urban Awareness</Link>
            <Link href="/initiatives" className="btn btn-secondary btn-lg">🏛️ Gov. Initiatives</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
