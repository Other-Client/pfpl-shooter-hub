import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Session } from "@/models/Session";
import { Shot } from "@/models/Shot";
import Link from "next/link";
import LogToken from "@/components/LogToken";
import LogoutButton from "@/components/LogoutButton";
import { BrandMark } from "@/components/BrandMark";
import { AccountMenu } from "@/components/AccountMenu";

export default async function DashboardPage() {
  let cookiesData = await cookies();
  const token = cookiesData.get("authToken")?.value;
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
  const totalShots = await Shot.countDocuments({ sessionId: { $in: sessions.map((s) => s._id) } });

  const lastSession = sessions[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #0f172a, #020617 60%)",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        padding: "2rem",
      }}
    >
      <LogToken />
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header
          style={{
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <BrandMark showSubtitle={false} href="/dashboard" />
          <AccountMenu />
        </header>

        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            Welcome{shooterName ? `, ${shooterName}` : ""}
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#e5e7eb", marginTop: "0.35rem" }}>
            Review your VR training sessions, scores and shot patterns.
          </p>
        </div>

        {/* Summary cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <SummaryCard
            label="Total Sessions"
            value={totalSessions.toString()}
          />
          <SummaryCard
            label="Total Shots (last 20 sessions)"
            value={totalShots.toString()}
          />
          {lastSession && (
            <SummaryCard
              label="Last Session"
              value={new Date(lastSession.startedAt).toLocaleString()}
              subtitle={`${lastSession.gunPreset} • ${lastSession.targetType}`}
            />
          )}
        </section>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/experience?gameId=demo">
            <button
              style={{
                padding: "1rem 2rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "1.125rem",
                fontWeight: "600",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
                cursor: "pointer",
                minWidth: "200px",
                display: "inline-block",
              }}
            >
              🚀 Start VR Experience
            </button>
          </Link>
        </div>
        {/* CreateDummySessionButton intentionally hidden */}

        {/* Recent sessions list */}
        <section>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Recent Sessions
          </h2>
          {sessions.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              No sessions recorded yet. Once you shoot in the VR range, your
              data will appear here.
            </p>
          )}
          {sessions.length > 0 && (
            <div
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(148,163,184,0.5)",
                overflow: "hidden",
                background: "rgba(15,23,42,0.8)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead
                  style={{
                    background: "rgba(15,23,42,0.95)",
                    textAlign: "left",
                  }}
                >
                  <tr>
                    <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Gun</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Target</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Total Score</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Avg</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s: any) => (
                    <tr key={s._id} style={{ borderTop: "1px solid rgba(30,64,175,0.4)" }}>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        {new Date(s.startedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.7rem 1rem" }}>{s.gunPreset}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>{s.targetType}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        {s.summary?.totalScore ?? "-"}
                      </td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        {s.summary?.averageScore
                          ? s.summary.averageScore.toFixed(1)
                          : "-"}
                      </td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <a
                          href={`/dashboard/session/${s._id}`}
                          style={{
                            fontSize: "0.85rem",
                            color: "#fbbf24",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          View details
                        </a>
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

function SummaryCard(props: { label: string; value: string; subtitle?: string }) {
  return (
    <div
      style={{
        borderRadius: "1.2rem",
        padding: "1rem 1.25rem",
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,64,175,0.95))",
        border: "1px solid rgba(148,163,184,0.5)",
        boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.35rem" }}>
        {props.label}
      </div>
      <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{props.value}</div>
      {props.subtitle && (
        <div style={{ fontSize: "0.8rem", color: "#cbd5f5", marginTop: "0.15rem" }}>
          {props.subtitle}
        </div>
      )}
    </div>
  );
}
