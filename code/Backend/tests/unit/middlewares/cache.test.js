import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { cacheResponse } from "../../../src/middlewares/cache.js";

const startServer = (app) => {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
    });
  });
};

test("cacheResponse sets Cache-Control header and caches GET responses", async () => {
  const app = express();
  const cache = cacheResponse(30);
  let handlerInvocations = 0;

  app.use("/cached", cache, (req, res) => {
    handlerInvocations += 1;
    res.status(200).json({ count: handlerInvocations, message: "ok" });
  });

  const server = await startServer(app);

  try {
    const address = server.address();
    const url = `http://127.0.0.1:${address.port}/cached`;

    // 1st request -> MISS
    const res1 = await fetch(url);
    const data1 = await res1.json();
    assert.equal(res1.status, 200);
    assert.equal(res1.headers.get("cache-control"), "public, max-age=30");
    assert.equal(res1.headers.get("x-cache"), "MISS");
    assert.equal(data1.count, 1);
    assert.equal(handlerInvocations, 1);

    // 2nd request -> HIT (handlerInvocations should still be 1)
    const res2 = await fetch(url);
    const data2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(res2.headers.get("cache-control"), "public, max-age=30");
    assert.equal(res2.headers.get("x-cache"), "HIT");
    assert.equal(data2.count, 1);
    assert.equal(handlerInvocations, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("cacheResponse ignores non-GET requests and non-2xx responses", async () => {
  const app = express();
  app.use(express.json());
  const cache = cacheResponse(30);
  let postInvocations = 0;
  let errorInvocations = 0;

  app.post("/post-endpoint", cache, (req, res) => {
    postInvocations += 1;
    res.status(200).json({ postInvocations });
  });

  app.get("/error-endpoint", cache, (req, res) => {
    errorInvocations += 1;
    res.status(500).json({ error: "failed", errorInvocations });
  });

  const server = await startServer(app);

  try {
    const address = server.address();

    // POST requests are not cached
    await fetch(`http://127.0.0.1:${address.port}/post-endpoint`, { method: "POST" });
    await fetch(`http://127.0.0.1:${address.port}/post-endpoint`, { method: "POST" });
    assert.equal(postInvocations, 2);

    // Error responses are not cached
    const errRes1 = await fetch(`http://127.0.0.1:${address.port}/error-endpoint`);
    assert.equal(errRes1.headers.get("x-cache"), "MISS");
    const errRes2 = await fetch(`http://127.0.0.1:${address.port}/error-endpoint`);
    assert.equal(errRes2.headers.get("x-cache"), "MISS");
    assert.equal(errorInvocations, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
