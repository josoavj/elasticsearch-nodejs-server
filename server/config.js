require("dotenv").config();

const toBoolean = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }
  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

module.exports = {
  port: toNumber(process.env.PORT, 3000),
  es: {
    node: process.env.ES_NODE || "https://localhost:9200",
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
    apiKey: process.env.ES_API_KEY,
    caCertPath: process.env.ES_CA_CERT_PATH,
    rejectUnauthorized: toBoolean(process.env.ES_REJECT_UNAUTHORIZED, true),
    requestTimeout: toNumber(process.env.ES_REQUEST_TIMEOUT, 30000),
  },
};
