import Link from "next/link";
import { prisma } from "@/lib/db";
import { PuppyForm } from "@/components/puppy-form";
import { createPuppyAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function NewPuppyPage() {
  const breeds = await prisma.breed.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <nav className="mb-6 text-sm text-muted">
        <Link href="/admin/puppies" className="hover:text-clay">
          ← Puppies
        </Link>
      </nav>
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">
        Add a puppy
      </h1>
      <PuppyForm action={createPuppyAction} breeds={breeds} submitLabel="Add puppy" />
    </div>
  );
}
