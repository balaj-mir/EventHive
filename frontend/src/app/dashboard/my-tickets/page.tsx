'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Ticket, Calendar, MapPin, QrCode, CheckCircle, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<any>(null);

  useEffect(() => {
    api.get('/tickets/my')
      .then(({ data }) => setTickets(data.data))
      .finally(() => setLoading(false));
  }, []);

  const downloadQR = (ticket: any) => {
    const link = document.createElement('a');
    link.href = ticket.qrCodeImage;
    link.download = `ticket_${ticket.ticketNumber}.png`;
    link.click();
  };

  return (
    <div className="pt-24 min-h-screen px-4 max-w-5xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-white mb-2">My Tickets</h1>
      <p className="text-gray-400 mb-8">Your QR-coded event tickets</p>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 card p-12">
          <Ticket className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No tickets yet</h3>
          <p className="text-gray-400">Book an event to see your tickets here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="card p-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* QR Code thumbnail */}
              <div className="flex-shrink-0 cursor-pointer" onClick={() => setSelectedQR(ticket)}>
                <img src={ticket.qrCodeImage} alt="QR Code"
                  className="w-24 h-24 rounded-xl border-2 border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h3 className="font-bold text-white text-lg leading-tight">
                    {ticket.event?.title}
                  </h3>
                  {ticket.checkedIn && (
                    <span className="badge badge-green flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Checked In
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    {ticket.event?.startDate && format(new Date(ticket.event.startDate), 'EEEE, MMMM d, yyyy · h:mm a')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    {ticket.event?.venue?.name}, {ticket.event?.venue?.city}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Ticket className="w-4 h-4 text-yellow-400" />
                    <span className="badge badge-yellow">{ticket.tierName}</span>
                    <span className="font-mono text-xs text-gray-500">{ticket.ticketNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedQR(ticket)} className="btn-secondary py-2 px-4 text-sm">
                    <QrCode className="w-4 h-4" /> View QR
                  </button>
                  <button onClick={() => downloadQR(ticket)} className="btn-ghost text-sm">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQR(null)}>
          <div className="card p-8 max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white text-xl mb-1">{selectedQR.event?.title}</h3>
            <p className="text-gray-400 text-sm mb-6">{selectedQR.tierName} Ticket</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6">
              <img src={selectedQR.qrCodeImage} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="font-mono text-purple-400 text-sm mb-4">{selectedQR.ticketNumber}</p>
            <div className="flex gap-3">
              <button onClick={() => downloadQR(selectedQR)} className="btn-primary flex-1">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={() => setSelectedQR(null)} className="btn-ghost flex-1">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
