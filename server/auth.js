const jwt = require("jsonwebtoken");
const config = require("./config");

const shouldSkip = (req) => req.path === "/health";

const authMiddleware = (req, res, next) => {
  if (!config.auth.jwtRequired || shouldSkip(req)) {
    return next();
  }

  if (!config.auth.jwtSecret) {
    const error = new Error("JWT secret is not configured");
    error.status = 500;
    return next(error);
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    const error = new Error("Missing bearer token");
    error.status = 401;
    return next(error);
  }

  try {
    const payload = jwt.verify(token, config.auth.jwtSecret, {
      issuer: config.auth.jwtIssuer,
      audience: config.auth.jwtAudience,
    });
    req.user = payload;
    return next();
  } catch (err) {
    const error = new Error("Invalid token");
    error.status = 401;
    return next(error);
  }
};

module.exports = authMiddleware;
