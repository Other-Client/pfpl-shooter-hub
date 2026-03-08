"use client";

import Link from "next/link";
import LogoutButton from "./LogoutButton";

export function AccountMenu() {
  return (
    <details className="account-menu">
      <summary className="account-menu__summary">
        Account
        <span className="account-menu__chevron">v</span>
      </summary>
      <div className="account-menu__panel">
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
