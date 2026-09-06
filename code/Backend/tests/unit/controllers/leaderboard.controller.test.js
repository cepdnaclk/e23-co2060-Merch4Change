import assert from "node:assert/strict";
import test from "node:test";
import { getLeaderboardStats, getCharityLeaderboard, getDonorLeaderboard } from "../../../src/controllers/leaderboard.controller.js";
import Charity from "../../../src/models/Charity.js";
import Donation from "../../../src/models/Donation.js";
import User from "../../../src/models/User.js";

const createResponseMock = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
  };
  return res;
};

test("getLeaderboardStats returns aggregated stats with distinct donors and verified charities", async () => {
  const originalAggregate = Donation.aggregate;
  const originalDistinct = Donation.distinct;
  const originalCharityCount = Charity.countDocuments;

  Donation.aggregate = async () => [{ _id: null, total: 3850 }];
  Donation.distinct = async (field, query) => {
    assert.equal(field, "donorUserId");
    assert.deepEqual(query, { status: "completed" });
    return ["user1", "user2", "user3"];
  };
  Charity.countDocuments = async (query) => {
    assert.deepEqual(query, { verificationStatus: "verified" });
    return 4;
  };

  const req = {};
  const res = createResponseMock();

  try {
    await getLeaderboardStats(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.data.totalCoinsDonated, 3850);
    assert.equal(res.payload.data.totalCommunityDonors, 3);
    assert.equal(res.payload.data.verifiedCharitiesSupported, 4);
    assert.equal(res.payload.data.platformImpactRate, "100%");
  } finally {
    Donation.aggregate = originalAggregate;
    Donation.distinct = originalDistinct;
    Charity.countDocuments = originalCharityCount;
  }
});

test("getCharityLeaderboard returns ranked charities with categories and coins", async () => {
  const originalFind = Charity.find;
  const originalAggregate = Donation.aggregate;

  Charity.find = () => ({
    populate: () => ({
      lean: async () => [
        {
          _id: "charityA",
          publicName: "Clean Oceans Initiative",
          category: "environment",
          description: "Protecting marine life",
          ownerUserId: { userName: "cleanoceans", profileImageUrl: "ocean.jpg", isVerified: true },
        },
        {
          _id: "charityB",
          publicName: "Education For All",
          category: "education",
          description: "Empowering children",
          ownerUserId: { userName: "edforall", profileImageUrl: "edu.jpg", isVerified: true },
        },
      ],
    }),
  });

  Donation.aggregate = async () => [
    {
      _id: "charityA",
      totalCoins: 4500,
      donationCount: 20,
      distinctDonors: ["u1", "u2", "u3"],
    },
    {
      _id: "charityB",
      totalCoins: 2100,
      donationCount: 10,
      distinctDonors: ["u1", "u4"],
    },
  ];

  const req = { query: { timeframe: "all_time", limit: "10" } };
  const res = createResponseMock();

  try {
    await getCharityLeaderboard(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.data.leaderboard.length, 2);

    const first = res.payload.data.leaderboard[0];
    assert.equal(first.rank, 1);
    assert.equal(first.name, "Clean Oceans Initiative");
    assert.equal(first.totalCoins, 4500);
    assert.equal(first.donorCount, 3);
    assert.equal(first.category, "environment");
    assert.equal(first.categoryIcon, "🌱");

    const second = res.payload.data.leaderboard[1];
    assert.equal(second.rank, 2);
    assert.equal(second.name, "Education For All");
    assert.equal(second.totalCoins, 2100);
  } finally {
    Charity.find = originalFind;
    Donation.aggregate = originalAggregate;
  }
});

test("getDonorLeaderboard assigns contiguous ranks starting from 1 even when top donor is missing/deleted", async () => {
  const originalAggregate = Donation.aggregate;
  const originalUserFind = User.find;

  // Donation aggregate returns 3 donors: userDeleted (highest), userActive1, userActive2
  Donation.aggregate = async () => [
    { _id: "userDeleted", totalCoins: 8000, donationCount: 15, lastDonatedAt: new Date() },
    { _id: "userActive1", totalCoins: 5000, donationCount: 10, lastDonatedAt: new Date() },
    { _id: "userActive2", totalCoins: 2000, donationCount: 5, lastDonatedAt: new Date() },
  ];

  // User.find returns only the existing active users (userDeleted is missing/deleted from User collection)
  User.find = () => ({
    select: () => ({
      lean: async () => [
        {
          _id: "userActive1",
          firstName: "Alice",
          lastName: "Walker",
          userName: "alicew",
          profileImageUrl: "alice.jpg",
          isVerified: true,
        },
        {
          _id: "userActive2",
          firstName: "Bob",
          lastName: "Marley",
          userName: "bobm",
          profileImageUrl: "bob.jpg",
          isVerified: false,
        },
      ],
    }),
  });

  const req = { query: { timeframe: "all_time", limit: "10" } };
  const res = createResponseMock();

  try {
    await getDonorLeaderboard(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    // userDeleted was dropped, so leaderboard has 2 entries
    assert.equal(res.payload.data.leaderboard.length, 2);

    const first = res.payload.data.leaderboard[0];
    // Must be rank 1 (NOT rank 2)
    assert.equal(first.rank, 1);
    assert.equal(first.userId, "userActive1");
    assert.equal(first.userName, "alicew");
    assert.equal(first.totalCoins, 5000);
    assert.equal(first.tier, "Diamond");

    const second = res.payload.data.leaderboard[1];
    // Must be rank 2 (NOT rank 3)
    assert.equal(second.rank, 2);
    assert.equal(second.userId, "userActive2");
    assert.equal(second.userName, "bobm");
    assert.equal(second.totalCoins, 2000);
    assert.equal(second.tier, "Platinum");
  } finally {
    Donation.aggregate = originalAggregate;
    User.find = originalUserFind;
  }
});
