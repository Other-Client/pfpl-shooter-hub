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

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-stack">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="button button-secondary button-small"
      >
        {loading ? "Creating test session..." : "Create dummy test session"}
      </button>
      {error ? (
        <p className="status-message error">{error}</p>
      ) : (
        <p className="small-note">
          Quickly add a realistic test session for the current shooter. For
          development use only.
        </p>
      )}
    </div>
  );
}
