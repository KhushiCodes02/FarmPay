# FarmPay 🌾💳
### Direct from Farm. Secure by Design.
*A direct farmer-to-buyer agricultural marketplace with controlled escrow release, automated OTP delivery verification, and transparent pricing.*

---

## 1. Project Overview
**FarmPay** is a full-stack agricultural marketplace built to eliminate the multi-layered intermediary commission model in India's produce supply chain. By pairing direct commerce with a **controlled escrow payment workflow powered by Razorpay**, FarmPay provides commercial buyers with the security that their capital is protected until physical delivery inspection, while assuring farmers of timely, automated bank payouts without payment delays or predatory deductions.

---

## 2. Problem & Solution

### The Problem
* **Payment Delays & Default Risk:** Smallholder farmers frequently wait 30–90 days for mandi aggregators and commission agents to settle produce dues, creating debilitating cash flow cycles.
* **Buyer Trust Deficit:** Commercial buyers (retail chains, wholesalers, food processors) risk upfront advance payments on bulk perishable consignments without quality or weight verification.
* **Opaque Pricing:** Intermediaries extract 15% to 35% margins between farm-gate realization and wholesale mandi procurement rates.

### The FarmPay Solution
* **Escrow-Style Controlled Payment Release:** Buyer funds are captured upon order confirmation and retained in a controlled state via Razorpay.
* **OTP Delivery Handshake:** When the farmer delivers produce to the warehouse or mandi gate, the buyer inspects the goods and verifies a 6-digit SHA-256 encrypted OTP.
* **Instant Payout Release:** Verified OTP entry immediately triggers the payout release to the farmer’s bank account.
* **24-Hour Auto-Release Engine:** If no dispute is registered within 24 hours of delivery, the database cron automatically executes payout release to prevent arbitrary payment withholding.
* **Built-in Arbitration:** If a weight discrepancy or transit spoilage occurs, the buyer raises a dispute, immediately freezing escrow until administrative arbitration (with full refund, partial refund, or farmer payout options).

---

## 3. Core Features

| Feature | Description |
| :--- | :--- |
| **Direct Marketplace** | Search by crop, filter by category (Grains, Vegetables, Fruits, Pulses, Spices, Oilseeds), location, and price. |
| **Market Reference Pricing** | Side-by-side comparison between the farmer's direct offer price and mandi benchmark rates. |
| **Razorpay Escrow Integration** | Integration with Razorpay Orders API, Payment Links, and Route payout capabilities. |
| **OTP Delivery Verification** | 6-digit one-time code with 15-minute expiry and 3-attempt limit; stored as a cryptographic SHA-256 hash. |
| **24h Auto-Release Cron** | Database-driven background cron job (`releaseJob.js`) checks every minute for elapsed 24-hour windows. |
| **Dispute Arbitration Engine** | Admin dashboard allows resolving disputes with full refunds, calculated partial refunds, or farmer payouts. |
| **Immutable Audit Trail** | Every financial and delivery event (Order Created, Payment Secured, OTP Dispatched, OTP Verified, Payout Completed, Refund Processed) creates an `AuditLog` entry. |
| **Dual-Sided Ratings** | Post-fulfillment 1–5 star rating system for farmers and commercial buyers. |
| **Interactive Dashboards** | Role-tailored dashboards for Farmers (earnings, listings, orders), Buyers (spending, tracking), and Admins (GMV, settlements, dispute center). |

---

## 4. Architecture & State Machine

### Architectural Diagram
```
[ React + Vite Client ]
       │  (Axios REST API calls + Razorpay Checkout)
       ▼
[ Express.js Gateway ]
  ├── Helmet & CORS Security
  ├── Rate Limiters (Auth & OTP endpoints)
  ├── JWT & Role-Based Authorization (FARMER / BUYER / ADMIN)
       │
  ├── Controllers & Services Layer
  │     ├── orderService.js   (Inventory reservation & DB pricing)
  │     ├── paymentService.js (Razorpay Orders, Escrow & Route Payouts)
  │     ├── otpService.js     (Crypto SHA-256 verification & expiry)
  │     └── auditService.js   (Immutable financial audit trails)
       │
  ├── Database Layer (MongoDB / Mongoose)
  │     └── 10 Collections (User, Produce, Order, Payment, Payout, Dispute, Rating, OTP, WebhookEvent, AuditLog)
       │
  └── Background Engine (node-cron)
        └── releaseJob.js (24-Hour auto-release deadline worker)
```

### Order State Machine
```
PENDING_PAYMENT
      ↓ (Buyer checkout & Razorpay payment verification)
PAYMENT_SECURED  [Funds locked in Escrow]
      ↓ (Farmer packs produce)
PROCESSING
      ↓ (Consignment handed to courier)
OUT_FOR_DELIVERY
      ↓ (Arrival at warehouse; 6-digit OTP dispatched & 24h timer set)
DELIVERED_PENDING_CONFIRMATION
   ┌──┴────────────────────────────────┐
   │ (Buyer enters correct OTP)        │ (Buyer claims mismatch / damage)
   ▼                                   ▼
COMPLETED                          DISPUTED [Escrow Frozen]
   │                                   │
(Farmer Payout Released)               ▼ (Admin Arbitration)
                               ┌───────┴───────┐
                               ▼               ▼
                            REFUNDED       COMPLETED
                          (Full Refund)   (Partial Refund / Farmer Payout)
```

---

## 5. Technology Stack

* **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide Icons.
* **Backend:** Node.js v24, Express.js v4, MongoDB, Mongoose v8.
* **Authentication:** JSON Web Tokens (JWT), bcryptjs password hashing.
* **Payments & Escrow:** Razorpay Orders API, Razorpay Webhooks, Razorpay Route / Fund Accounts payout simulation, Razorpay Refunds.
* **Scheduled Engine:** `node-cron` database-driven polling job.
* **Testing:** Node.js native test runner (`node --test`), `node:assert`, `mongodb-memory-server`.

---

## 6. Database Models

1. **User:** `name`, `email`, `phone`, `password`, `role` (`FARMER`, `BUYER`, `ADMIN`), `location`, `businessName`, `businessType`, `rating`, `ratingCount`, `bankAccount` (`accountNumber`, `ifscCode`, `accountHolderName`, `razorpayFundAccountId`).
2. **Produce:** `farmerId`, `cropName`, `category`, `description`, `quantityAvailable`, `unit`, `pricePerUnit`, `marketReferencePrice`, `harvestDate`, `location`, `image`, `status` (`AVAILABLE`, `LOW_STOCK`, `SOLD_OUT`, `INACTIVE`).
3. **Order:** `orderNumber`, `buyerId`, `farmerId`, `produceId`, `quantity`, `unitPrice`, `totalAmount`, `deliveryDate`, `deliveryAddress`, `status`, `paymentStatus`, `deliveryStatus`, `disputeStatus`, `releaseDeadline`, `razorpayOrderId`, `razorpayPaymentId`.
4. **Payment:** `orderId`, `amount`, `status` (`CREATED`, `CAPTURED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`), `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.
5. **Payout:** `orderId`, `farmerId`, `amount`, `status` (`PAYOUT_PENDING`, `PAYOUT_PROCESSING`, `PAYOUT_COMPLETED`, `PAYOUT_FAILED`), `razorpayReferenceId`, `isDemoMode`.
6. **Dispute:** `orderId`, `buyerId`, `farmerId`, `reason`, `description`, `refundAmount`, `status`, `resolution` (`notes`, `resolvedBy`, `refundAmount`, `farmerPayoutAmount`, `resolvedAt`).
7. **Rating:** `orderId`, `fromUserId`, `toUserId`, `rating` (1–5), `review`.
8. **OTP:** `orderId`, `codeHash`, `rawDemoCode`, `expiresAt`, `attempts`, `maxAttempts`, `verifiedAt`.
9. **WebhookEvent:** `eventId`, `eventType`, `processed`, `payload`.
10. **AuditLog:** `orderId`, `userId`, `action`, `metadata`, `createdAt`.

---

## 7. API Reference

### Authentication
* `POST /api/auth/register` — Register a new Buyer or Farmer.
* `POST /api/auth/login` — Sign in and receive JWT token.
* `GET  /api/auth/me` — Retrieve current authenticated session.
* `PUT  /api/auth/profile` — Update business profile and bank account.

### Produce Marketplace
* `GET    /api/produce` — Search and filter active produce listings.
* `GET    /api/produce/reference-prices` — Benchmark Mandi market rates.
* `GET    /api/produce/:id` — Retrieve produce details with grower rating.
* `POST   /api/produce` — Create a produce listing *(Farmer only)*.
* `PUT    /api/produce/:id` — Edit a listing *(Farmer / Admin)*.
* `DELETE /api/produce/:id` — Deactivate a listing *(Farmer / Admin)*.

### Orders & Delivery
* `POST   /api/orders` — Place order with DB price calculation *(Buyer)*.
* `GET    /api/orders` — Retrieve user's orders (role-scoped).
* `GET    /api/orders/:id` — Full order details, timeline, and audit logs.
* `PUT    /api/orders/:id/delivery-status` — Advance delivery state *(Farmer)*.
* `POST   /api/orders/:id/send-otp` — Generate/re-dispatch delivery OTP.
* `POST   /api/orders/:id/verify-otp` — Verify 6-digit OTP & release payout *(Buyer)*.
* `POST   /api/orders/:id/release` — Manual payment release.

### Payments & Webhooks
* `POST   /api/payments/create` — Initialize Razorpay order session.
* `POST   /api/payments/verify` — Verify signature and transition to `PAYMENT_SECURED`.
* `GET    /api/payments/:orderId` — Inspect payment/payout status.
* `POST   /api/webhooks/razorpay` — Signature-verified, idempotent webhook handler.

### Disputes & Platform Governance
* `POST   /api/disputes` — Raise dispute and lock escrow *(Buyer)*.
* `GET    /api/disputes` — View dispute cases.
* `GET    /api/disputes/:id` — View single dispute with case evidence.
* `POST   /api/disputes/:id/resolve` — Arbitrate: Full refund, partial refund, or farmer payout *(Admin only)*.
* `POST   /api/ratings` — Submit 1–5 star rating for completed order.
* `GET    /api/admin/stats` — High-level platform GMV, settlement, and dispute metrics *(Admin)*.
* `GET    /api/admin/orders` — View all system orders *(Admin)*.
* `GET    /api/admin/audit-trail` — Global audit log feed *(Admin)*.

---

## 8. Setup & Installation Instructions

### Prerequisites
* Node.js v18+ (v24 recommended)
* npm v9+
* Optional: MongoDB connection string (Atlas or local). If omitted, an embedded in-memory MongoDB automatically starts with zero configuration!

### Quick Start

#### 1. Configure Environment Variables
In `server/.env`:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=farmpay_super_secret_jwt_key_2026_buildathon_secure
RAZORPAY_KEY_ID=rzp_test_farmpaydemo123
RAZORPAY_KEY_SECRET=demo_razorpay_secret_key_farmpay
RAZORPAY_WEBHOOK_SECRET=demo_webhook_secret_farmpay
DEMO_MODE=true
CLIENT_URL=http://localhost:5173
```

#### 2. Run Backend
```bash
cd server
npm install
npm start
```
*The server boots on port 5000. If the database is fresh, it automatically seeds 5 Farmers, 5 Buyers, 1 Admin, 16 Produce listings, and 7 lifecycle orders.*

#### 3. Run Frontend
```bash
cd client
npm install
npm run dev
```
*The frontend client runs on `http://localhost:5173` with proxy configured to the backend API.*

---

## 9. Demo Credentials

All demo accounts share the password: `FarmPay@123`

| Role | Account Name | Email | Persona Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | Ram Kumar | `ram.farmer@farmpay.demo` | Punjab Grain & Mustard Grower (Rating: ⭐ 4.8) |
| **Farmer** | Sita Devi | `sita.farmer@farmpay.demo` | Maharashtra Horticulture & Tomato Grower (Rating: ⭐ 4.9) |
| **Buyer** | Rohit Mehta | `rohit.buyer@farmpay.demo` | Kisan Mandi Wholesale Regional Buyer |
| **Buyer** | Priya Nair | `priya.buyer@farmpay.demo` | FreshBite Supermarket Chain |
| **Admin** | Platform Admin | `admin@farmpay.demo` | Platform Escrow Arbitrator & Governance |

> **Tip:** You can switch between demo accounts with a single click using the **Quick Switch Demo** bar at the top of the interface!

---

## 10. The Buildathon Master Demo Flow

The application is engineered to showcase this end-to-end journey in under 3 minutes:

1. **Farmer Listing:**
   * Login as Farmer (`ram.farmer@farmpay.demo` or click **🌾 Farmer** in the top bar).
   * Click **List New Produce**.
   * Click the **"Pre-fill Demo Produce"** button to automatically populate: *Tomatoes, 500 kg, ₹30/kg*.
   * Click **Publish Produce Listing**.
2. **Buyer Ordering:**
   * Click **🛒 Buyer** in the top bar to switch to Rohit Mehta.
   * Open the Marketplace, click on **Tomatoes**.
   * Select 100 kg (Total: ₹3,000).
   * Click **Proceed to Escrow Checkout**, fill the address, and click **Secure Order**.
3. **Escrow Payment:**
   * Click **Complete Test Escrow Payment (₹3,000)**.
   * Notice status changes immediately to **Payment Secured** (`PAYMENT_SECURED`).
4. **Farmer Fulfillment:**
   * Switch back to **🌾 Farmer** via the top bar.
   * Open the new ₹3,000 Tomato order.
   * Click **Mark Processing**, then **Mark Out For Delivery**.
   * Click **Mark Delivered & Generate OTP**.
5. **OTP Handshake & Controlled Payout:**
   * Switch back to **🛒 Buyer**.
   * Notice the golden **DEMO OTP READY** banner displaying the 6-digit code (e.g., `742189`).
   * Click **Auto-fill OTP** and click **Confirm & Release Payout**.
   * Status transitions to **Completed & Released** (`COMPLETED`).
   * The farmer payout badge displays: `DEMO MODE — payout simulated`.
6. **Immutable Audit Trail:**
   * Expand the **Immutable Audit Trail** section on the order page to view the recorded events:
     `Order Created` → `Payment Secured` → `Delivery Initiated` → `OTP Verified` → `Delivery Confirmed` → `Payout Completed`.
7. **Dispute & Arbitration Demonstration:**
   * Open pre-seeded Order `#FP-100006-218`.
   * Note that buyer claimed a 36 kg shortage (₹900 refund requested). The payment is locked in escrow and the 24h auto-release countdown is blocked.
   * Switch to **🛡️ Admin** via the top bar.
   * Open the Dispute Center, click **Arbitrate Case**, select **Partial Refund (₹900)**.
   * The buyer receives ₹900 refund, and the remaining ₹2,100 is paid out to the farmer!

---

## 11. Security Implementation
* **Zero Trust in Frontend Input:** All order totals and pricing are calculated exclusively from database records. Frontend prices and totals are completely discarded.
* **Signature Verification:** Razorpay webhook HMAC-SHA256 signatures are verified before processing any payment event.
* **Webhook Idempotency:** The `WebhookEvent` model tracks processed event IDs to prevent duplicate captures, double payouts, or duplicate order state changes.
* **OTP Hash Security:** OTPs are hashed using SHA-256 with attempt rate-limiting (max 3 attempts) and 15-minute expiration windows.
* **Deterministic Financial Rules:** Refund amounts are bounded by the captured payment amount (`refundAmount <= paidAmount`). No payout can be executed more than once.

---

## 12. Known Limitations & Future Improvements
* **Demonstrated Simulation:** In `DEMO_MODE=true`, Razorpay Route transfers and SMS OTPs are cleanly simulated in the application and console without requiring Twilio or live banking credentials.
* **Future Work:**
  * Multi-farmer load aggregation for fractional truckloads.
  * Direct SMS delivery via Twilio / MSG91.
  * AI-powered dispute document OCR analysis and damage validation.
