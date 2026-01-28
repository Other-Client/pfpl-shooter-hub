export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AccountSettingsForm from "@/components/AccountSettingsForm";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";
import { BrandMark } from "@/components/BrandMark";
import { BackLink } from "@/components/BackLink";

export default async function AccountSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  if (!token || !process.env.JWT_SECRET) {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  let shooterId: string | null = null;
  let shooterName: string | null = null;
  let shooterEmail: string | null = null;
  let shooterPhone: string | null = null;
  let shooterOrg: string | null = null;
  let shooterRole: string | null = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    shooterId = decoded?.userId ?? decoded?.sub ?? decoded?.id ?? null;
    shooterName = decoded?.name ?? null;
    shooterEmail = decoded?.email ?? null;
    shooterRole = decoded?.role ?? null;
  } catch {
    redirect("/login?callbackUrl=/dashboard/account");
  }

  await connectDB();
  if (shooterId) {
    const shooter = await Shooter.findById(shooterId).lean();
    if (shooter) {
      shooterName = shooter.name || shooterName;
      shooterEmail = shooter.email || shooterEmail;
      shooterPhone = shooter.phone || null;
      shooterOrg = shooter.organization || null;
      shooterRole = shooter.role || shooterRole;
    }
  }

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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <BackLink href="/dashboard" />
          <BrandMark showSubtitle={false} href="/dashboard" />
          <div style={{ marginLeft: "auto", minWidth: "220px" }}>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0, textAlign: "right" }}>
              Account Settings
            </p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, textAlign: "right" }}>Edit your profile</h1>
          </div>
        </div>

        <AccountSettingsForm
          initialName={shooterName ?? undefined}
          initialEmail={shooterEmail ?? undefined}
          initialPhone={shooterPhone ?? undefined}
          initialOrganization={shooterOrg ?? undefined}
          initialRole={shooterRole ?? undefined}
        />
      </div>
    </main>
  );
}
