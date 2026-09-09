import Link from "next/link";
import { prisma } from "@/lib/db";
import { PuppyPhoto } from "@/components/portrait";
import { StatusBadge } from "@/components/ui";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { formatPrice, formatAge } from "@/lib/format";
import { deletePuppyAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminPuppiesPage() {
  const puppies = await prisma.puppy.findMany({
    include: { breed: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Puppies</h1>
          <p className="mt-1 text-muted">
            {puppies.length} in the nursery. Add, edit, or retire listings here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/prices"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-clay hover:text-clay"
          >
            Change prices
          </Link>
          <Link
            href="/admin/puppies/new"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-clay-deep"
          >
            + Add a puppy
          </Link>
        </div>
      </div>

      {puppies.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-12 text-center">
          <p className="font-display text-xl text-ink">No puppies yet.</p>
          <p className="mt-2 text-muted">Add your first litter to get started.</p>
          <Link
            href="/admin/puppies/new"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-clay-deep"
          >
            + Add a puppy
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper">
          <ul className="divide-y divide-line">
            {puppies.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bone-deep">
                  <PuppyPhoto
                    src={p.images.find((m) => m.type !== "video")?.url}
                    alt={p.name}
                    seed={p.id + p.name}
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold text-ink">
                      {p.name}
                    </p>
                    {p.featured && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold text-[#8a6a1f]">
                        FEATURED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {p.breed.name} · {p.sex} · {formatAge(p.birthDate)}
                  </p>
                </div>
                <div className="hidden w-28 shrink-0 text-sm font-medium text-ink sm:block">
                  {formatPrice(p.priceCents)}
                </div>
                <div className="shrink-0">
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/puppies/${p.id}`}
                    target="_blank"
                    className="rounded-lg px-2 py-1.5 text-sm text-muted hover:text-clay"
                    title="View on site"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/puppies/${p.id}/edit`}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
                  >
                    Edit
                  </Link>
                  <form action={deletePuppyAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit
                      message={`Remove ${p.name}? This can't be undone.`}
                      className="rounded-lg px-2 py-1.5 text-sm text-muted hover:text-clay-deep"
                    >
                      Delete
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
