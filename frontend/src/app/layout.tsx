import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EventHive — Book It. Live It.',
  description: 'Discover and book tickets for the best events near you. Music, tech, sports, food, and more. Secure checkout powered by Stripe.',
  keywords: 'events, tickets, booking, concerts, music, tech events, QR tickets',
  openGraph: {
    title: 'EventHive — Event Booking & Ticketing Platform',
    description: 'Discover and book tickets for the best events near you.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#14142a',
                color: '#f9fafb',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '12px',
              },
              success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
