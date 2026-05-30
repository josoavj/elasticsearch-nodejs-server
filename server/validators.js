const config = require("./config");

const INDEX_PATTERN = /^[a-zA-Z0-9_.*,-]+$/;
const FIELD_PATTERN = /^[a-zA-Z0-9_.*@-]+(\.[a-zA-Z0-9_.*@-]+)*$/;

const splitList = (value) =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const hasWildcard = (value) => value.includes("*") || value.includes("?");

const ensureAllowedIndices = (indexValue) => {
  if (!INDEX_PATTERN.test(indexValue)) {
    const error = new Error("Invalid index format");
    error.status = 400;
    throw error;
  }

  if (!config.es.allowWildcards && hasWildcard(indexValue)) {
    const error = new Error("Wildcard indices are not allowed");
    error.status = 400;
    throw error;
  }

  if (config.es.allowedIndices.length > 0) {
    const requested = splitList(indexValue);
    const denied = requested.filter((item) => !config.es.allowedIndices.includes(item));
    if (denied.length > 0) {
      const error = new Error("Index not allowed");
      error.status = 403;
      error.details = denied;
      throw error;
    }
  }
};

const ensureAllowedFields = (fieldsValue) => {
  const fields = splitList(fieldsValue);
  if (fields.length === 0) {
    const error = new Error("At least one field is required");
    error.status = 400;
    throw error;
  }

  const invalid = fields.filter((field) => !FIELD_PATTERN.test(field));
  if (invalid.length > 0) {
    const error = new Error("Invalid field names");
    error.status = 400;
    error.details = invalid;
    throw error;
  }

  return fields;
};

const ensureAllowedSortField = (value) => {
  if (!value) {
    return;
  }
  if (!FIELD_PATTERN.test(value)) {
    const error = new Error("Invalid sort field");
    error.status = 400;
    throw error;
  }
};

module.exports = {
  ensureAllowedIndices,
  ensureAllowedFields,
  ensureAllowedSortField,
  splitList,
};
