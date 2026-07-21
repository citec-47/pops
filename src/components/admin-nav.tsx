"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/puppies", label: "Puppies" },
  { href: "/admin/breeds", label: "Breeds" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-ink text-bone"
                : "text-ink-soft hover:bg-bone-deep"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
