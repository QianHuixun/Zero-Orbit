import { useEffect, useMemo, useState, type CSSProperties } from "react";

interface HeadingItem {
  id: string;
  text: string;
  top: number;
}

export default function ReadingOrbit({ contentSelector = "[data-pagefind-body]" }: { contentSelector?: string }) {
  const [progress, setProgress] = useState(0);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(contentSelector);
    if (!content) return;

    const collectHeadings = () => {
      const items = Array.from(content.querySelectorAll<HTMLHeadingElement>("h2"));
      items.forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
      });
      setHeadings(
        items.map((heading, index) => ({
          id: heading.id,
          text: heading.textContent?.trim() || `Section ${index + 1}`,
          top: heading.getBoundingClientRect().top + window.scrollY
        }))
      );
    };

    collectHeadings();
  }, [contentSelector]);

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(contentSelector);
    if (!content) return;

    const update = () => {
      const rect = content.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const total = Math.max(content.scrollHeight - window.innerHeight * 0.72, 1);
      const nextProgress = Math.min(Math.max((window.scrollY - start + window.innerHeight * 0.18) / total, 0), 1);
      setProgress(nextProgress);

      const current = [...headings].reverse().find((heading) => window.scrollY + window.innerHeight * 0.26 >= heading.top);
      setActiveId(current?.id ?? headings[0]?.id ?? "");
    };

    const refresh = () => {
      const items = Array.from(content.querySelectorAll<HTMLHeadingElement>("h2"));
      setHeadings((previous) =>
        previous.map((heading, index) => ({
          ...heading,
          top: items[index]?.getBoundingClientRect().top ? items[index].getBoundingClientRect().top + window.scrollY : heading.top
        }))
      );
      update();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", refresh);
    };
  }, [contentSelector, headings]);

  const markerPositions = useMemo(() => {
    if (headings.length <= 1) return headings.map(() => 0);
    return headings.map((_, index) => (index / (headings.length - 1)) * 100);
  }, [headings]);

  return (
    <aside className="reading-orbit" aria-label="阅读进度" style={{ "--reading-progress": progress } as CSSProperties}>
      <div className="reading-orbit-track" aria-hidden="true">
        <span className="reading-orbit-progress" style={{ height: `${progress * 100}%` }} />
        <span className="reading-orbit-comet" style={{ top: `${progress * 100}%` }} />
        {markerPositions.map((top, index) => (
          <span key={headings[index]?.id ?? index} className="reading-orbit-marker" style={{ top: `${top}%` }} />
        ))}
      </div>
      {headings.length > 0 && (
        <nav className="reading-orbit-nav">
          {headings.map((heading) => (
            <a key={heading.id} className={heading.id === activeId ? "is-active" : ""} href={`#${heading.id}`}>
              {heading.text}
            </a>
          ))}
        </nav>
      )}
    </aside>
  );
}