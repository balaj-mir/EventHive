import Link from 'next/link';
import { ArrowRight, Ticket, Shield, Zap, Star, Music, Cpu, UtensilsCrossed, Trophy } from 'lucide-react';

const categories = [
  { name: 'Music', icon: '🎵', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Tech', icon: '💻', gradient: 'from-blue-500 to-cyan-400' },
  { name: 'Food', icon: '🍕', gradient: 'from-orange-400 to-amber-400' },
  { name: 'Sports', icon: '⚽', gradient: 'from-green-400 to-emerald-500' },
  { name: 'Arts', icon: '🎨', gradient: 'from-rose-400 to-red-500' },
  { name: 'Business', icon: '💼', gradient: 'from-indigo-500 to-blue-500' },
  { name: 'Comedy', icon: '😂', gradient: 'from-yellow-400 to-orange-400' },
  { name: 'Education', icon: '📚', gradient: 'from-teal-400 to-green-500' },
];

const features = [
  { icon: <Ticket className="w-6 h-6" />, title: 'Instant QR Tickets', desc: 'Get your QR-coded tickets instantly after payment. No printing needed.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Secure Payments', desc: 'Powered by Stripe with bank-level encryption for every transaction.' },
  { icon: <Zap className="w-6 h-6" />, title: 'Fast Check-In', desc: 'Organizers scan QR codes in seconds for smooth event entry.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl animate-float"
            style={{ background: 'radial-gradient(circle, #db2777, transparent)', animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 animate-slide-up">
          <div className="badge badge-purple mb-6 text-sm">
            <Star className="w-3 h-3 mr-1 fill-current" /> The Future of Event Ticketing
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-none">
            Book It.{' '}
            <span className="gradient-text">Live It.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thousands of events. Secure your spot instantly. Get QR tickets delivered to your email.
            The complete event experience — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events" className="btn-primary text-lg px-8 py-4">
              Explore Events <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/register?role=organizer" className="btn-secondary text-lg px-8 py-4">
              Host an Event
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '10K+', label: 'Events' },
              { value: '250K+', label: 'Tickets Sold' },
              { value: '4.9★', label: 'Rating' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-white mb-3">Browse by Category</h2>
          <p className="text-gray-400">Find events that match your vibe</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/events?category=${cat.name}`}
              className="card p-6 text-center cursor-pointer group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="font-semibold text-white text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section-sm">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="glass p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }} />
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to host your event?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Create your event, set ticket tiers, and start selling in minutes. QR check-in included.
            </p>
            <Link href="/register?role=organizer" className="btn-primary text-lg px-8 py-4">
              Start Hosting Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-700/20 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-purple-400" />
          <span className="font-display font-bold text-xl gradient-text">EventHive</span>
        </div>
        <p className="text-gray-500 text-sm">© 2024 EventHive. All rights reserved.</p>
      </footer>
    </div>
  );
}
