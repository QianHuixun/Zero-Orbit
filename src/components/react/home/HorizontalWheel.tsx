import { useEffect } from "react";

interface Props {
  targetId: string;
}

export default function HorizontalWheel({ targetId }: Props) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const isHorizontalMode = () => window.matchMedia("(min-width: 768px)").matches;

    const updateActivePanel = () => {
      const panels = Array.from(target.querySelectorAll<HTMLElement>(".home-panel[id]"));
      const index = isHorizontalMode() ? Math.round(target.scrollLeft / Math.max(target.clientWidth, 1)) : 0;
      const activePanel = panels[Math.min(Math.max(index, 0), panels.length - 1)];

      target.dataset.motionReady = "true";
      target.dataset.activePanel = activePanel?.id ?? "origin";
      panels.forEach((panel) => {
        panel.dataset.active = panel === activePanel ? "true" : "false";
        Array.from(panel.querySelectorAll<HTMLElement>("article, .grid > a, .panel")).forEach((item, itemIndex) => {
          item.style.setProperty("--item-order", String(itemIndex));
        });
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (!isHorizontalMode()) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const canScrollHorizontally = target.scrollWidth > target.clientWidth;
      if (!canScrollHorizontally) return;

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (delta === 0) return;

      event.preventDefault();
      target.scrollBy({ left: delta * 1.12, behavior: "smooth" });
    };

    updateActivePanel();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", updateActivePanel, { passive: true });
    target.addEventListener("scroll", updateActivePanel, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", updateActivePanel);
      target.removeEventListener("scroll", updateActivePanel);
    };
  }, [targetId]);

  return null;
}