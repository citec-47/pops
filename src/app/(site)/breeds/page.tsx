import Link from "next/link";
import type { Metadata } from "next";
import { getBreeds } from "@/lib/data";
import { PuppyPhoto } from "@/components/portrait";

export const metadata: Metadata = {
  title: "Our Breeds",
  description:
    "Every breed we raise at Willowbrook, from toy companions and terriers to sporting dogs, sighthounds, herding breeds, and working giants.",
};

export const dynamic = "force-dynamic";

// The order breeds are presented in, loosely the AKC groups.
const GROUP_ORDER = [
  "Sporting",
  "Hound",
  "Working",
  "Terrier",
  "Toy",
  "Non-Sporting",
  "Herding",
  "Hybrid",
  "Other",
];

const GROUP_BLURB: Record<string, string> = {
  Sporting: "Gundogs bred to work all day beside you, and to sleep on your feet after.",
  Hound: "Noses and sighthounds, from the tireless trailers to the thirty-second sprinters.",
  Working: "The haulers, guardians, and rescuers. Big dogs with steady heads.",
  Terrier: "Small, game, and entirely convinced of themselves.",
  Toy: "Companions first and last, bred for the lap and the long conversation.",
  "Non-Sporting": "The wonderfully varied middle: bulldogs, poodles, spitzes, and originals.",
  Herding: "Thinking dogs that want a job, and will invent one if you do not give them one.",
  Hybrid: "Deliberate crosses chosen for temperament and low-shedding coats.",
  Other: "Breeds that sit happily outside the usual groupings.",
};

export default async function BreedsPage() {
  const breeds = await getBreeds();

  const groups = GROUP_ORDER.map((group) => ({
    group,
    breeds: breeds.filter((b) => b.group === group),
  })).filter((g) => g.breeds.length > 0);

  // Anything with an unexpected group label still gets shown.
  const ungrouped = breeds.filter((b) => !GROUP_ORDER.includes(b.group));
  if (ungrouped.length) groups.push({ group: "Other", breeds: ungrouped });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <header className="max-w-2xl">
        <p className="eyebrow mb-3">What we raise</p>
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
          Our breeds
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {breeds.length} breeds, raised in our home or by the small circle of
          partner families we have known for years. Tell us about your days and
          we will point you honestly to the temperament, energy, and coat that
          fits your life for the next decade and more.
        </p>
      </header>

      {/* Jump links, the catalog is long */}
      <nav className="mt-8 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a
            key={g.group}
            href={`#${g.group.toLowerCase()}`}
            className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-clay hover:text-clay"
          >
            {g.group}{" "}
            <span className="text-muted">({g.breeds.length})</span>
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.group} id={g.group.toLowerCase()} className="mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {g.group}
            </h2>
            <p className="max-w-xl text-sm text-muted">{GROUP_BLURB[g.group]}</p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.breeds.map((b) => (
              <Link
                key={b.id}
                href={`/breeds/${b.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper shadow-[var(--shadow-soft)] transition-colors hover:border-clay/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-bone-deep">
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    <PuppyPhoto
                      src={b.heroImage}
                      alt={`${b.name} dog`}
                      seed={b.slug}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-xs font-semibold text-ink-soft backdrop-blur">
                    {b._count.puppies > 0
                      ? `${b._count.puppies} available`
                      : "Waitlist"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold text-ink group-hover:text-clay">
                    {b.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                    {b.size} · {b.group}
                  </p>
                  <p className="mt-2 text-sm italic text-clay">{b.temperament}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                    {b.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-ink-soft">
                    {b._count.puppies > 0
                      ? "See the puppies →"
                      : "Join the waitlist →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
