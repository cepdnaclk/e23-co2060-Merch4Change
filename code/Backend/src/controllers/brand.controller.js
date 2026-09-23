import Brand from "../models/Brand.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const createBrand = asyncHandler(async (req, res) => {
  const brandName = typeof req.body.brandName === "string" ? req.body.brandName.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const logoUrl = typeof req.body.logoUrl === "string" ? req.body.logoUrl.trim() : "";

  if (!brandName || brandName.length < 2 || brandName.length > 150) {
    throw new AppError("Brand name must be between 2 and 150 characters.", 400, "VALIDATION_ERROR");
  }

  if (description.length > 5000) {
    throw new AppError("Description cannot exceed 5000 characters.", 400, "VALIDATION_ERROR");
  }

  if (logoUrl.length > 500) {
    throw new AppError("Logo URL cannot exceed 500 characters.", 400, "VALIDATION_ERROR");
  }

  const existingBrand = await Brand.findOne({ ownerUserId: req.user._id });
  if (existingBrand) {
    throw new AppError("You already have an existing brand profile.", 409, "BRAND_ALREADY_EXISTS");
  }

  const brand = await Brand.create({
    ownerUserId: req.user._id,
    brandName,
    description,
    logoUrl,
  });

  return successResponse(res, 201, "Brand created successfully.", brand);
});

export const getAllBrands = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const brands = await Brand.find({ logoUrl: { $ne: "" } })
    .select("brandName logoUrl")
    .limit(limit);

  return successResponse(res, 200, "Brands fetched successfully.", brands);
});