'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Ticket, Calendar, MapPin, QrCode, CheckCircle, Loader2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    api.get('/tickets/my')
      .then(({ data }) => setTickets(data.data))
      .finally(() => setLoading(false));
  }, []);

  const downloadPNG = (ticket: any) => {
    const link = document.createElement('a');
    link.href = ticket.qrCodeImage;
    link.download = `ticket_${ticket.ticketNumber}.png`;
    link.click();
    toast.success('PNG QR code downloaded!');
  };

  const downloadPDF = (ticket: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Colors & Background
      doc.setFillColor(15, 23, 42); // slate-900 dark background
      doc.rect(0, 0, 210, 297, 'F');

      // Card Border Box
      doc.setDrawColor(168, 85, 247); // purple-500
      doc.setLineWidth(1);
      doc.roundedRect(15, 15, 180, 267, 5, 5, 'S');

      // Header Brand
      doc.setTextColor(168, 85, 247);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('EventHive', 105, 35, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL EVENT ADMISSION TICKET', 105, 43, { align: 'center' });

      // Divider Line
      doc.setDrawColor(51, 65, 85); // slate-700
      doc.line(25, 50, 185, 50);

      // Event Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const title = ticket.event?.title || 'Event Ticket';
      doc.text(title, 105, 65, { align: 'center', maxWidth: 160 });

      // Event Metadata
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225); // slate-300

      const dateStr = ticket.event?.startDate
        ? format(new Date(ticket.event.startDate), 'EEEE, MMMM d, yyyy · h:mm a')
        : 'Date & Time TBA';
      doc.text(`Date: ${dateStr}`, 105, 80, { align: 'center' });

      const venueStr = ticket.event?.venue
        ? `${ticket.event.venue.name}, ${ticket.event.venue.city}`
        : 'Venue TBA';
      doc.text(`Venue: ${venueStr}`, 105, 89, { align: 'center' });

      // Ticket Tier Badge Area
      doc.setFillColor(168, 85, 247);
      doc.roundedRect(65, 98, 80, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`TIER: ${ticket.tierName?.toUpperCase() || 'GENERAL'}`, 105, 105.5, { align: 'center' });

      // QR Code Image
      if (ticket.qrCodeImage) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(55, 120, 100, 100, 5, 5, 'F');
        doc.addImage(ticket.qrCodeImage, 'PNG', 60, 125, 90, 90);
      }

      // Ticket Number
      doc.setTextColor(168, 85, 247);
      doc.setFont('courier', 'bold');
      doc.setFontSize(14);
      doc.text(`UUID: ${ticket.ticketNumber}`, 105, 235, { align: 'center' });

      // Security Notice
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Please present this QR code at the venue gate for camera check-in.', 105, 250, { align: 'center' });
      doc.text('This ticket is cryptographically signed and valid for single entry only.', 105, 256, { align: 'center' });

      // Save PDF
      doc.save(`EventHive_Ticket_${ticket.ticketNumber}.pdf`);
      toast.success('📄 PDF Ticket generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF ticket.');
    }
  };

  const now = new Date();
  const upcomingTickets = tickets.filter(t => !t.event?.startDate || new Date(t.event.startDate) >= now);
  const pastTickets = tickets.filter(t => t.event?.startDate && new Date(t.event.startDate) < now);
  const displayedTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  return (
    <div className="pt-24 min-h-screen px-4 max-w-5xl mx-auto pb-16">
      <h1 className="font-display text-3xl font-bold text-white mb-2">My Tickets</h1>
      <p className="text-gray-400 mb-6">Your digital, cryptographically-signed event passes</p>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'upcoming' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Upcoming Events ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 font-semibold text-sm transition-all relative ${
            activeTab === 'past' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Past Events ({pastTickets.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : displayedTickets.length === 0 ? (
        <div className="text-center py-20 card p-12">
          <Ticket className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No {activeTab} tickets</h3>
          <p className="text-gray-400">
            {activeTab === 'upcoming'
              ? 'Book an event to see your upcoming passes here!'
              : 'You have no past event ticket history.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTickets.map((ticket) => (
            <div key={ticket._id} className="card p-6 flex flex-col sm:flex-row gap-6 items-start">
              {/* QR Code thumbnail */}
              <div className="flex-shrink-0 cursor-pointer" onClick={() => setSelectedQR(ticket)}>
                <img src={ticket.qrCodeImage} alt="QR Code"
                  className="w-24 h-24 rounded-xl border-2 border-purple-500/30 hover:border-purple-500 transition-all hover:scale-105 bg-white p-1" />
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
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedQR(ticket)} className="btn-secondary py-2 px-4 text-sm">
                    <QrCode className="w-4 h-4" /> View QR
                  </button>
                  <button onClick={() => downloadPDF(ticket)} className="btn-primary py-2 px-4 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                    <FileText className="w-4 h-4" /> Download PDF Ticket
                  </button>
                  <button onClick={() => downloadPNG(ticket)} className="btn-ghost text-sm py-2 px-3">
                    <Download className="w-4 h-4" /> PNG
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
            <p className="text-gray-400 text-sm mb-6">{selectedQR.tierName} Pass</p>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-xl">
              <img src={selectedQR.qrCodeImage} alt="QR Code" className="w-56 h-56" />
            </div>
            <p className="font-mono text-purple-400 text-sm mb-4">{selectedQR.ticketNumber}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => downloadPDF(selectedQR)} className="btn-primary w-full py-3">
                <FileText className="w-4 h-4" /> Download Official PDF Ticket
              </button>
              <div className="flex gap-2 mt-1">
                <button onClick={() => downloadPNG(selectedQR)} className="btn-secondary flex-1 text-sm py-2">
                  <Download className="w-4 h-4" /> PNG Image
                </button>
                <button onClick={() => setSelectedQR(null)} className="btn-ghost flex-1 text-sm py-2">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
