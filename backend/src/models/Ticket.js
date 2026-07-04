const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    tierName: { type: String, required: true },
    qrCodeData: { type: String, required: true },   // JWT-signed payload
    qrCodeImage: { type: String, required: true },  // base64 PNG data URL
    seatLabel: { type: String, default: '' },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ event: 1, checkedIn: 1 });
ticketSchema.index({ user: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
