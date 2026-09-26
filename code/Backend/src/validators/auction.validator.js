import User from "../models/User.js";

// validate start time and endtime
export const validateTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();
  const start_buffer = new Date(now.getTime() - 5 * 60 * 1000);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start >= start_buffer && end > start && end > now;
};

// validate is for auction status
export const isStarted = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();

  if (isNaN(start.getTime())) {
    return false;
  }

  return start <= now;
};

// validate the bid
export const validBid = async (auction, amount, userId) => {
  // check auction is active?
  const isActive = auction.status === "active";

  // check is auction ended? Ensure Date comparison
  const now = new Date();
  const isNotExpired = new Date(auction.endTime) > now;

  // validate bid amount
  // For the first bid (no current bidder), allow bids >= currentPrice (startPrice)
  // For subsequent bids, require >= currentPrice + bidIncrement
  let isAmount;
  if (!auction.currentBidder) {
    isAmount = amount >= auction.currentPrice;
  } else {
    const newVal = auction.currentPrice + auction.bidIncrement;
    isAmount = amount >= newVal;
  }

  // validate bidder has enough coins (guard against deleted user)
  const user = await User.findById(userId);
  if (!user) {
    return { isActive, isNotExpired, isAmount, isUserHaveCoin: false };
  }
  const userBalance = user.coinBalance || 0;

  const isUserHaveCoin = userBalance >= amount;

  return { isActive, isNotExpired, isAmount, isUserHaveCoin };
};
