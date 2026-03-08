"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Shot } from "./ShotHeatmap";

interface ShotDetail extends Shot {
  _id?: string;
  tsMs?: number;
  ring?: number;
  score?: number;
  isInnerTen?: boolean;
}

interface SessionMeta {
  shooterId?: string | null;
  shooterName?: string | null;
  startedAtLabel: string;
  gunPreset: string;
  targetType: string;
  summary: {
    totalScore: number;
    averageScore: number;
    shotCount: number;
    groupSizeMm?: number;
    offsetXMm?: number;
    offsetYMm?: number;
  };
  referenceTime: number;
}

interface Props {
  shots: ShotDetail[];
  sessionId: string;
  sessionMeta: SessionMeta;
}

function drawHeatmap(
  shots: ShotDetail[],
  opts: { size?: number; bg?: string; ring?: string; dot?: string }
) {
  const {
    size = 260,
    bg = "#050505",
    ring = "rgba(239,191,4,0.3)",
    dot = "#efbf04",
  } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (shots.length === 0) {
    return canvas.toDataURL("image/png");
  }

  const radii = shots.map((shot) => Math.sqrt(shot.xMm * shot.xMm + shot.yMm * shot.yMm));
  const maxR = Math.max(10, ...radii);
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size / 2 - 14) / maxR;

  ctx.strokeStyle = ring;
  ctx.lineWidth = 1;
  for (let r = maxR; r > 0; r -= maxR / 5) {
    const radiusPx = ((size / 2 - 14) * r) / maxR;
    ctx.beginPath();
    ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(239,191,4,0.14)";
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, size - 10);
  ctx.moveTo(10, cy);
  ctx.lineTo(size - 10, cy);
  ctx.stroke();

  shots.forEach((shot) => {
    const x = cx + shot.xMm * scale;
    const y = cy - shot.yMm * scale;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 22);
    glow.addColorStop(0, "rgba(255,243,207,0.92)");
    glow.addColorStop(0.36, "rgba(239,191,4,0.82)");
    glow.addColorStop(1, "rgba(239,191,4,0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = dot;
  shots.forEach((shot) => {
    const x = cx + shot.xMm * scale;
    const y = cy - shot.yMm * scale;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas.toDataURL("image/png");
}

export function SessionDownloads({ shots, sessionId, sessionMeta }: Props) {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const hasShots = shots.length > 0;
  const heatmapDataUrl = useMemo(
    () =>
      drawHeatmap(shots, {
        bg: "#050505",
        ring: "rgba(239,191,4,0.3)",
        dot: "#efbf04",
      }),
    [shots]
  );

  useEffect(() => {
    const tryLoadLogo = async () => {
      const candidates = ["/logo.png", "/logo.svg", "/logo.jpg", "/logo.jpeg"];
      for (const path of candidates) {
        try {
          const res = await fetch(path);
          if (!res.ok) {
            continue;
          }

          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => setLogoDataUrl(reader.result as string);
          reader.readAsDataURL(blob);
          return;
        } catch {
          /* ignore */
        }
      }
    };

    tryLoadLogo();
  }, []);

  const downloadHeatmap = () => {
    if (!heatmapDataUrl) {
      return;
    }

    const link = document.createElement("a");
    link.download = `session-${sessionId}-heatmap.png`;
    link.href = heatmapDataUrl;
    link.click();
  };

  const downloadPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const left = 16;
    let y = 18;

    doc.setFillColor(248, 238, 192);
    doc.rect(0, 0, 210, 297, "F");

    doc.setFillColor(8, 8, 8);
    doc.roundedRect(12, 12, 186, 24, 4, 4, "F");

    if (logoDataUrl) {
      try {
        const format = logoDataUrl.startsWith("data:image/png")
          ? "PNG"
          : logoDataUrl.startsWith("data:image/jpeg")
            ? "JPEG"
            : "PNG";
        doc.addImage(logoDataUrl, format as any, 170, 16, 18, 10);
      } catch {
        /* ignore */
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(239, 191, 4);
    doc.text("PreciShot Session Summary", left, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(193, 160, 48);
    doc.text(`Session ${sessionId}`, left, y + 11);
    y += 26;

    const meta = [
      ["Shooter", sessionMeta.shooterName ?? sessionMeta.shooterId ?? "N/A"],
      ["Started", sessionMeta.startedAtLabel],
      ["Gun preset", sessionMeta.gunPreset],
      ["Target", sessionMeta.targetType],
      ["Total score", sessionMeta.summary.totalScore.toFixed(1)],
      ["Average", sessionMeta.summary.averageScore.toFixed(1)],
      [
        "Group size",
        sessionMeta.summary.groupSizeMm
          ? `${sessionMeta.summary.groupSizeMm.toFixed(1)} mm`
          : "-",
      ],
      [
        "Offset",
        `${sessionMeta.summary.offsetXMm?.toFixed?.(1) ?? "-"} mm / ${
          sessionMeta.summary.offsetYMm?.toFixed?.(1) ?? "-"
        } mm`,
      ],
    ];

    doc.setDrawColor(210, 170, 28);
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(left - 2, y - 4, 88, meta.length * 7 + 8, 2, 2, "FD");

    meta.forEach(([label, value], index) => {
      const rowY = y + index * 7;
      doc.setFontSize(9);
      doc.setTextColor(137, 110, 26);
      doc.text(`${label}:`, left, rowY);
      doc.setTextColor(15, 15, 15);
      doc.text(String(value), left + 32, rowY);
      if (index < meta.length - 1) {
        doc.setDrawColor(232, 211, 122);
        doc.line(left - 2, rowY + 2, left + 84, rowY + 2);
      }
    });

    if (heatmapDataUrl) {
      const imgWidth = 80;
      const imgHeight = 80;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 15, 15);
      doc.text("Heatmap", 120, y + 2);
      doc.setDrawColor(210, 170, 28);
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(118, y + 6, imgWidth + 8, imgHeight + 8, 3, 3, "FD");
      doc.addImage(heatmapDataUrl, "PNG", 122, y + 10, imgWidth, imgHeight);
    }

    let tableY = y + 96;
    const headers = ["#", "Time(s)", "X", "Y", "Ring", "Score", "Inner10"];
    const colX = [16, 30, 50, 68, 90, 112, 140];
    const rowHeight = 6;

    const drawHeader = () => {
      doc.setFillColor(8, 8, 8);
      doc.rect(14, tableY - 4, 176, 7, "F");
      doc.setFontSize(10);
      doc.setTextColor(239, 191, 4);
      doc.setFont("helvetica", "bold");
      headers.forEach((header, index) => doc.text(header, colX[index], tableY));
      tableY += rowHeight;
    };

    drawHeader();

    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "normal");

    shots.forEach((shot, index) => {
      if (tableY > 285) {
        doc.addPage();
        doc.setFillColor(248, 238, 192);
        doc.rect(0, 0, 210, 297, "F");
        tableY = 18;
        drawHeader();
      }

      const timeVal =
        typeof shot.tsMs === "number"
          ? Math.round((shot.tsMs - sessionMeta.referenceTime) / 10) / 100
          : "-";
      const row = [
        String(index + 1),
        String(timeVal),
        shot.xMm?.toFixed?.(1) ?? "-",
        shot.yMm?.toFixed?.(1) ?? "-",
        shot.ring !== undefined ? String(shot.ring) : "-",
        shot.score?.toFixed?.(1) ?? "-",
        shot.isInnerTen ? "Yes" : "",
      ];

      row.forEach((text, colIndex) => doc.text(text, colX[colIndex], tableY));
      doc.setDrawColor(232, 211, 122);
      doc.line(colX[0], tableY + 1, 190, tableY + 1);
      tableY += rowHeight;
    });

    doc.save(`session-${sessionId}-summary.pdf`);
  };

  return (
    <div className="export-actions">
      <a
        href={`/api/session/${sessionId}/csv`}
        className="button button-secondary button-small"
      >
        Download CSV
      </a>

      <button
        type="button"
        onClick={downloadHeatmap}
        disabled={!hasShots}
        className="button button-secondary button-small"
      >
        Download heatmap image
      </button>

      <button
        type="button"
        onClick={downloadPdf}
        className="button button-primary button-small"
      >
        Download PDF summary
      </button>
    </div>
  );
}
