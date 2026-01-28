"use client";

import { useRef } from "react";
import { ShotHeatmap, Shot } from "./ShotHeatmap";

interface ShotDetail extends Shot {
  _id?: string;
  tsMs?: number;
  ring?: number;
  score?: number;
  isInnerTen?: boolean;
}

interface Props {
  shots: ShotDetail[];
}

export function ShotHeatmapCard({ shots }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasShots = shots.length > 0;

  return (
    <div
      style={{
        borderRadius: "1.25rem",
        padding: "1.25rem",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Shot heatmap</h2>
      </div>

      {hasShots ? (
        <>
          <ShotHeatmap ref={canvasRef} shots={shots} size={260} />
          <p
            style={{
              fontSize: "0.8rem",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            Brighter areas indicate denser shot clusters. Center of the canvas
            corresponds to target center.
          </p>
        </>
      ) : (
        <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
          No shots recorded in this session.
        </p>
      )}
    </div>
  );
}

