import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Order from "../../src/models/Order.js";

describe("Order Model titleSnapshot Schema Validation", () => {
  it("validates an order item containing titleSnapshot and unitPrice successfully", () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const dummyProductId = new mongoose.Types.ObjectId();

    const order = new Order({
      userId: dummyUserId,
      totalAmount: 3200,
      currency: "USD",
      status: "paid",
      coinsEarned: 0,
      paymentStatus: "paid",
      paymentGateway: "stripe",
      items: [
        {
          productId: dummyProductId,
          titleSnapshot: "Test Organic Hoodie",
          quantity: 1,
          unitPrice: 3200,
        },
      ],
    });

    const validationError = order.validateSync();
    assert.equal(validationError, undefined);
    assert.equal(order.items[0].titleSnapshot, "Test Organic Hoodie");
    assert.equal(order.items[0].unitPrice, 3200);
  });

  it("fails validation when titleSnapshot is missing from order items", () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const dummyProductId = new mongoose.Types.ObjectId();

    const order = new Order({
      userId: dummyUserId,
      totalAmount: 3200,
      currency: "USD",
      status: "paid",
      coinsEarned: 0,
      items: [
        {
          productId: dummyProductId,
          quantity: 1,
          unitPrice: 3200,
        },
      ],
    });

    const validationError = order.validateSync();
    assert.ok(validationError, "Expected validation error but none was thrown");
    assert.ok(
      validationError.errors["items.0.titleSnapshot"],
      "Expected error on items.0.titleSnapshot"
    );
  });

  it("fails validation when unitPrice is negative", () => {
    const dummyUserId = new mongoose.Types.ObjectId();
    const dummyProductId = new mongoose.Types.ObjectId();

    const order = new Order({
      userId: dummyUserId,
      totalAmount: 3200,
      currency: "USD",
      status: "paid",
      coinsEarned: 0,
      items: [
        {
          productId: dummyProductId,
          titleSnapshot: "Test Organic Hoodie",
          quantity: 1,
          unitPrice: -50,
        },
      ],
    });

    const validationError = order.validateSync();
    assert.ok(validationError, "Expected validation error for negative unitPrice");
    assert.ok(
      validationError.errors["items.0.unitPrice"],
      "Expected error on items.0.unitPrice"
    );
  });
});