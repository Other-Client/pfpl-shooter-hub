"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

type Status = "verifying" | "success" | "error";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in this link.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(data?.error || "This verification link is invalid or has expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Unable to resend. Please try again.");
      } else {
        setResendDone(true);
      }
    } catch {
      setMessage("Unable to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="theme-shell theme-shell--centered">
      <div className="auth-card">
        <BrandMark href="/" subtitle="Performance Hub" />

        <header className="auth-header">
          <p className="eyebrow">Precihole Sports Foundation</p>

          {status === "verifying" && (
            <>
              <h1 className="section-title">Verifying your email…</h1>
              <p className="muted-copy">Hold on while we confirm your address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="section-title">Email verified</h1>
              <p className="muted-copy">
                Your account is now active. You can sign in and start using PreciShot.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="section-title">Verification failed</h1>
              <p className="muted-copy">{message}</p>
            </>
          )}
        </header>

        {status === "success" && (
          <Link href="/login" className="button button-primary button-block">
            Sign in to PreciShot
          </Link>
        )}

        {status === "error" && (
          <div style={{ marginTop: "20px" }}>
            {resendDone ? (
              <p className="status-message success">
                A new verification link has been sent — check your inbox.
              </p>
            ) : (
              <>
                <p className="small-note" style={{ marginBottom: "12px" }}>
                  Need a new link? Enter your email below.
                </p>
                <form onSubmit={handleResend} className="form-grid">
                  <label className="field">
                    <span className="field-label">Email address</span>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="input"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={resending}
                    className="button button-primary button-block"
                  >
                    {resending ? "Sending…" : "Resend verification email"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <p className="auth-footer small-note" style={{ marginTop: "20px" }}>
          Back to{" "}
          <Link href="/login" className="text-link">
            login
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="experience-message">Loading…</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
