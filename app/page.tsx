export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const isAuthed = Boolean(token);

  if (isAuthed) {
    redirect("/dashboard");
  }

  return (
    <main className="theme-shell">
      <div className="page-container">
        <header className="site-header">
          <BrandMark href="/" subtitle="Performance Hub" />

          <nav className="nav-row">
            <Link href="/login" className="button button-primary button-small">
              Login
            </Link>
            <Link href="/dashboard" className="button button-secondary button-small">
              Dashboard
            </Link>
          </nav>
        </header>

        <section className="landing-grid">
          <div className="landing-copy">
            <div className="page-heading">
              <p className="eyebrow">VR performance platform</p>
              <h1 className="display-title">Train. Track. Tighten every shot.</h1>
            </div>

            <p className="muted-copy">
              PreciShot is the analytics layer for the Precihole Sports
              Foundation range. It connects every VR training session to clear
              scoring, grouping, and shot-by-shot review in one place.
            </p>

            <ul className="feature-list">
              <li>Track live scores, group size, offsets, and ring accuracy.</li>
              <li>Review each session with heatmaps and downloadable reports.</li>
              <li>Built for shooters, coaches, academies, and performance staff.</li>
            </ul>

            <div className="hero-actions">
              <Link href="/login" className="button button-primary">
                Login to PreciShot
              </Link>
              <span className="small-note">
                Access is limited to registered shooters and coaches.
              </span>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <div className="metric-card__label">Shot detail</div>
                <div className="metric-card__value">Every hit logged</div>
              </div>
              <div className="metric-card">
                <div className="metric-card__label">Coach ready</div>
                <div className="metric-card__value">Session exports</div>
              </div>
              <div className="metric-card">
                <div className="metric-card__label">Range linked</div>
                <div className="metric-card__value">VR to dashboard</div>
              </div>
            </div>
          </div>

          <div className="panel hero-panel">
            <div>
              <p className="eyebrow">Range workflow</p>
              <h2 className="section-title">How PreciShot fits your range</h2>
            </div>

            <ol className="step-list">
              <li>Log in to your PreciShot account from the web app.</li>
              <li>Launch a VR training session and let each shot sync automatically.</li>
              <li>Review grouping, scoring, and shot density immediately after the run.</li>
              <li>Download reports for the shooter, coach, or academy archive.</li>
            </ol>

            <div className="panel-note">
              Ready to begin?{" "}
              <Link href="/login" className="text-link">
                Enter the platform
              </Link>{" "}
              and open your dashboard.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
