'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { QrCode, AlertCircle } from 'lucide-react';

// Dynamically import to avoid SSR issues (html5-qrcode needs browser APIs)
const QRScanner = dynamic(() => import('@/components/scanner/QRScanner'), { ssr: false });

export default function ScannerPage() {
  const { user } = useAuth();

  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-4">
        <div className="text-center card p-12 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only organizers can access the QR scanner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">QR Check-In Scanner</h1>
          <p className="text-gray-400">Scan attendee QR tickets at the event entrance</p>
        </div>

        <QRScanner />

        <div className="mt-6 glass p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">📋 How to use:</h3>
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>Click <strong className="text-white">Start Scanner</strong> and allow camera access</li>
            <li>Point the camera at the attendee's QR ticket</li>
            <li>Wait for automatic verification (green = success)</li>
            <li>Click Reset to scan the next ticket</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
