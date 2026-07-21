import Link from "next/link";
import type { Metadata } from "next";
import { getBreeds } from "@/lib/data";
import { IllustratedPortrait } from "@/components/portrait";

export const metadata: Metadata = {
  title: "Our Breeds",
  description:
    "The small circle of breeds we raise at Willowbrook — Golden Retrievers, Cavaliers, French Bulldogs, Bernese Mountain Dogs, Australian Shepherds, and Goldendoodles.",
};

export const dynamic = "force-dynamic";

export default async function BreedsPage() {
  const breeds = await getBreeds();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow mb-3">What we raise</p>
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          Our breeds
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          We deliberately keep our circle small. Knowing a handful of breeds
          intimately means we can guide you honestly to the temperament,
          energy, and coat that will fit your life for the next decade and more.
        </p>
      </header>

      <div className="mt-12 space-y-6">
        {breeds.map((b, i) => (
          <Link
            key={b.id}
            href={`/breeds/${b.slug}`}
            className="group grid gap-6 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-clay/40 sm:grid-cols-[220px_1fr] sm:p-5"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-bone-deep sm:aspect-auto">
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                <IllustratedPortrait seed={b.slug} className="h-full w-full" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-semibold text-ink group-hover:text-clay">
                  {b.name}
                </span>
                <span className="rounded-full bg-bone-deep px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                  {b.group} · {b.size}
                </span>
              </div>
              <p className="mt-1 text-sm italic text-clay">{b.temperament}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                {b.description}
              </p>
              <span className="mt-4 text-sm font-semibold text-ink-soft">
                {b._count.puppies > 0
                  ? `${b._count.puppies} available now →`
                  : "Join the waitlist →"}
              </span>
            </div>
            <span className="sr-only">{i}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
