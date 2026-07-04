'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Calendar, MapPin, Edit, Trash2, Eye, Loader2, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  published: 'badge-green',
  draft: 'badge-yellow',
  cancelled: 'badge-red',
  completed: 'badge-purple',
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchEvents = () => {
    api.get('/events/my/events')
      .then(({ data }) => setEvents(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const toggleStatus = async (event: any) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await api.patch(`/events/${event._id}/status`, { status: newStatus });
      toast.success(`Event ${newStatus}`);
      fetchEvents();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">My Events</h1>
          <p className="text-gray-400">Manage your events and view attendees</p>
        </div>
        <Link href="/dashboard/create-event" className="btn-primary">
          <Plus className="w-4 h-4" /> Create Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 card p-12">
          <Calendar className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 mb-6">Create your first event to get started!</p>
          <Link href="/dashboard/create-event" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="card p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-white text-lg">{event.title}</h3>
                  <span className={`badge ${statusColors[event.status] || 'badge-purple'}`}>
                    {event.status}
                  </span>
                  <span className="badge badge-purple">{event.category}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {format(new Date(event.startDate), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    {event.venue?.city}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/events/${event._id}`} className="btn-ghost text-sm">
                  <Eye className="w-4 h-4" /> View
                </Link>
                <button onClick={() => toggleStatus(event)}
                  className={`btn-secondary text-xs py-1.5 px-3 ${event.status === 'published' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {event.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <Link href={`/dashboard/attendees/${event._id}`} className="btn-secondary text-xs py-1.5 px-3">
                  <CheckSquare className="w-4 h-4" /> Attendees
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
