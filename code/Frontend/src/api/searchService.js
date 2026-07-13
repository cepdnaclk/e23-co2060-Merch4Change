import apiClient from "./apiClient";

export const searchAll = (query, options = {}) =>
  apiClient.get(`/api/search?q=${encodeURIComponent(query)}`, options);

export default apiClient;
