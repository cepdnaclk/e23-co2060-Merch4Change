import jwt from "jsonwebtoken";

import env from "../config/env.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new AppError(
      "Not authorized. Token is missing.",
      401,
      "TOKEN_MISSING",
    );
  }

  let user;
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
    user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new AppError("User not found for token.", 401, "USER_NOT_FOUND");
    }
  } catch (verifyError) {
    if (verifyError instanceof AppError) {
      throw verifyError;
    }
    throw new AppError("Not authorized. Invalid token.", 401, "INVALID_TOKEN");
  }

  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10,
    );
    if (decoded.iat && decoded.iat < changedTimestamp) {
      throw new AppError(
        "Password was changed recently. Please log in again.",
        401,
        "TOKEN_EXPIRED",
      );
    }
  }

  if (!user.isActive) {
    throw new AppError(
      "This account has been deactivated or suspended.",
      403,
      "ACCOUNT_INACTIVE",
    );
  }

  req.user = user;
  next();
});

export default protect;
