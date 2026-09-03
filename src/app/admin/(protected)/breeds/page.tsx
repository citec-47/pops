import Link from "next/link";
import { prisma } from "@/lib/db";
import { PuppyPhoto } from "@/components/portrait";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { deleteBreedAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminBreedsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const breeds = await prisma.breed.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { puppies: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Breeds</h1>
          <p className="mt-1 text-muted">
            {breeds.length} breed{breeds.length === 1 ? "" : "s"}. These power the
            filters and breed pages across your site.
          </p>
        </div>
        <Link
          href="/admin/breeds/new"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-clay-deep"
        >
          + Add a breed
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-clay/30 bg-clay-soft/50 px-4 py-3 text-sm text-clay-deep">
          {error}
        </p>
      )}

      {breeds.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-12 text-center">
          <p className="font-display text-xl text-ink">No breeds yet.</p>
          <p className="mt-2 text-muted">
            Add the breeds you raise so you can assign puppies to them.
          </p>
          <Link
            href="/admin/breeds/new"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-clay-deep"
          >
            + Add a breed
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper">
          <ul className="divide-y divide-line">
            {breeds.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bone-deep">
                  <PuppyPhoto src={b.heroImage} alt={`${b.name} dog`} seed={b.slug} sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold text-ink">
                    {b.name}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {b.group} · {b.size} · <span className="italic">{b.temperament}</span>
                  </p>
                </div>
                <div className="hidden shrink-0 text-sm text-muted sm:block">
                  {b._count.puppies} puppy{b._count.puppies === 1 ? "" : " listings"}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/breeds/${b.slug}`}
                    target="_blank"
                    className="rounded-lg px-2 py-1.5 text-sm text-muted hover:text-clay"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/breeds/${b.id}/edit`}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
                  >
                    Edit
                  </Link>
                  <form action={deleteBreedAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmSubmit
                      message={
                        b._count.puppies > 0
                          ? `${b.name} has ${b._count.puppies} puppy listing(s). You'll be asked to remove them first. Continue?`
                          : `Delete the ${b.name} breed? This can't be undone.`
                      }
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
