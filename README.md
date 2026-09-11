<div align="center">

<img src="https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge" alt="Status" />
<img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
<img src="https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />

# 🛍️ Merch4Change

### *Shop with purpose. Give with every purchase.*

A modern full-stack web platform bridging **conscious shoppers**, **merchants & brands**, and **verified charities** — turning everyday merchandise shopping into tangible social impact via an in-app coin donation engine.

**[🌐 Live Demo](https://e23-co2060-merch4-change-9mp9.vercel.app/)** · **[📚 Developer Docs](./Documentation/dev%20docs/Documents.md)** · **[🛠️ Developer Guide](./DEVELOPER_GUIDE.md)** · **[🧪 Testing Guide](./code/Backend/TESTING.md)** · **[🐛 Report Bug](https://github.com/cepdnaclk/e23-co2060-Merch4Change/issues)**

---

</div>

## 📌 Table of Contents

- [About the Project](#-about-the-project)
  - [The Problem](#-the-problem)
  - [Our Solution](#-our-solution)
- [Key Features](#-key-features)
  - [User Capabilities](#-user-capabilities)
  - [Core Platform Capabilities](#-core-platform-capabilities)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Installation](#step-by-step-installation)
  - [Database Seeding](#database-seeding)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Environment Variables](#-environment-variables)
- [Folder Structure](#-folder-structure)
- [API Overview](#-api-overview)
- [Roadmap](#-roadmap)
- [Development Standards & Git Workflow](#-development-standards--git-workflow)
- [Team](#-team)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 About the Project

**Merch4Change** is developed by **Team Antigravity** from the Department of Computer Engineering, Faculty of Engineering, **University of Peradeniya** as a 2nd Year Project (2YP) for **CO2060**.

### ❗ The Problem
1. **Conscious Fans & Consumers** lack a transparent and unified marketplace where merchandise purchases directly benefit social and charitable causes.
2. **Charities & NGOs** struggle with public discoverability, verified trustworthiness, and scalable donation mechanisms.
3. **Brands, Creators & Individuals** need a platform to sell merchandise while visibly displaying Corporate Social Responsibility (CSR) and community initiatives.

### 💡 Our Solution
> **The Merch-to-Impact Model:** Every time a user makes a merchandise purchase, they earn **Merch Coins** ($\lfloor \text{USD} / 10 \rfloor$). These coins can be atomically donated to admin-verified charities and targeted fundraising campaigns. Transparent leaderboards, tiered donor badges, and community feeds foster a socially conscious e-commerce ecosystem.

---

## ✨ Key Features

### 👥 User Capabilities

| Role | Key Capabilities |
|---|---|
| **Normal Shoppers** | Browse products, purchase merchandise, earn Merch Coins, donate coins to verified charities and projects, follow brands/charities, interact with community posts & stories, message peers, earn donor rank badges. |
| **Brands & Merchants** | Dedicated brand storefronts, product catalog management, Cloudinary-powered media uploads, track orders and sales impact, showcase corporate philanthropy. |
| **Charities & NGOs** | Document submission for admin verification, verified badge status, create targeted fundraising campaigns/projects, accept direct and coin-based donations, showcase HQ on interactive maps. |
| **Admins & Moderators** | Charity verification portal (inspect registration proofs, approve/reject applications), content moderation, platform audits, user status controls. |

### 🚀 Core Platform Capabilities

- **🔐 Robust Dual-Token Authentication & Security**:
  - JWT access tokens accompanied by secure `HttpOnly`, `SameSite` refresh token cookies.
  - Email OTP verification powered by `nodemailer`.
  - Account state enforcement (inactive/suspended user isolation).
  - Rate limiting on API and authentication routes (`express-rate-limit`), security headers (`helmet`), and CORS protection.
- **🪙 Coin Donation & Social Impact Engine**:
  - Atomic coin transactions preventing race conditions and double-spending.
  - Direct donations to verified charities or specific charitable fundraising projects.
  - Automatic progress calculation against campaign target goals.
- **🛍️ Dynamic Marketplace & Multi-Vendor Shelves**:
  - Support for multi-vendor brand storefronts and individual user-uploaded merchandise.
  - Category filtering, price sorting, and dynamic product showcases.
  - Responsive modals for instant product creation.
- **📱 Social Feed, Community Posts & Ephemeral Stories**:
  - Social feed with optimistic like animations, counts, and threaded commenting.
  - 24-hour auto-expiring media stories and permanent highlight collections.
  - Polymorphic profile pages (`/profile/:username`) for both individual users and organizations with donor lists, project catalogs, and community tabs.
- **💬 Direct Messaging & Notifications**:
  - 1-on-1 private messaging with deterministic participant keys and unread counters.
  - In-app notification center dispatching alerts for orders, donations, likes, and bids.
- **🏆 Gamified Leaderboards & Donor Tiers**:
  - Standardized donor ranking tiers: **Diamond**, **Platinum**, **Gold**, **Silver**, and **Bronze**.
  - Dynamic time-filter rankings (weekly, monthly, and all-time) with deterministic tie-breaking.
- **🗺️ Interactive Geolocation Mapping**:
  - Organization headquarters plotted dynamically using **React-Leaflet** and **OpenStreetMap**.
- **🔍 Multi-Entity Global Search**:
  - Parallel cross-model querying across products, charities, campaigns, and user profiles.
- **🎨 Modern UI & Informational Hub**:
  - Fully responsive, glassmorphic design built with React 19 and Tailwind CSS.
  - Dedicated pages: Landing page with hero text animations, Our Story, Our Mission, Our Team, FAQ, Help & Support, and Contact.

---

## 🛠 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite](https://vite.dev/) |
| **Styling & Icons** | [Tailwind CSS](https://tailwindcss.com/) · [Lucide React](https://lucide.dev/) |
| **State & Routing** | React Context API · [React Router v7](https://reactrouter.com/) |
| **Maps & Geolocation** | [React-Leaflet](https://react-leaflet.js.org/) · [Leaflet](https://leafletjs.com/) · OpenStreetMap |
| **HTTP Client & Toast** | [Axios](https://axios-http.com/) · [React Hot Toast](https://react-hot-toast.com/) |
| **Backend Runtime** | [Node.js](https://nodejs.org/) (>= 18.0.0, ES Modules) + [Express.js](https://expressjs.com/) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) + [Mongoose ODM](https://mongoosejs.com/) |
| **Authentication** | JWT (Dual-Token: Access + Refresh) · [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) · [Nodemailer](https://nodemailer.com/) (OTP) |
| **Security & Middleware** | [Helmet](https://helmetjs.github.io/) · [CORS](https://github.com/expressjs/cors) · [Cookie-Parser](https://github.com/expressjs/cookie-parser) · [Express Rate Limit](https://express-rate-limit.mintlify.app/) |
| **Media Uploads** | [Multer](https://github.com/expressjs/multer) · [Cloudinary SDK](https://cloudinary.com/) · [Streamifier](https://github.com/valeriangalliat/node-streamifier) |
| **Testing** | [Vitest](https://vitest.dev/) & React Testing Library (Frontend) · Node.js Native Test Runner (Backend) |
| **Deployment & Analytics** | [Vercel](https://vercel.com/) (Frontend & Analytics) · Cloud / Container ready (Backend) |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                               │
│            React 19  ·  Vite  ·  Tailwind CSS  ·  React-Leaflet         │
│                       Hosted on Vercel Edge                             │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / REST (Axios + Cookies)
┌────────────────────────────────────▼────────────────────────────────────┐
│                             API GATEWAY                                 │
│          Node.js (v18+) + Express.js  ·  Helmet  ·  CORS  ·  RateLimit  │
│                                                                         │
│  ┌────────────────────────┬────────────────────────┬─────────────────┐  │
│  │   Auth & OTP Engine    │  Marketplace & Products│ Donation Engine │  │
│  ├────────────────────────┼────────────────────────┼─────────────────┤  │
│  │   Profiles & Social    │  Posts & Stories       │ Messaging & Notif│  │
│  ├────────────────────────┼────────────────────────┼─────────────────┤  │
│  │   Charity Verification │  Leaderboards & Badges │ Global Search   │  │
│  └────────────────────────┴────────────────────────┴─────────────────┘  │
│                                    │                                    │
│        Cloudinary CDN Stream       │ Mongoose ODM                       │
└────────────────┬───────────────────┼────────────────────────────────────┘
                 │                   │
┌────────────────▼───────────────┐ ┌─▼────────────────────────────────────┐
│         MEDIA STORAGE          │ │              DATABASE                │
│    Cloudinary Asset Cloud      │ │        MongoDB Atlas / Replica       │
└────────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)
- [Git](https://git-scm.com/)

---

### Step-by-Step Installation

#### 1. Clone the repository
```bash
git clone https://github.com/cepdnaclk/e23-co2060-Merch4Change.git
cd e23-co2060-Merch4Change
```

#### 2. Set up Backend dependencies
```bash
cd code/Backend
npm install
```

#### 3. Set up Frontend dependencies
```bash
cd ../Frontend
npm install
```

---

### 🔐 Environment Variables

#### Backend (`code/Backend/.env`)
Create a `.env` file inside `code/Backend/`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/merch4change

# JWT Authentication
JWT_SECRET=your_super_secret_access_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_REFRESH_EXPIRES_IN=60d

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email OTP Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
OTP_EXPIRE_MIN=5

# Rate Limiting (Optional overrides)
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

#### Frontend (`code/Frontend/.env`)
Create a `.env` file inside `code/Frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

### 📦 Database Seeding

Populate the database with pre-configured mock data (admin accounts, standard users, organizations, luxury products, and active charity projects):

```bash
cd code/Backend
node src/scripts/seed.js
```

---

### 💻 Running the Application

#### Start the Backend API server:
```bash
cd code/Backend
npm run dev
```
> The API server will boot up at `http://localhost:5000`.

#### Start the Frontend Vite dev server:
```bash
cd code/Frontend
npm run dev
```
> The client will be available at `http://localhost:5173`.

---

### 🧪 Running Tests

#### Backend Tests (Node.js Native Test Runner)
```bash
cd code/Backend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run all tests (unit + integration)
npm run test:all
```

#### Frontend Tests (Vitest + React Testing Library)
```bash
cd code/Frontend

# Run tests in interactive watch mode
npm test

# Run single test run
npm run test:run
```

---

## 📁 Folder Structure

```
e23-co2060-Merch4Change/
│
├── code/
│   ├── Backend/                           # Node.js + Express REST API
│   │   ├── src/
│   │   │   ├── config/                    # Environment, DB & Cloudinary configs
│   │   │   ├── controllers/               # Route business logic handlers
│   │   │   ├── middlewares/               # Auth, role check, upload, rate limit, error handlers
│   │   │   ├── models/                    # Mongoose database schemas
│   │   │   ├── routes/                    # Express route declarations
│   │   │   ├── scripts/                   # Database seeding and migration scripts
│   │   │   ├── utils/                     # Token generators, email, logger utilities
│   │   │   ├── app.js                     # Express application setup
│   │   │   └── server.js                  # HTTP server entrypoint
│   │   ├── tests/                         # Unit and integration test suites
│   │   ├── package.json
│   │   └── TESTING.md                     # Backend testing guide
│   │
│   └── Frontend/                          # React 19 + Vite Client
│       ├── public/                        # Static assets
│       ├── src/
│       │   ├── api/                       # Centralized Axios API client services
│       │   ├── assets/                    # Platform graphics, banners, icons
│       │   ├── components/                # Reusable UI components (Navbar, Modals, etc.)
│       │   ├── context/                   # React Context providers (AuthContext, etc.)
│       │   ├── hooks/                     # Custom hooks (useSearch, etc.)
│       │   ├── pages/                     # Application pages
│       │   │   ├── About/                 # Our Story, Mission, Team pages
│       │   │   ├── Admin/                 # Charity verification admin queue & review
│       │   │   ├── Charity/               # Charity registration & verification form
│       │   │   ├── Donate/                # Project donation checkout
│       │   │   ├── Donations/             # Public donations & impact hub
│       │   │   ├── HelpAndSupport/        # FAQ, Contact, and Support articles
│       │   │   ├── Home/                  # User home feed & stories
│       │   │   ├── Landing/               # Hero landing page
│       │   │   ├── Leaderboard/           # Donor tiers & community leaderboards
│       │   │   ├── Marketplace/           # Merch shopping & product catalogue
│       │   │   ├── Messaging/             # 1-on-1 direct messaging
│       │   │   ├── Notification/          # User notification center
│       │   │   ├── Search/                # Global multi-entity search
│       │   │   ├── Settings/              # Account settings
│       │   │   ├── SignUp/                # Multi-step signup flow
│       │   │   ├── UserProfile/           # Polymorphic user & org profile
│       │   │   └── VerifyOtp/             # Email OTP confirmation page
│       │   ├── App.jsx                    # Route hierarchy & protected route wrappers
│       │   ├── main.jsx                   # React DOM entrypoint
│       │   └── index.css                  # Global Tailwind CSS configurations
│       ├── tests/                         # Vitest component and unit test suites
│       └── package.json
│
├── Documentation/                         # Architectural & academic documentation
│   ├── dev docs/                          # In-depth technical guides & 17 feature specs
│   │   ├── features/                      # Deep-dive specs per feature domain
│   │   └── Documents.md                   # Feature documentation index
│   └── Scrum Meeting Records/             # Agile meeting logs
│
├── DEVELOPER_GUIDE.md                     # Coding standards and Git conventions
├── FOLDER_STRUCTURE.md                    # Architecture layout reference
└── README.md                              # Main project documentation
```

---

## 🔌 API Overview

All API endpoints are prefixed with `/api/v1` (with the exception of `/api/search`).

| Domain | Method | Endpoint | Description | Auth Required |
|---|---|---|---|:---:|
| **Auth** | `POST` | `/api/v1/auth/register` | Register pending user and send email OTP | ❌ |
| | `POST` | `/api/v1/auth/verify-otp` | Verify OTP and activate user account | ❌ |
| | `POST` | `/api/v1/auth/login` | Login with credentials, receive access token & cookie | ❌ |
| | `POST` | `/api/v1/auth/refresh-token` | Exchange refresh cookie for a fresh access token | ❌ |
| | `POST` | `/api/v1/auth/logout` | Clear refresh token cookie and invalidate session | ❌ |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated user data & coin balance | ✅ |
| **Marketplace & Products** | `GET` | `/api/v1/marketplace` | Browse products with filters & pagination | ❌ |
| | `GET` | `/api/v1/products/:id` | Fetch specific product details | ❌ |
| | `POST` | `/api/v1/products` | Create a new user/brand merchandise product | ✅ |
| | `GET` | `/api/v1/products/user/:username` | Fetch products created by a specific user | ❌ |
| **Donations & Charities** | `GET` | `/api/v1/charities` | List all verified charity organizations | ❌ |
| | `POST` | `/api/v1/charities/verify` | Submit charity documents for verification | ✅ |
| | `POST` | `/api/v1/donations` | Donate Merch Coins to a charity or project | ✅ |
| | `GET` | `/api/v1/donations/history` | Retrieve user coin donation history | ✅ |
| **Admin** | `GET` | `/api/v1/admin/charities/pending` | Fetch unverified charity review queue | ✅ (Admin) |
| | `POST` | `/api/v1/admin/charities/:id/status` | Approve or reject charity verification | ✅ (Admin) |
| **Social & Feed** | `GET` | `/api/v1/posts` | Fetch public feed posts | ✅ |
| | `POST` | `/api/v1/posts` | Create a community post | ✅ |
| | `POST` | `/api/v1/posts/:id/like` | Like or unlike a post | ✅ |
| | `POST` | `/api/v1/posts/:id/comment` | Add comment to a post | ✅ |
| | `GET` | `/api/v1/stories` | Retrieve 24-hour active stories | ✅ |
| | `POST` | `/api/v1/stories` | Upload a 24-hour media story | ✅ |
| **Direct Messaging** | `GET` | `/api/v1/messages/conversations` | List conversation threads with unread counts | ✅ |
| | `GET` | `/api/v1/messages/:participantId` | Retrieve message thread with a user | ✅ |
| | `POST` | `/api/v1/messages/:participantId` | Send a direct message | ✅ |
| **Notifications** | `GET` | `/api/v1/notifications` | Fetch unread and recent user notifications | ✅ |
| | `PATCH`| `/api/v1/notifications/:id/read` | Mark a notification as read | ✅ |
| **Leaderboards** | `GET` | `/api/v1/leaderboards/donors` | Get ranked donors with standardized tiers | ✅ |
| | `GET` | `/api/v1/leaderboards/charities` | Get top-impact charities | ❌ |
| **Discovery** | `GET` | `/api/search` | Global cross-entity search (products, charities, users) | ✅ |

> For comprehensive schema models, payloads, and sequence diagrams, refer to [Developer Documentation](./Documentation/dev%20docs/Documents.md).

---

## 🗺 Roadmap

### Semester 3 (Completed Milestones)
- [x] Comprehensive project proposal & system design
- [x] Initial repository structure and developer guides
- [x] Frontend scaffolding with React 19 & Tailwind CSS
- [x] Continuous deployment pipeline on Vercel
- [x] Dual-token authentication with HttpOnly cookies & email OTP
- [x] Cloudinary media upload integration (Multer buffering + cloud CDN)
- [x] Unified profile architecture (`/profile/:username`)
- [x] Comprehensive database seeding script (`seed.js`)

### Semester 4 (Current & Planned)
- [x] Coin earning engine upon merchandise checkout
- [x] Atomic coin donation engine & charity impact metrics
- [x] Charity verification workflow & Admin moderation portal
- [x] Dynamic HQ mapping with React-Leaflet & OpenStreetMap
- [x] Community engagement: Post likes, threaded comments, and activity feeds
- [x] Ephemeral 24-hour Stories & permanent Highlight collections
- [x] 1-on-1 Direct Messaging system with unread counters
- [x] In-app notification center
- [x] Donor leaderboards & gamified badges (Diamond to Bronze tiers)
- [x] Global cross-entity search engine
- [x] Redesigned public experience (Landing animations, Story, Mission, Team, FAQ, Help)
- [ ] Auction system with real-time bidding for limited drops
- [ ] Stripe payment gateway integration for real-currency checkout
- [ ] Socket.io real-time streaming for live chat & auction updates
- [ ] Mobile-optimized Progressive Web App (PWA) enhancements

---

## 📐 Development Standards & Git Workflow

Please follow the guidelines established in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md):

1. **Branching Strategy**:
   - `main`: Production-ready release branch.
   - `dev`: Primary integration branch.
   - `feature/<feature-name>`: Dedicated feature development branches.
   - `fix/<issue-name>`: Bug fixes and patches.

2. **Conventional Commits**:
   Format: `<type>[optional scope]: <description>`
   - `feat`: New user-facing feature
   - `fix`: Bug fix
   - `docs`: Documentation modifications
   - `style`: Visual styling, whitespace, or layout updates
   - `refactor`: Code improvements without behavior changes
   - `test`: Adding or correcting tests
   - `chore`: Tooling, dependencies, or configuration updates

---

## 👨‍💻 Team

**Team Antigravity** · Group 13 · Department of Computer Engineering · University of Peradeniya

| Name | Role | Email |
|---|---|---|
| **R.A.J.C. Adhikari** | Tech Lead | |
| **M.N.A. Fikry** | Scrum Master | |
| **S.D.M.P. Sandanayake** | Team Leader | [e23347@eng.pdn.ac.lk](mailto:e23347@eng.pdn.ac.lk) |
| **S.B.N.S. Samarawickrama** | Backend Developer | [e23343@eng.pdn.ac.lk](mailto:e23343@eng.pdn.ac.lk) |
| **M.A.S. Dulshara** | Database Manager | [e23089@eng.pdn.ac.lk](mailto:e23089@eng.pdn.ac.lk) |
| **G.C. Damsiluni** | Frontend Developer | [e23050@eng.pdn.ac.lk](mailto:e23050@eng.pdn.ac.lk) |

- **Institution:** Faculty of Engineering, University of Peradeniya, Sri Lanka
- **Module:** CO2060 — 2nd Year Project (2YP)
- **Batch:** E23

---

## 🙏 Acknowledgements

- [Department of Computer Engineering, University of Peradeniya](https://www.ce.pdn.ac.lk/)
- [React Documentation](https://react.dev/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Cloudinary](https://cloudinary.com/)
- [React Leaflet & OpenStreetMap](https://react-leaflet.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

Made with ❤️ by **Team Antigravity** · University of Peradeniya · E23 Batch

*"Shop with purpose. Give with every purchase."*

</div>
