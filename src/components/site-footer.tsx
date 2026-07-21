import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-bone-deep">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              A small, family-run nursery in the hills. We raise a handful of
              litters each year, never more than we can love properly.
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li><Link href="/puppies" className="hover:text-clay">Available Puppies</Link></li>
              <li><Link href="/breeds" className="hover:text-clay">Our Breeds</Link></li>
              <li><Link href="/about" className="hover:text-clay">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-clay">Visit Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-4">Get in Touch</h3>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li>
                <a href="mailto:hello@willowbrook.test" className="hover:text-clay">
                  hello@willowbrook.test
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="hover:text-clay">
                  (555) 123-4567
                </a>
              </li>
              <li className="text-muted">Willow Hollow, Vermont</li>
              <li className="text-muted">By appointment only</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Willowbrook Puppy Nursery. Raised with love.</p>
          <p className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-clay">Breeder Login</Link>
            <span>Health guaranteed · AKC registered</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
