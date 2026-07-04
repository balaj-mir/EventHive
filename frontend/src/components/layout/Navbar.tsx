'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X, Ticket, ChevronDown, LogOut, User, LayoutDashboard, QrCode, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
    setDropOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-700/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">EventHive</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Browse Events
          </Link>
          {isAuthenticated && user?.role === 'organizer' && (
            <Link href="/dashboard/my-events" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              My Events
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="btn-ghost text-sm">Log In</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200">{user?.name?.split(' ')[0]}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-12 w-52 card py-2 shadow-2xl animate-slide-up">
                  <div className="px-3 py-2 border-b border-purple-700/20 mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    <span className="badge badge-purple mt-1">{user?.role}</span>
                  </div>
                  <Link href="/dashboard/my-tickets" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                    <Ticket className="w-4 h-4" /> My Tickets
                  </Link>
                  {user?.role === 'organizer' && (
                    <>
                      <Link href="/dashboard/my-events" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                        <Calendar className="w-4 h-4" /> My Events
                      </Link>
                      <Link href="/dashboard/scanner" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                        <QrCode className="w-4 h-4" /> QR Scanner
                      </Link>
                    </>
                  )}
                  <hr className="border-purple-700/20 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-all">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden btn-ghost">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-purple-700/20 bg-dark-800 px-4 py-4 space-y-2 animate-slide-up">
          <Link href="/events" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Browse Events</Link>
          {!isAuthenticated ? (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">Log In</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-center mt-2">Get Started</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/my-tickets" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">My Tickets</Link>
              {user?.role === 'organizer' && (
                <>
                  <Link href="/dashboard/my-events" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">My Events</Link>
                  <Link href="/dashboard/scanner" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-300 hover:text-white">QR Scanner</Link>
                </>
              )}
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Log Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
