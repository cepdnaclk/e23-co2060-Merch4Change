import assert from "node:assert/strict";
import test from "node:test";
import {
  createDonation,
  getMyDonations,
  getDonationStats,
  listCharities,
  listDonationProjects,
} from "../../../src/controllers/donation.controller.js";
import Charity from "../../../src/models/Charity.js";
import CoinTransaction from "../../../src/models/CoinTransaction.js";
import Donation from "../../../src/models/Donation.js";
import Project from "../../../src/models/Project.js";
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

test("createDonation validates charityId and coinAmount", async () => {
  const req = {
    user: { _id: "user123" },
    body: { coinAmount: 0 },
  };
  const res = createResponseMock();

  await assert.rejects(
    () => createDonation(req, res),
    (err) => {
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test("createDonation rejects unverified charity", async () => {
  const originalFindById = Charity.findById;
  Charity.findById = async () => ({
    _id: "charity1",
    verificationStatus: "pending",
  });

  const req = {
    user: { _id: "user123" },
    body: { charityId: "charity1", coinAmount: 50 },
  };
  const res = createResponseMock();

  try {
    await assert.rejects(
      () => createDonation(req, res),
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.equal(err.code, "CHARITY_NOT_VERIFIED");
        return true;
      }
    );
  } finally {
    Charity.findById = originalFindById;
  }
});

test("createDonation rejects when coinBalance is insufficient", async () => {
  const originalFindById = Charity.findById;
  const originalFindOneAndUpdate = User.findOneAndUpdate;

  Charity.findById = async () => ({
    _id: "charity1",
    verificationStatus: "verified",
  });
  User.findOneAndUpdate = () => ({
    select: async () => null, // indicates balance check failed
  });

  const req = {
    user: { _id: "user123" },
    body: { charityId: "charity1", coinAmount: 500 },
  };
  const res = createResponseMock();

  try {
    await assert.rejects(
      () => createDonation(req, res),
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, "INSUFFICIENT_COINS");
        return true;
      }
    );
  } finally {
    Charity.findById = originalFindById;
    User.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("createDonation creates donation, logs coin transaction, and returns 201", async () => {
  const originalFindById = Charity.findById;
  const originalFindOne = Project.findOne;
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  const originalDonationCreate = Donation.create;
  const originalProjectUpdate = Project.findByIdAndUpdate;
  const originalCoinTxCreate = CoinTransaction.create;

  Charity.findById = async () => ({
    _id: "charity1",
    verificationStatus: "verified",
  });
  Project.findOne = async () => ({
    _id: "proj1",
    charityId: "charity1",
    status: "active",
  });
  User.findOneAndUpdate = () => ({
    select: async () => ({ _id: "user123", coinBalance: 450 }),
  });
  Donation.create = async (doc) => ({ _id: "don1", ...doc, createdAt: new Date() });
  Project.findByIdAndUpdate = async () => true;
  CoinTransaction.create = async (doc) => ({ _id: "tx1", ...doc });

  const req = {
    user: { _id: "user123" },
    body: { charityId: "charity1", charityProjectId: "proj1", coinAmount: 50 },
  };
  const res = createResponseMock();

  try {
    await createDonation(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.data.coinBalance, 450);
    assert.equal(res.payload.data.donation.coinAmount, 50);
  } finally {
    Charity.findById = originalFindById;
    Project.findOne = originalFindOne;
    User.findOneAndUpdate = originalFindOneAndUpdate;
    Donation.create = originalDonationCreate;
    Project.findByIdAndUpdate = originalProjectUpdate;
    CoinTransaction.create = originalCoinTxCreate;
  }
});
