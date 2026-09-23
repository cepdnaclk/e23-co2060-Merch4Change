import assert from "node:assert/strict";
import test from "node:test";

import app from "../../../src/app.js";
import postRoutes from "../../../src/routes/post.routes.js";

const routePaths = (method) =>
  postRoutes.stack
    .filter((layer) => layer.route?.methods?.[method])
    .map((layer) => layer.route.path);

test("post routes keep existing feed and mutation paths and add /recommended", () => {
  const getPaths = routePaths("get");
  const postPaths = routePaths("post");
  const deletePaths = routePaths("delete");

  assert.deepEqual(getPaths, ["/", "/recommended", "/me", "/user/:username"]);
  assert.ok(postPaths.includes("/"));
  assert.ok(postPaths.includes("/:postId/like"));
  assert.ok(postPaths.includes("/:postId/comment"));
  assert.deepEqual(deletePaths, ["/:postId"]);
});

test("GET /api/v1/posts and /recommended reject unauthenticated requests", async () => {
  const server = await new Promise((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });

  try {
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const feedResponse = await fetch(`${base}/api/v1/posts`);
    const recommendedResponse = await fetch(`${base}/api/v1/posts/recommended`);
    const feedPayload = await feedResponse.json();
    const recommendedPayload = await recommendedResponse.json();

    assert.equal(feedResponse.status, 401);
    assert.equal(recommendedResponse.status, 401);
    assert.equal(feedPayload.success, false);
    assert.equal(recommendedPayload.success, false);
    assert.equal(feedPayload.error.code, "TOKEN_MISSING");
    assert.equal(recommendedPayload.error.code, "TOKEN_MISSING");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
