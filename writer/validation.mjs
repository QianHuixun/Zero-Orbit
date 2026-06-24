const CHANNELS = new Set(["tech", "creation", "reading", "life"]);

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization",
  "access-control-allow-methods": "GET, POST, OPTIONS"
};

export function corsHeaders() {
  return JSON_HEADERS;
}

export function jsonError(response, status, code, message) {
  response.writeHead(status, JSON_HEADERS);
  response.end(JSON.stringify({ ok: false, error: { code, message } }));
}

export function jsonOk(response, payload = {}) {
  response.writeHead(200, JSON_HEADERS);
  response.end(JSON.stringify({ ok: true, ...payload }));
}

export function slugify(input) {
  return String(input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function validateSlug(value) {
  const slug = slugify(value);
  if (!slug) throw badRequest("INVALID_SLUG", "Slug is empty.");
  if (slug.includes("/") || slug.includes("\\") || slug.includes("..")) {
    throw badRequest("INVALID_SLUG", "Slug must not contain path separators.");
  }
  return slug;
}

export function validatePostPayload(payload, { requireBody = true } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw badRequest("INVALID_JSON", "Request body must be a JSON object.");
  }

  const title = cleanString(payload.title);
  const summary = cleanString(payload.summary);
  const channel = cleanString(payload.channel);
  const body = typeof payload.body === "string" ? payload.body : "";

  if (!title) throw badRequest("MISSING_TITLE", "title is required.");
  if (!summary) throw badRequest("MISSING_SUMMARY", "summary is required.");
  if (!CHANNELS.has(channel)) {
    throw badRequest("INVALID_CHANNEL", `channel must be one of: ${Array.from(CHANNELS).join(", ")}.`);
  }
  if (requireBody && !body.trim()) throw badRequest("MISSING_BODY", "body is required.");

  return {
    title,
    slug: validateSlug(payload.slug || title),
    summary,
    channel,
    tags: validateStringArray(payload.tags, "tags"),
    body,
    featured: Boolean(payload.featured),
    cover: optionalString(payload.cover),
    series: optionalString(payload.series),
    related: validateStringArray(payload.related, "related"),
    publishedAt: validateDate(payload.publishedAt, "publishedAt"),
    updatedAt: validateDate(payload.updatedAt, "updatedAt")
  };
}

export function validatePublishPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw badRequest("INVALID_JSON", "Request body must be a JSON object.");
  }
  if (payload.title || payload.summary || payload.channel || payload.body) {
    return { mode: "upsert", post: validatePostPayload(payload, { requireBody: true }) };
  }
  return { mode: "existing", slug: validateSlug(payload.slug) };
}

function badRequest(code, message) {
  const error = new Error(message);
  error.status = 400;
  error.code = code;
  return error;
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value) {
  const cleaned = cleanString(value);
  return cleaned || undefined;
}

function validateStringArray(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw badRequest("INVALID_FIELD", `${field} must be an array of strings.`);
  return value.map((item) => cleanString(item)).filter(Boolean);
}

function validateDate(value, field) {
  const cleaned = optionalString(value);
  if (!cleaned) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    throw badRequest("INVALID_DATE", `${field} must use YYYY-MM-DD format.`);
  }
  return cleaned;
}
