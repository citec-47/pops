import type { Metadata } from "next";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { IllustratedPortrait } from "@/components/portrait";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Willowbrook is a small family nursery in the hills of Vermont, raising healthy, well-socialized puppies since 2009.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <p className="eyebrow mb-4">Since 2009 · Willow Hollow, Vermont</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          A small nursery with an
          <br />
          <span className="italic text-clay">old-fashioned</span> idea of care.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          We&rsquo;re Marta and Elias, a husband, a wife, three children, and a
          farmhouse full of wagging tails. What began with one beloved Golden
          and a single litter has grown, slowly and deliberately, into the work
          we love most.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {["about-1", "about-2", "about-3"].map((s, i) => (
            <div
              key={s}
              className={`relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bone-deep shadow-[var(--shadow-soft)] ${
                i === 1 ? "sm:-translate-y-6" : ""
              }`}
            >
              <IllustratedPortrait seed={s} className="h-full w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="prose-warm space-y-6 text-lg leading-relaxed text-ink-soft">
          <p>
            We don&rsquo;t run a kennel. Our puppies are born in a whelping box
            beside the wood stove and graduate to the chaos of family life:
            children&rsquo;s footsteps, the clatter of dinner, the doorbell, the
            wheelbarrow. By the time a pup is ready to leave, very little in the
            world frightens them. That steadiness is the single greatest gift we
            can give a family.
          </p>
          <p>
            We health-test every parent, keep our litters small, and place each
            puppy ourselves, never through a broker or a pet store. We&rsquo;d
            rather a pup wait an extra month for the right home than go to the
            wrong one tomorrow.
          </p>
        </div>

        {/* Values */}
        <div className="mt-14">
          <div className="rule mb-8" />
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              { t: "Health first, always", d: "OFA and genetic screening on our parents, a two-year health guarantee, and a lifetime of questions answered." },
              { t: "Small on purpose", d: "A few litters a year. We know every puppy's quirks and tell you the honest truth about each one." },
              { t: "Socialized from day three", d: "Early neurological stimulation, novel sounds and surfaces, gentle handling, and the start of crate training." },
              { t: "Matched, not sold", d: "We ask about your life and recommend the pup we truly believe fits, even if it means a waitlist." },
            ].map((v) => (
              <div key={v.t}>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {v.t}
                </h3>
                <p className="mt-2 leading-relaxed text-muted">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <div className="rounded-[var(--radius-xl)] border border-line bg-bone-deep/60 p-10 text-center sm:p-14">
          <SectionHeading
            align="center"
            title="Come see for yourself"
            intro="Meet our dogs, walk the property, and ask us anything. We love showing people how our puppies are raised."
          />
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/contact">Arrange a visit</ButtonLink>
            <ButtonLink href="/puppies" variant="outline">
              See available puppies
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
