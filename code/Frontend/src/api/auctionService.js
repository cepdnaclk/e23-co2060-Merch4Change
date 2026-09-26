import apiClient from "./apiClient";

const PREFIX = "/api/v1/auctions";

export const createAuction = (data) => {
  return apiClient.post(`${PREFIX}/`, data);
};
