# 🚖 Yatrik India – Smart City Mobility & Cab Aggregator (यात्रिक इंडिया)

Yatrik India (यात्रिक – हर सफर, सही कदर) is a real-time smart mobility and cab aggregation web platform built with React 19, TypeScript, Tailwind CSS, and Vite. Designed specifically for the operational, infrastructural, and regulatory realities of Indian metropolitan and tier-2 markets with upfront transparent pricing, zero arbitrary surge spikes, direct UPI payouts, and driver empowerment.

---

## ⚡ 1-Click Deployment on Vercel

The project is fully pre-configured for instant zero-configuration deployment to **Vercel**:

### Method A: Connect via GitHub (Recommended)
1. In the top-right menu of Google AI Studio, click **"Export to GitHub"** (or push your repository to GitHub).
2. Head to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository. Vercel will automatically detect **Vite** and read `vercel.json`.
4. Click **Deploy**. Your live HTTPS production link will be ready in under 60 seconds!

### Method B: Deploy using Vercel CLI
```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy directly to production
vercel --prod
```

### Pre-Configured Vercel Settings:
- **Framework:** Vite
- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **SPA Routing:** Automatic rewrite to `/index.html` (excluding `/api/*`)
- **Serverless Endpoints:** Native `/api/health`, `/api/fares/estimate`, `/api/auth/otp/send`, `/api/auth/otp/verify`


---

## 🇮🇳 India-Specific Architectural Adaptations

1. **4-Digit Start-Ride OTP Verification:** Mitigates the common Indian transit issue of unauthorized trip initiation or driver identity swapping. Trips can only transition from `ARRIVED` to `ONGOING` once the driver verifies the rider's cryptographically generated PIN.
2. **CNG Boot Clearance Tagging:** Explicit metadata flag on sedans (`bootSpaceClearance: true | false`) to alert riders whether the vehicle has a fitted CNG cylinder or clear trunk space for airport transit.
3. **Upfront Fare Engine with Regulatory Caps:** Implements dynamic upfront traffic costing capped strictly in alignment with MoRTH Aggregator Guidelines (up to 2.0x base fare surge ceiling).
4. **Hybrid Payment Topology:** First-class support for UPI Intent/Dynamic QR (Razorpay/Cashfree) alongside driver cash collection and instant driver payouts.

---

## 🚖 Localized Fleet Categories

| Tier | Sample Fleet Models | Passenger / Boot Spec | Pricing Model (INR) |
| :--- | :--- | :--- | :--- |
| **RideFlow Auto** | Bajaj Compact, Piaggio Ape | 3 Pax, No heavy luggage | Base ₹30 (first 1.5 km) + ₹15/km |
| **RideFlow Go** | WagonR, Tiago, Celerio | 4 Pax, Small soft bags | Base ₹50 + ₹14/km + Traffic Factor |
| **RideFlow Sedan** | Dzire Tour S, Aura, Tigor | 4 Pax, CNG Boot Notice | Base ₹70 + ₹17/km + Traffic Factor |
| **RideFlow XL** | Maruti Ertiga, Kia Carens | 6 Pax, Full luggage capacity | Base ₹120 + ₹22/km + Traffic Factor |

---

## 📌 Core Features

### 👤 Rider Features
- **Phone / WhatsApp OTP Login** (JWT with HttpOnly refresh cookies)
- **Multi-stop Map Integration** with Google Places Autocomplete (India bounds)
- **Vehicle Category Selection** with dynamic ETA and upfront transparent pricing
- **4-Digit Safety Start-Ride PIN**
- **Live Vector Tracking** using Socket.io and Mapbox/Google Maps Directions
- **Emergency SOS Trigger** (broadcasts location snapshot to server admins)

### 🚗 Driver (Captain) Features
- **Instant Online / Offline Availability Toggle**
- **Targeted Radar Dispatch:** Visual radar dispatch window (15-second acceptance countdown)
- **Turn-by-Turn Navigation Trigger** directly linked to Google Maps / Waze
- **OTP Verification Pad** to validate passengers before engine start
- **Daily Earnings & Commission Split Dashboard** (80% Captain / 20% Platform split)

### 🛠 Admin & Operations Dashboard
- **Geofenced Fleet Monitoring** with high-density heatmap views
- **Surge Multiplier Manager** for localized high-demand zones
- **Captain Verification Gate** (Driving License, Commercial RC, Police Clearance status)
- **Dispute Resolution Console** for fare recalculation and route deviations

---

## ⚙️ Tech Stack

### Client Side
- **Core:** React.js 18, React Router DOM v6
- **State & Real-Time:** Redux Toolkit / Context API, Socket.io-client
- **Styling:** Tailwind CSS, Lucide Icons, Headless UI
- **Maps:** `@react-google-maps/api` or MapLibre GL

### Server Side & Data
- **Engine:** Node.js, Express.js
- **Database:** MongoDB Atlas (2dsphere Geospatial Indexing enabled)
- **Caching & Ephemeral State:** Redis (Driver geo-hashing and active socket mapping)
- **Communications:** Socket.io with Redis Adapter (horizontal scaling)
- **Authentication:** JWT (Access + Refresh token rotation) & Bcrypt

---

## 🏗 Real-Time Architectural Flow

```text
[Rider App]               [Express / Redis]             [Nearby Captains]
     |                            |                             |
     |--- 1. Request Ride ------->|                             |
     |    (GeoJSON Pickup)        |--- 2. GeoRadius Match ----->|
     |                            |       ($nearSphere / Redis) |
     |                            |<-- 3. Accept (Within 15s) --|
     |<-- 4. Captain Assigned ----|                             |
     |    (Vehicle, Live Location,|                             |
     |     4-Digit Ride PIN)      |                             |
     |                            |<-- 5. Location Heartbeat ---|
     |<-- 6. Live Stream Proxy ---|    (Every 3-5 seconds)      |
     |                            |                             |
     |--- 7. Share OTP In-Person->|-- 8. Verify OTP & Start --->|
```

---

## 🗄 Optimized MongoDB Schemas

### User.js
```javascript
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, sparse: true },
  role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
  emergencyContacts: [{ name: String, phone: String }]
}, { timestamps: true });
```

### Driver.js
```javascript
const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: {
    model: { type: String, required: true }, // e.g., "Maruti Dzire Tour"
    plateNumber: { type: String, required: true, uppercase: true },
    category: { 
      type: String, 
      enum: ['auto', 'go', 'sedan', 'xl'], 
      required: true 
    },
    hasCNGCylinder: { type: Boolean, default: true }
  },
  isOnline: { type: Boolean, default: false },
  isEngaged: { type: Boolean, default: false },
  rating: { type: Number, default: 4.80 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  }
}, { timestamps: true });

driverSchema.index({ location: '2dsphere' });
```

### Ride.js
```javascript
const rideSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  category: { type: String, enum: ['auto', 'go', 'sedan', 'xl'], required: true },
  pickup: {
    address: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  drop: {
    address: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  },
  otp: { type: String, required: true, select: false },
  distanceKm: { type: Number, required: true },
  durationMins: { type: Number, required: true },
  fareBreakup: {
    baseFare: Number,
    distanceFare: Number,
    trafficSurge: Number,
    platformFee: Number,
    gst: Number,
    total: Number
  },
  paymentMode: { type: String, enum: ['UPI', 'CASH', 'WALLET'], default: 'UPI' },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING' },
  status: {
    type: String,
    enum: ['SEARCHING', 'ACCEPTED', 'ARRIVED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'SEARCHING'
  }
}, { timestamps: true });

rideSchema.index({ 'pickup.location': '2dsphere' });
```

---

## 🧮 Upfront Dynamic Fare Engine

Instead of unpredictably charging riders per minute while stuck at intersections, RideFlow calculates transparent upfront pricing using duration ratios and traffic estimates:

$$\text{Estimated Fare} = \left[ \text{Base} + (\text{Distance} \times \text{Rate}_{\text{km}}) + (\text{Congestion Factor} \times \Delta t_{\text{delay}}) \right] \times \min(\text{Surge}, 2.0) + \text{GST}_{5\%}$$

```javascript
// utils/fareCalculator.js
export const calculateUpfrontFare = (category, distanceKm, durationMins, normalDurationMins, surge = 1.0) => {
  const RATES = {
    auto:  { base: 30, perKm: 15, delayRate: 1.5 },
    go:    { base: 50, perKm: 14, delayRate: 2.0 },
    sedan: { base: 70, perKm: 17, delayRate: 2.5 },
    xl:    { base: 120, perKm: 22, delayRate: 3.5 }
  };

  const rate = RATES[category];
  const delayMinutes = Math.max(0, durationMins - normalDurationMins);
  const surgeMultiplier = Math.min(Math.max(surge, 1.0), 2.0); // 2.0x regulatory ceiling

  const baseAndDistance = rate.base + (distanceKm * rate.perKm);
  const congestionCharge = delayMinutes * rate.delayRate;
  
  const subtotal = (baseAndDistance + congestionCharge) * surgeMultiplier;
  const platformFee = 15;
  const gst = (subtotal + platformFee) * 0.05;

  return {
    baseFare: rate.base,
    distanceFare: Math.round(distanceKm * rate.perKm),
    congestionCharge: Math.round(congestionCharge),
    platformFee,
    gst: Math.round(gst),
    total: Math.round(subtotal + platformFee + gst)
  };
};
```

---

## 📡 Key Socket.io Events

| Event Name | Direction | Payload |
| :--- | :--- | :--- |
| `driver:update-location` | Client (Driver) → Server | `{ driverId, coordinates: [lng, lat] }` |
| `ride:request` | Client (Rider) → Server | `{ riderId, pickup, drop, category, fare }` |
| `ride:nearby-offer` | Server → Filtered Drivers | `{ rideId, pickupDistance, upfrontEarnings, dropArea }` |
| `ride:accept` | Client (Driver) → Server | `{ rideId, driverId }` |
| `ride:verify-otp` | Client (Driver) → Server | `{ rideId, enteredOtp }` |
| `ride:trip-started` | Server → Client (Rider) | `{ status: 'ONGOING', startedAt }` |

---

## 📦 Setup & Run

### Prerequisites
- Node.js >= 18.x
- MongoDB Community or Atlas URI
- Redis Instance (optional for single-node development, required for multi-instance socket broadcasts)

### Quickstart
```bash
# 1. Clone & install root
git clone https://github.com/your-username/rideflow.git
cd rideflow

# 2. Setup Server
cd server
npm install
cp .env.example .env
npm run dev

# 3. Setup Client
cd ../client
npm install
npm start
```

---

### Key Architectural Enhancements Added
* **Redis Adapter Compatibility:** Real-world tracking requires horizontal scaling; native Node.js memory cannot share WebSockets across cluster nodes.
* **Decoupled Destination Masking:** In India, driver cancellations skyrocket if drop locations are obscured. The `nearby-offer` socket payload discloses the drop cluster name while keeping the exact GPS address private until accepted.
* **Regulatory Compliance:** Implemented the 2.0x peak surge cap and transparent GST/Platform fee breakdown directly in the code logic.
