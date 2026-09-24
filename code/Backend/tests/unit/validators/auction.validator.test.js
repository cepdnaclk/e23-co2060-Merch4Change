import test from "node:test";
import assert from "node:assert/strict";

import {
  validateTime,
  isStarted,
} from "../../../src/validators/auction.validator.js";

test("validateTime accepts future start time and subsequent end time", () => {
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  assert.equal(validateTime(startTime, endTime), true);
});

test("validateTime accepts immediate start time within 5-minute past buffer", () => {
  const now = new Date();
  const startTime = new Date(now.getTime() - 60 * 1000).toISOString(); // 1 min ago
  const endTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  assert.equal(validateTime(startTime, endTime), true);
});

test("validateTime rejects invalid date strings and past end times", () => {
  assert.equal(validateTime("invalid", "invalid"), false);

  const now = new Date();
  const startTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 mins ago (outside buffer)
  const endTime = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  assert.equal(validateTime(startTime, endTime), false);
});

test("isStarted correctly distinguishes started vs scheduled auctions", () => {
  const now = new Date();
  const past = new Date(now.getTime() - 10 * 1000).toISOString();
  const future = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

  assert.equal(isStarted(past), true);
  assert.equal(isStarted(future), false);
  assert.equal(isStarted("invalid-date"), false);
});
