import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const channelSlugs = ["tech", "creation", "reading", "life"];
const args = process.argv.slice(2);

function readArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length).trim() : fallback;
}

function escapeYamlString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const title = readArg("title", args.find((arg) => !arg.startsWith("--")) ?? "Untitled Post");
const slug = readArg("slug", slugify(title));
const channel = readArg("channel", "creation");
const summary = readArg("summary", "Write a short summary for this post.");
const tags = readArg("tags", "writing").split(",").map((tag) => tag.trim()).filter(Boolean);
const today = new Date().toISOString().slice(0, 10);

if (!channelSlugs.includes(channel)) {
  const options = channelSlugs.join(", ");
  throw new Error(`Unknown channel: ${channel}. Available channels: ${options}`);
}

if (!slug) {
  throw new Error("Slug is empty. Pass --slug=your-post-slug.");
}

const target = join(root, "src", "content", "posts", `${slug}.mdx`);
if (existsSync(target)) {
  throw new Error(`Post already exists: ${target}`);
}

const frontmatter = `---
title: "${escapeYamlString(title)}"
summary: "${escapeYamlString(summary)}"
channel: "${channel}"
tags: [${tags.map((tag) => `"${escapeYamlString(tag)}"`).join(", ")}]
publishedAt: ${today}
status: "draft"
featured: false
---

## Motivation

Write why this post matters.

## Notes

Start writing here.

## Takeaway

Leave one useful conclusion for future you.
`;

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, frontmatter, "utf8");
console.log(`Created draft post: ${target}`);
console.log("Edit status to published when ready.");