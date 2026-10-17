import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import {
  validateTime,
  isStarted,
  validBid,
} from "../validators/auction.validator.js";

// POST api/auctions
export const createAuction = async (req, res) => {
  try {
    const { productId, startPrice, bidIncrement, startTime, endTime, images, imageUrl } =
      req.body;

    // validate productId
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "No productId has passed." });
    }

    const numericStartPrice = Number(startPrice);
    if (!Number.isFinite(numericStartPrice) || numericStartPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid startPrice." });
    }

    const numericBidIncrement =
      bidIncrement !== undefined && bidIncrement !== null && bidIncrement !== ""
        ? Number(bidIncrement)
        : undefined;
    if (
      numericBidIncrement !== undefined &&
      (!Number.isFinite(numericBidIncrement) || numericBidIncrement <= 0)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid bidIncrement." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not found!" });
    }

    // Verify ownership (ownerUserId, brand owner, or admin)
    const isAdmin = req.user?.role === "admin";
    const isDirectOwner =
      product.ownerUserId &&
      String(product.ownerUserId) === String(req.user._id);
    let isBrandOwner = false;
    if (!isAdmin && !isDirectOwner && product.brandId) {
      const brand = await Brand.findById(product.brandId);
      isBrandOwner =
        Boolean(brand?.ownerUserId) &&
        String(brand.ownerUserId) === String(req.user._id);
    }

    if (!isAdmin && !isDirectOwner && !isBrandOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to auction this product.",
      });
    }

    // validate start time and end time
    const isValidDate = validateTime(startTime, endTime);
    if (!isValidDate) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid time inputs" });
    }

    // check is started
    const hasStarted = isStarted(startTime);
    const status = hasStarted ? "active" : "scheduled";

    const auction = await Auction.create({
      productId: productId,
      startPrice: numericStartPrice,
      currentPrice: numericStartPrice,
      currentBidder: null,
      startTime: startTime,
      endTime: endTime,
      createdBy: req.user._id,
      status: status,
      bidIncrement: numericBidIncrement,
      images: images || [],
      imageUrl: imageUrl || "",
    });

    res.status(201).json({ success: true, auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST api/auctions/:id/bid
export const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const numericAmount = Number(req.body?.amount);
    const userId = req.user._id;

    // Validate ObjectId format
    const mongoose = (await import("mongoose")).default;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid auction ID format" });
    }

    const auction = await Auction.findById(id).populate("productId");
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Auction is not found!" });
    }

    // Transition scheduled -> active or active -> ended if time threshold passed
    await settleAuctionIfEnded(auction);

    const creatorId = auction.createdBy?._id || auction.createdBy;
    if (creatorId && String(creatorId) === String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot bid on your own auction",
      });
    }

    if (
      auction.currentBidder &&
      String(auction.currentBidder) === String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "You are already the highest bidder.",
      });
    }

    const { isActive, isNotExpired, isAmount, isUserHaveFiat } = await validBid(
      auction,
      numericAmount,
      userId,
    );

    if (!isActive) {
      return res
        .status(409)
        .json({ success: false, message: "Event has not started yet" });
    }
    if (!isNotExpired) {
      return res
        .status(409)
        .json({ success: false, message: "Event has expired" });
    }
    if (!isAmount) {
      return res
        .status(400)
        .json({ success: false, message: "invalid amount" });
    }
    if (!isUserHaveFiat) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User doesn't have enough coin balance",
        });
    }

    // 1. Atomically deduct balance from the new bidder first
    const deductedUser = await User.findOneAndUpdate(
      { _id: userId, fiatBalance: { $gte: numericAmount } },
      { $inc: { fiatBalance: -numericAmount } },
      { new: true },
    );

    if (!deductedUser) {
      return res.status(400).json({
        success: false,
        message: "User doesn't have enough coin balance",
      });
    }

    // 2. Atomically update auction only if currentPrice and active status haven't changed
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: id,
        status: "active",
        endTime: { $gt: new Date() },
        currentPrice: auction.currentPrice,
      },
      {
        $set: {
          currentPrice: numericAmount,
          currentBidder: userId,
        },
      },
      { new: true },
    );

    if (!updatedAuction) {
      // Roll back deduction if another bid beat us or auction ended
      await User.findByIdAndUpdate(userId, {
        $inc: { fiatBalance: numericAmount },
      });
      return res.status(409).json({
        success: false,
        message: "Auction price was just updated by another bidder. Please try again.",
      });
    }

    // 3. Atomically mark the previous active bid as outbid and refund that bidder once
    const prevActiveBid = await Bid.findOneAndUpdate(
      { auctionId: id, status: "active" },
      { $set: { status: "outbid" } },
      { sort: { createdAt: -1 } },
    );

    if (prevActiveBid) {
      await User.findByIdAndUpdate(prevActiveBid.userId, {
        $inc: { fiatBalance: prevActiveBid.amount },
      });

      // Ensure any remaining stale active bids are marked outbid
      await Bid.updateMany(
        { auctionId: id, status: "active" },
        { $set: { status: "outbid" } },
      );

      if (String(prevActiveBid.userId) !== String(userId)) {
        await Notification.create({
          userId: prevActiveBid.userId,
          type: "bet",
          message: `You have been outbid! The current highest bid is now $${numericAmount}`,
          isRead: false,
        });
      }
    }

    // 4. Create the new active bid record
    const bid = await Bid.create({
      auctionId: id,
      userId: userId,
      amount: numericAmount,
      status: "active",
    });

    return res.status(201).json({ success: true, auction: updatedAuction, bid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper to settle auctions whose deadline passed or start time arrived
const settleAuctionIfEnded = async (auction) => {
  const now = new Date();
  if (
    auction.status === "scheduled" &&
    new Date(auction.startTime) <= now &&
    new Date(auction.endTime) > now
  ) {
    auction.status = "active";
    if (typeof auction.save === "function") {
      await auction.save();
    }
  } else if (
    (auction.status === "active" || auction.status === "scheduled") &&
    new Date(auction.endTime) <= now
  ) {
    const claimed = await Auction.findOneAndUpdate(
      { _id: auction._id, status: { $in: ["active", "scheduled"] } },
      { $set: { status: "ended" } },
      { new: true },
    );
    auction.status = "ended";
    if (!claimed) {
      return auction;
    }

    if (auction.currentBidder) {
      await Bid.findOneAndUpdate(
        { auctionId: auction._id, userId: auction.currentBidder, status: "active" },
        { $set: { status: "won" } }
      );

      const productName = auction.productId?.name || "the item";

      await Notification.create({
        userId: auction.currentBidder,
        type: "bet",
        message: `Congratulations! You won the auction for ${productName} with a bid of $${auction.currentPrice}!`,
        isRead: false,
      });

      const bidderId = auction.currentBidder?._id || auction.currentBidder;
      const creatorId = auction.createdBy?._id || auction.createdBy;

      if (bidderId && creatorId && creatorId.toString() !== bidderId.toString()) {
        await Notification.create({
          userId: auction.createdBy,
          type: "bet",
          message: `Your auction for ${productName} has ended with a winning bid of $${auction.currentPrice}!`,
          isRead: false,
        });
      }
    }
  }
  return auction;
};

// GET api/auctions/activity
export const getLiveAuctionFeed = async (req, res) => {
  try {
    const now = new Date();

    // Auto-transition scheduled auctions that have reached start time
    await Auction.updateMany(
      { status: "scheduled", startTime: { $lte: now }, endTime: { $gt: now } },
      { $set: { status: "active" } }
    );

    // Auto-settle active auctions that have expired
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lte: now },
    }).populate("productId");

    for (const exp of expiredAuctions) {
      await settleAuctionIfEnded(exp);
    }

    const auctions = await Auction.find({ status: "active", endTime: { $gt: now } })
      .populate("productId")
      .populate("currentBidder", "userName firstName lastName avatar avatarUrl profileImageUrl")
      .sort({ endTime: 1 })
      .limit(6);

    const recentBids = await Bid.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({
        path: "auctionId",
        populate: { path: "productId", select: "name images price" },
      })
      .populate("userId", "userName firstName lastName avatar avatarUrl profileImageUrl");

    const totalActive = await Auction.countDocuments({ status: "active", endTime: { $gt: now } });

    return res.status(200).json({
      success: true,
      auctions,
      recentBids: recentBids.filter((b) => b && b.auctionId),
      stats: {
        totalActive,
        totalBids: recentBids.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET api/auctions
export const listAuctions = async (req, res) => {
  try {
    const { status = "active" } = req.query;
    const now = new Date();

    // Auto-transition scheduled auctions that have reached start time
    await Auction.updateMany(
      { status: "scheduled", startTime: { $lte: now }, endTime: { $gt: now } },
      { $set: { status: "active" } }
    );

    // Auto-settle active auctions that have expired
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lte: now },
    }).populate("productId");

    for (const exp of expiredAuctions) {
      await settleAuctionIfEnded(exp);
    }

    const filter = status === "all" ? {} : { status };
    const auctions = await Auction.find(filter)
      .populate("productId")
      .populate("currentBidder", "userName firstName lastName avatar avatarUrl profileImageUrl")
      .sort({ endTime: 1 });

    return res.status(200).json({
      success: true,
      auctions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET api/auctions/:id
export const getAuction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ success: false, message: "Invalid id" });
    }

    const auction = await Auction.findById(id)
      .populate("productId")
      .populate("currentBidder", "userName firstName lastName avatar avatarUrl profileImageUrl")
      .populate("createdBy", "userName firstName lastName");

    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "No auction found" });
    }

    await settleAuctionIfEnded(auction);

    return res.status(200).json({ success: true, auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET api/auctions/:id/bids
export const getBids = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ success: false, message: "Invalid id" });
    }

    const bids = await Bid.find({ auctionId: id })
      .sort({ createdAt: -1 })
      .populate("userId", { userName: 1, firstName: 1, lastName: 1, profileImageUrl: 1, avatarUrl: 1 });

    return res.status(200).json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

