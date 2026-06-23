import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export type Post = CollectionEntry<"posts">;

export async function getPublicPosts() {
  const posts = await getCollection("posts", ({ data }) => data.status === "published");
  return posts.sort((a, b) => getPostDate(b).getTime() - getPostDate(a).getTime());
}

export async function getPublishedPosts() {
  return getPublicPosts();
}

export async function getFeaturedPosts(limit = 4) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.featured).slice(0, limit);
}

export async function getLatestPosts(limit = 6) {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

export function getPostDate(post: Post) {
  return post.data.updatedAt ?? post.data.publishedAt;
}

export function getPostsByChannel(posts: Post[], channel: string) {
  return posts.filter((post) => post.data.channel === channel);
}

export function getAllTags(posts: Post[]) {
  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tags.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getPostsByTag(posts: Post[], tag: string) {
  return posts.filter((post) => post.data.tags.includes(tag));
}

export function getArchiveGroups(posts: Post[]) {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const key = String(post.data.publishedAt.getFullYear());
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }
  return Array.from(groups.entries()).map(([year, items]) => ({ year, posts: items }));
}

export function getAdjacentPosts(posts: Post[], postId: string) {
  const index = posts.findIndex((post) => post.id === postId);
  return {
    previous: index >= 0 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined
  };
}

export function getRelatedPosts(posts: Post[], post: Post, limit = 3) {
  const tagSet = new Set(post.data.tags);
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      score: candidate.data.tags.filter((tag) => tagSet.has(tag)).length + (candidate.data.channel === post.data.channel ? 1 : 0)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || getPostDate(b.post).getTime() - getPostDate(a.post).getTime())
    .slice(0, limit)
    .map((item) => item.post);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}
