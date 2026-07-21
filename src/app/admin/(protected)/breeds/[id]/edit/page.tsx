import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BreedForm } from "@/components/breed-form";
import { updateBreedAction } from "../../../../actions";

export const dynamic = "force-dynamic";

export default async function EditBreedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const breed = await prisma.breed.findUnique({ where: { id } });
  if (!breed) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-muted">
        <Link href="/admin/breeds" className="hover:text-clay">
          ← Breeds
        </Link>
      </nav>
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">
        Edit {breed.name}
      </h1>
      <BreedForm
        action={updateBreedAction}
        submitLabel="Save changes"
        initial={{
          id: breed.id,
          name: breed.name,
          group: breed.group,
          size: breed.size,
          temperament: breed.temperament,
          description: breed.description,
        }}
      />
    </div>
  );
}
