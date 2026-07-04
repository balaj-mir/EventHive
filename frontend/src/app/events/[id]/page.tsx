'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, Users, Clock, Minus, Plus, Ticket, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const categoryColors: Record<string, string> = {
  Music: 'from-purple-500 to-pink-500',
  Tech: 'from-blue-500 to-cyan-500',
  Sports: 'from-green-500 to-emerald-500',
  Food: 'from-orange-500 to-amber-500',
  Arts: 'from-rose-500 to-red-500',
  Business: 'from-indigo-500 to-blue-500',
  Comedy: 'from-yellow-500 to-orange-500',
  Education: 'from-teal-500 to-green-500',
  Other: 'from-gray-500 to-slate-500',
};

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data.data);
        if (data.data.ticketTiers?.length > 0) {
          setSelectedTier(data.data.ticketTiers[0]);
        }
      } catch {
        toast.error('Event not found');
        router.push('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book tickets');
      router.push('/login');
      return;
    }

    if (!selectedTier) return;

    setCheckingOut(true);
    try {
      const { data } = await api.post('/bookings/checkout', {
        eventId: event._id,
        tierName: selectedTier.name,
        quantity,
      });
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const gradient = categoryColors[event.category] || 'from-purple-500 to-pink-500';
  const total = selectedTier ? selectedTier.price * quantity : 0;

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero banner */}
      <div className={`relative h-72 md:h-96 bg-gradient-to-br ${gradient}`}>
        {event.coverImage && (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
          <span className="badge badge-purple mb-3">{event.category}</span>
          <h1 className="font-display text-3xl md:text-5xl font-black text-white">{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Event Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <p className="text-white font-medium">{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-gray-400 text-sm">{format(new Date(event.startDate), 'h:mm a')} — {format(new Date(event.endDate), 'h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Venue</p>
                  <p className="text-white font-medium">{event.venue.name}</p>
                  <p className="text-gray-400 text-sm">{event.venue.address}, {event.venue.city}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {/* Organizer */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Organizer</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {event.organizer?.name?.charAt(0) || 'O'}
              </div>
              <div>
                <p className="font-medium text-white">{event.organizer?.name}</p>
                <p className="text-sm text-gray-400">Event Organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking widget */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-5">Book Tickets</h2>

            {/* Tier selection */}
            <div className="space-y-3 mb-6">
              {event.ticketTiers.map((tier: any) => (
                <button
                  key={tier.name}
                  onClick={() => { setSelectedTier(tier); setQuantity(1); }}
                  disabled={tier.remaining === 0}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedTier?.name === tier.name
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-purple-700/20 hover:border-purple-500/40 bg-white/2'
                  } ${tier.remaining === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{tier.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {tier.remaining > 0 ? `${tier.remaining} remaining` : 'Sold out'}
                      </p>
                    </div>
                    <span className="text-purple-300 font-bold">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </span>
                  </div>
                  {tier.description && <p className="text-xs text-gray-500 mt-2">{tier.description}</p>}
                </button>
              ))}
            </div>

            {/* Quantity */}
            {selectedTier && selectedTier.remaining > 0 && (
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg btn-secondary flex items-center justify-center p-0">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-bold w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(selectedTier.remaining, quantity + 1))}
                    className="w-8 h-8 rounded-lg btn-secondary flex items-center justify-center p-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center mb-4 p-3 rounded-xl bg-white/5">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold gradient-text">
                {total === 0 ? 'Free' : `$${total.toFixed(2)}`}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut || !selectedTier || selectedTier?.remaining === 0}
              className="btn-primary w-full text-base py-4"
            >
              {checkingOut ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Ticket className="w-4 h-4" /> {total === 0 ? 'Get Free Ticket' : 'Proceed to Checkout'}</>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
