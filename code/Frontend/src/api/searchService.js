import apiClient from "./apiClient";

export const searchAll = (query, page = 1, limit = 8, options = {}) =>
  apiClient.get(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, options);

export default apiClient;
