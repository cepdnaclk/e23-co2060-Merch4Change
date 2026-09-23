import mongoose from "mongoose";

import Follow from "../models/Follow.js";
import Post from "../models/Post.js";

/**
 * Tunable recommendation weights.
 * Score = relationship + engagement + recency + interaction
 */
export const RECOMMENDATION_WEIGHTS = {
  relationshipFollowed: 40,
  relationshipOwnPost: 8,
  engagementLike: 2,
  engagementComment: 4,
  engagementCap: 30,
  recencyMax: 20,
  recencyHalfLifeHours: 48,
  interactionAuthor: 15,
  interactionThisPostLike: 5,
  interactionThisPostComment: 5,
};

export const RECOMMENDATION_CANDIDATE_LIMIT = 500;
export const RECOMMENDATION_MAX_LIMIT = 50;
export const RECOMMENDATION_DEFAULT_LIMIT = 20;

const MS_PER_HOUR = 1000 * 60 * 60;

export function parseRecommendationPagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    RECOMMENDATION_MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || RECOMMENDATION_DEFAULT_LIMIT),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function calculateRecommendationScores(
  {
    isFollowedAuthor = false,
    isOwnPost = false,
    likesCount = 0,
    commentsCount = 0,
    ageHours = 0,
    isInteractedAuthor = false,
    userLikedThisPost = false,
    userCommentedThisPost = false,
  },
  weights = RECOMMENDATION_WEIGHTS,
) {
  const relationshipScore = isFollowedAuthor
    ? weights.relationshipFollowed
    : isOwnPost
      ? weights.relationshipOwnPost
      : 0;

  const engagementScore = Math.min(
    weights.engagementCap,
    likesCount * weights.engagementLike + commentsCount * weights.engagementComment,
  );

  const safeAgeHours = Math.max(0, ageHours);
  const recencyScore =
    weights.recencyMax * 0.5 ** (safeAgeHours / weights.recencyHalfLifeHours);

  const interactionScore =
    (isInteractedAuthor ? weights.interactionAuthor : 0) +
    (userLikedThisPost ? weights.interactionThisPostLike : 0) +
    (userCommentedThisPost ? weights.interactionThisPostComment : 0);

  return {
    relationshipScore,
    engagementScore,
    recencyScore,
    interactionScore,
    recommendationScore:
      relationshipScore + engagementScore + recencyScore + interactionScore,
  };
}

function toObjectId(value) {
  return new mongoose.Types.ObjectId(String(value));
}

function roundScore(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function shapeRecommendedPost(doc) {
  const userId = doc.userId || null;

  return {
    _id: doc._id,
    id: doc._id,
    content: doc.content,
    images: doc.images || [],
    likes: doc.likes || [],
    comments: doc.comments || [],
    createdAt: doc.createdAt,
    likesCount: doc.likesCount ?? (doc.likes?.length || 0),
    commentsCount: doc.commentsCount ?? (doc.comments?.length || 0),
    userId,
    recommendationScore: roundScore(doc.recommendationScore),
    scoreBreakdown: {
      relationship: roundScore(doc.relationshipScore),
      engagement: roundScore(doc.engagementScore),
      recency: roundScore(doc.recencyScore),
      interaction: roundScore(doc.interactionScore),
    },
  };
}

export function buildRecommendationPipeline({
  userObjectId,
  followingIds,
  interactedAuthorIds,
  skip,
  limit,
  weights = RECOMMENDATION_WEIGHTS,
  candidateLimit = RECOMMENDATION_CANDIDATE_LIMIT,
}) {
  return [
    { $sort: { createdAt: -1 } },
    { $limit: candidateLimit },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: { $ifNull: ["$comments", []] } },
        isOwnPost: { $eq: ["$userId", userObjectId] },
        isFollowedAuthor: { $in: ["$userId", followingIds] },
        userLikedThisPost: { $in: [userObjectId, { $ifNull: ["$likes", []] }] },
        userCommentedThisPost: {
          $in: [userObjectId, { $ifNull: ["$comments.author", []] }],
        },
        isInteractedAuthor: { $in: ["$userId", interactedAuthorIds] },
        ageHours: {
          $max: [
            0,
            {
              $divide: [
                { $subtract: ["$$NOW", { $ifNull: ["$createdAt", "$$NOW"] }] },
                MS_PER_HOUR,
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        relationshipScore: {
          $cond: [
            "$isFollowedAuthor",
            weights.relationshipFollowed,
            {
              $cond: ["$isOwnPost", weights.relationshipOwnPost, 0],
            },
          ],
        },
        engagementScore: {
          $min: [
            weights.engagementCap,
            {
              $add: [
                { $multiply: ["$likesCount", weights.engagementLike] },
                { $multiply: ["$commentsCount", weights.engagementComment] },
              ],
            },
          ],
        },
        recencyScore: {
          $multiply: [
            weights.recencyMax,
            {
              $pow: [0.5, { $divide: ["$ageHours", weights.recencyHalfLifeHours] }],
            },
          ],
        },
        interactionScore: {
          $add: [
            { $cond: ["$isInteractedAuthor", weights.interactionAuthor, 0] },
            { $cond: ["$userLikedThisPost", weights.interactionThisPostLike, 0] },
            {
              $cond: ["$userCommentedThisPost", weights.interactionThisPostComment, 0],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        recommendationScore: {
          $add: [
            "$relationshipScore",
            "$engagementScore",
            "$recencyScore",
            "$interactionScore",
          ],
        },
      },
    },
    { $sort: { recommendationScore: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              userName: 1,
              profileImageUrl: 1,
              avatarUrl: 1,
            },
          },
        ],
        as: "authorDocs",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.author",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              userName: 1,
              profileImageUrl: 1,
            },
          },
        ],
        as: "commentAuthors",
      },
    },
    {
      $addFields: {
        userId: { $arrayElemAt: ["$authorDocs", 0] },
        comments: {
          $map: {
            input: { $ifNull: ["$comments", []] },
            as: "comment",
            in: {
              _id: "$$comment._id",
              text: "$$comment.text",
              createdAt: "$$comment.createdAt",
              author: {
                $let: {
                  vars: {
                    matched: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$commentAuthors",
                            as: "commentAuthor",
                            cond: { $eq: ["$$commentAuthor._id", "$$comment.author"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ["$$matched", "$$comment.author"] },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        images: 1,
        likes: 1,
        comments: 1,
        createdAt: 1,
        userId: 1,
        likesCount: 1,
        commentsCount: 1,
        recommendationScore: 1,
        relationshipScore: 1,
        engagementScore: 1,
        recencyScore: 1,
        interactionScore: 1,
      },
    },
  ];
}

export async function getRecommendedPostsForUser(userId, query = {}) {
  const userObjectId = toObjectId(userId);
  const { page, limit, skip } = parseRecommendationPagination(query);

  const [followingIds, interactedAuthorIds] = await Promise.all([
    Follow.distinct("followingId", { followerId: userObjectId }),
    Post.distinct("userId", {
      $or: [{ likes: userObjectId }, { "comments.author": userObjectId }],
    }),
  ]);

  const pipeline = buildRecommendationPipeline({
    userObjectId,
    followingIds,
    interactedAuthorIds,
    skip,
    limit,
  });

  const rows = await Post.aggregate(pipeline);
  const hasMore = rows.length > limit;
  const posts = (hasMore ? rows.slice(0, limit) : rows).map(shapeRecommendedPost);

  return {
    posts,
    pagination: {
      page,
      limit,
      hasMore,
    },
  };
}
