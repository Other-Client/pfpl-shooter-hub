"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dominantEye, setDominantEye] = useState<"left" | "right" | "">("");
  const [role, setRole] = useState<"shooter" | "coach">("shooter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          dominantEye: dominantEye || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
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
          <h1 className="section-title">Create your account</h1>
          <p className="muted-copy">
            Register for PreciShot and start logging training, grouping, and
            performance trends from your VR range.
          </p>
        </header>

        <form onSubmit={onSubmit} className="form-grid">
          <div className="field">
            <span className="field-label">Account type</span>
            <div className="choice-grid">
              {(["shooter", "coach"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`choice-button${role === r ? " is-active" : ""}`}
                >
                  {r === "shooter" ? "Shooter" : "Coach"}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field-label">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Shooter name"
              className="input"
            />
          </label>

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

          <div className="field">
            <span className="field-label">Dominant eye</span>
            <div className="choice-grid">
              {["left", "right"].map((eye) => (
                <button
                  key={eye}
                  type="button"
                  onClick={() => setDominantEye(eye as "left" | "right")}
                  className={`choice-button${dominantEye === eye ? " is-active" : ""}`}
                >
                  {eye}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-primary button-block"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {error ? <p className="status-message error">{error}</p> : null}
        {success ? (
          <div className="status-message success">
            <strong>Check your inbox.</strong>
            <p style={{ margin: "6px 0 0", fontSize: "13px" }}>
              We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
            </p>
          </div>
        ) : null}

        <p className="auth-footer small-note">
          Already have an account?{" "}
          <Link href="/login" className="text-link">
            Login here.
          </Link>
        </p>
      </div>
    </main>
  );
}
