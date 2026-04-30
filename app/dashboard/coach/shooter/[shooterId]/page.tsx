import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { BackLink } from "@/components/BackLink";
import { AccountMenu } from "@/components/AccountMenu";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shooter } from "@/models/Shooter";

type RouteParams = { shooterId: string };

interface PageProps {
  params: RouteParams | Promise<RouteParams>;
}

export default async function CoachShooterSessionsPage(props: PageProps) {
  const { shooterId } = await (props.params instanceof Promise
    ? props.params
    : Promise.resolve(props.params));

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token || !process.env.JWT_SECRET) {
    redirect("/login");
  }

  let coachId: string | null = null;
  let userRole: string | null = null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    coachId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    userRole = decoded?.role ?? null;
  } catch {
    coachId = null;
  }

  if (!coachId || userRole !== "coach") {
    redirect("/dashboard");
  }

  await connectDB();

  // Verify the shooter belongs to this coach
  const shooter = await Shooter.findOne({ _id: shooterId, coachId })
    .select("name email organization")
    .lean();

  if (!shooter) {
    redirect("/dashboard");
  }

  const sessions = await Session.find({ shooterId })
    .sort({ startedAt: -1 })
    .limit(50)
    .lean();

  const totalSessions = sessions.length;

  return (
    <main className="theme-shell">
      <div className="page-container">
        <header className="site-header">
          <BrandMark showSubtitle={false} href="/dashboard" />
          <AccountMenu role="coach" />
        </header>

        <div className="nav-row">
          <BackLink href="/dashboard" />
        </div>

        <section className="page-heading">
          <p className="eyebrow">Shooter profile</p>
          <h1 className="page-title">{(shooter as any).name}</h1>
          {(shooter as any).organization && (
            <p className="muted-copy">{(shooter as any).organization}</p>
          )}
          <p className="muted-copy">
            {totalSessions} session{totalSessions !== 1 ? "s" : ""} recorded
          </p>
        </section>

        <section className="panel section-stack">
          <div>
            <p className="eyebrow">Session history</p>
            <h2 className="section-title">All sessions</h2>
          </div>

          {sessions.length === 0 ? (
            <p className="empty-state">
              No sessions recorded yet for this shooter.
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
                    <th>Shots</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session: any) => (
                    <tr key={session._id.toString()}>
                      <td>
                        {new Intl.DateTimeFormat("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(session.startedAt))}
                      </td>
                      <td>{session.gunPreset}</td>
                      <td>{session.targetType}</td>
                      <td>{session.summary?.totalScore ?? "-"}</td>
                      <td>
                        {session.summary?.averageScore
                          ? session.summary.averageScore.toFixed(1)
                          : "-"}
                      </td>
                      <td>{session.summary?.shotCount ?? "-"}</td>
                      <td>
                        <Link
                          href={`/dashboard/session/${session._id.toString()}`}
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
