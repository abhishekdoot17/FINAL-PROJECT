'use client';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: 'Very weak', color: '#ef4444' };
  if (score === 2) return { score, label: 'Weak', color: '#f97316' };
  if (score === 3) return { score, label: 'Fair', color: '#f59e0b' };
  if (score === 4) return { score, label: 'Strong', color: '#22c55e' };
  return { score, label: 'Very strong', color: '#16a34a' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', city: '', state: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [googleAvailable, setGoogleAvailable] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/google/status`)
      .then(r => r.json())
      .then(d => setGoogleAvailable(d.configured))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const validate = (field: string, value: string, allForm = form) => {
    if (field === 'name') {
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      if (value.trim().length > 50) return 'Name must be under 50 characters';
    }
    if (field === 'email') {
      if (!value) return 'Email is required';
      if (!validateEmail(value)) return 'Enter a valid email address';
    }
    if (field === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
    }
    if (field === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (value !== allForm.password) return 'Passwords do not match';
    }
    return '';
  };

  const handleChange = (field: string, value: string) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    if (touched[field]) {
      setErrors(e => ({ ...e, [field]: validate(field, value, newForm) }));
    }
    // Re-validate confirmPassword when password changes
    if (field === 'password' && touched.confirmPassword) {
      setErrors(e => ({ ...e, confirmPassword: validate('confirmPassword', newForm.confirmPassword, newForm) }));
    }
    setServerError('');
  };

  const handleBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(e => ({ ...e, [field]: validate(field, form[field as keyof typeof form]) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fields = ['name', 'email', 'password', 'confirmPassword'];
    const newTouched = fields.reduce((a, f) => ({ ...a, [f]: true }), {});
    setTouched(t => ({ ...t, ...newTouched }));
    const newErrors = fields.reduce((a, f) => ({ ...a, [f]: validate(f, form[f as keyof typeof form]) }), {});
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setServerError('');
    try {
      const { confirmPassword, ...body } = form;
      const data = await authApi.register(body);
      localStorage.setItem('ua_token', data.token);
      localStorage.setItem('ua_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed.');
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

  const strength = form.password ? getPasswordStrength(form.password) : null;

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,153,51,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 500 }} className="animate-in">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚀</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Join Urban Awareness
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Create your free account and start making a difference
          </p>
        </div>

        <div className="card glass" style={{ padding: '36px 32px' }}>
          {/* Google Sign Up */}
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
              transition: 'all 0.2s', marginBottom: 20, opacity: googleAvailable ? 1 : 0.6,
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                id="reg-name" type="text" className="form-input" placeholder="Rahul Sharma"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                style={{ borderColor: errors.name && touched.name ? 'var(--error)' : undefined }}
              />
              {errors.name && touched.name && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                id="reg-email" type="email" className="form-input" placeholder="rahul@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                autoComplete="email"
                style={{ borderColor: errors.email && touched.email ? 'var(--error)' : undefined }}
              />
              {errors.email && touched.email && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44, borderColor: errors.password && touched.password ? 'var(--error)' : undefined }}
                />
                <button
                  type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 0 }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength bar */}
              {form.password && strength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'var(--surface-3)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}

              {errors.password && touched.password && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem', display: 'block', marginTop: 4 }}>⚠ {errors.password}</span>
              )}

              {/* Requirements checklist */}
              {(touched.password || form.password) && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    { rule: form.password.length >= 6, label: 'At least 6 characters' },
                    { rule: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
                    { rule: /[0-9]/.test(form.password), label: 'One number' },
                  ].map(({ rule, label }) => (
                    <span key={label} style={{ fontSize: '0.75rem', color: rule ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {rule ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password <span style={{ color: 'var(--error)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44, borderColor: errors.confirmPassword && touched.confirmPassword ? 'var(--error)' : form.confirmPassword && form.confirmPassword === form.password ? 'var(--success)' : undefined }}
                />
                <button
                  type="button" onClick={() => setShowConfirm(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 0 }}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {errors.confirmPassword}</span>
              )}
              {!errors.confirmPassword && form.confirmPassword && form.confirmPassword === form.password && (
                <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ Passwords match</span>
              )}
            </div>

            {/* City + State */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-city">City <span style={{ color: 'var(--text-muted)', fontSize:'0.75rem' }}>(optional)</span></label>
                <input
                  id="reg-city" type="text" className="form-input" placeholder="Mumbai"
                  value={form.city} onChange={e => handleChange('city', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-state">State</label>
                <select id="reg-state" className="form-select" value={form.state} onChange={e => handleChange('state', e.target.value)}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : '✅ Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--saffron)', fontWeight: 600 }}>Sign in →</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          By registering, you agree to use this platform responsibly and truthfully.
        </p>
      </div>
    </div>
  );
}
