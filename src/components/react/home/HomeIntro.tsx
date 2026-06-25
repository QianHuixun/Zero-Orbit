import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 3200;
const EXIT_DURATION = 760;
const STAR_COUNT = 128;
const INTRO_EVENT = "home-intro";
const CABIN_ENTER_EVENT = "home-cabin-enter";

interface WarpStar {
  angle: number;
  distance: number;
  speed: number;
  length: number;
  size: number;
  alpha: number;
  tint: number;
}

export default function HomeIntro() {
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startIntro = () => {
      setDone(false);
      setExiting(false);
      setArmed(true);
    };
    window.addEventListener(CABIN_ENTER_EVENT, startIntro, { once: true });
    return () => window.removeEventListener(CABIN_ENTER_EVENT, startIntro);
  }, []);

  useEffect(() => {
    if (!armed) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector(".home-orbit-shell");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!root || !canvas || !context || reduceMotion) {
      setDone(true);
      root?.classList.add("home-intro-complete");
      return;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let frame = 0;
    let startTime = performance.now();
    let finished = false;
    let exitingStarted = false;
    let exitTimer = 0;

    const stars: WarpStar[] = Array.from({ length: STAR_COUNT }, (_, index) => ({
      angle: (index / STAR_COUNT) * Math.PI * 2 + Math.random() * 0.5,
      distance: 0.06 + Math.random() * 0.94,
      speed: 0.78 + Math.random() * 1.8,
      length: 0.18 + Math.random() * 0.82,
      size: 0.6 + Math.random() * 1.6,
      alpha: 0.28 + Math.random() * 0.72,
      tint: Math.random()
    }));

    const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);
    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    const emitIntro = (phase: "start" | "exiting" | "complete", detail: Record<string, number> = {}) => {
      window.dispatchEvent(new CustomEvent(INTRO_EVENT, {
        detail: {
          phase,
          duration: INTRO_DURATION,
          exitDuration: EXIT_DURATION,
          ...detail
        }
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawCore = (cx: number, cy: number, progress: number, fade: number) => {
      const pulse = Math.sin(progress * Math.PI) * 0.35 + 0.65;
      const radius = 70 + progress * 160;
      const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(244, 251, 255, ${0.82 * fade})`);
      gradient.addColorStop(0.12, `rgba(80, 231, 255, ${0.48 * fade * pulse})`);
      gradient.addColorStop(0.36, `rgba(156, 123, 255, ${0.12 * fade})`);
      gradient.addColorStop(1, "rgba(5, 9, 18, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();
    };

    const drawOrbitEcho = (cx: number, cy: number, width: number, height: number, progress: number, fade: number) => {
      context.save();
      context.translate(cx, cy);
      context.rotate(-0.08);
      for (let index = 0; index < 4; index += 1) {
        const orbitProgress = clamp((progress - 0.42 - index * 0.055) / 0.32);
        if (orbitProgress <= 0) continue;
        context.beginPath();
        context.ellipse(0, 0, width * (0.26 + index * 0.07), height * (0.08 + index * 0.025), index * 0.22, -Math.PI * orbitProgress, Math.PI * orbitProgress);
        context.strokeStyle = `rgba(${index % 2 ? "255, 211, 106" : "80, 231, 255"}, ${0.24 * orbitProgress * fade})`;
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();
    };

    const startExit = () => {
      if (exitingStarted || finished) return;
      exitingStarted = true;
      root.classList.remove("home-intro-playing");
      root.classList.add("home-intro-exiting");
      emitIntro("exiting", { elapsed: performance.now() - startTime });
      setExiting(true);
      exitTimer = window.setTimeout(finish, EXIT_DURATION);
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / INTRO_DURATION);
      const exitProgress = clamp((elapsed - INTRO_DURATION) / EXIT_DURATION);
      const burst = easeOutCubic(clamp((progress - 0.18) / 0.32));
      const settle = clamp((progress - 0.48) / 0.24);
      const fade = Math.max(1 - easeOutCubic(clamp((progress - 0.72) / 0.28)), 0.12 * (1 - easeOutCubic(exitProgress)));
      const laptopCompact = window.innerWidth >= 768 && window.innerHeight <= 900;
      const laptopTight = window.innerWidth >= 768 && window.innerHeight <= 760;
      const cx = window.innerWidth * (laptopCompact ? 0.54 : 0.5);
      const cy = window.innerHeight * (laptopTight ? 0.36 : laptopCompact ? 0.4 : 0.48);
      const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * (laptopTight ? 0.52 : laptopCompact ? 0.58 : 0.78);

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = `rgba(5, 9, 18, ${Math.max(0.92 * fade - exitProgress * 0.38, 0)})`;
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);

      drawCore(cx, cy, burst, fade);
      if (exitProgress > 0) {
        drawCore(cx, cy, 0.55, 0.16 * (1 - easeOutCubic(exitProgress)));
      }

      for (const star of stars) {
        const baseDistance = star.distance * maxRadius * (0.08 + burst * 1.1 * star.speed);
        const settlePull = 1 - settle * 0.18;
        const x = cx + Math.cos(star.angle) * baseDistance * settlePull;
        const y = cy + Math.sin(star.angle) * baseDistance * settlePull;
        const trail = (28 + star.length * 130) * burst * (1 - settle * 0.42);
        const tailX = x - Math.cos(star.angle) * trail;
        const tailY = y - Math.sin(star.angle) * trail;
        const alpha = star.alpha * fade * (0.18 + burst * 0.82);
        const color = star.tint > 0.82 ? "255, 211, 106" : star.tint > 0.55 ? "156, 123, 255" : "80, 231, 255";

        context.beginPath();
        const gradient = context.createLinearGradient(tailX, tailY, x, y);
        gradient.addColorStop(0, `rgba(${color}, 0)`);
        gradient.addColorStop(0.62, `rgba(${color}, ${alpha * 0.45})`);
        gradient.addColorStop(1, `rgba(244, 251, 255, ${alpha})`);
        context.strokeStyle = gradient;
        context.lineWidth = star.size * (1 + burst * 0.8);
        context.lineCap = "round";
        context.moveTo(tailX, tailY);
        context.lineTo(x, y);
        context.stroke();
      }

      const orbitEchoWidth = window.innerWidth * (laptopCompact ? 0.68 : 1);
      const orbitEchoHeight = window.innerHeight * (laptopCompact ? 0.68 : 1);
      drawOrbitEcho(cx, cy, orbitEchoWidth, orbitEchoHeight, progress, fade + 0.1 * (1 - easeOutCubic(exitProgress)));

      if (elapsed >= INTRO_DURATION) startExit();
      if (!finished) frame = window.requestAnimationFrame(render);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      root.classList.remove("home-intro-playing");
      root.classList.remove("home-intro-exiting");
      root.classList.add("home-intro-complete");
      emitIntro("complete");
      window.cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      setDone(true);
      window.removeEventListener("wheel", startExit);
      window.removeEventListener("pointerdown", startExit);
      window.removeEventListener("keydown", startExit);
    };

    resize();
    startTime = performance.now();
    root.classList.add("home-intro-playing");
    root.classList.remove("home-intro-complete");
    root.classList.remove("home-intro-exiting");
    emitIntro("start", { startedAt: startTime });

    const timer = window.setTimeout(startExit, INTRO_DURATION);
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", startExit, { once: true, passive: true });
    window.addEventListener("pointerdown", startExit, { once: true });
    window.addEventListener("keydown", startExit, { once: true });
    frame = window.requestAnimationFrame(render);

    return () => {
      finished = true;
      window.clearTimeout(timer);
      window.clearTimeout(exitTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", startExit);
      window.removeEventListener("pointerdown", startExit);
      window.removeEventListener("keydown", startExit);
      root.classList.remove("home-intro-playing");
      root.classList.remove("home-intro-exiting");
    };
  }, [armed]);

  if (!armed || done) return null;

  return (
    <div className={`home-intro-layer ${exiting ? "is-exiting" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="home-intro-canvas" />
      <div className="home-intro-status">
        <span>Deep space jump opening orbit map</span>
        <i />
      </div>
    </div>
  );
}
