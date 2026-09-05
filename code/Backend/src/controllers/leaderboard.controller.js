import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import UserDonation from "../models/UserDonation.js";
import User from "../models/User.js";
import Brand from "../models/Brand.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * Computes donor tier label based on total coins donated.
 */
const getDonorTier = (totalCoins) => {
  if (totalCoins >= 5000) return { tier: "Diamond", color: "#60A5FA", bg: "#EFF6FF", icon: "💎" };
  if (totalCoins >= 2000) return { tier: "Platinum", color: "#A855F7", bg: "#FAF5FF", icon: "👑" };
  if (totalCoins >= 500) return { tier: "Gold", color: "#D97706", bg: "#FFFBEB", icon: "🥇" };
  if (totalCoins >= 100) return { tier: "Silver", color: "#4B5563", bg: "#F3F4F6", icon: "🥈" };
  return { tier: "Bronze", color: "#92400E", bg: "#FEF3C7", icon: "🥉" };
};

/**
 * Calculates start date based on timeframe string.
 */
const getTimeframeFilter = (timeframe) => {
  const now = new Date();
  if (timeframe === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    return { createdAt: { $gte: startOfWeek } };
  }
  if (timeframe === "month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { createdAt: { $gte: startOfMonth } };
  }
  return {};
};

/**
 * GET /api/v1/leaderboards/donors
 * Returns ranked list of individual donors based on total coins donated.
 */
export const getDonorLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const timeFilter = getTimeframeFilter(timeframe);

  // Aggregate from both Donation and UserDonation collections
  const [standardDonations, legacyDonations] = await Promise.all([
    Donation.aggregate([
      { $match: { ...timeFilter } },
      {
        $group: {
          _id: "$donorUserId",
          totalCoins: { $sum: "$coinAmount" },
          donationCount: { $sum: 1 },
          lastDonatedAt: { $max: "$createdAt" },
        },
      },
    ]),
    UserDonation.aggregate([
      { $match: { status: "completed", ...timeFilter } },
      {
        $group: {
          _id: "$user",
          totalCoins: { $sum: "$amount" },
          donationCount: { $sum: 1 },
          lastDonatedAt: { $max: "$createdAt" },
        },
      },
    ]),
  ]);

  // Merge donation records by user ID
  const userMap = new Map();

  for (const item of [...standardDonations, ...legacyDonations]) {
    if (!item._id) continue;
    const userIdStr = item._id.toString();
    if (!userMap.has(userIdStr)) {
      userMap.set(userIdStr, {
        userId: item._id,
        totalCoins: item.totalCoins,
        donationCount: item.donationCount,
        lastDonatedAt: item.lastDonatedAt,
      });
    } else {
      const existing = userMap.get(userIdStr);
      existing.totalCoins += item.totalCoins;
      existing.donationCount += item.donationCount;
      if (item.lastDonatedAt > existing.lastDonatedAt) {
        existing.lastDonatedAt = item.lastDonatedAt;
      }
    }
  }

  const mergedDonors = Array.from(userMap.values())
    .sort((a, b) => b.totalCoins - a.totalCoins)
    .slice(0, limit);

  // Populate user profile info
  const userIds = mergedDonors.map((d) => d.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("firstName lastName userName profileImageUrl role isVerified")
    .lean();

  const userDetailMap = new Map(users.map((u) => [u._id.toString(), u]));

  const leaderboard = mergedDonors
    .map((item, index) => {
      const user = userDetailMap.get(item.userId.toString());
      if (!user) return null;

      const tierInfo = getDonorTier(item.totalCoins);
      const name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.userName;

      return {
        rank: index + 1,
        userId: user._id,
        userName: user.userName,
        name,
        profileImageUrl: user.profileImageUrl || "",
        isVerified: user.isVerified || false,
        totalCoins: item.totalCoins,
        donationCount: item.donationCount,
        lastDonatedAt: item.lastDonatedAt,
        tier: tierInfo.tier,
        tierColor: tierInfo.color,
        tierBg: tierInfo.bg,
        tierIcon: tierInfo.icon,
      };
    })
    .filter(Boolean);

  return successResponse(res, 200, "Donor leaderboard fetched successfully.", {
    timeframe,
    leaderboard,
  });
});

/**
 * GET /api/v1/leaderboards/companies
 * Returns ranked list of companies/brands by sales, product impact, and CSR contributions.
 */
export const getCompanyLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const timeFilter = getTimeframeFilter(timeframe);

  // 1. Fetch all brands
  const brands = await Brand.find({})
    .populate("ownerUserId", "firstName lastName userName profileImageUrl isVerified salesCount")
    .lean();

  if (!brands || brands.length === 0) {
    return successResponse(res, 200, "Company leaderboard fetched successfully.", {
      timeframe,
      leaderboard: [],
    });
  }

  // 2. Fetch all products associated with brands
  const brandIds = brands.map((b) => b._id);
  const products = await Product.find({ brandId: { $in: brandIds } })
    .select("_id brandId price")
    .lean();

  const productToBrandMap = new Map(products.map((p) => [p._id.toString(), p.brandId.toString()]));

  // 3. Aggregate orders within timeframe
  const orders = await Order.find({ status: "paid", ...timeFilter })
    .select("items totalAmount coinsEarned")
    .lean();

  const brandSalesMap = new Map();
  for (const b of brands) {
    brandSalesMap.set(b._id.toString(), {
      totalRevenue: 0,
      totalUnitsSold: 0,
      impactCoinsGenerated: 0,
    });
  }

  for (const order of orders) {
    for (const item of order.items || []) {
      if (!item.productId) continue;
      const brandIdStr = productToBrandMap.get(item.productId.toString());
      if (brandIdStr && brandSalesMap.has(brandIdStr)) {
        const stats = brandSalesMap.get(brandIdStr);
        const itemRevenue = (item.unitPrice || 0) * (item.quantity || 1);
        stats.totalRevenue += itemRevenue;
        stats.totalUnitsSold += item.quantity || 1;
        stats.impactCoinsGenerated += Math.floor(itemRevenue / 10);
      }
    }
  }

  // 4. Build ranked company leaderboard
  const rankedCompanies = brands
    .map((brand) => {
      const stats = brandSalesMap.get(brand._id.toString()) || {
        totalRevenue: 0,
        totalUnitsSold: 0,
        impactCoinsGenerated: 0,
      };

      // Factor in user salesCount if available for baseline impact
      const userSales = brand.ownerUserId?.salesCount || 0;
      const effectiveUnitsSold = Math.max(stats.totalUnitsSold, userSales);
      const effectiveImpactCoins = Math.max(
        stats.impactCoinsGenerated,
        Math.floor(effectiveUnitsSold * 25)
      );

      return {
        brandId: brand._id,
        brandName: brand.brandName,
        slug: brand.slug || brand.brandName.toLowerCase().replace(/\s+/g, "-"),
        logoUrl: brand.logoUrl || brand.ownerUserId?.profileImageUrl || "",
        description: brand.description || "",
        ownerUserName: brand.ownerUserId?.userName || "",
        isVerified: brand.ownerUserId?.isVerified || false,
        totalRevenue: stats.totalRevenue,
        unitsSold: effectiveUnitsSold,
        impactCoinsGenerated: effectiveImpactCoins,
        impactScore: Math.round(effectiveImpactCoins * 1.5 + effectiveUnitsSold * 10),
      };
    })
    .sort((a, b) => b.impactCoinsGenerated - a.impactCoinsGenerated || b.unitsSold - a.unitsSold)
    .slice(0, limit)
    .map((company, index) => ({
      rank: index + 1,
      ...company,
    }));

  return successResponse(res, 200, "Company leaderboard fetched successfully.", {
    timeframe,
    leaderboard: rankedCompanies,
  });
});

/**
 * GET /api/v1/leaderboards/stats
 * Returns aggregate platform community statistics.
 */
export const getLeaderboardStats = asyncHandler(async (req, res) => {
  const [standardTotal, legacyTotal, totalDonorsCount, verifiedCharitiesCount] = await Promise.all([
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$coinAmount" } } }]),
    UserDonation.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "charity" }),
  ]);

  const totalCoinsDonated =
    (standardTotal[0]?.total || 0) + (legacyTotal[0]?.total || 0);

  return successResponse(res, 200, "Leaderboard stats fetched successfully.", {
    totalCoinsDonated,
    totalCommunityDonors: totalDonorsCount,
    verifiedCharitiesSupported: verifiedCharitiesCount,
    platformImpactRate: "100%",
  });
});
