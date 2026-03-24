"use client";

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
  const hasShots = shots.length > 0;

  return (
    <section className="panel heatmap-card">
      <div className="heatmap-card__header">
        <p className="eyebrow">Cluster view</p>
        <h2 className="section-title section-title--small">Shot heatmap</h2>
      </div>

      {hasShots ? (
        <div className="heatmap-card__body">
          <ShotHeatmap shots={shots} size={280} />
          <p className="heatmap-caption">
            Solid markers show each impact while the glow reveals grouping
            density.
          </p>
        </div>
      ) : (
        <p className="empty-state">No shots recorded in this session.</p>
      )}
    </section>
  );
}
