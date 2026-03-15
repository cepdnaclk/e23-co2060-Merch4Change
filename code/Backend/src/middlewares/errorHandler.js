import { errorResponse } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";

  if (res.headersSent) {
    return next(err);
  }

  return errorResponse(
    res,
    statusCode,
    err.message || "Internal server error",
    errorCode,
    err.details || null,
    process.env.NODE_ENV === "development" ? err.stack : undefined,
  );
};

export default errorHandler;
