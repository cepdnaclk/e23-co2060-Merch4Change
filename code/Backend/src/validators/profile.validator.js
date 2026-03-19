const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordStrongPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const phonePattern = /^[+()\-\s\d]{7,20}$/;

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
  } else if (normalized.orgName.length < 2 || normalized.orgName.length > 120) {
    errors.push("orgName must be between 2 and 120 characters.");
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
  } else if (normalized.password.length > 128) {
    errors.push("password must not exceed 128 characters.");
  } else if (!passwordStrongPattern.test(normalized.password)) {
    errors.push("password must contain at least one letter and one number.");
  }

  if (
    normalized.confirmPassword !== undefined &&
    normalized.confirmPassword !== normalized.password
  ) {
    errors.push("confirmPassword must match password.");
  }

  if (normalized.phone && !phonePattern.test(normalized.phone)) {
    errors.push("phone must be 7-20 characters and contain only digits, spaces, +, -, or parentheses.");
  }

  if (normalized.address && normalized.address.length > 250) {
    errors.push("address must not exceed 250 characters.");
  }

  if (normalized.website) {
    try {
      const parsedUrl = new URL(normalized.website);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.push("website must be a valid http or https URL.");
      }
    } catch {
      errors.push("website must be a valid URL.");
    }
  }

  return {
    value: normalized,
    errors,
  };
};
