import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";
import { BrandMark } from "@/components/BrandMark";
import LogToken from "@/components/LogToken";
import { connectDB } from "@/lib/db";
import { Shot } from "@/models/Shot";
import { Session } from "@/models/Session";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token || !process.env.JWT_SECRET) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let shooterId: string | null = null;
  let shooterName: string | null = null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    shooterId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    shooterName = decoded?.name ?? null;
  } catch {
    shooterId = null;
    shooterName = null;
  }

  if (!shooterId) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await connectDB();

  const sessions = await Session.find({ shooterId })
    .sort({ startedAt: -1 })
    .limit(20)
    .lean();

  const totalSessions = await Session.countDocuments({ shooterId });
  const totalShots = await Shot.countDocuments({
    sessionId: { $in: sessions.map((session) => session._id) },
  });
  const lastSession = sessions[0];

  return (
    <main className="theme-shell">
      <LogToken />

      <div className="page-container">
        <header className="site-header">
          <BrandMark showSubtitle={false} href="/dashboard" />
          <AccountMenu />
        </header>

        <section className="page-heading">
          <p className="eyebrow">Shooter dashboard</p>
          <h1 className="page-title">
            Welcome{shooterName ? `, ${shooterName}` : ""}
          </h1>
          <p className="muted-copy">
            Review your latest VR sessions, performance trends, and shot
            patterns from one control room.
          </p>
        </section>

        <section className="stats-grid">
          <SummaryCard label="Total sessions" value={totalSessions.toString()} />
          <SummaryCard
            label="Shots in last 20 sessions"
            value={totalShots.toString()}
          />
          {lastSession ? (
            <SummaryCard
              label="Last session"
              value={new Date(lastSession.startedAt).toLocaleString()}
              subtitle={`${lastSession.gunPreset} / ${lastSession.targetType}`}
            />
          ) : null}
        </section>

        <div className="action-row" style={{marginBottom:15}}>
          <Link href="/experience?gameId=demo" className="button button-primary">
            Start VR experience
          </Link>
        </div>

        <section className="panel section-stack">
          <div>
            <p className="eyebrow">Session history</p>
            <h2 className="section-title">Recent sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <p className="empty-state">
              No sessions recorded yet. Once you shoot in the VR range, your
              data will appear here.
            </p>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Gun</th>
                    <th>Target</th>
                    <th>Total score</th>
                    <th>Average</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session: any) => (
                    <tr key={session._id}>
                      <td>{new Date(session.startedAt).toLocaleString()}</td>
                      <td>{session.gunPreset}</td>
                      <td>{session.targetType}</td>
                      <td>{session.summary?.totalScore ?? "-"}</td>
                      <td>
                        {session.summary?.averageScore
                          ? session.summary.averageScore.toFixed(1)
                          : "-"}
                      </td>
                      <td>
                        <Link
                          href={`/dashboard/session/${session._id}`}
                          className="text-link"
                        >
                          View details
                        </Link>
                      </td>
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

function SummaryCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="summary-card">
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
      {subtitle ? <div className="summary-card__meta">{subtitle}</div> : null}
    </div>
  );
}
