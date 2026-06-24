import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ChannelSlug } from "../../../data/channels";

interface ChannelOption {
  slug: ChannelSlug;
  name: string;
  label: string;
}

interface WritingTerminalProps {
  channels: ChannelOption[];
}

type EngineStatus = "checking" | "online" | "offline";
type PostStatus = "draft" | "published";
type WriterAction = "idle" | "saving" | "publishing";

const engineBaseUrl = "http://localhost:8787";
const engineEndpoint = `${engineBaseUrl}/health`;

function escapeYamlString(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/g);

  return parts.map((part, index) => {
    if (/^`[^`]+`$/.test(part)) return <code key={index}>{part.slice(1, -1)}</code>;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) return <a key={index} href={link[2]}>{link[1]}</a>;
    return part;
  });
}

function flushParagraph(paragraph: string[], nodes: ReactNode[], key: string) {
  if (!paragraph.length) return;
  nodes.push(<p key={key}>{renderInline(paragraph.join(" "))}</p>);
  paragraph.length = 0;
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  const paragraph: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];
  let code: string[] | null = null;

  function flushList(key: string) {
    if (!list.length) return;
    nodes.push(<ul key={key}>{list.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ul>);
    list = [];
  }

  function flushQuote(key: string) {
    if (!quote.length) return;
    nodes.push(<blockquote key={key}>{quote.map((item, index) => <p key={index}>{renderInline(item)}</p>)}</blockquote>);
    quote = [];
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushList(`ul-${index}`);
      flushQuote(`quote-${index}`);
      if (code) {
        nodes.push(<pre key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
        code = null;
      } else {
        code = [];
      }
      return;
    }

    if (code) {
      code.push(line);
      return;
    }

    if (!trimmed) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushList(`ul-${index}`);
      flushQuote(`quote-${index}`);
      return;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushList(`ul-${index}`);
      flushQuote(`quote-${index}`);
      const depth = heading[1].length;
      const content = renderInline(heading[2]);
      if (depth === 1) nodes.push(<h1 key={`h-${index}`}>{content}</h1>);
      if (depth === 2) nodes.push(<h2 key={`h-${index}`}>{content}</h2>);
      if (depth === 3) nodes.push(<h3 key={`h-${index}`}>{content}</h3>);
      if (depth === 4) nodes.push(<h4 key={`h-${index}`}>{content}</h4>);
      return;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushList(`ul-${index}`);
      flushQuote(`quote-${index}`);
      nodes.push(<hr key={`hr-${index}`} />);
      return;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushQuote(`quote-${index}`);
      list.push(listItem[1]);
      return;
    }

    const quoteLine = trimmed.match(/^>\s?(.+)$/);
    if (quoteLine) {
      flushParagraph(paragraph, nodes, `p-${index}`);
      flushList(`ul-${index}`);
      quote.push(quoteLine[1]);
      return;
    }

    flushList(`ul-${index}`);
    flushQuote(`quote-${index}`);
    paragraph.push(trimmed);
  });

  flushParagraph(paragraph, nodes, "p-end");
  flushList("ul-end");
  flushQuote("quote-end");
  if (code?.length) nodes.push(<pre key="code-end"><code>{code.join("\n")}</code></pre>);

  return nodes.length ? nodes : null;
}

export default function WritingTerminal({ channels }: WritingTerminalProps) {
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("checking");
  const [copyState, setCopyState] = useState("复制 MDX");
  const [writerAction, setWriterAction] = useState<WriterAction>("idle");
  const [actionMessage, setActionMessage] = useState("发布引擎在线后，可以直接保存草稿或发布。");
  const [writerToken, setWriterToken] = useState(() => {
    if (typeof window === "undefined") return "change-me";
    return window.localStorage.getItem("blog-writer-token") || "change-me";
  });
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [channel, setChannel] = useState<ChannelSlug>(channels[0]?.slug ?? "creation");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [featured, setFeatured] = useState(false);
  const [body, setBody] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function checkEngine() {
      try {
        const response = await fetch(engineEndpoint, {
          cache: "no-store",
          signal: controller.signal
        });
        setEngineStatus(response.ok ? "online" : "offline");
      } catch {
        if (!controller.signal.aborted) {
          setEngineStatus("offline");
        }
      }
    }

    checkEngine();
    const timer = window.setInterval(checkEngine, 12000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("blog-writer-token", writerToken);
  }, [writerToken]);

  const tagList = useMemo(
    () => tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    [tags]
  );

  const slug = useMemo(() => slugify(title) || "untitled-post", [title]);
  const publishDate = useMemo(() => today(), []);
  const renderedBody = useMemo(() => renderMarkdown(body), [body]);
  const canUseEngine = engineStatus === "online" && writerAction === "idle";

  const mdx = useMemo(() => {
    const tagString = tagList.map((tag) => `"${escapeYamlString(tag)}"`).join(", ");

    return `---\ntitle: "${escapeYamlString(title)}"\nsummary: "${escapeYamlString(summary)}"\nchannel: "${channel}"\ntags: [${tagString}]\npublishedAt: ${publishDate}\nupdatedAt: ${publishDate}\nstatus: "${status}"\nfeatured: ${featured}\n---\n\n${body.trim()}\n`;
  }, [body, channel, featured, publishDate, status, summary, tagList, title]);

  const postPayload = useMemo(() => ({
    title,
    slug,
    summary,
    channel,
    tags: tagList,
    body,
    featured,
    publishedAt: publishDate,
    updatedAt: publishDate
  }), [body, channel, featured, publishDate, slug, summary, tagList, title]);

  async function copyMdx() {
    await navigator.clipboard.writeText(mdx);
    setCopyState("已复制");
    window.setTimeout(() => setCopyState("复制 MDX"), 1800);
  }

  async function submitPost(nextStatus: PostStatus) {
    if (!title.trim() || !summary.trim() || !body.trim()) {
      setActionMessage("标题、摘要和正文都需要填写。");
      return;
    }

    setWriterAction(nextStatus === "draft" ? "saving" : "publishing");
    setActionMessage(nextStatus === "draft" ? "正在保存草稿..." : "正在发布文章...");

    try {
      const response = await fetch(`${engineBaseUrl}/${nextStatus === "draft" ? "drafts" : "publish"}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(writerToken.trim() ? { authorization: `Bearer ${writerToken.trim()}` } : {})
        },
        body: JSON.stringify(postPayload)
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error?.message || "发布引擎没有接受这次写入。");
      }

      setStatus(nextStatus);
      setActionMessage(nextStatus === "draft" ? `草稿已保存：${result.file}` : `文章已发布：${result.file}`);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "写入失败，请检查发布引擎。");
    } finally {
      setWriterAction("idle");
    }
  }

  return (
    <section className="writing-terminal" aria-label="创作终端">
      <header className="writing-topbar">
        <div className="writing-brand">
          <p className="kicker">Writing Terminal</p>
          <h1>创作终端</h1>
        </div>

        <div className="writing-topbar__actions">
          <div className={`writing-engine writing-engine--${engineStatus}`} title={engineStatus === "online" ? engineEndpoint : "docker compose up -d blog-writer"}>
            <span aria-hidden="true"></span>
            {engineStatus === "online" ? "发布引擎在线" : engineStatus === "checking" ? "检测中" : "发布引擎离线"}
          </div>
          <button type="button" className="writing-button writing-button--primary" disabled={!canUseEngine} onClick={() => submitPost("draft")}>
            {writerAction === "saving" ? "保存中" : "保存草稿"}
          </button>
          <button type="button" className="writing-button" disabled={!canUseEngine} onClick={() => submitPost("published")}>
            {writerAction === "publishing" ? "发布中" : "发布"}
          </button>
          <details className="writing-more">
            <summary>更多</summary>
            <div>
              <button type="button" onClick={copyMdx}>{copyState}</button>
              <button type="button" onClick={() => downloadFile(`${slug}.mdx`, mdx)}>下载 MDX</button>
            </div>
          </details>
        </div>
      </header>

      <form className="writing-meta">
        <label className="writing-field writing-field--title">
          <span>标题</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>

        <label className="writing-field writing-field--summary">
          <span>摘要</span>
          <input value={summary} onChange={(event) => setSummary(event.target.value)} />
        </label>

        <label className="writing-field">
          <span>频道</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value as ChannelSlug)}>
            {channels.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name} / {item.label}</option>
            ))}
          </select>
        </label>

        <label className="writing-field">
          <span>状态</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as PostStatus)}>
            <option value="draft">草稿</option>
            <option value="published">发布</option>
          </select>
        </label>

        <label className="writing-field writing-field--tags">
          <span>标签</span>
          <input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>

        <label className="writing-field writing-field--token">
          <span>Token</span>
          <input type="password" value={writerToken} onChange={(event) => setWriterToken(event.target.value)} />
        </label>

        <label className="writing-toggle">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          <span>精选</span>
        </label>
      </form>

      <main className="writing-workbench">
        <section className="writing-source" aria-label="正文 MDX 编辑">
          <textarea className="writing-editor" value={body} onChange={(event) => setBody(event.target.value)} spellCheck="false" />
        </section>

        <article className="writing-rendered" aria-label="Markdown 实时效果">
          <div className="writing-rendered__body">{renderedBody}</div>
        </article>
      </main>

      <p className="writing-status-line" role="status">{actionMessage}</p>
    </section>
  );
}
