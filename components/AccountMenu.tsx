"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

export function AccountMenu() {
  return (
    <details
      style={{
        position: "relative",
        display: "inline-block",
        border: "1px solid rgba(148,163,184,0.6)",
        borderRadius: "12px",
        background: "rgba(15,23,42,0.8)",
        padding: "0.45rem 0.85rem",
        cursor: "pointer",
      }}
    >
      <summary
        style={{
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "white",
          fontSize: "0.9rem",
        }}
      >
        Account
        <span style={{ fontSize: "0.8rem", color: "#cbd5f5" }}>▼</span>
      </summary>
      <div
        style={{
          position: "absolute",
          right: 0,
          marginTop: "0.5rem",
          minWidth: "190px",
          background: "linear-gradient(160deg, rgba(17,24,39,0.96), rgba(21,32,62,0.96))",
          border: "1px solid rgba(148,163,184,0.4)",
          borderRadius: "0.85rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          padding: "0.5rem",
          display: "grid",
          gap: "0.4rem",
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href="/dashboard/account"
          style={{
            padding: "0.7rem 0.8rem",
            borderRadius: "0.7rem",
            color: "#f8fafc",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            background: "linear-gradient(140deg, #1f2a44, #1c2f57)",
            border: "1px solid rgba(59,130,246,0.35)",
            textAlign: "left",
            boxShadow: "0 4px 18px rgba(59,130,246,0.25)",
          }}
        >
          Account settings
        </Link>
        <LogoutButton
          styleOverride={{
            width: "100%",
            marginLeft: 0,
            padding: "0.7rem 0.8rem",
            borderRadius: "0.7rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            background: "linear-gradient(140deg, #1f2a44, #1c2f57)",
            border: "1px solid rgba(59,130,246,0.35)",
            boxShadow: "0 4px 18px rgba(59,130,246,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        />
      </div>
    </details>
  );
}
