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

function drawHeatmap(shots: ShotDetail[], opts: { size?: number; bg?: string; ring?: string; dot?: string }) {
  const { size = 260, bg = "#ffffff", ring = "rgba(0,0,0,0.35)", dot = "#000000" } = opts;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  if (shots.length === 0) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    return canvas.toDataURL("image/png");
  }

  const radii = shots.map((s) => Math.sqrt(s.xMm * s.xMm + s.yMm * s.yMm));
  const maxR = Math.max(10, ...radii);
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size / 2 - 10) / maxR;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = ring;
  ctx.lineWidth = 1;
  for (let r = maxR; r > 0; r -= maxR / 5) {
    const radPx = ((size / 2 - 10) * r) / maxR;
    ctx.beginPath();
    ctx.arc(cx, cy, radPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = dot;
  shots.forEach((s) => {
    const x = cx + s.xMm * scale;
    const y = cy - s.yMm * scale;
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
    () => drawHeatmap(shots, { bg: "#ffffff", ring: "rgba(0,0,0,0.35)", dot: "#000" }),
    [shots]
  );

  useEffect(() => {
    const tryLoadLogo = async () => {
      const candidates = ["/logo.png", "/logo.svg", "/logo.jpg", "/logo.jpeg"];
      for (const path of candidates) {
        try {
          const res = await fetch(path);
          if (!res.ok) continue;
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
    if (!heatmapDataUrl) return;
    const link = document.createElement("a");
    link.download = `session-${sessionId}-heatmap.png`;
    link.href = heatmapDataUrl;
    link.click();
  };

  const openPreview = () => {
    const shotsHtml = shots
      .map((sh, idx) => {
        const tMs =
          typeof sh.tsMs === "number"
            ? Math.round((sh.tsMs - sessionMeta.referenceTime) / 10) / 100
            : "-";
        return `<tr>
          <td>${idx + 1}</td>
          <td>${tMs}</td>
          <td>${sh.xMm?.toFixed?.(1) ?? "-"}</td>
          <td>${sh.yMm?.toFixed?.(1) ?? "-"}</td>
          <td>${sh.ring ?? "-"}</td>
          <td>${sh.score?.toFixed?.(1) ?? "-"}</td>
          <td>${sh.isInnerTen ? "Yes" : ""}</td>
        </tr>`;
      })
      .join("");

    const win = window.open("", "_blank");
    if (!win) return;

    const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Session ${sessionId} – Preview</title>
          <style>
            :root { --ink:#0b1224; --muted:#6b7280; --accent:#2563eb; }
            * { box-sizing: border-box; }
            body { margin:0; padding:32px; font-family:"Inter",system-ui,-apple-system,sans-serif; color:var(--ink); background:#f7f8fb; }
            .page { width:210mm; min-height:297mm; margin:0 auto; background:white; box-shadow:0 20px 60px rgba(15,23,42,0.1); padding:28mm 24mm; }
            h1 { margin:0 0 6px; font-size:24px; }
            .muted { color:var(--muted); font-size:13px; }
            .grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px 16px; margin-top:14px; }
            .card { border:1px solid #e5e7eb; border-radius:12px; padding:14px; background:#f9fafb; }
            .heatmap { text-align:center; margin-top:18px; }
            .heatmap img { border-radius:14px; border:1px solid #e5e7eb; max-width:160mm; }
            table { width:100%; border-collapse:collapse; margin-top:18px; font-size:11px; }
            th, td { padding:6px 8px; border-bottom:1px solid #e5e7eb; text-align:left; }
            th { background:#eef2ff; color:#111827; }
            .actions { margin:16px 0 24px; display:flex; gap:12px; }
            .btn { padding:10px 14px; border-radius:999px; border:1px solid #cbd5e1; background:white; color:var(--ink); text-decoration:none; font-size:13px; display:inline-flex; align-items:center; gap:8px; }
            .btn.primary { background:linear-gradient(135deg,#2563eb,#0ea5e9); border:none; color:white; box-shadow:0 10px 30px rgba(37,99,235,0.28); }
            @media print { body { background:white; } .page { box-shadow:none; margin:0; width:auto; min-height:auto; padding:0; } .actions { display:none; } }
          </style>
        </head>
        <body>
          <div class="actions"><button onclick="window.print()" class="btn primary">Print / Save as PDF</button></div>
          <section class="page">
            <header>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo" style="height:32px;width:auto;border-radius:6px;">` : ""}
                <div>
                  <h1 style="margin:0;">PreciShot — Session Summary</h1>
                  <div class="muted">Session ${sessionId}</div>
                </div>
              </div>
            </header>
            <div class="grid">
              <div class="card"><div class="muted">Shooter</div><div>${sessionMeta.shooterName ?? sessionMeta.shooterId ?? "N/A"}</div></div>
              <div class="card"><div class="muted">Started</div><div>${sessionMeta.startedAtLabel}</div></div>
              <div class="card"><div class="muted">Gun preset</div><div>${sessionMeta.gunPreset}</div></div>
              <div class="card"><div class="muted">Target type</div><div>${sessionMeta.targetType}</div></div>
              <div class="card"><div class="muted">Total score</div><div>${sessionMeta.summary.totalScore.toFixed(1)}</div></div>
              <div class="card"><div class="muted">Average</div><div>${sessionMeta.summary.averageScore.toFixed(1)}</div></div>
              <div class="card"><div class="muted">Group size</div><div>${sessionMeta.summary.groupSizeMm ? sessionMeta.summary.groupSizeMm.toFixed(1) + " mm" : "-"}</div></div>
              <div class="card"><div class="muted">Offset</div><div>${sessionMeta.summary.offsetXMm?.toFixed?.(1) ?? "-"} mm, ${sessionMeta.summary.offsetYMm?.toFixed?.(1) ?? "-"} mm</div></div>
            </div>
            <div class="heatmap"><div class="muted" style="margin-bottom:8px;">Heat map</div>${heatmapDataUrl ? `<img src="${heatmapDataUrl}" alt="Heatmap" />` : "<div class='muted'>No shots</div>"}</div>
            <div style="margin-top:18px;">
              <div style="font-weight:600; margin-bottom:6px;">Shots (${shots.length})</div>
              <table>
                <thead><tr><th>#</th><th>Time (s)</th><th>X (mm)</th><th>Y (mm)</th><th>Ring</th><th>Score</th><th>Inner 10</th></tr></thead>
                <tbody>${shotsHtml || `<tr><td colspan="7" style="text-align:center; padding:12px;">No shots recorded</td></tr>`}</tbody>
              </table>
            </div>
          </section>
        </body>
      </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const left = 14;
    let y = 18;

    doc.setFillColor(247, 248, 251);
    doc.rect(10, 10, 190, 277, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    if (logoDataUrl) {
      try {
        const format = logoDataUrl.startsWith("data:image/png") ? "PNG" : logoDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
        doc.addImage(logoDataUrl, format as any, 160, 12, 24, 10);
      } catch {}
    }
    doc.text("PreciShot — Session Summary", left, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(90, 96, 112);
    doc.text(`Session ${sessionId}`, left, y);
    y += 9;
    doc.setTextColor(0, 0, 0);

    const meta = [
      ["Shooter", sessionMeta.shooterName ?? sessionMeta.shooterId ?? "N/A"],
      ["Started", sessionMeta.startedAtLabel],
      ["Gun preset", sessionMeta.gunPreset],
      ["Target", sessionMeta.targetType],
      ["Total score", sessionMeta.summary.totalScore.toFixed(1)],
      ["Average", sessionMeta.summary.averageScore.toFixed(1)],
      ["Group size", sessionMeta.summary.groupSizeMm ? `${sessionMeta.summary.groupSizeMm.toFixed(1)} mm` : "-"],
      ["Offset", `${sessionMeta.summary.offsetXMm?.toFixed?.(1) ?? "-"} mm / ${sessionMeta.summary.offsetYMm?.toFixed?.(1) ?? "-"} mm`],
    ];

    doc.setDrawColor(220);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(left - 2, y - 4, 88, meta.length * 7 + 8, 2, 2, "FD");

    meta.forEach(([label, value], idx) => {
      const rowY = y + idx * 7;
      doc.setFontSize(9);
      doc.setTextColor(99, 102, 110);
      doc.text(label + ":", left, rowY);
      doc.setTextColor(17, 24, 39);
      doc.text(String(value), left + 32, rowY);
      if (idx < meta.length - 1) {
        doc.setDrawColor(235);
        doc.line(left - 2, rowY + 2, left + 84, rowY + 2);
      }
    });

    if (heatmapDataUrl) {
      const imgWidth = 80;
      const imgHeight = 80;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Heatmap", 120, y + 2);
      doc.roundedRect(118, y + 6, imgWidth + 8, imgHeight + 8, 3, 3);
      doc.addImage(heatmapDataUrl, "PNG", 122, y + 10, imgWidth, imgHeight);
    }

    let tableY = y + 96;
    const headers = ["#", "Time(s)", "X", "Y", "Ring", "Score", "Inner10"];
    const colX = [14, 28, 48, 66, 84, 106, 132];
    const rowHeight = 6;

    const drawHeader = () => {
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.setFont("helvetica", "bold");
      headers.forEach((h, i) => doc.text(h, colX[i], tableY));
      doc.setDrawColor(200);
      doc.line(colX[0], tableY + 1, 190, tableY + 1);
      tableY += rowHeight;
    };

    drawHeader();

    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");

    shots.forEach((sh, idx) => {
      if (tableY > 285) {
        doc.addPage();
        tableY = 18;
        drawHeader();
      }
      const timeVal =
        typeof sh.tsMs === "number"
          ? Math.round((sh.tsMs - sessionMeta.referenceTime) / 10) / 100
          : "-";
      const row = [
        String(idx + 1),
        String(timeVal),
        sh.xMm?.toFixed?.(1) ?? "-",
        sh.yMm?.toFixed?.(1) ?? "-",
        sh.ring !== undefined ? String(sh.ring) : "-",
        sh.score?.toFixed?.(1) ?? "-",
        sh.isInnerTen ? "Yes" : "",
      ];
      row.forEach((text, i) => doc.text(text, colX[i], tableY));
      doc.setDrawColor(225);
      doc.line(colX[0], tableY + 1, 190, tableY + 1);
      tableY += rowHeight;
    });

    doc.save(`session-${sessionId}-summary.pdf`);
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <a
        href={`/api/session/${sessionId}/csv`}
        style={{
          padding: "0.5rem 0.9rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.7)",
          fontSize: "0.8rem",
          textDecoration: "none",
          color: "#e5e7eb",
          background: "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(59,130,246,0.9))",
        }}
      >
        Download CSV
      </a>
      <button
        onClick={downloadHeatmap}
        disabled={!hasShots}
        style={{
          padding: "0.45rem 0.9rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.7)",
          background: hasShots ? "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(14,165,233,0.9))" : "rgba(148,163,184,0.2)",
          color: hasShots ? "white" : "rgba(226,232,240,0.6)",
          fontSize: "0.8rem",
          cursor: hasShots ? "pointer" : "not-allowed",
        }}
      >
        Download HeatMap Image
      </button>
      {/* <button
        onClick={openPreview}
        style={{
          padding: "0.45rem 0.9rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.6)",
          background: "rgba(59,130,246,0.15)",
          color: "white",
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        Preview summary (A4)
      </button> */}
      <button
        onClick={downloadPdf}
        style={{
          padding: "0.45rem 0.9rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.6)",
          background: "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(59,130,246,0.9))",
          color: "white",
          fontSize: "0.8rem",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(16,185,129,0.25)",
        }}
      >
        Download PDF summary
      </button>
    </div>
  );
}

