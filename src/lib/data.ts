import "server-only";
import { prisma } from "./db";

const imageOrder = { orderBy: { sortOrder: "asc" as const } };

export async function getFeaturedPuppies(limit = 3) {
  return prisma.puppy.findMany({
    where: { featured: true, status: { not: "SOLD" } },
    include: { breed: true, images: imageOrder },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getPuppies(filter?: {
  breedSlug?: string;
  status?: string;
}) {
  return prisma.puppy.findMany({
    where: {
      ...(filter?.breedSlug ? { breed: { slug: filter.breedSlug } } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
    include: { breed: true, images: imageOrder },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPuppyById(id: string) {
  return prisma.puppy.findUnique({
    where: { id },
    include: { breed: true, images: imageOrder },
  });
}

export async function getBreeds() {
  return prisma.breed.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { puppies: { where: { status: { not: "SOLD" } } } },
      },
    },
  });
}

export async function getBreedBySlug(slug: string) {
  return prisma.breed.findUnique({ where: { slug } });
}

export async function countAvailable() {
  return prisma.puppy.count({ where: { status: "AVAILABLE" } });
}
