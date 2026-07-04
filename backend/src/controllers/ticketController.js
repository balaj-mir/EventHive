const Ticket = require('../models/Ticket');
const { verifyQRPayload } = require('../services/qrService');

// @desc    Get current user's tickets
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id, isValid: true })
      .populate('event', 'title coverImage startDate endDate venue category')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendees for an event (organizer only)
// @route   GET /api/tickets/event/:eventId
// @access  Private (organizer, admin)
const getEventAttendees = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('user', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify & check-in a ticket via QR scan
// @route   POST /api/tickets/verify
// @access  Private (organizer, admin)
const verifyAndCheckIn = async (req, res, next) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({ success: false, message: 'QR code data is required.' });
    }

    // Verify JWT signature
    let payload;
    try {
      payload = verifyQRPayload(qrCodeData);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or tampered QR code.' });
    }

    const ticket = await Ticket.findOne({ ticketNumber: payload.ticketNumber })
      .populate('event', 'title startDate endDate')
      .populate('user', 'name email');

    if (!ticket || !ticket.isValid) {
      return res.status(404).json({ success: false, message: 'Ticket not found or invalidated.' });
    }

    if (ticket.checkedIn) {
      return res.status(409).json({
        success: false,
        message: 'Ticket already checked in.',
        checkedInAt: ticket.checkedInAt,
        attendee: ticket.user?.name,
      });
    }

    // Perform check-in
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = req.user._id;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: '✅ Check-in successful!',
      data: {
        ticketNumber: ticket.ticketNumber,
        attendee: ticket.user?.name,
        email: ticket.user?.email,
        tier: ticket.tierName,
        event: ticket.event?.title,
        checkedInAt: ticket.checkedInAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyTickets, getEventAttendees, verifyAndCheckIn };
