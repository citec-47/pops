import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPuppyById } from "@/lib/data";
import { PuppyGallery } from "@/components/puppy-gallery";
import { InquiryForm } from "@/components/inquiry-form";
import { StatusBadge } from "@/components/ui";
import { formatPrice, formatAge, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const puppy = await getPuppyById(id);
  if (!puppy) return { title: "Puppy not found" };
  return {
    title: `${puppy.name} · ${puppy.breed.name}`,
    description: puppy.description.slice(0, 155),
  };
}

export default async function PuppyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const puppy = await getPuppyById(id);
  if (!puppy) notFound();

  const available = puppy.status === "AVAILABLE";
  const facts = [
    { label: "Breed", value: puppy.breed.name },
    { label: "Sex", value: puppy.sex },
    { label: "Coat", value: puppy.color },
    { label: "Age", value: formatAge(puppy.birthDate) },
    { label: "Born", value: formatDate(puppy.birthDate) },
    { label: "Size", value: puppy.breed.size },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <nav className="mb-8 text-sm text-muted">
        <Link href="/puppies" className="hover:text-clay">
          ← All puppies
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PuppyGallery
            images={puppy.images}
            seed={puppy.id + puppy.name}
            name={puppy.name}
          />
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-3">
            <StatusBadge status={puppy.status} />
            <Link
              href={`/breeds/${puppy.breed.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-clay hover:underline"
            >
              {puppy.breed.name}
            </Link>
          </div>

          <h1 className="mt-3 font-display text-5xl font-semibold text-ink">
            {puppy.name}
          </h1>
          <p className="mt-3 font-display text-2xl text-clay-deep">
            {formatPrice(puppy.priceCents)}
          </p>

          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            {puppy.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[var(--radius-xl)] border border-line bg-paper p-6 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs uppercase tracking-wider text-muted">
                  {f.label}
                </dt>
                <dd className="mt-0.5 font-medium text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>

          {puppy.vetNotes && (
            <div className="mt-6 rounded-[var(--radius-xl)] border border-sage/30 bg-sage/10 p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-sage-deep">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 12v-2a2 2 0 00-2-2h-3V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v3H4a2 2 0 00-2 2v2m18 0v6a2 2 0 01-2 2h-3m5-8h-5m-8 8H4a2 2 0 01-2-2v-6m6 8v-5m0-3H2m6 0V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Health &amp; care
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {puppy.vetNotes}
              </p>
            </div>
          )}

          {/* Inquiry */}
          <div id="inquire" className="mt-10 border-t border-line pt-8">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {available
                ? `Interested in ${puppy.name}?`
                : `Ask about ${puppy.name}`}
            </h2>
            <p className="mt-2 mb-6 text-muted">
              {available
                ? "Send us a note and we'll arrange a meet-and-greet or a video call. A deposit reserves your pup."
                : "This little one may be spoken for, but tell us what you're looking for, and we often have similar pups or upcoming litters."}
            </p>
            <InquiryForm puppyId={puppy.id} puppyName={puppy.name} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
