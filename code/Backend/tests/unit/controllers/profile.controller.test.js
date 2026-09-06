import test from "node:test";
import assert from "node:assert/strict";

import { createMockResponse, nextTick } from "../helpers/http.js";
import { me, getTopDonors } from "../../../src/controllers/profile.controller.js";
import User from "../../../src/models/User.js";
import Charity from "../../../src/models/Charity.js";
import Project from "../../../src/models/Project.js";
import Donation from "../../../src/models/Donation.js";

test("me returns current user from request", async () => {
  const req = {
    user: {
      _id: "u1",
      fullName: "Jane",
    },
  };
  const res = createMockResponse();

  me(req, res, () => {});
  await nextTick();

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload.data.user, req.user);
});

test("getTopDonors returns donors with standardized tiers (Diamond, Platinum, Gold, Silver, Bronze)", async () => {
  const originalUserFindOne = User.findOne;
  const originalCharityFindOne = Charity.findOne;
  const originalProjectFind = Project.find;
  const originalDonationFind = Donation.find;

  User.findOne = async () => ({
    _id: "u_charity",
    userName: "hopecharity",
    accountType: "organization",
    role: "charity",
  });

  Charity.findOne = () => ({
    lean: async () => ({ _id: "c1", publicName: "Hope Charity" }),
    populate: () => ({ lean: async () => ({ _id: "c1", publicName: "Hope Charity" }) }),
    then: (resolve) => resolve({ _id: "c1", publicName: "Hope Charity" }),
  });

  Project.find = () => ({
    select: () => [],
  });

  Donation.find = () => ({
    populate() {
      return this;
    },
    sort() {
      return this;
    },
    lean: async () => [
      {
        _id: "d1",
        coinAmount: 6000,
        createdAt: new Date(),
        donorUserId: { _id: "d_user_1", userName: "alice", firstName: "Alice", lastName: "Smith" },
        charityProjectId: { title: "Clean Water" },
      },
      {
        _id: "d2",
        coinAmount: 2500,
        createdAt: new Date(),
        donorUserId: { _id: "d_user_2", userName: "bob", firstName: "Bob", lastName: "Jones" },
        charityProjectId: { title: "Clean Water" },
      },
      {
        _id: "d3",
        coinAmount: 600,
        createdAt: new Date(),
        donorUserId: { _id: "d_user_3", userName: "charlie", firstName: "Charlie", lastName: "Brown" },
        charityProjectId: { title: "Clean Water" },
      },
      {
        _id: "d4",
        coinAmount: 150,
        createdAt: new Date(),
        donorUserId: { _id: "d_user_4", userName: "diana", firstName: "Diana", lastName: "Prince" },
        charityProjectId: { title: "Clean Water" },
      },
      {
        _id: "d5",
        coinAmount: 50,
        createdAt: new Date(),
        donorUserId: { _id: "d_user_5", userName: "evan", firstName: "Evan", lastName: "Wright" },
        charityProjectId: { title: "Clean Water" },
      },
    ],
  });

  const req = {
    params: { username: "hopecharity" },
    query: {},
  };
  const res = createMockResponse();

  try {
    getTopDonors(req, res, () => {});
    await nextTick();

    assert.equal(res.statusCode, 200);
    const donors = res.payload.data.topDonors;
    assert.equal(donors.length, 5);

    assert.equal(donors[0].tier, "Diamond");
    assert.equal(donors[0].tierTitle, "Diamond Donor");
    assert.equal(donors[0].tierIcon, "💎");

    assert.equal(donors[1].tier, "Platinum");
    assert.equal(donors[1].tierTitle, "Platinum Donor");
    assert.equal(donors[1].tierIcon, "👑");

    assert.equal(donors[2].tier, "Gold");
    assert.equal(donors[2].tierTitle, "Gold Donor");
    assert.equal(donors[2].tierIcon, "🥇");

    assert.equal(donors[3].tier, "Silver");
    assert.equal(donors[3].tierTitle, "Silver Donor");
    assert.equal(donors[3].tierIcon, "🥈");

    assert.equal(donors[4].tier, "Bronze");
    assert.equal(donors[4].tierTitle, "Bronze Donor");
    assert.equal(donors[4].tierIcon, "🥉");
  } finally {
    User.findOne = originalUserFindOne;
    Charity.findOne = originalCharityFindOne;
    Project.find = originalProjectFind;
    Donation.find = originalDonationFind;
  }
});