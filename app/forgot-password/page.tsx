"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send reset link.");
      }

      setStatus({
        tone: "success",
        message:
          data?.message ||
          "If an account exists for that email, a reset link has been sent.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: (error as Error).message || "Unable to send reset link.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="theme-shell theme-shell--centered">
      <div className="auth-card">
        <BrandMark href="/" subtitle="Performance Hub" />

        <header className="auth-header">
          <p className="eyebrow">Precihole Sports Foundation</p>
          <h1 className="section-title">Reset your password</h1>
          <p className="muted-copy">
            Enter your email and we will send a password reset link if the
            account exists.
          </p>
        </header>

        <form onSubmit={onSubmit} className="form-grid">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary button-block"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        {status ? (
          <p className={`status-message ${status.tone}`}>{status.message}</p>
        ) : null}

        <p className="auth-footer small-note">
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
