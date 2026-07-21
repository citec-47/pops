"use client";

import { useState } from "react";

type Props = {
  puppyId?: string;
  puppyName?: string;
  compact?: boolean;
};

export function InquiryForm({ puppyId, puppyName, compact }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrors({});
    setServerError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, puppyId: puppyId ?? "" }),
      });
      if (res.ok) {
        setState("sent");
        form.reset();
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (body?.fieldErrors) {
        setErrors(body.fieldErrors);
        setState("idle");
      } else {
        setServerError(body?.error ?? "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setServerError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-sage/40 bg-sage/10 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage-deep">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-semibold text-ink">
          Message on its way!
        </h3>
        <p className="mt-2 text-muted">
          Thank you{puppyName ? ` for asking about ${puppyName}` : ""}. We read
          every note personally and will reply within one business day.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-5 text-sm font-semibold text-clay hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-3 text-ink placeholder:text-muted/70 focus:border-clay focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {puppyName && (
        <p className="rounded-xl bg-bone-deep px-4 py-3 text-sm text-ink-soft">
          You&rsquo;re asking about{" "}
          <span className="font-semibold text-ink">{puppyName}</span>. We&rsquo;ll
          keep that in mind when we reply.
        </p>
      )}

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Your name" error={errors.name}>
          <input name="name" className={inputCls} placeholder="Jane Doe" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input name="email" type="email" className={inputCls} placeholder="jane@email.com" autoComplete="email" />
        </Field>
      </div>

      <Field label="Phone (optional)" error={errors.phone}>
        <input name="phone" className={inputCls} placeholder="(555) 123-4567" autoComplete="tel" />
      </Field>

      <Field label="Your message" error={errors.message}>
        <textarea
          name="message"
          rows={compact ? 4 : 5}
          className={`${inputCls} resize-none`}
          placeholder={
            puppyName
              ? `Tell us about your home and why ${puppyName} caught your eye…`
              : "Tell us about your family, your home, and the kind of companion you're hoping for…"
          }
          defaultValue=""
        />
      </Field>

      {serverError && (
        <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-sm text-clay-deep">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:bg-clay-deep disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send inquiry"}
      </button>
      <p className="text-center text-xs text-muted">
        No spam, ever. We only use your details to reply about our puppies.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-clay-deep">{error}</span>}
    </label>
  );
}
