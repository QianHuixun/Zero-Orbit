import { useEffect, useState } from "react";

const CABIN_ENTER_EVENT = "home-cabin-enter";
const ORBIT_ENTERED_KEY = "home-orbit-entered";

export default function CabinGate() {
  const [launching, setLaunching] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const root = document.querySelector(".home-orbit-shell");
    if (window.sessionStorage.getItem(ORBIT_ENTERED_KEY) === "true") {
      root?.classList.remove("home-cabin-visible");
      root?.classList.remove("home-cabin-launching");
      setHidden(true);
      return;
    }

    root?.classList.add("home-cabin-visible");
    return () => {
      root?.classList.remove("home-cabin-visible");
      root?.classList.remove("home-cabin-launching");
    };
  }, []);

  const enterOrbit = () => {
    if (launching) return;
    const root = document.querySelector(".home-orbit-shell");
    window.sessionStorage.setItem(ORBIT_ENTERED_KEY, "true");
    setLaunching(true);
    root?.classList.add("home-cabin-launching");

    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(CABIN_ENTER_EVENT));
    }, 980);

    window.setTimeout(() => {
      root?.classList.remove("home-cabin-visible");
      root?.classList.remove("home-cabin-launching");
      setHidden(true);
    }, 1620);
  };

  if (hidden) return null;

  return (
    <section className={`cabin-gate ${launching ? "is-launching" : ""}`} aria-label="进入星轨控制舱">
      <div className="cabin-stars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="cabin-window" aria-hidden="true">
        <div className="cabin-nebula" />
        <div className="cabin-megastructure" />
        <div className="cabin-gate-ignition">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="cabin-scan-wave" />
        <div className="cabin-orbit-lines" />
        <div className="cabin-hud-drift">
          <span>NODE 04</span>
          <span>AI TOOLS</span>
          <span>READING INDEX</span>
          <span>ORBIT READY</span>
          <span>PRODUCT SYSTEM</span>
        </div>
        <div className="cabin-glass-reflection" />
        <div className="cabin-gate-aperture" />
        <div className="cabin-jump-core" />
      </div>

      <div className="cabin-frame" aria-hidden="true">
        <div className="cabin-frame-top" />
        <div className="cabin-frame-left" />
        <div className="cabin-frame-right" />
        <div className="cabin-console">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="cabin-content">
        <p className="cabin-kicker">Private Knowledge Terminal</p>
        <h1>Knowledge Orbit</h1>
        <p className="cabin-copy">记录技术、创造、阅读与生活的私人知识终端。</p>
        <div className="cabin-tags" aria-label="当前关注">
          <span>AI 工具</span>
          <span>产品系统</span>
          <span>长期写作</span>
        </div>
        <div className="cabin-actions">
          <button type="button" onClick={enterOrbit} disabled={launching}>
            <span>{launching ? "启动中" : "进入星轨"}</span>
            <i aria-hidden="true" />
          </button>
          <a href="/search/">搜索</a>
        </div>
      </div>

      <div className="cabin-status" aria-hidden="true">
        <span>ORBIT MAP</span>
        <span>{launching ? "JUMP SEQUENCE ONLINE" : "STANDBY"}</span>
      </div>
    </section>
  );
}
