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
    const { productId, startPrice, bidIncrement, startTime, endTime } =
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

    // validate start time and end time
    const isValidDate = validateTime(startTime, endTime);
    if (!isValidDate) {
      return res
        .status(404)
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

    const auction = await Auction.findById(id);
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Auction is not found!" });
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
          message: "User dont have enough coint balance",
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

// GET api/auctions
export const listAuctions = async (req, res) => {
  try {
    const { status = "active" } = req.query;

    const auctions = await Auction.find({ status: status })
      .populate("productId")
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

    const auction = await Auction.findById(id).populate("productId");

    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "No acution found" });
    }

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
      .populate("userId", { userName: 1, firstName: 1, lastName: 1 });

    return res.status(200).json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

