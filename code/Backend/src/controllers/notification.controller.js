import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import AppError from "../utils/appError.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  return successResponse(res, 200, "Notifications fetched successfully.", {
    notifications,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid notification ID.", 400, "VALIDATION_ERROR");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(
      "Notification not found.",
      404,
      "NOTIFICATION_NOT_FOUND",
    );
  }

  return successResponse(
    res,
    200,
    "Notification marked as read successfully.",
    {
      notification,
    },
  );
});
