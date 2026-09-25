---
layout: home
permalink: index.html

repository-name: e23-co2060-Merch4Change
title: Merch4Change
---

<div align="center">

# Merch4Change

### *Shop with purpose. Give with every purchase.*

A multi-sided social commerce platform bridging **conscious consumers**, **ethical brands & creators**, and **verified charities** — turning everyday merchandise shopping into measurable social impact.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Enabled-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

[Live Demo](https://merch4change.vercel.app/) · [GitHub Repository](https://github.com/cepdnaclk/e23-co2060-Merch4Change) · [Technical Documentation](https://github.com/cepdnaclk/e23-co2060-Merch4Change/tree/main/Documentation)

<br/>

![Merch4Change Cover](./images/cover_page.jpg)

</div>

---

## Academic Affiliation & Team

* **Institution:** Department of Computer Engineering, Faculty of Engineering, University of Peradeniya, Sri Lanka
* **Course:** CO2060 — Software Systems Design Project (2YP)
* **Academic Batch:** E23 · Academic Year 2025/2026
* **Project Team:** Team Antigravity (Group 13)

### Development Team

| eNumber | Name | Primary Role | Contact |
|---|---|---|---|
| **E/23/050** | G.C. Damsiluni | Frontend Developer & UI/UX Designer | [e23050@eng.pdn.ac.lk](mailto:e23050@eng.pdn.ac.lk) |
| **E/23/089** | M.A.S. Dulshara | Database Manager & Systems Engineer | [e23089@eng.pdn.ac.lk](mailto:e23089@eng.pdn.ac.lk) |
| **E/23/343** | S.B.N.S. Samarawickrama | Backend Developer & API Architect | [e23343@eng.pdn.ac.lk](mailto:e23343@eng.pdn.ac.lk) |
| **E/23/347** | S.D.M.P. Sandanayake | Team Leader & Full-Stack Developer | [e23347@eng.pdn.ac.lk](mailto:e23347@eng.pdn.ac.lk) |

---

## Table of Contents

1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Proposed Solution & The Merch-to-Impact Model](#2-proposed-solution--the-merch-to-impact-model)
3. [Multi-Sided Stakeholder Roles](#3-multi-sided-stakeholder-roles)
4. [Functional Capabilities & Feature Suite](#4-functional-capabilities--feature-suite)
5. [Process Workflows & System Flowcharts](#5-process-workflows--system-flowcharts)
   - [5.1 End-to-End User Impact Journey](#51-end-to-end-user-impact-journey)
   - [5.2 Coin Reward & Atomic Donation Engine](#52-coin-reward--atomic-donation-engine)
   - [5.3 Live Auction & Real-Time Bidding Window](#53-live-auction--real-time-bidding-window)
   - [5.4 Charity Compliance & Administrative Verification](#54-charity-compliance--administrative-verification)
6. [System Architecture & Engineering Design](#6-system-architecture--engineering-design)
   - [6.1 High-Level Architecture](#61-high-level-architecture)
   - [6.2 Technology Matrix](#62-technology-matrix)
   - [6.3 Database Schema & Entity Relationships](#63-database-schema--entity-relationships)
7. [Security Architecture & Concurrency Safeguards](#7-security-architecture--concurrency-safeguards)
8. [Testing Strategy & Quality Assurance](#8-testing-strategy--quality-assurance)
9. [Conclusion & Future Roadmap](#9-conclusion--future-roadmap)
10. [Links & Technical References](#10-links--technical-references)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem Space
In modern e-commerce and digital philanthropy, three structural market inefficiencies persist:

1. **Frictional Philanthropic Giving:** While consumers express a strong willingness to support social and environmental causes, traditional donation flows remain disconnected from routine retail purchases, leading to high transaction abandonment.
2. **Asymmetric Information & Trust Deficit:** Non-profit organizations face severe donor skepticism. Without strict accreditation and transparent allocation tracking, grassroots charities struggle to establish legitimacy and attract micro-donations.
3. **Unrealized CSR for Brands & Creators:** Commercial brands and merchandise creators lack native, unified tools to demonstrate corporate social responsibility (CSR) directly within their sales funnels.

![Figure 1.1: Problem Statement](./images/flowchart_problem.svg)
*Figure 1.1: The philanthropic friction and credibility deficit in contemporary digital commerce.*

### 1.2 The Opportunity
By unifying **multi-vendor merchandise commerce**, **algorithmic micro-donation incentives**, and **formal compliance auditing**, **Merch4Change** establishes a self-reinforcing flywheel where routine commercial transactions fund vetted philanthropic initiatives.

---

## 2. Proposed Solution & The Merch-to-Impact Model

**Merch4Change** introduces a closed-loop micro-philanthropic economy:

* **Automated Coin Accrual:** Every verified Stripe checkout awards the buyer **Merch Coins** calculated deterministically as $\lfloor \text{USD} / 10 \rfloor$ (1 coin per $10 spent).
* **Targeted Philanthropic Allocation:** Shoppers direct their earned coins to admin-vetted charities or specific community development initiatives.
* **Reputation & Social Incentives:** Cumulative donations dynamically elevate users across five donor tiers (Bronze, Silver, Gold, Platinum, Diamond), unlocking achievement badges, community rankings, and public showcase vaults.

![Figure 2.1: The Merch-to-Impact Core Value Loop](./images/flowchart_value_loop.svg)
*Figure 2.1: The self-sustaining Merch-to-Impact flywheel.*

---

## 3. Multi-Sided Stakeholder Roles

The platform provides dedicated, role-scoped workflows for four key user segments:

| Persona | Primary Capabilities & Permissions |
|---|---|
| **Conscious Shoppers** | Discover curated merchandise, place real-time bids on limited charity drops, complete Stripe payments, earn Merch Coins, execute atomic donations, monitor campaign progress, and interact via community feeds and 24-hour stories. |
| **Brands & Creators** | Manage branded storefronts, list product lines, upload cloud-hosted media assets, schedule limited-edition auction drops, and track verifiable social impact metrics. |
| **Charities & NGOs** | Submit statutory registration certificates for admin audit, receive verified status badges, publish project fundraising campaigns, accept direct coin donations, and showcase headquarters on interactive global maps. |
| **Platform Administrators** | Review pending non-profit compliance applications, inspect uploaded verification documents, approve or reject organizations, audit platform transactions, and enforce community moderation. |

---

## 4. Functional Capabilities & Feature Suite

### Multi-Vendor Merchandise Marketplace
* **Multi-Storefront Support:** Unified catalog supporting independent brand storefronts and verified merchandise vendors.
* **Multi-Dimensional Discovery:** Instant filtering by product category, price intervals, vendor verification status, and popularity.
* **Production-Grade Checkout:** Fully integrated with Stripe Checkout Sessions for PCI-compliant payment card processing.

### Live Auctions & Timed Bidding Engine
* **Exclusive Charity Drops:** Real-time auction system for limited merchandise and fundraising memorabilia.
* **Algorithmic Increment Enforcement:** Dynamic countdown timers, automated minimum increment validation, and optimistic high-bidder resolution.

### Closed-Loop Coin Economy & Project Crowdfunding
* **Atomic Micro-Donations:** Concurrency-safe coin transfers updating campaign goal progress with transactional ACID consistency.
* **Visual Progress Tracking:** Real-time fundraising meters reflecting aggregate contributions against milestone goals.

### Non-Profit Governance & Geospatial Discovery
* **Administrative Audit Queue:** Strict credential verification ensuring that only legally recognized charitable organizations can accept donations.
* **Interactive HQ Mapping:** Global geospatial mapping powered by Leaflet and OpenStreetMap displaying verified charity head offices.

### Community Engagement, Stories & Messaging
* **Algorithmic Activity Feed:** Social feed ranking posts by follower affinity, engagement metrics, and recency decay.
* **Ephemeral Stories:** 24-hour auto-expiring media stories and permanent profile highlight reels.
* **Secure Direct Messaging:** One-on-one real-time conversation threads with deterministic participant addressing and unread badge counters.

---

## 5. Process Workflows & System Flowcharts

### 5.1 End-to-End User Impact Journey

The complete user lifecycle from registration to realized social impact:

![Figure 5.1: End-to-End User Impact Journey](./images/flowchart_user_journey.svg)
*Figure 5.1: Sequence of operations from shopper onboarding to community impact delivery.*

---

### 5.2 Coin Reward & Atomic Donation Engine

The coin economy is engineered for atomic consistency, preventing race conditions and double-spending:

![Figure 5.2: Coin Reward and Atomic Donation Engine](./images/flowchart_coin_engine.svg)
*Figure 5.2: Coin generation logic and multi-document atomic transaction pipeline.*

---

### 5.3 Live Auction & Real-Time Bidding Window

Ensures bid validity, active-window enforcement, and fair outbid notifications:

![Figure 5.3: Live Auction and Real-Time Bidding Window](./images/flowchart_auction_engine.svg)
*Figure 5.3: Auction scheduling, bid increment validation, and winner determination flow.*

---

### 5.4 Charity Compliance & Administrative Verification

Multi-stage accreditation safeguarding donor funds against fraudulent non-profit entities:

![Figure 5.4: Charity Verification and Compliance Pipeline](./images/flowchart_charity_verification.svg)
*Figure 5.4: Non-profit verification pipeline from document submission to directory listing.*

---

## 6. System Architecture & Engineering Design

### 6.1 High-Level Architecture

**Merch4Change** is architected as a modular three-tier distributed web application:

![Figure 6.1: High-Level System Architecture](./images/flowchart_architecture.svg)
*Figure 6.1: Full-stack tier breakdown from client SPA to persistence and external cloud services.*

---

### 6.2 Technology Matrix

| Subsystem | Technologies | Engineering Rationale |
|---|---|---|
| **Frontend Framework** | React 19, Vite 7 | Sub-second module compilation, modern React primitives, and rapid SPA rendering. |
| **Styling & Layout** | Tailwind CSS 3.4 | Utility-first, responsive design supporting dynamic light/dark UI palettes. |
| **Mapping & Visuals** | React-Leaflet, OpenStreetMap | Open-source, high-performance geospatial rendering for international charity headquarters. |
| **Backend Runtime** | Node.js (>=18.0.0, ES Modules) | Asynchronous, event-driven architecture optimized for I/O-heavy commerce and social operations. |
| **API Framework** | Express.js 4 | Modular router hierarchy, customizable middleware chains, and RESTful resource endpoints. |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 | Document-oriented JSON persistence supporting flexible schemas for social content and polymorphic profiles. |
| **Session Security** | Dual-Token JWT (Access + HttpOnly Cookie) | Short-lived in-memory access tokens with automatic rotation via secure `SameSite=Lax` refresh cookies. |
| **Payment Ingress** | Stripe Checkout API | Industry-standard, PCI-DSS compliant checkout sessions for global payment processing. |
| **Cloud Media Pipeline** | Cloudinary REST API, Multer (Memory Storage) | In-memory buffering (strict 2MB limit) with direct CDN streaming, preventing temporary disk writes. |
| **Transactional Email** | Resend API & Nodemailer (SMTP) | Dual-channel transactional mail dispatch ensuring guaranteed OTP delivery for authentication flows. |

---

### 6.3 Database Schema & Entity Relationships

The data model connects users, merchandise items, orders, verified charities, community campaigns, and donations:

![Figure 6.2: Database Entity Relationship Model](./images/flowchart_er_model.svg)
*Figure 6.2: Entity-relationship diagram representing core database schemas and relationships.*

---

## 7. Security Architecture & Concurrency Safeguards

* **Dual-Token Authentication Lifecycle:** Access tokens (15-minute lifespan) remain strictly in memory to resist Cross-Site Scripting (XSS). Refresh tokens (7-day lifespan) are persisted in `HttpOnly`, `SameSite=Lax`, and `Secure` cookies, eliminating script-based exfiltration while preventing CSRF exploitation.
* **Atomic Concurrency Controls:** Coin deductions and auction bid adjustments utilize MongoDB conditional atomic update operators (`$inc`, `$set`) with preconditions (e.g., `merchCoins: { $gte: donationAmount }`), guaranteeing that balances cannot become negative even under concurrent requests.
* **Defensive Gateway Hardening:** Equipped with `helmet` for HTTP response security headers, `express-rate-limit` for DDoS and brute-force mitigation, input sanitization pipelines, and strict CORS domain whitelisting.
* **Memory-Buffered File Storage:** Uploaded identity proofs and product media are validated in memory and streamed directly to Cloudinary without persisting uninspected binary files onto the server filesystem.

---

## 8. Testing Strategy & Quality Assurance

Quality assurance is maintained through continuous testing covering component logic, endpoint integration, and concurrency verification:

![Figure 8.1: Quality Assurance and Testing Strategy](./images/flowchart_testing_strategy.svg)
*Figure 8.1: Multi-tiered testing and continuous integration pipeline.*

* **Automated Unit & Integration Test Suites:** Built using Node.js's native test runner (`node --test`), verifying validators, token utilities, and controller logic across 205 automated test cases with 100% pass rates.
* **Concurrency Validation:** Automated test harnesses simulating parallel donation and bidding requests to verify ledger integrity.
* **Continuous Integration (CI):** GitHub Actions workflows enforcing linting standards, build correctness, and unit tests on every pull request.

---

## 9. Conclusion & Future Roadmap

**Merch4Change** establishes that consumer commerce can be transformed into an impactful engine for social progress through thoughtful product engineering, atomic coin mechanics, and rigorous non-profit verification.

![Figure 9.1: Strategic Roadmap and Milestones](./images/flowchart_roadmap.svg)
*Figure 9.1: Phased platform evolution from MVP launch to enterprise commercialization.*

---

## 10. Links & Technical References

* **Live Platform Application:** [merch4change.vercel.app](https://merch4change.vercel.app/)
* **Source Code Repository:** [github.com/cepdnaclk/e23-co2060-Merch4Change](https://github.com/cepdnaclk/e23-co2060-Merch4Change)
* **Comprehensive Developer Guide:** [DEVELOPER_GUIDE.md](https://github.com/cepdnaclk/e23-co2060-Merch4Change/blob/main/DEVELOPER_GUIDE.md)
* **Backend Testing Handbook:** [code/Backend/TESTING.md](https://github.com/cepdnaclk/e23-co2060-Merch4Change/blob/main/code/Backend/TESTING.md)
* **Department of Computer Engineering:** [ce.pdn.ac.lk](https://www.ce.pdn.ac.lk/)
* **Faculty of Engineering, University of Peradeniya:** [eng.pdn.ac.lk](https://eng.pdn.ac.lk/)

---

<div align="center">

**Department of Computer Engineering · Faculty of Engineering · University of Peradeniya**  
*CO2060 — Software Systems Design Project (2YP) · Batch E23 · Team Antigravity*

</div>
