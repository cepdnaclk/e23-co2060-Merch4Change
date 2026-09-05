import { successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import CoinTransaction from "../models/CoinTransaction.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import AppError from "../utils/appError.js";

export const me = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Current user fetched successfully.", {
    user: req.user,
  });
});

export const getMyCoins = asyncHandler(async (req, res) => {
  const transactions = await CoinTransaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  return successResponse(res, 200, "Coin data fetched successfully.", {
    coinBalance: req.user.coinBalance ?? 0,
    transactions,
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  // Only allow certain fields to be updated
  const allowed = ["firstName", "lastName", "userName", "email", "profileBio", "userLink"];
  const updateData = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, k)) updateData[k] = payload[k];
  }

  // If username or email is changing, ensure uniqueness
  if (updateData.userName && updateData.userName !== req.user.userName) {
    const exists = await User.findOne({ userName: updateData.userName, _id: { $ne: req.user._id } });
    if (exists) throw new AppError("Username already taken.", 409, "USERNAME_TAKEN");
  }

  if (updateData.email && updateData.email !== req.user.email) {
    const exists = await User.findOne({ email: updateData.email.toLowerCase(), _id: { $ne: req.user._id } });
    if (exists) throw new AppError("Email already in use.", 409, "EMAIL_TAKEN");
    updateData.email = updateData.email.toLowerCase();
  }

  Object.assign(req.user, updateData);
  await req.user.save();

  return successResponse(res, 200, "Profile updated successfully.", {
    user: req.user,
  });
});

export const getProfileByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ userName: username });
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  // Check if current user is following this user
  let isFollowing = false;
  if (req.user) {
    const followRecord = await Follow.findOne({
      followerId: req.user._id,
      followingId: user._id,
    });
    isFollowing = !!followRecord;
  }

  return successResponse(res, 200, "User profile fetched successfully.", {
    user,
    isFollowing,
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const userToFollow = await User.findOne({ userName: username });
  if (!userToFollow) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (String(userToFollow._id) === String(req.user._id)) {
    throw new AppError("You cannot follow yourself.", 400, "SELF_FOLLOW_FORBIDDEN");
  }

  // Find or create follow record
  const existingFollow = await Follow.findOne({
    followerId: req.user._id,
    followingId: userToFollow._id,
  });

  if (existingFollow) {
    return successResponse(res, 200, "Already following this user.", { isFollowing: true });
  }

  await Follow.create({
    followerId: req.user._id,
    followingId: userToFollow._id,
  });

  if (mongoose.Types.ObjectId.isValid(userToFollow._id)) {
    const followerName = req.user.firstName && req.user.lastName
      ? `${req.user.firstName} ${req.user.lastName}`.trim()
      : (req.user.firstName || req.user.userName || "Someone");
    await Notification.create({
      userId: userToFollow._id,
      type: "follow",
      message: `${followerName} started following you.`,
      isRead: false,
    });
  }

  return successResponse(res, 200, "Successfully followed user.", { isFollowing: true });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const userToUnfollow = await User.findOne({ userName: username });
  if (!userToUnfollow) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  await Follow.findOneAndDelete({
    followerId: req.user._id,
    followingId: userToUnfollow._id,
  });

  return successResponse(res, 200, "Successfully unfollowed user.", { isFollowing: false });
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  // Find users the current user is already following
  const followingRecords = await Follow.find({ followerId: req.user._id }).select("followingId");
  const followingIds = followingRecords.map(record => record.followingId);

  // Add the current user to the exclusion list
  followingIds.push(req.user._id);

  // Fetch up to 5 random users not in the exclusion list
  const suggestedUsers = await User.aggregate([
    { $match: { _id: { $nin: followingIds } } },
    { $sample: { size: 5 } },
    { $project: { password: 0, email: 0, resetPasswordToken: 0, resetPasswordExpires: 0, accountType: 0 } }
  ]);

  return successResponse(res, 200, "Suggested users fetched successfully.", {
    suggestedUsers
  });
});

export const getTopCustomers = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const targetUser = await User.findOne({ userName: username });
  if (!targetUser) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  // 1. Find brands owned by this user
  const brand = await Brand.findOne({ ownerUserId: targetUser._id });

  // 2. Find all products associated with this seller/brand
  const productFilter = {
    $or: [{ ownerUserId: targetUser._id }],
  };
  if (brand) {
    productFilter.$or.push({ brandId: brand._id });
  }

  const products = await Product.find(productFilter).select("_id price name");
  if (!products || products.length === 0) {
    return successResponse(res, 200, "Top customers fetched successfully.", {
      seller: {
        userName: targetUser.userName,
        name: targetUser.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser.userName,
      },
      topCustomers: [],
      totalCustomersCount: 0,
      totalRevenueFromCustomers: 0,
    });
  }

  const productIds = products.map((p) => p._id);
  const productIdSet = new Set(productIds.map((id) => id.toString()));

  // 3. Find paid orders containing these products
  const orders = await Order.find({
    status: "paid",
    "items.productId": { $in: productIds },
  })
    .select("userId items totalAmount createdAt")
    .sort({ createdAt: -1 });

  // 4. Group by customer
  const customerMap = new Map();

  for (const order of orders) {
    if (!order.userId) continue;
    const customerIdStr = order.userId.toString();

    // Sum purchases for this seller's specific products
    let sellerOrderSpent = 0;
    let sellerItemQty = 0;

    for (const item of order.items || []) {
      if (item.productId && productIdSet.has(item.productId.toString())) {
        const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
        sellerOrderSpent += itemTotal;
        sellerItemQty += item.quantity || 1;
      }
    }

    if (sellerOrderSpent <= 0 && sellerItemQty <= 0) continue;

    if (!customerMap.has(customerIdStr)) {
      customerMap.set(customerIdStr, {
        userId: order.userId,
        totalSpent: sellerOrderSpent,
        itemsCount: sellerItemQty,
        ordersCount: 1,
        lastPurchasedAt: order.createdAt,
      });
    } else {
      const stats = customerMap.get(customerIdStr);
      stats.totalSpent += sellerOrderSpent;
      stats.itemsCount += sellerItemQty;
      stats.ordersCount += 1;
      if (order.createdAt > stats.lastPurchasedAt) {
        stats.lastPurchasedAt = order.createdAt;
      }
    }
  }

  // 5. Populate user profiles for customers
  const customerIds = Array.from(customerMap.keys());
  const customerUsers = await User.find({ _id: { $in: customerIds } })
    .select("firstName lastName userName profileImageUrl isVerified")
    .lean();

  const userMap = new Map(customerUsers.map((u) => [u._id.toString(), u]));

  const getTier = (rank) => {
    if (rank === 1) return { title: "Champion Patron", icon: "🥇", color: "#D97706", bg: "#FEF3C7" };
    if (rank === 2) return { title: "Elite Supporter", icon: "🥈", color: "#4B5563", bg: "#F3F4F6" };
    if (rank === 3) return { title: "Dedicated Buyer", icon: "🥉", color: "#92400E", bg: "#FEF3C7" };
    return { title: "Loyal Customer", icon: "🎖️", color: "#0D6B5E", bg: "#E1F5EE" };
  };

  const sortedCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .map((item, index) => {
      const u = userMap.get(item.userId.toString());
      if (!u) return null;
      const rank = index + 1;
      const tier = getTier(rank);
      const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}`.trim() : u.userName;

      return {
        rank,
        userId: u._id,
        userName: u.userName,
        name,
        profileImageUrl: u.profileImageUrl || "",
        isVerified: u.isVerified || false,
        totalSpent: item.totalSpent,
        itemsCount: item.itemsCount,
        ordersCount: item.ordersCount,
        impactCoinsGenerated: Math.floor(item.totalSpent / 10),
        lastPurchasedAt: item.lastPurchasedAt,
        tier: tier.title,
        tierIcon: tier.icon,
        tierColor: tier.color,
        tierBg: tier.bg,
      };
    })
    .filter(Boolean);

  const totalRevenue = sortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  return successResponse(res, 200, "Top customers fetched successfully.", {
    seller: {
      userName: targetUser.userName,
      name: targetUser.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser.userName,
    },
    topCustomers: sortedCustomers,
    totalCustomersCount: sortedCustomers.length,
    totalRevenueFromCustomers: totalRevenue,
  });
});