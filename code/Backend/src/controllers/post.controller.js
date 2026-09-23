import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { getRecommendedPostsForUser } from "../services/postRecommendation.service.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

export const createPost = async (req, res) => {
  try {
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const userId = req.user._id;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ success: false, message: "Post must have either text content or an image" });
    }

    if (content.length > 5000) {
      return res.status(400).json({ success: false, message: "Post content cannot exceed 5000 characters" });
    }

    let images = [];

    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, "merch4change/posts"),
        ),
      );
      images = uploads.map((upload) => upload.secure_url);
    }

    const post = await Post.create({ userId, content, images });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query?.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query?.limit, 10) || 20));
    const skip = (page - 1) * limit;

    let query = Post.find()
      .populate("userId", "firstName lastName profileImageUrl userName")
      .populate("comments.author", "firstName lastName userName profileImageUrl")
      .sort({ createdAt: -1 });

    if (query && typeof query.skip === "function") {
      query = query.skip(skip);
    }
    if (query && typeof query.limit === "function") {
      query = query.limit(limit);
    }

    const posts = await query;

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendedPosts = async (req, res) => {
  try {
    const { posts, pagination } = await getRecommendedPostsForUser(req.user._id, req.query);
    res.status(200).json({ success: true, posts, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id })
      .populate("userId", "firstName lastName userName profileImage profileImageUrl")
      .populate("comments.author", "firstName lastName userName profileImageUrl")
      .sort({ createdAt: -1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id,
      title: post.content?.slice(0, 48) || "Untitled post",
      description: post.content,
      imageUrl: post.images?.[0] || "",
      images: post.images || [],
      likesCount: post.likes?.length || 0,
      likes: post.likes || [],
      commentsCount: post.comments?.length || 0,
      comments: post.comments || [],
      createdAt: post.createdAt,
      author: post.userId
        ? {
            id: post.userId._id,
            firstName: post.userId.firstName,
            lastName: post.userId.lastName,
            userName: post.userId.userName,
            profileImageUrl: post.userId.profileImageUrl,
          }
        : null,
    }));

    res.status(200).json({ success: true, posts: normalizedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    if (mongoose.connection?.readyState === 1 && !mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isOwner = String(post.userId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await Post.findByIdAndDelete(req.params.postId);

    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ userName: username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const posts = await Post.find({ userId: user._id })
      .populate("userId", "firstName lastName userName profileImage profileImageUrl")
      .populate("comments.author", "firstName lastName userName profileImageUrl")
      .sort({ createdAt: -1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id,
      title: post.content?.slice(0, 48) || "Untitled post",
      description: post.content,
      imageUrl: post.images?.[0] || "",
      images: post.images || [],
      likesCount: post.likes?.length || 0,
      likes: post.likes || [],
      commentsCount: post.comments?.length || 0,
      comments: post.comments || [],
      createdAt: post.createdAt,
      author: post.userId
        ? {
            id: post.userId._id,
            firstName: post.userId.firstName,
            lastName: post.userId.lastName,
            userName: post.userId.userName,
            profileImageUrl: post.userId.profileImageUrl,
          }
        : null,
    }));

    res.status(200).json({ success: true, posts: normalizedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const likePost = async (req, res) => {
  try {
    if (mongoose.connection?.readyState === 1 && !mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id;
    const userIdStr = String(userId);
    const hasLiked = post.likes.some((id) => String(id) === userIdStr);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => String(id) !== userIdStr);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: "Comment cannot exceed 1000 characters" });
    }

    if (mongoose.connection?.readyState === 1 && !mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = {
      author: req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the author so frontend has name/image immediately
    await post.populate("comments.author", "firstName lastName userName profileImageUrl");

    res.status(201).json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
