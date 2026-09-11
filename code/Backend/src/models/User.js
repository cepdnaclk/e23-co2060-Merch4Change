import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,  // default do not return pw in quering 
    },
    accountType: {
      type: String,
      enum: ["individual", "organization"],
      default: "individual",
    },
    role: {
      type: String,
      enum: ["user", "brand", "charity", "admin"],
      default: "user",
      index: true,
    },
    coinBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      data: Buffer,
      contentType: String,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profileBio: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userLink: {
      type: String,
      default: "",
    },

  // ===== SECURITY SETTINGS =====
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    loginActivityAlerts: {
      type: Boolean,
      default: true,
    },

    // ===== PRIVACY SETTINGS =====
    isPrivate: {
      type: Boolean,
      default: false,
    },
    showActivityStatus: {
      type: Boolean,
      default: true,
    },
    allowMessageRequests: {
      type: Boolean,
      default: true,
    },
    hideReadReceipts: {
      type: Boolean,
      default: false,
    },
    commentPermission: {
      type: String,
      enum: ['everyone', 'followers', 'following', 'none'],
      default: 'following',
    },

    // ===== NOTIFICATION SETTINGS =====
    notifyOnLikes: {
      type: Boolean,
      default: true,
    },
    notifyOnComments: {
      type: Boolean,
      default: true,
    },
    notifyOnNewFollowers: {
      type: Boolean,
      default: true,
    },
    notifyOnDMs: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: false,
    },

    // ===== APPEARANCE & PREFERENCES =====
    appTheme: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    appLanguage: {
      type: String,
      default: 'en-US',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
  

userSchema.pre("save", function assignDefaultRole(next) {
  if (this.isNew && ["admin", "charity"].includes(this.role)) {
    return next();
  }

  if (this.isNew && this.accountType === "organization") {
    this.role = "brand";
  } else if (this.isModified("accountType")) {
    this.role = this.accountType === "organization" ? "brand" : "user";
  }
  next();
});

userSchema.virtual("fullName").get(function fullNameGetter() {
  return `${this.firstName} ${this.lastName}`.trim();
});

const User = mongoose.model("User", userSchema);

export default User;
