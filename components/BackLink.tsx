"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Back" }: Props) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        color: "#9ca3af",
        textDecoration: "none",
        fontSize: "0.95rem",
        fontWeight: 500,
      }}
    >
      <ArrowLeft size={16} />
      <span
        style={{
          borderBottom: "1px solid rgba(156,163,175,0.6)",
          paddingBottom: "0.05rem",
        }}
      >
        {label}
      </span>
    </Link>
  );
}
