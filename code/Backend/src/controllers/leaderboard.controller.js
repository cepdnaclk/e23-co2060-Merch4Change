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
 * Calculates start date based on timeframe string aligned to UTC boundaries.
 */
export const getTimeframeFilter = (timeframe, referenceDate = new Date()) => {
  const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  if (timeframe === "today" || timeframe === "day") {
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    return { createdAt: { $gte: startOfDay } };
  }

  if (timeframe === "week") {
    // Current calendar week starting Monday 00:00:00.000 UTC
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff, 0, 0, 0, 0));
    return { createdAt: { $gte: startOfWeek } };
  }

  if (timeframe === "month") {
    // Current calendar month starting 1st of month 00:00:00.000 UTC
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    return { createdAt: { $gte: startOfMonth } };
  }

  return {};
};

/**
 * Safely parses and clamps query limit to a valid positive integer [1, maxVal].
 */
export const parseLimit = (queryVal, defaultVal = 20, maxVal = 100) => {
  const parsed = Number.parseInt(queryVal, 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultVal;
  return Math.min(parsed, maxVal);
};

/**
 * Safely parses and normalizes query page to a valid positive integer >= 1.
 */
export const parsePage = (queryVal, defaultVal = 1) => {
  const parsed = Number.parseInt(queryVal, 10);
  if (Number.isNaN(parsed) || parsed < 1) return defaultVal;
  return parsed;
};

/**
 * GET /api/v1/leaderboards/donors
 * Returns ranked list of individual donors based on total coins donated.
 */
export const getDonorLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const page = parsePage(req.query.page, 1);
  const limit = parseLimit(req.query.limit, 20, 100);
  const skip = (page - 1) * limit;
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
    { $skip: skip },
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
        : user.userName || `Donor #${skip + index + 1}`;

      return {
        rank: skip + index + 1,
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
    page,
    limit,
    leaderboard,
  });
});

/**
 * GET /api/v1/leaderboards/companies
 * Returns ranked list of companies/brands by sales, product impact, and CSR contributions.
 */
export const getCompanyLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const page = parsePage(req.query.page, 1);
  const limit = parseLimit(req.query.limit, 20, 100);
  const skip = (page - 1) * limit;
  const timeFilter = getTimeframeFilter(timeframe);

  // 1. Fetch all brands
  const brands = await Brand.find({})
    .populate("ownerUserId", "firstName lastName userName profileImageUrl isVerified salesCount")
    .lean();

  if (!brands || brands.length === 0) {
    return successResponse(res, 200, "Company leaderboard fetched successfully.", {
      timeframe,
      page,
      limit,
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

      const totalRevenue = stats.totalRevenue;
      const unitsSold = stats.totalUnitsSold;
      const impactCoinsGenerated = stats.impactCoinsGenerated;
      const impactScore = Math.round(impactCoinsGenerated * 1.5 + unitsSold * 10);

      return {
        brandId: brand._id,
        brandName: brand.brandName,
        slug: brand.slug || brand.brandName.toLowerCase().replace(/\s+/g, "-"),
        logoUrl: brand.logoUrl || brand.ownerUserId?.profileImageUrl || "",
        description: brand.description || "",
        ownerUserName: brand.ownerUserId?.userName || "",
        isVerified: brand.ownerUserId?.isVerified || false,
        totalRevenue,
        unitsSold,
        impactCoinsGenerated,
        impactScore,
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
    .slice(skip, skip + limit)
    .map((company, index) => ({
      rank: skip + index + 1,
      ...company,
    }));

  return successResponse(res, 200, "Company leaderboard fetched successfully.", {
    timeframe,
    page,
    limit,
    leaderboard: rankedCompanies,
  });
});

/**
 * GET /api/v1/leaderboards/charities
 * Returns ranked list of verified charities & causes by impact coins raised and supporters.
 */
export const getCharityLeaderboard = asyncHandler(async (req, res) => {
  const timeframe = req.query.timeframe || "all_time";
  const page = parsePage(req.query.page, 1);
  const limit = parseLimit(req.query.limit, 20, 100);
  const skip = (page - 1) * limit;
  const timeFilter = getTimeframeFilter(timeframe);

  // 1. Fetch all verified charities
  const charities = await Charity.find({ verificationStatus: "verified" })
    .populate("ownerUserId", "userName profileImageUrl isVerified")
    .lean();

  if (!charities || charities.length === 0) {
    return successResponse(res, 200, "Charity leaderboard fetched successfully.", {
      timeframe,
      page,
      limit,
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
    .slice(skip, skip + limit)
    .map((charity, index) => ({
      rank: skip + index + 1,
      ...charity,
    }));

  return successResponse(res, 200, "Charity leaderboard fetched successfully.", {
    timeframe,
    page,
    limit,
    leaderboard: rankedCharities,
  });
});

/**
 * GET /api/v1/leaderboards/stats
 * Returns aggregate platform community statistics.
 */
export const getLeaderboardStats = asyncHandler(async (req, res) => {
  const [standardTotal, distinctDonorsResult, verifiedCharitiesCount, totalBrandsCount] = await Promise.all([
    Donation.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$coinAmount" } } },
    ]),
    Donation.aggregate([
      { $match: { status: "completed", donorUserId: { $ne: null } } },
      { $group: { _id: "$donorUserId" } },
      { $count: "count" },
    ]),
    Charity.countDocuments({ verificationStatus: "verified" }),
    Brand.countDocuments({}),
  ]);

  const totalCoinsDonated = standardTotal[0]?.total || 0;
  const totalCommunityDonors = distinctDonorsResult[0]?.count || 0;

  return successResponse(res, 200, "Leaderboard stats fetched successfully.", {
    totalCoinsDonated,
    totalCommunityDonors,
    verifiedCharitiesSupported: verifiedCharitiesCount,
    totalPartnerBrands: totalBrandsCount,
    platformImpactRate: "100%",
  });
});
