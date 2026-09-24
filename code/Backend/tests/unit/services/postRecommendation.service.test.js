import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import Follow from "../../../src/models/Follow.js";
import Post from "../../../src/models/Post.js";
import {
  RECOMMENDATION_CANDIDATE_LIMIT,
  RECOMMENDATION_WEIGHTS,
  buildRecommendationPipeline,
  calculateRecommendationScores,
  getRecommendedPostsForUser,
  parseRecommendationPagination,
} from "../../../src/services/postRecommendation.service.js";

test("parseRecommendationPagination clamps page and limit", () => {
  assert.deepEqual(parseRecommendationPagination({}), {
    page: 1,
    limit: 20,
    skip: 0,
  });
  assert.deepEqual(parseRecommendationPagination({ page: "2", limit: "10" }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
  assert.equal(parseRecommendationPagination({ limit: "999" }).limit, 50);
  assert.equal(parseRecommendationPagination({ page: "0" }).page, 1);
});

test("calculateRecommendationScores adds relationship, engagement, recency, and interaction", () => {
  const coldStart = calculateRecommendationScores({
    likesCount: 0,
    commentsCount: 0,
    ageHours: 0,
  });
  assert.equal(coldStart.relationshipScore, 0);
  assert.equal(coldStart.engagementScore, 0);
  assert.equal(coldStart.interactionScore, 0);
  assert.equal(coldStart.recencyScore, RECOMMENDATION_WEIGHTS.recencyMax);

  const followed = calculateRecommendationScores({
    isFollowedAuthor: true,
    likesCount: 3,
    commentsCount: 1,
    ageHours: 48,
    isInteractedAuthor: true,
  });
  assert.equal(followed.relationshipScore, 40);
  assert.equal(followed.engagementScore, 10);
  assert.equal(followed.recencyScore, 10);
  assert.equal(followed.interactionScore, 15);
  assert.equal(followed.recommendationScore, 75);

  const capped = calculateRecommendationScores({
    likesCount: 100,
    commentsCount: 100,
  });
  assert.equal(capped.engagementScore, RECOMMENDATION_WEIGHTS.engagementCap);
});

test("recent posts score higher on recency than older posts with the same other signals", () => {
  const recent = calculateRecommendationScores({ ageHours: 1 });
  const older = calculateRecommendationScores({ ageHours: 96 });
  assert.ok(recent.recencyScore > older.recencyScore);
});

test("buildRecommendationPipeline scores a capped recent candidate window then paginates", () => {
  const userObjectId = new mongoose.Types.ObjectId();
  const pipeline = buildRecommendationPipeline({
    userObjectId,
    followingIds: [],
    interactedAuthorIds: [],
    skip: 0,
    limit: 20,
  });

  assert.deepEqual(pipeline[0], { $sort: { createdAt: -1 } });
  assert.deepEqual(pipeline[1], { $limit: RECOMMENDATION_CANDIDATE_LIMIT });
  assert.equal(
    pipeline.some((stage) => stage.$skip === 0),
    true,
  );
  assert.equal(
    pipeline.some((stage) => stage.$limit === 21),
    true,
  );
  assert.equal(
    pipeline.some((stage) => stage.$sort?.recommendationScore === -1),
    true,
  );
});

test("getRecommendedPostsForUser ranks via aggregation and supports empty interaction history", async () => {
  const originalFollowDistinct = Follow.distinct;
  const originalPostDistinct = Post.distinct;
  const originalAggregate = Post.aggregate;
  const userId = new mongoose.Types.ObjectId();
  const authorId = new mongoose.Types.ObjectId();
  const postId = new mongoose.Types.ObjectId();

  Follow.distinct = async () => [];
  Post.distinct = async () => [];
  Post.aggregate = async (pipeline) => {
    assert.deepEqual(pipeline[0], { $sort: { createdAt: -1 } });
    assert.equal(pipeline[1].$limit, 500);
    return [
      {
        _id: postId,
        content: "Hello",
        images: [],
        likes: [],
        comments: [],
        createdAt: new Date("2026-09-23T00:00:00.000Z"),
        userId: {
          _id: authorId,
          firstName: "Ada",
          lastName: "Ng",
          userName: "ada",
        },
        likesCount: 0,
        commentsCount: 0,
        recommendationScore: 18.5,
        relationshipScore: 0,
        engagementScore: 0,
        recencyScore: 18.5,
        interactionScore: 0,
      },
      { _id: new mongoose.Types.ObjectId() },
    ];
  };

  try {
    const result = await getRecommendedPostsForUser(userId, {
      page: 1,
      limit: 1,
    });
    assert.equal(result.posts.length, 1);
    assert.equal(result.pagination.hasMore, true);
    assert.equal(result.posts[0].content, "Hello");
    assert.equal(result.posts[0].scoreBreakdown.recency, 18.5);
    assert.equal(result.posts[0].recommendationScore, 18.5);
  } finally {
    Follow.distinct = originalFollowDistinct;
    Post.distinct = originalPostDistinct;
    Post.aggregate = originalAggregate;
  }
});
