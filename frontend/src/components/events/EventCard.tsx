import Link from 'next/link';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  _id: string;
  title: string;
  category: string;
  coverImage?: string;
  startDate: string;
  venue: { name: string; city: string };
  ticketTiers: { price: number }[];
  isFeatured?: boolean;
}

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

export default function EventCard({ event }: { event: Event }) {
  const minPrice = Math.min(...event.ticketTiers.map((t) => t.price));
  const gradient = categoryColors[event.category] || 'from-purple-500 to-pink-500';

  return (
    <Link href={`/events/${event._id}`} className="block group">
      <div className="card overflow-hidden h-full">
        {/* Cover */}
        <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <span className="text-6xl">🎉</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="badge badge-purple">{event.category}</span>
            {event.isFeatured && (
              <span className="badge" style={{ background: 'rgba(245,158,11,0.2)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.3)' }}>
                <Star className="w-3 h-3 mr-1 fill-current" /> Featured
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <div className="glass px-3 py-1 rounded-lg">
              <span className="text-white font-bold text-sm">
                {minPrice === 0 ? 'Free' : `$${minPrice}`}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-lg leading-snug mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>{format(new Date(event.startDate), 'EEE, MMM d · h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <span className="truncate">{event.venue.name}, {event.venue.city}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-700/20 flex items-center justify-between">
            <span className="text-xs text-gray-500">Click to view details</span>
            <span className="text-xs text-purple-400 group-hover:text-purple-300 font-medium">Book Now →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
