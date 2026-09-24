import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];

for (const key of requiredInProduction) {
  if (process.env.NODE_ENV === "production" && !process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendUrl = rawFrontendUrl.split(",")[0].trim().replace(/\/+$/, "");
const allowedOrigins = rawFrontendUrl
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  frontendUrl,
  allowedOrigins,
  mongodbUri: process.env.MONGODB_URI || process.env.MONGO_URI || "",
  jwtSecret:
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "dev-refresh-secret-change-me"),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "60d",
  backendLogMaxSizeBytes:
    Number(process.env.BACKEND_LOG_MAX_SIZE_BYTES) || 5242880,
  apiRateLimitWindowMs:
    Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  apiRateLimitMax: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  authRateLimitWindowMs:
    Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

export default env;
