import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>🇮🇳 Urban<span>Awareness</span></div>
          <p>Raising voices for cleaner, smarter, and more livable Indian cities.</p>
          <div className={styles.strip}>
            <span style={{background:'#ff9933'}}></span>
            <span style={{background:'#ffffff'}}></span>
            <span style={{background:'#128807'}}></span>
          </div>
        </div>

        <div className={styles.links}>
          <h4>Explore</h4>
          <Link href="/issues">Urban Issues</Link>
          <Link href="/initiatives">Gov. Initiatives</Link>
          <Link href="/report">Report an Issue</Link>
        </div>

        <div className={styles.links}>
          <h4>Account</h4>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>

        <div className={styles.links}>
          <h4>Resources</h4>
          <a href="https://smartcities.gov.in" target="_blank" rel="noopener noreferrer">Smart Cities Mission</a>
          <a href="https://sbmurban.org" target="_blank" rel="noopener noreferrer">Swachh Bharat</a>
          <a href="https://amrut.gov.in" target="_blank" rel="noopener noreferrer">AMRUT</a>
          <a href="https://pmay-urban.gov.in" target="_blank" rel="noopener noreferrer">PMAY Urban</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} Urban Awareness · Made with ❤️ for India</p>
          <p className={styles.disclaimer}>Data sourced from government reports and publicly available statistics.</p>
        </div>
      </div>
    </footer>
  );
}
