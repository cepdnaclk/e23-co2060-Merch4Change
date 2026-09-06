import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
      index: true,
    },
    charityProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    coinAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

// Compound indexes for leaderboard aggregations and profile queries
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ status: 1, donorUserId: 1, coinAmount: 1 });
donationSchema.index({ status: 1, charityId: 1, coinAmount: 1 });
donationSchema.index({ charityId: 1, status: 1, createdAt: -1 });
donationSchema.index({ charityProjectId: 1, status: 1, createdAt: -1 });

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;

