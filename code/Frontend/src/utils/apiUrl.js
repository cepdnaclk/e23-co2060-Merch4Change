/**
 * Normalizes the API base URL to ensure:
 * 1. Protocol is present (automatically prepends https:// if omitted, or http:// for localhost).
 * 2. Trailing slashes are stripped to prevent double-slash path issues.
 */
export const normalizeApiUrl = (raw) => {
  const url = (raw || "").trim();
  if (!url) return "http://localhost:5000";

  if (/^https?:\/\//i.test(url)) {
    return url.replace(/\/+$/, "");
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return `http://${url}`.replace(/\/+$/, "");
  }

  return `https://${url}`.replace(/\/+$/, "");
};

export const API_BASE = normalizeApiUrl(import.meta.env.VITE_API_URL);

export default API_BASE;
