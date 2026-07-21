import Link from "next/link";
import { PuppyPhoto } from "./portrait";
import { StatusBadge } from "./ui";
import { formatPrice, formatAge } from "@/lib/format";

export type PuppyCardData = {
  id: string;
  name: string;
  sex: string;
  color: string;
  birthDate: Date | string;
  priceCents: number;
  status: string;
  breed: { name: string };
  images: { url: string; alt: string; type: string }[];
};

export function PuppyCard({ puppy }: { puppy: PuppyCardData }) {
  const cover = puppy.images.find((m) => m.type !== "video") ?? puppy.images[0];
  return (
    <Link
      href={`/puppies/${puppy.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-paper shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-bone-deep">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
          <PuppyPhoto
            src={cover && cover.type !== "video" ? cover.url : undefined}
            alt={cover?.alt || `${puppy.name}, a ${puppy.breed.name}`}
            seed={puppy.id + puppy.name}
          />
        </div>
        <div className="absolute left-4 top-4">
          <StatusBadge status={puppy.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow mb-1.5 !tracking-[0.18em]">{puppy.breed.name}</p>
        <h3 className="font-display text-2xl font-semibold text-ink">
          {puppy.name}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {puppy.sex} · {puppy.color} · {formatAge(puppy.birthDate)}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-lg font-semibold text-clay-deep">
            {formatPrice(puppy.priceCents)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition-all group-hover:gap-2 group-hover:text-clay">
            Meet {puppy.name.split(" ")[0]}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
