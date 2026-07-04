const mongoose = require('mongoose');

const ticketTierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  remaining: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, default: '' },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Tech', 'Sports', 'Food', 'Arts', 'Business', 'Comedy', 'Education', 'Other'],
    },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true, default: 'Pakistan' },
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },
    ticketTiers: [ticketTierSchema],
    totalSeats: { type: Number, required: true, min: 1 },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Text index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, startDate: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
