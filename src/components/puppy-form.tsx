"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Breed = { id: string; name: string };
type MediaItem = { url: string; type: "image" | "video" };

type ActionState = { error?: string } | undefined;
type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type PuppyInitial = {
  id?: string;
  name?: string;
  breedId?: string;
  sex?: string;
  color?: string;
  birthDate?: string; // yyyy-mm-dd
  price?: string; // dollars
  status?: string;
  featured?: boolean;
  description?: string;
  vetNotes?: string;
  media?: MediaItem[];
};

const field =
  "w-full rounded-xl border border-line bg-bone px-4 py-2.5 text-ink focus:border-clay focus:outline-none";
const labelCls = "mb-1.5 block text-sm font-medium text-ink-soft";

export function PuppyForm({
  action,
  breeds,
  initial = {},
  submitLabel,
}: {
  action: FormAction;
  breeds: Breed[];
  initial?: PuppyInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [media, setMedia] = useState<MediaItem[]>(initial.media ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.url) {
          setMedia((prev) => [
            ...prev,
            { url: body.url, type: body.type === "video" ? "video" : "image" },
          ]);
        } else {
          setUploadError(body.error ?? "Upload failed.");
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function removeAt(idx: number) {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setMedia((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      {media.map((m, i) => (
        <input key={`${m.url}-${i}`} type="hidden" name="media" value={`${m.type}::${m.url}`} />
      ))}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: details */}
        <div className="space-y-5 rounded-[var(--radius-xl)] border border-line bg-paper p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Details</h2>

          <label className="block">
            <span className={labelCls}>Puppy name</span>
            <input name="name" required defaultValue={initial.name} className={field} placeholder="Clementine" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Breed</span>
              <select name="breedId" required defaultValue={initial.breedId ?? ""} className={field}>
                <option value="" disabled>
                  Choose a breed…
                </option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Sex</span>
              <select name="sex" required defaultValue={initial.sex ?? "Female"} className={field}>
                <option>Female</option>
                <option>Male</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Coat / color</span>
              <input name="color" required defaultValue={initial.color} className={field} placeholder="Cream" />
            </label>
            <label className="block">
              <span className={labelCls}>Birth date</span>
              <input name="birthDate" type="date" required defaultValue={initial.birthDate} className={field} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Price (USD)</span>
              <input name="price" type="number" min="0" step="50" required defaultValue={initial.price} className={field} placeholder="3200" />
            </label>
            <label className="block">
              <span className={labelCls}>Status</span>
              <select name="status" required defaultValue={initial.status ?? "AVAILABLE"} className={field}>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Welcomed Home</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>Description</span>
            <textarea name="description" required rows={4} defaultValue={initial.description} className={`${field} resize-none`} placeholder="Personality, quirks, what makes this pup special…" />
          </label>

          <label className="block">
            <span className={labelCls}>Health &amp; care notes (optional)</span>
            <textarea name="vetNotes" rows={3} defaultValue={initial.vetNotes} className={`${field} resize-none`} placeholder="Vaccinations, deworming, microchip, health guarantee…" />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial.featured}
              className="h-5 w-5 rounded border-line text-clay focus:ring-clay"
            />
            <span className="text-sm font-medium text-ink-soft">
              Feature on the homepage
            </span>
          </label>
        </div>

        {/* Right: photos & video */}
        <div className="space-y-4 rounded-[var(--radius-xl)] border border-line bg-paper p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Photos &amp; video
          </h2>
          <p className="text-sm text-muted">
            The first item is the cover. Reorder with the arrows. Uploads go to
            your Cloudinary account. No media? A tasteful illustrated portrait is
            shown automatically.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-bone px-4 py-8 text-center transition-colors hover:border-clay/50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 text-muted">
              <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-ink-soft">
              {uploading ? "Uploading…" : "Click to upload photos or video"}
            </span>
            <span className="mt-0.5 text-xs text-muted">Images or MP4 · up to 100 MB</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          {uploadError && (
            <p className="rounded-lg bg-clay-soft/60 px-3 py-2 text-xs text-clay-deep">
              {uploadError}
            </p>
          )}

          {media.length > 0 && (
            <ul className="space-y-2">
              {media.map((m, i) => (
                <li
                  key={`${m.url}-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-bone p-2"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink/80">
                    {m.type === "video" ? (
                      <div className="flex h-full w-full items-center justify-center text-bone">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <Image src={m.url} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <span className="flex-1 truncate text-xs text-muted">
                    {i === 0 ? "★ Cover" : `${m.type === "video" ? "Video" : "Photo"} ${i + 1}`}
                  </span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-ink-soft hover:text-clay disabled:opacity-30" aria-label="Move up">▲</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === media.length - 1} className="rounded p-1 text-ink-soft hover:text-clay disabled:opacity-30" aria-label="Move down">▼</button>
                  <button type="button" onClick={() => removeAt(i)} className="rounded p-1 text-ink-soft hover:text-clay-deep" aria-label="Remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-bone transition-colors hover:bg-clay-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin/puppies"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
