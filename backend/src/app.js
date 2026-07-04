require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');
const webhookRoute = require('./routes/webhook');

const app = express();

// Connect to MongoDB
connectDB();

// ─── STRIPE WEBHOOK (must be before express.json) ───────────────────────────
// Stripe needs the raw body to verify signatures
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoute);

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EventHive API is running 🎟️', timestamp: new Date() });
});

// 404 handler
app.use('/{*splat}', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EventHive API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
