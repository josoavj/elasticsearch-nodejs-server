const client = require("./esClient");
const SyslogFilterService = require("../syslogs/syslogFilter/syslogFilterService.js");

const index = process.env.ES_TEST_INDEX || "filebeat-8.15.0";

const run = async () => {
  const response = await client.search({
    index,
    size: 25,
    query: { match_all: {} },
  });

  const payload = response.body || response;
  const hits = payload.hits.hits;
  hits.forEach((hit, hitIndex) => {
    const syslogFilter = new SyslogFilterService(hit);
    const syslogDto = syslogFilter.filterSyslog();
    console.log(`Journal Number ${hitIndex + 1}:`);
    syslogDto.showDetails();
    console.log("\n----------------------------------------\n");
  });
};

run().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
