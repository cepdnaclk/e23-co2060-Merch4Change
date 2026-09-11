# Merch4Change Developer Documentation

Welcome to the technical developer documentation for **Merch4Change**. This directory contains architectural guides, system runtime overviews, and exhaustive technical specifications for every feature across the full-stack platform.

---

## 🏛️ System Architecture & Infrastructure Guides

- **Node.js Request Lifecycle & Runtime**
  - Local PDF: [Node app.pdf](./Node%20app.pdf)
  - Google Doc: [https://docs.google.com/document/d/1-fIyWaSJgPNYAuxys65GwLSmrj6qOO0GDHi6x1HnCWY](https://docs.google.com/document/d/1-fIyWaSJgPNYAuxys65GwLSmrj6qOO0GDHi6x1HnCWY/edit?usp=sharing)
- **JWT Dual-Token Authentication System**
  - Local PDF: [JWT authentication.pdf](./JWT%20authentication.pdf)
  - Google Doc: [https://docs.google.com/document/d/1ZPIF6rcTHtDlTAGroXBAlzUB8eRrS_fHoeIvoheenDw](https://docs.google.com/document/d/1ZPIF6rcTHtDlTAGroXBAlzUB8eRrS_fHoeIvoheenDw/edit?usp=sharing)
- **CORS Configuration & Cross-Origin Policies**
  - Local PDF: [CORS.pdf](./CORS.pdf)
  - Google Doc: [https://docs.google.com/document/d/105uE6icVWdQ7i28DfZFmMhclAg_s6iMUd8hdY7DHC58](https://docs.google.com/document/d/105uE6icVWdQ7i28DfZFmMhclAg_s6iMUd8hdY7DHC58/edit?usp=sharing)

---

## 📦 Complete Feature Documentation Suite

Every feature guide includes an **Executive Summary**, **Mermaid Sequence Diagram**, **Mongoose Models**, **API Endpoints (with request/response payloads)**, **Frontend Integration (`apiClient`)**, and **Security/Concurrency Safeguards**.

| # | Feature Documentation Guide | Domain | Key Highlights |
|---|---|---|---|
| **01** | [Coin Donations & Social Impact System](./features/01_DONATIONS_AND_IMPACT.md) | Philanthropy | Atomic coin deduction, verified charities, project progress, impact scoring |
| **02** | [Authentication & Session Management](./features/02_AUTHENTICATION_AND_AUTH.md) | Security | Dual-token (access + HttpOnly refresh cookie), OTP verification, auto-refresh |
| **03** | [Marketplace & Product Catalog](./features/03_MARKETPLACE_AND_PRODUCTS.md) | E-Commerce | Multi-vendor brand shops, individual user products, category filtering |
| **04** | [Order Checkout & Coin Reward Engine](./features/04_ORDER_CHECKOUT_AND_COINS.md) | E-Commerce | Inventory verification, coin earning ($\lfloor \text{USD} / 10 \rfloor$), order receipts |
| **05** | [Auctions & Real-Time Bidding System](./features/05_AUCTIONS_AND_BIDDING.md) | Marketplace | Scheduled drops, bid increments, high-bidder tracking, time validation |
| **06** | [Charities & NGO Verification Workflow](./features/06_CHARITIES_AND_VERIFICATION.md) | Governance | Onboarding flow, admin review queue, verified badges, role promotion |
| **07** | [Charitable Projects & Fundraising Campaigns](./features/07_PROJECTS_AND_CAMPAIGNS.md) | Philanthropy | Initiative campaigns, goal tracking, collected amount logic, status engine |
| **08** | [Organization HQ Geolocation & Mapping](./features/08_ORGANIZATION_HQ_MAPPING.md) | Geolocation | React-Leaflet & OpenStreetMap, live country geocoding, interactive pins |
| **09** | [Unified Profiles & Social Follow System](./features/09_PROFILES_AND_FOLLOW_SYSTEM.md) | Social | Polymorphic routing (`/profile/:username`), follow/unfollow, merchandise shelves |
| **10** | [Community Posts, Interactions & Comments](./features/10_COMMUNITY_POSTS_AND_LIKES.md) | Social | Post creation, optimistic like toggling, threaded comments, notifications |
| **11** | [Ephemeral Stories & Story Highlights](./features/11_STORIES_AND_HIGHLIGHTS.md) | Social | 24-hour auto-expiring media stories, permanent profile highlight collections |
| **12** | [Direct Messaging System](./features/12_DIRECT_MESSAGING.md) | Real-time | 1-on-1 conversations, deterministic `participantKey`, unread counters |
| **13** | [In-App Notifications System](./features/13_NOTIFICATIONS_SYSTEM.md) | Real-time | Event dispatches (orders, likes, donations, bids), unread badges |
| **14** | [Leaderboards, Donor Tiers & Gamified Badges](./features/14_LEADERBOARDS_AND_BADGES.md) | Gamification | Donor tiers (Bronze to Diamond), timeframe rankings (week, month, all-time) |
| **15** | [Global Multi-Entity Search Engine](./features/15_GLOBAL_SEARCH.md) | Discovery | Cross-model parallel querying across products, charities, campaigns, users |
| **16** | [Admin Moderation & Charity Verification Portal](./features/16_ADMIN_MODERATION.md) | Compliance | Pending charity inspection, approve/reject workflows, audit logs |
| **17** | [Cloud Media Upload Pipeline](./features/17_MEDIA_UPLOAD_PIPELINE.md) | Infrastructure | Multer memory buffering (2MB limit), Cloudinary CDN streaming, binary fallback |

---

*Authored by Team Antigravity (CO2060 2YP - University of Peradeniya)*
