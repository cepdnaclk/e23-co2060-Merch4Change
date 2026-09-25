# Merch4Change: An Integrated Social Commerce & Philanthropic Giving Platform

**CO2060 — Software Systems Design Project (2YP)**  
*Department of Computer Engineering · Faculty of Engineering · University of Peradeniya, Sri Lanka*

---

![Project Overview](./images/cover_page.jpg)

---

## Academic Information & Team

* **Course Code:** CO2060 — Software Systems Design Project
* **Academic Institution:** Department of Computer Engineering, University of Peradeniya
* **Academic Batch:** E23 (2025/2026)
* **Team:** Group 13 — Team Antigravity
* **Live Deployment:** [merch4change.vercel.app](https://merch4change.vercel.app/)
* **Project Repository:** [github.com/cepdnaclk/e23-co2060-Merch4Change](https://github.com/cepdnaclk/e23-co2060-Merch4Change)

### Engineering Team

| Registration No | Student Name | Assigned Role | University Email |
|:---:|:---|:---|:---|
| **E/23/050** | G.C. Damsiluni | Frontend Developer & UI/UX Designer | [e23050@eng.pdn.ac.lk](mailto:e23050@eng.pdn.ac.lk) |
| **E/23/089** | M.A.S. Dulshara | Database Systems & Infrastructure Engineer | [e23089@eng.pdn.ac.lk](mailto:e23089@eng.pdn.ac.lk) |
| **E/23/343** | S.B.N.S. Samarawickrama | Backend Systems & API Architect | [e23343@eng.pdn.ac.lk](mailto:e23343@eng.pdn.ac.lk) |
| **E/23/347** | S.D.M.P. Sandanayake | Team Leader & Full-Stack Systems Engineer | [e23347@eng.pdn.ac.lk](mailto:e23347@eng.pdn.ac.lk) |

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [The Merch-to-Impact Closed-Loop Architecture](#2-the-merch-to-impact-closed-loop-architecture)
3. [Multi-Sided Stakeholder Roles](#3-multi-sided-stakeholder-roles)
4. [Functional Capabilities & Subsystems](#4-functional-capabilities--subsystems)
5. [System Process Workflows & Flowcharts](#5-system-process-workflows--flowcharts)
   - [5.1 End-to-End User Impact Journey](#51-end-to-end-user-impact-journey)
   - [5.2 Coin Accrual & Atomic Donation Engine](#52-coin-accrual--atomic-donation-engine)
   - [5.3 Live Auction & Real-Time Bidding Mechanics](#53-live-auction--real-time-bidding-mechanics)
   - [5.4 Non-Profit Credentialing & Regulatory Audit Pipeline](#54-non-profit-credentialing--regulatory-audit-pipeline)
6. [System Architecture & Engineering Design](#6-system-architecture--engineering-design)
   - [6.1 High-Level Architecture](#61-high-level-architecture)
   - [6.2 Technology Matrix](#62-technology-matrix)
   - [6.3 Relational & Document Schema Design](#63-relational--document-schema-design)
7. [Security Architecture & Concurrency Safeguards](#7-security-architecture--concurrency-safeguards)
8. [Quality Assurance & Verification Methodology](#8-quality-assurance--verification-methodology)
9. [Project Milestones & Strategic Roadmap](#9-project-milestones--strategic-roadmap)
10. [References & Technical Resources](#10-references--technical-resources)

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Domain
Contemporary digital retail and philanthropic fundraising operate in distinct silos, leading to three systemic inefficiencies:

1. **Philanthropic Friction:** While digital consumers exhibit strong demand for socially responsible consumption, conventional donation funnels are disconnected from day-to-day purchasing activities, producing high friction and drop-off rates.
2. **Asymmetric Information and Verification Deficits:** Grassroots charitable institutions face profound credibility challenges. Lacking standardized verification channels, legitimate causes struggle to gain public trust and funding.
3. **Unrealized Corporate Social Responsibility:** Independent brands and creators lack turn-key software infrastructure to demonstrate direct social impact within their existing sales funnels.

![Figure 1: Architectural Problem Domain](./images/flowchart_problem.svg)
*Figure 1: Systemic market deficits and structural friction separating consumer commerce from philanthropic funding.*

### 1.2 Proposed Resolution
**Merch4Change** resolves this structural disconnect through a unified, multi-sided digital platform that connects ethical merchandise purchases directly with transparent philanthropic allocations via an in-app reward coin economy.

---

## 2. The Merch-to-Impact Closed-Loop Architecture

The platform operates on a closed-loop micro-philanthropic economy:

* **Deterministic Coin Generation:** For every verified merchandise purchase executed via Stripe, buyers automatically accrue Merch Coins calculated deterministically as $\lfloor \text{USD} / 10 \rfloor$ (1 coin per $10 spent).
* **Targeted Cause Allocation:** Consumers direct accrued coins toward specific verified charitable projects.
* **Social Proof & Reputation Incentives:** Total donations dynamically adjust the donor's status across five tiers (Bronze $\rightarrow$ Silver $\rightarrow$ Gold $\rightarrow$ Platinum $\rightarrow$ Diamond), granting verified badges and public leaderboard standing.

![Figure 2: The Merch-to-Impact Value Loop](./images/flowchart_value_loop.svg)
*Figure 2: The closed-loop Merch-to-Impact value cycle converting retail transactions into verifiable social impact.*

---

## 3. Multi-Sided Stakeholder Roles

The system is structured around four primary user personas with distinct operational scopes:

| Persona | Operational Scope & Permissions |
|:---|:---|
| **Conscious Consumers** | Discover and purchase curated merchandise, place real-time bids on limited charity auctions, earn Merch Coins, execute atomic cause donations, monitor project funding progress, and engage via community feeds and 24-hour stories. |
| **Brands & Creators** | Manage branded merchandise storefronts, publish product collections, upload cloud media assets, host timed charity drop auctions, and track verified impact metrics. |
| **Charities & NGOs** | Submit statutory registration documentation for administrative compliance audits, receive verified status badges, publish milestone-driven campaigns, receive atomic coin donations, and showcase physical headquarters on interactive geospatial maps. |
| **Platform Administrators** | Review pending non-profit compliance applications, inspect PDF documentation, grant or revoke verification status, audit system financial ledgers, and supervise content moderation. |

---

## 4. Functional Capabilities & Subsystems

### Multi-Vendor Merchandise Marketplace
* **Catalog Management:** Unified discovery across independent vendors, creator apparel, and official organization merchandise.
* **Multi-Attribute Search:** Parametric query filters spanning categories, price intervals, seller verification tiers, and inventory states.
* **PCI-Compliant Checkout:** Integrated Stripe Checkout Sessions executing card authorization, tax computations, and automated order confirmation webhooks.

### Timed Auction & Bidding Engine
* **Dynamic Bidding Windows:** Real-time countdown timers, automated minimum increment validation, and optimistic concurrency state updates.
* **Participant Notifications:** Automated event dispatch notifying outbid users and updating the active bidding ledger.

### Closed-Loop Coin Economy & Crowdfunding
* **Atomic Deductions:** Transactional coin disbursements updating campaign balances under ACID guarantees.
* **Milestone Visualization:** Real-time progress indicators displaying accumulated funding relative to statutory project targets.

### Non-Profit Governance & Geospatial Discovery
* **Statutory Compliance Queue:** Multi-step credential verification ensuring only vetted organizations can publish campaigns or accept funds.
* **Geospatial Mapping:** Interactive global map rendered using Leaflet and OpenStreetMap displaying verified charity head offices worldwide.

### Social Community & Direct Messaging
* **Algorithmic Activity Stream:** Feed ranking posts according to follower affinity, interaction metrics, and time-decay functions.
* **Ephemeral Stories:** 24-hour expiring media stories and permanent profile highlight reels.
* **Direct Messaging:** One-to-one encrypted messaging threads with deterministic addressing and unread badge counters.

---

## 5. System Process Workflows & Flowcharts

### 5.1 End-to-End User Impact Journey

The complete operational flow from initial registration to verified philanthropic delivery:

![Figure 3: End-to-End User Impact Journey](./images/flowchart_user_journey.svg)
*Figure 3: Sequence of operations from consumer onboarding to charitable impact execution.*

---

### 5.2 Coin Accrual & Atomic Donation Engine

The reward and donation subsystem is built to ensure strict ledger integrity, preventing double-spending and race conditions:

![Figure 4: Coin Generation and Atomic Donation Architecture](./images/flowchart_coin_engine.svg)
*Figure 4: Algorithmic coin accrual calculations and atomic multi-document transaction pipeline.*

---

### 5.3 Live Auction & Real-Time Bidding Mechanics

Ensures valid bid increments, active-window verification, and atomic high-bidder reassignment:

![Figure 5: Live Auction Engine](./images/flowchart_auction_engine.svg)
*Figure 5: Auction scheduling, bid increment validation, and winner determination flow.*

---

### 5.4 Non-Profit Credentialing & Regulatory Audit Pipeline

Rigorous multi-stage vetting process safeguarding donor contributions against unverified entities:

![Figure 6: Charity Verification Pipeline](./images/flowchart_charity_verification.svg)
*Figure 6: Administrative audit pipeline from certificate upload to verified directory indexing.*

---

## 6. System Architecture & Engineering Design

### 6.1 High-Level Architecture

**Merch4Change** employs a modular three-tier client-server architecture:

![Figure 7: Multi-Tier System Architecture](./images/flowchart_architecture.svg)
*Figure 7: Multi-tier architectural boundaries spanning client SPA, API gateway, core domain services, and persistence.*

---

### 6.2 Technology Matrix

| Subsystem | Selected Technologies | Technical Rationale |
|:---|:---|:---|
| **Presentation Tier** | React 19, Vite 7, Tailwind CSS 3.4 | Modern React compiler optimizations, sub-second module reloads, and utility-first responsive layout structures. |
| **Geospatial & Visuals** | Leaflet, React-Leaflet, OpenStreetMap | High-performance raster map rendering for global NGO headquarters without proprietary API licensing constraints. |
| **Backend Runtime** | Node.js (>=18.0.0, ES Modules) | High-throughput asynchronous event loop well suited for concurrent e-commerce and real-time social workloads. |
| **API Gateway Tier** | Express.js 4 | Robust middleware composition, modular resource routers, and defensive HTTP security headers. |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 | Flexible JSON document schemas accommodating polymorphic profile types, dynamic product attributes, and audit logs. |
| **Session Security** | Dual-Token JWT (Memory + HttpOnly Cookie) | In-memory ephemeral access tokens paired with rotated `HttpOnly`, `SameSite=Lax` refresh cookies. |
| **Payment Ingress** | Stripe Checkout API | Fully hosted, PCI-DSS compliant checkout sessions providing secure card processing and webhook notifications. |
| **Media Pipeline** | Cloudinary REST API, Multer (Memory) | In-memory buffering (strict 2MB ceiling) with streaming uploads to Cloudinary CDN, bypassing local disk storage. |
| **Transactional Email** | Resend API & Nodemailer (SMTP) | Multi-provider fallback delivery ensuring reliable OTP transmission during authentication and account recovery. |

---

### 6.3 Relational & Document Schema Design

The document schema establishes relationships between users, merchandise products, purchase orders, verified non-profits, campaigns, and donations:

![Figure 8: Database Entity Relational Overview](./images/flowchart_er_model.svg)
*Figure 8: Entity relationships illustrating document schemas and foreign-key references.*

---

## 7. Security Architecture & Concurrency Safeguards

* **Dual-Token Session Lifecycle:** Ephemeral 15-minute access tokens remain strictly in memory to resist Cross-Site Scripting (XSS). 7-day refresh tokens are isolated inside `HttpOnly`, `Secure`, `SameSite=Lax` cookies to prevent client-side exfiltration and CSRF exploitation.
* **Atomic Concurrency Controls:** Coin deductions and auction bid adjustments utilize MongoDB atomic update operators (`$inc`, `$set`) with precondition filters (e.g., `merchCoins: { $gte: donationAmount }`), guaranteeing that coin balances cannot drop below zero under high concurrency.
* **Defensive Gateway Hardening:** Enforces `helmet` HTTP headers, `express-rate-limit` rate limiters on sensitive endpoints, strict payload validation, and CORS domain whitelisting.
* **In-Memory File Processing:** Uploaded statutory certificates and product media are inspected in memory buffers and streamed directly to Cloudinary, ensuring uninspected files are never written to the server's local file system.

---

## 8. Quality Assurance & Verification Methodology

System reliability is enforced through multi-tier automated test suites:

![Figure 9: Quality Assurance Pipeline](./images/flowchart_testing_strategy.svg)
*Figure 9: Quality assurance pyramid spanning unit tests, endpoint integration, concurrency checks, and continuous integration.*

* **Automated Unit & Integration Tests:** 205 automated test suites executed via the native Node.js test runner (`node --test`), verifying route handlers, security middleware, and helper utilities.
* **Concurrency Verification:** Stress-testing scripts simulating concurrent donation disbursements and rapid bidding sequences to verify data consistency.
* **Continuous Integration (CI):** Automated GitHub Actions workflows enforcing linting standards, build validity, and test suite execution on every pull request.

---

## 9. Project Milestones & Strategic Roadmap

![Figure 10: Implementation Milestones & Strategic Roadmap](./images/flowchart_roadmap.svg)
*Figure 10: Phased project implementation roadmap from initial release to planned enterprise capabilities.*

* **Phase 1: Core Systems (Completed):** Multi-vendor merchandise marketplace, Stripe card checkout, atomic coin donation engine, and charity compliance moderation portal.
* **Phase 2: Social Engagement & Auctions (Completed):** Live timed bidding windows, real-time messaging, ephemeral 24-hour stories, tiered donor badges, and community leaderboards.
* **Phase 3: Scale & Enterprise Governance (Planned):** Native mobile applications (iOS/Android), direct fiat charity contributions, blockchain-anchored audit ledgers, and automated tax deduction reporting.

---

## 10. References & Technical Resources

* **Production Application:** [merch4change.vercel.app](https://merch4change.vercel.app/)
* **Project Source Code:** [github.com/cepdnaclk/e23-co2060-Merch4Change](https://github.com/cepdnaclk/e23-co2060-Merch4Change)
* **System Engineering Handbook:** [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)
* **Backend Verification Handbook:** [code/Backend/TESTING.md](../code/Backend/TESTING.md)
* **Department of Computer Engineering:** [ce.pdn.ac.lk](https://www.ce.pdn.ac.lk/)
* **Faculty of Engineering, University of Peradeniya:** [eng.pdn.ac.lk](https://eng.pdn.ac.lk/)

---

<div align="center">

**Department of Computer Engineering · Faculty of Engineering · University of Peradeniya**  
*CO2060 — Software Systems Design Project (2YP) · Academic Year 2025/2026*

</div>
