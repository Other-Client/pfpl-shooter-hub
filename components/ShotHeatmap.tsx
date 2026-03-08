"use client";

import { MutableRefObject, forwardRef, useEffect, useRef } from "react";

export interface Shot {
  xMm: number;
  yMm: number;
}

interface Props {
  shots: Shot[];
  size?: number;
}

export const ShotHeatmap = forwardRef<HTMLCanvasElement, Props>(
  function ShotHeatmap({ shots, size = 260 }: Props, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || shots.length === 0) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const radii = shots.map((s) => Math.sqrt(s.xMm * s.xMm + s.yMm * s.yMm));
      const maxR = Math.max(10, ...radii);

      function toCanvas(s: Shot) {
        const cx = w / 2;
        const cy = h / 2;
        const scale = (w / 2 - 14) / maxR;
        return {
          x: cx + s.xMm * scale,
          y: cy - s.yMm * scale,
        };
      }

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(239,191,4,0.2)";
      ctx.lineWidth = 1;
      for (let r = maxR; r > 0; r -= maxR / 5) {
        const radiusPx = ((w / 2 - 14) * r) / maxR;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, radiusPx, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(239,191,4,0.1)";
      ctx.beginPath();
      ctx.moveTo(w / 2, 10);
      ctx.lineTo(w / 2, h - 10);
      ctx.moveTo(10, h / 2);
      ctx.lineTo(w - 10, h / 2);
      ctx.stroke();

      shots.forEach((s) => {
        const { x, y } = toCanvas(s);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 24);
        glow.addColorStop(0, "rgba(255,243,207,0.88)");
        glow.addColorStop(0.34, "rgba(239,191,4,0.82)");
        glow.addColorStop(1, "rgba(239,191,4,0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#efbf04";
      shots.forEach((s) => {
        const { x, y } = toCanvas(s);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }, [shots, size]);

    return (
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          if (typeof forwardedRef === "function") {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as MutableRefObject<HTMLCanvasElement | null>).current =
              node;
          }
        }}
        width={size}
        height={size}
        className="heatmap-canvas"
      />
    );
  }
);
