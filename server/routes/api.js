const express = require("express");
const { z } = require("zod");
const client = require("../esClient");

const router = express.Router();

const toNumber = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseSearchAfter = (value) => {
  if (!value) {
    return undefined;
  }
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parsed = Number(entry);
      return Number.isNaN(parsed) ? entry : parsed;
    });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const indicesQuerySchema = z
  .object({
    index: z.string().min(1).optional(),
    includeHidden: z
      .string()
      .transform((value) => value.toLowerCase())
      .refine((value) => value === "true" || value === "false", {
        message: "includeHidden must be true or false",
      })
      .optional(),
  })
  .strict();

const searchQuerySchema = z
  .object({
    index: z.string().min(1),
    q: z.string().min(1),
    fields: z.string().optional(),
    size: z.coerce.number().int().min(1).max(100).optional(),
    from: z.coerce.number().int().min(0).max(10000).optional(),
    page: z.coerce.number().int().min(1).max(1000).optional(),
    perPage: z.coerce.number().int().min(1).max(100).optional(),
    mode: z.enum(["match", "phrase_prefix"]).optional(),
    sortField: z.string().min(1).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    searchAfter: z.string().optional(),
    trackTotalHits: z.coerce.boolean().optional(),
  })
  .strict();

const formatValidationError = (issues) =>
  issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));

router.get("/health", async (req, res, next) => {
  try {
    await client.ping();
    const health = await client.cluster.health();
    const cluster = health.body || health;
    res.json({ ok: true, cluster });
  } catch (error) {
    next(error);
  }
});

router.get("/indices", async (req, res, next) => {
  try {
    const parsed = indicesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const error = new Error("Invalid query parameters");
      error.status = 400;
      error.details = formatValidationError(parsed.error.issues);
      throw error;
    }

    const index = parsed.data.index || "*";
    const includeHidden = parsed.data.includeHidden === "true";
    const indices = await client.cat.indices({
      format: "json",
      index,
      expand_wildcards: includeHidden ? "all" : "open",
    });
    const records = indices.records || indices.body || indices;
    res.json({ indices: records });
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      const error = new Error("Invalid query parameters");
      error.status = 400;
      error.details = formatValidationError(parsed.error.issues);
      throw error;
    }

    const {
      index,
      q,
      fields,
      size,
      from,
      page,
      perPage,
      mode,
      sortField,
      sortOrder,
      searchAfter,
      trackTotalHits,
    } = parsed.data;

    const parsedFields = String(fields || "message")
      .split(",")
      .map((field) => field.trim())
      .filter(Boolean);

    if (parsedFields.length === 0) {
      const error = new Error("At least one field is required");
      error.status = 400;
      throw error;
    }

    const requestedPerPage = perPage ?? size ?? 10;
    const normalizedSize = clamp(toNumber(requestedPerPage, 10), 1, 100);
    const normalizedFrom = page
      ? clamp((page - 1) * normalizedSize, 0, 10000)
      : clamp(toNumber(from, 0), 0, 10000);

    const normalizedMode = mode || "match";
    const searchAfterValues = parseSearchAfter(searchAfter);
    if (searchAfterValues && !sortField) {
      const error = new Error("searchAfter requires sortField");
      error.status = 400;
      throw error;
    }

    let query;
    if (q === "*") {
      query = { match_all: {} };
    } else if (normalizedMode === "phrase_prefix") {
      query = {
        multi_match: {
          query: q,
          fields: parsedFields,
          type: "phrase_prefix",
        },
      };
    } else {
      query = {
        multi_match: {
          query: q,
          fields: parsedFields,
          type: "best_fields",
        },
      };
    }

    const sort = sortField ? [{ [sortField]: { order: sortOrder || "asc" } }] : undefined;
    const searchParams = {
      index,
      size: normalizedSize,
      query,
      sort,
      track_total_hits: trackTotalHits,
    };

    if (searchAfterValues) {
      searchParams.search_after = searchAfterValues;
    } else {
      searchParams.from = normalizedFrom;
    }

    const result = await client.search(searchParams);
    const payload = result.body || result;
    const total = payload.hits.total && payload.hits.total.value !== undefined
      ? payload.hits.total.value
      : payload.hits.total;
    const lastHit = payload.hits.hits[payload.hits.hits.length - 1];
    const nextSearchAfter = lastHit && lastHit.sort ? lastHit.sort : undefined;
    res.json({
      hitsCount: total,
      hits: payload.hits.hits,
      page: searchAfterValues ? undefined : page || Math.floor(normalizedFrom / normalizedSize) + 1,
      perPage: searchAfterValues ? undefined : normalizedSize,
      from: searchAfterValues ? undefined : normalizedFrom,
      size: normalizedSize,
      nextSearchAfter,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
