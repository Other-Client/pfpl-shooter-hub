"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialName?: string | null;
  initialEmail?: string | null;
  initialPhone?: string | null;
  initialOrganization?: string | null;
  initialRole?: string | null;
};

export default function AccountSettingsForm({
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  initialOrganization = "",
  initialRole = "",
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [organization, setOrganization] = useState(initialOrganization || "");
  const [role, setRole] = useState(initialRole || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<null | string>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, organization, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Save failed");
      }
      if (data?.shooter) {
        setName(data.shooter.name ?? "");
        setEmail(data.shooter.email ?? "");
        setPhone(data.shooter.phone ?? "");
        setOrganization(data.shooter.organization ?? "");
        setRole(data.shooter.role ?? role);
      }
      setStatus("Saved.");
      router.refresh();
    } catch (err) {
      setStatus((err as Error).message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "1rem",
        maxWidth: "480px",
        background: "rgba(15,23,42,0.85)",
        border: "1px solid rgba(148,163,184,0.5)",
        borderRadius: "1rem",
        padding: "1.25rem",
      }}
    >
      <Field label="Full name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          placeholder="Your name"
        />
      </Field>
      <Field label="Email">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="you@example.com"
          type="email"
        />
      </Field>
      <Field label="Phone">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
          placeholder="+1 555 123 4567"
        />
      </Field>
      <Field label="Organization">
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          style={inputStyle}
          placeholder="Club / Academy"
        />
      </Field>
      <Field label="Role">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
          placeholder="Shooter / Coach / Admin"
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "999px",
          border: "1px solid rgba(148,163,184,0.7)",
          background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
          color: "white",
          fontWeight: 600,
          cursor: saving ? "wait" : "pointer",
          boxShadow: "0 10px 25px rgba(14,165,233,0.28)",
        }}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
      {status && (
        <div style={{ fontSize: "0.85rem", color: "#cbd5f5" }}>{status}</div>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: "0.35rem", color: "#e5e7eb", fontSize: "0.9rem" }}>
      <span style={{ color: "#cbd5f5", fontSize: "0.85rem" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "0.65rem 0.8rem",
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.5)",
  background: "rgba(15,23,42,0.7)",
  color: "white",
  fontSize: "0.95rem",
};
