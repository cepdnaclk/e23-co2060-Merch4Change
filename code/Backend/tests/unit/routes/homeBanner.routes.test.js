import assert from "node:assert/strict";
import test from "node:test";
import { Writable } from "node:stream";
import express from "express";
import jwt from "jsonwebtoken";
import env from "../../../src/config/env.js";
import cloudinary from "../../../src/config/cloudinary.js";
import User from "../../../src/models/User.js";
import HomeBanner from "../../../src/models/HomeBanner.js";
import bannerRoutes from "../../../src/routes/homeBanner.routes.js";

const startServer = async (t) => {
  const app = express();
  app.use("/api/v1/home-banners", bannerRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ code: err.code });
  });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/api/v1/home-banners`;
};

test("homepage banners remain publicly readable", async (t) => {
  const banners = [{ _id: "banner1", imageUrl: "https://example.com/banner.png" }];
  t.mock.method(HomeBanner, "find", () => ({ sort: async () => banners }));
  const lookup = t.mock.method(User, "findById", () => assert.fail("Public reads must not require a user"));
  const url = await startServer(t);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), banners);
  assert.equal(lookup.mock.callCount(), 0);
});

for (const method of ["POST", "DELETE"]) {
  for (const scenario of [
    { name: "anonymous visitor", status: 401, code: "TOKEN_MISSING" },
    { name: "invalid token", invalidToken: true, status: 401, code: "INVALID_TOKEN" },
    { name: "regular user", role: "user", status: 403, code: "FORBIDDEN_ROLE" },
    { name: "brand", role: "brand", status: 403, code: "FORBIDDEN_ROLE" },
    { name: "charity", role: "charity", status: 403, code: "FORBIDDEN_ROLE" },
    { name: "suspended admin", role: "admin", inactive: true, status: 403, code: "ACCOUNT_INACTIVE" },
    { name: "active admin", role: "admin", status: method === "POST" ? 201 : 200 },
  ]) {
    test(`${method} homepage banner access for ${scenario.name}`, async (t) => {
      t.mock.method(User, "findById", () => ({
        select: async () => ({ _id: "user1", role: scenario.role, isActive: !scenario.inactive }),
      }));
      const create = t.mock.method(HomeBanner, "create", async (doc) => ({ _id: "banner1", ...doc }));
      const remove = t.mock.method(HomeBanner, "findByIdAndDelete", async () => ({ _id: "banner1" }));
      const upload = t.mock.method(cloudinary.uploader, "upload_stream", (options, callback) => new Writable({
        write(chunk, encoding, done) { done(); },
        final(done) {
          callback(null, { secure_url: "https://example.com/banner.png", public_id: "banner1" });
          done();
        },
      }));
      const url = await startServer(t);
      const headers = {};
      if (scenario.role) {
        headers.Authorization = `Bearer ${jwt.sign({ userId: "user1" }, env.jwtSecret, { expiresIn: "5m" })}`;
      } else if (scenario.invalidToken) {
        headers.Authorization = "Bearer invalid.token";
      }
      const options = { method, headers };
      if (method === "POST") {
        const form = new FormData();
        form.append("image", new Blob(["test image"], { type: "image/png" }), "banner.png");
        options.body = form;
      }
      const response = await fetch(method === "DELETE" ? `${url}/banner1` : url, options);
      const payload = await response.json();
      assert.equal(response.status, scenario.status);
      if (scenario.code) {
        assert.equal(payload.code, scenario.code);
        for (const mutation of [create, remove, upload]) {
          assert.equal(mutation.mock.callCount(), 0, "Unauthorized requests must not upload or change banners");
        }
      } else if (method === "POST") {
        assert.equal(payload.imageUrl, "https://example.com/banner.png");
        assert.equal(create.mock.callCount(), 1);
        assert.equal(upload.mock.callCount(), 1);
        assert.equal(remove.mock.callCount(), 0);
      } else {
        assert.equal(payload.message, "Deleted");
        assert.equal(remove.mock.callCount(), 1);
        assert.equal(remove.mock.calls[0].arguments[0], "banner1");
        assert.equal(create.mock.callCount(), 0);
        assert.equal(upload.mock.callCount(), 0);
      }
    });
  }
}
