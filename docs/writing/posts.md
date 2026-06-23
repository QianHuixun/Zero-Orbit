# 博客写作工作流

## 新建文章

推荐使用命令生成草稿：

```bash
npm run new:post -- --title="文章标题" --channel=creation --tags="个人网站,写作"
```

常用参数：

- `--title`：文章标题。
- `--slug`：文章文件名，不传时会从标题生成。
- `--channel`：频道，可选 `tech`、`creation`、`reading`、`life`。
- `--tags`：英文逗号分隔的标签。
- `--summary`：文章摘要。

生成文件位置：`src/content/posts/<slug>.mdx`。

## 发布文章

新文章默认是草稿：

```yaml
status: "draft"
```

写完后改成：

```yaml
status: "published"
```

然后文章会自动进入首页最新记录、频道页、标签页、归档页、文章页和 Pagefind 搜索索引。

## 精选文章

将 `featured` 改成 `true`：

```yaml
featured: true
```

文章会出现在首页精选轨道。

## 内容字段

```yaml
title: "文章标题"
summary: "摘要"
channel: "creation"
tags: ["个人网站", "写作"]
publishedAt: 2026-06-23
updatedAt: 2026-06-23
status: "draft"
featured: false
cover: ""
series: ""
related: []
```

## 手动模板

也可以复制 `docs/templates/post.mdx`，改名后放到 `src/content/posts/`。