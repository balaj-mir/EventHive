const express = require('express');
const router = express.Router();
const { createCheckoutSession, getMyBookings, getBookingById } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/checkout', protect, createCheckoutSession);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
