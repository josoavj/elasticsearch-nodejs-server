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
  rateLimit: {
    windowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
    max: toNumber(process.env.RATE_LIMIT_MAX, 120),
  },
  cache: {
    ttlMs: toNumber(process.env.CACHE_TTL_MS, 15000),
    maxEntries: toNumber(process.env.CACHE_MAX_ENTRIES, 100),
  },
  ws: {
    pollIntervalMs: toNumber(process.env.WS_POLL_INTERVAL_MS, 2000),
    batchSize: toNumber(process.env.WS_BATCH_SIZE, 50),
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  },
  auth: {
    jwtRequired: toBoolean(process.env.JWT_REQUIRED, true),
    jwtSecret: process.env.JWT_SECRET || "",
    jwtIssuer: process.env.JWT_ISSUER,
    jwtAudience: process.env.JWT_AUDIENCE,
  },
  es: {
    node: process.env.ES_NODE || "https://localhost:9200",
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
    apiKey: process.env.ES_API_KEY,
    caCertPath: process.env.ES_CA_CERT_PATH,
    rejectUnauthorized: toBoolean(process.env.ES_REJECT_UNAUTHORIZED, true),
    requestTimeout: toNumber(process.env.ES_REQUEST_TIMEOUT, 30000),
    maxRetries: toNumber(process.env.ES_MAX_RETRIES, 3),
    sniffOnStart: toBoolean(process.env.ES_SNIFF_ON_START, false),
    sniffInterval: toNumber(process.env.ES_SNIFF_INTERVAL, 0),
    trackTotalHitsDefault: toBoolean(process.env.ES_TRACK_TOTAL_HITS, false),
    terminateAfterDefault: toNumber(process.env.ES_TERMINATE_AFTER, 10000),
    terminateAfterMax: toNumber(process.env.ES_TERMINATE_AFTER_MAX, 100000),
    allowWildcards: toBoolean(process.env.ES_ALLOW_WILDCARDS, true),
    allowedIndices: (process.env.ES_ALLOWED_INDICES || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    breaker: {
      enabled: toBoolean(process.env.ES_BREAKER_ENABLED, true),
      threshold: toNumber(process.env.ES_BREAKER_THRESHOLD, 5),
      resetTimeoutMs: toNumber(process.env.ES_BREAKER_RESET_MS, 30000),
    },
  },
};
