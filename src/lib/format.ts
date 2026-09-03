/** Format a price stored in cents as USD. */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Human-friendly age like "9 weeks" or "3 months" from a birth date. */
export function formatAge(birthDate: Date | string): string {
  const born = new Date(birthDate);
  const now = new Date();
  const days = Math.max(0, Math.floor((now.getTime() - born.getTime()) / 86_400_000));
  const weeks = Math.floor(days / 7);
  if (weeks < 1) return `${days} day${days === 1 ? "" : "s"} old`;
  if (weeks < 16) return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  const months = Math.floor(days / 30.44);
  return `${months} month${months === 1 ? "" : "s"} old`;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Welcomed Home",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Puppies go home at eight weeks. Returns "Ready now" once that date has
 * passed, otherwise a short date like "Oct 12".
 */
export function readyToGoHome(birthDate: Date | string): string {
  const d = new Date(birthDate);
  d.setDate(d.getDate() + 56);
  if (d.getTime() <= Date.now()) return "Ready now";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
