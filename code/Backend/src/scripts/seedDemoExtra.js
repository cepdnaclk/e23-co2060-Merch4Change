import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/merch4change";

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    const demoUser = await User.findOne({ email: "demo@merch4change.test" });
    const showcaseBrand = await User.findOne({ email: "showcase@merch4change.test" });
    const sarahUser = await User.findOne({ email: "sarah@test.com" });

    if (!demoUser || !showcaseBrand || !sarahUser) {
      console.log("Required users not found. Run seedFull.js first.");
      process.exit(1);
    }

    console.log("Found Demo User, Showcase Brand, and Sarah Jenkins.");

    // --- Seed Notifications ---
    console.log("Seeding notifications for Demo User...");
    const notifications = [
      {
        userId: demoUser._id,
        type: "FOLLOW",
        message: "Sarah Jenkins started following you.",
        isRead: false,
      },
      {
        userId: demoUser._id,
        type: "AUCTION_WIN",
        message: "Congratulations! Your bid on 'Aventador Carbon Chronograph' was successful.",
        isRead: false,
      },
      {
        userId: demoUser._id,
        type: "NEW_POST",
        message: "Showcase Demo Brand just published a new post.",
        isRead: true,
      },
      {
        userId: demoUser._id,
        type: "DONATION_RECEIPT",
        message: "Thank you for your generous donation of 500 coins to Global Wildlife Fund.",
        isRead: true,
      },
    ];

    await Notification.insertMany(notifications);
    console.log("Notifications seeded successfully.");

    // --- Seed Chat History ---
    console.log("Seeding chat history between Demo User and Showcase Brand...");

    // Sort IDs for participant key
    const p1 = demoUser._id.toString();
    const p2 = showcaseBrand._id.toString();
    const participantKey = [p1, p2].sort().join("_");

    let conversation = await Conversation.findOne({ participantKey });
    
    if (!conversation) {
      conversation = new Conversation({
        participantKey,
        participants: [demoUser._id, showcaseBrand._id],
        lastMessageText: "Thank you so much! We will ship it right away.",
        lastMessageAt: new Date(),
        lastSenderUserId: showcaseBrand._id
      });
      await conversation.save();
    }

    const messages = [
      {
        conversationId: conversation._id,
        senderUserId: demoUser._id,
        recipientUserId: showcaseBrand._id,
        body: "Hi! I just purchased the Eco-Friendly Demo Backpack.",
        readBy: [demoUser._id, showcaseBrand._id]
      },
      {
        conversationId: conversation._id,
        senderUserId: showcaseBrand._id,
        recipientUserId: demoUser._id,
        body: "Hello! Thank you for your purchase. We are processing your order.",
        readBy: [demoUser._id, showcaseBrand._id]
      },
      {
        conversationId: conversation._id,
        senderUserId: demoUser._id,
        recipientUserId: showcaseBrand._id,
        body: "Awesome. Looking forward to it!",
        readBy: [demoUser._id, showcaseBrand._id]
      },
      {
        conversationId: conversation._id,
        senderUserId: showcaseBrand._id,
        recipientUserId: demoUser._id,
        body: "Thank you so much! We will ship it right away.",
        readBy: [demoUser._id, showcaseBrand._id]
      }
    ];

    // Wait a bit to have staggered dates or just insert them
    // insertMany works fine
    for (let msg of messages) {
       await Message.create(msg);
    }
    console.log("Chat history seeded successfully.");

    process.exit(0);
  } catch (err) {
    console.error("Error seeding extra demo data:", err);
    process.exit(1);
  }
}

runSeed();
