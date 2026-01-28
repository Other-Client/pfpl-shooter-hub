// src/app/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default async function Home() {
  // If already authenticated, go straight to dashboard
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const isAuthed = Boolean(token);
  if (isAuthed) {
    redirect("/dashboard");
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top left, #1f2937, #020617 60%)",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
          backdropFilter: "blur(10px)",
          background: "rgba(15, 23, 42, 0.75)",
        }}
      >
        <BrandMark subtitle="Platform" href="/dashboard" />

        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {!isAuthed && (
            <Link
              href="/login"
              style={{
                padding: "0.55rem 1.25rem",
                borderRadius: "999px",
                border: "1px solid transparent",
                background: "linear-gradient(135deg, #f97316, #eab308, #22c55e)",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "black",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              Login
            </Link>
          )}
          <Link
            href="/dashboard"
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.5)",
              color: "#e5e7eb",
              textDecoration: "none",
              background: "rgba(15,23,42,0.8)",
              fontSize: "0.9rem",
            }}
          >
            Dashboard
          </Link>
        </nav>
      </header>

      {/* Hero + content */}
      <section
        style={{
          flex: 1,
          padding: "3rem 2rem 4rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.6fr)",
          gap: "3rem",
          maxWidth: "1120px",
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        {/* Left: text */}
        <div>
          <p
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "#a5b4fc",
              marginBottom: "0.75rem",
            }}
          >
            VR Performance Platform
          </p>

          <h1
            style={{
              fontSize: "2.7rem",
              lineHeight: 1.1,
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            PreciShot:  
            <span style={{ color: "#f97316" }}> Train, Track</span> &{" "}
            <span style={{ color: "#22c55e" }}>Transform</span> Every Shot.
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "#e5e7eb",
              maxWidth: "34rem",
              marginBottom: "1.5rem",
            }}
          >
            PreciShot is the official performance companion by{" "}
            <strong>Precihole Sports Foundation</strong> – connecting your VR
            shooting range to detailed analytics. Every session, every shot,
            every tiny improvement is captured and visualised in one place.
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 2rem",
              display: "grid",
              gap: "0.6rem",
              fontSize: "0.95rem",
              color: "#d1d5db",
            }}
          >
            <li>• Track live scores, groups, and shot patterns over time.</li>
            <li>• Compare training sessions and export detailed reports.</li>
            <li>• Designed for athletes, coaches, and academies.</li>
          </ul>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                padding: "0.8rem 1.7rem",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, #f97316, #eab308, #22c55e)",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#020617",
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              }}
            >
              Login to PreciShot
            </Link>

            <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Access is restricted to registered shooters & coaches.
            </span>
          </div>
        </div>

        {/* Right: simple “card” explaining steps */}
        <div
          style={{
            borderRadius: "1.5rem",
            padding: "1.75rem",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,64,175,0.95))",
            border: "1px solid rgba(148, 163, 184, 0.5)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            How PreciShot fits your range:
          </h2>

          <ol
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              display: "grid",
              gap: "0.7rem",
              fontSize: "0.9rem",
            }}
          >
            <li>
              <strong>Log in</strong> to your PreciShot account.
            </li>
            <li>
              <strong>Start a session</strong> in the VR shooting range –
              every shot is logged automatically.
            </li>
            <li>
              <strong>Review analytics</strong> – heatmaps, grouping, bias,
              and detailed scores.
            </li>
            <li>
              <strong>Download or share</strong> training reports with your
              shooter or coach.
            </li>
          </ol>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "0.9rem 1rem",
              borderRadius: "1rem",
              background: "rgba(15,23,42,0.85)",
              border: "1px dashed rgba(148, 163, 184, 0.6)",
              fontSize: "0.85rem",
              color: "#e5e7eb",
            }}
          >
            Ready to begin?{" "}
            <Link
              href="/login"
              style={{
                color: "#fbbf24",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Login now
            </Link>{" "}
            to access your PreciShot dashboard.
          </div>
        </div>
      </section>
    </main>
  );
}
