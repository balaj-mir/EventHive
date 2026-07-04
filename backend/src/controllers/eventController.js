const Event = require('../models/Event');

// @desc    Get all published events (with filters & pagination)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { category, city, search, page = 1, limit = 12, sort = '-startDate' } = req.query;

    const query = { status: 'published', startDate: { $gte: new Date() } };

    if (category) query.category = category;
    if (city) query['venue.city'] = new RegExp(city, 'i');
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar email');

    if (!event || event.status === 'cancelled') {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (organizer, admin)
const createEvent = async (req, res, next) => {
  try {
    const { ticketTiers } = req.body;

    const totalSeats = ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);

    // Set remaining = quantity initially
    const tiersWithRemaining = ticketTiers.map((t) => ({ ...t, remaining: t.quantity }));

    const event = await Event.create({
      ...req.body,
      ticketTiers: tiersWithRemaining,
      totalSeats,
      organizer: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Event created.', data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (organizer owner, admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event.' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Event updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (cancel) event
// @route   DELETE /api/events/:id
// @access  Private (organizer owner, admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    event.status = 'cancelled';
    await event.save();

    res.status(200).json({ success: true, message: 'Event cancelled.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer's own events
// @route   GET /api/events/my/events
// @access  Private (organizer, admin)
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish / unpublish event
// @route   PATCH /api/events/:id/status
// @access  Private (organizer owner, admin)
const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    event.status = status;
    await event.save();

    res.status(200).json({ success: true, message: `Event ${status}.`, data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getMyEvents, updateEventStatus };
