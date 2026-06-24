import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { serializePost, updateStatus } from "./mdx.mjs";

const POSTS_SUBDIR = ["src", "content", "posts"];

export function createPostStore(blogRoot) {
  const root = resolve(blogRoot || process.cwd());
  const postsDir = resolve(root, ...POSTS_SUBDIR);

  return {
    root,
    postsDir,
    relativeFile(slug) {
      return POSTS_SUBDIR.concat(`${slug}.mdx`).join("/");
    },
    async saveDraft(post) {
      const target = resolvePostPath(postsDir, post.slug);
      const existing = await readExisting(target);
      if (existing && /status:\s*["']?published["']?/.test(existing)) {
        throw conflict("PUBLISHED_EXISTS", "Published posts cannot be overwritten through /drafts.");
      }

      await atomicWrite(target, serializePost(post, "draft"));
      return { slug: post.slug, status: "draft", file: this.relativeFile(post.slug) };
    },
    async publishExisting(slug) {
      const target = resolvePostPath(postsDir, slug);
      const existing = await readExisting(target);
      if (!existing) throw notFound("POST_NOT_FOUND", `No post found for slug: ${slug}.`);

      await atomicWrite(target, updateStatus(existing, "published"));
      return { slug, status: "published", file: this.relativeFile(slug) };
    },
    async publishPost(post) {
      const target = resolvePostPath(postsDir, post.slug);
      await atomicWrite(target, serializePost(post, "published"));
      return { slug: post.slug, status: "published", file: this.relativeFile(post.slug) };
    }
  };
}

function resolvePostPath(postsDir, slug) {
  const target = resolve(postsDir, `${slug}.mdx`);
  const rel = relative(postsDir, target);
  if (rel.startsWith("..") || rel.includes(`..${sep}`) || rel === "") {
    throw badPath("INVALID_PATH", "Resolved path is outside posts directory.");
  }
  return target;
}

async function readExisting(target) {
  try {
    return await readFile(target, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function atomicWrite(target, contents) {
  await mkdir(dirname(target), { recursive: true });
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, contents, "utf8");
  await rename(temp, target);
}

function notFound(code, message) {
  const error = new Error(message);
  error.status = 404;
  error.code = code;
  return error;
}

function conflict(code, message) {
  const error = new Error(message);
  error.status = 409;
  error.code = code;
  return error;
}

function badPath(code, message) {
  const error = new Error(message);
  error.status = 400;
  error.code = code;
  return error;
}
