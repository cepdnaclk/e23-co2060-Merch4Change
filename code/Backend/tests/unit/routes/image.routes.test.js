import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import env from "../../../src/config/env.js";
import User from "../../../src/models/User.js";
import Product from "../../../src/models/Product.js";
import Brand from "../../../src/models/Brand.js";
import imageRoutes from "../../../src/routes/image.routes.js";

const productId = new mongoose.Types.ObjectId();
const ownerId = new mongoose.Types.ObjectId();
const otherId = new mongoose.Types.ObjectId();
const brandId = new mongoose.Types.ObjectId();

const startServer = async (t) => {
  const app = express();
  app.use("/api/v1/images", imageRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ code: err.code });
  });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/api/v1/images/product`;
};

for (const scenario of [
  { name: "anonymous visitor", anonymous: true, status: 401 },
  { name: "invalid token", invalidToken: true, status: 401 },
  { name: "unrelated user", userId: otherId, status: 403 },
  { name: "unrelated admin", userId: otherId, role: "admin", status: 403 },
  { name: "unrelated brand owner", userId: otherId, brandOwnerId: ownerId, status: 403 },
  { name: "suspended product owner", userId: ownerId, inactive: true, status: 403 },
  { name: "product owner", userId: ownerId, status: 200 },
  { name: "product brand owner", userId: otherId, brandOwnerId: otherId, status: 200 },
  { name: "invalid product ID", userId: ownerId, invalidId: true, status: 400 },
  { name: "missing product", userId: ownerId, missingProduct: true, status: 404 },
]) {
  test(`product image upload access for ${scenario.name}`, async (t) => {
    t.mock.method(User, "findById", () => ({
      select: async () => ({ _id: scenario.userId, role: scenario.role || "user", isActive: !scenario.inactive }),
    }));
    const previousImage = { data: Buffer.from("original"), contentType: "image/png" };
    const save = t.mock.fn(async () => {});
    const product = { _id: productId, ownerUserId: ownerId, image: previousImage, save,
      ...(scenario.brandOwnerId ? { brandId } : {}),
    };
    const lookup = t.mock.method(Product, "findById", async () => scenario.missingProduct ? null : product);
    t.mock.method(Brand, "findById", async () => ({ _id: brandId, ownerUserId: scenario.brandOwnerId }));
    const url = await startServer(t);
    const headers = {};
    if (scenario.invalidToken) {
      headers.Authorization = "Bearer invalid.token";
    } else if (!scenario.anonymous) {
      headers.Authorization = `Bearer ${jwt.sign({ userId: String(scenario.userId) }, env.jwtSecret, { expiresIn: "5m" })}`;
    }
    const form = new FormData();
    form.append("image", new Blob(["replacement"], { type: "image/png" }), "product.png");
    const response = await fetch(`${url}/${scenario.invalidId ? "invalid" : productId}`, {
      method: "POST", headers, body: form,
    });
    await response.json();
    assert.equal(response.status, scenario.status);
    if (scenario.status === 200) {
      assert.equal(save.mock.callCount(), 1);
      assert.equal(product.image.data.toString(), "replacement");
      assert.equal(product.image.contentType, "image/png");
    } else {
      assert.equal(save.mock.callCount(), 0);
      assert.equal(product.image, previousImage, "Rejected requests must preserve the original image");
    }
    if (scenario.anonymous || scenario.invalidToken || scenario.inactive) {
      assert.equal(lookup.mock.callCount(), 0);
    }
  });
}

test("product images remain publicly readable", async (t) => {
  t.mock.method(Product, "findById", async () => ({
    image: { data: Buffer.from("original"), contentType: "image/png" },
  }));
  const url = await startServer(t);
  const response = await fetch(`${url}/${productId}`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.equal(await response.text(), "original");
});
