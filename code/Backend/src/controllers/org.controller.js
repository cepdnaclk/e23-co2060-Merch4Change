import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { successResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";
import Charity from "../models/Charity.js";
import Project from "../models/Project.js";
import Donation from "../models/Donation.js";

/**
 * Get organization profile by username
 */
export const getOrgProfileByUsername = asyncHandler(async (req, res) => {
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
    charity = await Charity.findOne({
      $or: [
        { ownerUserId: user._id },
        ...(mongoose.isValidObjectId(user._id) ? [{ _id: user._id }] : []),
      ],
    });
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

  if (!user && !charity) {
    throw new AppError("Organization not found.", 404);
  }

  if (!charity) {
    throw new AppError("Charity profile not found for this organization.", 404);
  }

  const projects = await Project.find({ charityId: charity._id }).sort({ createdAt: -1 });
  const projectIds = projects.map((p) => p._id);

  const donations = await Donation.find({
    status: "completed",
    $or: [
      { charityId: charity._id },
      ...(projectIds.length > 0 ? [{ charityProjectId: { $in: projectIds } }] : []),
    ],
  });

  const totalDonationsAmount = donations.reduce((sum, d) => sum + (d.coinAmount || 0), 0);
  const totalProjectCollected = projects.reduce((sum, p) => sum + (p.collectedAmount || 0), 0);
  const totalRaised = Math.max(totalDonationsAmount, totalProjectCollected);
  const totalGoal = projects.reduce((sum, p) => sum + (p.goalAmount || 0), 0);

  const data = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      role: user.role,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profileBio: user.profileBio,
      profileImage: user.profileImage,
    },
    charity: {
      id: charity._id,
      publicName: charity.publicName,
      description: charity.description,
      logoUrl: charity.logoUrl,
      website: charity.website,
      contactEmail: charity.contactEmail,
      verificationStatus: charity.verificationStatus,
      rejectionReason: charity.rejectionReason,
      registrationNumber: charity.registrationNumber,
      category: charity.category,
      totalRaised,
      totalGoal,
      donationsCount: donations.length,
      impactValueLkr: totalRaised * 10,
    },
    projects: projects.map((p) => ({
      id: p._id,
      _id: p._id,
      title: p.title,
      description: p.description,
      goalAmount: p.goalAmount,
      collectedAmount: p.collectedAmount,
      status: p.status,
    })),
  };

  return successResponse(res, 200, "Organization profile fetched successfully.", data);
});

/**
 * Add a new project for the organization
 */
export const addProject = asyncHandler(async (req, res) => {
  if (req.user.accountType !== "organization") {
    throw new AppError("Only organization accounts can create projects.", 403, "FORBIDDEN");
  }

  const charity = await Charity.findOne({ ownerUserId: req.user._id });
  
  if (!charity) {
    throw new AppError("You must complete your charity profile verification before adding projects.", 403, "CHARITY_PROFILE_REQUIRED");
  }

  if (charity.verificationStatus !== "verified") {
    throw new AppError("Your organization must be verified by an admin to add projects.", 403, "NOT_VERIFIED");
  }

  const { title, description, goalAmount } = req.body;

  if (!title || !description || !goalAmount) {
    throw new AppError("Title, description, and goal amount are required.", 400, "VALIDATION_ERROR");
  }

  const project = await Project.create({
    charityId: charity._id,
    title: title.trim(),
    description: description.trim(),
    goalAmount: Number(goalAmount),
    collectedAmount: 0,
    status: "active"
  });

  const formattedProject = {
    id: project._id,
    title: project.title,
    description: project.description,
    goalAmount: project.goalAmount,
    collectedAmount: project.collectedAmount,
    status: project.status
  };

  return successResponse(res, 201, "Project created successfully.", { project: formattedProject });
});

export default {
  getOrgProfileByUsername,
  addProject,
};
