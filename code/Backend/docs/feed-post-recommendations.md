# Feed post recommendation scoring

Ranks social feed posts for the currently authenticated user using MongoDB aggregation. The existing chronological feed (`GET /api/v1/posts`) is unchanged.

## What it does

`GET /api/v1/posts/recommended` returns recent posts sorted by an explainable recommendation score for `req.user`.

## Signals used (existing data only)

| Signal | Source |
| --- | --- |
| Relationship | `Follow` (`followerId` / `followingId`). Own posts get a small boost. |
| Engagement | `Post.likes` length and `Post.comments` length |
| Recency | `Post.createdAt` exponential decay |
| Interaction | Authors the user has already liked or commented on; extra weight if they liked/commented on this post |

Posts have no tags/categories. The separate `Like` collection is not used because likes are stored on `Post.likes`. User-suggestion (`GET /api/v1/profile/suggested`) is unrelated.

## Score formula

Weights live in `src/services/postRecommendation.service.js` (`RECOMMENDATION_WEIGHTS`).

```
relationshipScore =
  40 if the viewer follows the author
  else 8 if the post is the viewer's own
  else 0

engagementScore = min(30, likesCount * 2 + commentsCount * 4)

recencyScore = 20 * (0.5 ^ (ageHours / 48))

interactionScore =
  15 if the viewer liked or commented on any post by this author
  + 5 if the viewer liked this post
  + 5 if the viewer commented on this post

recommendationScore =
  relationshipScore + engagementScore + recencyScore + interactionScore
```

Each response item includes `recommendationScore` and `scoreBreakdown`.

## MongoDB aggregation

1. Load follow targets (`Follow.distinct`) and authors the user has interacted with (`Post.distinct`) — two queries, not per-post N+1.
2. Take the **500** most recent posts (`$sort` `createdAt` + `$limit`), score them in the database, then `$sort` by score.
3. Paginate with `$skip` / `$limit` (`limit + 1` to compute `hasMore`).
4. `$lookup` authors and comment authors from `users`.

No new index was added. Scoring cannot use a btree index. A future `{ createdAt: -1 }` index would only speed the candidate window.

## API

**Endpoint:** `GET /api/v1/posts/recommended`

**Auth:** Bearer access token (same `protect` middleware as other post routes).

**Query:** `page` (default 1), `limit` (default 20, max 50).

### Example request

```http
GET /api/v1/posts/recommended?page=1&limit=20
Authorization: Bearer <accessToken>
```

### Example response

```json
{
  "success": true,
  "posts": [
    {
      "_id": "66f0...",
      "id": "66f0...",
      "content": "Campaign update",
      "images": [],
      "likes": ["66aa..."],
      "comments": [],
      "createdAt": "2026-09-23T10:00:00.000Z",
      "likesCount": 1,
      "commentsCount": 0,
      "userId": {
        "_id": "66bb...",
        "firstName": "Ada",
        "lastName": "Ng",
        "userName": "ada",
        "profileImageUrl": ""
      },
      "recommendationScore": 67.14,
      "scoreBreakdown": {
        "relationship": 40,
        "engagement": 2,
        "recency": 10.14,
        "interaction": 15
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "hasMore": false }
}
```

Unauthenticated requests return **401** (`TOKEN_MISSING` / `INVALID_TOKEN`).

## Limitations

- Only the 500 newest posts are scored.
- No topic/tag affinity (those fields do not exist on posts).
- Cold start: ranking falls back to recency + engagement.
- The `Like` collection is unused by current like/unlike.

## Possible future ML improvements

Collaborative filtering, embeddings/vector search, or learned weights could replace this linear score without changing the endpoint shape.
