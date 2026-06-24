const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function serializePost(post, status) {
  const frontmatter = {
    title: post.title,
    summary: post.summary,
    channel: post.channel,
    tags: post.tags,
    publishedAt: post.publishedAt || today(),
    updatedAt: post.updatedAt,
    status,
    featured: post.featured,
    cover: post.cover,
    series: post.series,
    related: post.related
  };

  return `${serializeFrontmatter(frontmatter)}\n\n${post.body.trim()}\n`;
}

export function parseMdx(source) {
  const match = source.match(FRONTMATTER_RE);
  if (!match) return { data: {}, body: source };

  return {
    data: parseSimpleYaml(match[1]),
    body: source.slice(match[0].length)
  };
}

export function updateStatus(source, status) {
  const parsed = parseMdx(source);
  const data = {
    ...parsed.data,
    status,
    publishedAt: parsed.data.publishedAt || today(),
    updatedAt: today()
  };

  return `${serializeFrontmatter(data)}\n\n${parsed.body.trim()}\n`;
}

export function serializeFrontmatter(data) {
  const lines = ["---"];
  const order = [
    "title",
    "summary",
    "channel",
    "tags",
    "publishedAt",
    "updatedAt",
    "status",
    "featured",
    "cover",
    "series",
    "related"
  ];

  for (const key of order) {
    if (data[key] === undefined || data[key] === null) continue;
    if (Array.isArray(data[key]) && data[key].length === 0 && key !== "tags" && key !== "related") continue;
    lines.push(`${key}: ${formatYamlValue(data[key])}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function formatYamlValue(value) {
  if (Array.isArray(value)) return `[${value.map((item) => quote(String(item))).join(", ")}]`;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return quote(String(value));
}

function quote(value) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function parseSimpleYaml(frontmatter) {
  const data = {};

  for (const line of frontmatter.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = parseYamlValue(match[2].trim());
  }

  return data;
}

function parseYamlValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => item.trim().replace(/^"|"$/g, ""));
  }
  return value.replace(/^"|"$/g, "");
}
