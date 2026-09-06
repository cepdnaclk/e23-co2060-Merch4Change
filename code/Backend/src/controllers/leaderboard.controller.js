import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import Charity from "../models/Charity.js";
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

  const rankedDonors = await Donation.aggregate([
    { $match: { status: "completed", donorUserId: { $ne: null }, ...timeFilter } },
    {
      $group: {
        _id: "$donorUserId",
        totalCoins: { $sum: "$coinAmount" },
        donationCount: { $sum: 1 },
        lastDonatedAt: { $max: "$createdAt" },
      },
    },
    { $sort: { totalCoins: -1, donationCount: -1, lastDonatedAt: -1, _id: 1 } },
    { $limit: limit },
  ]);

  const donorList = rankedDonors.map((item) => ({
    userId: item._id,
    totalCoins: item.totalCoins,
    donationCount: item.donationCount,
    lastDonatedAt: item.lastDonatedAt,
  }));

  // Populate user profile info
  const userIds = donorList.map((d) => d.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("firstName lastName userName profileImageUrl role isVerified")
    .lean();

  const userDetailMap = new Map(users.map((u) => [u._id.toString(), u]));

  const leaderboard = donorList
    .map((item) => {
      const user = item.userId ? userDetailMap.get(item.userId.toString()) : null;
      if (!user) return null;
      return { item, user };
    })
    .filter(Boolean)
    .map(({ item, user }, index) => {
      const tierInfo = getDonorTier(item.totalCoins);
      const name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.userName || `Donor #${index + 1}`;

      return {
        rank: index + 1,
        userId: user._id,
        userName: user.userName || "",
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
    });

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

  // 3. Aggregate orders within timeframe using database-level aggregation pipeline
  const brandSalesMap = new Map();
  for (const b of brands) {
    brandSalesMap.set(b._id.toString(), {
      totalRevenue: 0,
      totalUnitsSold: 0,
      impactCoinsGenerated: 0,
    });
  }

  const productIds = products.map((p) => p._id);
  if (productIds.length > 0) {
    const salesAgg = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "shipped", "completed"] },
          "items.productId": { $in: productIds },
          ...timeFilter,
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$items.productId",
          totalRevenue: {
            $sum: {
              $multiply: [
                { $ifNull: ["$items.unitPrice", 0] },
                { $ifNull: ["$items.quantity", 1] },
              ],
            },
          },
          totalUnitsSold: {
            $sum: { $ifNull: ["$items.quantity", 1] },
          },
        },
      },
    ]);

    for (const row of salesAgg || []) {
      if (!row._id) continue;
      const brandIdStr = productToBrandMap.get(row._id.toString());
      if (brandIdStr && brandSalesMap.has(brandIdStr)) {
        const stats = brandSalesMap.get(brandIdStr);
        const revenue = row.totalRevenue || 0;
        const units = row.totalUnitsSold || 0;
        stats.totalRevenue += revenue;
        stats.totalUnitsSold += units;
        stats.impactCoinsGenerated += Math.floor(revenue / 10);
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
    .sort(
      (a, b) =>
        b.impactCoinsGenerated - a.impactCoinsGenerated ||
        b.unitsSold - a.unitsSold ||
        b.totalRevenue - a.totalRevenue ||
        String(a.brandName || "").localeCompare(String(b.brandName || "")) ||
        String(a.brandId).localeCompare(String(b.brandId))
    )
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
 * GET /api/v1/leaderboards/charities
 * Returns ranked list of verified charities & causes by impact coins raised and supporters.
 */
export const getCharityLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const timeFilter = getTimeframeFilter(timeframe);

  // 1. Fetch all verified charities
  const charities = await Charity.find({ verificationStatus: "verified" })
    .populate("ownerUserId", "userName profileImageUrl isVerified")
    .lean();

  if (!charities || charities.length === 0) {
    return successResponse(res, 200, "Charity leaderboard fetched successfully.", {
      timeframe,
      leaderboard: [],
    });
  }

  // 2. Aggregate donations per charity within timeframe
  const charityDonations = await Donation.aggregate([
    { $match: { status: "completed", ...timeFilter } },
    {
      $group: {
        _id: "$charityId",
        totalCoins: { $sum: "$coinAmount" },
        donationCount: { $sum: 1 },
        distinctDonors: { $addToSet: "$donorUserId" },
      },
    },
  ]);

  const donationStatsMap = new Map();
  for (const item of charityDonations) {
    if (item._id) {
      donationStatsMap.set(item._id.toString(), {
        totalCoins: item.totalCoins || 0,
        donationCount: item.donationCount || 0,
        donorCount: Array.isArray(item.distinctDonors) ? item.distinctDonors.length : 0,
      });
    }
  }

  const categoryLabels = {
    health: "Health & Medical",
    education: "Education & Literacy",
    environment: "Nature & Environment",
    humanitarian: "Humanitarian Aid",
    animal: "Animal Welfare",
    other: "Community & Charity",
  };

  const categoryIcons = {
    health: "🩺",
    education: "📚",
    environment: "🌱",
    humanitarian: "❤️",
    animal: "🐾",
    other: "🛡️",
  };

  // 3. Build ranked charity leaderboard
  const rankedCharities = charities
    .map((charity) => {
      const stats =
        donationStatsMap.get(charity._id.toString()) ||
        donationStatsMap.get(charity.ownerUserId?._id?.toString() || charity.ownerUserId?.toString()) || {
          totalCoins: 0,
          donationCount: 0,
          donorCount: 0,
        };

      const category = (charity.category || "other").toLowerCase();

      return {
        charityId: charity._id,
        name: charity.publicName,
        userName: charity.ownerUserId?.userName || "",
        logoUrl: charity.logoUrl || charity.ownerUserId?.profileImageUrl || "",
        description: charity.description || "",
        category,
        categoryLabel: categoryLabels[category] || "Verified Charity",
        categoryIcon: categoryIcons[category] || "🛡️",
        isVerified: true,
        totalCoins: stats.totalCoins,
        donationCount: stats.donationCount,
        donorCount: stats.donorCount,
      };
    })
    .sort(
      (a, b) =>
        b.totalCoins - a.totalCoins ||
        b.donorCount - a.donorCount ||
        b.donationCount - a.donationCount ||
        String(a.name || "").localeCompare(String(b.name || "")) ||
        String(a.charityId).localeCompare(String(b.charityId))
    )
    .slice(0, limit)
    .map((charity, index) => ({
      rank: index + 1,
      ...charity,
    }));

  return successResponse(res, 200, "Charity leaderboard fetched successfully.", {
    timeframe,
    leaderboard: rankedCharities,
  });
});

/**
 * GET /api/v1/leaderboards/stats
 * Returns aggregate platform community statistics.
 */
export const getLeaderboardStats = asyncHandler(async (req, res) => {
  const [standardTotal, distinctDonors, verifiedCharitiesCount] = await Promise.all([
    Donation.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$coinAmount" } } },
    ]),
    Donation.distinct("donorUserId", { status: "completed" }),
    Charity.countDocuments({ verificationStatus: "verified" }),
  ]);

  const totalCoinsDonated = standardTotal[0]?.total || 0;
  const totalCommunityDonors = Array.isArray(distinctDonors) ? distinctDonors.length : 0;

  return successResponse(res, 200, "Leaderboard stats fetched successfully.", {
    totalCoinsDonated,
    totalCommunityDonors,
    verifiedCharitiesSupported: verifiedCharitiesCount,
    platformImpactRate: "100%",
  });
});
