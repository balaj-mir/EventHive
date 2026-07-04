'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Ticket, Loader2, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'attendee';

  const [form, setForm] = useState({ name: '', email: '', password: '', role: defaultRole });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to EventHive 🎉');
      router.push(form.role === 'organizer' ? '/dashboard/my-events' : '/events');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-10">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <Ticket className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-2">Join EventHive today</p>
        </div>

        <div className="card p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'attendee', label: 'Attendee', icon: <Users className="w-4 h-4" />, desc: 'Book tickets' },
              { value: 'organizer', label: 'Organizer', icon: <Calendar className="w-4 h-4" />, desc: 'Host events' },
            ].map((r) => (
              <button key={r.value} type="button" onClick={() => update('role', r.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  form.role === r.value ? 'border-purple-500 bg-purple-500/10' : 'border-purple-700/20 hover:border-purple-500/30'
                }`}>
                <div className={`${form.role === r.value ? 'text-purple-400' : 'text-gray-400'} mb-1`}>{r.icon}</div>
                <p className="font-semibold text-white text-sm">{r.label}</p>
                <p className="text-gray-500 text-xs">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                placeholder="John Doe" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min. 8 characters" className="input pr-12" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
