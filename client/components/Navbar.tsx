'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('ua_user');
    if (stored) setUser(JSON.parse(stored));

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh user on route change
  useEffect(() => {
    const stored = localStorage.getItem('ua_user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    localStorage.removeItem('ua_user');
    localStorage.removeItem('ua_token');
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/issues', label: 'Urban Issues' },
    { href: '/reports', label: 'Reports' },
    { href: '/initiatives', label: 'Initiatives' },
    { href: '/report', label: 'Report Issue' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🇮🇳</span>
          <span>Urban<span className={styles.logoAccent}>Awareness</span></span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className={styles.userMenu}>
              {user.role === 'admin' && (
                <Link href="/admin" className={styles.link} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <Link href="/dashboard" className={styles.link} onClick={() => setMenuOpen(false)}>
                <span className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</span>
                {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className="btn btn-sm btn-secondary" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" className="btn btn-sm btn-primary" onClick={() => setMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={menuOpen ? styles.barOpen : ''}></span>
          <span className={menuOpen ? styles.barOpen : ''}></span>
          <span className={menuOpen ? styles.barOpen : ''}></span>
        </button>
      </div>
    </nav>
  );
}
