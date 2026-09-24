import assert from "node:assert/strict";
import test from "node:test";

import { createMockResponse } from "../helpers/http.js";
import Follow from "../../../src/models/Follow.js";
import Post from "../../../src/models/Post.js";
import {
  getFeedPosts,
  getRecommendedPosts,
  likePost,
  commentOnPost,
} from "../../../src/controllers/post.controller.js";

const createFindChain = (posts) => ({
  populate() {
    return this;
  },
  sort() {
    return Promise.resolve(posts);
  },
});

test("getFeedPosts still returns chronological posts without recommendation fields", async () => {
  const originalFind = Post.find;
  const feedPosts = [{ _id: "p1", content: "chrono", createdAt: new Date() }];
  Post.find = () => createFindChain(feedPosts);

  const req = { user: { _id: "u1" } };
  const res = createMockResponse();

  try {
    await getFeedPosts(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.deepEqual(res.payload.posts, feedPosts);
    assert.equal(res.payload.pagination, undefined);
  } finally {
    Post.find = originalFind;
  }
});

test("getRecommendedPosts returns scored posts for the authenticated user", async () => {
  const originalFollowDistinct = Follow.distinct;
  const originalPostDistinct = Post.distinct;
  const originalAggregate = Post.aggregate;
  const userId = "507f1f77bcf86cd799439011";

  Follow.distinct = async () => [];
  Post.distinct = async () => [];
  Post.aggregate = async () => [
    {
      _id: "507f1f77bcf86cd799439012",
      content: "Ranked",
      images: [],
      likes: [],
      comments: [],
      createdAt: new Date("2026-09-23T00:00:00.000Z"),
      userId: { firstName: "Ada", lastName: "Ng", userName: "ada" },
      likesCount: 2,
      commentsCount: 0,
      recommendationScore: 42.22,
      relationshipScore: 40,
      engagementScore: 4,
      recencyScore: 18.22,
      interactionScore: 0,
    },
  ];

  const req = { user: { _id: userId }, query: { page: "1" } };
  const res = createMockResponse();

  try {
    await getRecommendedPosts(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.posts[0].content, "Ranked");
    assert.equal(res.payload.posts[0].recommendationScore, 42.22);
    assert.deepEqual(res.payload.pagination, {
      page: 1,
      limit: 20,
      hasMore: false,
    });
  } finally {
    Follow.distinct = originalFollowDistinct;
    Post.distinct = originalPostDistinct;
    Post.aggregate = originalAggregate;
  }
});

test("likePost still toggles likes on the Post document", async () => {
  const originalFindById = Post.findById;
  const userId = "u1";
  const post = {
    likes: [],
    save: async function save() {
      return this;
    },
  };

  Post.findById = async () => post;

  const req = { user: { _id: userId }, params: { postId: "p1" } };
  const res = createMockResponse();

  try {
    await likePost(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(post.likes.length, 1);
  } finally {
    Post.findById = originalFindById;
  }
});

test("commentOnPost still appends a comment", async () => {
  const originalFindById = Post.findById;
  const post = {
    comments: [],
    save: async function save() {
      return this;
    },
    populate: async function populate() {
      return this;
    },
  };

  Post.findById = async () => post;

  const req = {
    user: { _id: "u1" },
    params: { postId: "p1" },
    body: { text: "nice" },
  };
  const res = createMockResponse();

  try {
    await commentOnPost(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.comments[0].text, "nice");
  } finally {
    Post.findById = originalFindById;
  }
});
