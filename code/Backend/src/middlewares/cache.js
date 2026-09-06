/**
 * In-memory response cache middleware with HTTP Cache-Control headers.
 * Caches successful (2xx) GET responses for `durationSeconds`.
 */
export const cacheResponse = (durationSeconds = 60) => {
  const cache = new Map();

  const middleware = (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl || req.url;
    const now = Date.now();
    const cached = cache.get(key);

    // Set standard HTTP Cache-Control header
    res.set("Cache-Control", `public, max-age=${durationSeconds}`);

    if (cached && cached.expiry > now) {
      res.set("X-Cache", "HIT");
      return res.status(cached.status).json(cached.body);
    }

    res.set("X-Cache", "MISS");

    // Intercept res.json to store successful response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (cache.size > 200) {
          const oldestKey = cache.keys().next().value;
          cache.delete(oldestKey);
        }
        cache.set(key, {
          expiry: Date.now() + durationSeconds * 1000,
          status: res.statusCode,
          body,
        });
      }
      return originalJson(body);
    };

    next();
  };

  middleware.clear = () => cache.clear();

  return middleware;
};

export default cacheResponse;
