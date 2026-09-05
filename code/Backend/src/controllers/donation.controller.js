import mongoose from "mongoose";
import Charity from "../models/Charity.js";
import CoinTransaction from "../models/CoinTransaction.js";
import Donation from "../models/Donation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * POST /api/v1/donations
 * Make a coin donation to a verified charity / cause project
 */
export const createDonation = asyncHandler(async (req, res) => {
  let { charityId, charityProjectId, coinAmount: rawAmount, amount } = req.body;
  const parsedAmount = Number.parseInt(rawAmount ?? amount, 10);

  if (!Number.isInteger(parsedAmount) || parsedAmount < 1) {
    throw new AppError("Donation amount must be at least 1 coin.", 400, "VALIDATION_ERROR", [
      { section: "body", message: "coinAmount must be at least 1" },
    ]);
  }

  let resolvedProjectId = null;
  let project = null;
  if (charityProjectId) {
    try {
      project = await Project.findOne({
        _id: charityProjectId,
        status: "active",
      });
    } catch {
      project = null;
    }
    if (!project) {
      try {
        project = await Project.findById(charityProjectId);
      } catch {
        project = null;
      }
    }
    if (!project) {
      throw new AppError("Active project not found.", 404, "PROJECT_NOT_FOUND");
    }
    resolvedProjectId = project._id;
    if (!charityId) {
      charityId = project.charityId;
    }
  }

  if (!charityId && project?.charityId) {
    charityId = project.charityId;
  }

  if (!charityId) {
    throw new AppError("charityId or charityProjectId is required.", 400, "VALIDATION_ERROR", [
      { section: "body", message: "charityId or charityProjectId is required" },
    ]);
  }

  let charity = null;
  try {
    charity = await Charity.findById(charityId);
  } catch {
    charity = null;
  }
  if (!charity) {
    try {
      charity = await Charity.findOne({ ownerUserId: charityId });
    } catch {
      charity = null;
    }
  }
  if (!charity && project?.charityId) {
    try {
      charity = await Charity.findById(project.charityId);
    } catch {
      charity = null;
    }
    if (!charity) {
      try {
        charity = await Charity.findOne({ ownerUserId: project.charityId });
      } catch {
        charity = null;
      }
    }
  }

  if (!charity) {
    throw new AppError("Charity not found.", 404, "CHARITY_NOT_FOUND");
  }
  if (charity.verificationStatus !== "verified") {
    throw new AppError("Donations are only accepted for verified charities.", 403, "CHARITY_NOT_VERIFIED");
  }

  // Atomically check and decrement coin balance
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      coinBalance: { $gte: parsedAmount },
    },
    {
      $inc: { coinBalance: -parsedAmount },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("coinBalance");

  if (!updatedUser) {
    throw new AppError("Insufficient coin balance.", 400, "INSUFFICIENT_COINS", [
      { section: "body", message: "not enough coins" },
    ]);
  }

  const donation = await Donation.create({
    donorUserId: req.user._id,
    charityId: charity._id,
    charityProjectId: resolvedProjectId,
    coinAmount: parsedAmount,
    status: "completed",
  });

  // If tied to a project, update project collected amount
  if (resolvedProjectId) {
    await Project.findByIdAndUpdate(resolvedProjectId, {
      $inc: { collectedAmount: parsedAmount },
    });
  }

  await CoinTransaction.create({
    userId: req.user._id,
    type: "donate",
    amount: parsedAmount,
    refType: "donation",
    refId: donation._id,
  });

  return successResponse(res, 201, "Donation successful.", {
    donation,
    coinBalance: updatedUser.coinBalance,
  });
});

/**
 * GET /api/v1/donations/my
 * Returns paginated list of logged-in user's donations
 */
export const getMyDonations = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const total = await Donation.countDocuments({ donorUserId: req.user._id });
  const records = await Donation.find({ donorUserId: req.user._id })
    .populate("charityId", "publicName logoUrl category")
    .populate("charityProjectId", "title description goalAmount collectedAmount status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const donations = records.map((d) => ({
    _id: d._id,
    id: d._id,
    donorUserId: d.donorUserId,
    charityId: d.charityId?._id || d.charityId,
    charity: d.charityId?.publicName || "Verified Charity",
    charityLogo: d.charityId?.logoUrl || null,
    charityCategory: d.charityId?.category || null,
    charityProjectId: d.charityProjectId?._id || d.charityProjectId || null,
    project: d.charityProjectId?.title || "General Fund",
    projectDetails: d.charityProjectId || null,
    coinAmount: d.coinAmount,
    amount: d.coinAmount,
    status: d.status || "completed",
    createdAt: d.createdAt,
  }));

  return successResponse(res, 200, "Donations fetched", {
    donations,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

/**
 * GET /api/v1/donations/my/stats
 * Aggregates live donation impact metrics and project involvement
 */
export const getDonationStats = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donorUserId: req.user._id })
    .populate("charityId", "publicName logoUrl")
    .populate("charityProjectId", "title description goalAmount collectedAmount status");

  const totalDonated = donations.reduce((sum, d) => sum + (d.coinAmount || 0), 0);
  const causesSupported = new Set(
    donations.map((d) => d.charityId?._id?.toString() || d.charityId?.toString()).filter(Boolean)
  ).size;
  const donationCount = donations.length;

  const impactScore = Math.min(
    100,
    Math.round((totalDonated / 1000) * 0.4 + causesSupported * 10 * 0.4 + donationCount * 2 * 0.2)
  );

  // Group user contributions by project
  const projectsMap = new Map();
  for (const d of donations) {
    const proj = d.charityProjectId;
    const charity = d.charityId;
    const projectId = proj?._id?.toString() || (charity ? `charity-${charity._id}` : "general");

    if (!projectsMap.has(projectId)) {
      projectsMap.set(projectId, {
        _id: proj?._id || projectId,
        title: proj?.title || (charity?.publicName ? `${charity.publicName} Fund` : "General Fund"),
        description: proj?.description || `Supporting ${charity?.publicName || "Community Causes"}`,
        goalAmount: proj?.goalAmount || 100000,
        collectedAmount: proj?.collectedAmount || d.coinAmount,
        status: proj?.status || "active",
        userContribution: d.coinAmount,
      });
    } else {
      projectsMap.get(projectId).userContribution += d.coinAmount;
    }
  }

  const ongoingProjects = Array.from(projectsMap.values());

  return successResponse(res, 200, "Donation stats fetched", {
    totalDonated,
    causesSupported,
    donationCount,
    impactScore,
    ongoingProjects,
  });
});

/**
 * GET /api/v1/donations/charities
 * List verified charities for donations
 */
export const listCharities = asyncHandler(async (req, res) => {
  const charities = await Charity.find({ verificationStatus: "verified" })
    .select("publicName description logoUrl website category ownerUserId")
    .populate("ownerUserId", "userName")
    .sort({ verifiedAt: -1 })
    .lean();

  const charityIds = charities.map((c) => c._id);

  const [donationTotals, projectTotals] = await Promise.all([
    Donation.aggregate([
      { $match: { charityId: { $in: charityIds }, status: "completed" } },
      { $group: { _id: "$charityId", totalRaised: { $sum: "$coinAmount" }, count: { $sum: 1 } } },
    ]),
    Project.aggregate([
      { $match: { charityId: { $in: charityIds }, status: "active" } },
      { $group: { _id: "$charityId", totalGoal: { $sum: "$goalAmount" }, totalCollected: { $sum: "$collectedAmount" } } },
    ]),
  ]);

  const donationMap = new Map(donationTotals.map((d) => [d._id.toString(), d]));
  const projectMap = new Map(projectTotals.map((p) => [p._id.toString(), p]));

  const enriched = charities.map((c) => {
    const dInfo = donationMap.get(c._id.toString());
    const pInfo = projectMap.get(c._id.toString());
    const totalRaised = dInfo?.totalRaised || pInfo?.totalCollected || 0;
    const totalGoal = pInfo?.totalGoal || 10000;
    const percent = totalGoal > 0 ? Math.min(100, Math.round((totalRaised / totalGoal) * 100)) : 0;

    return {
      ...c,
      totalRaised,
      totalGoal,
      percent,
      donationsCount: dInfo?.count || 0,
    };
  });

  return successResponse(res, 200, "Charities fetched successfully.", { charities: enriched });
});

/**
 * GET /api/v1/donations/projects
 * List active donation projects under verified charities
 */
export const listDonationProjects = asyncHandler(async (req, res) => {
  const verifiedCharityIds = await Charity.find({ verificationStatus: "verified" }).distinct("_id");

  const projects = await Project.find({
    charityId: { $in: verifiedCharityIds },
    status: "active",
  })
    .populate({ path: "charityId", select: "publicName logoUrl" })
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Projects fetched successfully.", {
    projects: projects.map((project) => ({
      id: project._id,
      charityId: project.charityId?._id,
      charityName: project.charityId?.publicName,
      charityLogo: project.charityId?.logoUrl,
      title: project.title,
      description: project.description,
      goalAmount: project.goalAmount,
      collectedAmount: project.collectedAmount,
      status: project.status,
    })),
  });
});
