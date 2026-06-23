# Repository Guidelines

## 项目结构与模块组织

这是一个 Astro 个人知识站点，首页使用 React Islands、Three.js 和 React Three Fiber。核心代码位于 `src/`：页面在 `src/pages`，布局在 `src/layouts`，Astro 组件在 `src/components/astro`，React 组件在 `src/components/react`，共享工具在 `src/lib`，全局样式在 `src/styles`。文章内容使用 MDX，存放在 `src/content/posts`，内容 Schema 在 `src/content.config.ts`。站点和频道配置放在 `src/data`。静态资源放入 `public`；`dist` 是构建产物，不要手动编辑。

## 开发环境与常用命令

- 使用 Node.js 与 npm 安装依赖：`npm install`。
- 本地开发：`npm run dev`，启动 Astro 开发服务器。
- 生产构建：`npm run build`，执行 Astro 构建并生成 `dist/pagefind` 搜索索引。
- 本地预览：`npm run preview`，预览生产构建结果。
- 新建草稿：`npm run new:post -- --title="文章标题" --channel=tech`。频道可选 `tech`、`creation`、`reading`、`life`。

## 代码风格与命名约定

React Islands 使用 TypeScript/TSX，静态 UI 优先使用 Astro 组件。延续现有 2 空格缩进，导入语句集中放在文件顶部。React 组件使用 PascalCase，工具函数使用 camelCase，CSS 类名使用 kebab-case。新增样式前优先复用 `src/styles/tokens.css` 中的设计令牌和现有布局模式。

## 测试与验证

当前仓库没有配置独立测试框架或 `test` 脚本。提交前至少运行 `npm run build`，确保 Astro、TypeScript、Pagefind 构建链路可用。新增复杂逻辑时，应补充对应测试脚本到 `package.json`，测试文件建议靠近被测代码，例如 `src/lib/posts.test.ts`。

## 提交与 Pull Request 规范

Git 历史采用 Conventional Commits，例如 `feat: add post drafting workflow`、`fix: restrict public posts to published status`。提交应按功能或修复拆分，避免混入无关改动。PR 需要包含变更摘要、验证步骤（如 `npm run build`）、关联 issue；涉及界面变化时附截图或录屏。

## 安全与配置注意事项

不要提交本地密钥、环境文件或临时日志。`dist`、`.astro`、`node_modules`、`dev.log`、`dev.err.log` 都视为可再生成产物。修改内容发布状态时，确认 `status` 字段符合预期：草稿使用 `draft`，公开文章使用 `published`。
