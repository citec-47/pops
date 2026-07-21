"use client";

import { useActionState } from "react";
import Link from "next/link";

type ActionState = { error?: string } | undefined;
type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type BreedInitial = {
  id?: string;
  name?: string;
  group?: string;
  size?: string;
  temperament?: string;
  description?: string;
};

const GROUPS = [
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
const SIZES = ["Small", "Medium", "Large"];

const field =
  "w-full rounded-xl border border-line bg-bone px-4 py-2.5 text-ink focus:border-clay focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-medium text-ink-soft";

export function BreedForm({
  action,
  initial = {},
  submitLabel,
}: {
  action: FormAction;
  initial?: BreedInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-5 rounded-[var(--radius-xl)] border border-line bg-paper p-6"
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <label className="block">
        <span className={labelCls}>Breed name</span>
        <input
          name="name"
          required
          defaultValue={initial.name}
          className={field}
          placeholder="e.g. Cavapoo"
        />
        <span className="mt-1 block text-xs text-muted">
          The web address is created automatically from this name.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Group</span>
          <select
            name="group"
            required
            defaultValue={initial.group ?? ""}
            className={field}
          >
            <option value="" disabled>
              Choose a group…
            </option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Size</span>
          <select
            name="size"
            required
            defaultValue={initial.size ?? ""}
            className={field}
          >
            <option value="" disabled>
              Choose a size…
            </option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Temperament</span>
        <input
          name="temperament"
          required
          defaultValue={initial.temperament}
          className={field}
          placeholder="e.g. Affectionate, playful, easy to train"
        />
      </label>

      <label className="block">
        <span className={labelCls}>Description</span>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={initial.description}
          className={`${field} resize-none`}
          placeholder="A paragraph about the breed: what families love, energy level, coat, who they suit…"
        />
      </label>

      {state?.error && (
        <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-bone transition-colors hover:bg-clay-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/breeds"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
