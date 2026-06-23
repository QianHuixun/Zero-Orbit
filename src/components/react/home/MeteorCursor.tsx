import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  speed: number;
}

export default function MeteorCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const canUseMeteor = () => window.matchMedia("(pointer: fine) and (min-width: 768px)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canUseMeteor()) return;

    const cursor = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      lastX: window.innerWidth / 2,
      lastY: window.innerHeight / 2,
      speed: 0,
      visible: false,
      warm: false
    };
    const trail: TrailPoint[] = [];
    let frame = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const dx = event.clientX - cursor.targetX;
      const dy = event.clientY - cursor.targetY;
      cursor.targetX = event.clientX;
      cursor.targetY = event.clientY;
      cursor.speed = Math.min(Math.hypot(dx, dy), 48);
      cursor.visible = true;
      cursor.warm = Boolean((event.target as Element | null)?.closest('a, button, input, textarea, select, [role="button"]'));
    };

    const onPointerLeave = () => {
      cursor.visible = false;
      cursor.warm = false;
    };

    const drawGlow = (x: number, y: number, radius: number, color: string, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color.replace("ALPHA", String(alpha)));
      gradient.addColorStop(0.48, color.replace("ALPHA", String(alpha * 0.34)));
      gradient.addColorStop(1, color.replace("ALPHA", "0"));
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const render = () => {
      frame = window.requestAnimationFrame(render);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      cursor.x += (cursor.targetX - cursor.x) * 0.32;
      cursor.y += (cursor.targetY - cursor.y) * 0.32;
      cursor.speed *= 0.88;

      const travel = Math.hypot(cursor.x - cursor.lastX, cursor.y - cursor.lastY);
      if (cursor.visible && travel > 0.35) {
        trail.unshift({ x: cursor.x, y: cursor.y, speed: cursor.speed });
        cursor.lastX = cursor.x;
        cursor.lastY = cursor.y;
      }

      const maxTrail = 6 + Math.round(Math.min(cursor.speed / 5, 8));
      trail.length = Math.min(trail.length, maxTrail);

      const mainColor = cursor.warm ? "rgba(255, 211, 106, ALPHA)" : "rgba(80, 231, 255, ALPHA)";
      const coreColor = cursor.warm ? "rgba(255, 244, 184, ALPHA)" : "rgba(244, 251, 255, ALPHA)";

      for (let index = trail.length - 1; index >= 0; index -= 1) {
        const point = trail[index];
        const age = index / Math.max(trail.length - 1, 1);
        const alpha = (1 - age) * 0.34;
        const radius = 3 + (1 - age) * 7 + point.speed * 0.05;
        drawGlow(point.x, point.y, radius, mainColor, alpha);
      }

      if (trail.length > 1) {
        context.save();
        context.lineCap = "round";
        context.lineJoin = "round";
        for (let index = 0; index < trail.length - 1; index += 1) {
          const point = trail[index];
          const next = trail[index + 1];
          const alpha = (1 - index / trail.length) * 0.46;
          const gradient = context.createLinearGradient(point.x, point.y, next.x, next.y);
          gradient.addColorStop(0, cursor.warm ? `rgba(255, 211, 106, ${alpha})` : `rgba(80, 231, 255, ${alpha})`);
          gradient.addColorStop(1, "rgba(8, 18, 36, 0)");
          context.strokeStyle = gradient;
          context.lineWidth = Math.max(1, 3.2 - index * 0.22);
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
        context.restore();
      }

      if (cursor.visible) {
        const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.08;
        drawGlow(cursor.x, cursor.y, 22 * pulse + cursor.speed * 0.16, mainColor, cursor.warm ? 0.46 : 0.36);
        drawGlow(cursor.x, cursor.y, 8 * pulse, coreColor, 0.92);
        context.fillStyle = cursor.warm ? "rgba(255, 244, 184, 0.96)" : "rgba(244, 251, 255, 0.96)";
        context.beginPath();
        context.arc(cursor.x, cursor.y, cursor.warm ? 2.8 : 2.4, 0, Math.PI * 2);
        context.fill();
      } else if (trail.length > 0) {
        trail.pop();
      }
    };

    resize();
    document.body.classList.add("meteor-cursor-active");
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      document.body.classList.remove("meteor-cursor-active");
    };
  }, []);

  return <canvas ref={canvasRef} className="meteor-cursor-canvas" aria-hidden="true" />;
}