const express = require('express');
const router = express.Router();
const {
  getEvents, getEventById, createEvent, updateEvent,
  deleteEvent, getMyEvents, updateEventStatus,
} = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/my/events', protect, restrictTo('organizer', 'admin'), getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, restrictTo('organizer', 'admin'), createEvent);
router.put('/:id', protect, restrictTo('organizer', 'admin'), updateEvent);
router.patch('/:id/status', protect, restrictTo('organizer', 'admin'), updateEventStatus);
router.delete('/:id', protect, restrictTo('organizer', 'admin'), deleteEvent);

module.exports = router;
