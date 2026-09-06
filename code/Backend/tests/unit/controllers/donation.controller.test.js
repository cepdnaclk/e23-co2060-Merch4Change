import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
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

const charityId = new mongoose.Types.ObjectId();
const ownerUserId = new mongoose.Types.ObjectId();
const otherCharityId = new mongoose.Types.ObjectId();
const projectId = new mongoose.Types.ObjectId();

for (const scenario of [
  { name: "rejects a project owned by another charity", requestedCharity: charityId, projectCharity: otherCharityId, error: "CHARITY_PROJECT_MISMATCH" },
  { name: "rejects an unknown explicit charity instead of using the project's charity", requestedCharity: otherCharityId, projectCharity: charityId, error: "CHARITY_NOT_FOUND" },
  { name: "accepts matching charity and project IDs", requestedCharity: charityId, projectCharity: charityId },
  { name: "accepts an owner user ID for the matching charity", requestedCharity: ownerUserId, projectCharity: charityId },
  { name: "rejects a mismatched project when the charity uses an owner user ID", requestedCharity: ownerUserId, projectCharity: otherCharityId, error: "CHARITY_PROJECT_MISMATCH" },
  { name: "accepts a legacy project referencing the matching owner", requestedCharity: charityId, projectCharity: ownerUserId },
  { name: "infers the charity when only the project is supplied", projectCharity: charityId },
  { name: "accepts a general donation without a project", requestedCharity: charityId },
]) {
  test(`createDonation ${scenario.name}`, async (t) => {
    const charity = { _id: charityId, ownerUserId, verificationStatus: "verified" };
    t.mock.method(Charity, "findById", async (id) => String(id) === String(charityId) ? charity : null);
    t.mock.method(Charity, "findOne", async (filter) => String(filter.ownerUserId) === String(ownerUserId) ? charity : null);
    t.mock.method(Project, "findOne", async () => ({ _id: projectId, charityId: scenario.projectCharity, status: "active" }));

    const balanceUpdate = t.mock.method(User, "findOneAndUpdate", () => ({
      select: async () => ({ coinBalance: 450 }),
    }));
    const donationCreate = t.mock.method(Donation, "create", async (doc) => ({ _id: "donation1", ...doc }));
    const projectUpdate = t.mock.method(Project, "findByIdAndUpdate", async () => ({}));
    const transactionCreate = t.mock.method(CoinTransaction, "create", async () => ({}));
    const res = createResponseMock();
    const req = {
      user: { _id: "user123" },
      body: {
        coinAmount: 50,
        ...(scenario.requestedCharity ? { charityId: String(scenario.requestedCharity) } : {}),
        ...(scenario.projectCharity ? { charityProjectId: String(projectId) } : {}),
      },
    };

    if (scenario.error) {
      await assert.rejects(() => createDonation(req, res), (err) => {
        assert.equal(err.code, scenario.error);
        assert.equal(err.statusCode, scenario.error === "CHARITY_NOT_FOUND" ? 404 : 400);
        return true;
      });
      for (const mutation of [balanceUpdate, donationCreate, projectUpdate, transactionCreate]) {
        assert.equal(mutation.mock.callCount(), 0, "Rejected donation must not mutate balances or records");
      }
    } else {
      await createDonation(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(String(res.payload.data.donation.charityId), String(charityId));
      assert.equal(res.payload.data.donation.charityProjectId, scenario.projectCharity ? projectId : null);
      assert.equal(balanceUpdate.mock.callCount(), 1);
      assert.equal(donationCreate.mock.callCount(), 1);
      assert.equal(projectUpdate.mock.callCount(), scenario.projectCharity ? 1 : 0);
      assert.equal(transactionCreate.mock.callCount(), 1);
    }
  });
}

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
