# Merch4Change — Backend REST API

The high-performance RESTful API powering **Merch4Change**, built using **Node.js (>= 18.0.0, ES Modules)**, **Express.js**, and **MongoDB Atlas (Mongoose ODM)**.

---

## Overview & Key Capabilities

- **Dual-Token Authentication**: Short-lived JWT access tokens in memory coupled with secure, `HttpOnly`, `SameSite=Lax` refresh token cookies.
- **Transactional Email Verification**: Automatic OTP verification on signup with dual dispatch via Resend HTTPS API and Nodemailer SMTP fallback.
- **Real-Currency Stripe Checkout**: Stripe Checkout Sessions with post-payment order completion and atomic Merch Coin credit ($\lfloor \text{USD} / 10 \rfloor$).
- **Concurrency-Safe Coin Donations**: Atomic transactions ensuring user coin balances cannot fall below zero under concurrent donation attempts.
- **Live Auctions Engine**: Time-validated bidding with automated minimum increment checks and high-bidder tracking.
- **Memory-Buffered Cloud Media Pipeline**: Multer memory storage (2MB limit) streaming directly to Cloudinary CDN, leaving zero residual files on the server host.
- **Defensive API Hardening**: `helmet` security headers, `express-rate-limit` brute-force defense, CORS origin whitelisting, and strict request validation.

---

## Technology Stack

| Category | Technology |
|---|---|
| **Runtime & Framework** | Node.js (>=18.0.0), Express.js 4 (ES Modules) |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 |
| **Authentication & Cryptography** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Payment Gateway** | Stripe SDK (`stripe`) |
| **Cloud Storage** | Cloudinary SDK (`cloudinary`, `streamifier`) |
| **Email Services** | Nodemailer & Resend |
| **Security & Middleware** | `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `morgan` |
| **Testing** | Node.js Built-in Test Runner (`node --test`) |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **MongoDB**: Running local instance or MongoDB Atlas connection URI

### 2. Installation
From the repository root:
```bash
cd code/Backend
npm install
```

### 3. Environment Variables
Create a `.env` file in `code/Backend/` (or copy `.env.example`):

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/merch4change

# Authentication Secrets
JWT_SECRET=your_super_secret_access_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_sample_key
STRIPE_WEBHOOK_SECRET=whsec_sample_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Dispatch
RESEND_API_KEY=re_sample_key
EMAIL_USER=your_smtp_email@gmail.com
EMAIL_PASS=your_smtp_app_password
```

### 4. Database Seeding
To populate mock users, charities, products, and campaigns:

```bash
# Standard seed (basic data)
npm run seed

# Full comprehensive seed
npm run seed:full
```

### 5. Running the Server
```bash
# Development mode with hot-reloading (nodemon)
npm run dev

# Production mode
npm start
```
The API server will listen on `http://localhost:5000`.

---

## Testing & Linting

The backend utilizes Node's high-speed native test runner:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run all test suites
npm run test:all

# Run ESLint validation
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

For more in-depth testing scenarios, refer to [`TESTING.md`](./TESTING.md).

---

## Source Code Organization

```
src/
├── config/          # MongoDB, Cloudinary, and external services config
├── controllers/     # Express route handlers & business coordination
├── middleware/      # Auth guards, role checks, rate limiters & Multer
├── models/          # Mongoose schemas (User, Product, Order, Charity, etc.)
├── routes/          # API route definitions (/api/v1/auth, /api/v1/products, etc.)
├── scripts/         # Seeding and database migration scripts
├── services/        # Business logic, atomic coin ops, email engines
├── utils/           # Helper utilities, tokens, sanitizers, custom API errors
├── validators/      # Payload validators for user input
├── app.js           # Express app setup, CORS, security headers, route mounting
└── server.js        # Entrypoint starting HTTP server and DB connection
```
