const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateOrganizationProfileCreateBody = (payload = {}) => {
  const normalized = {
    orgName: typeof payload.orgName === "string" ? payload.orgName.trim() : payload.orgName,
    email: typeof payload.email === "string" ? payload.email.toLowerCase().trim() : payload.email,
    password: typeof payload.password === "string" ? payload.password : payload.password,
    confirmPassword:
      typeof payload.confirmPassword === "string"
        ? payload.confirmPassword
        : payload.confirmPassword,
    phone: typeof payload.phone === "string" ? payload.phone.trim() : "",
    address: typeof payload.address === "string" ? payload.address.trim() : "",
    website: typeof payload.website === "string" ? payload.website.trim() : "",
  };

  const errors = [];

  if (!normalized.orgName || typeof normalized.orgName !== "string") {
    errors.push("orgName is required and must be a string.");
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
    normalized.confirmPassword !== undefined &&
    normalized.confirmPassword !== normalized.password
  ) {
    errors.push("confirmPassword must match password.");
  }

  return {
    value: normalized,
    errors,
  };
};
