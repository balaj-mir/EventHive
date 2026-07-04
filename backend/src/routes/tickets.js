const express = require('express');
const router = express.Router();
const { getMyTickets, getEventAttendees, verifyAndCheckIn } = require('../controllers/ticketController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/my', protect, getMyTickets);
router.post('/verify', protect, restrictTo('organizer', 'admin'), verifyAndCheckIn);
router.get('/event/:eventId', protect, restrictTo('organizer', 'admin'), getEventAttendees);

module.exports = router;
