import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    startPrice: {
      type: Number,
      required: true,
      min: 0,
    },  
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",     
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "cancelled"],
      default: "scheduled",
    },
    bidIncrement:{
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;

