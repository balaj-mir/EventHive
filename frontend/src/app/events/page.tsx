'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import EventCard from '@/components/events/EventCard';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Food', 'Arts', 'Business', 'Comedy', 'Education', 'Other'];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const { data } = await api.get('/events', { params });
      setEvents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [category, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            Discover <span className="gradient-text">Events</span>
          </h1>
          <p className="text-gray-400">Find something amazing near you</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, venues, artists..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'btn-secondary py-2 px-4'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎭</p>
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try different filters or check back soon!</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Showing {events.length} of {pagination?.total} events
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 pb-16">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-purple-600 text-white'
                        : 'btn-secondary px-0 py-0 w-10 h-10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
