'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Ticket, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full text-center animate-slide-up">
        <div className="card p-10">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-3">Booking Confirmed!</h1>
          <p className="text-gray-400 mb-2">
            Your payment was successful. Your QR tickets are being generated and will be emailed to you shortly.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Check your email for your tickets, or view them in your dashboard.
          </p>

          <div className="space-y-3">
            <Link href="/dashboard/my-tickets" className="btn-primary w-full">
              <Ticket className="w-4 h-4" /> View My Tickets
            </Link>
            <Link href="/events" className="btn-secondary w-full">
              Browse More Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
