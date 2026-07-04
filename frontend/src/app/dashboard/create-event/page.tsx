'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, Calendar, MapPin, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Food', 'Arts', 'Business', 'Comedy', 'Education', 'Other'];

const defaultTier = { name: '', price: 0, quantity: 100, description: '' };

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Music',
    venue: { name: '', address: '', city: '', country: 'Pakistan' },
    startDate: '',
    endDate: '',
    tags: '',
  });
  const [tiers, setTiers] = useState([{ ...defaultTier, name: 'General Admission' }]);

  const updateField = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const updateVenue = (k: string, v: string) => setForm((f) => ({ ...f, venue: { ...f.venue, [k]: v } }));
  const updateTier = (i: number, k: string, v: any) => {
    setTiers((ts) => ts.map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  };
  const addTier = () => setTiers((ts) => [...ts, { ...defaultTier }]);
  const removeTier = (i: number) => setTiers((ts) => ts.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tiers.some((t) => !t.name)) return toast.error('All ticket tiers must have a name');
    setLoading(true);
    try {
      await api.post('/events', {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ticketTiers: tiers.map((t) => ({ ...t, price: Number(t.price), quantity: Number(t.quantity) })),
        status: 'draft',
      });
      toast.success('Event created! Publish it when ready.');
      router.push('/dashboard/my-events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen px-4 max-w-3xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-white mb-2">Create Event</h1>
      <p className="text-gray-400 mb-8">Fill in the details below. You can publish it later.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-purple-700/20 pb-3 mb-4">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Title *</label>
            <input className="input" value={form.title} onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Summer Music Festival 2025" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
            <textarea className="input min-h-[120px] resize-none" value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tell attendees what to expect..." required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select className="input" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
              <input className="input" value={form.tags} onChange={(e) => updateField('tags', e.target.value)}
                placeholder="music, outdoor, festival" />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-purple-700/20 pb-3 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" /> Date & Time
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time *</label>
              <input type="datetime-local" className="input" value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time *</label>
              <input type="datetime-local" className="input" value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-purple-700/20 pb-3 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-400" /> Venue
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue Name *</label>
              <input className="input" value={form.venue.name} onChange={(e) => updateVenue('name', e.target.value)}
                placeholder="e.g. Lahore Expo Centre" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
              <input className="input" value={form.venue.city} onChange={(e) => updateVenue('city', e.target.value)}
                placeholder="e.g. Lahore" required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
              <input className="input" value={form.venue.address} onChange={(e) => updateVenue('address', e.target.value)}
                placeholder="Street address" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
              <input className="input" value={form.venue.country} onChange={(e) => updateVenue('country', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Ticket Tiers */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-white border-b border-purple-700/20 pb-3 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" /> Ticket Tiers
          </h2>
          <div className="space-y-4">
            {tiers.map((tier, i) => (
              <div key={i} className="glass p-4 rounded-xl">
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tier Name *</label>
                    <input className="input py-2 text-sm" value={tier.name}
                      onChange={(e) => updateTier(i, 'name', e.target.value)} placeholder="e.g. VIP" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Price (USD)</label>
                    <input type="number" min="0" className="input py-2 text-sm" value={tier.price}
                      onChange={(e) => updateTier(i, 'price', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                    <input type="number" min="1" className="input py-2 text-sm" value={tier.quantity}
                      onChange={(e) => updateTier(i, 'quantity', e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <input className="input py-2 text-sm flex-1" value={tier.description}
                    onChange={(e) => updateTier(i, 'description', e.target.value)}
                    placeholder="Optional tier description..." />
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addTier} className="btn-secondary w-full">
              <Plus className="w-4 h-4" /> Add Another Tier
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Event (Save as Draft)'}
        </button>
      </form>
    </div>
  );
}
