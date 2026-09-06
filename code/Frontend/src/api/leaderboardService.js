import apiClient from "./apiClient";

/**
 * Fetch ranked individual donors.
 * @param {string} timeframe - "all_time" | "month" | "week"
 * @param {number} limit - max number of rows to return
 */
export const getDonorLeaderboard = async (timeframe = "all_time", limit = 20, page = 1) => {
  const response = await apiClient.get("/api/v1/leaderboards/donors", {
    params: { timeframe, limit, page },
  });
  return response.data;
};

/**
 * Fetch ranked company & brand CSR impact.
 * @param {string} timeframe - "all_time" | "month" | "week"
 * @param {number} limit - max number of rows to return
 * @param {number} page - page number (1-based)
 */
export const getCompanyLeaderboard = async (timeframe = "all_time", limit = 20, page = 1) => {
  const response = await apiClient.get("/api/v1/leaderboards/companies", {
    params: { timeframe, limit, page },
  });
  return response.data;
};

/**
 * Fetch ranked charities & causes by impact coins raised.
 * @param {string} timeframe - "all_time" | "month" | "week"
 * @param {number} limit - max number of rows to return
 * @param {number} page - page number (1-based)
 */
export const getCharityLeaderboard = async (timeframe = "all_time", limit = 20, page = 1) => {
  const response = await apiClient.get("/api/v1/leaderboards/charities", {
    params: { timeframe, limit, page },
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

