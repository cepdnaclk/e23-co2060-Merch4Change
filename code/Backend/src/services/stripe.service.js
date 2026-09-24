import Stripe from "stripe";
import env from "../config/env.js";
import AppError from "../utils/appError.js";

let stripeClient = null;

export const getStripeClient = () => {
  if (!stripeClient) {
    if (!env.stripeSecretKey) {
      throw new AppError(
        "Stripe secret key is not configured. Please set STRIPE_SECRET_KEY in your environment.",
        500,
        "PAYMENT_CONFIG_ERROR",
      );
    }
    stripeClient = new Stripe(env.stripeSecretKey);
  }
  return stripeClient;
};

/**
 * Creates a Stripe Checkout Session for an order.
 * @param {Object} params
 * @param {string} params.orderId - The database ID of the Order
 * @param {Array} params.items - Array of order items ({ titleSnapshot, unitPrice, quantity })
 * @param {string} [params.customerEmail] - Customer's email
 * @param {string} [params.successUrl] - Custom success redirect URL
 * @param {string} [params.cancelUrl] - Custom cancel redirect URL
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const createCheckoutSession = async ({
  orderId,
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}) => {
  const stripe = getStripeClient();

  const lineItems = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.titleSnapshot || "Merchandise Item",
      },
      unit_amount: Math.round(Number(item.unitPrice) * 100),
    },
    quantity: Number(item.quantity) || 1,
  }));

  const defaultSuccessUrl = `${env.frontendUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`;
  const defaultCancelUrl = `${env.frontendUrl}/orders/cancel?order_id=${orderId}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: customerEmail || undefined,
    client_reference_id: orderId.toString(),
    metadata: {
      orderId: orderId.toString(),
    },
    success_url: successUrl || defaultSuccessUrl,
    cancel_url: cancelUrl || defaultCancelUrl,
  });

  return session;
};

/**
 * Validates and constructs a Stripe webhook event from raw payload and signature.
 * @param {Buffer|string} rawBody
 * @param {string} signature
 * @returns {Stripe.Event}
 */
export const constructWebhookEvent = (rawBody, signature) => {
  const stripe = getStripeClient();
  if (!env.stripeWebhookSecret) {
    throw new AppError(
      "Stripe webhook secret is not configured. Please set STRIPE_WEBHOOK_SECRET in your environment.",
      500,
      "PAYMENT_CONFIG_ERROR",
    );
  }
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret,
  );
};

/**
 * Retrieves a checkout session by session ID.
 * @param {string} sessionId
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export const retrieveCheckoutSession = async (sessionId) => {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId);
};
