import Link from "next/link";
import { getFeaturedPuppies, getBreeds, countAvailable } from "@/lib/data";
import { PuppyCard } from "@/components/puppy-card";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { PuppyPhoto } from "@/components/portrait";

// The home page shows live inventory, so render on demand (never prerender
// at build time, the database may be asleep during the build).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, breeds, available] = await Promise.all([
    getFeaturedPuppies(3),
    getBreeds(),
    countAvailable(),
  ]);

  const [heroA, heroB] = featured;

  // The catalog runs to dozens of breeds, so the home page shows a sample:
  // the ones with puppies on the ground first, then the rest alphabetically.
  const breedPreview = [...breeds]
    .sort(
      (a, b) =>
        b._count.puppies - a._count.puppies || a.name.localeCompare(b.name),
    )
    .slice(0, 9);

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/*  Hero                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div className="animate-rise">
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-clay" />
              Willow Hollow, Vermont · Est. 2009
            </p>
            <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] text-ink sm:text-6xl">
              Little companions,
              <br />
              <span className="italic text-clay">raised like family.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              We&rsquo;re a small home nursery raising a handful of litters each
              year, never more than we can hold, name, and love properly.
              Every puppy leaves us healthy, socialized, and ready for you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/puppies">
                Meet the puppies
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ButtonLink>
              <ButtonLink href="/breeds" variant="outline">
                Explore our breeds
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                { n: `${available}`, l: "Puppies available now" },
                { n: "15 yrs", l: "Raising healthy litters" },
                { n: "2-yr", l: "Written health guarantee" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-3xl font-semibold text-ink">
                    {s.n}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero photo collage: real puppies currently at the nursery */}
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
              <Link
                href={heroA ? `/puppies/${heroA.id}` : "/puppies"}
                className="group absolute -right-3 top-6 block h-[88%] w-[70%] rotate-3 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bone-deep shadow-[var(--shadow-soft)]"
              >
                <PuppyPhoto
                  src={heroA?.images.find((m) => m.type !== "video")?.url}
                  alt={heroA ? `${heroA.name}, a ${heroA.breed.name}` : "A Willowbrook puppy"}
                  seed={heroA ? heroA.id + heroA.name : "hero-a"}
                  priority
                  sizes="(max-width: 1024px) 60vw, 22vw"
                />
                {heroA && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-bone backdrop-blur-sm">
                    {heroA.name}
                  </span>
                )}
              </Link>
              <Link
                href={heroB ? `/puppies/${heroB.id}` : "/puppies"}
                className="group absolute bottom-0 left-0 block h-[70%] w-[62%] -rotate-3 overflow-hidden rounded-[var(--radius-xl)] border-4 border-bone bg-bone-deep shadow-[var(--shadow-soft)]"
              >
                <PuppyPhoto
                  src={heroB?.images.find((m) => m.type !== "video")?.url}
                  alt={heroB ? `${heroB.name}, a ${heroB.breed.name}` : "A Willowbrook puppy"}
                  seed={heroB ? heroB.id + heroB.name : "hero-b"}
                  sizes="(max-width: 1024px) 55vw, 20vw"
                />
              </Link>
              <div className="absolute -left-4 top-2 rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold text-ink shadow-[var(--shadow-soft)]">
                Raised underfoot in Vermont
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-40 top-10 -z-10 h-96 w-96 rounded-full bg-clay-soft/50 blur-3xl" />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Featured                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Ready for their people"
            title="This season's little ones"
            intro="A few of the pups currently looking for their forever homes. New litters are announced here first."
          />
          <Link
            href="/puppies"
            className="hidden shrink-0 text-sm font-semibold text-clay hover:underline sm:inline"
          >
            View all puppies →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PuppyCard key={p.id} puppy={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-10 text-center text-muted">
            No featured puppies right now. Please check the full nursery.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Philosophy                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-line bg-bone-deep/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="How we raise them"
              title={<>Not a kennel. <span className="italic text-clay">A home.</span></>}
              intro="Our puppies are born in the living room and spend their first weeks meeting the vacuum, the mail carrier, the grandchildren, and the occasional barn cat. That early confidence is the difference you feel for a lifetime."
            />
            <div className="mt-8">
              <ButtonLink href="/about" variant="ghost">
                Read our story
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "Vet-checked & vaccinated", d: "Every pup leaves with age-appropriate shots, deworming, and a clean bill of health." },
              { t: "Health-tested parents", d: "We screen our sires and dams so you start with the best odds of a long, healthy life." },
              { t: "Early socialization", d: "Sounds, surfaces, handling, and gentle crate training from week three." },
              { t: "Lifetime support", d: "We answer the 2 a.m. questions long after your puppy comes home." },
            ].map((f) => (
              <li
                key={f.t}
                className="rounded-[var(--radius-xl)] border border-line bg-paper p-5 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-display text-lg font-semibold text-ink">
                  {f.t}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Breeds                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Find your fit"
          title="The breeds we know by heart"
          intro={`${breeds.length} breeds across every group, from toy companions to working giants, each raised by us or by a partner family we have known for years.`}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {breedPreview.map((b) => (
            <Link
              key={b.id}
              href={`/breeds/${b.slug}`}
              className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-line bg-paper p-4 transition-colors hover:border-clay/40"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bone-deep">
                <PuppyPhoto src={b.heroImage} alt={`${b.name} dog`} seed={b.slug} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-clay">
                  {b.name}
                </h3>
                <p className="truncate text-xs text-muted">
                  {b.group} · {b.size}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-muted">
                {b._count.puppies > 0 ? `${b._count.puppies} available` : "Waitlist"}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/breeds"
            className="text-sm font-semibold text-clay hover:underline"
          >
            See all {breeds.length} breeds &rarr;
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  CTA band                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-ink px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-clay/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-sage/20 blur-3xl" />
          <p className="eyebrow mb-4 text-clay-soft">Thinking it over?</p>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-bone sm:text-4xl">
            Come meet a puppy before you decide.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-bone/70">
            Visits are by appointment so each family gets our full attention.
            Tell us a little about your home and we&rsquo;ll help you find the
            right match, no pressure, ever.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-bone px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-clay-soft"
            >
              Arrange a visit
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
