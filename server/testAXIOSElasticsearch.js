const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const https = require("https");
const SyslogFilterService = require("../syslogs/syslogFilter/syslogFilterService.js");

// Desactiver la connexion SSL
const agent = new https.Agent({ rejectUnauthorized: false });

/**
 * Vérification de la connexion à Elasticsearch
 * Mode de connexion
 * > Via une authentification basique
 * > Plus le certificat de sécurité http.ca géneré automatiquement par
 * elasticsearch
 */
const { Client, BaseConnection } = require("@elastic/elasticsearch");
const { ALL } = require("dns");
const client = new Client({
  node: "https://stagiaire:Police2405$.168.0.19:9200",
  tls: {
    ca: fs.readFileSync("./assets/http_ca.crt"),
    rejectUnauthorized: false,
  },
});

client
  .ping()
  .then(() => console.log("Connected to Elasticsearch"))
  .catch((err) => console.error("Error connecting to Elasticsearch", err));
module.exports = client;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// searching on query
app.get("/search/:index/:type", async (req, res) => {
  const { phraseSearch } = require("./SearchEngine");
  const data = await phraseSearch(
    req.params.index,
    req.params.type,
    req.query.q,
  );
  res.json(data);
});

// Test si le serveur est fonctionnel
app.listen(3000, () => console.log("Server running at 3000"));

// Utilisation de AXIOS
axios
  .get(
    "https://172.27.28.14:9200/filebeat-8.15.0/_search",
    // Authentification
    {
      httpsAgent: agent,
      auth: { username: "stgSFI", password: "Police2405$" },
      headers: { "Content-Type": "application/json" },
      tls: {
        ca: fs.readFileSync("./assets/http_ca.crt"),
        rejectUnauthorized: false,
      },
      data: {
        size: 25, 
      },
    },
  )
  .then((response) => {
    const hits = response.data.hits.hits;
        hits.forEach((hit, index) => {
          let syslogFilter = new SyslogFilterService(hit);
          let syslogDto = syslogFilter.filterSyslog();
          console.log(`Journal Number ${index + 1}:`);
          syslogDto.showDetails();
          console.log('\n----------------------------------------\n');
        });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
