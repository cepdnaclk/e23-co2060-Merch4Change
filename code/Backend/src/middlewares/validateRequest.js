import AppError from "../utils/appError.js";

const validateRequest = (schema = {}) => (req, res, next) => {
  const sections = ["body", "params", "query"];
  const validationErrors = [];

  for (const section of sections) {
    if (!schema[section]) {
      continue;
    }

    const { value, errors } = schema[section](req[section]);

    if (errors?.length) {
      validationErrors.push(
        ...errors.map((message) => ({
          section,
          message,
        })),
      );
      continue;
    }

    req[section] = value;
  }

  if (validationErrors.length) {
    // Surface the first specific message (e.g. "userName must be between 2 and
    // 30 characters.") as the top-level error message, since that's what the
    // frontend toasts display. The full list still travels in `details` for
    // any caller that wants to show every failure at once.
    const message = validationErrors[0].message;
    return next(
      new AppError(message, 400, "VALIDATION_ERROR", validationErrors),
    );
  }

  next();
};

export default validateRequest;