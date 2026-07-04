# 🎟️ EventHive — Event Booking & Ticketing Platform

> **Book It. Live It.** — A full-stack event discovery, booking, and check-in platform with Stripe payments, QR code tickets, and camera-based scanning.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| Backend | Node.js + Express.js REST API |
| Database | MongoDB + Mongoose ODM |
| Payments | Stripe API (Test Mode) |
| QR Generation | `qrcode` npm package (JWT-signed) |
| QR Scanner | `html5-qrcode` (camera-based, browser) |
| Email | Nodemailer + Gmail SMTP |
| Auth | Custom JWT (access + refresh token rotation) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Stripe test account → [stripe.com](https://stripe.com)
- Gmail account with App Password

### 1. Clone & setup backend
```bash
cd D:\EventHive\backend
cp .env  # fill in your values
npm install
npm run dev
```

### 2. Setup frontend
```bash
cd D:\EventHive\frontend
cp .env.local  # fill in your values
npm install
npm run dev
```

### 3. Seed the database
```bash
cd D:\EventHive\backend
node seed.js
```

### 4. Test accounts (after seeding)
| Role | Email | Password |
|---|---|---|
| Admin | admin@eventhive.com | Admin1234! |
| Organizer | organizer@eventhive.com | Org12345! |
| Attendee | attendee@eventhive.com | Att12345! |

---

## 🌍 URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health check**: http://localhost:5000/api/health

---

## 💳 Stripe Test Cards
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Payment success |
| `4000 0000 0000 0002` | Payment declined |

Use any future expiry date and any 3-digit CVC.

---

## 📡 Stripe Webhook (Local Dev)

Install Stripe CLI and run:
```bash
stripe listen --forward-to http://localhost:5000/api/webhooks/stripe
```
Copy the `whsec_...` value into your backend `.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 🗂️ Project Structure
```
EventHive/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Cloudinary
│   │   ├── controllers/    # auth, events, bookings, tickets
│   │   ├── middleware/     # JWT auth, error handler
│   │   ├── models/         # User, Event, Booking, Ticket
│   │   ├── routes/         # All API routes + webhook
│   │   ├── services/       # QR generation, email
│   │   └── app.js
│   └── seed.js
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # UI, events, scanner
        ├── context/        # AuthContext
        └── lib/            # Axios client
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventhive
JWT_SECRET=...
JWT_REFRESH_SECRET=...
QR_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚢 Deployment
- **Frontend** → Vercel (`vercel --prod`)
- **Backend** → Render.com (Free tier, set env vars in dashboard)
- **Database** → MongoDB Atlas (Free M0 cluster)

---

## 📦 Key Features
- ✅ Event discovery with category & search filters
- ✅ Multi-tier ticket booking
- ✅ Stripe Checkout (test mode)
- ✅ JWT-signed QR code ticket generation
- ✅ QR tickets emailed after payment (with inline images)
- ✅ Camera-based QR scanner for event check-in
- ✅ Organizer dashboard (create/manage events)
- ✅ Attendee dashboard (view/download tickets)
- ✅ Role-based access (attendee / organizer / admin)
- ✅ Refresh token rotation for persistent sessions
