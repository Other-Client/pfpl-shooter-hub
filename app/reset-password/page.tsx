"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setStatus({
        tone: "error",
        message: "This reset link is missing or invalid.",
      });
      return;
    }

    if (password.length < 8) {
      setStatus({
        tone: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        tone: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Unable to reset password.");
      }

      setStatus({
        tone: "success",
        message:
          data?.message || "Password reset successfully. Redirecting to login.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setStatus({
        tone: "error",
        message: (error as Error).message || "Unable to reset password.",
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
          <h1 className="section-title">Set a new password</h1>
          <p className="muted-copy">
            Choose a new password for your PreciShot account.
          </p>
        </header>

        <form onSubmit={onSubmit} className="form-grid">
          <label className="field">
            <span className="field-label">New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="Minimum 8 characters"
              className="input"
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              placeholder="Repeat password"
              className="input"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary button-block"
          >
            {loading ? "Updating password..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="experience-message">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
