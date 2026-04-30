import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { BackLink } from "@/components/BackLink";
import { AccountMenu } from "@/components/AccountMenu";
import { connectDB } from "@/lib/db";
import { CoachRequest } from "@/models/CoachRequest";
import { CoachRequestActions } from "./CoachRequestActions";

export default async function CoachRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token || !process.env.JWT_SECRET) {
    redirect("/login?callbackUrl=/dashboard/coach/requests");
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

  const requests = await CoachRequest.find({ coachId, status: "pending" })
    .populate("shooterId", "name email organization")
    .sort({ createdAt: -1 })
    .lean();

  const pending = requests.map((r: any) => ({
    _id: r._id.toString(),
    createdAt: r.createdAt?.toISOString() ?? null,
    shooter: {
      _id: r.shooterId?._id?.toString() ?? r.shooterId?.toString(),
      name: r.shooterId?.name ?? "Unknown",
      email: r.shooterId?.email ?? null,
      organization: r.shooterId?.organization ?? null,
    },
  }));

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
          <p className="eyebrow">Coaching</p>
          <h1 className="page-title">Join requests</h1>
          <p className="muted-copy">
            Approve or reject shooters who have requested to join your roster.
          </p>
        </section>

        <section className="panel section-stack">
          {pending.length === 0 ? (
            <p className="empty-state">No pending requests.</p>
          ) : (
            <CoachRequestActions requests={pending} />
          )}
        </section>
      </div>
    </main>
  );
}
