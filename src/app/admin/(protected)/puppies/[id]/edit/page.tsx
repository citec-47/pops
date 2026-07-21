import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PuppyForm } from "@/components/puppy-form";
import { updatePuppyAction } from "../../../../actions";

export const dynamic = "force-dynamic";

function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function EditPuppyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [puppy, breeds] = await Promise.all([
    prisma.puppy.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.breed.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!puppy) notFound();

  return (
    <div>
      <nav className="mb-6 text-sm text-muted">
        <Link href="/admin/puppies" className="hover:text-clay">
          ← Puppies
        </Link>
      </nav>
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">
        Edit {puppy.name}
      </h1>
      <PuppyForm
        action={updatePuppyAction}
        breeds={breeds}
        submitLabel="Save changes"
        initial={{
          id: puppy.id,
          name: puppy.name,
          breedId: puppy.breedId,
          sex: puppy.sex,
          color: puppy.color,
          birthDate: toDateInput(puppy.birthDate),
          price: String(puppy.priceCents / 100),
          status: puppy.status,
          featured: puppy.featured,
          description: puppy.description,
          vetNotes: puppy.vetNotes ?? "",
          media: puppy.images.map((i) => ({
            url: i.url,
            type: i.type === "video" ? "video" : "image",
          })),
        }}
      />
    </div>
  );
}
