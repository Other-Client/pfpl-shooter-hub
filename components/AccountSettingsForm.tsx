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

  const statusTone = status === "Saved." ? "success" : "error";

  return (
    <form onSubmit={handleSubmit} className="panel form-card">
      <Field label="Full name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Your name"
        />
      </Field>
      <Field label="Email">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          type="email"
        />
      </Field>
      <Field label="Phone">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
          placeholder="+1 555 123 4567"
        />
      </Field>
      <Field label="Organization">
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="input"
          placeholder="Club / Academy"
        />
      </Field>
      <Field label="Role">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input"
          placeholder="Shooter / Coach / Admin"
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="button button-primary button-block"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>

      {status ? (
        <p className={`status-message ${statusTone}`}>{status}</p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
