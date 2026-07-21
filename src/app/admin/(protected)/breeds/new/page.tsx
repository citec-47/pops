import Link from "next/link";
import { BreedForm } from "@/components/breed-form";
import { createBreedAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default function NewBreedPage() {
  return (
    <div>
      <nav className="mb-6 text-sm text-muted">
        <Link href="/admin/breeds" className="hover:text-clay">
          ← Breeds
        </Link>
      </nav>
      <h1 className="mb-2 font-display text-3xl font-semibold text-ink">
        Add a breed
      </h1>
      <p className="mb-8 max-w-2xl text-muted">
        Once added, this breed appears in your public breed list and as an option
        when you create a puppy.
      </p>
      <BreedForm action={createBreedAction} submitLabel="Add breed" />
    </div>
  );
}
