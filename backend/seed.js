require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Event = require('./src/models/Event');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany({});
  await Event.deleteMany({});

  // Create users
  const adminPass = await bcrypt.hash('Admin1234!', 12);
  const orgPass = await bcrypt.hash('Org12345!', 12);
  const attPass = await bcrypt.hash('Att12345!', 12);

  const [admin, organizer, attendee] = await User.insertMany([
    { name: 'Admin User', email: 'admin@eventhive.com', password: adminPass, role: 'admin' },
    { name: 'Alex Thompson', email: 'organizer@eventhive.com', password: orgPass, role: 'organizer' },
    { name: 'Jamie Wilson', email: 'attendee@eventhive.com', password: attPass, role: 'attendee' },
  ]);

  console.log('✅ Users seeded');

  // Create sample events
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await Event.insertMany([
    {
      title: 'Summer Beats Music Festival',
      description: 'The biggest music festival of the year! Featuring top artists across multiple stages with food vendors, art installations, and more. A full day of incredible music and vibes.',
      category: 'Music',
      venue: { name: 'Lahore Expo Centre', address: 'Johar Town', city: 'Lahore', country: 'Pakistan' },
      startDate: future(14),
      endDate: future(14),
      ticketTiers: [
        { name: 'General Admission', price: 25, quantity: 500, remaining: 500, description: 'Access to all stages' },
        { name: 'VIP', price: 75, quantity: 100, remaining: 100, description: 'Front row access + lounge' },
      ],
      totalSeats: 600,
      organizer: organizer._id,
      status: 'published',
      isFeatured: true,
      tags: ['music', 'festival', 'outdoor'],
    },
    {
      title: 'TechPk Summit 2025',
      description: 'Pakistan\'s premier tech conference bringing together developers, founders, and investors. Talks, workshops, and networking sessions.',
      category: 'Tech',
      venue: { name: 'Islamabad Convention Centre', address: 'Jinnah Avenue', city: 'Islamabad', country: 'Pakistan' },
      startDate: future(21),
      endDate: future(22),
      ticketTiers: [
        { name: 'Standard', price: 50, quantity: 300, remaining: 300, description: 'Conference access + lunch' },
        { name: 'Workshop Pass', price: 120, quantity: 50, remaining: 50, description: 'All workshops + networking dinner' },
      ],
      totalSeats: 350,
      organizer: organizer._id,
      status: 'published',
      isFeatured: true,
      tags: ['tech', 'startup', 'AI'],
    },
    {
      title: 'Karachi Food Carnival',
      description: 'Explore the flavors of Pakistan and the world. 50+ food stalls, live cooking demos, and a bakery competition.',
      category: 'Food',
      venue: { name: 'Clifton Beach Area', address: 'Clifton Block 5', city: 'Karachi', country: 'Pakistan' },
      startDate: future(7),
      endDate: future(9),
      ticketTiers: [
        { name: 'Day Pass', price: 10, quantity: 1000, remaining: 1000, description: 'Entry for one day' },
        { name: 'Weekend Pass', price: 25, quantity: 200, remaining: 200, description: 'All 3 days access' },
      ],
      totalSeats: 1200,
      organizer: organizer._id,
      status: 'published',
      tags: ['food', 'carnival', 'family'],
    },
    {
      title: 'Stand-Up Karachi Night',
      description: 'A night of non-stop laughter with Pakistan\'s hottest stand-up comedians. 18+ event.',
      category: 'Comedy',
      venue: { name: 'The Venue Karachi', address: 'DHA Phase 6', city: 'Karachi', country: 'Pakistan' },
      startDate: future(10),
      endDate: future(10),
      ticketTiers: [
        { name: 'Regular', price: 20, quantity: 150, remaining: 150 },
        { name: 'Premium', price: 40, quantity: 30, remaining: 30, description: 'Front row seats' },
      ],
      totalSeats: 180,
      organizer: organizer._id,
      status: 'published',
      tags: ['comedy', 'standup', 'entertainment'],
    },
    {
      title: 'Lahore Art Exhibition',
      description: 'A curated exhibition featuring works from 30+ emerging Pakistani artists. Paintings, sculptures, digital art, and photography.',
      category: 'Arts',
      venue: { name: 'Alhamra Art Council', address: 'The Mall Road', city: 'Lahore', country: 'Pakistan' },
      startDate: future(5),
      endDate: future(12),
      ticketTiers: [
        { name: 'Free Entry', price: 0, quantity: 500, remaining: 500, description: 'Open to all' },
      ],
      totalSeats: 500,
      organizer: organizer._id,
      status: 'published',
      tags: ['art', 'exhibition', 'free'],
    },
  ]);

  console.log('✅ Events seeded');
  console.log('\n📋 Test accounts:');
  console.log('  Admin:     admin@eventhive.com     / Admin1234!');
  console.log('  Organizer: organizer@eventhive.com / Org12345!');
  console.log('  Attendee:  attendee@eventhive.com  / Att12345!');
  console.log('\n🎟️  Seed complete!\n');

  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
