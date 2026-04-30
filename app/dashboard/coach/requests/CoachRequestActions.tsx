"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Request {
  _id: string;
  createdAt: string | null;
  shooter: {
    _id: string;
    name: string;
    email: string | null;
    organization: string | null;
  };
}

export function CoachRequestActions({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, "approved" | "rejected">>({});
  const [error, setError] = useState<string | null>(null);

  const act = async (requestId: string, action: "approve" | "reject") => {
    setBusy(requestId);
    setError(null);
    try {
      const res = await fetch(`/api/coach-request/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Action failed");
        return;
      }
      const result: "approved" | "rejected" = action === "approve" ? "approved" : "rejected";
      setDone((prev) => ({ ...prev, [requestId]: result }));
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="section-stack">
      {error && <p className="status-message error">{error}</p>}

      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shooter</th>
              <th>Email</th>
              <th>Organisation</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.shooter.name}</td>
                <td>{r.shooter.email ?? "-"}</td>
                <td>{r.shooter.organization ?? "-"}</td>
                <td>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {done[r._id] ? (
                    <span className={`status-message ${done[r._id] === "approved" ? "success" : "error"}`} style={{ fontSize: "13px" }}>
                      {done[r._id] === "approved" ? "Approved" : "Rejected"}
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="button button-primary button-small"
                        disabled={busy === r._id}
                        onClick={() => act(r._id, "approve")}
                      >
                        {busy === r._id ? "…" : "Approve"}
                      </button>
                      <button
                        className="button button-secondary button-small"
                        disabled={busy === r._id}
                        onClick={() => act(r._id, "reject")}
                      >
                        {busy === r._id ? "…" : "Reject"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
