import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function weeksAgo(weeks: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  return d;
}

// Map our breeds to the free dog.ceo photo API so sample puppies show real,
// breed-appropriate photos. Swap these for your own uploads anytime.
const DOG_CEO_PATH: Record<string, string> = {
  "golden-retriever": "retriever/golden",
  "cavalier-king-charles-spaniel": "spaniel/blenheim",
  "french-bulldog": "bulldog/french",
  "bernese-mountain-dog": "mountain/bernese",
  "australian-shepherd": "australian/shepherd",
  "goldendoodle": "retriever/golden", // no doodle in the API; golden is closest
};

/** Fetch `n` real photo URLs for a breed from dog.ceo (best-effort). */
async function fetchDogPhotos(breedSlug: string, n: number): Promise<string[]> {
  const path = DOG_CEO_PATH[breedSlug];
  if (!path) return [];
  try {
    const res = await fetch(
      `https://dog.ceo/api/breed/${path}/images/random/${n}`,
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { message: string[]; status: string };
    return Array.isArray(body.message) ? body.message : [];
  } catch {
    return [];
  }
}

const BREEDS = [
  {
    slug: "golden-retriever",
    name: "Golden Retriever",
    group: "Sporting",
    size: "Large",
    temperament: "Gentle, eager to please, endlessly patient with children",
    description:
      "The Golden is the quintessential family dog — devoted, playful, and soft-mouthed enough to carry an egg without cracking it. Ours are raised underfoot in the kitchen so they arrive confident and well-mannered.",
  },
  {
    slug: "cavalier-king-charles-spaniel",
    name: "Cavalier King Charles Spaniel",
    group: "Toy",
    size: "Small",
    temperament: "Affectionate, adaptable, happiest in a lap",
    description:
      "A regal little companion with the heart of a spaniel and the manners of a courtier. Cavaliers thrive on closeness and suit apartments and farmhouses alike.",
  },
  {
    slug: "french-bulldog",
    name: "French Bulldog",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Comical, easygoing, quietly stubborn",
    description:
      "All personality in a compact frame. The Frenchie is a low-exercise charmer that would rather make you laugh than take a long hike — a wonderful city companion.",
  },
  {
    slug: "bernese-mountain-dog",
    name: "Bernese Mountain Dog",
    group: "Working",
    size: "Large",
    temperament: "Calm, loyal, gentle giant",
    description:
      "Striking tri-color coats and a temperament as steady as the Alps they hail from. Berners bond deeply with their families and love cool weather and open space.",
  },
  {
    slug: "australian-shepherd",
    name: "Australian Shepherd",
    group: "Herding",
    size: "Medium",
    temperament: "Bright, driven, deeply bonded",
    description:
      "A thinking dog that wants a job. Aussies reward active families with dazzling agility, trainability, and a merle coat no two of which are ever alike.",
  },
  {
    slug: "goldendoodle",
    name: "Goldendoodle",
    group: "Hybrid",
    size: "Medium",
    temperament: "Sociable, clever, low-shedding",
    description:
      "The sunny disposition of a Golden with the low-shedding coat of a Poodle. Our doodles are F1b, gently curled, and a thoughtful choice for allergy-conscious homes.",
  },
];

type SeedPuppy = {
  name: string;
  breedSlug: string;
  sex: "Male" | "Female";
  color: string;
  weeks: number;
  price: number; // dollars
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  featured?: boolean;
  description: string;
  vetNotes: string;
};

const PUPPIES: SeedPuppy[] = [
  {
    name: "Clementine",
    breedSlug: "golden-retriever",
    sex: "Female",
    color: "Cream",
    weeks: 8,
    price: 3200,
    status: "AVAILABLE",
    featured: true,
    description:
      "The first to the food bowl and the first into your lap. Clementine is a bold, sunny girl who already sits for her breakfast and adores the garden hose.",
    vetNotes:
      "First vaccinations complete · dewormed at 2, 4, 6 weeks · microchipped · vet-checked · two-year health guarantee.",
  },
  {
    name: "Hollis",
    breedSlug: "golden-retriever",
    sex: "Male",
    color: "Golden",
    weeks: 8,
    price: 3000,
    status: "AVAILABLE",
    description:
      "A mellow, thoughtful boy who watches the room before he joins it. Hollis will make a wonderfully steady companion and a natural therapy prospect.",
    vetNotes:
      "First vaccinations complete · dewormed on schedule · microchipped · vet-checked · two-year health guarantee.",
  },
  {
    name: "Juniper",
    breedSlug: "cavalier-king-charles-spaniel",
    sex: "Female",
    color: "Blenheim",
    weeks: 10,
    price: 2800,
    status: "RESERVED",
    featured: true,
    description:
      "A ribbon of a tail that never stops. Juniper is pure sweetness, already crate-trained and sleeping through the night.",
    vetNotes:
      "Fully vaccinated for age · heart-clear parents · dewormed · microchipped · health guarantee.",
  },
  {
    name: "Bartholomew",
    breedSlug: "french-bulldog",
    sex: "Male",
    color: "Blue Fawn",
    weeks: 9,
    price: 4500,
    status: "AVAILABLE",
    featured: true,
    description:
      "Bat ears and a snore to match. Barty is a clown who greets every guest like a long-lost friend and naps like it's a competitive sport.",
    vetNotes:
      "First vaccinations · dewormed · microchipped · airway-checked · one-year health guarantee.",
  },
  {
    name: "Marigold",
    breedSlug: "french-bulldog",
    sex: "Female",
    color: "Cream",
    weeks: 9,
    price: 4700,
    status: "AVAILABLE",
    description:
      "Petite, poised, and quietly bossy with her brothers. Marigold is house-loving and would flourish as a devoted only-dog.",
    vetNotes:
      "First vaccinations · dewormed · microchipped · airway-checked · one-year health guarantee.",
  },
  {
    name: "Sequoia",
    breedSlug: "bernese-mountain-dog",
    sex: "Female",
    color: "Tri-color",
    weeks: 7,
    price: 3500,
    status: "AVAILABLE",
    featured: true,
    description:
      "A teddy bear with the classic Bernese blaze. Sequoia is gentle and unflappable — thunderstorms, vacuums, and toddlers alike leave her unbothered.",
    vetNotes:
      "First vaccinations · dewormed · microchipped · OFA-tested lineage · two-year health guarantee.",
  },
  {
    name: "Gus",
    breedSlug: "bernese-mountain-dog",
    sex: "Male",
    color: "Tri-color",
    weeks: 7,
    price: 3400,
    status: "SOLD",
    description:
      "Our biggest boy, off to a lovely family in the valley. Gus was the cuddler of the litter and set the bar for good manners.",
    vetNotes: "Fully vaccinated for age · microchipped · vet-checked.",
  },
  {
    name: "Willa",
    breedSlug: "australian-shepherd",
    sex: "Female",
    color: "Blue Merle",
    weeks: 9,
    price: 2600,
    status: "AVAILABLE",
    description:
      "One blue eye, one brown, and a brain that never stops. Willa is looking for an active home with a job to do — agility, hiking, or herding the kids.",
    vetNotes:
      "First vaccinations · dewormed · microchipped · eye-cleared parents · health guarantee.",
  },
  {
    name: "Fitz",
    breedSlug: "goldendoodle",
    sex: "Male",
    color: "Apricot",
    weeks: 10,
    price: 3100,
    status: "RESERVED",
    description:
      "A honey-colored bundle of curls with a heart of gold. Fitz is F1b, low-shedding, and already offering his paw for a shake.",
    vetNotes:
      "Fully vaccinated for age · dewormed · microchipped · health guarantee.",
  },
  {
    name: "Poppy",
    breedSlug: "goldendoodle",
    sex: "Female",
    color: "Red",
    weeks: 10,
    price: 3300,
    status: "AVAILABLE",
    description:
      "A firecracker with a feather-soft coat. Poppy loves water, fetch, and being the center of attention — a joyful pick for a lively household.",
    vetNotes:
      "Fully vaccinated for age · dewormed · microchipped · health guarantee.",
  },
];

async function main() {
  console.log("Seeding…");

  // Admin user
  const email = (process.env.ADMIN_EMAIL ?? "admin@willowbrook.test").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`  admin ready → ${email}`);

  // Clean catalog for idempotent reseeds
  await prisma.puppyImage.deleteMany();
  await prisma.puppy.deleteMany();
  await prisma.breed.deleteMany();

  const breedIds: Record<string, string> = {};
  for (const b of BREEDS) {
    const created = await prisma.breed.create({ data: b });
    breedIds[b.slug] = created.id;
  }
  console.log(`  ${BREEDS.length} breeds created`);

  let photoCount = 0;
  for (const p of PUPPIES) {
    const photos = await fetchDogPhotos(p.breedSlug, 2);
    photoCount += photos.length;
    await prisma.puppy.create({
      data: {
        name: p.name,
        breedId: breedIds[p.breedSlug],
        sex: p.sex,
        color: p.color,
        birthDate: weeksAgo(p.weeks),
        priceCents: p.price * 100,
        status: p.status,
        featured: p.featured ?? false,
        description: p.description,
        vetNotes: p.vetNotes,
        images: {
          create: photos.map((url, i) => ({
            url,
            type: "image",
            alt: `${p.name}, a ${p.breedSlug.replace(/-/g, " ")}`,
            sortOrder: i,
          })),
        },
      },
    });
  }
  console.log(`  ${PUPPIES.length} puppies created (${photoCount} real photos)`);
  console.log("Done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
