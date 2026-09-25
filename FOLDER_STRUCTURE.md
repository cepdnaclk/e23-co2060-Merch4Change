# 📁 Merch4Change — Repository & Folder Structure

This document outlines the organized monorepo-style structure of the **Merch4Change** project, detailing the responsibilities and layout of each directory across the frontend, backend, documentation, and deployment infrastructure.

---

## 🌳 High-Level Repository Tree

```
e23-co2060-Merch4Change/
├── code/
│   ├── Backend/                 # Node.js + Express + Mongoose REST API
│   │   ├── docs/                # Backend internal technical notes & scoring formulas
│   │   ├── logs/                # Server execution and audit logs
│   │   ├── src/                 # Application source code
│   │   │   ├── config/          # Database, Cloudinary, and external services config
│   │   │   ├── controllers/     # Express route handlers & request logic
│   │   │   ├── middleware/      # Auth guards, validation, error handlers & Multer
│   │   │   ├── models/          # Mongoose schemas & data entity models
│   │   │   ├── routes/          # API route definitions and endpoint versioning (v1)
│   │   │   ├── scripts/         # Database seeding and population scripts
│   │   │   ├── services/        # Business logic, atomic transactions & email engines
│   │   │   ├── utils/           # Helper utilities, tokens, sanitizers & custom errors
│   │   │   ├── validators/      # Payload schemas and input validators
│   │   │   ├── app.js           # Express application configuration & middleware stack
│   │   │   └── server.js        # Server entrypoint and database bootstrap
│   │   ├── tests/               # Unit, integration, and security test suites
│   │   ├── .env.example         # Template for backend environment variables
│   │   ├── eslint.config.js     # ESLint configuration
│   │   ├── package.json         # Backend dependencies and test scripts
│   │   └── TESTING.md           # Test suite execution guide
│   │
│   └── Frontend/                # React 19 + Vite 7 + Tailwind CSS Client SPA
│       ├── public/              # Static assets, favicon, and robots.txt
│       ├── src/                 # Client application source code
│       │   ├── assets/          # Static icons, badges, images, and mock avatars
│       │   ├── components/      # Modular, reusable UI components
│       │   │   ├── admin/       # Charity verification & moderation panels
│       │   │   ├── auctions/    # Live auction timers, bidding modals & drop cards
│       │   │   ├── auth/        # Login, registration, and OTP verification modals
│       │   │   ├── charities/   # Charity registration, verified cards & HQ maps
│       │   │   ├── common/      # Shared buttons, badges, loaders & dialog modals
│       │   │   ├── layout/      # Navbar, sidebar, footer & responsive wrappers
│       │   │   ├── marketplace/ # Product cards, filter shelves & product uploaders
│       │   │   ├── messaging/   # Direct chat dialogs, message bubbles & thread list
│       │   │   ├── profile/     # Polymorphic user, brand & NGO profile components
│       │   │   └── social/      # Post cards, comment threads & 24h stories
│       │   ├── context/         # React Context providers (AuthContext, ThemeContext)
│       │   ├── hooks/           # Custom React hooks (useAuth, useFetch, useDebounce)
│       │   ├── pages/           # High-level route views (Home, Shop, Profile, etc.)
│       │   ├── services/        # Axios API clients and endpoint wrappers
│       │   ├── utils/           # Formatters (currency, dates, coin conversions)
│       │   ├── App.jsx          # Root application component & route tree
│       │   ├── index.css        # Tailwind directives and global styles
│       │   └── main.jsx         # Client DOM entrypoint
│       ├── .env.example         # Template for frontend environment variables
│       ├── index.html           # Single Page Application HTML host file
│       ├── package.json         # Frontend dependencies and Vite build scripts
│       ├── tailwind.config.js   # Tailwind CSS theme configuration
│       └── vite.config.js       # Vite bundler configuration & proxy settings
│
├── Documentation/               # Comprehensive System Handbook & Feature Docs
│   ├── dev docs/
│   │   ├── features/            # 17 detailed technical feature specifications
│   │   ├── CORS.pdf             # Cross-origin policy architectural documentation
│   │   ├── Documents.md         # Master index of technical feature guides
│   │   ├── JWT authentication.pdf# Dual-token session security architecture
│   │   └── Node app.pdf         # Request lifecycle & runtime documentation
│   ├── Scrum Meeting Records/   # Agendas and sprint records for Sprints 1–7
│   ├── DEVELOPER_GUIDE.md       # Comprehensive developer handbook & architecture
│   ├── ER_diagram.pdf           # Entity Relationship schema specification
│   └── Gantt chart.pdf          # Semester project timeline and milestone breakdown
│
├── docs/                        # University of Peradeniya Project Showcase (GitHub Pages)
│   ├── data/
│   │   └── index.json           # Department metadata crawler specification (team/supervisors)
│   ├── images/                  # Showcase imagery and diagrams
│   ├── _config.yml              # Jekyll configuration & theme settings
│   └── README.md                # Department project site homepage
│
├── DEVELOPER_GUIDE.md           # Root developer guide & onboarding manual
├── FOLDER_STRUCTURE.md          # Architectural file and directory layout (this document)
├── README.md                    # Root project showcase, badges, and quickstart
└── .gitignore                   # Global git exclusion rules
```

---

## 🔍 Directory Breakdown & Architectural Roles

### 1. `code/Backend/`
Contains the complete Node.js/Express REST API serving JSON responses and managing the stateful business logic.

- **`src/config/`**: Centralized service credentials and database connection initialization (MongoDB Atlas via Mongoose, Cloudinary SDK).
- **`src/controllers/`**: HTTP controllers that validate incoming request payloads, invoke service layers, and format responses according to standard conventions `{ success: true, data: ... }`.
- **`src/middleware/`**: 
  - `auth.middleware.js`: Verifies short-lived JWT access tokens and extracts user claims.
  - `role.middleware.js`: Enforces Role-Based Access Control (`user`, `charity`, `brand`, `admin`).
  - `upload.middleware.js`: In-memory Multer buffering with 2MB file size limits and MIME-type validation.
  - `rateLimiter.middleware.js`: Protects against brute-force attacks on auth and public endpoints.
- **`src/models/`**: Mongoose schema declarations defining indexing strategies, references, and validation rules.
- **`src/routes/`**: Grouped Express routers for resources (`/api/v1/auth`, `/api/v1/products`, `/api/v1/donations`, `/api/v1/auctions`, etc.).
- **`src/services/`**: Pure business logic modules, including atomic coin deduction, order processing, and transactional email dispatches.
- **`src/scripts/`**: Executable scripts for local seeding (`seed.js`, `seedFull.js`) and data migration.
- **`tests/`**: Unit and integration test suites using Node's native test runner.

---

### 2. `code/Frontend/`
The single-page web client built with React 19 and Vite 7.

- **`src/components/`**: Clean, functional React components grouped strictly by functional domain.
- **`src/context/`**: React Context instances providing global reactive states (e.g., current authenticated user, coin balance, notifications counter).
- **`src/hooks/`**: Custom hooks encapsulating reusable browser behaviors, timers, and data-fetching patterns.
- **`src/pages/`**: Primary page views matching top-level routes:
  - `/`: Hero landing page, impact stats, and featured causes.
  - `/shop`: Filterable merchandise marketplace.
  - `/auctions`: Timed bidding marketplace with countdowns.
  - `/charities`: Non-profit directory with interactive HQ map.
  - `/profile/:username`: Polymorphic profile for users, brands, and charities.
  - `/admin`: Moderation dashboard for charity verification.
- **`src/services/apiClient.js`**: Pre-configured Axios client featuring automatic dual-token refresh interceptors with exponential backoff on 401 errors.

---

### 3. `Documentation/`
The complete engineering documentation suite:
- **`dev docs/features/`**: 17 technical feature specifications, each equipped with an Executive Summary, Mermaid sequence diagram, Mongoose schema details, API contract, and concurrency guards.
- **`DEVELOPER_GUIDE.md`**: The exhaustive 1,100+ line developer guide covering engineering standards, testing instructions, and deployment configurations.
- **`Scrum Meeting Records/`**: Archival meeting records for all 7 development sprints documenting attendee sign-offs, sprint goals, and velocity.

---

### 4. `docs/`
Hosts the official academic website published via GitHub Pages for the Department of Computer Engineering, University of Peradeniya:
- Integrated with `cepdnaclk/eYY-project-theme`.
- Governed by `_config.yml` and `data/index.json` which dynamically populate team member e-numbers, roles, and project tags on `projects.ce.pdn.ac.lk`.
- Contains `docs/README.md` serving as the comprehensive project landing page.