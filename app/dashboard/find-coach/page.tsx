"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BackLink } from "@/components/BackLink";

interface Coach {
  _id: string;
  name: string;
  organization: string | null;
}

export default function FindCoachPage() {
  const [query, setQuery] = useState("");
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [currentCoach, setCurrentCoach] = useState<Coach | null | undefined>(undefined);

  // On mount, check if shooter already has a coach
  useEffect(() => {
    fetch("/api/me/coach")
      .then((r) => r.json())
      .then((data) => setCurrentCoach(data.coach ?? null))
      .catch(() => setCurrentCoach(null));
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/coaches?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setCoaches(Array.isArray(data) ? data : []);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  const apply = async (coachId: string) => {
    setApplying(coachId);
    setError(null);
    try {
      const res = await fetch("/api/coach-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }
      setApplied((prev) => new Set([...prev, coachId]));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  if (currentCoach === undefined) {
    return (
      <main className="theme-shell theme-shell--centered">
        <p className="muted-copy">Loading…</p>
      </main>
    );
  }

  return (
    <main className="theme-shell">
      <div className="page-container">
        <div className="nav-row">
          <BackLink href="/dashboard" />
          <BrandMark subtitle="Find a coach" href="/dashboard" />
        </div>

        <section className="page-heading">
          <p className="eyebrow">Coaching</p>
          <h1 className="page-title">Find a coach</h1>
          <p className="muted-copy">
            Search for a coach by name or organisation and request to join their roster.
          </p>
        </section>

        {currentCoach ? (
          <section className="panel section-stack">
            <p className="eyebrow">Your current coach</p>
            <p className="section-title">{currentCoach.name}</p>
            {currentCoach.organization && (
              <p className="muted-copy">{currentCoach.organization}</p>
            )}
            <p className="muted-copy" style={{ marginTop: "8px" }}>
              You already have a coach. To change, contact your current coach to be removed first.
            </p>
          </section>
        ) : (
          <section className="panel section-stack">
            <label className="field">
              <span className="field-label">Search coaches</span>
              <input
                type="text"
                className="input"
                placeholder="Coach name or organisation…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </label>

            {error && <p className="status-message error">{error}</p>}

            {loading ? (
              <p className="muted-copy">Searching…</p>
            ) : coaches.length === 0 && query.length > 0 ? (
              <p className="empty-state">No coaches found for &ldquo;{query}&rdquo;.</p>
            ) : (
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Organisation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coaches.map((coach) => (
                      <tr key={coach._id}>
                        <td>{coach.name}</td>
                        <td>{coach.organization ?? "-"}</td>
                        <td>
                          {applied.has(coach._id) ? (
                            <span className="status-message success" style={{ fontSize: "13px" }}>
                              Request sent
                            </span>
                          ) : (
                            <button
                              className="button button-secondary button-small"
                              disabled={applying === coach._id}
                              onClick={() => apply(coach._id)}
                            >
                              {applying === coach._id ? "Sending…" : "Request to join"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <div style={{ marginTop: "16px" }}>
          <Link href="/dashboard" className="text-link">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
