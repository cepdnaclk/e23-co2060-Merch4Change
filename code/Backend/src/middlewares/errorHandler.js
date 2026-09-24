import { errorResponse } from "../utils/apiResponse.js";
import { logError } from "../utils/logger.js";

// Field names shown to the user when a unique-index write collides.
const FRIENDLY_FIELD_NAMES = {
  userName: "username",
  email: "email address",
};

// Normalizes known Mongo/Mongoose errors into the {statusCode, code, message} shape
// the rest of the app already expects from AppError, so callers don't need to
// special-case them.
const normalizeKnownErrors = (err) => {
  // Duplicate key error, e.g. a user saving a userName/email that's already taken.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const friendlyField = FRIENDLY_FIELD_NAMES[field] || field || "value";
    return {
      statusCode: 409,
      errorCode: "DUPLICATE_FIELD",
      message: field
        ? `This ${friendlyField} is already taken. Please choose another.`
        : "This value is already in use. Please choose another.",
      details: field ? { field } : null,
    };
  }

  // Mongoose schema validation error (e.g. failed minlength/enum/required checks).
  if (err.name === "ValidationError" && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return {
      statusCode: 400,
      errorCode: "VALIDATION_ERROR",
      message: "Validation failed.",
      details,
    };
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  const known = normalizeKnownErrors(err);

  const statusCode = known?.statusCode || err.statusCode || 500;
  const errorCode = known?.errorCode || err.code || "INTERNAL_SERVER_ERROR";
  const message = known?.message || err.message || "Internal server error";
  const details = known?.details || err.details || null;

  logError("Request failed in error middleware.", err, {
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode,
      errorCode,
    },
  });

  if (res.headersSent) {
    return next(err);
  }

  return errorResponse(
    res,
    statusCode,
    message,
    errorCode,
    details,
    process.env.NODE_ENV === "development" ? err.stack : undefined,
  );
};

export default errorHandler;
