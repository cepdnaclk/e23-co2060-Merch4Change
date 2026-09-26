import User from "../models/User.js";
import Order from "../models/Order.js";
import {
  constructWebhookEvent,
  retrieveCheckoutSession,
} from "../services/stripe.service.js";
import {
  fulfillPaidOrder,
  cancelFailedOrder,
} from "../services/orderFulfillment.service.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { logError, logInfo } from "../utils/logger.js";

/**
 * POST /api/v1/payments/webhook
 * Handles incoming events from Stripe
 */
export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    throw new AppError("Stripe signature header is missing.", 400, "SIGNATURE_MISSING");
  }

  const rawBody = req.rawBody || req.body;
  let event;

  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    logError("Stripe webhook signature verification failed", err);
    throw new AppError(`Webhook Error: ${err.message}`, 400, "INVALID_WEBHOOK_SIGNATURE");
  }

  logInfo("Stripe webhook received", { type: event.type, id: event.id });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (session.metadata?.type === "topup") {
        const userId = session.metadata.userId;
        const amount = Number(session.metadata.amount);
        if (userId && amount) {
          await User.findByIdAndUpdate(userId, { $inc: { fiatBalance: amount } });
        }
      } else if (orderId) {
        await fulfillPaidOrder(orderId, {
          paymentIntentId: session.payment_intent,
          paymentGateway: "stripe",
        });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (orderId) {
        await cancelFailedOrder(orderId, "session_expired");
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await cancelFailedOrder(orderId, "payment_failed");
      }
      break;
    }

    default:
      logInfo(`Unhandled Stripe event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
});

/**
 * GET /api/v1/payments/verify-session/:sessionId
 * Checks status of checkout session and confirms fulfillment if needed
 */
export const verifyPaymentSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new AppError("Session ID is required.", 400, "VALIDATION_ERROR");
  }

  let order = await Order.findOne({ stripeSessionId: sessionId });

  // If order is still pending, check live session status from Stripe directly
  if (order && order.status === "pending") {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      if (session && session.payment_status === "paid") {
        order = await fulfillPaidOrder(order._id, {
          paymentIntentId: session.payment_intent,
          paymentGateway: "stripe",
        });
      }
    } catch (err) {
      logError("Failed to retrieve live session status from Stripe", err, { sessionId });
    }
  }

  if (!order) {
    throw new AppError("Order not found for this checkout session.", 404, "ORDER_NOT_FOUND");
  }

  return successResponse(res, 200, "Session status retrieved.", {
    order,
    status: order.status,
    paymentStatus: order.paymentStatus,
    coinsEarned: order.coinsEarned,
  });
});
import env from "../config/env.js";
import { getStripeClient } from "../services/stripe.service.js";

export const createTopupSession = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    throw new AppError("Invalid topup amount", 400, "VALIDATION_ERROR");
  }

  const stripe = getStripeClient();
  const successUrl = `${env.frontendUrl}/topup/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${env.frontendUrl}/topup/cancel`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Auction Top-up" },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    metadata: {
      type: "topup",
      userId: req.user._id.toString(),
      amount: amount.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return successResponse(res, 200, "Topup session created", {
    checkoutUrl: session.url,
  });
});
