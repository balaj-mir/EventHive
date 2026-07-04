const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    tierName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripeSessionId: { type: String, unique: true, sparse: true },
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded', 'failed'],
      default: 'pending',
    },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ stripeSessionId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
