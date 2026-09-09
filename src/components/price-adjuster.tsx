"use client";

import { useActionState, useState } from "react";

type PriceActionState = { error?: string; message?: string } | undefined;

type FormAction = (
  prev: PriceActionState,
  formData: FormData,
) => Promise<PriceActionState>;

const field =
  "rounded-xl border border-line bg-bone px-3 py-2 text-ink focus:border-clay focus:outline-none";

export function PriceAdjuster({
  action,
  breeds,
  counts,
}: {
  action: FormAction;
  breeds: { id: string; name: string; puppies: number }[];
  counts: { all: number; AVAILABLE: number; RESERVED: number; SOLD: number };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [value, setValue] = useState("5");
  const [breedId, setBreedId] = useState("");
  const [status, setStatus] = useState("");

  // How many listings this change would touch, so the confirm dialog can say.
  const affected = breedId
    ? (breeds.find((b) => b.id === breedId)?.puppies ?? 0)
    : status
      ? counts[status as "AVAILABLE" | "RESERVED" | "SOLD"]
      : counts.all;

  const scope = [
    breedId ? breeds.find((b) => b.id === breedId)?.name : "every breed",
    status ? statusWord(status) : null,
  ]
    .filter(Boolean)
    .join(", ");

  const summary =
    `${direction === "increase" ? "Raise" : "Lower"} prices by ` +
    `${mode === "percent" ? `${value || 0}%` : `$${value || 0}`} across ${scope}`;

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-xl)] border border-line bg-paper p-6"
    >
      <h2 className="font-display text-xl font-semibold text-ink">
        Change prices in bulk
      </h2>
      <p className="mt-1 text-sm text-muted">
        Percentages work off each puppy&rsquo;s current price, so listings you
        have priced up or down by hand keep their relative position.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Direction
          </span>
          <select
            name="direction"
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as "increase" | "decrease")
            }
            className={field}
          >
            <option value="increase">Raise by</option>
            <option value="decrease">Lower by</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Amount
          </span>
          <div className="flex items-center">
            {mode === "amount" && (
              <span className="mr-1 text-ink-soft">$</span>
            )}
            <input
              name="value"
              type="number"
              min="0"
              step={mode === "percent" ? "0.5" : "25"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              className={`${field} w-28`}
            />
            {mode === "percent" && (
              <span className="ml-1 text-ink-soft">%</span>
            )}
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            As a
          </span>
          <select
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as "percent" | "amount")}
            className={field}
          >
            <option value="percent">Percentage</option>
            <option value="amount">Dollar amount</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Breed
          </span>
          <select
            name="breedId"
            value={breedId}
            onChange={(e) => setBreedId(e.target.value)}
            className={field}
          >
            <option value="">All breeds ({counts.all})</option>
            {breeds
              .filter((b) => b.puppies > 0)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.puppies})
                </option>
              ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Status
          </span>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={field}
          >
            <option value="">Any status</option>
            <option value="AVAILABLE">Available ({counts.AVAILABLE})</option>
            <option value="RESERVED">Reserved ({counts.RESERVED})</option>
            <option value="SOLD">Welcomed home ({counts.SOLD})</option>
          </select>
        </label>
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          name="roundTo50"
          defaultChecked
          className="h-4 w-4 rounded border-line accent-[var(--color-clay,#b6633f)]"
        />
        Round the result to the nearest $50
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            const ok = confirm(
              `${summary}.\n\nThis updates ${affected} listing${affected === 1 ? "" : "s"} and cannot be undone in one click.`,
            );
            if (!ok) e.preventDefault();
          }}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bone hover:bg-clay-deep disabled:opacity-60"
        >
          {pending ? "Updating…" : "Apply to " + affected + " listings"}
        </button>
        <p className="text-sm text-muted">{summary}.</p>
      </div>

      {state?.error && (
        <p className="mt-4 rounded-xl border border-clay/30 bg-clay-soft/50 px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p className="mt-4 rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-sage-deep">
          {state.message}
        </p>
      )}
    </form>
  );
}

function statusWord(status: string): string {
  if (status === "AVAILABLE") return "available only";
  if (status === "RESERVED") return "reserved only";
  return "welcomed home only";
}
