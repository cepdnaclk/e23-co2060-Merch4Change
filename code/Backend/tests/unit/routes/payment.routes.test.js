import test from "node:test";
import assert from "node:assert/strict";

import app from "../../../src/app.js";

const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
};

// Stripe webhook IP used in tests so the IP filter does not block the request,
// allowing the signature validation test to run.
const TEST_STRIPE_IP = "52.63.0.0";

test("POST /api/v1/payments/webhook rejects requests missing stripe-signature header", async () => {
  const server = await startServer();

  try {
    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/payments/webhook`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": TEST_STRIPE_IP,
        },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      },
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
    assert.equal(payload.error.code, "SIGNATURE_MISSING");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("POST /api/v1/payments/webhook rejects non-Stripe IPs", async () => {
  const server = await startServer();

  try {
    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/v1/payments/webhook`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ type: "checkout.session.completed" }),
      },
    );

    assert.equal(response.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
