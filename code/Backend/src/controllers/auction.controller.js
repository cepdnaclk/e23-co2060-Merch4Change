import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
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

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not found!" });
    }

    // validate startPrice and bidIncrement
    if (!startPrice || !Number.isFinite(Number(startPrice)) || Number(startPrice) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid positive start price is required." });
    }

    if (bidIncrement !== undefined && (!Number.isFinite(Number(bidIncrement)) || Number(bidIncrement) < 1)) {
      return res
        .status(400)
        .json({ success: false, message: "Bid increment must be a positive number." });
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
    let status = null;
    if (!hasStarted) {
      status = "scheduled";
    } else {
      status = "active";
    }

    const auction = await Auction.create({
      productId: productId,
      startPrice: startPrice,
      currentPrice: startPrice,
      currentBidder: null,
      startTime: startTime,
      endTime: endTime,
      createdBy: req.user._id,
      status: status,
      bidIncrement: bidIncrement || undefined,
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
    const { amount } = req.body;
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

    // Auto-settle if auction has started or ended
    await settleAuctionIfEnded(auction);

    // Prevent auction creator from bidding on own auction
    const creatorId = auction.createdBy?._id || auction.createdBy;
    if (creatorId && creatorId.toString() === userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot bid on your own auction" });
    }

    const { isActive, isNotExpired, isAmount, isUserHaveCoin } = await validBid(
      auction,
      amount,
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
    if (!isUserHaveCoin) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User doesn't have enough coin balance",
        });
    }

    const prevBidder = auction.currentBidder;

    // 1. If there was a previous leading bidder, refund their coins and notify them if outbid
    const lastBid = await Bid.findOne({ auctionId: id, status: "active" }).sort({ createdAt: -1 });
    if (prevBidder && lastBid) {
      // Refund the previous bidder's coins
      await User.findByIdAndUpdate(prevBidder, {
        $inc: { coinBalance: lastBid.amount },
      });

      // Notify previous bidder if someone else outbid them
      if (prevBidder.toString() !== userId.toString()) {
        await Notification.create({
          userId: prevBidder,
          type: "bet",
          message: `You have been outbid! The current highest bid is now $${amount}`,
          isRead: false,
        });
      }
    }

    // 2. Mark previous active bids for this auction as outbid
    await Bid.updateMany(
      { auctionId: id, status: "active" },
      { $set: { status: "outbid" } }
    );

    // 3. Deduct coins from the new bidder
    await User.findByIdAndUpdate(userId, {
      $inc: { coinBalance: -amount },
    });

    // 4. Update the auction leading price and bidder
    auction.currentPrice = amount;
    auction.currentBidder = userId;
    await auction.save();

    // 5. Create the new active bid record
    const bid = await Bid.create({
      auctionId: id,
      userId: userId,
      amount: amount,
      status: "active",
    });

    return res.status(201).json({ success: true, auction, bid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper to settle auctions whose deadline passed or start time arrived
const settleAuctionIfEnded = async (auction) => {
  const now = new Date();
  if (auction.status === "scheduled" && new Date(auction.startTime) <= now) {
    auction.status = "active";
    await auction.save();
  } else if (auction.status === "active" && new Date(auction.endTime) <= now) {
    auction.status = "ended";
    await auction.save();

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
      .populate("currentBidder", "userName firstName lastName avatar")
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

