import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BrandMark } from "@/components/BrandMark";
import { SessionDownloads } from "@/components/SessionDownloads";
import { ShotHeatmapCard } from "@/components/ShotHeatmapCard";
import { connectDB } from "@/lib/db";
import { Shot } from "@/models/Shot";
import { Session } from "@/models/Session";

type SessionRouteParams = { id: string };

interface PageProps {
  params: SessionRouteParams | Promise<SessionRouteParams>;
}

const formatSessionLabel = (value: string) => value.replace(/_/g, " ");

export default async function SessionDetailPage(props: PageProps) {
  const { id: sessionId } = await props.params;

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

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

  const session = await Session.findOne({ _id: sessionId, shooterId }).lean();
  if (!session) {
    redirect("/dashboard");
  }

  const shots = await Shot.find({ sessionId }).sort({ index: 1 }).lean();
  const shotsPlain = shots.map((shot: any) => ({
    _id: shot._id.toString?.() ?? String(shot._id),
    sessionId: shot.sessionId?.toString?.() ?? String(shot.sessionId),
    index: shot.index,
    tsMs: shot.tsMs,
    xMm: shot.xMm,
    yMm: shot.yMm,
    score: shot.score,
    ring: shot.ring,
    isInnerTen: shot.isInnerTen,
  }));

  const shotCount = shots.length;
  const totalScore =
    session.summary?.totalScore ??
    shots.reduce((sum, shot: any) => sum + (shot.score || 0), 0);
  const averageScore = shotCount > 0 ? totalScore / shotCount : 0;

  let avgX = 0;
  let avgY = 0;
  shots.forEach((shot: any) => {
    avgX += shot.xMm;
    avgY += shot.yMm;
  });

  if (shotCount > 0) {
    avgX /= shotCount;
    avgY /= shotCount;
  }

  let maxDist = 0;
  shots.forEach((shot: any) => {
    const dx = shot.xMm - avgX;
    const dy = shot.yMm - avgY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDist) {
      maxDist = distance;
    }
  });

  const referenceTime = new Date(session.startedAt).getTime();
  const startedAtIst = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(session.startedAt));

  const sessionMeta = {
    shooterId,
    shooterName,
    startedAtLabel: startedAtIst,
    gunPreset: formatSessionLabel(session.gunPreset),
    targetType: formatSessionLabel(session.targetType),
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
    <main className="theme-shell">
      <div className="page-container">
        <div className="page-header-row page-header-row--session">
          <div className="nav-row">
            <BackLink href="/dashboard" />
            <BrandMark subtitle="Session" href="/dashboard" />
          </div>
        </div>

        <section className="page-heading page-heading--session">
          <p className="eyebrow">Session breakdown</p>
          <h1 className="page-title">Session details</h1>
          <div className="session-meta-row">
            <span>{startedAtIst}</span>
            <span>{formatSessionLabel(session.gunPreset)}</span>
            <span>{formatSessionLabel(session.targetType)}</span>
          </div>
        </section>

        <section className="detail-layout detail-layout--session">
          <div className="panel section-stack session-overview-panel">
            <div className="session-section-header">
              <p className="eyebrow">Performance summary</p>
              <h2 className="section-title">Session metrics</h2>
              <p className="section-lead">
                Quick read on score, grouping, and average point of impact.
              </p>
            </div>

            <div className="summary-grid summary-grid--session">
              <SummaryField label="Shots" value={shotCount.toString()} />
              <SummaryField label="Total score" value={totalScore.toFixed(1)} />
              <SummaryField label="Average" value={averageScore.toFixed(1)} />
              <SummaryField
                label="Group size"
                value={maxDist ? `${maxDist.toFixed(1)} mm` : "-"}
              />
              <SummaryField
                label="Offset X"
                value={shotCount ? `${avgX.toFixed(1)} mm` : "-"}
              />
              <SummaryField
                label="Offset Y"
                value={shotCount ? `${avgY.toFixed(1)} mm` : "-"}
              />
            </div>

            <div className="section-stack session-downloads">
              <div className="session-section-header">
                <p className="eyebrow">Downloads and exports</p>
                <h3 className="section-title section-title--small">
                  Session files
                </h3>
                <p className="section-lead">
                  Export the raw data, the visual cluster map, or a printable
                  session summary.
                </p>
              </div>
              <SessionDownloads
                shots={shotsPlain as any}
                sessionId={sessionId}
                sessionMeta={sessionMeta}
              />
            </div>
          </div>

          <ShotHeatmapCard shots={shotsPlain as any} />
        </section>

        <section className="panel section-stack session-log-panel">
          <div className="session-section-header">
            <p className="eyebrow">Shot log</p>
            <h2 className="section-title">Recorded shots</h2>
          </div>

          {shots.length === 0 ? (
            <p className="empty-state">No shots recorded.</p>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time (s)</th>
                    <th>X (mm)</th>
                    <th>Y (mm)</th>
                    <th>Ring</th>
                    <th>Score</th>
                    <th>Inner 10</th>
                  </tr>
                </thead>
                <tbody>
                  {shots.map((shot: any, index: number) => (
                    <tr key={shot._id}>
                      <td>{index + 1}</td>
                      <td>{Math.floor((shot.tsMs - referenceTime) / 100) / 10}</td>
                      <td>{shot.xMm.toFixed(1)}</td>
                      <td>{shot.yMm.toFixed(1)}</td>
                      <td>{shot.ring}</td>
                      <td>{shot.score.toFixed(1)}</td>
                      <td>{shot.isInnerTen ? "Yes" : ""}</td>
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

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="summary-field">
      <div className="summary-field__label">{label}</div>
      <div className="summary-field__value">{value}</div>
    </div>
  );
}
