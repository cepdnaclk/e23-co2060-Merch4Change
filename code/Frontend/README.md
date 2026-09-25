# 💻 Merch4Change — Frontend Client Application

The modern single-page application (SPA) client for **Merch4Change**, built using **React 19**, **Vite 7**, and **Tailwind CSS**.

---

## 🌟 Overview & Key Features

- **⚡ Lightning-Fast Build & HMR**: Powered by Vite 7 for instantaneous Hot Module Replacement.
- **🎨 Modern Responsive UI**: Styled with Tailwind CSS, supporting dark/light UI modes and responsive layouts for mobile, tablet, and desktop devices.
- **🗺️ Interactive Geolocation Mapping**: Integrated Leaflet & OpenStreetMap (`react-leaflet`) for global charity and NGO headquarters discovery.
- **🔐 Robust Token Handling**: Axios client configured with automatic dual-token refresh interceptors, seamlessly renewing expired access tokens via HttpOnly cookies without interrupting user flow.
- **🪙 Reactive Impact Display**: Real-time coin balances, animated badge updates, live auction countdown timers, and optimistic UI updates for post likes and comments.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) |
| **Build Tooling** | Vite 7 (`@vitejs/plugin-react`) |
| **Styling** | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| **Routing** | React Router v7 (`react-router-dom`) |
| **Icons & Visuals** | Lucide React (`lucide-react`) |
| **Maps & Geospatial** | Leaflet & React-Leaflet (`leaflet`, `react-leaflet`) |
| **HTTP Client** | Axios (`axios`) with custom interceptors |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`

### 2. Installation
From the repository root:
```bash
cd code/Frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in `code/Frontend/`:

```env
# URL pointing to the running backend API gateway
VITE_API_URL=http://localhost:5000

# Stripe Publishable Key (for credit/debit card processing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_sample_key
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 5. Production Build & Preview
```bash
# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Source Code Organization

```
src/
├── assets/          # Static icons, badges, SVG graphics, and default avatars
├── components/      # Domain-specific UI components
│   ├── admin/       # Charity verification modal and moderation tables
│   ├── auctions/    # Live auction countdown timers and bidding cards
│   ├── auth/        # Login, registration, and OTP verification modals
│   ├── charities/   # Charity directory cards and Leaflet HQ map
│   ├── common/      # Reusable buttons, badges, loaders, and input fields
│   ├── layout/      # Navbar, persistent sidebar, and footer
│   ├── marketplace/ # Product cards, catalog filters, and checkout modals
│   ├── messaging/   # Direct chat dialogs, message threads, and unread counters
│   ├── profile/     # Polymorphic profiles for users, brands, and charities
│   └── social/      # Post feed cards, comment sections, and 24h stories
├── context/         # React Context providers (AuthContext, ThemeContext)
├── hooks/           # Custom React hooks (useAuth, useFetch, useDebounce)
├── pages/           # Route views (Home, Shop, Auctions, Charities, Profile, Admin)
├── services/        # Axios API client and endpoint service methods
├── utils/           # Helper formatters (currency, dates, coin calculations)
├── App.jsx          # Route tree configuration
├── index.css        # Tailwind directives and custom animation styles
└── main.jsx         # DOM entrypoint
```

---

## 🧪 Linting & Code Quality

```bash
# Check code with ESLint
npm run lint
```
