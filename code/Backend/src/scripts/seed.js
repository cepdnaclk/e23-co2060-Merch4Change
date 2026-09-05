import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OrganizationProfile from "../models/OrganizationProfile.js";
import Brand from "../models/Brand.js";
import Charity from "../models/Charity.js";
import Product from "../models/Product.js";
import Project from "../models/Project.js";
import Donation from "../models/Donation.js";
import UserDonation from "../models/UserDonation.js";
import Order from "../models/Order.js";
import CoinTransaction from "../models/CoinTransaction.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/merch4change";

const luxuryProductsData = [
  {
    name: "Aventador Carbon Chronograph",
    description: "Hand-crafted carbon fiber chronograph inspired by the Lamborghini Aventador SVJ. Each piece is individually numbered.",
    price: 8500,
    stock: 5,
    isLimitedEdition: true,
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600",
  },
  {
    name: "Submariner Midnight Edition",
    description: "Rolex Submariner collaboration piece. Deep black dial, ceramic bezel, Oystersteel bracelet. Only 50 produced worldwide.",
    price: 12000,
    stock: 3,
    isLimitedEdition: true,
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600",
  },
  {
    name: "Chiron Heritage Leather Wallet",
    description: "Full-grain Nappa leather wallet crafted in Bugatti's Molsheim atelier. Carbon fiber inlay, hand-stitched edges.",
    price: 3200,
    stock: 25,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
  },
  {
    name: "Prancing Horse Silk Scarf",
    description: "Ferrari-licensed 100% Mulberry silk scarf. Features the iconic Prancing Horse motif woven in 24-karat gold thread.",
    price: 1800,
    stock: 40,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600",
  },
  {
    name: "Continental GT Cufflinks",
    description: "Sterling silver cufflinks featuring the Bentley B emblem. Hand-polished finish, presented in a bentley walnut veneer box.",
    price: 2400,
    stock: 30,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600",
  },
  {
    name: "Phantom Cashmere Throw",
    description: "Rolls-Royce commissioned cashmere throw. Double-woven Scottish cashmere, Ghost White colorway, monogrammed RR corner badge.",
    price: 6500,
    stock: 8,
    isLimitedEdition: true,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600",
  },
  {
    name: "F1 Pit Lane Race Jacket",
    description: "Mercedes-AMG Petronas F1 Team official pit lane jacket. Worn by the crew at the 2024 Monaco Grand Prix. Individually certified.",
    price: 4200,
    stock: 15,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  },
  {
    name: "911 Turbo Titanium Pen",
    description: "Porsche Design titanium fountain pen. Inspired by the 911 Turbo S engine. Comes with Porsche Design leather case.",
    price: 950,
    stock: 50,
    isLimitedEdition: false,
    imageUrl: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Clear existing collections
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await OrganizationProfile.deleteMany({});
    await Brand.deleteMany({});
    await Charity.deleteMany({});
    await Product.deleteMany({});
    await Project.deleteMany({});
    await Donation.deleteMany({});
    await UserDonation.deleteMany({});
    await Order.deleteMany({});
    await CoinTransaction.deleteMany({});
    console.log("Existing data cleared.");

    // 2. Hash standard password
    const standardPassword = await bcrypt.hash("Password123!", 10);

    // 3. Seed Admin User
    console.log("Seeding admin user...");
    await User.create({
      firstName: "Platform",
      lastName: "Admin",
      userName: "platformadmin",
      email: "admin@merch4change.test",
      password: standardPassword,
      accountType: "individual",
      role: "admin",
      isVerified: true,
    });
    console.log("✅ Seeded admin user (admin@merch4change.test).");

    // 4. Seed Individual Donors
    console.log("Seeding individual users...");
    const individuals = await User.insertMany([
      {
        firstName: "Sarah",
        lastName: "Jenkins",
        userName: "sarah_gives",
        email: "sarah@test.com",
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: 3200,
        isVerified: true,
        profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      },
      {
        firstName: "Aiden",
        lastName: "Silva",
        userName: "aidensilva",
        email: "aiden@example.com",
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: 1850,
        isVerified: true,
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      },
      {
        firstName: "Elena",
        lastName: "Rostova",
        userName: "elena_eco",
        email: "elena@test.com",
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: 950,
        profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      },
      {
        firstName: "Marcus",
        lastName: "Chen",
        userName: "marcus_c",
        email: "marcus@test.com",
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: 620,
        profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      },
      {
        firstName: "Maya",
        lastName: "Patel",
        userName: "mayap",
        email: "maya@test.com",
        password: standardPassword,
        accountType: "individual",
        role: "user",
        coinBalance: 340,
        profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
      },
    ]);
    console.log(`✅ Seeded ${individuals.length} individual users.`);

    // 5. Seed Organizations & Brands
    console.log("Seeding organizations & brands...");
    const orgDataList = [
      { 
        orgName: "Global Wildlife Fund", 
        email: "contact@globalwildlife.org", 
        isCharity: true, 
        verificationStatus: "verified",
        country: "United States",
        category: "environment",
        description: "Dedicated to preserving natural habitats and protecting endangered species across the globe.",
        logoUrl: "https://images.unsplash.com/photo-1549473889-14f410d83298?w=150"
      },
      { 
        orgName: "Ocean Clean Initiative", 
        email: "hello@oceanclean.org", 
        isCharity: true, 
        verificationStatus: "verified",
        country: "Australia",
        category: "environment",
        description: "Removing plastic waste from our oceans and promoting sustainable maritime ecosystems.",
        logoUrl: "https://images.unsplash.com/photo-1520633465133-7e618991fa9b?w=150"
      },
      { 
        orgName: "Hope for Education", 
        email: "info@hopeforedu.org", 
        isCharity: true, 
        verificationStatus: "verified",
        country: "Kenya",
        category: "education",
        description: "Building schools and providing educational resources to children in underprivileged regions.",
        logoUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150"
      },
      { 
        orgName: "EcoWear Sustainable", 
        email: "hello@ecowear.com", 
        isCharity: false,
        country: "Sweden",
        description: "100% sustainable clothing brand utilizing recycled materials and donating proceeds.",
        logoUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150"
      },
      { 
        orgName: "Patagonia Impact Goods", 
        email: "csr@patagoniaimpact.com", 
        isCharity: false,
        country: "United States",
        description: "Outdoor apparel committed to 1% for the Planet and high-integrity social supply chains.",
        logoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150"
      },
      { 
        orgName: "Aura Artisan Studio", 
        email: "contact@aurastudio.com", 
        isCharity: false,
        country: "Italy",
        description: "Luxury hand-crafted accessories funding local craft communities and clean water.",
        logoUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=150"
      },
    ];

    const createdBrands = [];
    const createdCharities = [];

    for (const org of orgDataList) {
      const orgUser = await User.create({
        firstName: org.orgName,
        lastName: "Organization",
        userName: org.orgName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        email: org.email,
        password: standardPassword,
        accountType: "organization",
        role: org.isCharity ? "charity" : "brand",
        isVerified: true,
        profileImageUrl: org.logoUrl,
      });

      await OrganizationProfile.create({
        userId: orgUser._id,
        orgName: org.orgName,
        phone: "+1234567890",
        address: "123 Impact Street",
        website: `https://www.${orgUser.userName}.com`,
      });

      if (org.isCharity) {
        const charity = await Charity.create({
          ownerUserId: orgUser._id,
          publicName: org.orgName,
          category: org.category || "other",
          verificationStatus: org.verificationStatus || "verified",
          description: org.description,
          country: org.country,
          logoUrl: org.logoUrl,
        });
        createdCharities.push(charity);
      } else {
        const brand = await Brand.create({
          ownerUserId: orgUser._id,
          brandName: org.orgName,
          description: org.description,
          logoUrl: org.logoUrl,
          slug: org.orgName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        });
        createdBrands.push(brand);
      }
    }
    console.log(`✅ Seeded ${createdBrands.length} brands and ${createdCharities.length} charities.`);

    // 6. Seed Products across brands
    console.log("Seeding products...");
    const createdProducts = [];
    for (let i = 0; i < luxuryProductsData.length; i++) {
      const pData = luxuryProductsData[i];
      const assignedBrand = createdBrands[i % createdBrands.length];
      const product = await Product.create({
        ...pData,
        brandId: assignedBrand._id,
        ownerUserId: assignedBrand.ownerUserId,
      });
      createdProducts.push(product);
    }
    console.log(`✅ Seeded ${createdProducts.length} luxury products across brands.`);

    // 7. Seed Charity Projects
    console.log("Seeding projects...");
    const createdProjects = [];
    const projectTemplates = [
      { prefix: "Amazon Rainforest Protection", goal: 25000, collect: 18450 },
      { prefix: "Coral Reef Restoration", goal: 10000, collect: 7300 },
      { prefix: "Rural School Library Kit", goal: 5000, collect: 4200 },
    ];

    for (let i = 0; i < createdCharities.length; i++) {
      const charity = createdCharities[i];
      for (let j = 0; j < projectTemplates.length; j++) {
        const template = projectTemplates[j];
        const proj = await Project.create({
          charityId: charity._id,
          title: `${template.prefix} - ${charity.publicName}`,
          description: `Direct initiative by ${charity.publicName} aimed at generating community-driven transformation.`,
          goalAmount: template.goal,
          collectedAmount: template.collect,
          status: template.collect >= template.goal ? "completed" : "active",
        });
        createdProjects.push(proj);
      }
    }
    console.log(`✅ Seeded ${createdProjects.length} projects linked to charities.`);

    // 8. Seed Donor History for Leaderboards
    console.log("Seeding donor rankings & donations...");
    const donationTiers = [
      { userIndex: 0, coins: 5400, count: 8 }, // Sarah (Diamond)
      { userIndex: 1, coins: 2800, count: 5 }, // Aiden (Platinum)
      { userIndex: 2, coins: 1200, count: 4 }, // Elena (Gold)
      { userIndex: 3, coins: 450, count: 2 },  // Marcus (Silver)
      { userIndex: 4, coins: 180, count: 1 },  // Maya (Bronze)
    ];

    for (const item of donationTiers) {
      const donor = individuals[item.userIndex];
      const charity = createdCharities[item.userIndex % createdCharities.length];
      const project = createdProjects[item.userIndex % createdProjects.length];

      // Add a primary large donation
      await Donation.create({
        donorUserId: donor._id,
        charityId: charity._id,
        charityProjectId: project._id,
        coinAmount: item.coins,
      });

      await UserDonation.create({
        user: donor._id,
        charity: charity.publicName,
        project: project.title,
        amount: item.coins,
        status: "completed",
      });

      await CoinTransaction.create({
        userId: donor._id,
        type: "donate",
        amount: item.coins,
        refType: "donation",
      });
    }
    console.log(`✅ Seeded realistic donor rankings.`);

    // 9. Seed Orders for Company Leaderboard
    console.log("Seeding brand orders & sales impact...");
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      const buyer = individuals[i % individuals.length];
      const qty = (i + 1) * 2;
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
    }
    console.log(`✅ Seeded brand orders and impact metrics.`);

    await mongoose.disconnect();
    console.log("🎉 Seeding complete with live Leaderboards!");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();