"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Back" }: Props) {
  return (
    <Link href={href} className="back-link">
      <ArrowLeft size={16} />
      <span>{label}</span>
    </Link>
  );
}
