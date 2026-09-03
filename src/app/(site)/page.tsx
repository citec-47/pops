import Link from "next/link";
import { getPuppies, getBreeds, countAvailable } from "@/lib/data";
import { PuppyPhoto } from "@/components/portrait";
import { formatPrice, formatAge, formatDate, readyToGoHome } from "@/lib/format";

// The home page shows live inventory, so render on demand (never prerender
// at build time, the database may be asleep during the build).
export const dynamic = "force-dynamic";

const PHONE = "(555) 123-4567";
const PHONE_HREF = "tel:+15551234567";
const EMAIL = "careforepuppies21@gmail.com";

export default async function HomePage() {
  const [availablePuppies, breeds, available] = await Promise.all([
    getPuppies({ status: "AVAILABLE" }),
    getBreeds(),
    countAvailable(),
  ]);

  // Oldest first, so the pup closest to going home leads the photo slot.
  const readySoonest = [...availablePuppies].sort(
    (a, b) => +new Date(a.birthDate) - +new Date(b.birthDate),
  );
  // The table itself reads like our own inventory sheet: by breed, then name.
  const listed = [...availablePuppies]
    .sort(
      (a, b) =>
        a.breed.name.localeCompare(b.breed.name) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 12);

  // One photo for the top of the page, from a pup who actually has one.
  const cover =
    readySoonest.find((p) => p.images.some((m) => m.type !== "video")) ??
    readySoonest[0];
  const coverPhoto = cover?.images.find((m) => m.type !== "video");

  const lastUpdated = availablePuppies.reduce<Date | null>((latest, p) => {
    const d = new Date(p.createdAt);
    return !latest || d > latest ? d : latest;
  }, null);

  // Breeds with pups on the ground, grouped the way we talk about them.
  const withPuppies = breeds.filter((b) => b._count.puppies > 0);
  const groupNames = [...new Set(withPuppies.map((b) => b.group))].sort();

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/*  Who we are, and how to reach us                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="font-display text-[2.3rem] font-semibold leading-[1.1] text-ink sm:text-5xl">
              Puppies raised in our kitchen in Willow&nbsp;Hollow, Vermont.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              We&rsquo;re Marta and Elias. We&rsquo;ve been raising litters at
              home since 2009 and we place every puppy ourselves, no brokers,
              no pet stores, no shipping. If you want a puppy from us you come
              out to the farm and meet the parents first.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              The list further down this page is what is actually on the ground
              today. When a pup is reserved we mark it the same afternoon, so
              what you see is what is left.
            </p>

            <dl className="mt-8 grid gap-x-10 gap-y-3 border-t border-line pt-6 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-muted">Call or text</dt>
                <dd>
                  <a href={PHONE_HREF} className="font-semibold text-ink hover:text-clay">
                    {PHONE}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Email</dt>
                <dd className="min-w-0">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="break-all font-semibold text-ink hover:text-clay"
                  >
                    {EMAIL}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Visits</dt>
                <dd className="text-ink-soft">Thu&ndash;Sun, by appointment</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Pickup</dt>
                <dd className="text-ink-soft">
                  At the farm, or we meet long drives halfway
                </dd>
              </div>
            </dl>
          </div>

          {cover && (
            <figure className="lg:pt-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bone-deep">
                <PuppyPhoto
                  src={coverPhoto?.url}
                  alt={coverPhoto?.alt || `${cover.name}, a ${cover.breed.name}`}
                  seed={cover.id + cover.name}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <figcaption className="mt-2 text-sm text-muted">
                {cover.name}, {cover.breed.name.toLowerCase()},{" "}
                {formatAge(cover.birthDate)}.{" "}
                <Link href={`/puppies/${cover.id}`} className="text-clay hover:underline">
                  See the full listing
                </Link>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  What is available right now                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Available now
            </h2>
            {lastUpdated && (
              <p className="text-sm text-muted">
                {available} puppies unreserved · list updated{" "}
                {formatDate(lastUpdated)}
              </p>
            )}
          </div>

          {listed.length > 0 ? (
            <>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[42rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                      <th className="py-2 pr-4 font-semibold">Puppy</th>
                      <th className="py-2 pr-4 font-semibold">Breed</th>
                      <th className="py-2 pr-4 font-semibold">Sex &amp; coat</th>
                      <th className="py-2 pr-4 font-semibold">Age</th>
                      <th className="py-2 pr-4 font-semibold">Goes home</th>
                      <th className="py-2 pr-4 font-semibold">Price</th>
                      <th className="py-2 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {listed.map((p) => {
                      const photo = p.images.find((m) => m.type !== "video");
                      return (
                        <tr key={p.id} className="border-b border-line/70">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-bone-deep">
                                <PuppyPhoto
                                  src={photo?.url}
                                  alt={photo?.alt || p.name}
                                  seed={p.id + p.name}
                                  sizes="44px"
                                />
                              </div>
                              <span className="font-display text-base font-semibold text-ink">
                                {p.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-ink-soft">{p.breed.name}</td>
                          <td className="py-3 pr-4 text-muted">
                            {p.sex} · {p.color}
                          </td>
                          <td className="py-3 pr-4 text-muted">
                            {formatAge(p.birthDate)}
                          </td>
                          <td className="py-3 pr-4 text-ink-soft">
                            {readyToGoHome(p.birthDate)}
                          </td>
                          <td className="py-3 pr-4 font-semibold text-ink">
                            {formatPrice(p.priceCents)}
                          </td>
                          <td className="py-3">
                            <Link
                              href={`/puppies/${p.id}`}
                              className="font-semibold text-clay hover:underline"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <Link href="/puppies" className="font-semibold text-clay hover:underline">
                  See all {available} available puppies
                </Link>
                <Link
                  href="/puppies?status=RESERVED"
                  className="text-ink-soft hover:text-clay"
                >
                  Recently reserved
                </Link>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
                Prices include the first course of shots, deworming, a
                microchip, and the two-year health guarantee. A $300 deposit
                holds a puppy for two weeks while you arrange the drive; the
                balance is due on go-home day. We do not take deposits on a
                litter before the pups are five weeks old.
              </p>
            </>
          ) : (
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Nothing unreserved at the moment, which happens most summers.{" "}
              <Link href="/contact" className="font-semibold text-clay hover:underline">
                Send us a note
              </Link>{" "}
              and we&rsquo;ll tell you which litters are due.
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  How the pups are raised                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr]">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink">
              How the pups are raised
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-ink-soft">
              <p>
                Litters are whelped in a box beside the wood stove in the
                kitchen, which is the loudest room in the house, and that is
                the point. By three weeks they have met the vacuum, the kettle,
                the grandchildren, and the barn cat, who is not impressed.
                Nothing much rattles a pup that grew up in the middle of all
                that.
              </p>
              <p>
                Dr. Rennick at Willow Hollow Veterinary sees every litter at six
                weeks and again before they leave. You get the paperwork in a
                folder, not a promise: vaccination record, microchip number,
                worming dates, and both parents&rsquo; health screening.
              </p>
              <p>
                We are honest about the dogs, including the ones we would not
                sell you. If you have a small flat and two jobs we will tell
                you a Malinois is a bad idea and point you at a Cavalier
                instead. Nobody has ever been upset with us for that.
              </p>
            </div>
            <p className="mt-6 font-display text-lg text-clay">
              &mdash; Marta &amp; Elias
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block text-sm font-semibold text-clay hover:underline"
            >
              More about the farm and the dogs
            </Link>
          </div>

          <ul className="space-y-4 border-t border-line pt-6 text-sm lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2">
            {[
              ["Go-home age", "Eight weeks, ten for the toy breeds"],
              ["Included", "Shots, worming, microchip, folder of records"],
              [
                "Guarantee",
                "Two years, in writing, on the genetic conditions we screen for",
              ],
              ["Waitlist", "Three to five months on the popular breeds"],
              [
                "Shipping",
                "None. Pickup only, or a halfway meet if you are driving far",
              ],
            ].map(([k, v]) => (
              <li key={k}>
                <span className="block text-xs uppercase tracking-wider text-muted">
                  {k}
                </span>
                <span className="text-ink-soft">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Breeds index                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-line bg-bone-deep/50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Breeds with puppies listed
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            {withPuppies.length} of the {breeds.length} breeds we raise have
            pups on the ground right now, reserved ones included, since those
            litters often have a sibling left.{" "}
            {withPuppies.length < breeds.length
              ? "The rest run on a waitlist, and we are happy to put your name down."
              : "Ask us about a future litter and we will put your name down."}
          </p>

          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {groupNames.map((group) => (
              <div key={group}>
                <h3 className="mb-2 border-b border-line pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {group}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {withPuppies
                    .filter((b) => b.group === group)
                    .map((b) => (
                      <li key={b.id}>
                        <Link
                          href={`/breeds/${b.slug}`}
                          className="text-ink-soft hover:text-clay"
                        >
                          {b.name}
                        </Link>{" "}
                        <span className="text-muted">({b._count.puppies})</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href="/breeds"
            className="mt-8 inline-block text-sm font-semibold text-clay hover:underline"
          >
            All {breeds.length} breeds, with photos and temperament notes
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/*  Visiting                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 rounded-[var(--radius-xl)] border border-line bg-paper p-7 sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Coming to see us
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft">
              We keep visits to one family at a time so the pups are not
              handled all day and you are not rushed. Most people stay about an
              hour. Wear boots you do not mind, the lane is mud from March to
              May.
            </p>
            <address className="mt-6 space-y-1 text-sm not-italic text-ink-soft">
              <p>Willowbrook, 412 Hollow Road</p>
              <p>Willow Hollow, Vermont</p>
              <p className="pt-2 text-muted">
                Thursday to Sunday, 10am&ndash;4pm, by appointment
              </p>
            </address>
          </div>

          <div className="lg:border-l lg:border-line lg:pl-10">
            <p className="text-sm leading-relaxed text-muted">
              Texting is the fastest way to reach us, we are usually outside
              with the dogs. Email if you would rather write at length about
              what you are looking for, and we will answer properly.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li>
                <a href={PHONE_HREF} className="font-semibold text-ink hover:text-clay">
                  {PHONE}
                </a>
                <span className="text-muted"> · call or text</span>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="break-all font-semibold text-ink hover:text-clay"
                >
                  {EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-clay-deep"
              >
                Ask about a puppy
              </Link>
              <Link
                href="/puppies"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/20 hover:text-clay hover:ring-clay"
              >
                Browse the nursery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
