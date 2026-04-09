"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "./BrandMark";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      router.push(callbackUrl || "/dashboard");
    } catch (err) {
      setLoading(false);
      setError((err as Error).message || "Login failed");
    }
  }

  return (
    <main className="theme-shell theme-shell--centered">
      <div className="auth-card">
        <BrandMark href="/" subtitle="Performance Hub" />

        <header className="auth-header">
          <p className="eyebrow">Precihole Sports Foundation</p>
          <h1 className="section-title">Login to PreciShot</h1>
          <p className="muted-copy">
            Use your email and password to enter the analytics hub and review
            every session.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="........"
              className="input"
            />
          </label>

          <div className="auth-links">
            <Link href="/forgot-password" className="text-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary button-block"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error ? <p className="status-message error">{error}</p> : null}

        <p className="auth-footer small-note">
          First time?{" "}
          <Link href="/signup" className="text-link">
            Signup here.
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="experience-message">Loading...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
