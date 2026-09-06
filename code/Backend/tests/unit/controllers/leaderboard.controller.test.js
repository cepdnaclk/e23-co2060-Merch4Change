import assert from "node:assert/strict";
import test from "node:test";
import { getLeaderboardStats, getCharityLeaderboard } from "../../../src/controllers/leaderboard.controller.js";
import Charity from "../../../src/models/Charity.js";
import Donation from "../../../src/models/Donation.js";

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
