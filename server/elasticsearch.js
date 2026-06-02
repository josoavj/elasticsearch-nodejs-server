const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");
const authMiddleware = require("./auth");
const config = require("./config");

const app = express();

const corsOptions = {
  origin: config.cors.origins.length > 0 ? config.cors.origins : false,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authMiddleware, apiRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message, details: err.details });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
