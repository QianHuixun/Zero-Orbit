import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { channels } from "./data/channels";

const channelSlugs = channels.map((channel) => channel.slug) as [string, ...string[]];

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    channel: z.enum(channelSlugs),
    tags: z.array(z.string()).default([]),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    status: z.enum(["published", "draft", "archived"]).default("published"),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    series: z.string().optional(),
    related: z.array(z.string()).default([])
  })
});

export const collections = { posts };
