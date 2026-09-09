import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui";
import { PriceAdjuster } from "@/components/price-adjuster";
import { formatPrice, formatAge } from "@/lib/format";
import { adjustPricesAction, setPuppyPriceAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminPricesPage() {
  const [puppies, breeds] = await Promise.all([
    prisma.puppy.findMany({
      include: { breed: { select: { name: true } } },
      orderBy: [{ breed: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.breed.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { puppies: true } } },
    }),
  ]);

  const counts = {
    all: puppies.length,
    AVAILABLE: puppies.filter((p) => p.status === "AVAILABLE").length,
    RESERVED: puppies.filter((p) => p.status === "RESERVED").length,
    SOLD: puppies.filter((p) => p.status === "SOLD").length,
  };

  const prices = puppies.map((p) => p.priceCents);
  const total = prices.reduce((n, c) => n + c, 0);
  const average = prices.length ? Math.round(total / prices.length) : 0;
  const lowest = prices.length ? Math.min(...prices) : 0;
  const highest = prices.length ? Math.max(...prices) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Prices</h1>
          <p className="mt-1 text-muted">
            Move every price at once, or set a single one by hand.
          </p>
        </div>
        <Link
          href="/admin/puppies"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-clay hover:text-clay"
        >
          Back to puppies
        </Link>
      </div>

      {/* At a glance */}
      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { l: "Listings", v: String(counts.all) },
          { l: "Average", v: formatPrice(average) },
          { l: "Lowest", v: formatPrice(lowest) },
          { l: "Highest", v: formatPrice(highest) },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-[var(--radius-xl)] border border-line bg-paper px-4 py-3"
          >
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              {s.l}
            </dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-ink">
              {s.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <PriceAdjuster
          action={adjustPricesAction}
          breeds={breeds.map((b) => ({
            id: b.id,
            name: b.name,
            puppies: b._count.puppies,
          }))}
          counts={counts}
        />
      </div>

      {/* One at a time */}
      <h2 className="mt-12 font-display text-xl font-semibold text-ink">
        Every listing
      </h2>
      <p className="mt-1 text-sm text-muted">
        Type a new price and press Save on that row. Prices are in dollars.
      </p>

      {puppies.length === 0 ? (
        <p className="mt-6 rounded-[var(--radius-xl)] border border-dashed border-line bg-paper p-10 text-center text-muted">
          No puppies to price yet.
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper">
          <ul className="divide-y divide-line">
            {puppies.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-ink">
                    {p.name}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {p.breed.name} · {p.sex} · {formatAge(p.birthDate)}
                  </p>
                </div>

                <div className="hidden shrink-0 sm:block">
                  <StatusBadge status={p.status} />
                </div>

                <form
                  action={setPuppyPriceAction}
                  className="flex shrink-0 items-center gap-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <label htmlFor={`price-${p.id}`} className="text-ink-soft">
                    $
                  </label>
                  <input
                    id={`price-${p.id}`}
                    name="price"
                    type="number"
                    min="0"
                    step="25"
                    defaultValue={(p.priceCents / 100).toFixed(0)}
                    aria-label={`Price for ${p.name}`}
                    className="w-28 rounded-xl border border-line bg-bone px-3 py-1.5 text-right text-ink focus:border-clay focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
                  >
                    Save
                  </button>
                </form>

                <Link
                  href={`/admin/puppies/${p.id}/edit`}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-sm text-muted hover:text-clay"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
