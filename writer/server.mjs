import { createServer } from "node:http";
import { createPostStore } from "./post-store.mjs";
import { corsHeaders, jsonError, jsonOk, validatePostPayload, validatePublishPayload } from "./validation.mjs";

const PORT = Number(process.env.PORT || 8787);
const BLOG_ROOT = process.env.BLOG_ROOT || process.cwd();
const TOKEN = process.env.BLOG_WRITER_TOKEN || "";
const isProduction = process.env.NODE_ENV === "production";
const store = createPostStore(BLOG_ROOT);

if (isProduction && !TOKEN) {
  throw new Error("BLOG_WRITER_TOKEN is required in production.");
}

if (!TOKEN) {
  console.warn("BLOG_WRITER_TOKEN is not set. Write endpoints are unauthenticated.");
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders());
      response.end();
      return;
    }

    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      jsonOk(response, { service: "blog-writer", postsDir: store.postsDir });
      return;
    }

    if (request.method === "POST" && url.pathname === "/drafts") {
      requireAuth(request);
      const payload = await readJson(request);
      const post = validatePostPayload(payload);
      jsonOk(response, await store.saveDraft(post));
      return;
    }

    if (request.method === "POST" && url.pathname === "/publish") {
      requireAuth(request);
      const payload = await readJson(request);
      const publish = validatePublishPayload(payload);
      const result = publish.mode === "existing"
        ? await store.publishExisting(publish.slug)
        : await store.publishPost(publish.post);
      jsonOk(response, result);
      return;
    }

    jsonError(response, 404, "NOT_FOUND", "Route not found.");
  } catch (error) {
    const status = error.status || 500;
    const code = error.code || "INTERNAL_ERROR";
    const message = status === 500 ? "Internal server error." : error.message;
    if (status === 500) console.error(error);
    jsonError(response, status, code, message);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`blog-writer listening on http://0.0.0.0:${PORT}`);
  console.log(`posts directory: ${store.postsDir}`);
});

function requireAuth(request) {
  if (!TOKEN) return;
  const header = request.headers.authorization || "";
  if (header !== `Bearer ${TOKEN}`) {
    const error = new Error("Missing or invalid bearer token.");
    error.status = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) {
      const error = new Error("Request body is too large." );
      error.status = 413;
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    error.code = "INVALID_JSON";
    throw error;
  }
}
