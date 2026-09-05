import test from "node:test";
import assert from "node:assert/strict";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createMockResponse } from "../helpers/http.js";
import PendingUser from "../../../src/models/PendingUser.js";
import User from "../../../src/models/User.js";
import { login, register } from "../../../src/controllers/auth.controller.js";

test("register creates pending user and dispatches OTP", async () => {
  const originalHash = bcrypt.hash;
  const originalFindOne = User.findOne;
  const originalDeleteOne = PendingUser.deleteOne;
  const originalCreate = PendingUser.create;

  let createdPendingUser;

  bcrypt.hash = async () => "hashed-pass";
  User.findOne = async () => null;
  PendingUser.deleteOne = async () => ({ deletedCount: 1 });
  PendingUser.create = async (payload) => {
    createdPendingUser = payload;
    return { _id: "u1", ...payload };
  };

  const req = {
    body: {
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "JANE@EXAMPLE.COM",
      password: "Pass1234",
      accountType: "user",
    },
  };
  const res = createMockResponse();

  try {
    await register(req, res);
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
});

test("register rejects duplicate email", async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({ _id: "existing" });

  const req = {
    body: {
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "jane@example.com",
      password: "Pass1234",
      accountType: "user",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => register(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "EMAIL_ALREADY_IN_USE");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
  }
});

test("login returns INVALID_CREDENTIALS when user does not exist", async () => {
  const originalFindOne = User.findOne;
  User.findOne = () => ({
    select: async () => null,
  });

  const req = {
    body: {
      email: "missing@example.com",
      password: "Pass1234",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => login(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "INVALID_CREDENTIALS");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
  }
});

test("login returns INVALID_CREDENTIALS when password mismatch", async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;

  User.findOne = () => ({
    select: async () => ({
      _id: "u1",
      password: "hash",
      accountType: "individual",
      isActive: true,
    }),
  });
  bcrypt.compare = async () => false;

  const req = {
    body: {
      email: "jane@example.com",
      password: "wrong",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => login(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "INVALID_CREDENTIALS");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
  }
});

test("login rejects unsupported account type", async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;

  User.findOne = () => ({
    select: async () => ({
      _id: "u1",
      password: "hash",
      accountType: "admin",
      isActive: true,
    }),
  });
  bcrypt.compare = async () => true;

  const req = {
    body: {
      email: "jane@example.com",
      password: "Pass1234",
    },
  };
  const res = createMockResponse();

  try {
    await assert.rejects(
      () => login(req, res),
      (err) => {
        assert.equal(err.name, "AppError");
        assert.equal(err.code, "INVALID_ACCOUNT_TYPE");
        return true;
      }
    );
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
  }
});

test("login returns token payload when credentials are valid", async () => {
  const originalFindOne = User.findOne;
  const originalCompare = bcrypt.compare;
  const originalSign = jwt.sign;

  User.findOne = () => ({
    select: async () => ({
      _id: "u1",
      userName: "Jane",
      email: "jane@example.com",
      password: "hash",
      accountType: "organization",
      isActive: true,
      coinBalance: 120,
    }),
  });
  bcrypt.compare = async () => true;
  jwt.sign = () => "jwt-token";

  const req = {
    body: {
      email: "jane@example.com",
      password: "Pass1234",
    },
  };
  const res = createMockResponse();

  try {
    await login(req, res);
  } finally {
    User.findOne = originalFindOne;
    bcrypt.compare = originalCompare;
    jwt.sign = originalSign;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.data.accessToken, "jwt-token");
  assert.equal(res.payload.data.loginType, "organization");
  assert.equal(res.cookies.refreshToken?.value, "jwt-token");
});
