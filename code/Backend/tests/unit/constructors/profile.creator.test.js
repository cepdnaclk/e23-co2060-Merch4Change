import test from "node:test";
import assert from "node:assert/strict";

import bcrypt from "bcryptjs";

import { createMockResponse } from "../helpers/http.js";
import OrganizationProfile from "../../../src/models/OrganizationProfile.js";
import PendingUser from "../../../src/models/PendingUser.js";
import User from "../../../src/models/User.js";
import { createOrganizationProfile, createUserProfile } from "../../../src/constructors/profile.creator.js";

test("createUserProfile creates a pending user and sends OTP", async () => {
  const originalHash = bcrypt.hash;
  const originalFindOne = User.findOne;
  const originalDeleteOne = PendingUser.deleteOne;
  const originalCreate = PendingUser.create;

  const findQueries = [];
  let createdPendingUser;

  bcrypt.hash = async () => "hashed-pass";
  User.findOne = async (query) => {
    findQueries.push(query);
    return null;
  };
  PendingUser.deleteOne = async () => ({ deletedCount: 1 });
  PendingUser.create = async (payload) => {
    createdPendingUser = payload;
    return { _id: "p1", ...payload };
  };

  const req = {
    body: {
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "JANE@EXAMPLE.COM",
      password: "Pass1234",
    },
  };
  const res = createMockResponse();

  try {
    await createUserProfile(req, res);
  } finally {
    bcrypt.hash = originalHash;
    User.findOne = originalFindOne;
    PendingUser.deleteOne = originalDeleteOne;
    PendingUser.create = originalCreate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(createdPendingUser.email, "jane@example.com");
  assert.equal(createdPendingUser.userName, "jane");
  assert.equal(createdPendingUser.accountType, "individual");
  assert.deepEqual(findQueries, [{ email: "jane@example.com" }, { userName: "jane" }]);
});

test("createUserProfile rejects duplicate username", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async (query) => {
    if (query.email) {
      return null;
    }

    if (query.userName) {
      return { _id: "existing-user" };
    }

    return null;
  };

  const req = {
    body: {
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "jane@example.com",
      password: "Pass1234",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => createUserProfile(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "USERNAME_ALREADY_IN_USE");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
  }
});

test("createOrganizationProfile creates a pending organization user and sends OTP", async () => {
  const originalHash = bcrypt.hash;
  const originalUserFindOne = User.findOne;
  const originalOrgFindOne = OrganizationProfile.findOne;
  const originalPendingDelete = PendingUser.deleteOne;
  const originalPendingCreate = PendingUser.create;

  const userQueries = [];
  const orgQueries = [];
  let createdPendingOrg;

  bcrypt.hash = async () => "hashed-pass";
  User.findOne = async (query) => {
    userQueries.push(query);
    return null;
  };
  OrganizationProfile.findOne = async (query) => {
    orgQueries.push(query);
    return null;
  };
  PendingUser.deleteOne = async () => ({ deletedCount: 1 });
  PendingUser.create = async (payload) => {
    createdPendingOrg = payload;
    return { _id: "p2", ...payload };
  };

  const req = {
    body: {
      orgName: "Charity Org",
      email: "ORG@EXAMPLE.COM",
      password: "Pass1234",
      phone: "+1 555 000 1111",
      address: "123 Main Street",
      website: "https://example.org",
    },
  };
  const res = createMockResponse();

  try {
    await createOrganizationProfile(req, res);
  } finally {
    bcrypt.hash = originalHash;
    User.findOne = originalUserFindOne;
    OrganizationProfile.findOne = originalOrgFindOne;
    PendingUser.deleteOne = originalPendingDelete;
    PendingUser.create = originalPendingCreate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(createdPendingOrg.email, "org@example.com");
  assert.equal(createdPendingOrg.userName, "charityorg");
  assert.equal(createdPendingOrg.accountType, "organization");
  assert.equal(createdPendingOrg.profileData.orgName, "Charity Org");
  assert.deepEqual(userQueries, [{ email: "org@example.com" }, { userName: "charityorg" }]);
  assert.deepEqual(orgQueries, [{ orgName: "Charity Org" }]);
});

test("createOrganizationProfile rejects duplicate organization name", async () => {
  const originalFindOne = User.findOne;
  const originalOrgFindOne = OrganizationProfile.findOne;

  User.findOne = async () => null;
  OrganizationProfile.findOne = async () => ({ _id: "existing-org" });

  const req = {
    body: {
      orgName: "Charity Org",
      email: "org@example.com",
      password: "Pass1234",
      phone: "+1 555 000 1111",
      address: "123 Main Street",
      website: "https://example.org",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => createOrganizationProfile(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "ORGNAME_ALREADY_IN_USE");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
    OrganizationProfile.findOne = originalOrgFindOne;
  }
});