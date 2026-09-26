import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Auction from "../models/Auction.js";
import Brand from "../models/Brand.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/merch4change";

const extraAuctions = [
  {
    name: "VIP Coachella Pass + Glamping",
    description: "Full weekend VIP pass to Coachella with a luxury glamping tent included. Bidding starts now!",
    price: 1500,
    images: ["https://images.unsplash.com/photo-1533174000271-5ca0a6ae59bf?w=800"],
    startPrice: 1000,
    bidIncrement: 100,
  },
  {
    name: "Signed Vintage Fender Stratocaster",
    description: "A piece of rock history. This 1970s Fender Stratocaster has been signed by legendary artists.",
    price: 3500,
    images: ["https://images.unsplash.com/photo-1550291652-6cb9158d9890?w=800"],
    startPrice: 2000,
    bidIncrement: 200,
  },
  {
    name: "Private Island 3-Day Retreat",
    description: "Escape to a private island in the Bahamas for 3 days and 2 nights.",
    price: 5000,
    images: ["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800"],
    startPrice: 2500,
    bidIncrement: 500,
  },
  {
    name: "Original Street Art Canvas",
    description: "1/1 original canvas by a renowned urban street artist. Vibrant colors, perfect condition.",
    price: 800,
    images: ["https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800"],
    startPrice: 400,
    bidIncrement: 50,
  },
  {
    name: "Limited Edition Golden Sneaker",
    description: "Exclusive sneaker collaboration, only 10 pairs exist in the world. This is pair #3.",
    price: 1200,
    images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800"],
    startPrice: 800,
    bidIncrement: 50,
  }
];

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found. Cannot create products.");
      process.exit(1);
    }

    const now = new Date();

    for (const item of extraAuctions) {
      // 1. Create product
      const product = await Product.create({
        name: item.name,
        description: item.description,
        price: item.price,
        stock: 1,
        ownerUserId: admin._id,
        images: item.images,
        imageUrl: item.images[0],
        isLimitedEdition: true,
      });

      // 2. Create Auction
      await Auction.create({
        productId: product._id,
        startPrice: item.startPrice,
        currentPrice: item.startPrice,
        currentBidder: null,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // started 2 hours ago
        endTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),  // ends in 3 days
        createdBy: admin._id,
        status: "active",
        bidIncrement: item.bidIncrement,
        images: item.images,
        imageUrl: item.images[0]
      });
      
      console.log(`Seeded auction: ${item.name}`);
    }

    console.log("Successfully seeded extra auctions with images!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSeed();
