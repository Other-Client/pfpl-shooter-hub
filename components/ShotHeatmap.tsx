"use client";

import { MutableRefObject, forwardRef, useEffect, useRef } from "react";
import { paintShotHeatmap, type HeatmapShot } from "@/lib/heatmap";

export type Shot = HeatmapShot;

interface Props {
  shots: Shot[];
  size?: number;
}

export const ShotHeatmap = forwardRef<HTMLCanvasElement, Props>(
  function ShotHeatmap({ shots, size = 260 }: Props, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }

      paintShotHeatmap(ctx, shots, {
        glowRadius: 20,
        markerRingRadius: 7.5,
        markerDotRadius: 3.4,
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
