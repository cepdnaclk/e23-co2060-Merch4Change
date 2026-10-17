const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const normalizeString = (value) =>
  typeof value === "string" ? value.trim() : value;

const normalizeProduct = (payload = {}) => {
  const normalized = {
    name: normalizeString(payload.name),
    description: normalizeString(payload.description),
    price:
      typeof payload.price === "string" ? Number(payload.price) : payload.price,
    stock:
      payload.stock === undefined
        ? 0
        : typeof payload.stock === "string"
          ? Number(payload.stock)
          : payload.stock,
    isLimitedEdition: Boolean(payload.isLimitedEdition),
  };

  if (payload.currency !== undefined) {
    normalized.currency = normalizeString(payload.currency);
  }
  if (Array.isArray(payload.images)) {
    normalized.images = payload.images;
  }
  if (payload.imageUrl !== undefined) {
    normalized.imageUrl = normalizeString(payload.imageUrl);
  }
  if (payload.isPublished !== undefined) {
    normalized.isPublished = Boolean(payload.isPublished);
  }

  return normalized;
};

export const validateProductCreateBody = (payload = {}) => {
  const normalized = normalizeProduct(payload);
  const errors = [];

  if (!isNonEmptyString(normalized.name)) {
    errors.push("name is required and must be a string.");
  }

  if (!isNonEmptyString(normalized.description)) {
    errors.push("description is required and must be a string.");
  }

  if (!isValidNumber(normalized.price) || normalized.price < 0) {
    errors.push("price is required and must be a non-negative number.");
  }

  if (!isValidNumber(normalized.stock) || normalized.stock < 0) {
    errors.push("stock is required and must be a non-negative number.");
  }

  return {
    value: normalized,
    errors,
  };
};

export const validateProductUpdateBody = (payload = {}) => {
  const normalized = {};
  const errors = [];

  if (payload.name !== undefined) {
    normalized.name = normalizeString(payload.name);
    if (!isNonEmptyString(normalized.name)) {
      errors.push("name must be a non-empty string.");
    }
  }

  if (payload.description !== undefined) {
    normalized.description = normalizeString(payload.description);
    if (!isNonEmptyString(normalized.description)) {
      errors.push("description must be a non-empty string.");
    }
  }

  if (payload.price !== undefined) {
    normalized.price =
      typeof payload.price === "string" ? Number(payload.price) : payload.price;
    if (!isValidNumber(normalized.price) || normalized.price < 0) {
      errors.push("price must be a non-negative number.");
    }
  }

  if (payload.stock !== undefined) {
    normalized.stock =
      typeof payload.stock === "string" ? Number(payload.stock) : payload.stock;
    if (!isValidNumber(normalized.stock) || normalized.stock < 0) {
      errors.push("stock must be a non-negative number.");
    }
  }

  if (payload.isLimitedEdition !== undefined) {
    normalized.isLimitedEdition = Boolean(payload.isLimitedEdition);
  }

  if (payload.currency !== undefined) {
    normalized.currency = normalizeString(payload.currency);
  }

  if (Array.isArray(payload.images)) {
    normalized.images = payload.images;
  }

  if (payload.imageUrl !== undefined) {
    normalized.imageUrl = normalizeString(payload.imageUrl);
  }

  if (payload.isPublished !== undefined) {
    normalized.isPublished = Boolean(payload.isPublished);
  }

  if (Object.keys(normalized).length === 0) {
    errors.push("At least one product field must be provided.");
  }

  return {
    value: normalized,
    errors,
  };
};

export const validateCheckoutBody = (payload = {}) => {
  const normalizedItems = Array.isArray(payload.items)
    ? payload.items.map((item) => ({
        productId: normalizeString(item?.productId),
        quantity:
          typeof item?.quantity === "string"
            ? Number(item.quantity)
            : item?.quantity,
      }))
    : [];

  const errors = [];

  if (!Array.isArray(payload.items) || !payload.items.length) {
    errors.push("items is required and must contain at least one item.");
  }

  normalizedItems.forEach((item, index) => {
    if (!isNonEmptyString(item.productId)) {
      errors.push(
        `items[${index}].productId is required and must be a string.`,
      );
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push(
        `items[${index}].quantity must be an integer greater than 0.`,
      );
    }
  });

  return {
    value: { items: normalizedItems },
    errors,
  };
};
