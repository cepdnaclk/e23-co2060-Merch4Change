import os

def create_svg(width, height, content, title="Flowchart"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
    </marker>
    <marker id="arrow-indigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
    </marker>
    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
    </marker>
    <marker id="arrow-rose" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
    </marker>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#3730a3" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
  </defs>

  {content}
</svg>'''

os.makedirs('docs/images', exist_ok=True)

# 1. Problem Statement
content_1 = '''
  <text x="450" y="40" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">Problem Statement: The Philanthropic Friction & Trust Deficit</text>
  
  <!-- Left Nodes -->
  <g transform="translate(60, 80)">
    <rect width="250" height="70" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <text x="125" y="30" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="700">Conscious Shoppers</text>
    <text x="125" y="50" text-anchor="middle" fill="#94a3b8" font-size="12">Lack unified social commerce platform</text>
  </g>

  <g transform="translate(60, 180)">
    <rect width="250" height="70" rx="10" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)"/>
    <text x="125" y="30" text-anchor="middle" fill="#c084fc" font-size="14" font-weight="700">Brands &amp; Creators</text>
    <text x="125" y="50" text-anchor="middle" fill="#94a3b8" font-size="12">High barrier to prove authentic CSR impact</text>
  </g>

  <g transform="translate(60, 280)">
    <rect width="250" height="70" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
    <text x="125" y="30" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Charities &amp; NGOs</text>
    <text x="125" y="50" text-anchor="middle" fill="#94a3b8" font-size="12">High donor skepticism &amp; discovery barrier</text>
  </g>

  <!-- Connectors -->
  <path d="M 310 115 L 490 205" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 310 215 L 490 215" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrow)"/>
  <path d="M 310 315 L 490 225" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrow)"/>

  <!-- Core Problem Node -->
  <g transform="translate(500, 150)">
    <polygon points="175,0 350,65 175,130 0,65" fill="#1e293b" stroke="#f43f5e" stroke-width="3" filter="url(#shadow)"/>
    <text x="175" y="58" text-anchor="middle" fill="#fda4af" font-size="15" font-weight="700">Frictional Philanthropy</text>
    <text x="175" y="78" text-anchor="middle" fill="#fda4af" font-size="15" font-weight="700">&amp; Trust Deficit</text>
  </g>
'''
with open('docs/images/flowchart_problem.svg', 'w') as f:
    f.write(create_svg(900, 390, content_1))

# 2. Value Loop
content_2 = '''
  <text x="500" y="40" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">The Merch-to-Impact Core Value Loop</text>
  
  <g transform="translate(30, 80)">
    <rect width="160" height="90" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <text x="80" y="35" text-anchor="middle" fill="#60a5fa" font-size="13" font-weight="700">1. Browse &amp; Buy</text>
    <text x="80" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Merchandise</text>
    <text x="80" y="72" text-anchor="middle" fill="#94a3b8" font-size="11">(Stripe Checkout)</text>
  </g>

  <path d="M 190 125 L 225 125" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow-indigo)"/>

  <g transform="translate(230, 80)">
    <rect width="160" height="90" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2" filter="url(#shadow)"/>
    <text x="80" y="35" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="700">2. Earn Coins</text>
    <text x="80" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Merch Coins Reward</text>
    <text x="80" y="72" text-anchor="middle" fill="#94a3b8" font-size="11">(1 Coin per $10)</text>
  </g>

  <path d="M 390 125 L 425 125" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow-indigo)"/>

  <g transform="translate(430, 80)">
    <rect width="160" height="90" rx="12" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
    <text x="80" y="35" text-anchor="middle" fill="#34d399" font-size="13" font-weight="700">3. Donate Causes</text>
    <text x="80" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Direct Micro-Donations</text>
    <text x="80" y="72" text-anchor="middle" fill="#94a3b8" font-size="11">to Verified Charities</text>
  </g>

  <path d="M 590 125 L 625 125" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow-indigo)"/>

  <g transform="translate(630, 80)">
    <rect width="160" height="90" rx="12" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)"/>
    <text x="80" y="35" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="700">4. Badges &amp; Rank</text>
    <text x="80" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Bronze to Diamond</text>
    <text x="80" y="72" text-anchor="middle" fill="#94a3b8" font-size="11">Public Leaderboard</text>
  </g>

  <path d="M 790 125 L 825 125" fill="none" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow-indigo)"/>

  <g transform="translate(830, 80)">
    <rect width="140" height="90" rx="12" fill="#1e293b" stroke="#ec4899" stroke-width="2" filter="url(#shadow)"/>
    <text x="70" y="35" text-anchor="middle" fill="#f472b6" font-size="13" font-weight="700">5. Community</text>
    <text x="70" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Inspire via Posts,</text>
    <text x="70" y="72" text-anchor="middle" fill="#94a3b8" font-size="11">Stories &amp; Highlights</text>
  </g>

  <!-- Return Loop Path -->
  <path d="M 900 170 L 900 210 L 110 210 L 110 170" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#arrow-indigo)"/>
  <text x="500" y="230" text-anchor="middle" fill="#818cf8" font-size="12" font-weight="600">Continuous Self-Sustaining Impact Flywheel</text>
'''
with open('docs/images/flowchart_value_loop.svg', 'w') as f:
    f.write(create_svg(1000, 260, content_2))

# 3. User Journey
content_3 = '''
  <text x="450" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">End-to-End User Impact Journey</text>

  <!-- Step 1 -->
  <rect x="325" y="60" width="250" height="42" rx="21" fill="url(#primaryGrad)" filter="url(#shadow)"/>
  <text x="450" y="86" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="600">Shopper Visits Platform &amp; OTP Sign Up</text>
  
  <path d="M 450 102 L 450 125" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Step 2 -->
  <rect x="325" y="125" width="250" height="42" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="151" text-anchor="middle" fill="#93c5fd" font-size="13">Explore Marketplace &amp; Live Drops</text>

  <path d="M 450 167 L 450 190" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Decision: Purchase Type -->
  <polygon points="450,190 560,225 450,260 340,225" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="229" text-anchor="middle" fill="#fde68a" font-size="12" font-weight="600">Purchase Type?</text>

  <!-- Fixed Branch -->
  <path d="M 340 225 L 200 225 L 200 270" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="260" y="215" fill="#94a3b8" font-size="11">Fixed Price</text>
  <rect x="100" y="270" width="200" height="42" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="200" y="296" text-anchor="middle" fill="#93c5fd" font-size="12">Direct Stripe Checkout</text>

  <!-- Auction Branch -->
  <path d="M 560 225 L 700 225 L 700 270" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="640" y="215" fill="#94a3b8" font-size="11">Timed Auction</text>
  <rect x="600" y="270" width="200" height="42" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="700" y="296" text-anchor="middle" fill="#c084fc" font-size="12">Place Bid &amp; Win Auction</text>

  <!-- Merge to Payment -->
  <path d="M 200 312 L 200 345 L 430 345" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <path d="M 700 312 L 700 345 L 470 345" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <path d="M 450 345 L 450 370" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Payment Confirmed -->
  <rect x="315" y="370" width="270" height="45" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
  <text x="450" y="392" text-anchor="middle" fill="#34d399" font-size="13" font-weight="600">Payment Confirmed via Stripe</text>
  <text x="450" y="407" text-anchor="middle" fill="#a7f3d0" font-size="11">Order Created &amp; Merch Coins Credited</text>

  <path d="M 450 415 L 450 440" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Donation -->
  <rect x="315" y="440" width="270" height="45" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="462" text-anchor="middle" fill="#f472b6" font-size="13" font-weight="600">Donate Coins to Verified Project</text>
  <text x="450" y="477" text-anchor="middle" fill="#fbcfe8" font-size="11">Atomic Ledger Update &amp; Progress Increment</text>

  <path d="M 450 485 L 450 510" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Finish -->
  <rect x="300" y="510" width="300" height="42" rx="21" fill="url(#emeraldGrad)" filter="url(#shadow)"/>
  <text x="450" y="536" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Donor Badge Awarded &amp; Feed Share</text>
'''
with open('docs/images/flowchart_user_journey.svg', 'w') as f:
    f.write(create_svg(900, 580, content_3))

# 4. Coin Engine
content_4 = '''
  <text x="450" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Coin Reward &amp; Atomic Donation Architecture</text>

  <!-- Left: Earning -->
  <g transform="translate(40, 65)">
    <rect width="360" height="340" rx="12" fill="#1e293b" fill-opacity="0.5" stroke="#3b82f6" stroke-dasharray="4,4" stroke-width="1.5"/>
    <text x="180" y="30" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="700">Coin Generation Flow</text>

    <rect x="40" y="60" width="280" height="45" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="180" y="87" text-anchor="middle" fill="#f8fafc" font-size="12">Order Paid: $Total via Stripe</text>

    <path d="M 180 105 L 180 140" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

    <rect x="40" y="140" width="280" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="180" y="162" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="600">Reward Calculation Engine</text>
    <text x="180" y="180" text-anchor="middle" fill="#fde68a" font-size="11">Coins = floor(Total Amount / 10)</text>

    <path d="M 180 190 L 180 230" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

    <rect x="40" y="230" width="280" height="45" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="180" y="257" text-anchor="middle" fill="#34d399" font-size="12">Credit User Account Balance</text>
  </g>

  <!-- Right: Donating -->
  <g transform="translate(440, 65)">
    <rect width="420" height="340" rx="12" fill="#1e293b" fill-opacity="0.5" stroke="#10b981" stroke-dasharray="4,4" stroke-width="1.5"/>
    <text x="210" y="30" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Atomic Coin Donation Flow</text>

    <rect x="50" y="60" width="320" height="40" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
    <text x="210" y="85" text-anchor="middle" fill="#f8fafc" font-size="12">Select Verified Charity / Project &amp; Amount</text>

    <path d="M 210 100 L 210 130" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

    <!-- Validation Diamond -->
    <polygon points="210,130 330,165 210,200 90,165" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="210" y="162" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="600">Balance &gt;= Amount &amp;</text>
    <text x="210" y="177" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="600">Charity Approved?</text>

    <path d="M 90 165 L 20 165 L 20 250" fill="none" stroke="#f43f5e" stroke-width="1.5" marker-end="url(#arrow-rose)"/>
    <rect x="0" y="250" width="100" height="35" rx="6" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
    <text x="50" y="272" text-anchor="middle" fill="#fda4af" font-size="10">Reject Request</text>

    <path d="M 210 200 L 210 230" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-emerald)"/>

    <!-- Atomic Block -->
    <rect x="50" y="230" width="320" height="60" rx="8" fill="url(#primaryGrad)"/>
    <text x="210" y="252" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">Atomic MongoDB Transaction</text>
    <text x="210" y="268" text-anchor="middle" fill="#e0e7ff" font-size="11">Deduct Coins | Increment Target | Insert Audit Log</text>
  </g>
'''
with open('docs/images/flowchart_coin_engine.svg', 'w') as f:
    f.write(create_svg(900, 430, content_4))

# 5. Auction Engine
content_5 = '''
  <text x="450" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Live Auction &amp; Real-Time Bidding Window</text>

  <rect x="300" y="60" width="300" height="42" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="86" text-anchor="middle" fill="#c084fc" font-size="13" font-weight="600">Auction Scheduled &amp; Countdown Started</text>

  <path d="M 450 102 L 450 130" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="300" y="130" width="300" height="42" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="156" text-anchor="middle" fill="#93c5fd" font-size="13">Shopper Submits Real-Time Bid ($X)</text>

  <path d="M 450 172 L 450 200" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Decision: Expiry -->
  <polygon points="450,200 570,235 450,270 330,235" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="239" text-anchor="middle" fill="#fde68a" font-size="12" font-weight="600">Auction Expired?</text>

  <!-- Yes -> Reject -->
  <path d="M 570 235 L 700 235 L 700 270" fill="none" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-rose)"/>
  <text x="640" y="225" fill="#f43f5e" font-size="11">Yes (Expired)</text>
  <rect x="610" y="270" width="180" height="40" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="700" y="295" text-anchor="middle" fill="#fda4af" font-size="11">Reject Bid: Closed</text>

  <!-- No -> Increment check -->
  <path d="M 450 270 L 450 310" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-emerald)"/>
  <text x="460" y="292" fill="#10b981" font-size="11">No</text>

  <polygon points="450,310 580,345 450,380 320,345" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="342" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="600">$X &gt;= Current High Bid</text>
  <text x="450" y="356" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="600">+ Min Increment?</text>

  <!-- No increment -> Reject -->
  <path d="M 320 345 L 200 345 L 200 390" fill="none" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-rose)"/>
  <text x="230" y="335" fill="#f43f5e" font-size="11">Below Increment</text>
  <rect x="110" y="390" width="180" height="40" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="200" y="415" text-anchor="middle" fill="#fda4af" font-size="11">Reject: Increment Too Low</text>

  <!-- Valid increment -> update -->
  <path d="M 450 380 L 450 420" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-emerald)"/>
  <text x="460" y="402" fill="#10b981" font-size="11">Valid Bid</text>

  <rect x="290" y="420" width="320" height="45" rx="8" fill="url(#emeraldGrad)" filter="url(#shadow)"/>
  <text x="450" y="442" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">Assign Current High Bidder</text>
  <text x="450" y="457" text-anchor="middle" fill="#d1fae5" font-size="11">Notify Outbid User &amp; Broadcast Update</text>
'''
with open('docs/images/flowchart_auction_engine.svg', 'w') as f:
    f.write(create_svg(900, 490, content_5))

# 6. Charity Verification
content_6 = '''
  <text x="450" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Charity Compliance &amp; Administrative Verification</text>

  <rect x="325" y="60" width="250" height="42" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="86" text-anchor="middle" fill="#93c5fd" font-size="13">Charity / NGO Account Created</text>

  <path d="M 450 102 L 450 130" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="310" y="130" width="280" height="42" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="156" text-anchor="middle" fill="#c084fc" font-size="12">Upload Registration Proof &amp; Tax Documents</text>

  <path d="M 450 172 L 450 200" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <rect x="310" y="200" width="280" height="42" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
  <text x="450" y="226" text-anchor="middle" fill="#fbbf24" font-size="12">Enters Admin Moderation Review Queue</text>

  <path d="M 450 242 L 450 270" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Decision -->
  <polygon points="450,270 570,305 450,340 330,305" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="450" y="309" text-anchor="middle" fill="#fde68a" font-size="12" font-weight="600">Valid Non-Profit?</text>

  <!-- Rejected -->
  <path d="M 330 305 L 180 305 L 180 360" fill="none" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-rose)"/>
  <text x="240" y="295" fill="#f43f5e" font-size="11">Rejected</text>
  <rect x="70" y="360" width="220" height="45" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="180" y="382" text-anchor="middle" fill="#fda4af" font-size="12">Mark Status: Rejected</text>
  <text x="180" y="396" text-anchor="middle" fill="#94a3b8" font-size="10">Send Re-application Feedback</text>

  <!-- Approved -->
  <path d="M 570 305 L 720 305 L 720 360" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrow-emerald)"/>
  <text x="635" y="295" fill="#10b981" font-size="11">Approved</text>
  <rect x="610" y="360" width="220" height="45" rx="8" fill="url(#emeraldGrad)" filter="url(#shadow)"/>
  <text x="720" y="382" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700">Status: Approved</text>
  <text x="720" y="396" text-anchor="middle" fill="#d1fae5" font-size="10">Assign Verified Badge &amp; Unlock Rights</text>
'''
with open('docs/images/flowchart_charity_verification.svg', 'w') as f:
    f.write(create_svg(900, 440, content_6))

# 7. Architecture
content_7 = '''
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="20" font-weight="700">Merch4Change Multi-Tier Architecture</text>

  <!-- Tier 1: Client -->
  <g transform="translate(40, 60)">
    <rect width="920" height="85" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="20" y="25" fill="#60a5fa" font-size="13" font-weight="700">Presentation Tier (Client SPA)</text>
    <rect x="20" y="35" width="260" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="150" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">React 19 + Vite + Tailwind CSS</text>
    <rect x="310" y="35" width="260" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="440" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Leaflet Maps &amp; Lucide Icons</text>
    <rect x="600" y="35" width="290" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="745" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Auth Context &amp; Axios Interceptors</text>
  </g>

  <path d="M 500 145 L 500 175" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Tier 2: Gateway -->
  <g transform="translate(40, 175)">
    <rect width="920" height="85" rx="10" fill="#1e293b" stroke="#8b5cf6" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="20" y="25" fill="#c084fc" font-size="13" font-weight="700">Gateway &amp; Security Middleware Tier</text>
    <rect x="20" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="120" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Express REST API Gateway</text>
    <rect x="240" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="340" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">CORS &amp; Helmet Defense</text>
    <rect x="460" y="35" width="210" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="565" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Dual JWT &amp; Cookie Auth Guard</text>
    <rect x="690" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="790" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Multer Memory Stream (2MB)</text>
  </g>

  <path d="M 500 260 L 500 290" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Tier 3: Core Services -->
  <g transform="translate(40, 290)">
    <rect width="920" height="95" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="20" y="25" fill="#34d399" font-size="13" font-weight="700">Core Domain Services Tier</text>
    <rect x="20" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="87" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Auth &amp; OTP</text>
    <rect x="170" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="237" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Catalog &amp; Shop</text>
    <rect x="320" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="387" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Live Auctions</text>
    <rect x="470" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="537" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Coin Donations</text>
    <rect x="620" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="687" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Social &amp; Stories</text>
    <rect x="770" y="35" width="135" height="45" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="837" y="62" text-anchor="middle" fill="#e2e8f0" font-size="11">Admin Verify</text>
  </g>

  <path d="M 500 385 L 500 415" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Tier 4: Persistence -->
  <g transform="translate(40, 415)">
    <rect width="920" height="85" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="20" y="25" fill="#fbbf24" font-size="13" font-weight="700">Data Persistence &amp; External Cloud APIs</text>
    <rect x="20" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="120" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">MongoDB Atlas (Mongoose)</text>
    <rect x="250" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="350" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Cloudinary CDN</text>
    <rect x="480" y="35" width="200" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="580" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Stripe Checkout API</text>
    <rect x="710" y="35" width="190" height="35" rx="6" fill="#0f172a" stroke="#475569"/>
    <text x="805" y="57" text-anchor="middle" fill="#e2e8f0" font-size="11">Resend / Nodemailer</text>
  </g>
'''
with open('docs/images/flowchart_architecture.svg', 'w') as f:
    f.write(create_svg(1000, 530, content_7))

# 8. ER Model
content_8 = '''
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Database Entity Relationships Overview</text>

  <!-- User Model -->
  <g transform="translate(60, 70)">
    <rect width="200" height="150" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#3b82f6"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">USER</text>
    <text x="15" y="55" fill="#93c5fd" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">username: String</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">email: String</text>
    <text x="15" y="115" fill="#e2e8f0" font-size="11">role: enum</text>
    <text x="15" y="135" fill="#fbbf24" font-size="11">merchCoins: Number</text>
  </g>

  <!-- Order Model -->
  <g transform="translate(400, 70)">
    <rect width="200" height="150" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#10b981"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">ORDER</text>
    <text x="15" y="55" fill="#34d399" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">userId: ObjectId (ref)</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">totalAmount: Number</text>
    <text x="15" y="115" fill="#fbbf24" font-size="11">coinsEarned: Number</text>
    <text x="15" y="135" fill="#e2e8f0" font-size="11">paymentStatus: String</text>
  </g>

  <!-- Donation Model -->
  <g transform="translate(740, 70)">
    <rect width="200" height="150" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#ec4899"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">DONATION</text>
    <text x="15" y="55" fill="#f472b6" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">donorId: ObjectId (ref)</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">charityId: ObjectId</text>
    <text x="15" y="115" fill="#e2e8f0" font-size="11">projectId: ObjectId</text>
    <text x="15" y="135" fill="#fbbf24" font-size="11">amount: Number</text>
  </g>

  <!-- Charity Model -->
  <g transform="translate(60, 270)">
    <rect width="200" height="130" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#8b5cf6"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">CHARITY</text>
    <text x="15" y="55" fill="#c084fc" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">name: String</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">status: enum (verified)</text>
    <text x="15" y="115" fill="#e2e8f0" font-size="11">coordinates: [lat, lng]</text>
  </g>

  <!-- Project Model -->
  <g transform="translate(400, 270)">
    <rect width="200" height="130" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#f59e0b"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">PROJECT</text>
    <text x="15" y="55" fill="#fbbf24" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">charityId: ObjectId</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">targetAmount: Number</text>
    <text x="15" y="115" fill="#e2e8f0" font-size="11">collectedAmount: Number</text>
  </g>

  <!-- Auction Model -->
  <g transform="translate(740, 270)">
    <rect width="200" height="130" rx="8" fill="#1e293b" stroke="#06b6d4" stroke-width="2" filter="url(#shadow)"/>
    <rect width="200" height="30" rx="8" fill="#06b6d4"/>
    <text x="100" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">AUCTION</text>
    <text x="15" y="55" fill="#67e8f9" font-size="11">_id: ObjectId</text>
    <text x="15" y="75" fill="#e2e8f0" font-size="11">currentHighBid: Number</text>
    <text x="15" y="95" fill="#e2e8f0" font-size="11">highBidderId: ObjectId</text>
    <text x="15" y="115" fill="#e2e8f0" font-size="11">endTime: Date</text>
  </g>

  <!-- Connectors -->
  <path d="M 260 145 L 400 145" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <path d="M 600 145 L 740 145" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <path d="M 260 335 L 400 335" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)"/>
  <path d="M 500 270 L 500 220" fill="none" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrow)"/>
'''
with open('docs/images/flowchart_er_model.svg', 'w') as f:
    f.write(create_svg(1000, 440, content_8))

# 9. Testing Strategy
content_9 = '''
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Quality Assurance &amp; Verification Pipeline</text>

  <g transform="translate(40, 70)">
    <rect width="200" height="80" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <text x="100" y="35" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="700">Unit Tests</text>
    <text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Logic, Token Utils</text>
    <text x="100" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">&amp; Payload Validators</text>
  </g>

  <path d="M 240 110 L 275 110" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <g transform="translate(280, 70)">
    <rect width="200" height="80" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
    <text x="100" y="35" text-anchor="middle" fill="#34d399" font-size="14" font-weight="700">Integration Tests</text>
    <text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">API Route Endpoints</text>
    <text x="100" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">&amp; Auth Interceptors</text>
  </g>

  <path d="M 480 110 L 515 110" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <g transform="translate(520, 70)">
    <rect width="200" height="80" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="2" filter="url(#shadow)"/>
    <text x="100" y="35" text-anchor="middle" fill="#fbbf24" font-size="14" font-weight="700">Concurrency Tests</text>
    <text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Race Condition Defense</text>
    <text x="100" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">&amp; Atomic Coin Deductions</text>
  </g>

  <path d="M 720 110 L 755 110" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <g transform="translate(760, 70)">
    <rect width="200" height="80" rx="10" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)"/>
    <text x="100" y="35" text-anchor="middle" fill="#c084fc" font-size="14" font-weight="700">GitHub Actions CI</text>
    <text x="100" y="55" text-anchor="middle" fill="#94a3b8" font-size="11">Automated PR Linting,</text>
    <text x="100" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">Build &amp; Test Verification</text>
  </g>
'''
with open('docs/images/flowchart_testing_strategy.svg', 'w') as f:
    f.write(create_svg(1000, 190, content_9))

# 10. Roadmap
content_10 = '''
  <text x="500" y="35" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">Development Milestones &amp; Strategic Roadmap</text>

  <g transform="translate(40, 70)">
    <rect width="280" height="150" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="2" filter="url(#shadow)"/>
    <rect width="280" height="30" rx="10" fill="#10b981"/>
    <text x="140" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Phase 1: Core Foundation (MVP)</text>
    <text x="20" y="55" fill="#e2e8f0" font-size="11">• Multi-vendor marketplace catalog</text>
    <text x="20" y="75" fill="#e2e8f0" font-size="11">• Stripe card payment integration</text>
    <text x="20" y="95" fill="#e2e8f0" font-size="11">• Atomic coin generation &amp; donations</text>
    <text x="20" y="115" fill="#e2e8f0" font-size="11">• Charity onboarding &amp; admin portal</text>
    <text x="20" y="135" fill="#34d399" font-size="11" font-weight="600">✓ Completed &amp; Verified</text>
  </g>

  <path d="M 320 145 L 355 145" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <g transform="translate(360, 70)">
    <rect width="280" height="150" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <rect width="280" height="30" rx="10" fill="#3b82f6"/>
    <text x="140" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Phase 2: Engagement &amp; Social</text>
    <text x="20" y="55" fill="#e2e8f0" font-size="11">• Live timed drops &amp; auction bidding</text>
    <text x="20" y="75" fill="#e2e8f0" font-size="11">• Direct 1-on-1 peer messaging</text>
    <text x="20" y="95" fill="#e2e8f0" font-size="11">• 24h auto-expiring stories</text>
    <text x="20" y="115" fill="#e2e8f0" font-size="11">• Tiered donor badges &amp; leaderboards</text>
    <text x="20" y="135" fill="#60a5fa" font-size="11" font-weight="600">✓ Completed &amp; Verified</text>
  </g>

  <path d="M 640 145 L 675 145" fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>

  <g transform="translate(680, 70)">
    <rect width="280" height="150" rx="10" fill="#1e293b" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)"/>
    <rect width="280" height="30" rx="10" fill="#8b5cf6"/>
    <text x="140" y="20" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700">Phase 3: Scale &amp; Commercialization</text>
    <text x="20" y="55" fill="#e2e8f0" font-size="11">• Native iOS &amp; Android mobile apps</text>
    <text x="20" y="75" fill="#e2e8f0" font-size="11">• Direct fiat charity donations</text>
    <text x="20" y="95" fill="#e2e8f0" font-size="11">• Blockchain-anchored audit ledger</text>
    <text x="20" y="115" fill="#e2e8f0" font-size="11">• Automated tax-deductible receipts</text>
    <text x="20" y="135" fill="#c084fc" font-size="11" font-weight="600">★ Planned Milestone</text>
  </g>
'''
with open('docs/images/flowchart_roadmap.svg', 'w') as f:
    f.write(create_svg(1000, 250, content_10))

print("All 10 SVG flowcharts generated successfully!")
