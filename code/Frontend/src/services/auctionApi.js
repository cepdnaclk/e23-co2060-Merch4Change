import apiClient from "../api/apiClient";

export const listAuctions = async (params = {}) => {
  const response = await apiClient.get("/api/v1/auctions", { params });
  return response.data;
};

export const getAuction = async (id) => {
  const response = await apiClient.get(`/api/v1/auctions/${id}`);
  return response.data;
};

export const getAuctionBids = async (id) => {
  const response = await apiClient.get(`/api/v1/auctions/${id}/bids`);
  return response.data;
};

export const placeBid = async (id, amount) => {
  const response = await apiClient.post(`/api/v1/auctions/${id}/bid`, { amount });
  return response.data;
};

export const createAuction = async (payload) => {
  const response = await apiClient.post("/api/v1/auctions", payload);
  return response.data;
};
