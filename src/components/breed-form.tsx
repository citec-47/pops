"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
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
  heroImage?: string | null;
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
  const [heroImage, setHeroImage] = useState<string>(initial.heroImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) setHeroImage(body.url);
      else setUploadError(body.error ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-5 rounded-[var(--radius-xl)] border border-line bg-paper p-6"
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="heroImage" value={heroImage} />

      {/* Breed photo */}
      <div>
        <span className={labelCls}>Breed photo</span>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-bone-deep">
            {heroImage ? (
              <Image src={heroImage} alt="" fill sizes="96px" className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-muted">
                No photo
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-block cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-clay hover:text-clay">
              {uploading ? "Uploading…" : heroImage ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            {heroImage && (
              <button
                type="button"
                onClick={() => setHeroImage("")}
                className="ml-2 text-sm text-muted hover:text-clay-deep"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-muted">
              A representative photo of the breed. If empty, an illustrated
              portrait is shown.
            </p>
          </div>
        </div>
        {uploadError && (
          <p className="mt-2 rounded-lg bg-clay-soft/60 px-3 py-2 text-xs text-clay-deep">
            {uploadError}
          </p>
        )}
      </div>

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
