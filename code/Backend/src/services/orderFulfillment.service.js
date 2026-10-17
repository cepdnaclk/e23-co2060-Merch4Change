import mongoose from "mongoose";
import Brand from "../models/Brand.js";
import CoinTransaction from "../models/CoinTransaction.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Fulfills an order once payment has been confirmed.
 * Implements idempotency: if order is already paid, skips duplicate processing.
 *
 * @param {string|mongoose.Types.ObjectId} orderId
 * @param {Object} [details]
 * @param {string} [details.paymentIntentId]
 * @param {string} [details.paymentGateway]
 * @returns {Promise<Order|null>}
 */
export const fulfillPaidOrder = async (orderId, details = {}) => {
  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) {
    logError("Order fulfillment skipped: Order not found", null, { orderId });
    return null;
  }

  // Idempotency check: don't double credit coins or double notify
  if (existingOrder.status === "paid") {
    logInfo("Order fulfillment skipped: Already marked as paid", { orderId });
    return existingOrder;
  }

  const updateFields = {
    status: "paid",
    paymentStatus: "paid",
  };
  if (details.paymentGateway) {
    updateFields.paymentGateway = details.paymentGateway;
  }
  if (details.paymentIntentId) {
    updateFields.stripePaymentIntentId = details.paymentIntentId;
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: "paid" } },
    { $set: updateFields },
    { new: true },
  );

  if (!order) {
    logInfo("Order fulfillment skipped: Concurrent fulfillment already completed", { orderId });
    return Order.findById(orderId);
  }

  // Credit buyer coins
  if (order.coinsEarned > 0 && order.userId) {
    await User.findByIdAndUpdate(order.userId, {
      $inc: { coinBalance: order.coinsEarned },
    });

    await CoinTransaction.create({
      userId: order.userId,
      type: "earn",
      amount: order.coinsEarned,
      refType: "order",
      refId: order._id,
    });
  }

  // Fetch buyer info for notifications
  const buyer = await User.findById(order.userId);
  const buyerName =
    buyer?.firstName && buyer?.lastName
      ? `${buyer.firstName} ${buyer.lastName}`.trim()
      : buyer?.firstName || buyer?.userName || "A customer";

  // Notify buyer
  if (order.userId && mongoose.Types.ObjectId.isValid(order.userId)) {
    await Notification.create({
      userId: order.userId,
      type: "order",
      message: `Your order for $${order.totalAmount.toFixed(2)} has been successfully placed! Order ID: #${order._id.toString().substring(18)}`,
      isRead: false,
    });
  }

  // Update seller stats & notify sellers
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    let sellerUserId = product.ownerUserId;
    if (!sellerUserId && product.brandId) {
      const brand = await Brand.findById(product.brandId);
      sellerUserId = brand?.ownerUserId;
    }

    if (sellerUserId && mongoose.Types.ObjectId.isValid(sellerUserId)) {
      await User.findByIdAndUpdate(sellerUserId, {
        $inc: { salesCount: Number(item.quantity) || 1 },
      });

      await Notification.create({
        userId: sellerUserId,
        type: "order",
        message: `You have received a new order for "${product.name}" (Qty: ${item.quantity}) from ${buyerName}!`,
        isRead: false,
      });
    }
  }

  logInfo("Order fulfilled successfully", {
    orderId: order._id,
    coinsEarned: order.coinsEarned,
  });

  return order;
};

/**
 * Cancels a pending order and rolls back inventory stock.
 *
 * @param {string|mongoose.Types.ObjectId} orderId
 * @param {string} [reason="payment_failed"]
 * @returns {Promise<Order|null>}
 */
export const cancelFailedOrder = async (orderId, reason = "payment_failed") => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: "pending" },
    {
      $set: {
        status: "cancelled",
        paymentStatus: "failed",
      },
    },
    { new: true },
  );

  if (!order) {
    return Order.findById(orderId);
  }

  // Restore inventory once after atomic status transition succeeds
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }

  logInfo("Order cancelled and inventory restored", {
    orderId: order._id,
    reason,
  });

  return order;
};
