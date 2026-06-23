# 技术选型文档：个人网站+博客

## 背景与目标

本文件记录个人网站+博客第一版的技术选型，用于承接产品需求文档 `personal-site-blog.md` 和 UI 方向文档 `ui-visual-direction.md`。

第一版目标是同时满足两个方向：

- 内容站需要轻量、稳定、易维护、利于 SEO。
- 首页需要具备强视觉表现力，能够实现宇宙背景和动态知识星图。

最终确认技术栈为：

`Astro + React Islands + React Three Fiber + Tailwind CSS + MDX/Content Collections + Pagefind`

## 技术栈

### Astro

Astro 作为站点主框架，负责页面路由、静态生成、内容集合、构建和部署。

选择原因：

- 适合个人博客和内容站。
- 默认输出静态 HTML，性能好，利于 SEO。
- 支持 Markdown、MDX 和 Content Collections。
- 支持 Islands 架构，可只在需要交互的区域加载 React。
- 适合将文章页、频道页、归档页保持轻量，同时让首页拥有复杂动效。

### React Islands

React 仅用于需要客户端交互的局部组件。

适用区域：

- 首页动态知识星图。
- 命令面板搜索。
- 频道/文章节点 hover 交互。
- 首页轻量数据仪表盘。
- 移动端交互导航。

原则：

- 不把整站做成 React SPA。
- 文章页、频道页、归档页优先使用 Astro 静态渲染。
- 只有交互组件使用客户端 JavaScript。

### React Three Fiber

React Three Fiber 用于实现首页首屏的宇宙背景和动态知识星图。

适用内容：

- 深空背景。
- 星尘粒子。
- 中心知识核心。
- 频道主星体。
- 标签小星点。
- 精选文章轨道节点。
- 鼠标视差、hover 高亮、点击跳转。

配套库建议：

- `three`：底层 3D 渲染。
- `@react-three/fiber`：React 化的 Three.js 渲染层。
- `@react-three/drei`：常用 Three.js 辅助组件。

边界：

- 只将 Three.js 用于首页首屏主视觉。
- 不将普通文章列表、正文阅读和检索结果做成 3D。
- 移动端需要降低粒子数量、光效和动画复杂度。
- 如果 3D 组件加载失败，应保留可用的静态首页内容。

### Tailwind CSS

Tailwind CSS 用于整体样式系统和页面布局。

选择原因：

- 快速建立深色主题、响应式布局和组件状态。
- 与 Astro、React 组件配合成熟。
- 适合通过 CSS 变量统一管理颜色、边框、阴影和间距。

使用原则：

- 使用 Tailwind 处理布局、间距、字体、响应式和常规状态。
- 对宇宙背景、星图、文章排版等复杂视觉补充少量自定义 CSS。
- 抽象基础设计变量，例如背景色、文字色、强调色、边框色、辉光色。
- 避免在页面中堆叠过多一次性样式，重要组件应沉淀为复用组件。

### MDX 与 Content Collections

文章内容使用 Markdown/MDX，并通过 Astro Content Collections 管理结构化字段。

使用原则：

- 普通文章优先使用 Markdown。
- 需要自定义交互或复杂展示的文章可使用 MDX。
- 所有文章都应通过统一 schema 校验基础字段。
- 草稿和归档状态由内容字段控制。

建议文章字段：

- `title`：文章标题。
- `summary`：文章摘要。
- `channel`：所属频道。
- `tags`：标签列表。
- `publishedAt`：发布时间。
- `updatedAt`：更新时间。
- `status`：文章状态。
- `featured`：是否精选。
- `cover`：可选封面图。
- `series`：可选系列名。
- `related`：可选相关文章。

建议文章状态：

- `published`：公开展示。
- `draft`：草稿，不进入公开页面。
- `archived`：归档内容，保留访问但不重点展示。

### Pagefind

Pagefind 用于第一版站内搜索。

选择原因：

- 适合静态站点。
- 不需要后端服务和数据库。
- 构建后生成搜索索引。
- 可与命令面板搜索 UI 结合。

使用范围：

- 搜索文章标题。
- 搜索文章摘要。
- 搜索正文内容。
- 支持搜索结果展示标题、摘要、频道、标签和日期。

边界：

- 第一版不接入后端全文搜索服务。
- 第一版不做复杂个性化推荐。
- 搜索体验以稳定、快速、可用为优先。

## 推荐项目结构

建议初始化后采用以下结构：

```text
src/
  components/
    astro/
    react/
      home/
      search/
  content/
    posts/
    config.ts
  data/
    channels.ts
    site.ts
  layouts/
    BaseLayout.astro
    ArticleLayout.astro
  pages/
    index.astro
    about.astro
    archive.astro
    search.astro
    channels/
    posts/
  styles/
    global.css
    tokens.css
public/
  assets/
  pagefind/
docs/
  requirements/
```

说明：

- `components/astro` 放静态或低交互组件。
- `components/react` 放需要客户端交互的 React Islands。
- `components/react/home` 放首页星图、仪表盘、动态模块。
- `components/react/search` 放命令面板搜索。
- `content/posts` 放文章内容。
- `data/channels.ts` 统一维护频道信息。
- `data/site.ts` 统一维护站点名称、作者、介绍、社交链接等信息。
- `styles/tokens.css` 定义主题颜色、阴影和设计变量。

## 页面实现分工

### Astro 静态页面

优先使用 Astro 实现：

- 首页基本结构。
- 频道页。
- 文章页。
- 归档页。
- 关于页。
- 标签页。

### React 交互组件

使用 React 实现：

- 首页宇宙知识星图。
- 命令面板搜索。
- 首页动态状态仪表盘。
- 需要 hover、键盘选择、实时过滤的交互模块。

### Three.js 动画组件

使用 React Three Fiber 实现：

- 首页首屏深空场景。
- 中心知识核心。
- 四个频道主星体。
- 标签星点和精选文章节点。
- 鼠标视差和节点高亮。

## 内容与数据流

### 内容来源

- 文章来自 `src/content/posts`。
- 频道配置来自 `src/data/channels.ts`。
- 站点基础信息来自 `src/data/site.ts`。

### 页面生成

- 首页读取精选文章、最新文章、频道配置和站点信息。
- 频道页读取对应频道下的已发布文章。
- 文章页根据 Content Collections 生成详情页。
- 归档页按年份或月份聚合已发布文章。
- 搜索页使用 Pagefind 索引提供搜索结果。

### 首页星图数据

首页星图不应手写一套独立内容数据，应从站点已有内容派生。

建议映射：

- 频道配置映射为主星体。
- 标签映射为小星点。
- 精选文章映射为轨道节点。
- 文章数量、最近更新时间映射为频道状态信息。

## 构建与搜索索引

第一版构建流程建议：

1. Astro 构建静态站点。
2. Pagefind 扫描构建产物。
3. 生成搜索索引到静态目录。
4. 部署完整静态产物。

建议脚本：

```json
{
  "build": "astro build && pagefind --site dist",
  "dev": "astro dev",
  "preview": "astro preview"
}
```

实际脚本以项目初始化后的包管理器和工具配置为准。

## 性能与降级策略

- 首页 3D 动画应懒加载或作为独立 island 加载。
- 首屏文案、导航和核心入口不应依赖 3D 渲染成功。
- 移动端降低粒子数量、阴影、模糊和后处理强度。
- 支持用户减少动态效果偏好，必要时切换为静态星图。
- 文章页不加载首页 3D 动画相关代码。
- 搜索索引应在需要时加载，避免影响首页初始渲染。

## 不采用的方案

### Next.js

不作为第一版首选。原因是项目当前更偏静态内容站，暂不需要服务端渲染、账号体系或后端接口能力。

### 纯 Vite + React

不作为第一版首选。原因是博客路由、Markdown、内容集合、SEO、归档和静态生成需要额外搭建较多基础能力。

### 后台 CMS

第一版不接入。原因是当前写作流程以 Markdown/MDX 为主，后台系统会增加实现和维护成本。

### 后端数据库

第一版不接入。文章、频道、标签和搜索均可通过静态内容与构建索引完成。

## 验收标准

- 项目可使用 Astro 管理页面、内容和构建。
- 文章可通过 Markdown/MDX 和 Content Collections 进行结构化管理。
- 首页可通过 React Island 加载动态知识星图，不影响其他页面性能。
- 首页 3D 场景可表达宇宙背景、知识核心、频道星体和节点交互。
- 搜索可通过 Pagefind 在静态站点中工作。
- 文章页、频道页、归档页在不依赖客户端 JavaScript 的情况下可展示核心内容。
- 移动端有动画降级策略。
- 构建产物可部署到静态托管平台。

## 待确认事项

- 包管理器使用 `pnpm`、`npm` 还是其他工具。
- 部署平台选择 Vercel、Netlify、Cloudflare Pages 或其他静态托管。
- 首页 3D 首版做真实 Three.js，还是先实现 Canvas/静态降级版本后再增强。
- 是否需要在第一版加入 RSS。
- 是否需要在第一版加入基础 SEO 元数据和站点地图，默认建议加入。
