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
  // check acution is statred?
  const isActive = auction.status === "active" ? true : false;

  // check is auction ended?
  const now = new Date();
  const isNotExpired = auction.endTime > now ? true : false;

  // validate bid amount
  const newVal = auction.currentPrice + auction.bidIncrement;
  const isAmount = amount >= newVal ? true : false;

  // validate bidder have enough coins
  const user = await User.findById(userId);
  const userBalance = user.coinBalance;

  const isUserHaveCoin = userBalance >= amount ? true : false;

  return { isActive, isNotExpired, isAmount, isUserHaveCoin };
};
