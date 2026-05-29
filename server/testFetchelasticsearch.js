const client = require("./esClient");

const index = process.env.ES_TEST_INDEX || "filebeat-8.15.0";

const run = async () => {
  const response = await client.search({
    index,
    size: 5,
    query: { match_all: {} },
  });
  const payload = response.body || response;
  console.log("Search response:", payload.hits.hits);
};

run().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
