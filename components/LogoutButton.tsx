"use client";
import React from "react";

type Props = {
  styleOverride?: React.CSSProperties;
};

export default function LogoutButton({ styleOverride }: Props) {
  return (
    <button
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          /* ignore network errors */
        }
        if (typeof window !== "undefined") window.location.href = "/login";
      }}
      style={{
        padding: "0.9rem 1.5rem",
        background: "linear-gradient(135deg, #ef4444, #b91c1c)",
        color: "white",
        border: "none",
        borderRadius: "0.6rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        cursor: "pointer",
        marginLeft: "0.75rem",
        ...(styleOverride || {}),
      }}
      title="Sign out"
    >
      🔒 Sign out
    </button>
  );
}
