'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/lib/api';
import { CheckCircle, XCircle, Camera, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    ticketNumber: string;
    attendee: string;
    email: string;
    tier: string;
    event: string;
    checkedInAt: string;
  };
}

export default function QRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const startScanner = async () => {
    setResult(null);
    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        async (decodedText) => {
          if (processing) return;
          setProcessing(true);
          await html5QrCode.pause(true);

          try {
            const { data } = await api.post('/tickets/verify', { qrCodeData: decodedText });
            setResult(data);
            if (data.success) {
              toast.success('✅ Check-in successful!');
            } else {
              toast.error(data.message);
            }
          } catch (err: any) {
            const msg = err.response?.data?.message || 'Verification failed.';
            setResult({ success: false, message: msg });
            toast.error(msg);
          } finally {
            setProcessing(false);
          }
        },
        undefined
      );
      setScanning(true);
    } catch (err) {
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const reset = async () => {
    setResult(null);
    if (scannerRef.current) {
      try { await scannerRef.current.resume(); } catch {}
    }
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          QR Check-In Scanner
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Point your camera at an attendee's QR ticket to check them in.
        </p>

        {/* Camera view */}
        <div className="relative rounded-2xl overflow-hidden bg-black mb-4" style={{ minHeight: '300px' }}>
          <div id="qr-reader" className="w-full" />
          {!scanning && !result && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">Camera not active</p>
              </div>
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">Verifying ticket...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!scanning ? (
            <button onClick={startScanner} className="btn-primary flex-1">
              <Camera className="w-4 h-4" /> Start Scanner
            </button>
          ) : (
            <button onClick={stopScanner} className="btn-secondary flex-1">
              Stop Scanner
            </button>
          )}
          {result && (
            <button onClick={reset} className="btn-ghost">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-xl border animate-slide-up ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.message}
                </p>
                {result.data && (
                  <div className="mt-2 space-y-1 text-sm text-gray-300">
                    <p><span className="text-gray-500">Attendee:</span> {result.data.attendee}</p>
                    <p><span className="text-gray-500">Email:</span> {result.data.email}</p>
                    <p><span className="text-gray-500">Tier:</span> {result.data.tier}</p>
                    <p><span className="text-gray-500">Ticket #:</span> {result.data.ticketNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
