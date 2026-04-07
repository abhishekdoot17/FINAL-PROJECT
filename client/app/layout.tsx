import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Urban Awareness — Raising Voices for Indian Cities',
  description: 'Report urban problems, explore statistics, and learn about government initiatives tackling pollution, traffic, waste, housing, and infrastructure issues across Indian cities.',
  keywords: 'urban problems India, pollution, traffic congestion, waste management, smart cities, Swachh Bharat',
  openGraph: {
    title: 'Urban Awareness',
    description: 'A platform for citizens to report and track urban problems in India.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '70px', minHeight: '100vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
