const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const { generateTicketQR, generateTicketNumber } = require('../services/qrService');
const { sendTicketEmail } = require('../services/emailService');
const User = require('../models/User');

// @desc    Create Stripe checkout session
// @route   POST /api/bookings/checkout
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { eventId, tierName, quantity } = req.body;

    if (!eventId || !tierName || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'eventId, tierName, and quantity are required.' });
    }

    const event = await Event.findById(eventId);
    if (!event || event.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Event not found or not available.' });
    }

    const tier = event.ticketTiers.find((t) => t.name === tierName);
    if (!tier) {
      return res.status(400).json({ success: false, message: 'Ticket tier not found.' });
    }

    if (tier.remaining < quantity) {
      return res.status(400).json({ success: false, message: `Only ${tier.remaining} tickets remaining for this tier.` });
    }

    const totalAmount = tier.price * quantity;

    // Create pending booking first
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      tierName,
      quantity,
      unitPrice: tier.price,
      totalAmount,
      status: 'pending',
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} — ${tierName}`,
              description: `${event.venue.name}, ${event.venue.city} | ${new Date(event.startDate).toLocaleDateString()}`,
              images: event.coverImage ? [event.coverImage] : [],
            },
            unit_amount: Math.round(tier.price * 100), // cents
          },
          quantity,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        eventId: eventId.toString(),
        userId: req.user._id.toString(),
        tierName,
        quantity: String(quantity),
      },
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/events/${eventId}?cancelled=true`,
    });

    // Save session ID to booking
    booking.stripeSessionId = session.id;
    await booking.save();

    res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title coverImage startDate venue category')
      .populate('tickets')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('tickets');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// Internal function called by Stripe webhook after payment success
const fulfillBooking = async (session) => {
  const { bookingId, eventId, userId, tierName, quantity } = session.metadata;

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status === 'paid') return; // idempotency check

  // Mark booking as paid
  booking.status = 'paid';
  booking.stripePaymentIntentId = session.payment_intent;

  // Atomically reduce seat count
  const event = await Event.findById(eventId);
  const tier = event.ticketTiers.find((t) => t.name === tierName);
  if (tier) {
    tier.remaining = Math.max(0, tier.remaining - Number(quantity));
  }
  await event.save();

  // Generate tickets
  const ticketDocs = [];
  for (let i = 0; i < Number(quantity); i++) {
    const ticketNumber = generateTicketNumber();
    const { qrCodeData, qrCodeImage } = await generateTicketQR({
      ticketNumber,
      eventId,
      userId,
    });

    const ticket = await Ticket.create({
      booking: bookingId,
      event: eventId,
      user: userId,
      ticketNumber,
      tierName,
      qrCodeData,
      qrCodeImage,
    });

    ticketDocs.push(ticket);
    booking.tickets.push(ticket._id);
  }

  await booking.save();

  // Send email with QR codes
  try {
    const user = await User.findById(userId);
    await sendTicketEmail({
      to: user.email,
      userName: user.name,
      eventTitle: event.title,
      eventDate: event.startDate,
      venue: event.venue,
      tickets: ticketDocs.map((t) => ({
        ticketNumber: t.ticketNumber,
        tierName: t.tierName,
        qrCodeImage: t.qrCodeImage,
      })),
    });
  } catch (emailError) {
    console.error('Email send failed (non-critical):', emailError.message);
  }
};

module.exports = { createCheckoutSession, getMyBookings, getBookingById, fulfillBooking };
