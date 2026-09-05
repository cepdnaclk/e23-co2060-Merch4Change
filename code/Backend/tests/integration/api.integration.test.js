import test, { after, before } from "node:test";
import assert from "node:assert/strict";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import app from "../../src/app.js";
import env from "../../src/config/env.js";
import Brand from "../../src/models/Brand.js";
import CoinTransaction from "../../src/models/CoinTransaction.js";
import Order from "../../src/models/Order.js";
import Product from "../../src/models/Product.js";
import OrganizationProfile from "../../src/models/OrganizationProfile.js";
import User from "../../src/models/User.js";

import mongoose from "mongoose";

let server;
let baseUrl;

const originalFindOne = User.findOne;
const originalFindById = User.findById;
const originalCreate = User.create;
const originalOrgFindOne = OrganizationProfile.findOne;
const originalOrgCreate = OrganizationProfile.create;
const originalProductFind = Product.find;
const originalProductFindById = Product.findById;
const originalProductCreate = Product.create;
const originalOrderFind = Order.find;
const originalOrderFindById = Order.findById;
const originalOrderCreate = Order.create;
const originalBrandFindOne = Brand.findOne;
const originalBrandCreate = Brand.create;
const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;
const originalCoinTransactionCreate = CoinTransaction.create;
const originalHash = bcrypt.hash;
const originalCompare = bcrypt.compare;
const originalSign = jwt.sign;

const restoreMocks = () => {
  User.findOne = originalFindOne;
  User.findById = originalFindById;
  User.create = originalCreate;
  OrganizationProfile.findOne = originalOrgFindOne;
  OrganizationProfile.create = originalOrgCreate;
  Product.find = originalProductFind;
  Product.findById = originalProductFindById;
  Product.create = originalProductCreate;
  Order.find = originalOrderFind;
  Order.findById = originalOrderFindById;
  Order.create = originalOrderCreate;
  Brand.findOne = originalBrandFindOne;
  Brand.create = originalBrandCreate;
  User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
  CoinTransaction.create = originalCoinTransactionCreate;
  bcrypt.hash = originalHash;
  bcrypt.compare = originalCompare;
  jwt.sign = originalSign;
};

before(async () => {
  await mongoose.connect(env.mongodbUri || "mongodb://127.0.0.1:27017/merch4change");
  server = await new Promise((resolve) => {
    const started = app.listen(0, () => resolve(started));
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  restoreMocks();
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test("POST /api/v1/auth/register returns validation error when accountType is missing", async () => {
  restoreMocks();

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "jane@example.com",
      password: "Pass1234",
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
});

test("POST /api/v1/auth/register creates an individual profile and sends OTP", async () => {
  restoreMocks();

  bcrypt.hash = async () => "hashed-pass";
  jwt.sign = () => "register-token";
  User.findOne = async () => null;

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      firstName: "Jane",
      lastName: "Doe",
      userName: "jane",
      email: "JANE@EXAMPLE.COM",
      password: "Pass1234",
      accountType: "user",
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.match(payload.message, /Verification code sent/i);
});

test("POST /api/v1/auth/register creates an organization profile and sends OTP", async () => {
  restoreMocks();

  bcrypt.hash = async () => "hashed-pass";
  jwt.sign = () => "org-register-token";
  User.findOne = async () => null;
  OrganizationProfile.findOne = async () => null;

  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      orgName: "Green Earth Foundation",
      email: "ORG@EXAMPLE.COM",
      password: "Pass1234",
      phone: "+1 555 000 2222",
      address: "456 Green Way",
      website: "https://greenearth.org",
      accountType: "organization",
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.match(payload.message, /Verification code sent/i);
});

test("POST /api/v1/auth/login returns auth payload for valid credentials", async () => {
  restoreMocks();

  User.findOne = () => ({
    select: async () => ({
      _id: "user-2",
      userName: "jane",
      email: "jane@example.com",
      password: "stored-hash",
      accountType: "organization",
      isActive: true,
    }),
  });
  bcrypt.compare = async () => true;
  jwt.sign = () => "login-token";

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "jane@example.com",
      password: "Pass1234",
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.accessToken, "login-token");
  assert.equal(payload.data.loginType, "organization");
  assert.equal(payload.data.user.userName, "jane");
});

test("GET /api/v1/profile/me rejects requests without a bearer token", async () => {
  restoreMocks();

  const response = await fetch(`${baseUrl}/api/v1/profile/me`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.success, false);
  assert.equal(payload.error.code, "TOKEN_MISSING");
});

test("GET /api/v1/profile/me returns current user for a valid token", async () => {
  restoreMocks();

  const token = jwt.sign({ userId: "user-3" }, env.jwtSecret, { expiresIn: "1h" });
  User.findById = () => ({
    select: async () => ({
      _id: "user-3",
      userName: "current-user",
      accountType: "individual",
      email: "current@example.com",
    }),
  });

  const response = await fetch(`${baseUrl}/api/v1/profile/me`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.user.userName, "current-user");
  assert.equal(payload.data.user.email, "current@example.com");
});

test("GET /api/v1/marketplace/products returns products", async () => {
  restoreMocks();

  Product.find = () => ({
    populate: async () => [
      {
        _id: "product-1",
        name: "Solar Bottle",
        price: 25,
        stock: 8,
      },
    ],
  });

  const response = await fetch(`${baseUrl}/api/v1/marketplace/products`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.products.length, 1);
  assert.equal(payload.data.products[0].name, "Solar Bottle");
});

test("POST /api/v1/marketplace/products creates a product for individual accounts", async () => {
  restoreMocks();

  const token = jwt.sign({ userId: "user-product-2" }, env.jwtSecret, { expiresIn: "1h" });

  User.findById = () => ({
    select: async () => ({
      _id: "user-product-2",
      userName: "seller",
      accountType: "individual",
      email: "seller@example.com",
    }),
  });

  Brand.findOne = async () => null;
  Brand.create = async (data) => ({
    _id: "brand-1",
    ownerUserId: data.ownerUserId,
    brandName: data.brandName,
  });
  Product.create = async (data) => ({
    _id: "product-2",
    ...data,
  });

  const response = await fetch(`${baseUrl}/api/v1/marketplace/products`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Reusable Bag",
      description: "A durable reusable shopping bag.",
      price: 12.5,
      stock: 30,
      isLimitedEdition: false,
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.success, true);
  assert.equal(payload.data.product.brandId, "brand-1");
  assert.equal(payload.data.product.name, "Reusable Bag");
});

test("POST /api/v1/marketplace/checkout creates a paid order and order items", async () => {
  restoreMocks();

  const token = jwt.sign({ userId: "user-checkout-1" }, env.jwtSecret, { expiresIn: "1h" });

  User.findById = () => ({
    select: async () => ({
      _id: "user-checkout-1",
      userName: "buyer",
      accountType: "individual",
      email: "buyer@example.com",
    }),
  });

  const productState = {
    _id: "product-checkout-1",
    name: "Eco Mug",
    price: 20,
    stock: 5,
    save: async function () {
      return this;
    },
  };

  Product.findById = async () => productState;
  User.findByIdAndUpdate = async () => ({});
  CoinTransaction.create = async (data) => ({
    _id: "coin-tx-1",
    ...data,
  });
  Order.create = async (data) => ({
    _id: "order-1",
    ...data,
  });

  const response = await fetch(`${baseUrl}/api/v1/marketplace/checkout`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [{ productId: "product-checkout-1", quantity: 2 }],
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.success, true);
  assert.equal(payload.data.order.status, "paid");
  assert.equal(payload.data.order.totalAmount, 40);
  assert.equal(payload.data.order.items.length, 1);
  assert.equal(payload.data.items.length, 1);
  assert.equal(productState.stock, 3);
});