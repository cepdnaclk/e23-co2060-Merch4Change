import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/merch4change";

const orderSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const paymentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const userSchema = new mongoose.Schema({}, { strict: false });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function runSeed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    let user = await User.findOne({ userName: "Blue" });
    if (!user) {
      user = await User.findOne({});
    }

    if (!user) {
      console.error("No user found in the database.");
      process.exit(1);
    }

    const userId = user._id;
    console.log(`Clearing duplicates and seeding for user: ${user.userName || "Blue"} (${userId})`);

    // Remove previous duplicates and seeded test purchases
    await Order.deleteMany({
      $or: [
        { orderNumber: { $in: ["ORD-2026-9041", "ORD-2026-8812", "M4C-882194", "M4C-410293"] } },
        { "items.name": { $regex: /Tote Bag|Hoodie|Bottle/i } },
      ],
    });

    await Payment.deleteMany({
      $or: [
        { orderNumber: { $in: ["ORD-2026-9041", "ORD-2026-8812"] } },
        { description: { $regex: /Tote Bag|Hoodie|Bottle/i } },
      ],
    });

    const sampleOrders = [
      {
        userId: userId,
        user: userId,
        customerId: userId,
        customer: userId,
        orderNumber: "ORD-2026-9041",
        items: [
          { name: "Ocean Cleanup Organic Hoodie", quantity: 1, price: 4500 },
          { name: "Bamboo Reusable Water Bottle", quantity: 1, price: 1200 },
        ],
        totalAmount: 5700,
        totalPrice: 5700,
        amount: 5700,
        donationAmount: 855,
        charityName: "Clean Ocean Alliance",
        cause: "Marine Plastic Interception & Coast Restoration",
        status: "completed",
        paymentStatus: "paid",
        transactionHash: "0x7c9f3e18a02c5d4b8e2197fa3d88194c03b1297e68adbc44e1",
        proofUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: userId,
        user: userId,
        customerId: userId,
        customer: userId,
        orderNumber: "ORD-2026-8812",
        items: [
          { name: "Recycled Cotton Charity Tote Bag", quantity: 2, price: 950 },
        ],
        totalAmount: 1900,
        totalPrice: 1900,
        amount: 1900,
        donationAmount: 285,
        charityName: "Earth Reforest Initiative",
        cause: "Native Tree Canopy Planting",
        status: "completed",
        paymentStatus: "paid",
        transactionHash: "0x2e81b94c03a71b1284a1e94cc7c9f3e18a02c5d4b8e2197fa3",
        proofUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    await Order.insertMany(sampleOrders);
    console.log("Successfully fed fresh, deduplicated purchases into the database.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

runSeed();