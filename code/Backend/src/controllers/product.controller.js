import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import escapeRegex from "../utils/escapeRegex.js";

export const createProduct = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    const parsedPrice = Number(req.body.price);
    const stock = req.body.stock !== undefined ? Math.max(0, Number.parseInt(req.body.stock, 10) || 0) : 0;

    if (!name || name.length < 2 || name.length > 200) {
      return res.status(400).json({ success: false, message: "Product name must be between 2 and 200 characters" });
    }

    if (!description || description.length > 5000) {
      return res.status(400).json({ success: false, message: "Product description is required and cannot exceed 5000 characters" });
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: "Valid positive product price is required" });
    }

    // req.files comes from multer (array of files)
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, "merch4change/products"),
        ),
      );
      images = uploads.map((upload) => upload.secure_url); // Extract secure_url
    }

    let brand = await Brand.findOne({ ownerUserId: req.user._id });
    if (!brand) {
      const label =
        (req.user.userName && String(req.user.userName).trim()) ||
        req.user.firstName ||
        "Store";
      const brandName =
        label.length >= 2 ? label : `Store ${String(req.user._id).slice(-8)}`;
      brand = await Brand.create({
        ownerUserId: req.user._id,
        brandName,
      });
    }

    const product = await Product.create({
      name,
      price: parsedPrice,
      description,
      stock,
      images,
      brandId: brand?._id,
      ownerUserId: req.user._id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    const { username } = req.params;
    let rawDecoded = username || "";
    try {
      rawDecoded = decodeURIComponent(rawDecoded);
    } catch {
      // Fall back to raw param if malformed URI encoding
    }
    const cleanParam = rawDecoded.trim();
    const escapedParam = escapeRegex(cleanParam);
    const alphanumericOnly = cleanParam.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fuzzyPattern = escapedParam.replace(/[-_]/g, "[\\s\\-_]*");
    const fuzzyRegex = new RegExp(`^${fuzzyPattern}$`, "i");

    const User = (await import("../models/User.js")).default;
    const mongoose = (await import("mongoose")).default;

    let user = await User.findOne({
      $or: [
        { userName: { $regex: new RegExp(`^${escapedParam}$`, "i") } },
        { userName: { $regex: new RegExp(`^${escapeRegex(alphanumericOnly)}$`, "i") } },
        { userName: { $regex: fuzzyRegex } },
        { firstName: { $regex: new RegExp(`^${escapedParam}$`, "i") } },
        { firstName: { $regex: fuzzyRegex } },
        ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }] : []),
      ],
    });

    if (!user) {
      const Brand = (await import("../models/Brand.js")).default;
      const brand = await Brand.findOne({
        $or: [
          { brandName: { $regex: new RegExp(`^${escapedParam}$`, "i") } },
          { brandName: { $regex: fuzzyRegex } },
          { slug: { $regex: new RegExp(`^${escapedParam}$`, "i") } },
          ...(mongoose.isValidObjectId(cleanParam)
            ? [{ _id: cleanParam }, { ownerUserId: cleanParam }]
            : []),
        ],
      });
      if (brand?.ownerUserId) {
        user = await User.findById(brand.ownerUserId);
      }
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const Brand = (await import("../models/Brand.js")).default;
    const brands = await Brand.find({ ownerUserId: user._id });
    const brandIds = brands.map((b) => b._id);

    const products = await Product.find({
      $or: [
        { ownerUserId: user._id },
        ...(brandIds.length > 0 ? [{ brandId: { $in: brandIds } }] : []),
      ],
    })
      .populate("brandId", "brandName logoUrl slug")
      .populate("ownerUserId", "firstName lastName userName profileImageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
