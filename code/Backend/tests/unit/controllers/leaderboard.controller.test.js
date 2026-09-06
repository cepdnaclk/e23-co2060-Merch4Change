import assert from "node:assert/strict";
import test from "node:test";
import { getLeaderboardStats } from "../../../src/controllers/leaderboard.controller.js";
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
