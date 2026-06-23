import { useEffect } from "react";

interface Props {
  targetId: string;
}

const ORBIT_PROGRESS_EVENT = "home-orbit-progress";
const ORBIT_PANEL_IDS = ["origin", "channels", "featured", "latest"];

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

export default function HorizontalWheel({ targetId }: Props) {
  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const isHorizontalMode = () => window.matchMedia("(min-width: 768px)").matches;
    let virtualProgress = 0;

    const emitProgress = () => {
      window.dispatchEvent(new CustomEvent(ORBIT_PROGRESS_EVENT, {
        detail: { progress: virtualProgress }
      }));
    };

    const updateActivePanel = () => {
      const panels = Array.from(target.querySelectorAll<HTMLElement>(".home-panel[id]"));
      const index = isHorizontalMode() ? positiveModulo(Math.round(virtualProgress), ORBIT_PANEL_IDS.length) : 0;
      const activePanelId = ORBIT_PANEL_IDS[index] ?? "origin";
      const activePanel = panels.find((panel) => panel.id === activePanelId) ?? panels[0];

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

      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (delta === 0) return;

      event.preventDefault();
      virtualProgress += delta / Math.max(target.clientWidth * 0.62, 1);
      updateActivePanel();
      emitProgress();
    };

    updateActivePanel();
    emitProgress();
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
