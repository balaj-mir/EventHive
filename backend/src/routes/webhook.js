const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { fulfillBooking, releaseBookingInventory } = require('../controllers/bookingController');

// NOTE: This route must receive the raw body (not parsed JSON)
// This is handled in app.js before the global express.json() middleware
router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Payment successful for session:', session.id);
      try {
        await fulfillBooking(session);
      } catch (err) {
        console.error('❌ Fulfillment error:', err.message);
        return res.status(500).json({ error: 'Fulfillment failed.' });
      }
      break;
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      console.log('⚠️ Session expired or failed:', session.id);
      try {
        await releaseBookingInventory(session);
      } catch (err) {
        console.error('❌ Release inventory error:', err.message);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.log('❌ Payment failed:', pi.id);
      try {
        if (pi.metadata && pi.metadata.bookingId) {
          await releaseBookingInventory(pi);
        }
      } catch (err) {
        console.error('❌ Release inventory error:', err.message);
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
