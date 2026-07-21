import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Visit Us",
  description:
    "Get in touch with Willowbrook to arrange a visit, ask about a puppy, or join a breed waitlist.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Left: info */}
        <div>
          <p className="eyebrow mb-3">Say hello</p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
            Let&rsquo;s find your
            <br />
            <span className="italic text-clay">perfect match.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Whether you&rsquo;ve fallen for a specific pup or you&rsquo;re just
            starting to dream, we&rsquo;d love to hear from you. We answer every
            message personally, usually within a day.
          </p>

          <dl className="mt-10 space-y-6">
            <ContactRow label="Email" value="hello@willowbrook.test" href="mailto:hello@willowbrook.test" />
            <ContactRow label="Phone & text" value="(555) 123-4567" href="tel:+15551234567" />
            <ContactRow label="Where we are" value="Willow Hollow, Vermont" />
            <ContactRow label="Visiting hours" value="By appointment, Thu–Sun" />
          </dl>

          <div className="mt-10 rounded-[var(--radius-xl)] border border-line bg-bone-deep/60 p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              How reserving works
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-ink-soft">
              {[
                "Send an inquiry about a puppy or breed.",
                "We reply to arrange a visit or video call.",
                "A deposit reserves your pup until go-home day.",
                "Your puppy comes home at 8 weeks, fully vetted.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clay text-[0.7rem] font-bold text-bone">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-[var(--radius-xl)] border border-line bg-paper p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Send us a message
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted">
            Tell us a little about your home and what you&rsquo;re looking for.
          </p>
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-baseline gap-4 border-b border-line pb-5">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="font-display text-lg text-ink">
        {href ? (
          <a href={href} className="hover:text-clay">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
