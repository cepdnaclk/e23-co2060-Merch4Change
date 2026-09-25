# Merch4Change Developer Documentation & Technical Specifications

**CO2060 — Software Systems Design Project (2YP)**  
*Department of Computer Engineering · Faculty of Engineering · University of Peradeniya, Sri Lanka*

---

Welcome to the technical developer documentation hub for **Merch4Change**. This repository directory houses deep-dive architectural specifications, system runtime guides, and comprehensive feature engineering documents for every subsystem across the full-stack platform.

* **Live Platform Application:** [merch4change.vercel.app](https://merch4change.vercel.app/)
* **Project Repository:** [github.com/cepdnaclk/e23-co2060-Merch4Change](https://github.com/cepdnaclk/e23-co2060-Merch4Change)
* **Master Developer Handbook:** [DEVELOPER_GUIDE.md](../../DEVELOPER_GUIDE.md)
* **Backend Verification Handbook:** [code/Backend/TESTING.md](../../code/Backend/TESTING.md)

---

## 1. System Architecture & Runtime Infrastructure Guides

The platform's runtime dynamics, session security model, and network security policies are formally documented in dedicated architectural guides:

| Architectural Domain | Local Technical Guide | Cloud Mirror | Primary Technical Focus |
|:---|:---|:---|:---|
| **Node.js Runtime & Request Lifecycle** | [Node app.pdf](./Node%20app.pdf) | [Google Doc Mirror](https://docs.google.com/document/d/1-fIyWaSJgPNYAuxys65GwLSmrj6qOO0GDHi6x1HnCWY/edit?usp=sharing) | Event loop orchestration, Express middleware chains, error handling pipelines, and process lifecycle. |
| **JWT Dual-Token Authentication** | [JWT authentication.pdf](./JWT%20authentication.pdf) | [Google Doc Mirror](https://docs.google.com/document/d/1ZPIF6rcTHtDlTAGroXBAlzUB8eRrS_fHoeIvoheenDw/edit?usp=sharing) | Ephemeral in-memory access tokens, HttpOnly refresh cookies, rotation flows, and XSS/CSRF threat mitigation. |
| **CORS Policies & Cross-Origin Security** | [CORS.pdf](./CORS.pdf) | [Google Doc Mirror](https://docs.google.com/document/d/105uE6icVWdQ7i28DfZFmMhclAg_s6iMUd8hdY7DHC58/edit?usp=sharing) | Cross-origin resource sharing whitelisting, preflight handling (`OPTIONS`), credentials header negotiations, and defense-in-depth. |

---

## 2. Architectural Flowcharts & Visual Schemas

System process workflows, state engines, and domain relationships are formally modeled in publication-grade vector diagrams located in [`docs/images/`](../../docs/images/):

1. **Problem Space & Market Deficits:** [`flowchart_problem.svg`](../../docs/images/flowchart_problem.svg) — Structural philanthropic friction and verification asymmetries.
2. **Merch-to-Impact Value Loop:** [`flowchart_value_loop.svg`](../../docs/images/flowchart_value_loop.svg) — Self-reinforcing cycle from purchase to coin donation.
3. **End-to-End User Journey:** [`flowchart_user_journey.svg`](../../docs/images/flowchart_user_journey.svg) — Complete lifecycle from onboarding to realized impact.
4. **Coin Engine & Atomic Ledger:** [`flowchart_coin_engine.svg`](../../docs/images/flowchart_coin_engine.svg) — Algorithmic coin accrual and atomic balance deduction guards.
5. **Live Auction Bidding Engine:** [`flowchart_auction_engine.svg`](../../docs/images/flowchart_auction_engine.svg) — Countdown timers, minimum increments, and outbid dispatch.
6. **Charity Verification Pipeline:** [`flowchart_charity_verification.svg`](../../docs/images/flowchart_charity_verification.svg) — Multi-stage administrative compliance audits.
7. **Multi-Tier System Architecture:** [`flowchart_architecture.svg`](../../docs/images/flowchart_architecture.svg) — Presentation, Gateway, Service, and Data tiers.
8. **Entity-Relationship Model:** [`flowchart_er_model.svg`](../../docs/images/flowchart_er_model.svg) — Document schemas, indexes, and referential keys.
9. **Quality Assurance Strategy:** [`flowchart_testing_strategy.svg`](../../docs/images/flowchart_testing_strategy.svg) — Multi-tiered test execution and automated CI.
10. **Strategic Implementation Roadmap:** [`flowchart_roadmap.svg`](../../docs/images/flowchart_roadmap.svg) — Milestone tracking from MVP to enterprise scale.

---

## 3. Complete Feature Documentation Suite

Every feature engineering specification provides an **Executive Summary**, **Mermaid Sequence Diagram**, **Mongoose Schemas & Indexes**, **RESTful Endpoints Reference**, **Frontend Client Integration (`apiClient`)**, and **Security & Concurrency Defenses**:

| Feature ID | Specification Document | Subsystem Domain | Primary Capabilities & Architectural Scope |
|:---:|:---|:---|:---|
| **01** | [Coin Donations & Social Impact System](./features/01_DONATIONS_AND_IMPACT.md) | Philanthropy | Atomic coin deduction, verified charities, campaign progress, and impact scoring. |
| **02** | [Authentication & Session Management](./features/02_AUTHENTICATION_AND_AUTH.md) | Security | Dual-token authentication (in-memory access + HttpOnly refresh cookie), OTP verification, and auto-refresh. |
| **03** | [Marketplace & Product Catalog](./features/03_MARKETPLACE_AND_PRODUCTS.md) | E-Commerce | Multi-vendor brand shops, creator apparel, parametric filtering, and stock reservation. |
| **04** | [Order Checkout & Coin Reward Engine](./features/04_ORDER_CHECKOUT_AND_COINS.md) | E-Commerce | Inventory verification, Stripe card checkout, deterministic coin earning ($\lfloor \text{USD} / 10 \rfloor$), and order receipts. |
| **05** | [Auctions & Real-Time Bidding System](./features/05_AUCTIONS_AND_BIDDING.md) | Marketplace | Scheduled limited drops, minimum increment validation, high-bidder tracking, and event broadcasts. |
| **06** | [Charities & NGO Verification Workflow](./features/06_CHARITIES_AND_VERIFICATION.md) | Governance | Onboarding pipeline, document upload, admin moderation review queue, and verified badge indexing. |
| **07** | [Charitable Projects & Fundraising Campaigns](./features/07_PROJECTS_AND_CAMPAIGNS.md) | Philanthropy | Initiative campaigns, goal tracking, collected amount logic, and status lifecycle state machines. |
| **08** | [Organization HQ Geolocation & Mapping](./features/08_ORGANIZATION_HQ_MAPPING.md) | Geolocation | React-Leaflet & OpenStreetMap, dynamic Nominatim geocoding, and interactive headquarters pins. |
| **09** | [Unified Profiles & Social Follow System](./features/09_PROFILES_AND_FOLLOW_SYSTEM.md) | Social | Polymorphic routing (`/profile/:username`), follow/unfollow graph, and vendor merchandise showcases. |
| **10** | [Community Posts, Interactions & Comments](./features/10_COMMUNITY_POSTS_AND_LIKES.md) | Social | Algorithmic feed ranking, optimistic like toggling, threaded discussion comments, and notification dispatches. |
| **11** | [Ephemeral Stories & Story Highlights](./features/11_STORIES_AND_HIGHLIGHTS.md) | Social | 24-hour auto-expiring media stories, viewer tracking, and permanent profile highlight reels. |
| **12** | [Direct Messaging System](./features/12_DIRECT_MESSAGING.md) | Real-Time | 1-on-1 private conversations, deterministic `participantKey`, unread counters, and message polling. |
| **13** | [In-App Notifications System](./features/13_NOTIFICATIONS_SYSTEM.md) | Real-Time | Event dispatches (orders, likes, comments, bids, donations), read status toggles, and unread badges. |
| **14** | [Leaderboards, Donor Tiers & Gamified Badges](./features/14_LEADERBOARDS_AND_BADGES.md) | Gamification | Donor tiers (Bronze to Diamond), dynamic timeframe aggregation (week, month, all-time), and milestone badges. |
| **15** | [Global Multi-Entity Search Engine](./features/15_GLOBAL_SEARCH.md) | Discovery | Cross-model parallel querying spanning products, charities, campaigns, and user accounts. |
| **16** | [Admin Moderation & Charity Verification Portal](./features/16_ADMIN_MODERATION.md) | Compliance | Pending non-profit document audits, approve/reject state transitions, and audit activity logging. |
| **17** | [Cloud Media Upload Pipeline](./features/17_MEDIA_UPLOAD_PIPELINE.md) | Infrastructure | Multer memory buffering (strict 2MB limit), streaming Cloudinary uploads, and direct asset delivery. |

---

## 4. Cross-Cutting Engineering Conventions

All services and endpoints conform to unified development standards:

1. **Stateless API Gateway:** All backend endpoints operate statelessly under the `/api/v1` namespace, terminating SSL at edge reverse proxies.
2. **Defensive Session Handling:** Access tokens remain strictly in React client memory. Refresh tokens are secured in `HttpOnly`, `SameSite=Lax`, and `Secure` cookies, eliminating cross-site token theft.
3. **Atomic Concurrency Controls:** Monetary and coin balance mutations utilize conditional MongoDB atomic operators (`$inc`, `$set`, `$push`) with balance precondition guards (`{ coinBalance: { $gte: amount } }`), preventing race conditions.
4. **In-Memory File Processing:** Uploaded images and PDF verification documents are buffered in memory and directly piped to Cloudinary without persisting uninspected binary files to local disk.
5. **Defensive HTTP Hardening:** Helmet security headers, CORS domain whitelisting, and `express-rate-limit` rate-limiting guards protect API surfaces against abuse.

---

## 5. Academic Affiliation & Engineering Team

Developed for **CO2060 — Software Systems Design Project (2YP)**  
**Department of Computer Engineering · Faculty of Engineering · University of Peradeniya, Sri Lanka**

### Project Leadership
| Role | Name |
|---|---|
| **Tech Lead** | **R.A.J.C. Adhikari** |
| **Scrum Master** | **M.N.A. Fikry** |

### Development Team
| Registration No | Student Name | Project Role | Academic Email |
|:---:|:---|:---|:---|
| **E/23/050** | **G.C. Damsiluni** | Frontend Developer & UI/UX Specialist | [e23050@eng.pdn.ac.lk](mailto:e23050@eng.pdn.ac.lk) |
| **E/23/089** | **M.A.S. Dulshara** | Database Systems & Infrastructure Engineer | [e23089@eng.pdn.ac.lk](mailto:e23089@eng.pdn.ac.lk) |
| **E/23/343** | **S.B.N.S. Samarawickrama** | Backend Systems & API Architect | [e23343@eng.pdn.ac.lk](mailto:e23343@eng.pdn.ac.lk) |
| **E/23/347** | **S.D.M.P. Sandanayake** | Team Leader & Full-Stack Systems Engineer | [e23347@eng.pdn.ac.lk](mailto:e23347@eng.pdn.ac.lk) |

---

<div align="center">

**Merch4Change · Team Antigravity (Group 13) · University of Peradeniya · Batch E23**  
*“Shop with purpose. Give with every purchase.”*

</div>