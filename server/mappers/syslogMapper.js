const mapSyslog = (hit) => {
  const source = hit?._source || {};
  const mapped = {
    id: hit?._id,
    index: hit?._index,
    timestamp: source["@timestamp"],
    message: source.message,
    source: {
      ip: source.source?.ip,
      port: source.source?.port,
      bytes: source.source?.bytes,
      natIp: source.source?.nat?.ip,
      natPort: source.source?.nat?.port,
    },
    destination: {
      ip: source.destination?.ip,
      port: source.destination?.port,
      bytes: source.destination?.bytes,
      address: source.destination?.address,
      org: source.destination?.as?.organization?.name,
    },
    rule: {
      name: source.rule?.name,
      id: source.rule?.id,
      category: source.rule?.category,
    },
    network: {
      bytes: source.network?.bytes,
      transport: source.network?.transport,
      direction: source.network?.direction,
      protocol: source.network?.protocol,
    },
    related: {
      ip: source.related?.ip,
      hosts: source.related?.hosts,
    },
    fortinet: {
      action: source.fortinet?.firewall?.action,
      dstinetsvc: source.fortinet?.firewall?.dstinetsvc,
      vwlquality: source.fortinet?.firewall?.vwlquality,
    },
    event: {
      action: source.event?.action,
      outcome: source.event?.outcome,
      duration: source.event?.duration,
    },
  };

  return mapped;
};

module.exports = { mapSyslog };
