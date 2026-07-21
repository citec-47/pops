"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "../actions";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-line bg-paper p-8 shadow-[var(--shadow-soft)]">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Breeder login
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to manage puppies and inquiries.
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                defaultValue="admin@willowbrook.test"
                className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-ink focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-bone px-4 py-3 text-ink focus:border-clay focus:outline-none"
              />
            </label>

            {state?.error && (
              <p className="rounded-xl bg-clay-soft/60 px-4 py-3 text-sm text-clay-deep">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-bone transition-colors hover:bg-clay-deep disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Dev credentials are pre-filled. Password is set in your{" "}
          <code className="rounded bg-bone-deep px-1 py-0.5">.env</code> file.
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-clay hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
