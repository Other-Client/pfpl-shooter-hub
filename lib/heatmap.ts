export interface HeatmapShot {
  xMm: number;
  yMm: number;
}

interface PaintHeatmapOptions {
  background?: string;
  guideRing?: string;
  crosshair?: string;
  glowInner?: string;
  glowOuter?: string;
  markerRing?: string;
  markerDot?: string;
  glowRadius?: number;
  markerRingRadius?: number;
  markerDotRadius?: number;
}

const DEFAULTS: Required<PaintHeatmapOptions> = {
  background: "#050505",
  guideRing: "rgba(239,191,4,0.2)",
  crosshair: "rgba(239,191,4,0.1)",
  glowInner: "rgba(239,191,4,0.9)",
  glowOuter: "rgba(239,191,4,0)",
  markerRing: "rgba(255,243,207,0.95)",
  markerDot: "#efbf04",
  glowRadius: 18,
  markerRingRadius: 7,
  markerDotRadius: 3,
};

export function paintShotHeatmap(
  ctx: CanvasRenderingContext2D,
  shots: HeatmapShot[],
  options: PaintHeatmapOptions = {}
) {
  const {
    background,
    guideRing,
    crosshair,
    glowInner,
    glowOuter,
    markerRing,
    markerDot,
    glowRadius,
    markerRingRadius,
    markerDotRadius,
  } = { ...DEFAULTS, ...options };

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const targetRadius = Math.min(width, height) / 2 - 14;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const maxShotRadius = shots.length
    ? Math.max(
        10,
        ...shots.map((shot) => Math.hypot(shot.xMm, shot.yMm))
      )
    : 10;
  const scale = targetRadius / maxShotRadius;

  ctx.strokeStyle = guideRing;
  ctx.lineWidth = 1;
  for (let step = 5; step >= 1; step -= 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, (targetRadius * step) / 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = crosshair;
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, height - 10);
  ctx.moveTo(10, cy);
  ctx.lineTo(width - 10, cy);
  ctx.stroke();

  shots.forEach((shot) => {
    const x = cx + shot.xMm * scale;
    const y = cy - shot.yMm * scale;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    glow.addColorStop(0, "rgba(255,243,207,0.42)");
    glow.addColorStop(0.28, glowInner);
    glow.addColorStop(1, glowOuter);

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  shots.forEach((shot) => {
    const x = cx + shot.xMm * scale;
    const y = cy - shot.yMm * scale;

    ctx.strokeStyle = markerRing;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, markerRingRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = markerDot;
    ctx.beginPath();
    ctx.arc(x, y, markerDotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}
