import Brand from "../models/Brand.js";
import CoinTransaction from "../models/CoinTransaction.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";
import env from "../config/env.js";
import { createCheckoutSession } from "../services/stripe.service.js";
import { fulfillPaidOrder } from "../services/orderFulfillment.service.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

const resolveBrandForUser = async (user) => {
  const existing = await Brand.findOne({ ownerUserId: user._id });
  if (existing) {
    return existing;
  }

  const label =
    (user.userName && String(user.userName).trim()) ||
    user.firstName ||
    "Store";
  const brandName =
    label.length >= 2 ? label : `Store ${String(user._id).slice(-8)}`;

  return Brand.create({
    ownerUserId: user._id,
    brandName,
  });
};

const ensureProductOwnership = async (product, user) => {
  if (product.ownerUserId && String(product.ownerUserId) === String(user._id)) {
    return;
  }
  const brand = await Brand.findById(product.brandId);
  if (!brand || String(brand.ownerUserId) !== String(user._id)) {
    throw new AppError(
      "You do not have permission to manage this product.",
      403,
      "FORBIDDEN",
    );
  }
};

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate(
    "brandId",
    "brandName logoUrl slug",
  );

  return successResponse(res, 200, "Products fetched successfully.", {
    products,
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
    .populate("brandId", "brandName logoUrl slug")
    .populate("ownerUserId", "firstName lastName userName profileImageUrl avatarUrl role isVerified");

  if (!product) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  return successResponse(res, 200, "Product fetched successfully.", {
    product,
  });
});

const ALLOWED_PRODUCT_FIELDS = [
  "name",
  "description",
  "price",
  "stock",
  "currency",
  "images",
  "imageUrl",
  "isPublished",
  "isLimitedEdition",
];

const pickProductFields = (source = {}) => {
  const clean = {};
  for (const field of ALLOWED_PRODUCT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      clean[field] = source[field];
    }
  }
  return clean;
};

export const createProduct = asyncHandler(async (req, res) => {
  const brand = await resolveBrandForUser(req.user);
  const cleanData = pickProductFields(req.body);
  const product = await Product.create({
    ...cleanData,
    brandId: brand._id,
    ownerUserId: req.user._id,
  });

  return successResponse(res, 201, "Product created successfully.", {
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  await ensureProductOwnership(product, req.user);

  const cleanData = pickProductFields(req.body);
  Object.assign(product, cleanData);
  const updatedProduct = await product.save();

  return successResponse(res, 200, "Product updated successfully.", {
    product: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  await ensureProductOwnership(product, req.user);

  await product.deleteOne();

  return successResponse(res, 200, "Product deleted successfully.", {
    productId: req.params.productId,
  });
});

export const checkout = asyncHandler(async (req, res) => {
  const requestedItems = req.body.items;
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    throw new AppError("Items are required for checkout.", 400, "VALIDATION_ERROR");
  }

  const orderItems = [];
  let totalAmount = 0;
  const decrementedProducts = [];

  try {
    for (const requestedItem of requestedItems) {
      const quantity = Number.parseInt(requestedItem.quantity, 10);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError("Item quantity must be a positive integer.", 400, "VALIDATION_ERROR");
      }

      // Atomically decrement stock only if product has enough stock
      const product = await Product.findOneAndUpdate(
        { _id: requestedItem.productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      );

      if (!product) {
        const existingProduct = await Product.findById(requestedItem.productId);
        if (!existingProduct) {
          throw new AppError(`Product not found for id ${requestedItem.productId}.`, 404, "PRODUCT_NOT_FOUND");
        }
        throw new AppError(`Insufficient stock for ${existingProduct.name}.`, 409, "INSUFFICIENT_STOCK");
      }

      decrementedProducts.push({ productId: product._id, quantity });

      const lineTotal = product.price * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: product._id,
        titleSnapshot: product.name,
        quantity,
        unitPrice: product.price,
      });
    }
  } catch (error) {
    // Roll back decremented stock if an error occurred during the loop
    for (const item of decrementedProducts) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    throw error;
  }

  const coinsEarned = Math.floor(totalAmount / 10);
  const isStripeConfigured = Boolean(env.stripeSecretKey);

  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    currency: "USD",
    totalAmount,
    status: isStripeConfigured ? "pending" : "paid",
    paymentStatus: isStripeConfigured ? "pending" : "paid",
    paymentGateway: isStripeConfigured ? "stripe" : "none",
    coinsEarned,
  });

  let checkoutUrl = null;
  let sessionId = null;

  if (isStripeConfigured) {
    try {
      const session = await createCheckoutSession({
        orderId: order._id,
        items: orderItems,
        customerEmail: req.user.email,
      });
      order.stripeSessionId = session.id;
      await order.save();
      checkoutUrl = session.url;
      sessionId = session.id;
    } catch (sessionError) {
      // Roll back order and restore stock if session creation fails
      for (const item of decrementedProducts) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
      await Order.findByIdAndDelete(order._id);
      throw sessionError;
    }
  } else {
    // Development fallback without Stripe key: immediately fulfill order
    await fulfillPaidOrder(order._id, { paymentGateway: "none" });
  }

  return successResponse(res, 201, "Checkout initialized successfully.", {
    order,
    items: order.items,
    checkoutUrl,
    sessionId,
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  return successResponse(res, 200, "Orders fetched successfully.", {
    orders,
  });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  if (String(order.userId) !== String(req.user._id)) {
    throw new AppError(
      "You do not have permission to view this order.",
      403,
      "FORBIDDEN",
    );
  }

  return successResponse(res, 200, "Order fetched successfully.", {
    order,
    items: order.items,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  if (!status) {
    throw new AppError("Status is required.", 400, "VALIDATION_ERROR");
  }

  const validStatuses = [
    "pending",
    "paid",
    "shipped",
    "completed",
    "cancelled",
    "refunded",
  ];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      400,
      "VALIDATION_ERROR",
    );
  }

  const order = await Order.findById(orderId).populate(
    "userId",
    "firstName lastName userName email",
  );
  if (!order) {
    throw new AppError("Order not found.", 404, "ORDER_NOT_FOUND");
  }

  let isSeller = false;
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const brand = await Brand.findById(product.brandId);
      if (brand && String(brand.ownerUserId) === String(req.user._id)) {
        isSeller = true;
        break;
      }
    }
  }

  const isBuyer = String(order.userId._id || order.userId) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError("You do not have permission to update this order.", 403, "FORBIDDEN");
  }

  // Restrict buyer capabilities: buyers may only cancel an order that is still pending or paid
  if (isBuyer && !isSeller && !isAdmin) {
    if (status !== "cancelled") {
      throw new AppError("Buyers are only permitted to cancel their orders.", 403, "FORBIDDEN");
    }
    if (!["pending", "paid"].includes(order.status)) {
      throw new AppError(
        "Orders that are already shipped, completed, or cancelled cannot be modified.",
        400,
        "INVALID_ORDER_STATE",
      );
    }
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  if (status === "completed" && oldStatus !== "completed") {
    // Notify buyer
    const buyerId = order.userId._id || order.userId;
    if (mongoose.Types.ObjectId.isValid(buyerId)) {
      await Notification.create({
        userId: buyerId,
        type: "order",
        message: `Your order #${order._id.toString().substring(18)} has been marked as completed!`,
        isRead: false,
      });
    }

    // Notify seller(s)
    const buyerName =
      order.userId.firstName && order.userId.lastName
        ? `${order.userId.firstName} ${order.userId.lastName}`.trim()
        : order.userId.firstName || order.userId.userName || "Customer";

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const brand = await Brand.findById(product.brandId);
        if (
          brand &&
          brand.ownerUserId &&
          mongoose.Types.ObjectId.isValid(brand.ownerUserId)
        ) {
          await Notification.create({
            userId: brand.ownerUserId,
            type: "order",
            message: `Order #${order._id.toString().substring(18)} for "${product.name}" with ${buyerName} has been successfully completed.`,
            isRead: false,
          });
        }
      }
    }
  }

  return successResponse(res, 200, "Order status updated successfully.", {
    order,
  });
});
