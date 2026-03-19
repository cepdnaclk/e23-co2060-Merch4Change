import test from "node:test";
import assert from "node:assert/strict";

import { validateLoginBody, validateRegisterBody } from "../../../src/validators/auth.validator.js";

test("validateRegisterBody normalizes and accepts valid payload", () => {
  const result = validateRegisterBody({
    fullName: "  Jane Doe  ",
    email: "  JANE@EXAMPLE.COM  ",
    password: "pass1234",
    confirmPassword: "pass1234",
    accountType: " user ",
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.value.fullName, "Jane Doe");
  assert.equal(result.value.email, "jane@example.com");
  assert.equal(result.value.accountType, "individual");
});

test("validateRegisterBody returns validation errors", () => {
  const result = validateRegisterBody({
    fullName: "A",
    email: "bad",
    password: "short",
    confirmPassword: "different",
    accountType: "admin",
  });

  assert.equal(result.errors.length > 0, true);
  assert.equal(result.errors.some((message) => message.includes("fullName must be between 2 and 120")), true);
  assert.equal(result.errors.some((message) => message.includes("email must be a valid")), true);
  assert.equal(result.errors.some((message) => message.includes("password must be at least 8")), true);
  assert.equal(result.errors.some((message) => message.includes("confirmPassword must match")), true);
  assert.equal(result.errors.some((message) => message.includes("accountType must be either")), true);
});

test("validateLoginBody normalizes valid login payload", () => {
  const result = validateLoginBody({
    email: "  USER@Example.com ",
    password: "secret",
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.value.email, "user@example.com");
});

test("validateLoginBody catches missing credentials", () => {
  const result = validateLoginBody({
    email: "not-an-email",
  });

  assert.equal(result.errors.some((message) => message.includes("email must be a valid")), true);
  assert.equal(result.errors.some((message) => message.includes("password is required")), true);
});