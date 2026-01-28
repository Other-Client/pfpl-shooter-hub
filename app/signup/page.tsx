"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dominantEye, setDominantEye] = useState<"left" | "right" | "">("");

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
          dominantEye: dominantEye || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Signup failed");
        return;
      }

      setSuccess(true);

      // Optional: redirect to login after signup
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #1f2937, #020617 60%)",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "1.5rem",
          padding: "2rem",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,64,175,0.96))",
          border: "1px solid rgba(148, 163, 184, 0.6)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
        }}
      >
        <header style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#a5b4fc",
              marginBottom: "0.4rem",
            }}
          >
            Precihole Sports Foundation
          </p>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
            }}
          >
            Signup to PreciShot
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#e5e7eb" }}>
            Create your account to start using PreciShot
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: "1rem", marginBottom: "0.5rem" }}
        >
          <div style={{ display: "grid", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.85rem" }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Shooter name"
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.85)",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.85rem" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.85)",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.85rem" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.7)",
                backgroundColor: "rgba(15,23,42,0.85)",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: "0.3rem" }}>
            <label style={{ fontSize: "0.85rem" }}>Dominant Eye (optional)</label>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              {["left", "right"].map((eye) => (
                <button
                  type="button"
                  key={eye}
                  onClick={() => setDominantEye(eye as "left" | "right")}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    backgroundColor: dominantEye === eye ? "rgba(15,23,42,0.85)" : "rgba(15,23,42,0.5)",
                    color: "white",
                    fontSize: "0.9rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {eye.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #f97316, #eab308, #22c55e)",
              fontWeight: 600,
              fontSize: "0.95rem",
              color: "#020617",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#fecaca", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "#d1fae5", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            Account created successfully. Redirecting…
          </p>
        )}

        <p
          style={{
            marginTop: "1.25rem",
            fontSize: "0.75rem",
            color: "#9ca3af",
          }}
        >
          Already have an account? <Link href="/login" style={{ color: "#a5b4fc" }}>Login here.</Link>
        </p>
      </div>
    </main>
  );
}
