import './globals.css';
import { Providers } from '../components/Providers.jsx';
import Navbar from '../components/Navbar.jsx';
import DemoBanner from '../components/DemoBanner.jsx';
import Logo from '../components/Logo.jsx';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata = {
  title: 'Curb: kick it to the curb, someone nearby wants it',
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
            <Logo size={28} />
            <p>
              Curb keeps good stuff off the actual curb and out of the landfill. Payments are handled by Stripe; Curb never sees card details.
            </p>
            <p>
              Built by Tanya Hemdev at UC Berkeley · <a href="https://github.com/tanhemdev/curb">Code on GitHub</a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
