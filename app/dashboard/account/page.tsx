export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import AccountSettingsForm from "@/components/AccountSettingsForm";
import { BackLink } from "@/components/BackLink";
import { BrandMark } from "@/components/BrandMark";
import { connectDB } from "@/lib/db";
import { Shooter } from "@/models/Shooter";

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
    <main className="theme-shell">
      <div className="page-container page-container--narrow">
        <div className="page-header-row">
          <div className="nav-row">
            <BackLink href="/dashboard" />
            <BrandMark showSubtitle={false} href="/dashboard" />
          </div>

          <div className="page-header-meta">
            <p className="eyebrow">Account settings</p>
            <h1 className="page-title">Edit your profile</h1>
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
