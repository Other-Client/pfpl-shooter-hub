import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";
import { ShotHeatmapCard } from "@/components/ShotHeatmapCard";
import { SessionDownloads } from "@/components/SessionDownloads";
import { BrandMark } from "@/components/BrandMark";
import { BackLink } from "@/components/BackLink";

type SessionRouteParams = { id: string };

interface PageProps {
  params: SessionRouteParams | Promise<SessionRouteParams>;
}

export default async function SessionDetailPage(props: PageProps) {
  const { id: sessionId } = await props.params;

  const cookiesData = await cookies();
  const token = cookiesData.get("authToken")?.value;
  if (!token || !process.env.JWT_SECRET) {
    redirect(`/login?callbackUrl=/dashboard/session/${sessionId}`);
  }

  let shooterId: string | null = null;
  let shooterName: string | null = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    shooterId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    shooterName = decoded?.name ?? decoded?.email ?? null;
  } catch {
    shooterId = null;
  }

  if (!shooterId) {
    redirect(`/login?callbackUrl=/dashboard/session/${sessionId}`);
  }

  await connectDB();

  const s = await Session.findOne({ _id: sessionId, shooterId }).lean();
  if (!s) {
    redirect("/dashboard");
  }

  const shots = await Shot.find({ sessionId }).sort({ index: 1 }).lean();
  const shotsPlain = shots.map((sh: any) => ({
    _id: sh._id.toString?.() ?? String(sh._id),
    sessionId: sh.sessionId?.toString?.() ?? String(sh.sessionId),
    index: sh.index,
    tsMs: sh.tsMs,
    xMm: sh.xMm,
    yMm: sh.yMm,
    score: sh.score,
    ring: sh.ring,
    isInnerTen: sh.isInnerTen,
  }));

  const shotCount = shots.length;
  const totalScore =
    s.summary?.totalScore ?? shots.reduce((sum, sh: any) => sum + (sh.score || 0), 0);
  const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

  let avgX = 0,
    avgY = 0;
  shots.forEach((sh: any) => {
    avgX += sh.xMm;
    avgY += sh.yMm;
  });
  if (shotCount > 0) {
    avgX /= shotCount;
    avgY /= shotCount;
  }
  let maxDist = 0;
  shots.forEach((sh: any) => {
    const dx = sh.xMm - avgX;
    const dy = sh.yMm - avgY;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > maxDist) maxDist = d;
  });
  const referenceTime = new Date(s.startedAt).getTime();
  const startedAtIst = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(s.startedAt));

  const sessionMeta = {
    shooterId,
    shooterName,
    startedAtLabel: startedAtIst,
    gunPreset: s.gunPreset,
    targetType: s.targetType,
    summary: {
      totalScore,
      averageScore,
      shotCount,
      groupSizeMm: maxDist || undefined,
      offsetXMm: shotCount ? avgX : undefined,
      offsetYMm: shotCount ? avgY : undefined,
    },
    referenceTime,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #0f172a, #020617 60%)",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <BackLink href="/dashboard" />
          <BrandMark subtitle="Session" href="/dashboard" />
        </div>

        <header style={{ margin: "1rem 0 1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>Session details</h1>
          <p style={{ fontSize: "0.9rem", color: "#e5e7eb" }}>
            {startedAtIst} - {s.gunPreset} - {s.targetType}
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              borderRadius: "1.25rem",
              padding: "1.25rem",
              background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.95))",
              border: "1px solid rgba(148,163,184,0.5)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Summary
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              <SummaryField label="Shots" value={shotCount.toString()} />
              <SummaryField label="Total score" value={totalScore.toFixed(1)} />
              <SummaryField label="Average" value={averageScore.toFixed(1)} />
              <SummaryField label="Group size (approx)" value={maxDist ? `${maxDist.toFixed(1)} mm` : "-"} />
              <SummaryField label="Offset X" value={shotCount ? `${avgX.toFixed(1)} mm` : "-"} />
              <SummaryField label="Offset Y" value={shotCount ? `${avgY.toFixed(1)} mm` : "-"} />
            </div>

            <div style={{ marginTop: "1.25rem", fontSize: "0.85rem" }}>
              <p style={{ color: "#9ca3af", marginBottom: "0.4rem" }}>Downloads & exports</p>
              <SessionDownloads shots={shotsPlain as any} sessionId={sessionId} sessionMeta={sessionMeta} />
            </div>
          </div>

          <ShotHeatmapCard shots={shotsPlain as any} />
        </section>

        <section>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Shots
          </h2>
          {shots.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>No shots recorded.</p>
          ) : (
            <div
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(148,163,184,0.5)",
                overflow: "hidden",
                background: "rgba(15,23,42,0.85)",
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}
              >
                <thead style={{ background: "rgba(15,23,42,0.95)", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: "0.6rem 0.9rem" }}>#</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>Time (s)</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>X (mm)</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>Y (mm)</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>Ring</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>Score</th>
                    <th style={{ padding: "0.6rem 0.9rem" }}>Inner 10</th>
                  </tr>
                </thead>
                <tbody>
                  {shots.map((sh: any, idx: number) => (
                    <tr key={sh._id} style={{ borderTop: "1px solid rgba(30,64,175,0.4)" }}>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{idx + 1}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{Math.floor((sh.tsMs - referenceTime) / 100) / 10}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{sh.xMm.toFixed(1)}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{sh.yMm.toFixed(1)}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{sh.ring}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{sh.score.toFixed(1)}</td>
                      <td style={{ padding: "0.55rem 0.9rem" }}>{sh.isInnerTen ? "Yes" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
