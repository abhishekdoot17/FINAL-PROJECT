'use client';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');
  const [googleAvailable, setGoogleAvailable] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/google/status`)
      .then(r => r.json())
      .then(d => setGoogleAvailable(d.configured))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const validate = (field: string, value: string) => {
    if (field === 'email') {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Enter a valid email address';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
    }
    return '';
  };

  const handleChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) setErrors(e => ({ ...e, [field]: validate(field, value) }));
    setServerError('');
  };

  const handleBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validate(field, form[field as keyof typeof form]) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const emailErr = validate('email', form.email);
    const passErr = validate('password', form.password);
    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoading(true);
    setServerError('');
    try {
      const data = await authApi.login(form);
      localStorage.setItem('ua_token', data.token);
      localStorage.setItem('ua_user', JSON.stringify(data.user));
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!googleAvailable) {
      setServerError('Google sign-in is not configured yet. Please use email & password.');
      return;
    }
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,153,51,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="animate-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🇮🇳</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to your Urban Awareness account
          </p>
        </div>

        <div className="card glass" style={{ padding: '36px 32px' }}>
          {/* OAuth error from redirect */}
          {oauthError && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>{oauthError}</div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            type="button"
            disabled={!googleAvailable}
            title={!googleAvailable ? 'Google sign-in not configured' : 'Continue with Google'}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '12px 20px', borderRadius: 8,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: googleAvailable ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'inherit', fontSize: '0.95rem',
              fontWeight: 600, cursor: googleAvailable ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', marginBottom: 20,
              opacity: googleAvailable ? 1 : 0.6,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleAvailable ? 'Continue with Google' : 'Google Sign-in (Not Configured)'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {serverError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email" type="email" className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                style={{ borderColor: errors.email && touched.email ? 'var(--error)' : undefined }}
              />
              {errors.email && touched.email && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>⚠ {errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="current-password"
                  style={{ paddingRight: 44, borderColor: errors.password && touched.password ? 'var(--error)' : undefined }}
                />
                <button
                  type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 0 }}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && touched.password && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: 4, display: 'block' }}>⚠ {errors.password}</span>
              )}
            </div>

            <button
              type="submit" className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : '🔓 Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Create one free →</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By signing in, you agree to use this platform responsibly.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
