"use client";

import { useEffect, useRef } from "react";

export interface Shot {
  xMm: number;
  yMm: number;
}

interface Props {
  shots: Shot[];
  size?: number; // canvas size in px
}

export function ShotHeatmap({ shots, size = 260 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || shots.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Find max radius for scaling (very rough; you can tune)
    const radii = shots.map((s) => Math.sqrt(s.xMm * s.xMm + s.yMm * s.yMm));
    const maxR = Math.max(10, ...radii);

    function toCanvas(s: Shot) {
      // Center at middle; flip y so positive is up
      const cx = w / 2;
      const cy = h / 2;
      const scale = (w / 2 - 10) / maxR;
      return {
        x: cx + s.xMm * scale,
        y: cy - s.yMm * scale,
      };
    }

    // base background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    // subtle circles for rings
    ctx.strokeStyle = "rgba(148,163,184,0.3)";
    ctx.lineWidth = 1;
    for (let r = maxR; r > 0; r -= maxR / 5) {
      const radPx = ((w / 2 - 10) * r) / maxR;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radPx, 0, Math.PI * 2);
      ctx.stroke();
    }

    // draw heat “blobs”
    shots.forEach((s) => {
      const { x, y } = toCanvas(s);
      const gradientRadius = 20;

      const g = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);
      g.addColorStop(0, "rgba(248,250,252,0.95)");
      g.addColorStop(0.3, "rgba(251,191,36,0.9)");
      g.addColorStop(1, "rgba(248,113,113,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // small dots on top
    ctx.fillStyle = "#f97316";
    shots.forEach((s) => {
      const { x, y } = toCanvas(s);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [shots, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        border: "1px solid rgba(148,163,184,0.5)",
        background: "#020617",
      }}
    />
  );
}
