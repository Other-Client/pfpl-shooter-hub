"use client";

import Link from "next/link";

interface Props {
  href?: string;
  subtitle?: string;
  showSubtitle?: boolean;
}

export function BrandMark({ href = "/dashboard", subtitle, showSubtitle = true }: Props) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <img
        src="/logo.png"
        alt="PreciShot logo"
        style={{
          height: "42px",
          width: "auto",
          borderRadius: "10px",
          display: "block",
        }}
      />
      <div style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          PreciShot
        </div>
        {showSubtitle && subtitle && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#cbd5f5",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  ) : (
    content
  );
}
