"use client";
import React from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
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
      }}
      title="Sign out"
    >
      🔒 Sign out
    </button>
  );
}
