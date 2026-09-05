import apiClient from "./apiClient";

/**
 * Fetch ranked individual donors.
 * @param {string} timeframe - "all_time" | "month" | "week"
 * @param {number} limit - max number of rows to return
 */
export const getDonorLeaderboard = async (timeframe = "all_time", limit = 20) => {
  const response = await apiClient.get("/api/v1/leaderboards/donors", {
    params: { timeframe, limit },
  });
  return response.data;
};

/**
 * Fetch ranked company & brand CSR impact.
 * @param {string} timeframe - "all_time" | "month" | "week"
 * @param {number} limit - max number of rows to return
 */
export const getCompanyLeaderboard = async (timeframe = "all_time", limit = 20) => {
  const response = await apiClient.get("/api/v1/leaderboards/companies", {
    params: { timeframe, limit },
  });
  return response.data;
};

/**
 * Fetch platform community aggregate metrics.
 */
export const getLeaderboardStats = async () => {
  const response = await apiClient.get("/api/v1/leaderboards/stats");
  return response.data;
};
