import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OrganizationProfile from "../models/OrganizationProfile.js";
import Brand from "../models/Brand.js";
import Charity from "../models/Charity.js";
import Product from "../models/Product.js";
import Project from "../models/Project.js";
import Donation from "../models/Donation.js";
import Order from "../models/Order.js";
import CoinTransaction from "../models/CoinTransaction.js";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/merch4change";

// ── 1. Luxury Products from Original Seed ───────────────────────
const originalLuxuryProducts = [
  {
    name: "Aventador Carbon Chronograph",
    description:
      "Hand-crafted carbon fiber chronograph inspired by the Lamborghini Aventador SVJ. Each piece is individually numbered.",
    price: 8500,
    stock: 5,
    isLimitedEdition: true,
    imageUrl:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600",
  },
  {
    name: "Submariner Midnight Edition",
    description:
      "Rolex Submariner collaboration piece. Deep black dial, ceramic bezel, Oystersteel bracelet. Only 50 produced worldwide.",
    price: 12000,
    stock: 3,
    isLimitedEdition: true,
    imageUrl:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600",
  },
  {
    name: "Chiron Heritage Leather Wallet",
    description:
      "Full-grain Nappa leather wallet crafted in Bugatti's Molsheim atelier. Carbon fiber inlay, hand-stitched edges.",
    price: 3200,
    stock: 25,
    isLimitedEdition: false,
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
  },
  {
    name: "Prancing Horse Silk Scarf",
    description:
      "Ferrari-licensed 100% Mulberry silk scarf. Features the iconic Prancing Horse motif woven in 24-karat gold thread.",
    price: 1800,
    stock: 40,
    isLimitedEdition: false,
    imageUrl:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600",
  },
  {
    name: "Continental GT Cufflinks",
    description:
      "Sterling silver cufflinks featuring the Bentley B emblem. Hand-polished finish, presented in a bentley walnut veneer box.",
    price: 2400,
    stock: 30,
    isLimitedEdition: false,
    imageUrl:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
  },
  {
    name: "Phantom Cashmere Throw",
    description:
      "Rolls-Royce commissioned cashmere throw. Double-woven Scottish cashmere, Ghost White colorway, monogrammed RR corner badge.",
    price: 6500,
    stock: 8,
    isLimitedEdition: true,
    imageUrl:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600",
  },
  {
    name: "F1 Pit Lane Race Jacket",
    description:
      "Mercedes-AMG Petronas F1 Team official pit lane jacket. Worn by the crew at the 2024 Monaco Grand Prix. Individually certified.",
    price: 4200,
    stock: 15,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  },
  {
    name: "911 Turbo Titanium Pen",
    description:
      "Porsche Design titanium fountain pen. Inspired by the 911 Turbo S engine. Comes with Porsche Design leather case.",
    price: 950,
    stock: 50,
    isLimitedEdition: false,
    imageUrl:
      "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600",
  },
];

// ── 2. Data for 100+ Unique Users Across Sections ───────────────

// Section 1: Administrators & Staff (5 users)
const staffAdmins = [
  {
    firstName: "Platform",
    lastName: "Admin",
    userName: "platformadmin",
    email: "admin@merch4change.test",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
  {
    firstName: "Evelyn",
    lastName: "Vance",
    userName: "evelyn_security",
    email: "security@merch4change.test",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
  },
  {
    firstName: "Julian",
    lastName: "Sterling",
    userName: "julian_compliance",
    email: "compliance@merch4change.test",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    firstName: "Chloe",
    lastName: "Mercer",
    userName: "chloe_audit",
    email: "audit@merch4change.test",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  },
  {
    firstName: "Nathan",
    lastName: "Drake",
    userName: "nathan_ops",
    email: "ops@merch4change.test",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
];

// Section 2: Verified International Charities & Non-Profits (20 charities)
const charityOrganizations = [
  {
    orgName: "Global Wildlife Fund",
    email: "contact@globalwildlife.org",
    country: "United States",
    category: "environment",
    description: "Dedicated to preserving natural habitats and protecting endangered species across the globe.",
    logoUrl: "https://images.unsplash.com/photo-1549473889-14f410d83298?w=200",
    projects: [
      {
        title: "Amazon Rainforest Canopy Protection",
        description: "Deploying indigenous ranger teams and acoustic satellite sensors to stop illegal deforestation in the Peruvian Amazon basin.",
        goalAmount: 35000,
        collectedAmount: 26800,
        status: "active",
      },
      {
        title: "Himalayan Snow Leopard Corridor Preservation",
        description: "Installing anti-poaching camera traps and creating community livestock insurance programs across Ladakh.",
        goalAmount: 20000,
        collectedAmount: 17400,
        status: "active",
      },
    ],
  },
  {
    orgName: "Ocean Clean Initiative",
    email: "hello@oceanclean.org",
    country: "Australia",
    category: "environment",
    description: "Removing plastic waste from our oceans and promoting sustainable maritime ecosystems.",
    logoUrl: "https://images.unsplash.com/photo-1520633465133-7e618991fa9b?w=200",
    projects: [
      {
        title: "Great Barrier Reef Plastic Skimmer Fleet",
        description: "Autonomous solar-powered catamarans intercepting microplastics and ghost nets before reaching marine nurseries.",
        goalAmount: 45000,
        collectedAmount: 38200,
        status: "active",
      },
      {
        title: "Whale Migration Highway Safety Shields",
        description: "Acoustic beacon networks to deter commercial freighter collisions with migrating humpback pods.",
        goalAmount: 15000,
        collectedAmount: 15000,
        status: "completed",
      },
    ],
  },
  {
    orgName: "Hope for Education",
    email: "info@hopeforedu.org",
    country: "Kenya",
    category: "education",
    description: "Building schools and providing educational resources to children in underprivileged regions.",
    logoUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    projects: [
      {
        title: "Solar E-Learning Tablets for Rural Classrooms",
        description: "Supplying 500 rugged offline-loaded tablets powered by rooftop solar panels in Turkana County.",
        goalAmount: 18000,
        collectedAmount: 14200,
        status: "active",
      },
      {
        title: "STEM Laboratories for Girls Academy",
        description: "Furnishing modern chemistry and computer laboratories in Nairobi to empower young women in tech.",
        goalAmount: 25000,
        collectedAmount: 21500,
        status: "active",
      },
    ],
  },
  {
    orgName: "Clean Water Springs",
    email: "contact@cleanwatersprings.org",
    country: "Ethiopia",
    category: "humanitarian",
    description: "Drilling clean, sustainable water wells and boreholes for rural villages.",
    logoUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200",
    projects: [
      {
        title: "Deep Aquifer Borehole Wells in Oromia",
        description: "Drilling 8 deep community water boreholes providing disease-free drinking water to 12,000 residents.",
        goalAmount: 30000,
        collectedAmount: 28900,
        status: "active",
      },
    ],
  },
  {
    orgName: "Doctors for Humanity",
    email: "support@doctorshumanity.org",
    country: "Switzerland",
    category: "health",
    description: "Emergency surgical care and vital medicines in conflict zones and disaster areas.",
    logoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200",
    projects: [
      {
        title: "Mobile Surgical Containers for Flood Zones",
        description: "Deployable sterile surgical units providing emergency trauma care during sudden climate disasters.",
        goalAmount: 60000,
        collectedAmount: 51200,
        status: "active",
      },
    ],
  },
  {
    orgName: "Shelter Safe Haven",
    email: "contact@sheltersafe.org",
    country: "United Kingdom",
    category: "humanitarian",
    description: "Providing warm beds, nutritious meals, and rehabilitation for unhoused families.",
    logoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200",
    projects: [
      {
        title: "Winter Emergency Transitional Housing",
        description: "Converting unused urban buildings into 40 dignified temporary studio units with social worker support.",
        goalAmount: 40000,
        collectedAmount: 32000,
        status: "active",
      },
    ],
  },
  {
    orgName: "Canine Rescue League",
    email: "rescue@canineleague.org",
    country: "Canada",
    category: "animal",
    description: "Rescuing abandoned street animals and operating no-kill rehabilitation sanctuaries.",
    logoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200",
    projects: [
      {
        title: "Winterized Medical Sanctuary for Senior Rescues",
        description: "Heated rehabilitation kennels and orthopedic surgery suite for elderly neglected dogs.",
        goalAmount: 22000,
        collectedAmount: 19500,
        status: "active",
      },
    ],
  },
  {
    orgName: "Green Earth Reforest",
    email: "plant@greenearthreforest.org",
    country: "Brazil",
    category: "environment",
    description: "Restoring native Atlantic biodiversity through indigenous seed-bombing and planting.",
    logoUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=200",
    projects: [
      {
        title: "One Million Native Saplings Planting Initiative",
        description: "Rebuilding fragmented wildlife corridors between protected state reserves in Parana.",
        goalAmount: 50000,
        collectedAmount: 46000,
        status: "active",
      },
    ],
  },
  {
    orgName: "Bright Future Youth",
    email: "team@brightfutureyouth.org",
    country: "South Africa",
    category: "education",
    description: "Mentoring high-school youth through after-school robotics, coding, and leadership labs.",
    logoUrl: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=200",
    projects: [
      {
        title: "Township Youth Robotics & Coding Hub",
        description: "Providing laptops, high-speed fiber, and certified Python/AI tutors for 300 underprivileged teens in Soweto.",
        goalAmount: 24000,
        collectedAmount: 18300,
        status: "active",
      },
    ],
  },
  {
    orgName: "Sight for Everyone",
    email: "vision@sightforeveryone.org",
    country: "India",
    category: "health",
    description: "Preventing avoidable blindness through free cataract screenings and corrective surgeries.",
    logoUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200",
    projects: [
      {
        title: "Rural Bus Cataract Surgery Missions",
        description: "Mobile eye surgical theaters visiting remote agrarian villages to perform 1,000 sight-restoring procedures.",
        goalAmount: 28000,
        collectedAmount: 28000,
        status: "completed",
      },
    ],
  },
  {
    orgName: "Rainforest Action Guardians",
    email: "info@rainforestguardians.org",
    country: "Indonesia",
    category: "environment",
    description: "Defending peatland swamp forests and orangutan territory from destructive palm concessions.",
    logoUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200",
    projects: [
      {
        title: "Borneo Orangutan Habitat Buffer Zones",
        description: "Purchasing conservation easements around national parks to prevent wildfire encroachment.",
        goalAmount: 38000,
        collectedAmount: 29500,
        status: "active",
      },
    ],
  },
  {
    orgName: "Zero Hunger Outreach",
    email: "feed@zerohungeroutreach.org",
    country: "United States",
    category: "humanitarian",
    description: "Rescuing surplus grocery produce and operating fresh community pantries.",
    logoUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=200",
    projects: [
      {
        title: "Electric Refrigerated Produce Rescue Vans",
        description: "Acquiring two zero-emission vans to distribute 20,000 lbs of fresh vegetables weekly to food deserts.",
        goalAmount: 35000,
        collectedAmount: 29800,
        status: "active",
      },
    ],
  },
  {
    orgName: "Maternal Health Relief",
    email: "care@maternalhealthrelief.org",
    country: "Nigeria",
    category: "health",
    description: "Reducing maternal mortality by providing antiseptic birthing kits and midwife training.",
    logoUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200",
    projects: [
      {
        title: "5,000 Safe Delivery Kits for Rural Clinics",
        description: "Sterile delivery bundles and solar fetal heart dopplers for midwives in remote agrarian communities.",
        goalAmount: 16000,
        collectedAmount: 13500,
        status: "active",
      },
    ],
  },
  {
    orgName: "Coral Reef Rebuilders",
    email: "dive@coralrebuilders.org",
    country: "Philippines",
    category: "environment",
    description: "Micro-fragmenting heat-resilient coral cultivars and planting artificial reef modules.",
    logoUrl: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=200",
    projects: [
      {
        title: "Super-Coral Micro-Fragmentation Nursery",
        description: "Growing 20,000 genetically resilient coral colonies in sea table nurseries for reef restoration.",
        goalAmount: 32000,
        collectedAmount: 24700,
        status: "active",
      },
    ],
  },
  {
    orgName: "Save the Children First",
    email: "hello@savethechildrenfirst.org",
    country: "Guatemala",
    category: "humanitarian",
    description: "Nutrition clinics and early childhood stimulation centers in mountainous highlands.",
    logoUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200",
    projects: [
      {
        title: "Highland Infant Malnutrition Recovery Clinic",
        description: "Providing fortified micro-nutrient paste and regular health monitoring to 600 indigenous toddlers.",
        goalAmount: 21000,
        collectedAmount: 17800,
        status: "active",
      },
    ],
  },
  {
    orgName: "Wild Elephant Sanctuary",
    email: "contact@wildelephantsanctuary.org",
    country: "Thailand",
    category: "animal",
    description: "Retiring exploited tourism elephants into chain-free natural forest preserves.",
    logoUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=200",
    projects: [
      {
        title: "Forest Expansion for Rescued Asian Elephants",
        description: "Securing 250 acres of lush jungle foraging territory and installing clean river bathing stations.",
        goalAmount: 42000,
        collectedAmount: 36000,
        status: "active",
      },
    ],
  },
  {
    orgName: "Mental Well-Being Alliance",
    email: "support@mentalwellbeing.org",
    country: "United Kingdom",
    category: "health",
    description: "Free, confidential 24/7 crisis text support and youth mental wellness workshops.",
    logoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
    projects: [
      {
        title: "24/7 Suicide Prevention Crisis Textline Scaler",
        description: "Training 200 volunteer crisis counselors and upgrading secure cloud response infrastructure.",
        goalAmount: 27000,
        collectedAmount: 23100,
        status: "active",
      },
    ],
  },
  {
    orgName: "Literacy for All",
    email: "books@literacyforall.org",
    country: "Colombia",
    category: "education",
    description: "Donkey-back and boat libraries bringing books to children in isolated river hamlets.",
    logoUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200",
    projects: [
      {
        title: "Floating River Library on the Magdalena River",
        description: "A motorized wooden barge carrying 3,000 children's books and solar satellite internet along river towns.",
        goalAmount: 19000,
        collectedAmount: 16400,
        status: "active",
      },
    ],
  },
  {
    orgName: "Solar Power Schools",
    email: "energy@solarschools.org",
    country: "India",
    category: "education",
    description: "Electrifying off-grid rural schools with clean solar arrays and battery banks.",
    logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=200",
    projects: [
      {
        title: "Solar Energy & LED Lighting for 25 Village Schools",
        description: "Eliminating kerosene fumes and enabling evening community adult literacy classes.",
        goalAmount: 33000,
        collectedAmount: 29000,
        status: "active",
      },
    ],
  },
  {
    orgName: "Urban Garden Project",
    email: "grow@urbangardens.org",
    country: "United States",
    category: "environment",
    description: "Transforming vacant asphalt lots into organic community food gardens and bee habitats.",
    logoUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=200",
    projects: [
      {
        title: "Rooftop Pollinator Garden & Community Apiary",
        description: "Installing 15 native bee hives and organic vegetable planters across city community centers.",
        goalAmount: 14000,
        collectedAmount: 12200,
        status: "active",
      },
    ],
  },
];

// Section 3: Sustainable Merch Brands & Artisans (18 brands)
const brandOrganizations = [
  {
    orgName: "EcoWear Sustainable",
    email: "hello@ecowear.com",
    country: "Sweden",
    description: "100% sustainable clothing brand utilizing recycled materials and donating proceeds.",
    logoUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200",
    products: [
      {
        name: "Recycled Ocean Fleece Pullover",
        description: "Ultra-soft thermal pullover woven entirely from reclaimed ocean bottles.",
        price: 95,
        stock: 45,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
      },
      {
        name: "Upcycled Organic Denim Jacket",
        description: "Zero-water-waste washed denim tailored with vintage brass hardware.",
        price: 145,
        stock: 18,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
      },
    ],
  },
  {
    orgName: "Patagonia Impact Goods",
    email: "csr@patagoniaimpact.com",
    country: "United States",
    description: "Outdoor apparel committed to 1% for the Planet and high-integrity social supply chains.",
    logoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200",
    products: [
      {
        name: "Alpine Expedition Storm Shell",
        description: "3-layer breathable waterproof shell made for severe weather, Fair Trade Certified sewn.",
        price: 280,
        stock: 22,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600",
      },
    ],
  },
  {
    orgName: "Aura Artisan Studio",
    email: "contact@aurastudio.com",
    country: "Italy",
    description: "Luxury hand-crafted accessories funding local craft communities and clean water.",
    logoUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200",
    products: [
      {
        name: "Hand-Turned Tuscan Leather Briefcase",
        description: "Vegetable-tanned Florentine bridle leather with solid hand-cast brass closures.",
        price: 520,
        stock: 12,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      },
    ],
  },
  {
    orgName: "Terra Living Earthwear",
    email: "sales@terraliving.com",
    country: "Germany",
    description: "Zero-waste everyday accessories crafted from organic cork, hemp, and mycelium.",
    logoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200",
    products: [
      {
        name: "Mycelium Vegan Travel Pouch",
        description: "Water-resistant mushroom leather toiletry kit with biodegradable lining.",
        price: 65,
        stock: 60,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
      },
    ],
  },
  {
    orgName: "Solstice Solar Gear",
    email: "connect@solsticegear.com",
    country: "Canada",
    description: "Portable solar packs and clean battery power built for hikers and digital nomads.",
    logoUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200",
    products: [
      {
        name: "Modular Solar Commuter Backpack",
        description: "Integrated SunPower solar cell generating 15W fast charge with padded 16-inch laptop cocoon.",
        price: 185,
        stock: 25,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600",
      },
    ],
  },
  {
    orgName: "Nirvana Bamboo Home",
    email: "orders@nirvanabamboo.com",
    country: "Japan",
    description: "Minimalist bamboo homewares supporting traditional forestry craftspeople.",
    logoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200",
    products: [
      {
        name: "Hand-Carved Kyoto Bamboo Tea Set",
        description: "Moso bamboo ceremonial matcha bowl, whisk, and tray cured in organic walnut oil.",
        price: 110,
        stock: 35,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600",
      },
    ],
  },
  {
    orgName: "Vanguard Ethical Watches",
    email: "concierge@vanguardtime.com",
    country: "Switzerland",
    description: "Swiss automatic watches cased in 100% recycled aerospace titanium.",
    logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200",
    products: [
      {
        name: "Vanguard Terra Automatic Diver",
        description: "300m water resistance, sapphire crystal, sapphire caseback displaying recycled gold rotor.",
        price: 1650,
        stock: 6,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
      },
    ],
  },
  {
    orgName: "Nomad Woolen Mills",
    email: "contact@nomadwoolen.com",
    country: "New Zealand",
    description: "Regenerative Merino wool apparel traceable from farm gate to finished garment.",
    logoUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200",
    products: [
      {
        name: "Cloud Merino Crewneck Knit",
        description: "17.5 micron superfine merino wool offering cloud-soft temperature regulation.",
        price: 135,
        stock: 40,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
      },
    ],
  },
  {
    orgName: "Oasis Organic Botanicals",
    email: "support@oasisbotanicals.com",
    country: "France",
    description: "Biodynamic organic skincare formulated with cold-pressed wild botanicals.",
    logoUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200",
    products: [
      {
        name: "Regenerative Rosehip Night Elixir",
        description: "Hand-harvested Patagonian rosehip seed oil infused with blue tansy and Bakuchiol.",
        price: 58,
        stock: 80,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1608248597359-0092d6e36d4f?w=600",
      },
    ],
  },
  {
    orgName: "Summit Mountaineering Goods",
    email: "team@summitmountain.com",
    country: "United States",
    description: "Lightweight climbing and mountaineering gear built to withstand the harshest peaks.",
    logoUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200",
    products: [
      {
        name: "Titanium Ultralight Camp Stove",
        description: "Weighing only 45 grams, precision CNC machined titanium burner for sub-zero altitudes.",
        price: 75,
        stock: 50,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600",
      },
    ],
  },
  {
    orgName: "Blue Ocean Eyewear",
    email: "info@blueoceaneyewear.com",
    country: "Spain",
    description: "Polarized designer sunglasses hand-molded from recycled Mediterranean fishnets.",
    logoUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200",
    products: [
      {
        name: "Iberian Polarized Wayfarers",
        description: "Matte ocean navy frames with anti-reflective polarized mineral glass lenses.",
        price: 125,
        stock: 30,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
      },
    ],
  },
  {
    orgName: "Komorebi Ceramic Arts",
    email: "gallery@komorebiceramics.com",
    country: "Japan",
    description: "One-of-a-kind wood-fired stoneware ceramics made with wild clay.",
    logoUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
    products: [
      {
        name: "Shino Glaze Hand-Pinched Coffee Tumbler",
        description: "Fired in an anagama kiln for 4 days, resulting in natural ash deposits and unique hues.",
        price: 68,
        stock: 20,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
      },
    ],
  },
  {
    orgName: "Pure Cotton Collective",
    email: "hello@purecottoncollective.com",
    country: "India",
    description: "Rain-fed organic cotton everyday basics honoring generational weaving guilds.",
    logoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200",
    products: [
      {
        name: "Heavyweight Organic Pocket Tee - Slate",
        description: "260 GSM combed organic cotton ring-spun for maximum drape and longevity.",
        price: 42,
        stock: 75,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
      },
    ],
  },
  {
    orgName: "Aurora Recycled Silver",
    email: "studio@aurorasilver.com",
    country: "Denmark",
    description: "Sculptural fine jewelry cast exclusively from certified recycled e-waste silver.",
    logoUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200",
    products: [
      {
        name: "Melted Ripple Sterling Silver Bangle",
        description: "Solid 925 recycled silver cuff with organic hammered edge and brushed finish.",
        price: 195,
        stock: 14,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
      },
    ],
  },
  {
    orgName: "Zephyr Recycled Active",
    email: "gear@zephyractive.com",
    country: "Australia",
    description: "High-performance compression activewear made from post-consumer nylon.",
    logoUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200",
    products: [
      {
        name: "Zephyr Aero Running Shorts",
        description: "Ultralight laser-cut 4-way stretch shorts with built-in moisture-wicking liner.",
        price: 68,
        stock: 55,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600",
      },
    ],
  },
  {
    orgName: "Kindred Leather Works",
    email: "craft@kindredleather.com",
    country: "United States",
    description: "Hand-stitched leather wallets and key fobs using local regenerative ranch hides.",
    logoUrl: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=200",
    products: [
      {
        name: "Minimalist Bifold Card Wallet",
        description: "Waxed linen hand-stitched Horween leather bifold holding 10 cards and cash.",
        price: 78,
        stock: 40,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
      },
    ],
  },
  {
    orgName: "Cascade Mountain Roasters",
    email: "coffee@cascadepack.com",
    country: "United States",
    description: "Direct-trade organic specialty coffee supporting women-led coffee cooperatives.",
    logoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200",
    products: [
      {
        name: "Cerro Azul Gesha Reserve Whole Bean",
        description: "Notes of jasmine, bergamot, and white peach from the high cloud forests of Boquete.",
        price: 36,
        stock: 65,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
      },
    ],
  },
  {
    orgName: "Solari Clean Lighting",
    email: "light@solariclean.com",
    country: "Netherlands",
    description: "Rechargeable architectural solar table lanterns for off-grid and patio living.",
    logoUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200",
    products: [
      {
        name: "Solari Ambient Solar Lantern",
        description: "Brushed aluminum and frosted glass solar lantern providing 12 hours of warm ambient glow.",
        price: 110,
        stock: 30,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600",
      },
    ],
  },
];

// Section 4: High-Impact Donors & Philanthropists (22 users)
const highImpactDonors = [
  {
    firstName: "Sarah",
    lastName: "Jenkins",
    userName: "sarah_gives",
    email: "sarah@test.com",
    coinBalance: 5400,
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    firstName: "Aiden",
    lastName: "Silva",
    userName: "aidensilva",
    email: "aiden@example.com",
    coinBalance: 3850,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
  {
    firstName: "Elena",
    lastName: "Rostova",
    userName: "elena_eco",
    email: "elena@test.com",
    coinBalance: 2950,
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
  {
    firstName: "Marcus",
    lastName: "Chen",
    userName: "marcus_c",
    email: "marcus@test.com",
    coinBalance: 2420,
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    firstName: "Maya",
    lastName: "Patel",
    userName: "mayap",
    email: "maya@test.com",
    coinBalance: 1940,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  },
  {
    firstName: "Lucas",
    lastName: "Moreau",
    userName: "lucas_giver",
    email: "lucas@example.com",
    coinBalance: 4200,
    profileImageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
  },
  {
    firstName: "Isabella",
    lastName: "Fontana",
    userName: "isabella_f",
    email: "isabella@example.com",
    coinBalance: 3600,
    profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  },
  {
    firstName: "Tariq",
    lastName: "Al-Mansoor",
    userName: "tariq_m",
    email: "tariq@example.com",
    coinBalance: 4900,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Amara",
    lastName: "Okonkwo",
    userName: "amara_o",
    email: "amara@example.com",
    coinBalance: 3100,
    profileImageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
  },
  {
    firstName: "Oliver",
    lastName: "Schmidt",
    userName: "oliver_s",
    email: "oliver@example.com",
    coinBalance: 2750,
    profileImageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200",
  },
  {
    firstName: "Hannah",
    lastName: "Lindqvist",
    userName: "hannah_l",
    email: "hannah@example.com",
    coinBalance: 3300,
    profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  },
  {
    firstName: "Gabriel",
    lastName: "Santos",
    userName: "gabriel_s",
    email: "gabriel@example.com",
    coinBalance: 2200,
    profileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
  },
  {
    firstName: "Fatima",
    lastName: "Zahra",
    userName: "fatima_z",
    email: "fatima@example.com",
    coinBalance: 3900,
    profileImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200",
  },
  {
    firstName: "Dmitri",
    lastName: "Volkov",
    userName: "dmitri_v",
    email: "dmitri@example.com",
    coinBalance: 2850,
    profileImageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200",
  },
  {
    firstName: "Keiko",
    lastName: "Tanaka",
    userName: "keiko_t",
    email: "keiko@example.com",
    coinBalance: 4100,
    profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
  },
  {
    firstName: "Liam",
    lastName: "O'Connor",
    userName: "liam_oc",
    email: "liam@example.com",
    coinBalance: 2500,
    profileImageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200",
  },
  {
    firstName: "Zara",
    lastName: "Hassan",
    userName: "zara_h",
    email: "zara@example.com",
    coinBalance: 3450,
    profileImageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200",
  },
  {
    firstName: "Matteo",
    lastName: "Ricci",
    userName: "matteo_r",
    email: "matteo@example.com",
    coinBalance: 2950,
    profileImageUrl: "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=200",
  },
  {
    firstName: "Camila",
    lastName: "Morales",
    userName: "camila_m",
    email: "camila@example.com",
    coinBalance: 3200,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  },
  {
    firstName: "Ethan",
    lastName: "Wright",
    userName: "ethan_w",
    email: "ethan@example.com",
    coinBalance: 4600,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Ananya",
    lastName: "Deshmukh",
    userName: "ananya_d",
    email: "ananya@example.com",
    coinBalance: 2800,
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
  {
    firstName: "Noah",
    lastName: "Kim",
    userName: "noah_k",
    email: "noah@example.com",
    coinBalance: 3750,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
];

// Section 5: Community Leaders, Activists & Volunteers (20 users)
const communityLeaders = [
  {
    firstName: "Maya",
    lastName: "Angelou-Green",
    userName: "maya_green",
    email: "mayagreen@community.org",
    coinBalance: 850,
    profileImageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
  },
  {
    firstName: "Kwame",
    lastName: "Asante",
    userName: "kwame_a",
    email: "kwame@community.org",
    coinBalance: 720,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Sofia",
    lastName: "Navarro",
    userName: "sofia_n",
    email: "sofia@community.org",
    coinBalance: 910,
    profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  },
  {
    firstName: "Devon",
    lastName: "Miles",
    userName: "devon_m",
    email: "devon@community.org",
    coinBalance: 640,
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
  {
    firstName: "Leila",
    lastName: "Kassir",
    userName: "leila_k",
    email: "leila@community.org",
    coinBalance: 780,
    profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  },
  {
    firstName: "Koji",
    lastName: "Sato",
    userName: "koji_s",
    email: "koji@community.org",
    coinBalance: 690,
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    firstName: "Zoe",
    lastName: "Kravitz-Bell",
    userName: "zoe_kb",
    email: "zoekb@community.org",
    coinBalance: 830,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  },
  {
    firstName: "Finn",
    lastName: "MacLeod",
    userName: "finn_ml",
    email: "finn@community.org",
    coinBalance: 610,
    profileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
  },
  {
    firstName: "Aaliyah",
    lastName: "Brooks",
    userName: "aaliyah_b",
    email: "aaliyah@community.org",
    coinBalance: 940,
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    firstName: "Mateo",
    lastName: "Vargas",
    userName: "mateo_v",
    email: "mateo@community.org",
    coinBalance: 590,
    profileImageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200",
  },
  {
    firstName: "Nadia",
    lastName: "Boulanger",
    userName: "nadia_b",
    email: "nadia@community.org",
    coinBalance: 870,
    profileImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200",
  },
  {
    firstName: "Arjun",
    lastName: "Nair",
    userName: "arjun_n",
    email: "arjun@community.org",
    coinBalance: 760,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
  {
    firstName: "Ingrid",
    lastName: "Holm",
    userName: "ingrid_h",
    email: "ingrid@community.org",
    coinBalance: 920,
    profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  },
  {
    firstName: "Ravi",
    lastName: "Shankar",
    userName: "ravi_shankar",
    email: "ravi@community.org",
    coinBalance: 650,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Freja",
    lastName: "Larsen",
    userName: "freja_l",
    email: "freja@community.org",
    coinBalance: 810,
    profileImageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200",
  },
  {
    firstName: "Dante",
    lastName: "Alighieri",
    userName: "dante_a",
    email: "dante@community.org",
    coinBalance: 570,
    profileImageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200",
  },
  {
    firstName: "Yuki",
    lastName: "Matsumoto",
    userName: "yuki_m",
    email: "yuki@community.org",
    coinBalance: 880,
    profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
  },
  {
    firstName: "Siddharth",
    lastName: "Kapoor",
    userName: "sid_kapoor",
    email: "sid@community.org",
    coinBalance: 630,
    profileImageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200",
  },
  {
    firstName: "Chiara",
    lastName: "Esposito",
    userName: "chiara_e",
    email: "chiara@community.org",
    coinBalance: 790,
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
  {
    firstName: "Brenden",
    lastName: "Kelly",
    userName: "brenden_k",
    email: "brenden@community.org",
    coinBalance: 700,
    profileImageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
  },
];

// Section 6: Marketplace Shoppers, Collectors & Auction Bidders (18 users)
const shoppersAndBidders = [
  {
    firstName: "Victoria",
    lastName: "Beckham-Cole",
    userName: "collector_pro",
    email: "collector@shopper.test",
    coinBalance: 1250,
    profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  },
  {
    firstName: "Arthur",
    lastName: "Pendleton",
    userName: "arthur_bidder",
    email: "arthur@shopper.test",
    coinBalance: 1100,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Selena",
    lastName: "Gomez-Rivera",
    userName: "selena_art",
    email: "selena@shopper.test",
    coinBalance: 980,
    profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  },
  {
    firstName: "Hugo",
    lastName: "Boss-Dupont",
    userName: "hugo_style",
    email: "hugo@shopper.test",
    coinBalance: 1450,
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    firstName: "Natasha",
    lastName: "Romanoff",
    userName: "natasha_r",
    email: "natasha@shopper.test",
    coinBalance: 890,
    profileImageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
  },
  {
    firstName: "Bruce",
    lastName: "Wayne-Enterprise",
    userName: "bruce_philanthropist",
    email: "bruce@shopper.test",
    coinBalance: 2100,
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
  {
    firstName: "Diana",
    lastName: "Prince",
    userName: "diana_warrior",
    email: "diana@shopper.test",
    coinBalance: 1340,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  },
  {
    firstName: "Clark",
    lastName: "Kent",
    userName: "clark_k",
    email: "clark@shopper.test",
    coinBalance: 780,
    profileImageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
  },
  {
    firstName: "Jessica",
    lastName: "Jones",
    userName: "jessica_j",
    email: "jessica@shopper.test",
    coinBalance: 620,
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    firstName: "Barry",
    lastName: "Allen",
    userName: "barry_a",
    email: "barry@shopper.test",
    coinBalance: 950,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },
  {
    firstName: "Hal",
    lastName: "Jordan",
    userName: "hal_j",
    email: "hal@shopper.test",
    coinBalance: 870,
    profileImageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200",
  },
  {
    firstName: "Kara",
    lastName: "Zor-El",
    userName: "kara_z",
    email: "kara@shopper.test",
    coinBalance: 1150,
    profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  },
  {
    firstName: "Victor",
    lastName: "Stone",
    userName: "victor_s",
    email: "victor@shopper.test",
    coinBalance: 1040,
    profileImageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200",
  },
  {
    firstName: "Wanda",
    lastName: "Maximoff",
    userName: "wanda_m",
    email: "wanda@shopper.test",
    coinBalance: 1280,
    profileImageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200",
  },
  {
    firstName: "Stephen",
    lastName: "Strange",
    userName: "stephen_s",
    email: "stephen@shopper.test",
    coinBalance: 1580,
    profileImageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200",
  },
  {
    firstName: "Peter",
    lastName: "Parker",
    userName: "peter_p",
    email: "peter@shopper.test",
    coinBalance: 520,
    profileImageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
  },
  {
    firstName: "Tony",
    lastName: "Stark-Impact",
    userName: "tony_s",
    email: "tony@shopper.test",
    coinBalance: 3400,
    profileImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },
  {
    firstName: "Carol",
    lastName: "Danvers",
    userName: "carol_d",
    email: "carol@shopper.test",
    coinBalance: 1420,
    profileImageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200",
  },
];

async function seedFull() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // ── STEP 1: DROP DATABASE FROM SCRATCH ────────────────────────
    console.log("🗑️ Dropping database from scratch...");
    try {
      await mongoose.connection.db.dropDatabase();
      console.log("✅ Database dropped cleanly from scratch.");
    } catch (dropErr) {
      console.log("Drop database warning, wiping collections manually:", dropErr.message);
      await Promise.all([
        User.deleteMany({}),
        OrganizationProfile.deleteMany({}),
        Brand.deleteMany({}),
        Charity.deleteMany({}),
        Product.deleteMany({}),
        Project.deleteMany({}),
        Donation.deleteMany({}),
        Order.deleteMany({}),
        CoinTransaction.deleteMany({}),
        Auction.deleteMany({}),
        Bid.deleteMany({}),
      ]);
    }

    const standardPassword = await bcrypt.hash("Password123!", 10);

    // ── STEP 2: SEED SECTION 1: ADMINISTRATORS (5 users) ─────────
    console.log("👑 Seeding Section 1: Platform Administrators & Compliance (5 users)...");
    const createdAdmins = [];
    for (const adm of staffAdmins) {
      const u = await User.create({
        firstName: adm.firstName,
        lastName: adm.lastName,
        userName: adm.userName,
        email: adm.email,
        password: standardPassword,
        accountType: "individual",
        role: "admin",
        isVerified: true,
        coinBalance: 5000,
        profileImageUrl: adm.profileImageUrl,
      });
      createdAdmins.push(u);
    }
    console.log(`✅ Seeded ${createdAdmins.length} platform administrator accounts.`);

    // ── STEP 3: SEED SECTION 2: CHARITIES & PROJECTS (20 orgs) ───
    console.log("🕊️ Seeding Section 2: Verified International Charities & Projects (20 orgs)...");
    const createdCharityUsers = [];
    const createdCharityDocs = [];
    const createdProjects = [];

    for (const cData of charityOrganizations) {
      const charUser = await User.create({
        firstName: cData.orgName,
        lastName: "Charity",
        userName: cData.orgName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        email: cData.email,
        password: standardPassword,
        accountType: "organization",
        role: "charity",
        isVerified: true,
        profileImageUrl: cData.logoUrl,
      });
      createdCharityUsers.push(charUser);

      await OrganizationProfile.create({
        userId: charUser._id,
        orgName: cData.orgName,
        phone: "+1-800-456-7890",
        address: `100 Impact Plaza, Suite 400`,
        website: `https://www.${charUser.userName}.org`,
      });

      const charity = await Charity.create({
        ownerUserId: charUser._id,
        publicName: cData.orgName,
        category: cData.category,
        verificationStatus: "verified",
        description: cData.description,
        country: cData.country,
        logoUrl: cData.logoUrl,
      });
      createdCharityDocs.push(charity);

      // Seed unique projects for this charity
      for (const p of cData.projects) {
        const proj = await Project.create({
          charityId: charity._id,
          title: p.title,
          description: p.description,
          goalAmount: p.goalAmount,
          collectedAmount: p.collectedAmount,
          status: p.status,
        });
        createdProjects.push(proj);
      }
    }
    console.log(
      `✅ Seeded ${createdCharityUsers.length} verified charities and ${createdProjects.length} unique impact projects.`
    );

    // ── STEP 4: SEED SECTION 3: BRANDS & PRODUCTS (18 brands) ─────
    console.log("🛍️ Seeding Section 3: Sustainable Brands & Catalog Products (18 brands)...");
    const createdBrandUsers = [];
    const createdBrandDocs = [];
    const createdProducts = [];

    for (const bData of brandOrganizations) {
      const brandUser = await User.create({
        firstName: bData.orgName,
        lastName: "Brand",
        userName: bData.orgName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        email: bData.email,
        password: standardPassword,
        accountType: "organization",
        role: "brand",
        isVerified: true,
        profileImageUrl: bData.logoUrl,
      });
      createdBrandUsers.push(brandUser);

      await OrganizationProfile.create({
        userId: brandUser._id,
        orgName: bData.orgName,
        phone: "+1-888-789-0123",
        address: `450 Artisan Blvd`,
        website: `https://www.${brandUser.userName}.com`,
      });

      const brand = await Brand.create({
        ownerUserId: brandUser._id,
        brandName: bData.orgName,
        description: bData.description,
        logoUrl: bData.logoUrl,
        slug: bData.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      });
      createdBrandDocs.push(brand);

      for (const prod of bData.products) {
        const p = await Product.create({
          ...prod,
          brandId: brand._id,
          ownerUserId: brandUser._id,
          currency: "USD",
          isPublished: true,
        });
        createdProducts.push(p);
      }
    }

    // Also seed original luxury products assigned to first brands
    for (let i = 0; i < originalLuxuryProducts.length; i++) {
      const lux = originalLuxuryProducts[i];
      const assignedBrand = createdBrandDocs[i % createdBrandDocs.length];
      const p = await Product.create({
        ...lux,
        brandId: assignedBrand._id,
        ownerUserId: assignedBrand.ownerUserId,
        currency: "USD",
        isPublished: true,
      });
      createdProducts.push(p);
    }

    console.log(
      `✅ Seeded ${createdBrandUsers.length} sustainable brands and ${createdProducts.length} unique merchandise products.`
    );

    // ── STEP 5: SEED SECTION 4: HIGH-IMPACT DONORS (22 users) ─────
    console.log("💎 Seeding Section 4: High-Impact Donors & Philanthropists (22 users)...");
    const createdDonors = [];
    for (const d of highImpactDonors) {
      const u = await User.create({
        firstName: d.firstName,
        lastName: d.lastName,
        userName: d.userName,
        email: d.email,
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: d.coinBalance,
        isVerified: true,
        profileImageUrl: d.profileImageUrl,
      });
      createdDonors.push(u);
    }
    console.log(`✅ Seeded ${createdDonors.length} high-impact donor accounts.`);

    // ── STEP 6: SEED SECTION 5: COMMUNITY LEADERS (20 users) ──────
    console.log("🌱 Seeding Section 5: Community Leaders, Activists & Volunteers (20 users)...");
    const createdCommunity = [];
    for (const c of communityLeaders) {
      const u = await User.create({
        firstName: c.firstName,
        lastName: c.lastName,
        userName: c.userName,
        email: c.email,
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: c.coinBalance,
        isVerified: false,
        profileImageUrl: c.profileImageUrl,
      });
      createdCommunity.push(u);
    }
    console.log(`✅ Seeded ${createdCommunity.length} community leader accounts.`);

    // ── STEP 7: SEED SECTION 6: SHOPPERS & BIDDERS (18 users) ─────
    console.log("🛒 Seeding Section 6: Marketplace Shoppers, Collectors & Bidders (18 users)...");
    const createdShoppers = [];
    for (const s of shoppersAndBidders) {
      const u = await User.create({
        firstName: s.firstName,
        lastName: s.lastName,
        userName: s.userName,
        email: s.email,
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: s.coinBalance,
        isVerified: false,
        profileImageUrl: s.profileImageUrl,
      });
      createdShoppers.push(u);
    }
    console.log(`✅ Seeded ${createdShoppers.length} active shopper and bidder accounts.`);

    const totalUsersCount =
      createdAdmins.length +
      createdCharityUsers.length +
      createdBrandUsers.length +
      createdDonors.length +
      createdCommunity.length +
      createdShoppers.length;

    console.log(`\n🎉 Total Users Successfully Created: ${totalUsersCount} (Target: 100+ unique users across 6 sections).\n`);

    // ── STEP 8: SEED REALISTIC DONATIONS & LEADERBOARDS ────────────
    console.log("📊 Seeding realistic donations and leaderboard transactions...");
    const donorRankingPresets = [
      { donorIdx: 0, coins: 5400 },
      { donorIdx: 1, coins: 3800 },
      { donorIdx: 5, coins: 3200 },
      { donorIdx: 2, coins: 2500 },
      { donorIdx: 7, coins: 2200 },
      { donorIdx: 3, coins: 1800 },
      { donorIdx: 12, coins: 1500 },
      { donorIdx: 4, coins: 1200 },
      { donorIdx: 8, coins: 950 },
      { donorIdx: 14, coins: 700 },
    ];

    for (const tier of donorRankingPresets) {
      const donor = createdDonors[tier.donorIdx % createdDonors.length];
      const charity = createdCharityDocs[tier.donorIdx % createdCharityDocs.length];
      const project = createdProjects[tier.donorIdx % createdProjects.length];

      const donation = await Donation.create({
        donorUserId: donor._id,
        charityId: charity._id,
        charityProjectId: project._id,
        coinAmount: tier.coins,
        status: "completed",
      });

      await Project.findByIdAndUpdate(project._id, {
        $inc: { collectedAmount: tier.coins },
      });

      await CoinTransaction.create({
        userId: donor._id,
        type: "donate",
        amount: tier.coins,
        refType: "donation",
        refId: donation._id,
      });
    }
    console.log("✅ Seeded verified donor rankings & coin transactions.");

    // ── STEP 9: SEED BRAND ORDERS & COMMERCE IMPACT ───────────────
    console.log("🛍️ Seeding consumer purchases and marketplace orders...");
    for (let i = 0; i < Math.min(25, createdProducts.length); i++) {
      const product = createdProducts[i];
      const buyer = createdShoppers[i % createdShoppers.length];
      const qty = (i % 3) + 1;
      const totalAmount = product.price * qty;
      const coinsEarned = Math.floor(totalAmount / 10);

      await Order.create({
        userId: buyer._id,
        items: [
          {
            productId: product._id,
            titleSnapshot: product.name,
            quantity: qty,
            unitPrice: product.price,
          },
        ],
        currency: "USD",
        totalAmount,
        status: "paid",
        coinsEarned,
      });

      await CoinTransaction.create({
        userId: buyer._id,
        type: "earn",
        amount: coinsEarned,
        refType: "order",
      });
    }
    console.log("✅ Seeded consumer orders and marketplace sales impact.");

    // ── STEP 10: SEED DIVERSE CHARITY AUCTIONS & BID LEADERBOARDS ─
    console.log("⚡ Seeding live, scheduled, and concluded charity auctions with bid histories...");
    const now = new Date();

    // Auction 1: Live High-Stakes Auction
    const auc1 = await Auction.create({
      productId: createdProducts[0]._id,
      startPrice: 500,
      currentPrice: 850,
      currentBidder: createdDonors[0]._id,
      startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000), // started 4h ago
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // ends in 2 days
      createdBy: createdCharityUsers[0]._id,
      status: "active",
      bidIncrement: 25,
    });

    await Bid.create({
      auctionId: auc1._id,
      userId: createdShoppers[1]._id,
      amount: 600,
      status: "outbid",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    });
    await Bid.create({
      auctionId: auc1._id,
      userId: createdShoppers[0]._id,
      amount: 750,
      status: "outbid",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });
    await Bid.create({
      auctionId: auc1._id,
      userId: createdDonors[0]._id,
      amount: 850,
      status: "active",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    });

    // Auction 2: Live Celebrity Collab
    const auc2 = await Auction.create({
      productId: createdProducts[1]._id,
      startPrice: 1000,
      currentPrice: 1400,
      currentBidder: createdShoppers[5]._id,
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdBy: createdCharityUsers[1]._id,
      status: "active",
      bidIncrement: 50,
    });

    await Bid.create({
      auctionId: auc2._id,
      userId: createdDonors[3]._id,
      amount: 1100,
      status: "outbid",
      createdAt: new Date(now.getTime() - 90 * 60 * 1000),
    });
    await Bid.create({
      auctionId: auc2._id,
      userId: createdShoppers[5]._id,
      amount: 1400,
      status: "active",
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
    });

    // Auction 3: Live Artisan Drop
    const auc3 = await Auction.create({
      productId: createdProducts[2]._id,
      startPrice: 300,
      currentPrice: 425,
      currentBidder: createdDonors[1]._id,
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      createdBy: createdCharityUsers[2]._id,
      status: "active",
      bidIncrement: 25,
    });

    await Bid.create({
      auctionId: auc3._id,
      userId: createdCommunity[2]._id,
      amount: 350,
      status: "outbid",
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
    });
    await Bid.create({
      auctionId: auc3._id,
      userId: createdDonors[1]._id,
      amount: 425,
      status: "active",
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    });

    // Auction 4: Upcoming Scheduled Drop
    await Auction.create({
      productId: createdProducts[3]._id,
      startPrice: 750,
      currentPrice: 750,
      currentBidder: null,
      startTime: new Date(now.getTime() + 8 * 60 * 60 * 1000), // starts in 8h
      endTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      createdBy: createdCharityUsers[3]._id,
      status: "scheduled",
      bidIncrement: 50,
    });

    // Auction 5: Concluded Auction
    const aucEnded = await Auction.create({
      productId: createdProducts[4]._id,
      startPrice: 400,
      currentPrice: 950,
      currentBidder: createdDonors[2]._id,
      startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // ended 2h ago
      createdBy: createdCharityUsers[4]._id,
      status: "ended",
      bidIncrement: 25,
    });

    await Bid.create({
      auctionId: aucEnded._id,
      userId: createdShoppers[2]._id,
      amount: 700,
      status: "outbid",
      createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
    });
    await Bid.create({
      auctionId: aucEnded._id,
      userId: createdDonors[2]._id,
      amount: 950,
      status: "won",
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    });

    console.log("✅ Seeded 5 live, scheduled, and concluded charity auctions with multi-bid leaderboards.");

    await mongoose.disconnect();
    console.log("\n========================================================");
    console.log("🚀 FULL SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`✨ Total Users Seeded: ${totalUsersCount}`);
    console.log(`✨ Total Charities: ${createdCharityUsers.length}`);
    console.log(`✨ Total Brands: ${createdBrandUsers.length}`);
    console.log(`✨ Total Impact Projects: ${createdProjects.length}`);
    console.log(`✨ Total Merchandise Products: ${createdProducts.length}`);
    console.log("========================================================\n");
  } catch (err) {
    console.error("Seeding error in seedFull:", err);
    process.exit(1);
  }
}

seedFull();
