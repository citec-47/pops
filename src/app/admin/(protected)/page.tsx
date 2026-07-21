import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [available, reserved, sold, newInquiries, recent] = await Promise.all([
    prisma.puppy.count({ where: { status: "AVAILABLE" } }),
    prisma.puppy.count({ where: { status: "RESERVED" } }),
    prisma.puppy.count({ where: { status: "SOLD" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { puppy: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Available", value: available, href: "/admin/puppies", tone: "text-sage-deep" },
    { label: "Reserved", value: reserved, href: "/admin/puppies", tone: "text-gold" },
    { label: "Welcomed home", value: sold, href: "/admin/puppies", tone: "text-ink-soft" },
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries", tone: "text-clay" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Welcome back
          </h1>
          <p className="mt-1 text-muted">Here&rsquo;s what&rsquo;s happening at the nursery.</p>
        </div>
        <Link
          href="/admin/puppies/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-clay-deep"
        >
          + Add a puppy
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-[var(--radius-xl)] border border-line bg-paper p-6 transition-colors hover:border-clay/40"
          >
            <p className={`font-display text-4xl font-semibold ${s.tone}`}>
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-[var(--radius-xl)] border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            Recent inquiries
          </h2>
          <Link href="/admin/inquiries" className="text-sm font-semibold text-clay hover:underline">
            View all →
          </Link>
        </div>
        {recent.length > 0 ? (
          <ul className="divide-y divide-line">
            {recent.map((inq) => (
              <li key={inq.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bone-deep font-display text-lg text-ink">
                  {inq.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {inq.name}
                    {inq.puppy && (
                      <span className="ml-2 text-sm font-normal text-clay">
                        · re: {inq.puppy.name}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{inq.message}</p>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-muted sm:block">
                  {formatDate(inq.createdAt)}
                  {inq.status === "NEW" && (
                    <span className="ml-2 rounded-full bg-clay px-2 py-0.5 text-[0.65rem] font-bold text-bone">
                      NEW
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-muted">
            No inquiries yet. They&rsquo;ll appear here as families reach out.
          </p>
        )}
      </div>
    </div>
  );
}
