'use client';
import Link from 'next/link';

const SCHEMES = [
  {
    id: 'ncap', emoji: '💨', color: '#ef4444',
    category: 'pollution',
    title: 'National Clean Air Programme (NCAP)',
    ministry: 'Ministry of Environment, Forest & Climate Change',
    goal: 'Reduce PM2.5 and PM10 concentrations by 40% by 2026',
    description: 'NCAP is India\'s first national framework for air quality management. It targets 131 non-attainment cities with tailored city action plans, real-time monitoring networks, and industry emission controls.',
    highlights: ['131 cities covered', '₹10,566 crore allocated', 'Real-time AQI monitoring', 'EV promotion subsidies'],
    url: 'https://moef.gov.in/en/division/environment-divisions-currently-in-deas/cpch/national-clean-air-programme/',
    year: 2019,
  },
  {
    id: 'sbm', emoji: '♻️', color: '#84cc16',
    category: 'waste',
    title: 'Swachh Bharat Mission (Urban) 2.0',
    ministry: 'Ministry of Housing and Urban Affairs',
    goal: 'Make all cities garbage-free and open-defecation-free by 2026',
    description: 'SBM Urban 2.0 focuses on complete faecal sludge management, waste water treatment, source segregation of solid waste, and reduction of single-use plastic across all urban local bodies.',
    highlights: ['4,372 ULBs covered', 'Source segregation mandate', 'Waste-to-wealth projects', '₹1.41 lakh crore outlay'],
    url: 'https://sbmurban.org/',
    year: 2021,
  },
  {
    id: 'pmay', emoji: '🏠', color: '#8b5cf6',
    category: 'housing',
    title: 'Pradhan Mantri Awas Yojana (Urban)',
    ministry: 'Ministry of Housing and Urban Affairs',
    goal: 'Provide affordable housing to all urban homeless by 2024',
    description: 'PMAY-U aims to address urban housing shortage through in-situ slum rehabilitation, credit-linked subsidy, affordable housing in partnership, and beneficiary-led construction.',
    highlights: ['1.18 crore homes sanctioned', '₹2.03 lakh crore investment', 'EWS/LIG focus', 'Credit-linked subsidy'],
    url: 'https://pmay-urban.gov.in/',
    year: 2015,
  },
  {
    id: 'amrut', emoji: '💧', color: '#06b6d4',
    category: 'infrastructure',
    title: 'AMRUT 2.0',
    ministry: 'Ministry of Housing and Urban Affairs',
    goal: 'Provide 100% tap water and sewer connections in urban areas',
    description: 'Atal Mission for Rejuvenation and Urban Transformation 2.0 provides mission-mode support to all cities for water and sewer connections, enhancing urban green and blue spaces, and making cities water-secure.',
    highlights: ['500 AMRUT cities', '₹2.77 lakh crore outlay', '2.68 crore connections', 'Water audit system'],
    url: 'https://amrut.gov.in/',
    year: 2021,
  },
  {
    id: 'smart', emoji: '🏙️', color: '#f97316',
    category: 'infrastructure',
    title: 'Smart Cities Mission',
    ministry: 'Ministry of Housing and Urban Affairs',
    goal: 'Develop 100 smart cities with cutting-edge infrastructure and services',
    description: 'SCM promotes cities with smart solutions for mobility, housing, energy, water, sanitation, and governance. Cities are chosen through "City Challenge" competitions and receive central funding for integrated infrastructure.',
    highlights: ['100 selected cities', '₹2.05 lakh crore projects', 'Integrated Command Centres', 'Smart transport & Wi-Fi'],
    url: 'https://smartcities.gov.in/',
    year: 2015,
  },
  {
    id: 'utp', emoji: '🚇', color: '#ec4899',
    category: 'traffic',
    title: 'National Urban Transport Policy',
    ministry: 'Ministry of Housing and Urban Affairs',
    goal: 'Move people, not vehicles — equitable and sustainable urban mobility',
    description: 'NUTP encourages multi-modal public transport integration, focus on Non-Motorized Transport (cycling, walking), metro rail expansion, BRT systems, and intelligent traffic management systems.',
    highlights: ['Metro in 20+ cities', 'NMT infrastructure fund', 'BRT corridors', 'FAME EV subsidy scheme'],
    url: 'https://mohua.gov.in/content/national-urban-transport-policy',
    year: 2006,
  },
];

export default function InitiativesPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="section-header animate-in">
          <div className="section-tag">🏛️ Government Action</div>
          <h1 className="section-title">Government Initiatives & Schemes</h1>
          <p className="section-subtitle">
            Explore India's flagship urban development programs — what they promise, what they've achieved, and how you can benefit.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 28 }}>
          {SCHEMES.map((scheme, i) => (
            <div
              key={scheme.id}
              className="card glass"
              style={{ borderLeft: `5px solid ${scheme.color}`, animation: `fadeIn 0.5s ease ${i * 0.07}s both` }}
            >
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{
                  width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                  background: `${scheme.color}18`, border: `2px solid ${scheme.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                }}>
                  {scheme.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{scheme.title}</h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                      Since {scheme.year}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: scheme.color, fontWeight: 600, marginBottom: 8 }}>
                    {scheme.ministry}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Goal:</strong> {scheme.goal}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    {scheme.description}
                  </p>

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {scheme.highlights.map((h, j) => (
                      <span key={j} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500,
                        background: `${scheme.color}12`, color: scheme.color,
                        border: `1px solid ${scheme.color}30`,
                      }}>
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href={scheme.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                      Visit Official Portal →
                    </a>
                    <Link href={`/report?category=${scheme.category}`} className="btn btn-sm btn-secondary">
                      📋 Report a Related Issue
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card glass" style={{ marginTop: 48, textAlign: 'center', padding: '48px 32px', background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(18,136,7,0.06))' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>💡</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>See the Gap Between Promise & Reality?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 28px' }}>
            If government schemes aren't reaching your locality, report it. Your voice creates accountability.
          </p>
          <Link href="/report" className="btn btn-primary btn-lg">📋 File a Report Now</Link>
        </div>
      </div>
    </div>
  );
}
