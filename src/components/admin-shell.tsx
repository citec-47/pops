"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  icon: React.ReactNode;
};

const iconProps = {
  width: 19,
  height: 19,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    exact: true,
    icon: (
      <svg {...iconProps}>
        <path d="M3 10.2 12 3l9 7.2" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),
  },
  {
    href: "/admin/puppies",
    label: "Puppies",
    icon: (
      <svg {...iconProps}>
        <circle cx="7" cy="9" r="1.6" />
        <circle cx="12" cy="7.2" r="1.6" />
        <circle cx="17" cy="9" r="1.6" />
        <path d="M12 11.5c-2.6 0-4.7 1.9-4.7 4 0 1.6 1.4 2.4 4.7 2.4s4.7-.8 4.7-2.4c0-2.1-2.1-4-4.7-4Z" />
      </svg>
    ),
  },
  {
    href: "/admin/prices",
    label: "Prices",
    icon: (
      <svg {...iconProps}>
        <path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.4V4.4a1.4 1.4 0 0 1 1.4-1.4h8.4a2 2 0 0 1 1.4.6l6.6 6.6a2 2 0 0 1 0 2.8Z" />
        <circle cx="7.6" cy="7.6" r="1.1" />
      </svg>
    ),
  },
  {
    href: "/admin/breeds",
    label: "Breeds",
    icon: (
      <svg {...iconProps}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h10" />
      </svg>
    ),
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </svg>
    ),
  },
];

export function AdminShell({
  email,
  logout,
  children,
}: {
  email: string;
  logout: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white/10 text-bone"
                : "text-bone/55 hover:bg-white/5 hover:text-bone"
            }`}
          >
            <span
              className={`transition-colors ${
                active ? "text-clay" : "text-bone/45 group-hover:text-bone/80"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-6">
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-clay">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="7.5" cy="10" r="1.7" fill="#faf6f0" />
              <circle cx="12" cy="8" r="1.7" fill="#faf6f0" />
              <circle cx="16.5" cy="10" r="1.7" fill="#faf6f0" />
              <path
                d="M12 12.5c-2.9 0-5.2 2.1-5.2 4.5 0 1.8 1.6 2.7 5.2 2.7s5.2-.9 5.2-2.7c0-2.4-2.3-4.5-5.2-4.5Z"
                fill="#faf6f0"
              />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold text-bone">
              Willowbrook
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.24em] text-bone/40">
              Breeder Studio
            </span>
          </span>
        </Link>
      </div>

      <div className="mx-5 mb-4 border-t border-white/10" />

      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-bone/35">
          Manage
        </p>
        {nav}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-bone/55 transition-colors hover:bg-white/5 hover:text-bone"
        >
          <svg {...iconProps}>
            <path d="M14 4h6v6" />
            <path d="M20 4 10 14" />
            <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
          View live site
        </Link>

        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-bone">
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-bone/60">
            {email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="rounded-md p-1.5 text-bone/50 transition-colors hover:bg-white/10 hover:text-bone"
            >
              <svg {...iconProps}>
                <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
                <path d="M10 17 5 12l5-5" />
                <path d="M5 12h12" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bone lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-[#221d19] lg:block">
        {sidebarInner}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-[#221d19] px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-semibold text-bone">
          Willowbrook
        </span>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-bone"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#221d19] shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 rounded-md p-1.5 text-bone/60 hover:text-bone"
              aria-label="Close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
