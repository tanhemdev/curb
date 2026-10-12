import './globals.css';
import { Providers } from '../components/Providers.jsx';
import Navbar from '../components/Navbar.jsx';
import DemoBanner from '../components/DemoBanner.jsx';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata = {
  title: 'Curb: move-out stuff, a few blocks away',
  description: 'A peer-to-peer marketplace for students moving out and moving in. List it, match it, hand it off within 72 hours.',
  manifest: `${base}/manifest.json`,
  icons: { icon: `${base}/icon.svg` },
};

export const viewport = { themeColor: '#e60023', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <DemoBanner />
          <main className="page">{children}</main>
          <footer className="foot">
            Curb keeps good stuff out of the landfill. <a href="https://github.com/tanhemdev/curb">Code on GitHub</a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
