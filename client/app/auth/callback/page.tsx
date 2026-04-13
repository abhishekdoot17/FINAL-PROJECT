'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      let msg = 'Google sign-in failed.';
      if (error === 'google_not_configured') msg = 'Google sign-in is not configured yet.';
      router.replace(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    // Fetch user profile with the token
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          localStorage.setItem('ua_token', token);
          localStorage.setItem('ua_user', JSON.stringify(data.user));
          router.replace(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'));
  }, []);

  return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Signing you in with Google...</span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
      <CallbackHandler />
    </Suspense>
  );
}
