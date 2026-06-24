# Blog Writer Docker 服务

这个服务提供一个本地写入 API，用来把文章安全写入 `src/content/posts` 目录。
它设计为通过 Docker Desktop 直接启动，Compose 应用名称为 `blog-writer`。

## 在 Docker Desktop 中启动

项目根目录已经包含 `compose.yaml`，Docker Desktop 可以把它识别为一个 Compose 应用。

默认本地 token 是：

```text
change-me
```

日常使用时，建议在项目根目录创建 `.env` 文件，并覆盖 token：

```env
BLOG_WRITER_TOKEN=your-local-token
```

然后打开 Docker Desktop，启动 `blog-writer` Compose 应用即可。也可以在项目根目录先运行一次：

```bash
docker compose up -d --build
```

第一次启动后，Docker Desktop 里会出现 `blog-writer` 容器，后续可以直接在 Docker Desktop 中启动或停止。

API 地址：

```text
http://localhost:8787
```

容器只挂载本地文章目录作为可写内容存储：

```text
./src/content/posts:/workspace/src/content/posts
```

## 健康检查

```bash
curl http://localhost:8787/health
```

预期返回：

```json
{
  "ok": true,
  "service": "blog-writer",
  "postsDir": "/workspace/src/content/posts"
}
```

## 创建或更新草稿

```bash
curl -X POST http://localhost:8787/drafts \
  -H "content-type: application/json" \
  -H "authorization: Bearer change-me" \
  -d '{
    "title": "本地草稿",
    "summary": "这是一段草稿摘要。",
    "channel": "tech",
    "tags": ["Astro", "Docker"],
    "body": "这里是 MDX 正文。"
  }'
```

服务会写入 `src/content/posts/本地草稿.mdx`，并设置：

```yaml
status: "draft"
```

如果同名文章已经是 `published` 状态，`/drafts` 不会覆盖它，避免误改已发布内容。

## 发布已有草稿

```bash
curl -X POST http://localhost:8787/publish \
  -H "content-type: application/json" \
  -H "authorization: Bearer change-me" \
  -d '{ "slug": "本地草稿" }'
```

这个接口会保留原有正文和 frontmatter，并更新：

```yaml
status: "published"
updatedAt: YYYY-MM-DD
```

如果原文件没有 `publishedAt`，服务会自动补上当天日期。

## 直接发布新文章

```bash
curl -X POST http://localhost:8787/publish \
  -H "content-type: application/json" \
  -H "authorization: Bearer change-me" \
  -d '{
    "title": "一篇已发布文章",
    "summary": "这是一段文章摘要。",
    "channel": "creation",
    "tags": ["写作"],
    "body": "这里是已发布文章的 MDX 正文。"
  }'
```

服务会创建对应的 `.mdx` 文件，并设置：

```yaml
status: "published"
```

## 请求字段

创建内容时必填：

- `title`：文章标题
- `summary`：文章摘要
- `channel`：频道，只能是 `tech`、`creation`、`reading`、`life`
- `body`：MDX 正文

可选字段：

- `slug`：文章文件名，不传时由 `title` 自动生成
- `tags`：标签数组
- `featured`：是否精选
- `cover`：封面路径
- `series`：系列名称
- `related`：相关文章 slug 数组
- `publishedAt`：发布日期，格式为 `YYYY-MM-DD`
- `updatedAt`：更新日期，格式为 `YYYY-MM-DD`

## 安全限制

- API 会自行控制 `status`，客户端不能直接指定任意发布状态。
- 客户端不能传入任意输出路径。
- 所有写入都会限制在 `src/content/posts` 目录内。
- 写入接口需要携带 `Authorization: Bearer <token>`。
- `/health` 不需要 token，方便 Docker Desktop 做健康检查。
