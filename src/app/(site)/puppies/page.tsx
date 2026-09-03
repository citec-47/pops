import Link from "next/link";
import type { Metadata } from "next";
import { getPuppies, getBreeds } from "@/lib/data";
import { PuppyCard } from "@/components/puppy-card";

export const metadata: Metadata = {
  title: "Available Puppies",
  description:
    "Browse the puppies currently available at Willowbrook. Filter by breed and reserve your companion.",
};

export const dynamic = "force-dynamic";

export default async function PuppiesPage({
  searchParams,
}: {
  searchParams: Promise<{ breed?: string; status?: string }>;
}) {
  const { breed, status } = await searchParams;
  const [puppies, breeds] = await Promise.all([
    getPuppies({ breedSlug: breed, status }),
    getBreeds(),
  ]);

  const GROUP_ORDER = [
    "Sporting",
    "Hound",
    "Working",
    "Terrier",
    "Toy",
    "Non-Sporting",
    "Herding",
    "Hybrid",
  ];
  const breedGroups = [
    ...GROUP_ORDER.map((group) => ({
      group,
      breeds: breeds.filter((b) => b.group === group),
    })),
    { group: "Other", breeds: breeds.filter((b) => !GROUP_ORDER.includes(b.group)) },
  ].filter((g) => g.breeds.length > 0);

  const statusFilters = [
    { key: undefined, label: "All" },
    { key: "AVAILABLE", label: "Available" },
    { key: "RESERVED", label: "Reserved" },
    { key: "SOLD", label: "Welcomed Home" },
  ];

  function href(next: { breed?: string; status?: string }) {
    const params = new URLSearchParams();
    const b = "breed" in next ? next.breed : breed;
    const s = "status" in next ? next.status : status;
    if (b) params.set("breed", b);
    if (s) params.set("status", s);
    const qs = params.toString();
    return qs ? `/puppies?${qs}` : "/puppies";
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow mb-3">The Nursery</p>
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          Available puppies
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Each little one below was born and raised in our home. Found a face
          you love? Send an inquiry and we&rsquo;ll be in touch within a day.
        </p>
      </header>

      {/* Filters */}
      <div className="mt-10 space-y-4">
        {/* The catalog spans dozens of breeds, so this one is a select
            rather than a wall of pills. It works without JavaScript. */}
        <form method="get" action="/puppies" className="flex flex-wrap items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <label
            htmlFor="breed"
            className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Breed
          </label>
          <select
            id="breed"
            name="breed"
            defaultValue={breed ?? ""}
            className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft focus:border-clay focus:outline-none"
          >
            <option value="">All breeds</option>
            {breedGroups.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.breeds.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                    {b._count.puppies > 0 ? ` (${b._count.puppies})` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-sm font-medium text-bone hover:bg-clay-deep"
          >
            Show
          </button>
          {breed && (
            <Link
              href={href({ breed: undefined })}
              className="text-sm font-medium text-muted hover:text-clay"
            >
              Clear
            </Link>
          )}
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">
            Status
          </span>
          {statusFilters.map((s) => (
            <FilterPill
              key={s.label}
              href={href({ status: s.key })}
              active={status === s.key || (!status && !s.key)}
            >
              {s.label}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Results */}
      {puppies.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-muted">
            {puppies.length} {puppies.length === 1 ? "puppy" : "puppies"}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {puppies.map((p) => (
              <PuppyCard key={p.id} puppy={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-12 text-center">
          <p className="font-display text-2xl text-ink">
            No puppies match just yet.
          </p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Litters come and go quickly. Clear your filters, or{" "}
            <Link href="/contact" className="font-semibold text-clay hover:underline">
              join the waitlist
            </Link>{" "}
            to hear the moment a new litter arrives.
          </p>
          <Link
            href="/puppies"
            className="mt-6 inline-block text-sm font-semibold text-clay hover:underline"
          >
            ← Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-bone"
          : "border-line bg-paper text-ink-soft hover:border-clay/50 hover:text-clay"
      }`}
    >
      {children}
    </Link>
  );
}
