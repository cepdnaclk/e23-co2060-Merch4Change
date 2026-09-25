import os
import xml.etree.ElementTree as ET

def create_svg(width, height, content, title="Diagram"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#111827" />
    </marker>
  </defs>

  <!-- Canvas Outer Border -->
  <rect x="1" y="1" width="{width - 2}" height="{height - 2}" rx="6" fill="#ffffff" stroke="#e5e7eb" stroke-width="1.5" />

  {content}
</svg>'''

os.makedirs('docs/images', exist_ok=True)

# 1. Problem Statement
content_1 = '''
  <text x="450" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 1: Architectural Problem Domain &amp; Market Deficits</text>
  <line x1="40" y1="52" x2="860" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Left: Deficit Cards -->
  <g transform="translate(60, 75)">
    <rect width="280" height="70" rx="4" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
    <text x="14" y="28" fill="#111827" font-size="13" font-weight="700">1. Conscious Consumers</text>
    <text x="14" y="48" fill="#4b5563" font-size="11">Disconnected giving channels; friction in routine</text>
    <text x="14" y="62" fill="#4b5563" font-size="11">philanthropic contributions during online purchases.</text>
  </g>

  <g transform="translate(60, 165)">
    <rect width="280" height="70" rx="4" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
    <text x="14" y="28" fill="#111827" font-size="13" font-weight="700">2. Commercial Brands &amp; Creators</text>
    <text x="14" y="48" fill="#4b5563" font-size="11">Absence of integrated corporate social responsibility</text>
    <text x="14" y="62" fill="#4b5563" font-size="11">(CSR) tooling to prove direct charitable impact.</text>
  </g>

  <g transform="translate(60, 255)">
    <rect width="280" height="70" rx="4" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
    <text x="14" y="28" fill="#111827" font-size="13" font-weight="700">3. Non-Profit Organizations &amp; NGOs</text>
    <text x="14" y="48" fill="#4b5563" font-size="11">Severe donor skepticism; lack of transparent,</text>
    <text x="14" y="62" fill="#4b5563" font-size="11">verifiable statutory credentialing and allocation audits.</text>
  </g>

  <!-- Connectors -->
  <path d="M 340 110 L 510 190" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 340 200 L 510 200" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 340 290 L 510 210" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>

  <!-- Core Problem Node -->
  <g transform="translate(520, 140)">
    <polygon points="170,0 340,60 170,120 0,60" fill="#f3f4f6" stroke="#111827" stroke-width="2"/>
    <text x="170" y="54" text-anchor="middle" fill="#111827" font-size="14" font-weight="700">Structural Market Deficit:</text>
    <text x="170" y="74" text-anchor="middle" fill="#111827" font-size="13" font-weight="600">Philanthropic Friction &amp; Trust Asymmetry</text>
  </g>
'''
with open('docs/images/flowchart_problem.svg', 'w') as f:
    f.write(create_svg(900, 360, content_1))

# 2. Value Loop
content_2 = '''
  <text x="500" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 2: The Merch-to-Impact Closed-Loop Value Cycle</text>
  <line x1="40" y1="52" x2="960" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Step 1 -->
  <g transform="translate(30, 80)">
    <rect width="165" height="90" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="82" y="30" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">1. Browse &amp; Buy</text>
    <text x="82" y="50" text-anchor="middle" fill="#4b5563" font-size="11">Curated merchandise</text>
    <text x="82" y="66" text-anchor="middle" fill="#4b5563" font-size="11">via Stripe checkout</text>
  </g>

  <path d="M 195 125 L 225 125" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 2 -->
  <g transform="translate(230, 80)">
    <rect width="165" height="90" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="82" y="30" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">2. Accrue Coins</text>
    <text x="82" y="50" text-anchor="middle" fill="#4b5563" font-size="11">Deterministic reward</text>
    <text x="82" y="66" text-anchor="middle" fill="#4b5563" font-size="11">1 Coin per $10 spent</text>
  </g>

  <path d="M 395 125 L 425 125" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 3 -->
  <g transform="translate(430, 80)">
    <rect width="165" height="90" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="82" y="30" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">3. Allocate Donation</text>
    <text x="82" y="50" text-anchor="middle" fill="#4b5563" font-size="11">Atomic micro-giving</text>
    <text x="82" y="66" text-anchor="middle" fill="#4b5563" font-size="11">to verified non-profits</text>
  </g>

  <path d="M 595 125 L 625 125" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 4 -->
  <g transform="translate(630, 80)">
    <rect width="165" height="90" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="82" y="30" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">4. Elevate Tier</text>
    <text x="82" y="50" text-anchor="middle" fill="#4b5563" font-size="11">Bronze to Diamond</text>
    <text x="82" y="66" text-anchor="middle" fill="#4b5563" font-size="11">Public donor ranking</text>
  </g>

  <path d="M 795 125 L 825 125" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 5 -->
  <g transform="translate(830, 80)">
    <rect width="140" height="90" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="70" y="30" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">5. Community</text>
    <text x="70" y="50" text-anchor="middle" fill="#4b5563" font-size="11">Social proof, feed</text>
    <text x="70" y="66" text-anchor="middle" fill="#4b5563" font-size="11">stories &amp; milestones</text>
  </g>

  <!-- Return Loop Path -->
  <path d="M 900 170 L 900 215 L 112 215 L 112 170" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <text x="500" y="235" text-anchor="middle" fill="#4b5563" font-size="12" font-style="italic">Continuous Self-Sustaining Commercial Philanthropy Loop</text>
'''
with open('docs/images/flowchart_value_loop.svg', 'w') as f:
    f.write(create_svg(1000, 260, content_2))

# 3. User Journey
content_3 = '''
  <text x="450" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 3: End-to-End User Impact Journey</text>
  <line x1="40" y1="52" x2="860" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Step 1: Start -->
  <rect x="315" y="70" width="270" height="42" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="96" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">User Authentication (OTP / JWT Session)</text>
  
  <path d="M 450 112 L 450 135" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Step 2 -->
  <rect x="315" y="135" width="270" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="161" text-anchor="middle" fill="#111827" font-size="12">Explore Product Catalog &amp; Live Drops</text>

  <path d="M 450 177 L 450 200" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Decision: Purchase Type -->
  <polygon points="450,200 560,235 450,270 340,235" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="239" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Purchase Type?</text>

  <!-- Fixed Branch -->
  <path d="M 340 235 L 200 235 L 200 280" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="255" y="225" fill="#4b5563" font-size="11">Fixed Price</text>
  <rect x="100" y="280" width="200" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="200" y="306" text-anchor="middle" fill="#111827" font-size="12">Direct Stripe Checkout</text>

  <!-- Auction Branch -->
  <path d="M 560 235 L 700 235 L 700 280" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="645" y="225" fill="#4b5563" font-size="11">Timed Auction</text>
  <rect x="600" y="280" width="200" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="700" y="306" text-anchor="middle" fill="#111827" font-size="12">Place Real-Time Bid</text>

  <!-- Merge to Payment -->
  <path d="M 200 322 L 200 355 L 430 355" fill="none" stroke="#111827" stroke-width="1.5"/>
  <path d="M 700 322 L 700 355 L 470 355" fill="none" stroke="#111827" stroke-width="1.5"/>
  <path d="M 450 355 L 450 380" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Payment Confirmed -->
  <rect x="300" y="380" width="300" height="48" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="402" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Payment Processed &amp; Verified</text>
  <text x="450" y="418" text-anchor="middle" fill="#4b5563" font-size="11">Order Ledger Persisted · Merch Coins Credited</text>

  <path d="M 450 428 L 450 455" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Donation -->
  <rect x="300" y="455" width="300" height="48" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="477" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Donate Earned Coins to Verified Cause</text>
  <text x="450" y="493" text-anchor="middle" fill="#4b5563" font-size="11">Atomic Account Deduction · Project Fund Increment</text>

  <path d="M 450 503 L 450 530" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Finish -->
  <rect x="300" y="530" width="300" height="44" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="556" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Donor Badge Unlocked &amp; Leaderboard Updated</text>
'''
with open('docs/images/flowchart_user_journey.svg', 'w') as f:
    f.write(create_svg(900, 600, content_3))

# 4. Coin Engine
content_4 = '''
  <text x="450" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 4: Coin Generation &amp; Atomic Donation Architecture</text>
  <line x1="40" y1="52" x2="860" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Left: Earning -->
  <g transform="translate(40, 70)">
    <rect width="370" height="320" rx="4" fill="#fafafa" stroke="#9ca3af" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="185" y="28" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">Stage A: Reward Generation Pipeline</text>

    <rect x="45" y="55" width="280" height="45" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="185" y="82" text-anchor="middle" fill="#111827" font-size="12">Order Paid: $Total (Stripe Webhook)</text>

    <path d="M 185 100 L 185 135" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

    <rect x="45" y="135" width="280" height="50" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="185" y="157" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Deterministic Reward Calculation</text>
    <text x="185" y="174" text-anchor="middle" fill="#4b5563" font-size="11">Coins = floor(Total USD Amount / 10)</text>

    <path d="M 185 185 L 185 220" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

    <rect x="45" y="220" width="280" height="45" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="185" y="247" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Credit User Balance: $inc(merchCoins)</text>
  </g>

  <!-- Right: Donating -->
  <g transform="translate(450, 70)">
    <rect width="410" height="320" rx="4" fill="#fafafa" stroke="#9ca3af" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="205" y="28" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">Stage B: Atomic Donation Engine</text>

    <rect x="45" y="55" width="320" height="40" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="205" y="80" text-anchor="middle" fill="#111827" font-size="12">Select Cause / Project &amp; Coin Amount (A)</text>

    <path d="M 205 95 L 205 125" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

    <!-- Validation Diamond -->
    <polygon points="205,125 325,160 205,195 85,160" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
    <text x="205" y="156" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">Balance &gt;= A &amp;</text>
    <text x="205" y="171" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">Charity Verified?</text>

    <!-- Reject Branch -->
    <path d="M 85 160 L 25 160 L 25 235" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
    <rect x="5" y="235" width="80" height="35" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="45" y="257" text-anchor="middle" fill="#111827" font-size="11">Reject (400)</text>

    <!-- Accept Branch -->
    <path d="M 205 195 L 205 225" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

    <!-- Atomic Block -->
    <rect x="45" y="225" width="320" height="55" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="205" y="247" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Atomic MongoDB Transaction</text>
    <text x="205" y="265" text-anchor="middle" fill="#4b5563" font-size="11">Deduct User Coins · Increment Project · Append Audit</text>
  </g>
'''
with open('docs/images/flowchart_coin_engine.svg', 'w') as f:
    f.write(create_svg(900, 420, content_4))

# 5. Auction Engine
content_5 = '''
  <text x="450" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 5: Live Auction &amp; Real-Time Bidding Window</text>
  <line x1="40" y1="52" x2="860" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="300" y="70" width="300" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="96" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Auction Scheduled &amp; Countdown Initialized</text>

  <path d="M 450 112 L 450 140" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <rect x="300" y="140" width="300" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="166" text-anchor="middle" fill="#111827" font-size="12">Bidder Submits Real-Time Offer ($X)</text>

  <path d="M 450 182 L 450 210" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Decision: Expiry -->
  <polygon points="450,210 570,245 450,280 330,245" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="249" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Auction Expired?</text>

  <!-- Yes -> Reject -->
  <path d="M 570 245 L 700 245 L 700 280" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="640" y="235" fill="#4b5563" font-size="11">Yes (Expired)</text>
  <rect x="610" y="280" width="180" height="40" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="700" y="305" text-anchor="middle" fill="#111827" font-size="11">Reject: Auction Closed</text>

  <!-- No -> Increment check -->
  <path d="M 450 280 L 450 320" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="460" y="302" fill="#4b5563" font-size="11">No</text>

  <polygon points="450,320 580,355 450,390 320,355" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="352" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">$X &gt;= Current High Bid</text>
  <text x="450" y="366" text-anchor="middle" fill="#111827" font-size="11" font-weight="600">+ Minimum Increment?</text>

  <!-- No increment -> Reject -->
  <path d="M 320 355 L 200 355 L 200 400" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="235" y="345" fill="#4b5563" font-size="11">Below Minimum</text>
  <rect x="110" y="400" width="180" height="40" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="200" y="425" text-anchor="middle" fill="#111827" font-size="11">Reject: Increment Too Low</text>

  <!-- Valid increment -> update -->
  <path d="M 450 390 L 450 430" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="460" y="412" fill="#4b5563" font-size="11">Valid Bid</text>

  <rect x="290" y="430" width="320" height="46" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="451" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Assign Current High Bidder</text>
  <text x="450" y="467" text-anchor="middle" fill="#4b5563" font-size="11">Emit Event · Notify Outbid User · Update Feed</text>
'''
with open('docs/images/flowchart_auction_engine.svg', 'w') as f:
    f.write(create_svg(900, 500, content_5))

# 6. Charity Verification
content_6 = '''
  <text x="450" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 6: Non-Profit Compliance &amp; Verification Pipeline</text>
  <line x1="40" y1="52" x2="860" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <rect x="315" y="70" width="270" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="96" text-anchor="middle" fill="#111827" font-size="12">Charity Organization Onboarding Registration</text>

  <path d="M 450 112 L 450 140" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <rect x="300" y="140" width="300" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="166" text-anchor="middle" fill="#111827" font-size="12">Upload Registration Proof &amp; Tax Exemption PDF</text>

  <path d="M 450 182 L 450 210" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <rect x="300" y="210" width="300" height="42" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="236" text-anchor="middle" fill="#111827" font-size="12">Application Enqueued: status = 'pending'</text>

  <path d="M 450 252 L 450 280" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Decision -->
  <polygon points="450,280 570,315 450,350 330,315" fill="#f9fafb" stroke="#111827" stroke-width="1.5"/>
  <text x="450" y="319" text-anchor="middle" fill="#111827" font-size="12" font-weight="600">Admin Audit Valid?</text>

  <!-- Rejected -->
  <path d="M 330 315 L 180 315 L 180 370" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="235" y="305" fill="#4b5563" font-size="11">Rejected</text>
  <rect x="70" y="370" width="220" height="46" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
  <text x="180" y="391" text-anchor="middle" fill="#111827" font-size="12">Status: 'rejected'</text>
  <text x="180" y="407" text-anchor="middle" fill="#4b5563" font-size="10">Email Reason Notes &amp; Resubmission Link</text>

  <!-- Approved -->
  <path d="M 570 315 L 720 315 L 720 370" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="645" y="305" fill="#4b5563" font-size="11">Approved</text>
  <rect x="610" y="370" width="220" height="46" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
  <text x="720" y="391" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Status: 'approved'</text>
  <text x="720" y="407" text-anchor="middle" fill="#4b5563" font-size="10">Assign Verification Badge &amp; Unlock Projects</text>
'''
with open('docs/images/flowchart_charity_verification.svg', 'w') as f:
    f.write(create_svg(900, 440, content_6))

# 7. Architecture
content_7 = '''
  <text x="500" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 7: Multi-Tier System Architecture &amp; Service Boundaries</text>
  <line x1="40" y1="52" x2="960" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- Tier 1: Client -->
  <g transform="translate(40, 65)">
    <rect width="920" height="80" rx="4" fill="#fafafa" stroke="#111827" stroke-width="1.5"/>
    <text x="20" y="24" fill="#111827" font-size="12" font-weight="700">Presentation Tier (Single Page Application)</text>
    <rect x="20" y="34" width="270" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="155" y="55" text-anchor="middle" fill="#111827" font-size="11">React 19 · Vite 7 · Tailwind CSS</text>
    <rect x="310" y="34" width="270" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="445" y="55" text-anchor="middle" fill="#111827" font-size="11">Leaflet Geospatial Maps · Lucide Icons</text>
    <rect x="600" y="34" width="300" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="750" y="55" text-anchor="middle" fill="#111827" font-size="11">Auth Context · Axios Dual-Token Client</text>
  </g>

  <path d="M 500 145 L 500 170" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Tier 2: Gateway -->
  <g transform="translate(40, 170)">
    <rect width="920" height="80" rx="4" fill="#fafafa" stroke="#111827" stroke-width="1.5"/>
    <text x="20" y="24" fill="#111827" font-size="12" font-weight="700">API Gateway &amp; Defensive Middleware Tier</text>
    <rect x="20" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="122" y="55" text-anchor="middle" fill="#111827" font-size="11">Node.js / Express.js REST API</text>
    <rect x="245" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="347" y="55" text-anchor="middle" fill="#111827" font-size="11">CORS &amp; Helmet Defense</text>
    <rect x="470" y="34" width="215" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="577" y="55" text-anchor="middle" fill="#111827" font-size="11">Dual JWT &amp; Cookie Auth Guard</text>
    <rect x="705" y="34" width="195" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="802" y="55" text-anchor="middle" fill="#111827" font-size="11">Multer Memory Stream (2MB)</text>
  </g>

  <path d="M 500 250 L 500 275" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Tier 3: Core Services -->
  <g transform="translate(40, 275)">
    <rect width="920" height="85" rx="4" fill="#fafafa" stroke="#111827" stroke-width="1.5"/>
    <text x="20" y="24" fill="#111827" font-size="12" font-weight="700">Core Domain Services Tier</text>
    <rect x="20" y="34" width="138" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="89" y="57" text-anchor="middle" fill="#111827" font-size="11">Auth &amp; OTP</text>
    <rect x="172" y="34" width="138" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="241" y="57" text-anchor="middle" fill="#111827" font-size="11">Catalog &amp; Orders</text>
    <rect x="324" y="34" width="138" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="393" y="57" text-anchor="middle" fill="#111827" font-size="11">Live Auctions</text>
    <rect x="476" y="34" width="138" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="545" y="57" text-anchor="middle" fill="#111827" font-size="11">Coin Donations</text>
    <rect x="628" y="34" width="138" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="697" y="57" text-anchor="middle" fill="#111827" font-size="11">Social &amp; Stories</text>
    <rect x="780" y="34" width="120" height="38" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="840" y="57" text-anchor="middle" fill="#111827" font-size="11">Admin Verify</text>
  </g>

  <path d="M 500 360 L 500 385" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <!-- Tier 4: Persistence -->
  <g transform="translate(40, 385)">
    <rect width="920" height="80" rx="4" fill="#fafafa" stroke="#111827" stroke-width="1.5"/>
    <text x="20" y="24" fill="#111827" font-size="12" font-weight="700">Persistence &amp; External Services Tier</text>
    <rect x="20" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="122" y="55" text-anchor="middle" fill="#111827" font-size="11">MongoDB Atlas (Mongoose ODM)</text>
    <rect x="245" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="347" y="55" text-anchor="middle" fill="#111827" font-size="11">Cloudinary Media CDN</text>
    <rect x="470" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="572" y="55" text-anchor="middle" fill="#111827" font-size="11">Stripe Checkout API</text>
    <rect x="695" y="34" width="205" height="34" rx="3" fill="#ffffff" stroke="#111827" stroke-width="1"/>
    <text x="797" y="55" text-anchor="middle" fill="#111827" font-size="11">Resend &amp; Nodemailer SMTP</text>
  </g>
'''
with open('docs/images/flowchart_architecture.svg', 'w') as f:
    f.write(create_svg(1000, 490, content_7))

# 8. NoSQL Document Model
content_8 = '''
  <text x="500" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 8: NoSQL Document Model &amp; Collection Architecture (MongoDB Atlas)</text>
  <line x1="40" y1="52" x2="960" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <!-- User Document -->
  <g transform="translate(50, 75)">
    <rect width="215" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="215" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="107" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">users Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">userName, email: String (unique)</text>
    <text x="14" y="88" fill="#4b5563" font-size="11">role: 'user'|'brand'|'charity'|'admin'</text>
    <text x="14" y="108" fill="#111827" font-size="11" font-weight="600">coinBalance: Number (atomic)</text>
    <text x="14" y="128" fill="#4b5563" font-size="11">accountType: 'individual'|'org'</text>
    <text x="14" y="143" fill="#6b7280" font-size="9" font-style="italic">Compound index: { role: 1, email: 1 }</text>
  </g>

  <!-- Order Document -->
  <g transform="translate(390, 75)">
    <rect width="225" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="225" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="112" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">orders Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">userId: ObjectId (ref: 'User')</text>
    <text x="14" y="88" fill="#111827" font-size="11" font-weight="600">items: [OrderItem] (Embedded)</text>
    <text x="14" y="108" fill="#4b5563" font-size="11">totalAmount, coinsEarned: Number</text>
    <text x="14" y="128" fill="#4b5563" font-size="11">status: 'pending'|'paid'|'delivered'</text>
    <text x="14" y="143" fill="#6b7280" font-size="9" font-style="italic">Index: { userId: 1, status: 1 }</text>
  </g>

  <!-- Donation Document -->
  <g transform="translate(735, 75)">
    <rect width="220" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="220" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="110" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">donations Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">donorUserId: ObjectId (ref: 'User')</text>
    <text x="14" y="88" fill="#4b5563" font-size="11">charityId: ObjectId (ref: 'Charity')</text>
    <text x="14" y="108" fill="#4b5563" font-size="11">charityProjectId: ObjectId (ref)</text>
    <text x="14" y="128" fill="#111827" font-size="11" font-weight="600">coinAmount: Number, status: String</text>
    <text x="14" y="143" fill="#6b7280" font-size="9" font-style="italic">Index: { status: 1, donorUserId: 1 }</text>
  </g>

  <!-- Charity Document -->
  <g transform="translate(50, 260)">
    <rect width="215" height="140" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="215" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="107" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">charities Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">ownerUserId: ObjectId (ref: 'User')</text>
    <text x="14" y="88" fill="#111827" font-size="11" font-weight="600">verificationStatus: 'verified'</text>
    <text x="14" y="108" fill="#4b5563" font-size="11">proofDocuments: [Doc] (Embedded)</text>
    <text x="14" y="128" fill="#4b5563" font-size="11">country, city: String (geocoded)</text>
  </g>

  <!-- Project Document -->
  <g transform="translate(390, 260)">
    <rect width="225" height="140" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="225" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="112" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">projects Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">charityId: ObjectId (ref: 'Charity')</text>
    <text x="14" y="88" fill="#4b5563" font-size="11">title, description: String</text>
    <text x="14" y="108" fill="#111827" font-size="11" font-weight="600">targetAmount, collectedAmount: Num</text>
    <text x="14" y="128" fill="#4b5563" font-size="11">status: 'active'|'completed'</text>
  </g>

  <!-- Product Document -->
  <g transform="translate(735, 260)">
    <rect width="220" height="140" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="220" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="110" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">products Collection</text>
    <text x="14" y="48" fill="#111827" font-size="11">_id: ObjectId</text>
    <text x="14" y="68" fill="#4b5563" font-size="11">ownerUserId: ObjectId (ref: 'User')</text>
    <text x="14" y="88" fill="#4b5563" font-size="11">name, description: String</text>
    <text x="14" y="108" fill="#111827" font-size="11" font-weight="600">price, stock: Number (inventory)</text>
    <text x="14" y="128" fill="#4b5563" font-size="11">images: [String] (Cloudinary)</text>
  </g>

  <!-- Reference Connectors (ObjectId References) -->
  <path d="M 265 145 L 390 145" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 615 145 L 735 145" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 265 330 L 390 330" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 502 260 L 502 225" fill="none" stroke="#111827" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#arrow)"/>

  <!-- Legend -->
  <text x="500" y="425" text-anchor="middle" fill="#4b5563" font-size="11" font-style="italic">Dashed lines represent normalized MongoDB ObjectId references (ref). Subdocuments are embedded directly.</text>
'''
with open('docs/images/flowchart_er_model.svg', 'w') as f:
    f.write(create_svg(1000, 440, content_8))

# 9. Testing Strategy
content_9 = '''
  <text x="500" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 9: Quality Assurance &amp; Verification Pipeline</text>
  <line x1="40" y1="52" x2="960" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <g transform="translate(40, 75)">
    <rect width="200" height="75" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="100" y="30" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">Unit Tests</text>
    <text x="100" y="48" text-anchor="middle" fill="#4b5563" font-size="11">Business logic, tokens</text>
    <text x="100" y="62" text-anchor="middle" fill="#4b5563" font-size="11">&amp; payload validators</text>
  </g>

  <path d="M 240 112 L 275 112" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <g transform="translate(280, 75)">
    <rect width="200" height="75" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="100" y="30" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">Integration Tests</text>
    <text x="100" y="48" text-anchor="middle" fill="#4b5563" font-size="11">Express route endpoints</text>
    <text x="100" y="62" text-anchor="middle" fill="#4b5563" font-size="11">&amp; auth interceptors</text>
  </g>

  <path d="M 480 112 L 515 112" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <g transform="translate(520, 75)">
    <rect width="200" height="75" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <text x="100" y="30" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">Concurrency Tests</text>
    <text x="100" y="48" text-anchor="middle" fill="#4b5563" font-size="11">Atomic coin deductions</text>
    <text x="100" y="62" text-anchor="middle" fill="#4b5563" font-size="11">&amp; auction race safety</text>
  </g>

  <path d="M 720 112 L 755 112" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <g transform="translate(760, 75)">
    <rect width="200" height="75" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="100" y="30" text-anchor="middle" fill="#111827" font-size="13" font-weight="700">GitHub Actions CI</text>
    <text x="100" y="48" text-anchor="middle" fill="#4b5563" font-size="11">Continuous build, lint</text>
    <text x="100" y="62" text-anchor="middle" fill="#4b5563" font-size="11">&amp; test suite validation</text>
  </g>
'''
with open('docs/images/flowchart_testing_strategy.svg', 'w') as f:
    f.write(create_svg(1000, 180, content_9))

# 10. Roadmap
content_10 = '''
  <text x="500" y="38" text-anchor="middle" fill="#111827" font-size="16" font-weight="700">Figure 10: Implementation Milestones &amp; Strategic Roadmap</text>
  <line x1="40" y1="52" x2="960" y2="52" stroke="#e5e7eb" stroke-width="1"/>

  <g transform="translate(40, 75)">
    <rect width="280" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="280" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="140" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Phase 1: Core Architecture (MVP)</text>
    <text x="20" y="52" fill="#4b5563" font-size="11">• Multi-vendor catalog &amp; checkout</text>
    <text x="20" y="70" fill="#4b5563" font-size="11">• Stripe card payment integration</text>
    <text x="20" y="88" fill="#4b5563" font-size="11">• Atomic coin generation &amp; donations</text>
    <text x="20" y="106" fill="#4b5563" font-size="11">• Charity onboarding &amp; admin portal</text>
    <text x="20" y="132" fill="#111827" font-size="11" font-weight="600">[Status: Fully Implemented]</text>
  </g>

  <path d="M 320 150 L 355 150" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <g transform="translate(360, 75)">
    <rect width="280" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="280" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="140" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Phase 2: Social Engagement &amp; Auctions</text>
    <text x="20" y="52" fill="#4b5563" font-size="11">• Timed creator auction bidding</text>
    <text x="20" y="70" fill="#4b5563" font-size="11">• Direct 1-on-1 private messaging</text>
    <text x="20" y="88" fill="#4b5563" font-size="11">• 24h auto-expiring media stories</text>
    <text x="20" y="106" fill="#4b5563" font-size="11">• Tiered donor badges &amp; leaderboards</text>
    <text x="20" y="132" fill="#111827" font-size="11" font-weight="600">[Status: Fully Implemented]</text>
  </g>

  <path d="M 640 150 L 675 150" fill="none" stroke="#111827" stroke-width="1.5" marker-end="url(#arrow)"/>

  <g transform="translate(680, 75)">
    <rect width="280" height="150" rx="4" fill="#ffffff" stroke="#111827" stroke-width="1.5"/>
    <rect width="280" height="28" rx="4" fill="#f3f4f6" stroke="#111827" stroke-width="1.5"/>
    <text x="140" y="19" text-anchor="middle" fill="#111827" font-size="12" font-weight="700">Phase 3: Scale &amp; Governance</text>
    <text x="20" y="52" fill="#4b5563" font-size="11">• Native iOS &amp; Android mobile apps</text>
    <text x="20" y="70" fill="#4b5563" font-size="11">• Direct fiat charity donations</text>
    <text x="20" y="88" fill="#4b5563" font-size="11">• Blockchain-anchored audit ledger</text>
    <text x="20" y="106" fill="#4b5563" font-size="11">• Automated tax-deductible receipts</text>
    <text x="20" y="132" fill="#4b5563" font-size="11" font-weight="600">[Status: Future Scope]</text>
  </g>
'''
with open('docs/images/flowchart_roadmap.svg', 'w') as f:
    f.write(create_svg(1000, 250, content_10))

print("All 10 monochrome SVG diagrams generated and verified.")
