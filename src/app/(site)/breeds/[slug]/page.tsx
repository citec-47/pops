import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBreedBySlug, getPuppies } from "@/lib/data";
import { PuppyCard } from "@/components/puppy-card";
import { IllustratedPortrait } from "@/components/portrait";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const breed = await getBreedBySlug(slug);
  if (!breed) return { title: "Breed not found" };
  return {
    title: breed.name,
    description: breed.description.slice(0, 155),
  };
}

export default async function BreedDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const breed = await getBreedBySlug(slug);
  if (!breed) notFound();

  const puppies = await getPuppies({ breedSlug: slug });
  const available = puppies.filter((p) => p.status !== "SOLD");

  return (
    <div>
      {/* Header */}
      <section className="border-b border-line bg-bone-deep/50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <nav className="mb-6 text-sm text-muted">
            <Link href="/breeds" className="hover:text-clay">
              ← All breeds
            </Link>
          </nav>
          <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
            <div>
              <p className="eyebrow mb-3">
                {breed.group} Group · {breed.size}
              </p>
              <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
                {breed.name}
              </h1>
              <p className="mt-3 font-display text-xl italic text-clay">
                {breed.temperament}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {breed.description}
              </p>
            </div>
            <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bone shadow-[var(--shadow-soft)] md:w-full">
              <IllustratedPortrait seed={breed.slug} className="h-full w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Puppies of this breed */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {available.length > 0
            ? `${breed.name} puppies with us now`
            : `No ${breed.name} puppies available right now`}
        </h2>

        {available.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {puppies.map((p) => (
              <PuppyCard key={p.id} puppy={p} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-10 text-center">
            <p className="mx-auto max-w-md text-muted">
              Our {breed.name} litters are planned carefully and reserved
              quickly. Join the waitlist and we&rsquo;ll reach out the moment we
              have news.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bone hover:bg-clay-deep"
            >
              Join the {breed.name} waitlist
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
