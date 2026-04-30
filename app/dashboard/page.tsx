import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AccountMenu } from "@/components/AccountMenu";
import { BrandMark } from "@/components/BrandMark";
import LogToken from "@/components/LogToken";
import { connectDB } from "@/lib/db";
import { Shot } from "@/models/Shot";
import { Session } from "@/models/Session";
import { Shooter } from "@/models/Shooter";
import { CoachRequest } from "@/models/CoachRequest";

function formatLastSessionStamp(value: Date | string) {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token || !process.env.JWT_SECRET) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let userId: string | null = null;
  let userName: string | null = null;
  let userRole: string | null = null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    userId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    userName = decoded?.name ?? null;
    userRole = decoded?.role ?? "shooter";
  } catch {
    userId = null;
  }

  if (!userId) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await connectDB();

  if (userRole === "coach") {
    return <CoachDashboard coachId={userId} coachName={userName} />;
  }

  // --- Shooter dashboard ---
  // Fetch coachId for the shooter to show "My Coach" info
  const shooterDoc = await Shooter.findById(userId).select("coachId").lean();
  const coachId = (shooterDoc as any)?.coachId ?? null;
  let coachInfo: { name: string; organization?: string } | null = null;
  if (coachId) {
    const coach = await Shooter.findById(coachId).select("name organization").lean();
    if (coach) {
      coachInfo = { name: (coach as any).name, organization: (coach as any).organization };
    }
  }

  const sessions = await Session.find({ shooterId: userId })
    .sort({ startedAt: -1 })
    .limit(20)
    .lean();

  const totalSessions = await Session.countDocuments({ shooterId: userId });
  const totalShots = await Shot.countDocuments({
    sessionId: { $in: sessions.map((session) => session._id) },
  });
  const lastSession = sessions[0];
  const lastSessionStamp = lastSession
    ? formatLastSessionStamp(lastSession.startedAt)
    : null;

  return (
    <main className="theme-shell dashboard-page">
      <LogToken />

      <div className="page-container">
        <header className="site-header">
          <BrandMark showSubtitle={false} href="/dashboard" />
          <AccountMenu role="shooter" />
        </header>

        <section className="page-heading">
          <p className="eyebrow">Shooter dashboard</p>
          <h1 className="page-title">
            Welcome{userName ? `, ${userName}` : ""}
          </h1>
          <p className="muted-copy">
            Review your latest VR sessions, performance trends, and shot
            patterns from one control room.
          </p>
        </section>

        {coachInfo ? (
          <section className="panel coach-banner">
            <p className="eyebrow">Your coach</p>
            <p className="coach-banner__name">{coachInfo.name}</p>
            {coachInfo.organization && (
              <p className="muted-copy">{coachInfo.organization}</p>
            )}
          </section>
        ) : (
          <section className="panel coach-banner coach-banner--empty">
            <p className="muted-copy">
              You don&rsquo;t have a coach yet.{" "}
              <Link href="/dashboard/find-coach" className="text-link">
                Find and join a coach
              </Link>
            </p>
          </section>
        )}

        <section className="stats-grid dashboard-stats-grid">
          <SummaryCard
            className="dashboard-summary-card dashboard-summary-card--metric"
            label="Total sessions"
            value={totalSessions.toString()}
          />
          <SummaryCard
            className="dashboard-summary-card dashboard-summary-card--metric"
            label="Shots in last 20 sessions"
            value={totalShots.toString()}
          />
          {lastSession && lastSessionStamp ? (
            <SummaryCard
              className="dashboard-summary-card dashboard-summary-card--session"
              label="Last session"
              value={
                <div className="dashboard-session-stamp">
                  <span className="dashboard-session-stamp__date">
                    {lastSessionStamp.date}
                  </span>
                  <span className="dashboard-session-stamp__time">
                    {lastSessionStamp.time}
                  </span>
                </div>
              }
              valueClassName="dashboard-session-value"
              subtitle={`${lastSession.gunPreset} / ${lastSession.targetType}`}
            />
          ) : null}
        </section>

        <div className="action-row dashboard-action-row">
          <Link
            href="/experience"
            className="button button-primary button-small dashboard-start-button"
          >
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

async function CoachDashboard({
  coachId,
  coachName,
}: {
  coachId: string;
  coachName: string | null;
}) {
  const shooters = await Shooter.find({ coachId })
    .select("name email organization createdAt")
    .lean();

  const shooterData = await Promise.all(
    shooters.map(async (shooter: any) => {
      const latestSession = await Session.findOne({ shooterId: shooter._id })
        .sort({ startedAt: -1 })
        .select("_id startedAt gunPreset targetType summary")
        .lean();
      return { shooter, latestSession };
    })
  );

  const pendingCount = await CoachRequest.countDocuments({ coachId, status: "pending" });

  const activeThisMonth = shooterData.filter(({ latestSession }) => {
    if (!latestSession) return false;
    const ms = Date.now() - new Date((latestSession as any).startedAt).getTime();
    return ms < 30 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <main className="theme-shell dashboard-page">
      <LogToken />

      <div className="page-container">
        <header className="site-header">
          <BrandMark showSubtitle={false} href="/dashboard" />
          <AccountMenu role="coach" pendingRequests={pendingCount} />
        </header>

        <section className="page-heading">
          <p className="eyebrow">Coach dashboard</p>
          <h1 className="page-title">
            Welcome{coachName ? `, ${coachName}` : ""}
          </h1>
          <p className="muted-copy">
            Monitor your shooters&rsquo; latest sessions and performance trends.
          </p>
        </section>

        <section className="stats-grid dashboard-stats-grid">
          <SummaryCard
            className="dashboard-summary-card dashboard-summary-card--metric"
            label="Total shooters"
            value={shooters.length.toString()}
          />
          <SummaryCard
            className="dashboard-summary-card dashboard-summary-card--metric"
            label="Active this month"
            value={activeThisMonth.toString()}
          />
          {pendingCount > 0 && (
            <SummaryCard
              className="dashboard-summary-card dashboard-summary-card--session"
              label="Pending join requests"
              value={pendingCount.toString()}
              subtitle={
                <Link href="/dashboard/coach/requests" className="text-link">
                  Review requests
                </Link>
              }
            />
          )}
        </section>

        <div className="action-row dashboard-action-row">
          <Link
            href="/experience"
            className="button button-primary button-small dashboard-start-button"
          >
            Start VR experience
          </Link>
        </div>

        <section className="panel section-stack">
          <div>
            <p className="eyebrow">Roster</p>
            <h2 className="section-title">Your shooters</h2>
          </div>

          {shooterData.length === 0 ? (
            <p className="empty-state">
              No shooters yet. Share your name so shooters can find and request to join you.
            </p>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shooter</th>
                    <th>Organisation</th>
                    <th>Last session</th>
                    <th>Avg score</th>
                    <th>Total score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shooterData.map(({ shooter, latestSession }: any) => (
                    <tr key={shooter._id.toString()}>
                      <td>{shooter.name}</td>
                      <td>{shooter.organization ?? "-"}</td>
                      <td>
                        {latestSession
                          ? new Date(latestSession.startedAt).toLocaleDateString()
                          : "No sessions"}
                      </td>
                      <td>
                        {latestSession?.summary?.averageScore
                          ? latestSession.summary.averageScore.toFixed(1)
                          : "-"}
                      </td>
                      <td>{latestSession?.summary?.totalScore ?? "-"}</td>
                      <td>
                        <Link
                          href={`/dashboard/coach/shooter/${shooter._id.toString()}`}
                          className="text-link"
                        >
                          View sessions
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
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={["summary-card", className].filter(Boolean).join(" ")}>
      <div className="summary-card__label">{label}</div>
      <div
        className={["summary-card__value", valueClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
      {subtitle ? <div className="summary-card__meta">{subtitle}</div> : null}
    </div>
  );
}
