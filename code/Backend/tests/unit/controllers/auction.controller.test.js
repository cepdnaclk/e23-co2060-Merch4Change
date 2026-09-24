import test from "node:test";
import assert from "node:assert/strict";

import { createMockResponse } from "../helpers/http.js";
import Auction from "../../../src/models/Auction.js";
import Bid from "../../../src/models/Bid.js";
import {
  createAuction,
  getAuction,
  getBids,
  listAuctions,
} from "../../../src/controllers/auction.controller.js";

test("createAuction rejects request missing productId", async () => {
  const req = {
    user: { _id: "user1" },
    body: { startPrice: 100 },
  };
  const res = createMockResponse();

  await createAuction(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
});

test("getAuction returns 404 when auction does not exist", async (t) => {
  t.mock.method(Auction, "findById", () => ({
    populate: () => ({
      populate: () => ({
        populate: () => null,
      }),
    }),
  }));

  const req = { params: { id: "507f1f77bcf86cd799439011" } };
  const res = createMockResponse();

  await getAuction(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.payload.success, false);
});

test("getAuction returns populated auction data when found", async (t) => {
  const mockAuction = {
    _id: "507f1f77bcf86cd799439011",
    startPrice: 50,
    currentPrice: 75,
    status: "active",
    productId: { name: "Vintage Tee" },
    currentBidder: { userName: "bidder1" },
    save: async () => {},
  };

  t.mock.method(Auction, "findById", () => ({
    populate: () => ({
      populate: () => ({
        populate: () => mockAuction,
      }),
    }),
  }));

  const req = { params: { id: "507f1f77bcf86cd799439011" } };
  const res = createMockResponse();

  await getAuction(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.auction.currentPrice, 75);
});

test("listAuctions returns active auctions list", async (t) => {
  const mockAuctions = [
    { _id: "auc1", currentPrice: 100, status: "active" },
    { _id: "auc2", currentPrice: 150, status: "active" },
  ];

  t.mock.method(Auction, "updateMany", async () => ({ modifiedCount: 0 }));
  t.mock.method(Auction, "find", (query) => {
    if (query?.status === "active" && query?.endTime) {
      return { populate: () => [] };
    }
    return {
      populate: () => ({
        populate: () => ({
          sort: () => mockAuctions,
        }),
      }),
    };
  });

  const req = { query: { status: "active" } };
  const res = createMockResponse();

  await listAuctions(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.auctions.length, 2);
});

test("getBids returns list of bids for specified auction", async (t) => {
  const mockBids = [
    { _id: "b1", amount: 150, userId: { userName: "alice" } },
    { _id: "b2", amount: 120, userId: { userName: "bob" } },
  ];

  t.mock.method(Bid, "find", () => ({
    sort: () => ({
      populate: () => mockBids,
    }),
  }));

  const req = { params: { id: "auc1" } };
  const res = createMockResponse();

  await getBids(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.bids.length, 2);
});
