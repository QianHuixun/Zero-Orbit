# Zero Orbit

一个黑暗高级、轻科幻风格的个人网站+博客。项目使用 Astro 管理静态内容和页面，用 React Islands 承载交互，用 React Three Fiber 实现首页宇宙知识星图，用 Pagefind 生成静态搜索索引。

## 开发命令

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 写文章

文章放在 `src/content/posts`，使用 Markdown 或 MDX。每篇文章需要包含 frontmatter：

```yaml
title: "文章标题"
summary: "文章摘要"
channel: "tech"
tags: ["Astro", "前端"]
publishedAt: 2026-06-18
status: "published"
featured: false
```

`channel` 可选值：`tech`、`creation`、`reading`、`life`。

`status` 可选值：`published`、`draft`、`archived`。草稿不会进入公开页面。

## 主要目录

- `src/content/posts`：文章内容。
- `src/data`：站点信息和频道配置。
- `src/layouts`：全局布局和文章布局。
- `src/components/astro`：静态 Astro 组件。
- `src/components/react`：React Islands，包括首页星图和命令面板。
- `src/lib`：内容查询、路由等工具函数。
- `docs/requirements`：产品、UI、技术和开发计划文档。

## 搜索

`npm run build` 会先执行 Astro 构建，再运行 Pagefind 生成 `dist/pagefind` 搜索索引。

当前搜索页已有静态结构，命令面板已经接入快捷键 `/`，后续可以继续把 UI 接到 Pagefind 客户端 API。
