import { successResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import CoinTransaction from "../models/CoinTransaction.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Charity from "../models/Charity.js";
import Donation from "../models/Donation.js";
import Project from "../models/Project.js";
import mongoose from "mongoose";
import AppError from "../utils/appError.js";

export const me = asyncHandler(async (req, res) => {
  const userObj = req.user.toObject ? req.user.toObject() : { ...req.user };
  if (mongoose.connection?.readyState === 1 && (req.user.accountType === "organization" || req.user.role === "charity")) {
    const charity = await Charity.findOne({ ownerUserId: req.user._id });
    const possibleCharityIds = [req.user._id];
    if (charity?._id) possibleCharityIds.push(charity._id);
    const projectsCount = await Project.countDocuments({
      $or: [
        { charityId: { $in: possibleCharityIds } },
        ...(charity?._id ? [{ charityId: charity._id }] : []),
      ],
      status: { $in: ["active", "completed", "done", "ongoing"] },
    });
    userObj.projectsCount = projectsCount;
    if (charity) {
      userObj.charityId = charity._id;
      userObj.charity = charity;
    }
  }

  if (mongoose.connection?.readyState === 1 && req.user._id && mongoose.isValidObjectId(req.user._id)) {
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followingId: req.user._id }),
      Follow.countDocuments({ followerId: req.user._id }),
    ]);
    userObj.followersCount = followersCount;
    userObj.followingCount = followingCount;
  }

  return successResponse(res, 200, "Current user fetched successfully.", {
    user: userObj,
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

  const cleanParam = decodeURIComponent(username || "").trim();
  const alphanumericOnly = cleanParam.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fuzzyPattern = cleanParam.replace(/[-_]/g, "[\\s-_]*");
  const fuzzyRegex = new RegExp(`^${fuzzyPattern}$`, "i");

  let user = await User.findOne({
    $or: [
      { userName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
      { userName: { $regex: new RegExp(`^${alphanumericOnly}$`, "i") } },
      { userName: { $regex: fuzzyRegex } },
      { firstName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
      { firstName: { $regex: fuzzyRegex } },
      ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }] : []),
    ],
  });

  let charity = null;
  if (user) {
    charity = await Charity.findOne({ ownerUserId: user._id });
  } else {
    charity = await Charity.findOne({
      $or: [
        { publicName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
        { publicName: { $regex: fuzzyRegex } },
        ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }, { ownerUserId: cleanParam }] : []),
      ],
    }).populate("ownerUserId");

    if (charity?.ownerUserId) {
      user = typeof charity.ownerUserId === "object" ? charity.ownerUserId : await User.findById(charity.ownerUserId);
    }
  }

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

  const userObj = user.toObject ? user.toObject() : { ...user };
  if (userObj.accountType === "organization" || userObj.role === "charity" || charity) {
    const possibleCharityIds = [user._id];
    if (charity?._id) possibleCharityIds.push(charity._id);
    const projectsCount = await Project.countDocuments({
      $or: [
        { charityId: { $in: possibleCharityIds } },
        ...(charity?._id ? [{ charityId: charity._id }] : []),
      ],
      status: { $in: ["active", "completed", "done", "ongoing"] },
    });
    userObj.projectsCount = projectsCount;
  }

  if (charity) {
    userObj.charityId = charity._id;
    userObj.charity = charity;
  }

  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: user._id }),
    Follow.countDocuments({ followerId: user._id }),
  ]);
  userObj.followersCount = followersCount;
  userObj.followingCount = followingCount;

  return successResponse(res, 200, "User profile fetched successfully.", {
    user: userObj,
    isFollowing,
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const userToFollow = await User.findOne({
    $or: [
      { userName: { $regex: new RegExp(`^${username}$`, "i") } },
      ...(mongoose.isValidObjectId(username) ? [{ _id: username }] : []),
    ],
  });
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

  await User.findByIdAndUpdate(userToFollow._id, { $inc: { followersCount: 1 } });
  await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });

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

  const userToUnfollow = await User.findOne({
    $or: [
      { userName: { $regex: new RegExp(`^${username}$`, "i") } },
      ...(mongoose.isValidObjectId(username) ? [{ _id: username }] : []),
    ],
  });
  if (!userToUnfollow) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const deleted = await Follow.findOneAndDelete({
    followerId: req.user._id,
    followingId: userToUnfollow._id,
  });

  if (deleted) {
    await User.findByIdAndUpdate(userToUnfollow._id, { $inc: { followersCount: -1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
  }

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

  let targetUser = null;
  const cleanParam = decodeURIComponent(username || "").trim();
  const alphanumericOnly = cleanParam.toLowerCase().replace(/[^a-z0-9]/g, "");
  const fuzzyPattern = cleanParam.replace(/[-_]/g, "[\\s-_]*");
  const fuzzyRegex = new RegExp(`^${fuzzyPattern}$`, "i");

  if (username === "me" && req.user) {
    targetUser = req.user;
  } else if (username) {
    targetUser = await User.findOne({
      $or: [
        { userName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
        { userName: { $regex: new RegExp(`^${alphanumericOnly}$`, "i") } },
        { userName: { $regex: fuzzyRegex } },
        { firstName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
        { firstName: { $regex: fuzzyRegex } },
        ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }] : []),
      ],
    });
  }

  // If still not found by user, check if username directly matches a Charity publicName or ID
  let charity = null;
  if (targetUser) {
    charity = await Charity.findOne({
      $or: [
        { ownerUserId: targetUser._id },
        ...(mongoose.isValidObjectId(targetUser._id) ? [{ _id: targetUser._id }] : []),
      ],
    });
  } else if (username) {
    charity = await Charity.findOne({
      $or: [
        { publicName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
        { publicName: { $regex: fuzzyRegex } },
        ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }, { ownerUserId: cleanParam }] : []),
      ],
    }).populate("ownerUserId");

    if (charity?.ownerUserId) {
      targetUser = typeof charity.ownerUserId === "object" ? charity.ownerUserId : await User.findById(charity.ownerUserId);
    }
  }

  if (!targetUser && !charity) {
    throw new AppError("User or organization profile not found.", 404, "USER_NOT_FOUND");
  }

  const possibleCharityIds = [];
  if (charity?._id) possibleCharityIds.push(charity._id);
  if (targetUser?._id) possibleCharityIds.push(targetUser._id);
  if (charity?.ownerUserId) {
    const ownerId = typeof charity.ownerUserId === "object" ? charity.ownerUserId._id : charity.ownerUserId;
    if (ownerId) possibleCharityIds.push(ownerId);
  }
  if (mongoose.isValidObjectId(username)) {
    possibleCharityIds.push(new mongoose.Types.ObjectId(username));
  }

  // Query projects owned by this charity to catch all project-specific donations
  const projects = await Project.find({
    $or: [
      ...(possibleCharityIds.length > 0 ? [{ charityId: { $in: possibleCharityIds } }] : []),
      ...(targetUser?._id ? [{ charityId: targetUser._id }] : []),
      ...(charity?._id ? [{ charityId: charity._id }] : []),
    ],
  }).select("_id title charityId");

  const projectIds = projects.map((p) => p._id);

  const isCharity =
    targetUser?.accountType === "organization" ||
    targetUser?.role === "charity" ||
    Boolean(charity) ||
    projects.length > 0;

  // ── BRANCH A: CHARITY / NON-PROFIT (TOP DONORS) ──
  if (isCharity) {
    const donationConditions = [];
    if (possibleCharityIds.length > 0) {
      donationConditions.push({ charityId: { $in: possibleCharityIds } });
    }
    if (targetUser?._id) {
      donationConditions.push({ charityId: targetUser._id });
    }
    if (charity?._id) {
      donationConditions.push({ charityId: charity._id });
    }
    if (projectIds.length > 0) {
      donationConditions.push({ charityProjectId: { $in: projectIds } });
    }

    let donations = [];
    if (donationConditions.length > 0) {
      donations = await Donation.find({
        $or: donationConditions,
        status: { $nin: ["failed", "cancelled", "rejected"] },
      })
        .populate("donorUserId", "firstName lastName userName profileImageUrl isVerified")
        .populate("charityProjectId", "title")
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!donations || donations.length === 0) {
      return successResponse(res, 200, "Top donors fetched successfully.", {
        type: "donors",
        entity: {
          id: charity?._id || targetUser?._id,
          userName: targetUser?.userName || username,
          name: charity?.publicName || (targetUser?.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser?.userName || username),
          accountType: "organization",
          logoUrl: charity?.logoUrl || targetUser?.profileImageUrl || "",
          description: charity?.description || targetUser?.profileBio || "",
          category: charity?.category || "other",
          country: charity?.country || "",
          isVerified: true,
        },
        topSupporters: [],
        topDonors: [],
        topCustomers: [],
        donors: [],
        recentActivity: [],
        totalDonorsCount: 0,
        totalDonationsCount: 0,
        totalCoinsRaised: 0,
        totalImpactValue: 0,
      });
    }

    // Group donations by donor
    const donorMap = new Map();
    const missingUserIds = new Set();

    for (const d of donations) {
      let donorIdStr = null;
      let u = null;

      if (d.donorUserId && typeof d.donorUserId === "object" && (d.donorUserId._id || d.donorUserId.id)) {
        donorIdStr = (d.donorUserId._id || d.donorUserId.id).toString();
        u = d.donorUserId;
      } else if (d.donorUserId) {
        donorIdStr = d.donorUserId.toString();
        missingUserIds.add(donorIdStr);
      } else {
        donorIdStr = `anon-${d._id?.toString() || Math.random().toString(36).substring(2, 9)}`;
        u = { userName: "anonymous", firstName: "Community", lastName: "Donor" };
      }

      if (!donorIdStr) continue;

      const projTitle = d.charityProjectId?.title || "General Cause Initiative";
      const amount = Number(d.coinAmount) || 0;

      if (!donorMap.has(donorIdStr)) {
        donorMap.set(donorIdStr, {
          userId: donorIdStr,
          user: u,
          totalCoinsDonated: amount,
          donationsCount: 1,
          lastDonatedAt: d.createdAt,
          firstDonatedAt: d.createdAt,
          history: [
            {
              id: d._id,
              coinAmount: amount,
              projectName: projTitle,
              createdAt: d.createdAt,
            },
          ],
        });
      } else {
        const stats = donorMap.get(donorIdStr);
        stats.totalCoinsDonated += amount;
        stats.donationsCount += 1;
        if (d.createdAt > stats.lastDonatedAt) {
          stats.lastDonatedAt = d.createdAt;
        }
        if (d.createdAt < stats.firstDonatedAt) {
          stats.firstDonatedAt = d.createdAt;
        }
        if (stats.history.length < 10) {
          stats.history.push({
            id: d._id,
            coinAmount: amount,
            projectName: projTitle,
            createdAt: d.createdAt,
          });
        }
      }
    }

    // Populate any missing user details
    if (missingUserIds.size > 0) {
      const fetchedUsers = await User.find({ _id: { $in: Array.from(missingUserIds) } })
        .select("firstName lastName userName profileImageUrl isVerified")
        .lean();
      for (const fu of fetchedUsers) {
        const idStr = fu._id.toString();
        if (donorMap.has(idStr)) {
          donorMap.get(idStr).user = fu;
        }
      }
    }

    const getDonorTier = (rank, totalCoins) => {
      if (rank === 1 || totalCoins >= 5000) return { title: "Diamond Philanthropist", icon: "💎", color: "#D97706", bg: "#FEF3C7" };
      if (rank === 2 || totalCoins >= 2000) return { title: "Platinum Benefactor", icon: "👑", color: "#4B5563", bg: "#F3F4F6" };
      if (rank === 3 || totalCoins >= 500) return { title: "Gold Supporter", icon: "🥇", color: "#92400E", bg: "#FEF3C7" };
      return { title: "Impact Hero", icon: "🎖️", color: "#0D6B5E", bg: "#E1F5EE" };
    };

    const sortedDonors = Array.from(donorMap.values())
      .sort((a, b) => b.totalCoinsDonated - a.totalCoinsDonated)
      .map((item, index) => {
        const u = item.user || {};
        const rank = index + 1;
        const tier = getDonorTier(rank, item.totalCoinsDonated);
        const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}`.trim() : (u.userName || `Donor #${rank}`);

        return {
          rank,
          userId: item.userId,
          userName: u.userName || "anonymous",
          name,
          profileImageUrl: u.profileImageUrl || "",
          isVerified: u.isVerified || false,
          totalCoinsDonated: item.totalCoinsDonated,
          donationsCount: item.donationsCount,
          impactValueLkr: item.totalCoinsDonated * 10,
          lastDonatedAt: item.lastDonatedAt,
          firstDonatedAt: item.firstDonatedAt,
          recentDonations: item.history,
          tier: tier.title,
          tierIcon: tier.icon,
          tierColor: tier.color,
          tierBg: tier.bg,
          // Compatibility aliases
          totalSpent: item.totalCoinsDonated,
          ordersCount: item.donationsCount,
          itemsCount: item.donationsCount,
        };
      });

    // Build recentActivity stream
    const recentActivity = [];
    for (const d of donations) {
      if (recentActivity.length >= 15) break;
      const donorIdStr = d.donorUserId?._id?.toString() || d.donorUserId?.toString();
      const donorItem = donorMap.get(donorIdStr);
      const u = donorItem?.user || (typeof d.donorUserId === "object" ? d.donorUserId : {});
      const donorName = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}`.trim() : (u.userName || "Community Donor");

      recentActivity.push({
        id: d._id,
        donationId: d._id,
        donorUserId: donorIdStr,
        donorName,
        donorUserName: u.userName || "anonymous",
        donorAvatar: u.profileImageUrl || "",
        isVerified: u.isVerified || false,
        coinAmount: Number(d.coinAmount) || 0,
        projectName: d.charityProjectId?.title || "General Cause Initiative",
        createdAt: d.createdAt,
      });
    }

    const totalCoins = sortedDonors.reduce((sum, d) => sum + d.totalCoinsDonated, 0);
    const totalDonations = donations.length;

    return successResponse(res, 200, "Top donors fetched successfully.", {
      type: "donors",
      entity: {
        id: charity?._id || targetUser?._id,
        userName: targetUser?.userName || username,
        name: charity?.publicName || (targetUser?.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser?.userName || username),
        accountType: "organization",
        logoUrl: charity?.logoUrl || targetUser?.profileImageUrl || "",
        description: charity?.description || targetUser?.profileBio || "",
        category: charity?.category || "other",
        country: charity?.country || "",
        isVerified: true,
      },
      topSupporters: sortedDonors,
      topDonors: sortedDonors,
      topCustomers: sortedDonors,
      donors: sortedDonors,
      recentActivity,
      totalDonorsCount: sortedDonors.length,
      totalDonationsCount: totalDonations,
      totalCoinsRaised: totalCoins,
      totalImpactValue: totalCoins * 10,
      totalCustomersCount: sortedDonors.length,
      totalRevenueFromCustomers: totalCoins * 10,
    });
  }

  // ── BRANCH B: SELLER / INDIVIDUAL (TOP CUSTOMERS) ──
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
      type: "customers",
      seller: {
        userName: targetUser.userName,
        name: targetUser.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser.userName,
        accountType: targetUser.accountType,
      },
      topSupporters: [],
      topCustomers: [],
      topDonors: [],
      totalCustomersCount: 0,
      totalRevenueFromCustomers: 0,
    });
  }

  const productIds = products.map((p) => p._id);
  const productIdSet = new Set(productIds.map((id) => id.toString()));

  // 3. Find paid orders containing these products
  const orders = await Order.find({
    status: { $in: ["paid", "shipped", "completed"] },
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

  const getCustomerTier = (rank) => {
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
      const tier = getCustomerTier(rank);
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
        totalCoinsDonated: Math.floor(item.totalSpent / 10),
      };
    })
    .filter(Boolean);

  const totalRevenue = sortedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

  return successResponse(res, 200, "Top customers fetched successfully.", {
    type: "customers",
    seller: {
      userName: targetUser.userName,
      name: targetUser.firstName ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : targetUser.userName,
      accountType: targetUser.accountType,
    },
    topSupporters: sortedCustomers,
    topCustomers: sortedCustomers,
    topDonors: [],
    totalCustomersCount: sortedCustomers.length,
    totalRevenueFromCustomers: totalRevenue,
  });
});