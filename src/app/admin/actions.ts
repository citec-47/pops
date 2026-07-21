"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  verifyCredentials,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import {
  puppySchema,
  loginSchema,
  breedSchema,
  slugify,
} from "@/lib/validation";

type ActionState = { error?: string } | undefined;

/* --------------------------------- Auth --------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Those credentials don't match. Please try again." };
  }

  await createSession(user.id, user.email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ Guard helper ---------------------------- */

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/* ------------------------------- Puppies -------------------------------- */

function parsePuppyForm(formData: FormData) {
  return puppySchema.safeParse({
    name: formData.get("name"),
    breedId: formData.get("breedId"),
    sex: formData.get("sex"),
    color: formData.get("color"),
    birthDate: formData.get("birthDate"),
    price: formData.get("price"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    description: formData.get("description"),
    vetNotes: formData.get("vetNotes"),
  });
}

/**
 * Media items come in as hidden inputs named "media" with the value encoded
 * as `type::url` (type is "image" or "video").
 */
function parseMedia(formData: FormData) {
  return formData
    .getAll("media")
    .filter((v): v is string => typeof v === "string" && v.includes("::"))
    .map((entry, i) => {
      const sep = entry.indexOf("::");
      const type = entry.slice(0, sep) === "video" ? "video" : "image";
      const url = entry.slice(sep + 2);
      return { url, type, sortOrder: i };
    })
    .filter((m) => m.url.length > 0);
}

export async function createPuppyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parsePuppyForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const media = parseMedia(formData);

  await prisma.puppy.create({
    data: {
      name: d.name,
      breedId: d.breedId,
      sex: d.sex,
      color: d.color,
      birthDate: new Date(d.birthDate),
      priceCents: Math.round(d.price * 100),
      status: d.status,
      featured: !!d.featured,
      description: d.description,
      vetNotes: d.vetNotes || null,
      images: {
        create: media.map((m) => ({
          url: m.url,
          type: m.type,
          alt: `${d.name} ${m.type} ${m.sortOrder + 1}`,
          sortOrder: m.sortOrder,
        })),
      },
    },
  });

  revalidatePath("/admin/puppies");
  revalidatePath("/puppies");
  revalidatePath("/");
  redirect("/admin/puppies");
}

export async function updatePuppyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing puppy id." };

  const parsed = parsePuppyForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  const media = parseMedia(formData);

  await prisma.$transaction([
    prisma.puppyImage.deleteMany({ where: { puppyId: id } }),
    prisma.puppy.update({
      where: { id },
      data: {
        name: d.name,
        breedId: d.breedId,
        sex: d.sex,
        color: d.color,
        birthDate: new Date(d.birthDate),
        priceCents: Math.round(d.price * 100),
        status: d.status,
        featured: !!d.featured,
        description: d.description,
        vetNotes: d.vetNotes || null,
        images: {
          create: media.map((m) => ({
            url: m.url,
            type: m.type,
            alt: `${d.name} ${m.type} ${m.sortOrder + 1}`,
            sortOrder: m.sortOrder,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/puppies");
  revalidatePath("/puppies");
  revalidatePath(`/puppies/${id}`);
  revalidatePath("/");
  redirect("/admin/puppies");
}

export async function deletePuppyAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string") {
    await prisma.puppy.delete({ where: { id } });
    revalidatePath("/admin/puppies");
    revalidatePath("/puppies");
    revalidatePath("/");
  }
}

/* ------------------------------ Inquiries ------------------------------- */

export async function setInquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id === "string" && typeof status === "string") {
    await prisma.inquiry.update({ where: { id }, data: { status } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
  }
}

export async function deleteInquiryAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string") {
    await prisma.inquiry.delete({ where: { id } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
  }
}

/* -------------------------------- Breeds -------------------------------- */

/** Build a slug from a name, ensuring it's unique (ignoring `exceptId`). */
async function uniqueBreedSlug(name: string, exceptId?: string) {
  const base = slugify(name) || "breed";
  let slug = base;
  let n = 2;
  // Keep bumping the suffix until the slug is free.
  while (true) {
    const clash = await prisma.breed.findUnique({ where: { slug } });
    if (!clash || clash.id === exceptId) return slug;
    slug = `${base}-${n++}`;
  }
}

function parseBreedForm(formData: FormData) {
  return breedSchema.safeParse({
    name: formData.get("name"),
    group: formData.get("group"),
    size: formData.get("size"),
    temperament: formData.get("temperament"),
    description: formData.get("description"),
  });
}

export async function createBreedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseBreedForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  await prisma.breed.create({
    data: { ...d, slug: await uniqueBreedSlug(d.name) },
  });

  revalidatePath("/admin/breeds");
  revalidatePath("/breeds");
  revalidatePath("/");
  redirect("/admin/breeds");
}

export async function updateBreedAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing breed id." };

  const parsed = parseBreedForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;
  await prisma.breed.update({
    where: { id },
    data: { ...d, slug: await uniqueBreedSlug(d.name, id) },
  });

  revalidatePath("/admin/breeds");
  revalidatePath("/breeds");
  revalidatePath(`/breeds/${d.name}`);
  revalidatePath("/");
  redirect("/admin/breeds");
}

export async function deleteBreedAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") return;

  // Guard: don't silently delete puppies along with a breed. Ask the admin
  // to clear the puppies first (deleting a breed would cascade-remove them).
  const count = await prisma.puppy.count({ where: { breedId: id } });
  if (count > 0) {
    redirect(
      `/admin/breeds?error=${encodeURIComponent(
        `That breed still has ${count} puppy${count === 1 ? "" : " listings"}. Remove or reassign them before deleting the breed.`,
      )}`,
    );
  }

  await prisma.breed.delete({ where: { id } });
  revalidatePath("/admin/breeds");
  revalidatePath("/breeds");
  revalidatePath("/");
}
