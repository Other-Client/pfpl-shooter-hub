"use client";

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          /* ignore network errors */
        }
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }}
      className={className ?? "button button-secondary"}
      title="Sign out"
    >
      Sign out
    </button>
  );
}
