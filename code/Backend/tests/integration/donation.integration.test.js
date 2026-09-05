import mongoose from "mongoose";
import http from "node:http";
import app from "../../src/app.js";
import User from "../../src/models/User.js";
import Charity from "../../src/models/Charity.js";
import Project from "../../src/models/Project.js";
import Donation from "../../src/models/Donation.js";
import CoinTransaction from "../../src/models/CoinTransaction.js";
import jwt from "jsonwebtoken";
import env from "../../src/config/env.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/merch4change";

let server;
let baseUrl;

async function startServer() {
  await mongoose.connect(MONGO_URI);
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  await mongoose.disconnect();
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

function makeAuthToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: "1h" });
}

async function runTests() {
  await startServer();
  console.log("\n=========================================");
  console.log("STARTING DONATION SYSTEM END-TO-END TESTS");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  async function assertTest(description, testFn) {
    try {
      await testFn();
      console.log(`✅ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${description}`);
      console.error(err);
      failed++;
    }
  }

  // 1. Fetch verified charities
  let verifiedCharity;
  await assertTest("1. GET /api/v1/donations/charities returns verified charities", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations/charities`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.charities) || json.data.charities.length === 0) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    verifiedCharity = json.data.charities[0];
    if (!verifiedCharity.publicName) {
      throw new Error("Charity missing publicName");
    }
  });

  // 2. Fetch projects
  let targetProject;
  await assertTest("2. GET /api/v1/donations/projects returns active projects under verified charities", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations/projects`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.projects) || json.data.projects.length === 0) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }
    targetProject = json.data.projects.find((p) => p.charityId === verifiedCharity._id) || json.data.projects[0];
    if (!targetProject.title || targetProject.goalAmount === undefined) {
      throw new Error("Project missing title or goalAmount");
    }
  });

  // 3. Find a test user and top up coins if necessary
  const donorUser = await User.findOne({ role: "user" });
  if (!donorUser) throw new Error("No donor user found in DB");
  donorUser.coinBalance = Math.max(donorUser.coinBalance, 500);
  await donorUser.save();
  const token = makeAuthToken(donorUser._id);

  const initialCoins = donorUser.coinBalance;
  const initialProjectCollected = (await Project.findById(targetProject.id || targetProject._id))?.collectedAmount || 0;
  const donationAmount = 75;

  // 4. Test POST /api/v1/donations (Successful Donation)
  let createdDonationId;
  await assertTest("3. POST /api/v1/donations completes donation, deducts coins, and updates project", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        charityId: targetProject.charityId || verifiedCharity._id,
        charityProjectId: targetProject.id || targetProject._id,
        coinAmount: donationAmount,
      }),
    });
    const json = await res.json();
    if (res.status !== 201 || !json.success) {
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(json)}`);
    }
    if (json.data.coinBalance !== initialCoins - donationAmount) {
      throw new Error(`Expected remaining coins ${initialCoins - donationAmount}, got ${json.data.coinBalance}`);
    }

    createdDonationId = json.data.donation._id;

    // Verify DB states
    const updatedUser = await User.findById(donorUser._id);
    if (updatedUser.coinBalance !== initialCoins - donationAmount) {
      throw new Error("User coinBalance was not properly deducted in DB");
    }

    const updatedProject = await Project.findById(targetProject.id || targetProject._id);
    if (updatedProject.collectedAmount !== initialProjectCollected + donationAmount) {
      throw new Error(`Project collectedAmount was not incremented. Expected ${initialProjectCollected + donationAmount}, got ${updatedProject.collectedAmount}`);
    }

    const tx = await CoinTransaction.findOne({ refId: createdDonationId });
    if (!tx || tx.type !== "donate" || tx.amount !== donationAmount) {
      throw new Error("CoinTransaction was not recorded properly");
    }
  });

  // 5. Test Insufficient Balance rejection
  await assertTest("4. POST /api/v1/donations rejects donation when coins are insufficient", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        charityId: verifiedCharity._id,
        coinAmount: 99999999, // way above balance
      }),
    });
    const json = await res.json();
    if (res.status !== 400 || json.error?.code !== "INSUFFICIENT_COINS") {
      throw new Error(`Expected 400 INSUFFICIENT_COINS, got ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 6. Test Unverified Charity rejection
  await assertTest("5. POST /api/v1/donations rejects unverified charities", async () => {
    const unverifiedCharity = await Charity.create({
      publicName: "Unverified Test Charity",
      category: "environment",
      verificationStatus: "pending",
      registrationNumber: "TEMP-999",
      contactEmail: "temp@unverified.test",
      contactPhone: "+1234567890",
      officialAddress: "123 Test St",
      ownerUserId: donorUser._id,
    });

    const res = await fetch(`${baseUrl}/api/v1/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        charityId: unverifiedCharity._id,
        coinAmount: 10,
      }),
    });
    const json = await res.json();

    // Clean up temporary charity
    await Charity.findByIdAndDelete(unverifiedCharity._id);

    if (res.status !== 403 || json.error?.code !== "CHARITY_NOT_VERIFIED") {
      throw new Error(`Expected 403 CHARITY_NOT_VERIFIED, got ${res.status}: ${JSON.stringify(json)}`);
    }
  });

  // 7. Test GET /api/v1/donations/my
  await assertTest("6. GET /api/v1/donations/my returns paginated user history with populated info", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations/my?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.donations) || json.data.donations.length === 0) {
      throw new Error(`Failed to fetch my donations: ${JSON.stringify(json)}`);
    }
    const latestDonation = json.data.donations[0];
    if (!latestDonation.charity || !latestDonation.project || !latestDonation.amount || !latestDonation.status) {
      throw new Error(`Donation object missing mapped fields: ${JSON.stringify(latestDonation)}`);
    }
  });

  // 8. Test GET /api/v1/donations/my/stats
  await assertTest("7. GET /api/v1/donations/my/stats calculates real impact metrics and ongoing projects", async () => {
    const res = await fetch(`${baseUrl}/api/v1/donations/my/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Failed to fetch donation stats: ${JSON.stringify(json)}`);
    const { totalDonated, causesSupported, donationCount, impactScore, ongoingProjects } = json.data;
    if (typeof totalDonated !== "number" || totalDonated < donationAmount) {
      throw new Error(`Invalid totalDonated: ${totalDonated}`);
    }
    if (typeof causesSupported !== "number" || causesSupported < 1) {
      throw new Error(`Invalid causesSupported: ${causesSupported}`);
    }
    if (typeof impactScore !== "number" || impactScore < 0 || impactScore > 100) {
      throw new Error(`Invalid impactScore: ${impactScore}`);
    }
    if (!Array.isArray(ongoingProjects) || ongoingProjects.length === 0) {
      throw new Error("ongoingProjects array is empty");
    }
  });

  // 9. Test GET /api/v1/leaderboards/donors
  await assertTest("8. GET /api/v1/leaderboards/donors ranks donors using unified Donation records", async () => {
    const res = await fetch(`${baseUrl}/api/v1/leaderboards/donors?timeframe=all_time&limit=10`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.leaderboard) || json.data.leaderboard.length === 0) {
      throw new Error(`Failed to fetch donor leaderboard: ${JSON.stringify(json)}`);
    }
    const topDonor = json.data.leaderboard[0];
    if (topDonor.rank !== 1 || !topDonor.totalCoins || !topDonor.tier) {
      throw new Error(`Invalid top donor structure: ${JSON.stringify(topDonor)}`);
    }
  });

  // 10. Test GET /api/v1/leaderboards/stats
  await assertTest("9. GET /api/v1/leaderboards/stats aggregates community donation totals", async () => {
    const res = await fetch(`${baseUrl}/api/v1/leaderboards/stats`);
    const json = await res.json();
    if (!json.success) throw new Error(`Failed to fetch leaderboard stats: ${JSON.stringify(json)}`);
    if (typeof json.data.totalCoinsDonated !== "number" || json.data.totalCoinsDonated <= 0) {
      throw new Error(`Invalid totalCoinsDonated: ${json.data.totalCoinsDonated}`);
    }
  });

  // 11. Test Live Coin Balance endpoint GET /api/v1/profile/me/coins
  await assertTest("10. GET /api/v1/profile/me/coins reflects live remaining coins", async () => {
    const res = await fetch(`${baseUrl}/api/v1/profile/me/coins`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await res.json();
    if (!json.success || json.data.coinBalance !== donorUser.coinBalance - donationAmount) {
      throw new Error(`Expected coinBalance ${donorUser.coinBalance - donationAmount}, got ${json.data?.coinBalance}`);
    }
  });

  console.log("\n=========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  await stopServer();
  if (failed > 0) process.exit(1);
}

runTests().catch(async (err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  if (server) await stopServer();
  process.exit(1);
});
