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
import Follow from "../models/Follow.js";
import Post from "../models/Post.js";
import Story from "../models/Story.js";

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
    orgName: "Showcase Demo Brand",
    email: "showcase@merch4change.test",
    country: "United States",
    description: "A showcase brand providing premium products for demonstration purposes. We focus on sustainability and impact.",
    logoUrl: "https://images.unsplash.com/photo-1563170351-b0e1e9bc920f?w=200",
    products: [
      {
        name: "Demonstration Luxury Timepiece",
        description: "An elegant timepiece for demonstration purposes. Every purchase helps fund clean water initiatives.",
        price: 550,
        stock: 15,
        isLimitedEdition: true,
        imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600",
      },
      {
        name: "Eco-Friendly Demo Backpack",
        description: "A sustainable backpack for daily commutes, made from 100% recycled ocean plastics.",
        price: 130,
        stock: 50,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      },
      {
        name: "Premium Charity Coffee Blend",
        description: "A rich blend of organic arabica beans. 100% of proceeds go to rural education.",
        price: 25,
        stock: 100,
        isLimitedEdition: false,
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
      }
    ],
  },
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
    firstName: "Demo",
    lastName: "Account",
    userName: "demouser",
    email: "  ",
    coinBalance: 50000,
    profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  },
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

// Helper: upsert a User by email — inserts only if the email doesn't exist yet.
// Returns the existing or newly created document.
async function upsertUser(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) return existing;
  return User.create(data);
}

// Helper: upsert an OrganizationProfile by userId — skip if already exists.
async function upsertOrgProfile(data) {
  const existing = await OrganizationProfile.findOne({ userId: data.userId });
  if (existing) return existing;
  return OrganizationProfile.create(data);
}

// Helper: upsert a Charity by ownerUserId — skip if already exists.
async function upsertCharity(data) {
  const existing = await Charity.findOne({ ownerUserId: data.ownerUserId });
  if (existing) return existing;
  return Charity.create(data);
}

// Helper: upsert a Brand by ownerUserId — skip if already exists.
async function upsertBrand(data) {
  const existing = await Brand.findOne({ ownerUserId: data.ownerUserId });
  if (existing) return existing;
  return Brand.create(data);
}

// Helper: upsert a Product by name + brandId — skip if already exists.
async function upsertProduct(data) {
  const existing = await Product.findOne({ name: data.name, brandId: data.brandId });
  if (existing) return existing;
  return Product.create(data);
}

// Helper: upsert a Project by title + charityId — skip if already exists.
async function upsertProject(data) {
  const existing = await Project.findOne({ title: data.title, charityId: data.charityId });
  if (existing) return existing;
  return Project.create(data);
}

async function seedFull() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // ── STEP 1: PRESERVE EXISTING DATA ────────────────────────────
    // The seed will only INSERT new documents. Existing collections and
    // documents are left completely untouched.
    console.log("ℹ️  Skipping database wipe — existing documents will be preserved.");

    const standardPassword = await bcrypt.hash("Password123!", 10);

    // ── STEP 2: SEED SECTION 1: ADMINISTRATORS (5 users) ─────────
    console.log("👑 Seeding Section 1: Platform Administrators & Compliance (5 users)...");
    const createdAdmins = [];
    for (const adm of staffAdmins) {
      const u = await upsertUser({
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
      const charUser = await upsertUser({
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

      await upsertOrgProfile({
        userId: charUser._id,
        orgName: cData.orgName,
        phone: "+1-800-456-7890",
        address: `100 Impact Plaza, Suite 400`,
        website: `https://www.${charUser.userName}.org`,
      });

      const charity = await upsertCharity({
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
        const proj = await upsertProject({
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
      const brandUser = await upsertUser({
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

      await upsertOrgProfile({
        userId: brandUser._id,
        orgName: bData.orgName,
        phone: "+1-888-789-0123",
        address: `450 Artisan Blvd`,
        website: `https://www.${brandUser.userName}.com`,
      });

      const brand = await upsertBrand({
        ownerUserId: brandUser._id,
        brandName: bData.orgName,
        description: bData.description,
        logoUrl: bData.logoUrl,
        slug: bData.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      });
      createdBrandDocs.push(brand);

      for (const prod of bData.products) {
        const p = await upsertProduct({
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
      const p = await upsertProduct({
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
      const u = await upsertUser({
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
      const u = await upsertUser({
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
      const u = await upsertUser({
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

      // Skip if this donation seed already exists
      const existingDonation = await Donation.findOne({
        donorUserId: donor._id,
        charityProjectId: project._id,
        coinAmount: tier.coins,
      });
      if (existingDonation) continue;

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

      // Skip if an order for this buyer + product already exists
      const existingOrder = await Order.findOne({
        userId: buyer._id,
        "items.productId": product._id,
      });
      if (existingOrder) continue;

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
    let auc1 = await Auction.findOne({ productId: createdProducts[0]._id });
    if (!auc1) {
      auc1 = await Auction.create({
        productId: createdProducts[0]._id,
        startPrice: 500,
        currentPrice: 850,
        currentBidder: createdDonors[0]._id,
        startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        createdBy: createdCharityUsers[0]._id,
        status: "active",
        bidIncrement: 25,
      });
      await Bid.create({ auctionId: auc1._id, userId: createdShoppers[1]._id, amount: 600, status: "outbid", createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) });
      await Bid.create({ auctionId: auc1._id, userId: createdShoppers[0]._id, amount: 750, status: "outbid", createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) });
      await Bid.create({ auctionId: auc1._id, userId: createdDonors[0]._id, amount: 850, status: "active", createdAt: new Date(now.getTime() - 30 * 60 * 1000) });
    }

    // Auction 2: Live Celebrity Collab
    let auc2 = await Auction.findOne({ productId: createdProducts[1]._id });
    if (!auc2) {
      auc2 = await Auction.create({
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
      await Bid.create({ auctionId: auc2._id, userId: createdDonors[3]._id, amount: 1100, status: "outbid", createdAt: new Date(now.getTime() - 90 * 60 * 1000) });
      await Bid.create({ auctionId: auc2._id, userId: createdShoppers[5]._id, amount: 1400, status: "active", createdAt: new Date(now.getTime() - 15 * 60 * 1000) });
    }

    // Auction 3: Live Artisan Drop
    let auc3 = await Auction.findOne({ productId: createdProducts[2]._id });
    if (!auc3) {
      auc3 = await Auction.create({
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
      await Bid.create({ auctionId: auc3._id, userId: createdCommunity[2]._id, amount: 350, status: "outbid", createdAt: new Date(now.getTime() - 45 * 60 * 1000) });
      await Bid.create({ auctionId: auc3._id, userId: createdDonors[1]._id, amount: 425, status: "active", createdAt: new Date(now.getTime() - 10 * 60 * 1000) });
    }

    // Auction 4: Upcoming Scheduled Drop
    if (!(await Auction.findOne({ productId: createdProducts[3]._id }))) {
      await Auction.create({
        productId: createdProducts[3]._id,
        startPrice: 750,
        currentPrice: 750,
        currentBidder: null,
        startTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        createdBy: createdCharityUsers[3]._id,
        status: "scheduled",
        bidIncrement: 50,
      });
    }

    // Auction 5: Concluded Auction
    let aucEnded = await Auction.findOne({ productId: createdProducts[4]._id });
    if (!aucEnded) {
      aucEnded = await Auction.create({
        productId: createdProducts[4]._id,
        startPrice: 400,
        currentPrice: 950,
        currentBidder: createdDonors[2]._id,
        startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        createdBy: createdCharityUsers[4]._id,
        status: "ended",
        bidIncrement: 25,
      });
      await Bid.create({ auctionId: aucEnded._id, userId: createdShoppers[2]._id, amount: 700, status: "outbid", createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000) });
      await Bid.create({ auctionId: aucEnded._id, userId: createdDonors[2]._id, amount: 950, status: "won", createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) });
    }

    console.log("✅ Seeded 5 live, scheduled, and concluded charity auctions with multi-bid leaderboards.");

    // ── STEP 11: SEED FOLLOW RELATIONSHIPS ───────────────────────
    console.log("🔗 Seeding follow relationships for recommendation engine...");
    const followPairs = [];

    // Donors follow charities (each donor follows 3-5 charities)
    for (let i = 0; i < createdDonors.length; i++) {
      const numFollows = 3 + (i % 3); // 3, 4, or 5
      for (let j = 0; j < numFollows && j < createdCharityUsers.length; j++) {
        const charityIdx = (i + j) % createdCharityUsers.length;
        followPairs.push({ followerId: createdDonors[i]._id, followingId: createdCharityUsers[charityIdx]._id });
      }
    }

    // Donors follow brands (each donor follows 2-3 brands)
    for (let i = 0; i < createdDonors.length; i++) {
      const numFollows = 2 + (i % 2); // 2 or 3
      for (let j = 0; j < numFollows && j < createdBrandUsers.length; j++) {
        const brandIdx = (i * 2 + j) % createdBrandUsers.length;
        followPairs.push({ followerId: createdDonors[i]._id, followingId: createdBrandUsers[brandIdx]._id });
      }
    }

    // Community leaders follow each other and some donors
    for (let i = 0; i < createdCommunity.length; i++) {
      // Follow 2 other community members
      for (let j = 1; j <= 2; j++) {
        const otherIdx = (i + j) % createdCommunity.length;
        followPairs.push({ followerId: createdCommunity[i]._id, followingId: createdCommunity[otherIdx]._id });
      }
      // Follow 1-2 donors
      const donorIdx = i % createdDonors.length;
      followPairs.push({ followerId: createdCommunity[i]._id, followingId: createdDonors[donorIdx]._id });
    }

    // Shoppers follow a few brands
    for (let i = 0; i < createdShoppers.length; i++) {
      const brandIdx = i % createdBrandUsers.length;
      followPairs.push({ followerId: createdShoppers[i]._id, followingId: createdBrandUsers[brandIdx]._id });
      // Every other shopper follows a second brand
      if (i % 2 === 0) {
        const brandIdx2 = (i + 5) % createdBrandUsers.length;
        followPairs.push({ followerId: createdShoppers[i]._id, followingId: createdBrandUsers[brandIdx2]._id });
      }
    }

    // Deduplicate and remove self-follows
    const followSet = new Set();
    const uniqueFollows = [];
    for (const pair of followPairs) {
      const key = `${pair.followerId}-${pair.followingId}`;
      if (!followSet.has(key) && String(pair.followerId) !== String(pair.followingId)) {
        followSet.add(key);
        uniqueFollows.push(pair);
      }
    }

    // Filter out follow pairs that already exist in the database
    const newFollows = [];
    for (const pair of uniqueFollows) {
      const exists = await Follow.findOne({ followerId: pair.followerId, followingId: pair.followingId });
      if (!exists) newFollows.push(pair);
    }

    if (newFollows.length > 0) {
      // Batch insert new follows (bypass hooks for speed, update counts manually)
      await Follow.insertMany(newFollows, { ordered: false });

      // Update follower/following counts only for new follows
      const followerCounts = {};
      const followingCounts = {};
      for (const f of newFollows) {
        const ferId = String(f.followerId);
        const fingId = String(f.followingId);
        followingCounts[ferId] = (followingCounts[ferId] || 0) + 1;
        followerCounts[fingId] = (followerCounts[fingId] || 0) + 1;
      }

      for (const [userId, count] of Object.entries(followingCounts)) {
        await User.findByIdAndUpdate(userId, { $inc: { followingCount: count } });
      }
      for (const [userId, count] of Object.entries(followerCounts)) {
        await User.findByIdAndUpdate(userId, { $inc: { followersCount: count } });
      }
    }

    console.log(`✅ Seeded ${newFollows.length} new follow relationships (${uniqueFollows.length - newFollows.length} already existed).`);

    // ── STEP 12: SEED POSTS FOR RECOMMENDATION ENGINE ─────────────
    console.log("📝 Seeding posts with varied engagement for recommendation engine...");
    const createdPosts = [];

    // Helper: create a date N hours ago
    const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);

    // --- Charity campaign update posts (high engagement, recent) ---
    const charityPostData = [
      { idx: 0, content: "🌿 Incredible news! Our Amazon Rainforest Canopy Protection program has saved 12,000 acres this quarter. Every donation directly funds indigenous ranger teams. Together we're making a real difference! #SaveTheAmazon #Conservation", age: 2, images: ["https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800", "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600"] },
      { idx: 1, content: "🐋 Our Great Barrier Reef Plastic Skimmer Fleet just completed its 500th ocean cleanup run! Over 15 tons of plastic removed from coral nurseries. Thank you to every supporter who made this possible. 🌊 #OceanClean #PlasticFree", age: 5, images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600", "https://images.unsplash.com/photo-1520633465133-7e618991fa9b?w=600"] },
      { idx: 2, content: "📚 STEM Laboratories for Girls Academy update: 200 young women graduated from our first coding bootcamp in Nairobi! Their projects included apps for water quality monitoring and crop disease detection. Future tech leaders! 💪 #GirlsInSTEM", age: 8, images: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800", "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600"] },
      { idx: 3, content: "💧 Clean Water Springs has drilled its 8th borehole in Oromia! 12,000 residents now have access to disease-free drinking water. Your coins literally save lives. #CleanWater #Ethiopia", age: 18, images: ["https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800", "https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?w=600"] },
      { idx: 4, content: "🏥 Mobile Surgical Containers deployed to 3 new flood zones this week. Our team of 12 surgeons performed 84 emergency procedures. Thank you for keeping our mission alive. #DoctorsForHumanity", age: 36, images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800", "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600"] },
      { idx: 5, content: "🏠 Winter Emergency Housing: 35 families moved into warm transitional studio units this month. Each resident gets a dedicated social worker. Shelter is a human right. ❄️ #ShelterSafe", age: 48, images: ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"] },
      { idx: 6, content: "🐕 Our Winterized Medical Sanctuary just welcomed 15 senior rescue dogs! Each one receives orthopedic care and a heated rehabilitation kennel. They deserve a comfortable life. 🐾 #CanineRescue", age: 72, images: ["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800", "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600"] },
      { idx: 7, content: "🌳 ONE MILLION SAPLINGS milestone reached! Green Earth Reforest has planted native trees across 5,000 hectares of fragmented wildlife corridors in Parana, Brazil. 🎉 #Reforestation", age: 96, images: ["https://images.unsplash.com/photo-1511497584788-87676104235f?w=800", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600"] },
      { idx: 8, content: "🤖 Township Youth Robotics Hub: 50 students just built their first autonomous line-following robots! Watching these teens code in Python for the first time was magical. #BrightFuture #Soweto", age: 120, images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800", "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600"] },
      { idx: 9, content: "👁️ Sight for Everyone completed 1,000 sight-restoring cataract surgeries! Our mobile eye theater visited 28 remote villages. Vision is freedom. #SightForEveryone #India", age: 144, images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800"] },
    ];

    for (const cp of charityPostData) {
      const authorUser = createdCharityUsers[cp.idx % createdCharityUsers.length];
      // Determine likers: recent charity posts get more likes
      const likeCount = cp.age <= 8 ? 14 : cp.age <= 48 ? 8 : 4;
      const likers = [];
      for (let k = 0; k < likeCount && k < createdDonors.length; k++) {
        likers.push(createdDonors[(cp.idx + k) % createdDonors.length]._id);
      }
      // Add some community likers
      for (let k = 0; k < Math.min(3, createdCommunity.length); k++) {
        likers.push(createdCommunity[(cp.idx + k) % createdCommunity.length]._id);
      }

      // Comments from donors
      const commentCount = cp.age <= 8 ? 4 : cp.age <= 48 ? 2 : 1;
      const commentTexts = [
        "This is amazing work! So proud to support this cause. 🙌",
        "Incredible impact! Every coin matters.",
        "Just donated more to keep this going! 💪",
        "The world needs more initiatives like this.",
        "Shared this with my community. Let's spread the word!",
        "Truly inspiring progress. Thank you for the transparency.",
      ];
      const postComments = [];
      for (let c = 0; c < commentCount; c++) {
        postComments.push({
          author: createdDonors[(cp.idx * 3 + c) % createdDonors.length]._id,
          text: commentTexts[c % commentTexts.length],
          createdAt: hoursAgo(cp.age - 1),
        });
      }

      // Skip if a post with this exact content already exists
      const existingPost = await Post.findOne({ userId: authorUser._id, content: cp.content });
      if (existingPost) { createdPosts.push(existingPost); continue; }

      const post = await Post.create({
        userId: authorUser._id,
        content: cp.content,
        images: cp.images || [],
        likes: likers,
        comments: postComments,
        createdAt: hoursAgo(cp.age),
      });
      createdPosts.push(post);
    }

    // --- Brand product launch / showcase posts (medium-high engagement) ---
    const brandPostData = [
      { idx: 0, content: "🚀 We are thrilled to launch our Showcase Demonstration collection! Featuring premium luxury timepieces and sustainable everyday gear. Every purchase directly impacts global initiatives. Thank you for your support! ✨ #ShowcaseImpact", age: 1, images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800"] },
      { idx: 1, content: "♻️ Introducing our new Recycled Ocean Fleece Pullover — woven entirely from reclaimed ocean bottles! Soft, warm, and saving our seas one thread at a time. Now available in the marketplace. 🌊 #EcoWear #SustainableFashion", age: 3, images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"] },
      { idx: 2, content: "🏔️ The Alpine Expedition Storm Shell is here. 3-layer breathable, waterproof, and Fair Trade Certified. Built for the harshest conditions, made with the best intentions. #PatagoniaImpact", age: 12, images: ["https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800"] },
      { idx: 3, content: "✨ Hand-turned Tuscan leather meets solid brass closures. Our new briefcase collection is a love letter to Florentine craftsmanship. Limited edition — only 12 pieces available. #AuraArtisan", age: 24, images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600"] },
      { idx: 4, content: "🍃 Zero waste, zero compromise. The Mycelium Vegan Travel Pouch is made from mushroom leather with a biodegradable lining. The future of accessories is growing. 🍄 #TerraLiving", age: 42, images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"] },
      { idx: 5, content: "☀️ Power your adventures with the sun! Our Modular Solar Commuter Backpack generates 15W fast charge while you explore. Laptop pocket, solar cells, and pure freedom. #SolsticeGear", age: 60, images: ["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"] },
      { idx: 6, content: "🎋 The art of simplicity. Hand-carved Kyoto bamboo tea sets, cured in organic walnut oil by master craftspeople. A ceremony in every sip. 🍵 #NirvanaBamboo", age: 84, images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600"] },
      { idx: 7, content: "⌚ Introducing the Vanguard Terra Automatic Diver — 300m depth rating, recycled aerospace titanium, sapphire crystal. Luxury that respects the planet. Only 6 pieces remain. #VanguardWatches", age: 110, images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800", "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600"] },
      { idx: 8, content: "🧶 From regenerative Merino farms in New Zealand to your wardrobe. The Cloud Merino Crewneck — traceable, sustainable, impossibly soft. 17.5 micron perfection. #NomadWoolen", age: 130, images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"] },
    ];

    for (const bp of brandPostData) {
      const authorUser = createdBrandUsers[bp.idx % createdBrandUsers.length];
      const likeCount = bp.age <= 24 ? 10 : bp.age <= 84 ? 6 : 3;
      const likers = [];
      for (let k = 0; k < likeCount && k < createdShoppers.length; k++) {
        likers.push(createdShoppers[(bp.idx + k) % createdShoppers.length]._id);
      }
      // Add some donor likers
      for (let k = 0; k < 2 && k < createdDonors.length; k++) {
        likers.push(createdDonors[(bp.idx * 2 + k) % createdDonors.length]._id);
      }

      const commentCount = bp.age <= 24 ? 3 : bp.age <= 84 ? 1 : 0;
      const shopperComments = [
        "Just ordered one! Can't wait to get it. 🛍️",
        "The quality looks incredible. Adding to cart!",
        "Love that it's sustainable AND stylish.",
        "This is exactly what I've been looking for!",
      ];
      const postComments = [];
      for (let c = 0; c < commentCount; c++) {
        postComments.push({
          author: createdShoppers[(bp.idx * 2 + c) % createdShoppers.length]._id,
          text: shopperComments[c % shopperComments.length],
          createdAt: hoursAgo(bp.age - 2),
        });
      }

      // Skip if a post with this exact content already exists
      const existingBrandPost = await Post.findOne({ userId: authorUser._id, content: bp.content });
      if (existingBrandPost) { createdPosts.push(existingBrandPost); continue; }

      const post = await Post.create({
        userId: authorUser._id,
        content: bp.content,
        images: bp.images || [],
        likes: likers,
        comments: postComments,
        createdAt: hoursAgo(bp.age),
      });
      createdPosts.push(post);
    }

    // --- Donor / community personal posts (varied engagement) ---
    const personalPostData = [
      { userArr: "donors", idx: 0, content: "Just donated 5,400 coins to the Amazon Rainforest Protection project! 🌿 Feeling incredibly grateful to be part of this community. If we all chip in, we can save our planet. #Merch4Change #GivingBack", age: 1, images: ["https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800"] },
      { userArr: "donors", idx: 5, content: "Hit my 10th donation milestone today! 🎉 Started small with 100 coins, and now I've donated over 3,200 total. Every coin counts, and watching the impact grow is so rewarding. #DonorJourney", age: 4, images: ["https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800"] },
      { userArr: "donors", idx: 2, content: "Visited the coral reef restoration site in the Philippines last week. Seeing the super-coral nurseries in person was breathtaking. This is what our donations look like in real life! 🐠🌊 #CoralReef", age: 14, images: ["https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600"] },
      { userArr: "donors", idx: 7, content: "Proud to support Doctors for Humanity's mobile surgical containers. In a world of crisis, these doctors bring hope. 🏥 Donating again this week. Who's with me?", age: 28, images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800"] },
      { userArr: "donors", idx: 10, content: "Shopping sustainably on Merch4Change is honestly addictive! Just got the recycled ocean fleece pullover and it's the softest thing I own. Doing good feels great. 💙 #SustainableFashion", age: 50, images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800"] },
      { userArr: "community", idx: 0, content: "Organized a neighborhood cleanup drive this weekend! 45 volunteers, 200 bags of trash collected, and 3 new follow-up events planned. Community action is unstoppable. 🌍♻️ #CleanUpCrew", age: 6, images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800", "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600"] },
      { userArr: "community", idx: 3, content: "Just finished mentoring 12 students in our after-school coding program. These kids built their first web apps in 6 weeks! The future is so bright. 💻 #YouthEmpowerment", age: 20, images: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800"] },
      { userArr: "community", idx: 6, content: "Attended the Climate Action Rally downtown today. Thousands of voices, one message: the time for change is NOW. Let's keep pushing for a sustainable world. 🌱 #ClimateAction", age: 40, images: ["https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800"] },
      { userArr: "community", idx: 9, content: "Grateful for this platform connecting changemakers worldwide. In 3 months I've met incredible activists, donated to 5 projects, and bought ethically. This is the future of commerce. 🤝 #Merch4Change", age: 65, images: ["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600"] },
      { userArr: "community", idx: 12, content: "Volunteered at the local shelter this morning. Served 120 meals and helped 8 families with housing applications. Small acts, big ripples. ❤️ #ShelterVolunteer", age: 100, images: ["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"] },
      { userArr: "donors", idx: 13, content: "Weekend haul from Merch4Change marketplace! 📦 Got the bamboo tea set and the titanium camp stove. Both are gorgeous and sustainably made. Supporting brands that care.", age: 30, images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800", "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600"] },
      { userArr: "donors", idx: 16, content: "My coin balance just crossed 3,000! Saving up for a big donation to the Solar Power Schools project. Education + clean energy = unstoppable combo. ☀️📚 #SolarSchools", age: 55, images: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800"] },
      { userArr: "shoppers", idx: 0, content: "Won the charity auction last week! 🏆 The Aventador Carbon Chronograph is even more stunning in person. Best part? The proceeds go directly to wildlife conservation. #LuxuryForGood", age: 10, images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800"] },
      { userArr: "shoppers", idx: 5, content: "Bidding on the new limited edition silk scarf! The craftsmanship is unreal and it supports Prancing Horse heritage artisans. Ethical luxury is the new standard. 🐎✨ #CharityAuction", age: 22, images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800"] },
      { userArr: "shoppers", idx: 10, content: "Just placed my 5th order on Merch4Change! Every purchase earns coins that I donate right back to charity projects. It's a beautiful cycle. 🔄 #ShopForChange", age: 75, images: ["https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800"] },
    ];

    for (const pp of personalPostData) {
      let authorUser;
      if (pp.userArr === "donors") authorUser = createdDonors[pp.idx % createdDonors.length];
      else if (pp.userArr === "community") authorUser = createdCommunity[pp.idx % createdCommunity.length];
      else authorUser = createdShoppers[pp.idx % createdShoppers.length];

      const likeCount = pp.age <= 10 ? 8 : pp.age <= 40 ? 5 : 2;
      const likers = [];
      // Mix likers from different user groups
      for (let k = 0; k < Math.ceil(likeCount / 2) && k < createdDonors.length; k++) {
        likers.push(createdDonors[(pp.idx + k + 5) % createdDonors.length]._id);
      }
      for (let k = 0; k < Math.floor(likeCount / 2) && k < createdCommunity.length; k++) {
        likers.push(createdCommunity[(pp.idx + k + 3) % createdCommunity.length]._id);
      }

      const commentCount = pp.age <= 10 ? 2 : pp.age <= 40 ? 1 : 0;
      const genericComments = [
        "So inspiring! Love this community. 🙌",
        "This is what it's all about!",
        "Amazing work, keep it going! 💪",
      ];
      const postComments = [];
      for (let c = 0; c < commentCount; c++) {
        const commenter = pp.userArr === "donors"
          ? createdCommunity[(pp.idx + c) % createdCommunity.length]
          : createdDonors[(pp.idx + c) % createdDonors.length];
        postComments.push({
          author: commenter._id,
          text: genericComments[c % genericComments.length],
          createdAt: hoursAgo(pp.age - 1),
        });
      }

      // Skip if a post with this exact content already exists
      const existingPersonalPost = await Post.findOne({ userId: authorUser._id, content: pp.content });
      if (existingPersonalPost) { createdPosts.push(existingPersonalPost); continue; }

      const post = await Post.create({
        userId: authorUser._id,
        content: pp.content,
        images: pp.images || [],
        likes: likers,
        comments: postComments,
        createdAt: hoursAgo(pp.age),
      });
      createdPosts.push(post);
    }

    // --- Very fresh posts (last 2 hours) for recency signal testing ---
    const freshPostData = [
      { userArr: "charities", idx: 10, content: "🦧 BREAKING: Borneo Orangutan Habitat Buffer Zones expanded by 500 hectares this week! Conservation easements now protect critical fire-prone areas near national parks. #RainforestGuardians", age: 0.5, images: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"] },
      { userArr: "charities", idx: 11, content: "🥬 Our Electric Refrigerated Produce Rescue Vans just delivered their millionth pound of fresh vegetables to food deserts! Zero emissions, zero hunger. Thank you! 🚐💚 #ZeroHunger", age: 1, images: ["https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800"] },
      { userArr: "brands", idx: 8, content: "🌹 NEW DROP: Regenerative Rosehip Night Elixir — hand-harvested Patagonian rosehip seed oil with blue tansy and Bakuchiol. Your skin deserves the purest ingredients. #OasisBotanicals", age: 0.3, images: ["https://images.unsplash.com/photo-1608248597359-0092d6e36d4f?w=800"] },
      { userArr: "brands", idx: 10, content: "🕶️ Summer vibes! Our Iberian Polarized Wayfarers are now back in stock. Made from recycled Mediterranean fishnets. Look good, do good. #BlueOceanEyewear", age: 1.5, images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"] },
      { userArr: "donors", idx: 1, content: "Just woke up to the best notification — my donation helped reach 90% of the Clean Water Springs goal! Only 1,100 coins to go! Who's helping us cross the finish line? 🏁💧", age: 0.8, images: ["https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800"] },
      { userArr: "community", idx: 1, content: "Live from the Youth Robotics competition! 🤖 Our township team just won first place with their obstacle-avoidance robot! Tears of joy everywhere. #BrightFuture #Robotics", age: 0.2, images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"] },
    ];

    for (const fp of freshPostData) {
      let authorUser;
      if (fp.userArr === "charities") authorUser = createdCharityUsers[fp.idx % createdCharityUsers.length];
      else if (fp.userArr === "brands") authorUser = createdBrandUsers[fp.idx % createdBrandUsers.length];
      else if (fp.userArr === "donors") authorUser = createdDonors[fp.idx % createdDonors.length];
      else authorUser = createdCommunity[fp.idx % createdCommunity.length];

      // Fresh posts get fewer likes (just posted)
      const likers = [];
      for (let k = 0; k < 3 && k < createdDonors.length; k++) {
        likers.push(createdDonors[(fp.idx + k) % createdDonors.length]._id);
      }

      // Skip if a post with this exact content already exists
      const existingFreshPost = await Post.findOne({ userId: authorUser._id, content: fp.content });
      if (existingFreshPost) { createdPosts.push(existingFreshPost); continue; }

      const post = await Post.create({
        userId: authorUser._id,
        content: fp.content,
        images: fp.images || [],
        likes: likers,
        comments: [],
        createdAt: hoursAgo(fp.age),
      });
      createdPosts.push(post);
    }

    // Update postsCount for all post authors based on current DB state
    const allAuthorIds = [...new Set(createdPosts.map(p => String(p.userId)))];
    for (const userId of allAuthorIds) {
      const count = await Post.countDocuments({ userId });
      await User.findByIdAndUpdate(userId, { postsCount: count });
    }

    console.log(`✅ Seeded ${createdPosts.length} posts with varied engagement levels for recommendation engine.`);

    // --- 9. Seed Stories ---
    console.log("Seeding Stories...");
    await Story.deleteMany({});
    const storyData = [
      { userArr: "charities", idx: 0, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600", age: 2 },
      { userArr: "charities", idx: 1, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600", age: 5 },
      { userArr: "brands", idx: 0, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600", age: 1 },
      { userArr: "brands", idx: 2, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600", age: 3 },
      { userArr: "donors", idx: 0, image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600", age: 4 },
      { userArr: "community", idx: 0, image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600", age: 6 },
    ];
    
    const createdStories = [];
    for (const sd of storyData) {
      let authorUser;
      if (sd.userArr === "charities") authorUser = createdCharityUsers[sd.idx % createdCharityUsers.length];
      else if (sd.userArr === "brands") authorUser = createdBrandUsers[sd.idx % createdBrandUsers.length];
      else if (sd.userArr === "donors") authorUser = createdDonors[sd.idx % createdDonors.length];
      else authorUser = createdCommunity[sd.idx % createdCommunity.length];
      
      const story = await Story.create({
        userId: authorUser._id,
        image: sd.image,
        createdAt: hoursAgo(sd.age),
      });
      createdStories.push(story);
    }
    console.log(`✅ Seeded ${createdStories.length} stories.`);

    await mongoose.disconnect();
    console.log("\n========================================================");
    console.log("🚀 FULL SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`✨ Total Users Seeded: ${totalUsersCount}`);
    console.log(`✨ Total Charities: ${createdCharityUsers.length}`);
    console.log(`✨ Total Brands: ${createdBrandUsers.length}`);
    console.log(`✨ Total Impact Projects: ${createdProjects.length}`);
    console.log(`✨ Total Merchandise Products: ${createdProducts.length}`);
    console.log(`✨ Total Follow Relationships: ${uniqueFollows.length}`);
    console.log(`✨ Total Posts: ${createdPosts.length}`);
    console.log(`✨ Total Stories: ${createdStories.length}`);
    console.log("========================================================\n");
  } catch (err) {
    console.error("Seeding error in seedFull:", err);
    process.exit(1);
  }
}

seedFull();
