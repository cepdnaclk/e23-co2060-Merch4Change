import test from "node:test";
import assert from "node:assert/strict";

import jwt from "jsonwebtoken";
import env from "../../../src/config/env.js";

import { nextTick } from "../helpers/http.js";
import User from "../../../src/models/User.js";
import protect from "../../../src/middlewares/auth.js";

test("protect rejects missing bearer token", async () => {
  const req = { headers: {} };
  let nextArg;

  protect(req, {}, (error) => {
    nextArg = error;
  });
  await nextTick();

  assert.equal(nextArg.name, "AppError");
  assert.equal(nextArg.code, "TOKEN_MISSING");
});

test("protect attaches user and calls next for valid token", async () => {
  const originalVerify = jwt.verify;
  const originalFindById = User.findById;

  jwt.verify = () => ({ userId: "user-1" });
  User.findById = () => ({
    select: async () => ({ _id: "user-1", fullName: "Jane", isActive: true }),
  });

  const req = {
    headers: {
      authorization: "Bearer valid.token",
    },
  };
  let nextArg;

  try {
    protect(req, {}, (error) => {
      nextArg = error;
    });
    await nextTick();
  } finally {
    jwt.verify = originalVerify;
    User.findById = originalFindById;
  }

  assert.equal(nextArg, undefined);
  assert.deepEqual(req.user, { _id: "user-1", fullName: "Jane", isActive: true });
});

test("protect rejects the same unexpired token after account suspension", async (t) => {
  const token = jwt.sign({ userId: "user-1" }, env.jwtSecret, { expiresIn: "5m" });
  let isActive = true;
  const lookup = t.mock.method(User, "findById", (id) => {
    assert.equal(id, "user-1");
    return { select: async () => ({ _id: id, isActive }) };
  });
  const activeRequest = { headers: { authorization: `Bearer ${token}` } };
  const activeNext = t.mock.fn();

  await protect(activeRequest, {}, activeNext);
  assert.equal(activeNext.mock.callCount(), 1);
  assert.equal(activeNext.mock.calls[0].arguments.length, 0);
  assert.equal(activeRequest.user.isActive, true);

  isActive = false;
  const suspendedRequest = { headers: { authorization: `Bearer ${token}` } };
  const suspendedNext = t.mock.fn();

  await protect(suspendedRequest, {}, suspendedNext);
  assert.equal(lookup.mock.callCount(), 2);
  assert.equal(suspendedNext.mock.callCount(), 1);
  const [error] = suspendedNext.mock.calls[0].arguments;
  assert.equal(error.statusCode, 403);
  assert.equal(error.code, "ACCOUNT_INACTIVE");
  assert.equal(suspendedRequest.user, undefined);
});

test("protect returns INVALID_TOKEN when verification fails", async () => {
  const originalVerify = jwt.verify;
  jwt.verify = () => {
    throw new Error("jwt malformed");
  };

  const req = {
    headers: {
      authorization: "Bearer broken.token",
    },
  };
  let nextArg;

  try {
    protect(req, {}, (error) => {
      nextArg = error;
    });
    await nextTick();
  } finally {
    jwt.verify = originalVerify;
  }

  assert.equal(nextArg.name, "AppError");
  assert.equal(nextArg.code, "INVALID_TOKEN");
});
