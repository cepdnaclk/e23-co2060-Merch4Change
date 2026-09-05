import Product from "../models/Product.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";


export const createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // req.files comes from multer (array of files)
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, "merch4change/products")
        )
      );
      images = uploads.map((upload) => upload.secure_url); // Extract secure_url
    }

    const product = await Product.create({
      name,
      price,
      description,
      images,
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
    const cleanParam = decodeURIComponent(username || "").trim();
    const alphanumericOnly = cleanParam.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fuzzyPattern = cleanParam.replace(/[-_]/g, "[\\s-_]*");
    const fuzzyRegex = new RegExp(`^${fuzzyPattern}$`, "i");

    const User = (await import("../models/User.js")).default;
    const mongoose = (await import("mongoose")).default;
    
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

    if (!user) {
      const Brand = (await import("../models/Brand.js")).default;
      const brand = await Brand.findOne({
        $or: [
          { brandName: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
          { brandName: { $regex: fuzzyRegex } },
          { slug: { $regex: new RegExp(`^${cleanParam}$`, "i") } },
          ...(mongoose.isValidObjectId(cleanParam) ? [{ _id: cleanParam }, { ownerUserId: cleanParam }] : []),
        ],
      });
      if (brand?.ownerUserId) {
        user = await User.findById(brand.ownerUserId);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
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
