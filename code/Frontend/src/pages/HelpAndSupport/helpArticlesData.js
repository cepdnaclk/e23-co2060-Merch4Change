/**
 * ============================================================================
 * MERCH4CHANGE — COMPREHENSIVE KNOWLEDGE BASE ARTICLES (32 ARTICLES)
 * ============================================================================
 */

export const HELP_ARTICLES = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. GETTING STARTED (6 Articles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "getting-started-overview",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "Welcome to Merch4Change: Platform Overview",
    summary: "An introduction to how Merch4Change unites ethical shoppers, partner brands, and non-profits on a single impact platform.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "What is Merch4Change?",
        content: "Merch4Change is a social e-commerce and donation platform built in Sri Lanka that turns everyday consumer purchases into direct funding for grassroots charities, environmental conservation, and social equity projects.",
      },
      {
        heading: "The Three Core Stakeholders",
        content: "Our platform connects three key groups:\n1. Shoppers & Donors: Buy purpose-driven merchandise and earn impact rewards.\n2. Partner Brands & Creators: Sell ethical merchandise and pledge sales proceeds to vetted charities.\n3. Verified Non-Profits: Receive transparent campaign funding with zero hidden platform cut.",
      },
      {
        heading: "How to Get Started",
        content: "You can browse the public marketplace immediately without an account. When you are ready to make a purchase, fund a cause, or track your impact rank, sign up with your email to unlock your personal profile.",
      },
    ],
  },
  {
    id: "create-user-account",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "How to Create a Supporter Account with Email OTP",
    summary: "Step-by-step instructions on signing up as an individual user and securing your account with one-time password verification.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Registration Steps",
        content: "Follow these steps to create an individual supporter account:",
        steps: [
          "Navigate to the Sign Up page from the top navigation bar.",
          "Select 'Create account as a User' on the role selection screen.",
          "Enter your legal name, choose a unique @username, and provide your email address.",
          "Check your email inbox for a 6-digit verification code sent by Merch4Change.",
          "Enter the OTP code on the verification screen to instantly activate your profile.",
        ],
      },
      {
        heading: "Authenticated Session Benefits",
        content: "Once authenticated, your login token is securely stored and silently refreshed in your browser, enabling instant access to your order history, impact rankings, and personalized messaging.",
      },
    ],
  },
  {
    id: "create-org-account",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "Creating an Organization Profile for Your Non-Profit",
    summary: "How registered non-profits, trusts, and charities can register their organizational profile to start fundraising.",
    readTime: "4 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Organization Account Overview",
        content: "Non-profit organizations, university charitable societies, and registered community groups can create a dedicated Organization account to publish verified campaigns and receive proceeds.",
      },
      {
        heading: "Registration Workflow",
        content: "To register as an Organization:",
        steps: [
          "Go to Sign Up and select 'Create account as an Organization'.",
          "Provide your official NGO / organization title, registration number, and official representative contact.",
          "Complete email verification via OTP.",
          "Submit your NGO verification documentation for compliance review by our administration team.",
        ],
      },
    ],
  },
  {
    id: "how-purchases-fund-causes",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "Understanding How Every Merchandise Purchase Funds a Cause",
    summary: "A transparent breakdown of how sale revenue is split and delivered directly to the causes you care about.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "The Impact Pricing Model",
        content: "Unlike standard e-commerce platforms where profits go solely to corporations, every product listed on Merch4Change clearly designates the beneficiary charity and pledge percentage (typically 100% of profits).",
      },
      {
        heading: "Transparent Fund Allocation",
        content: "When an order is completed, the payment is split:\n• Production & Fulfillment: Covers base manufacturing and raw materials.\n• Verified Cause Donation: Directly credited to the charity's fundraising ledger.\n• 0% Platform Commission: 100% of the allocated charitable amount reaches the intended NGO.",
      },
    ],
  },
  {
    id: "earning-impact-coins",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "Earning and Viewing Your Impact Coins",
    summary: "Learn how the Merch4Change tokenized reward system works and how your coin balance increases with each purchase.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "What are Impact Coins?",
        content: "Impact Coins are engagement tokens awarded to active supporters for purchasing charity merchandise, writing community testimonials, and achieving donation milestones.",
      },
      {
        heading: "Where to View Your Coin Balance",
        content: "When logged in, your live coin balance is visible in the top navigation bar and in your User Profile under your profile header.",
      },
    ],
  },
  {
    id: "navigating-dashboard",
    category: "getting-started",
    categoryTitle: "Getting Started",
    title: "Navigating Your Community Feed and Profile",
    summary: "A guided tour of your authenticated home feed, stories carousel, trending campaigns, and profile settings.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "The Home Feed",
        content: "The authenticated Home screen displays:\n• Impact Stories: Top circular carousel showcasing live campaign updates and newly verified charities.\n• Community Posts: Photo and article updates from verified brands and organizations you follow.\n• Trending Now: Popular campaigns gaining momentum this week in Sri Lanka.",
      },
      {
        heading: "Collapsible Sidebar",
        content: "Use the left navigation sidebar to jump between Home, Search, Marketplace, Leaderboard, Messaging, Donations, and Settings.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ORDERS & SHIPPING (9 Articles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "browsing-marketplace",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "How to Browse & Filter Cause-Driven Merchandise",
    summary: "Tips for using the Marketplace search filters, categories, and charity sorting options.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Marketplace Filtering",
        content: "Navigate to `/marketplace` to explore products. You can filter items by:\n• Category: Apparel, Accessories, Art, Stationery, and Eco-Goods.\n• Beneficiary Cause: Environmental Protection, Animal Welfare, Child Education, Disaster Relief.\n• Verified NGO: View products created specifically by your favorite non-profit.",
      },
    ],
  },
  {
    id: "placing-order",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Step-by-Step Guide to Placing an Order",
    summary: "From selecting item variations to completing your delivery details and order confirmation.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Checkout Procedure",
        content: "Follow these simple steps to place an ethical order:",
        steps: [
          "Select the item, preferred size, color, and quantity in the Marketplace.",
          "Verify the linked charity campaign displayed on the product card.",
          "Click 'Buy Now' to review your delivery address and contact phone number.",
          "Select your payment method and confirm the transaction.",
          "Receive your instant Order ID and email confirmation.",
        ],
      },
    ],
  },
  {
    id: "shipping-destinations",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Shipping Rates and Delivery Timelines across Sri Lanka",
    summary: "Comprehensive details on courier partners, delivery estimated timelines, and provincial delivery rates.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Estimated Delivery Times",
        content: "• Western Province (Colombo, Gampaha, Kalutara): 2–3 business days.\n• Central & Southern Provinces: 3–4 business days.\n• Northern, Eastern & North Central Provinces: 4–6 business days.",
      },
      {
        heading: "Courier Partners",
        content: "We partner with reputable local courier services to ensure your packages are handled with care and delivered directly to your doorstep.",
      },
    ],
  },
  {
    id: "order-tracking-status",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Tracking Your Order Status & Dispatch",
    summary: "Learn how order statuses transition from Processing to Dispatched and Delivered.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: true,
    constructionDetails: "Automated real-time courier GPS tracking API integration is currently in active development for Semester 3. In the interim, order status updates (Processing, Dispatched, Delivered) are confirmed via email notification.",
    sections: [
      {
        heading: "Current Tracking Method",
        content: "Supporters can check their current order status via their authenticated Profile > Orders tab. When an item is dispatched, a tracking reference and courier hotline are provided in your dispatch email.",
      },
    ],
  },
  {
    id: "accepted-payments",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Accepted Payment Methods (Cards, Bank Transfer, Impact Coins)",
    summary: "Supported payment options including credit/debit cards, direct bank transfer, and Impact Coin redemption.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Available Payment Options",
        content: "• Visa & Mastercard (Local & International)\n• Direct Bank Deposit / Online Bank Transfer\n• Impact Coins (Partial discounts on select promotional merchandise)\n• Cash on Delivery (Available in select Western Province zones)",
      },
    ],
  },
  {
    id: "order-cancellations",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "How to Cancel or Modify an Order Before Fulfillment",
    summary: "What to do if you made a mistake in your address or wish to cancel an order before printing.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Cancellation Window",
        content: "Orders can be modified or cancelled within 2 hours of placement, before items enter production or warehouse fulfillment. Navigate to `/help/contact` with your Order ID to request an immediate modification.",
      },
    ],
  },
  {
    id: "returns-and-exchanges",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Return and Exchange Policy for Defective Goods",
    summary: "Our 7-day hassle-free replacement policy for misprinted, damaged, or defective merchandise.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Eligible Reasons for Returns",
        content: "• Manufacturing defects, tears, or misprints.\n• Receipt of incorrect size or product compared to your order invoice.\n• Items damaged during transit.",
      },
      {
        heading: "How to Initiate an Exchange",
        content: "Contact support within 7 days of receiving your package. Attach clear photos of the defect, and our team will arrange a free exchange or refund.",
      },
    ],
  },
  {
    id: "custom-merch-requests",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "Bulk & Custom Community Merchandise Orders",
    summary: "Custom t-shirts, tote bags, and corporate swag for university campaigns and corporate CSR initiatives.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: true,
    constructionDetails: "The interactive self-service 3D Custom Merchandise Designer studio is currently under construction. For corporate CSR bulk orders (50+ units), please submit a manual inquiry through the Contact Support form.",
    sections: [
      {
        heading: "Bulk CSR Orders",
        content: "Companies and universities looking to produce custom branded merchandise that donates a percentage of proceeds can collaborate directly with our partnerships team.",
      },
    ],
  },
  {
    id: "seller-fulfillment-guide",
    category: "orders-shipping",
    categoryTitle: "Orders & Shipping",
    title: "For Partner Brands: Order Processing & Dispatch Guidelines",
    summary: "A practical guide for authorized sellers and partner brands on packing, labeling, and timely courier handoffs.",
    readTime: "4 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Fulfillment Service Level Agreement (SLA)",
        content: "Partner brands are required to prepare and pack confirmed orders within 48 business hours to ensure timely delivery to supporters.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. CAUSES & IMPACT (8 Articles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "how-causes-are-selected",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "How NGOs and Campaigns Are Selected on Merch4Change",
    summary: "Our criteria for vetting authentic charitable causes, financial accountability, and social alignment.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Vetting Criteria",
        content: "Every cause featured on Merch4Change must satisfy:\n1. Legal non-profit or charitable society registration in Sri Lanka.\n2. Transparent, audited bank records.\n3. Demonstrated track record of verifiable ground impact.",
      },
    ],
  },
  {
    id: "donation-distribution",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "How Funds are Dispersed to Partner Organizations",
    summary: "The bi-weekly disbursement schedule and automated bank remittance process for partner non-profits.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Disbursement Schedule",
        content: "Campaign proceeds are reconciled and transferred directly to the organization's verified bank account on the 1st and 15th of each calendar month, accompanied by detailed audit ledgers.",
      },
    ],
  },
  {
    id: "realtime-impact-tracker",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "Reading Your Personal Impact Dashboard & Donor History",
    summary: "How to interpret your contribution statistics, campaigns funded, and historical philanthropic timeline.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Your Personal Dashboard",
        content: "When authenticated, navigate to `/donations` to view:\n• Total Rupee Value Contributed across all purchases.\n• Active Campaigns You Supported.\n• Verified NGO receipts and completion progress bars.",
      },
    ],
  },
  {
    id: "impact-coins-redeem",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "How Impact Coins Work & Redeeming Rewards",
    summary: "Detailed breakdown of the reward mechanics, coin multipliers, and exclusive supporter perks.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Earning Rates",
        content: "For every Rs. 100 spent on eligible merchandise, supporters receive 10 Impact Coins. Engaging with campaign stories and reviewing products awards bonus tokens.",
      },
    ],
  },
  {
    id: "leaderboard-rankings",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "How the Community Leaderboard & Donor Ranks Work",
    summary: "Understand how donor tiers (Bronze, Silver, Gold, Platinum, Guardian) and leaderboard offsets are computed.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Leaderboard Metrics",
        content: "The Leaderboard (`/leaderboard`) highlights top individual changemakers, high-impact brands, and trending charity organizations. Rankings update dynamically with each verified transaction.",
      },
    ],
  },
  {
    id: "tax-deductions-receipts",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "Donation Receipts & Tax Certificates",
    summary: "Tax exemption eligibility and accessing official contribution invoices for tax deductions.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: true,
    constructionDetails: "Automated Inland Revenue Department (IRD) compliant PDF tax-exemption certificate generation is currently under construction. Please contact support if you require a formal manual tax receipt for donations over Rs. 50,000.",
    sections: [
      {
        heading: "Official Donation Proof",
        content: "All purchase invoices include the designated charity registration ID and donation split, serving as valid audit documentation.",
      },
    ],
  },
  {
    id: "campaign-milestone-reports",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "Viewing NGO Milestone Proof & Community Updates",
    summary: "How charities share ground photographic evidence, video logs, and project completion summaries.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Proof of Impact",
        content: "When an organization completes a funding milestone (e.g. building a school library or planting 1,000 trees), they upload photo proof directly to the campaign feed.",
      },
    ],
  },
  {
    id: "suggest-new-cause",
    category: "causes-impact",
    categoryTitle: "Causes & Impact",
    title: "How to Nominate a New Charity or Cause",
    summary: "Know an inspiring grassroots non-profit in Sri Lanka? Here is how to nominate them for Merch4Change inclusion.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Community Nominations",
        content: "We welcome community nominations! Send us a brief message through `/help/contact` with the organization's name, website or social link, and the primary cause they champion.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CHARITY VERIFICATION (5 Articles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "ngo-verification-overview",
    category: "charity-verification",
    categoryTitle: "Charity Verification",
    title: "Charity Verification Standards & Compliance Overview",
    summary: "The principles and legal benchmarks required for an organization to earn the verified badge on Merch4Change.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Why Verification Matters",
        content: "Trust is the foundational pillar of Merch4Change. To prevent fraudulent fundraising, every campaign host must prove legal incorporation and verified governance before receiving a single rupee.",
      },
    ],
  },
  {
    id: "required-legal-documents",
    category: "charity-verification",
    categoryTitle: "Charity Verification",
    title: "Required Documentation for NGO Registration in Sri Lanka",
    summary: "Checklist of mandatory paperwork needed before submitting your verification form.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Required Document Checklist",
        content: "Ensure you have digital scans (PDF or high-res images) of:\n1. NGO Registration Certificate / Trust Deed / Companies Act registration.\n2. Official Bank Account Statement / Passbook showing the organization name.\n3. National Identity Card (NIC) or Passport of the primary designated trustee or director.\n4. Recent Annual Report or brief description of past year community projects.",
      },
    ],
  },
  {
    id: "submitting-verification",
    category: "charity-verification",
    categoryTitle: "Charity Verification",
    title: "How to Submit Your Verification Application",
    summary: "Step-by-step walkthrough of filling the `/charity/verify` portal.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Application Steps",
        content: "Follow these steps from your organization account:",
        steps: [
          "Log in to your verified Organization profile.",
          "Navigate to `/charity/verify`.",
          "Fill in your legal non-profit details and mission statement.",
          "Upload your PDF verification documents and official bank proof.",
          "Click Submit Application to enter the administrative review queue.",
        ],
      },
    ],
  },
  {
    id: "verification-timeline-queue",
    category: "charity-verification",
    categoryTitle: "Charity Verification",
    title: "Understanding the Admin Review Queue & Processing Timeline",
    summary: "How our compliance officers review documents and the typical 3-5 business day evaluation schedule.",
    readTime: "2 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Review Timelines",
        content: "Applications are typically reviewed within 3 to 5 business days. You will receive an automated email as soon as your status changes from 'Pending Review' to 'Approved' or 'Requires Additional Information'.",
      },
    ],
  },
  {
    id: "maintaining-verified-status",
    category: "charity-verification",
    categoryTitle: "Charity Verification",
    title: "Annual Audits & Maintaining Your Verified Charity Badge",
    summary: "Ongoing transparency requirements to retain your verified badge across annual funding cycles.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Annual Re-verification",
        content: "To safeguard community trust, verified non-profits must submit updated annual financial statements or community impact reports every 12 months to maintain their active verified badge.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ACCOUNT & SECURITY (4 Articles)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "otp-verification-troubleshooting",
    category: "account-security",
    categoryTitle: "Account & Security",
    title: "Two-Step OTP Verification & Troubleshooting OTP Emails",
    summary: "What to do if your one-time verification code is delayed, spam filtered, or expires.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Troubleshooting Steps",
        content: "If you did not receive your 6-digit OTP code:",
        steps: [
          "Check your Spam, Junk, or Promotions tab in your email client.",
          "Wait 60 seconds until the 'Resend Code' button becomes active.",
          "Verify that you entered your email address without typos.",
          "Ensure your inbox storage is not full.",
        ],
      },
    ],
  },
  {
    id: "password-reset-recovery",
    category: "account-security",
    categoryTitle: "Account & Security",
    title: "How to Reset and Secure Your Password",
    summary: "Safely recover your credentials or update your login password from your security settings.",
    readTime: "2 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Resetting Forgotten Passwords",
        content: "Click 'Forgot Password' on the Login page (`/login`), input your registered email address, and follow the secure password reset link sent to your inbox.",
      },
      {
        heading: "Changing Password Inside Settings",
        content: "When authenticated, navigate to `/settings` and select the Security tab to change your current password.",
      },
    ],
  },
  {
    id: "privacy-data-settings",
    category: "account-security",
    categoryTitle: "Account & Security",
    title: "Managing Your Profile Privacy & Notification Settings",
    summary: "Control whether your donor rank is displayed publicly on the leaderboard and configure email notifications.",
    readTime: "3 min read",
    requiresAuth: true,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Privacy Controls",
        content: "Supporters can choose to remain anonymous donors on public leaderboard ranks or proudly showcase their change-maker badge. Manage these options inside `/settings` under the Privacy section.",
      },
    ],
  },
  {
    id: "session-security-jwt",
    category: "account-security",
    categoryTitle: "Account & Security",
    title: "How Merch4Change Protects Your Login Sessions (JWT Security)",
    summary: "An overview of our enterprise-grade JWT token rotation, silent refresh, and cookie security architecture.",
    readTime: "3 min read",
    requiresAuth: false,
    isUnderConstruction: false,
    sections: [
      {
        heading: "Multi-Layered Authentication",
        content: "Merch4Change uses short-lived JSON Web Tokens (JWT) kept in memory and secure HTTP-only refresh cookies. This ensures your sessions cannot be hijacked via client-side cross-site scripting (XSS).",
      },
    ],
  },
];
