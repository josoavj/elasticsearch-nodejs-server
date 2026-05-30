const fs = require("fs");
const { Client } = require("@elastic/elasticsearch");
const config = require("./config");

const buildClientOptions = () => {
  const options = {
    node: config.es.node,
    requestTimeout: config.es.requestTimeout,
    maxRetries: config.es.maxRetries,
    sniffOnStart: config.es.sniffOnStart,
    sniffInterval: config.es.sniffInterval > 0 ? config.es.sniffInterval : false,
  };

  if (config.es.apiKey) {
    options.auth = { apiKey: config.es.apiKey };
  } else if (config.es.username && config.es.password) {
    options.auth = { username: config.es.username, password: config.es.password };
  }

  if (config.es.caCertPath) {
    options.tls = {
      ca: fs.readFileSync(config.es.caCertPath),
      rejectUnauthorized: config.es.rejectUnauthorized,
    };
  } else if (config.es.rejectUnauthorized === false) {
    options.tls = { rejectUnauthorized: false };
  }

  return options;
};

const client = new Client(buildClientOptions());

module.exports = client;
