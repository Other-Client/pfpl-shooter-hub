"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateDummySessionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/debug/dummy-session-self", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create dummy session");
      }

      // Refresh /dashboard so new session appears
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "0.55rem 1rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.7)",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.95))",
          color: "#e5e7eb",
          fontSize: "0.85rem",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Creating test session..." : "Create dummy test session"}
      </button>
      {error && (
        <span style={{ fontSize: "0.8rem", color: "#fecaca" }}>{error}</span>
      )}
      {!error && (
        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          Quickly add a realistic test session for the currently logged-in
          shooter. For development use only.
        </span>
      )}
    </div>
  );
}
