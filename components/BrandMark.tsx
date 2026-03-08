"use client";

import Link from "next/link";

interface Props {
  href?: string;
  subtitle?: string;
  showSubtitle?: boolean;
}

export function BrandMark({
  href = "/dashboard",
  subtitle,
  showSubtitle = true,
}: Props) {
  const content = (
    <div className="brand-mark">
      <img src="/logo.png" alt="PreciShot logo" className="brand-mark__logo" />
      <div className="brand-mark__lockup">
        <div className="brand-mark__title">PreciShot</div>
        {showSubtitle && subtitle ? (
          <div className="brand-mark__subtitle">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
