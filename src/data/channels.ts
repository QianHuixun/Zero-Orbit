export type ChannelSlug = "tech" | "creation" | "reading" | "life";

export const channels = [
  {
    slug: "tech",
    name: "技术",
    label: "Tech",
    description: "工程实践、开发经验、工具与 AI 技术思考。",
    accent: "cyan",
    orbit: 0.82
  },
  {
    slug: "creation",
    name: "产品/创造",
    label: "Creation",
    description: "产品思考、创作过程、项目复盘与个人工具构想。",
    accent: "violet",
    orbit: 1.02
  },
  {
    slug: "reading",
    name: "阅读",
    label: "Reading",
    description: "读书笔记、摘录、书评和知识整理。",
    accent: "blue",
    orbit: 1.22
  },
  {
    slug: "life",
    name: "生活随笔",
    label: "Life",
    description: "日常观察、个人感受和轻量记录。",
    accent: "green",
    orbit: 1.42
  }
] as const;

export function getChannel(slug: string) {
  return channels.find((channel) => channel.slug === slug);
}
