"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface AccountMenuProps {
  role?: "shooter" | "coach" | "admin";
  pendingRequests?: number;
}

export function AccountMenu({ role, pendingRequests }: AccountMenuProps) {
  return (
    <details className="account-menu">
      <summary className="account-menu__summary">
        Account
        {pendingRequests && pendingRequests > 0 ? (
          <span className="account-menu__badge">{pendingRequests}</span>
        ) : null}
        <span className="account-menu__chevron">v</span>
      </summary>
      <div className="account-menu__panel">
        {role === "coach" && (
          <>
            <Link
              href="/dashboard/coach/requests"
              className="button button-secondary button-block account-menu__action"
            >
              Join requests
              {pendingRequests && pendingRequests > 0 ? ` (${pendingRequests})` : ""}
            </Link>
          </>
        )}
        {role === "shooter" && (
          <Link
            href="/dashboard/find-coach"
            className="button button-secondary button-block account-menu__action"
          >
            Find a coach
          </Link>
        )}
        <Link
          href="/dashboard/account"
          className="button button-secondary button-block account-menu__action"
        >
          Account settings
        </Link>
        <LogoutButton className="button button-secondary button-block account-menu__action" />
      </div>
    </details>
  );
}
