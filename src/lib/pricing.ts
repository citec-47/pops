/**
 * Price maths for the admin bulk editor. Kept apart from the server action so
 * the arithmetic can be exercised on its own.
 */

export type PriceAdjustment = {
  mode: "percent" | "amount";
  direction: "increase" | "decrease";
  /** Percent (e.g. 5 for 5%) or whole dollars, depending on `mode`. */
  value: number;
  roundTo50?: boolean;
};

/** Round a cents figure to the nearest $50, never below zero. */
export function roundToNearest50(cents: number): number {
  return Math.max(0, Math.round(cents / 5000) * 5000);
}

/**
 * The new price for one puppy. Percentages work off the current price, so a
 * listing priced up or down by hand keeps its relative position. Prices never
 * go below zero.
 */
export function nextPriceCents(
  currentCents: number,
  { mode, direction, value, roundTo50 }: PriceAdjustment,
): number {
  const sign = direction === "increase" ? 1 : -1;
  const raw =
    mode === "percent"
      ? currentCents * (1 + (sign * value) / 100)
      : currentCents + sign * value * 100;

  return roundTo50 ? roundToNearest50(raw) : Math.max(0, Math.round(raw));
}
