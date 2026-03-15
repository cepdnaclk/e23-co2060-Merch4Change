const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePayload = (payload) => ({
  ...payload,
  email: typeof payload.email === "string" ? payload.email.toLowerCase().trim() : payload.email,
});

export const validateRegisterBody = (payload = {}) => {
  const normalized = normalizePayload(payload);
  const errors = [];

  if (!normalized.fullName || typeof normalized.fullName !== "string") {
    errors.push("fullName is required and must be a string.");
  }

  if (!normalized.email || typeof normalized.email !== "string") {
    errors.push("email is required and must be a string.");
  } else if (!emailPattern.test(normalized.email)) {
    errors.push("email must be a valid email address.");
  }

  if (!normalized.password || typeof normalized.password !== "string") {
    errors.push("password is required and must be a string.");
  } else if (normalized.password.length < 8) {
    errors.push("password must be at least 8 characters.");
  }

  if (
    normalized.accountType &&
    !["individual", "organization"].includes(normalized.accountType)
  ) {
    errors.push("accountType must be either 'individual' or 'organization'.");
  }

  return {
    value: normalized,
    errors,
  };
};

export const validateLoginBody = (payload = {}) => {
  const normalized = normalizePayload(payload);
  const errors = [];

  if (!normalized.email || typeof normalized.email !== "string") {
    errors.push("email is required and must be a string.");
  } else if (!emailPattern.test(normalized.email)) {
    errors.push("email must be a valid email address.");
  }

  if (!normalized.password || typeof normalized.password !== "string") {
    errors.push("password is required and must be a string.");
  }

  return {
    value: normalized,
    errors,
  };
};
