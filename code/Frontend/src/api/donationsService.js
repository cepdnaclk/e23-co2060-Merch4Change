import apiClient from "./apiClient";

export const getMyDonations = (page = 1) =>
  apiClient.get(`/api/v1/donations/my?page=${page}&limit=10`);

export const getDonationStats = () =>
  apiClient.get("/api/v1/donations/my/stats");

export const createVerifiedDonation = async ({ charityId, charityProjectId, coinAmount }) => {
  const response = await apiClient.post("/api/v1/donations", {
    charityId,
    charityProjectId: charityProjectId || undefined,
    coinAmount,
  });
  return response;
};

