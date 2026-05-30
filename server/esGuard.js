const logger = require("./logger");
const config = require("./config");

let failureCount = 0;
let openedAt = 0;

const isBreakerOpen = () => {
  if (!config.es.breaker.enabled) {
    return false;
  }
  if (!openedAt) {
    return false;
  }
  const elapsed = Date.now() - openedAt;
  return elapsed < config.es.breaker.resetTimeoutMs;
};

const recordFailure = (err, meta) => {
  failureCount += 1;
  if (failureCount >= config.es.breaker.threshold) {
    openedAt = Date.now();
    logger.warn({ meta, failureCount }, "circuit_breaker_opened");
  }
  logger.error({ err, meta }, "elasticsearch_request_failed");
};

const recordSuccess = (meta) => {
  if (failureCount > 0) {
    logger.info({ meta, failureCount }, "circuit_breaker_reset");
  }
  failureCount = 0;
  openedAt = 0;
};

const runWithGuard = async (label, fn) => {
  if (isBreakerOpen()) {
    const error = new Error("Elasticsearch circuit breaker open");
    error.status = 503;
    throw error;
  }

  const start = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - start;
    logger.info({ label, durationMs }, "elasticsearch_request_ok");
    recordSuccess({ label });
    return { result, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    recordFailure(err, { label, durationMs });
    throw err;
  }
};

module.exports = { runWithGuard };
