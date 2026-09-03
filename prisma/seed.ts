import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function weeksAgo(weeks: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  return d;
}

/** Small deterministic PRNG so every reseed produces the same catalog. */
function rngFor(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Run `fn` over `items` with at most `limit` in flight at once. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      for (;;) {
        const i = cursor++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    },
  );
  await Promise.all(workers);
  return out;
}

/* ------------------------------------------------------------------ */
/*  Photos: the free dog.ceo API                                       */
/* ------------------------------------------------------------------ */

/**
 * Fetch up to `n` distinct real photos for a dog.ceo breed path
 * (e.g. "retriever/golden"). Best-effort: returns [] if the API is down so a
 * seed never fails over a picture, the illustrated portrait covers for it.
 */
async function fetchDogPhotos(apiPath: string, n: number): Promise<string[]> {
  const urls = new Set<string>();
  for (let attempt = 0; attempt < 2 && urls.size < n; attempt++) {
    try {
      const res = await fetch(
        `https://dog.ceo/api/breed/${apiPath}/images/random/${n + 4}`,
        { signal: AbortSignal.timeout(15_000) },
      );
      if (!res.ok) continue;
      const body = (await res.json()) as { message: string[]; status: string };
      if (!Array.isArray(body.message)) continue;
      for (const url of body.message) urls.add(url);
    } catch {
      // network hiccup: fall through to the next attempt
    }
  }
  return [...urls].slice(0, n);
}

/** Hand a photo out for slot `i`, cycling if the API returned fewer. */
function pick(photos: string[], i: number): string | undefined {
  return photos.length ? photos[i % photos.length] : undefined;
}

/* ------------------------------------------------------------------ */
/*  Breed catalog                                                      */
/* ------------------------------------------------------------------ */

type SeedBreed = {
  slug: string;
  name: string;
  group: string;
  size: "Small" | "Medium" | "Large";
  temperament: string;
  description: string;
  /** dog.ceo path used to pull real photos, e.g. "retriever/golden". */
  api: string;
  /** Typical colors, used when generating a litter. */
  colors: string[];
  /** Typical asking price in dollars. */
  price: number;
  /** How many puppies to generate on top of the hand-written ones. */
  litter: number;
};

const BREEDS: SeedBreed[] = [
  /* ---------------------------- Sporting ---------------------------- */
  {
    slug: "golden-retriever",
    name: "Golden Retriever",
    group: "Sporting",
    size: "Large",
    temperament: "Gentle, eager to please, endlessly patient with children",
    description:
      "The Golden is the quintessential family dog, devoted, playful, and soft-mouthed enough to carry an egg without cracking it. Ours are raised underfoot in the kitchen so they arrive confident and well-mannered.",
    api: "retriever/golden",
    colors: ["Cream", "Golden", "Dark Golden"],
    price: 3200,
    litter: 0,
  },
  {
    slug: "labrador-retriever",
    name: "Labrador Retriever",
    group: "Sporting",
    size: "Large",
    temperament: "Outgoing, even-tempered, tireless in water",
    description:
      "America's favourite dog for good reason: biddable, athletic, and almost impossible to offend. A Lab will happily swim all morning and then fall asleep across your feet all evening.",
    api: "labrador",
    colors: ["Black", "Yellow", "Chocolate", "Fox Red"],
    price: 2400,
    litter: 3,
  },
  {
    slug: "cocker-spaniel",
    name: "Cocker Spaniel",
    group: "Sporting",
    size: "Medium",
    temperament: "Merry, soft-hearted, always close by",
    description:
      "Silky ears, a tail that never stops, and a sweetness that has kept the Cocker in family homes for a century. They want company more than they want acreage.",
    api: "spaniel/cocker",
    colors: ["Buff", "Black", "Chocolate Roan", "Parti-color"],
    price: 2200,
    litter: 2,
  },
  {
    slug: "english-springer-spaniel",
    name: "English Springer Spaniel",
    group: "Sporting",
    size: "Medium",
    temperament: "Cheerful, birdy, quick to learn",
    description:
      "A working spaniel with an off switch. Springers are happiest with a morning in the field and an afternoon on the sofa, and they take to training like it is a game.",
    api: "springer/english",
    colors: ["Liver and White", "Black and White", "Tri-color"],
    price: 2100,
    litter: 2,
  },
  {
    slug: "german-shorthaired-pointer",
    name: "German Shorthaired Pointer",
    group: "Sporting",
    size: "Large",
    temperament: "Athletic, affectionate, built for the long day",
    description:
      "A genuinely versatile gundog, elegant on point and goofy at home. GSPs need real exercise; give them that and they are among the easiest dogs to live with.",
    api: "pointer/german",
    colors: ["Liver Roan", "Liver and White", "Liver Ticked"],
    price: 2000,
    litter: 2,
  },
  {
    slug: "vizsla",
    name: "Vizsla",
    group: "Sporting",
    size: "Medium",
    temperament: "Velcro-close, sensitive, endlessly energetic",
    description:
      "The 'velcro dog' of the sporting group, a burnished rust hound that would rather be leaning on you than anywhere else. Sensitive to a raised voice and brilliant with a kind one.",
    api: "vizsla",
    colors: ["Golden Rust", "Russet Gold"],
    price: 2600,
    litter: 1,
  },
  {
    slug: "weimaraner",
    name: "Weimaraner",
    group: "Sporting",
    size: "Large",
    temperament: "Bold, devoted, famously shadow-like",
    description:
      "The Grey Ghost: sleek, fast, and deeply attached to its people. Weims want a job and a family that is home often, and they repay both with dramatic loyalty.",
    api: "weimaraner",
    colors: ["Silver Gray", "Mouse Gray", "Blue"],
    price: 2300,
    litter: 1,
  },
  {
    slug: "irish-setter",
    name: "Irish Setter",
    group: "Sporting",
    size: "Large",
    temperament: "Exuberant, sweet-natured, slow to grow up",
    description:
      "A mahogany showstopper with the humour to match. Setters stay puppyish for years, which is either the best or the worst thing about them depending on your week.",
    api: "setter/irish",
    colors: ["Mahogany", "Chestnut"],
    price: 2500,
    litter: 1,
  },
  {
    slug: "brittany",
    name: "Brittany",
    group: "Sporting",
    size: "Medium",
    temperament: "Bright, biddable, happiest with a job",
    description:
      "Compact, tireless, and unfailingly agreeable, the Brittany packs a full-size gundog into a mid-size frame. A wonderful fit for a hiking, running, hunting household.",
    api: "spaniel/brittany",
    colors: ["Orange and White", "Liver and White", "Roan"],
    price: 1900,
    litter: 1,
  },

  /* ----------------------------- Hound ------------------------------ */
  {
    slug: "beagle",
    name: "Beagle",
    group: "Hound",
    size: "Small",
    temperament: "Merry, curious, led entirely by the nose",
    description:
      "A pocket-sized pack hound with a voice bigger than its body. Beagles are wonderful with children and other dogs, and they will follow a scent straight through your good intentions.",
    api: "beagle",
    colors: ["Tri-color", "Lemon and White", "Red and White"],
    price: 1400,
    litter: 3,
  },
  {
    slug: "dachshund",
    name: "Dachshund",
    group: "Hound",
    size: "Small",
    temperament: "Bold, comic, convinced of its own size",
    description:
      "Bred to go to ground after badger, which explains the courage and the digging. A Dachshund is a large dog running on very short legs, and it will tell you so.",
    api: "dachshund",
    colors: ["Red", "Black and Tan", "Dapple", "Cream"],
    price: 1800,
    litter: 3,
  },
  {
    slug: "basset-hound",
    name: "Basset Hound",
    group: "Hound",
    size: "Medium",
    temperament: "Placid, stubborn, wonderfully unhurried",
    description:
      "Long ears, low centre of gravity, and a nose second only to the Bloodhound. Bassets are easygoing housemates who would like you to know that they will get there eventually.",
    api: "hound/basset",
    colors: ["Tri-color", "Lemon and White", "Red and White"],
    price: 1600,
    litter: 2,
  },
  {
    slug: "bloodhound",
    name: "Bloodhound",
    group: "Hound",
    size: "Large",
    temperament: "Gentle, dogged, unstoppable on a trail",
    description:
      "The finest nose in the dog world attached to one of its kindest characters. Bloodhounds are patient with children, hopeless at recall, and worth every drooled-on shirt.",
    api: "hound/blood",
    colors: ["Liver and Tan", "Black and Tan", "Red"],
    price: 1900,
    litter: 1,
  },
  {
    slug: "whippet",
    name: "Whippet",
    group: "Hound",
    size: "Medium",
    temperament: "Quiet indoors, rocket-fast outdoors",
    description:
      "Thirty seconds of blistering speed followed by four hours under a blanket. Whippets are among the calmest housedogs there are, provided they get their sprint.",
    api: "whippet",
    colors: ["Brindle", "Fawn", "Blue", "Black and White"],
    price: 2000,
    litter: 2,
  },
  {
    slug: "afghan-hound",
    name: "Afghan Hound",
    group: "Hound",
    size: "Large",
    temperament: "Aloof, dignified, quietly funny",
    description:
      "An ancient sighthound with a silk coat and an independent mind. Afghans give affection on their own terms, which makes earning it all the more satisfying.",
    api: "hound/afghan",
    colors: ["Cream", "Black Masked Red", "Brindle"],
    price: 2800,
    litter: 1,
  },
  {
    slug: "rhodesian-ridgeback",
    name: "Rhodesian Ridgeback",
    group: "Hound",
    size: "Large",
    temperament: "Composed, brave, devoted to its own people",
    description:
      "Named for the ridge of backward-growing hair along the spine. Ridgebacks are quiet, self-possessed guardians who are far softer at home than their history suggests.",
    api: "ridgeback/rhodesian",
    colors: ["Light Wheaten", "Red Wheaten"],
    price: 2400,
    litter: 2,
  },
  {
    slug: "irish-wolfhound",
    name: "Irish Wolfhound",
    group: "Hound",
    size: "Large",
    temperament: "Serene, gentle, enormous of heart",
    description:
      "The tallest of all breeds and among the gentlest. A Wolfhound asks for a soft place to lie, a daily amble, and the company of the family it adores.",
    api: "wolfhound/irish",
    colors: ["Gray", "Wheaten", "Brindle"],
    price: 3000,
    litter: 1,
  },
  {
    slug: "basenji",
    name: "Basenji",
    group: "Hound",
    size: "Small",
    temperament: "Clever, tidy, catlike and barkless",
    description:
      "The barkless dog of Central Africa: fastidious, quick-witted, and full of opinions it expresses in yodels. Not a beginner's dog, but a fascinating one.",
    api: "basenji",
    colors: ["Red and White", "Tri-color", "Brindle"],
    price: 2200,
    litter: 1,
  },

  /* ---------------------------- Working ----------------------------- */
  {
    slug: "bernese-mountain-dog",
    name: "Bernese Mountain Dog",
    group: "Working",
    size: "Large",
    temperament: "Calm, loyal, gentle giant",
    description:
      "Striking tri-color coats and a temperament as steady as the Alps they hail from. Berners bond deeply with their families and love cool weather and open space.",
    api: "mountain/bernese",
    colors: ["Tri-color"],
    price: 3500,
    litter: 0,
  },
  {
    slug: "boxer",
    name: "Boxer",
    group: "Working",
    size: "Large",
    temperament: "Playful, loyal, permanently adolescent",
    description:
      "A clown in a working dog's body. Boxers are patient with children, watchful with strangers, and will still be bouncing at seven years old.",
    api: "boxer",
    colors: ["Fawn", "Brindle", "Flashy Fawn"],
    price: 2200,
    litter: 2,
  },
  {
    slug: "rottweiler",
    name: "Rottweiler",
    group: "Working",
    size: "Large",
    temperament: "Confident, steady, quietly protective",
    description:
      "A Roman drover's dog with a calm, self-assured nature. Well-bred and well-raised, a Rottweiler is a thinking guardian rather than a reactive one.",
    api: "rottweiler",
    colors: ["Black and Rust", "Black and Mahogany"],
    price: 2500,
    litter: 2,
  },
  {
    slug: "siberian-husky",
    name: "Siberian Husky",
    group: "Working",
    size: "Large",
    temperament: "Friendly, mischievous, born to run",
    description:
      "Bred to pull a light load over long distances, and it shows. Huskies are famously friendly to everyone, escape artists by hobby, and need a securely fenced life.",
    api: "husky",
    colors: ["Black and White", "Agouti", "Copper", "Gray and White"],
    price: 2300,
    litter: 3,
  },
  {
    slug: "alaskan-malamute",
    name: "Alaskan Malamute",
    group: "Working",
    size: "Large",
    temperament: "Powerful, affectionate, cheerfully stubborn",
    description:
      "The freight hauler of the Arctic: heavier and more dignified than the Husky, and just as devoted to its people. Bring a good brush and a cold-weather habit.",
    api: "malamute",
    colors: ["Gray and White", "Seal and White", "Red and White"],
    price: 2600,
    litter: 1,
  },
  {
    slug: "great-dane",
    name: "Great Dane",
    group: "Working",
    size: "Large",
    temperament: "Sweet, leaning, unaware of its size",
    description:
      "A hundred and fifty pounds of lapdog. Danes are gentle, sensitive, and moderate in exercise needs; the only oversized thing about them is the furniture bill.",
    api: "dane/great",
    colors: ["Harlequin", "Blue", "Fawn", "Mantle"],
    price: 2800,
    litter: 2,
  },
  {
    slug: "doberman-pinscher",
    name: "Doberman Pinscher",
    group: "Working",
    size: "Large",
    temperament: "Alert, intelligent, deeply attached",
    description:
      "Elegant, fast, and famously trainable. A modern Doberman is a family dog first, with a protective streak that stays sensible when it is socialised early.",
    api: "doberman",
    colors: ["Black and Rust", "Red and Rust", "Blue"],
    price: 2700,
    litter: 1,
  },
  {
    slug: "newfoundland",
    name: "Newfoundland",
    group: "Working",
    size: "Large",
    temperament: "Sweet-tempered, patient, born lifeguard",
    description:
      "A water rescue dog with webbed feet and the disposition of a nanny. Newfs are calm, slow-moving, and remarkably tolerant of small children.",
    api: "newfoundland",
    colors: ["Black", "Landseer", "Brown"],
    price: 3000,
    litter: 1,
  },
  {
    slug: "saint-bernard",
    name: "Saint Bernard",
    group: "Working",
    size: "Large",
    temperament: "Placid, watchful, famously kind",
    description:
      "The alpine rescue dog of legend: enormous, unhurried, and endlessly forgiving. Give a Saint cool floors, a modest walk, and a family to keep an eye on.",
    api: "stbernard",
    colors: ["Red and White", "Brindle and White"],
    price: 2900,
    litter: 1,
  },
  {
    slug: "samoyed",
    name: "Samoyed",
    group: "Working",
    size: "Medium",
    temperament: "Sociable, smiling, cheerfully vocal",
    description:
      "The Sammy smile is real, and so is the coat. A Samoyed wants to be in the middle of everything the family does, preferably while talking about it.",
    api: "samoyed",
    colors: ["White", "Biscuit", "Cream"],
    price: 3200,
    litter: 2,
  },
  {
    slug: "great-pyrenees",
    name: "Great Pyrenees",
    group: "Working",
    size: "Large",
    temperament: "Serene, independent, quietly vigilant",
    description:
      "A livestock guardian bred to think for itself on a mountainside. Pyrs are gentle and patient at home, nocturnal by instinct, and never quite off duty.",
    api: "pyrenees",
    colors: ["White", "Badger-marked", "Gray-marked"],
    price: 2400,
    litter: 1,
  },
  {
    slug: "leonberger",
    name: "Leonberger",
    group: "Working",
    size: "Large",
    temperament: "Steady, playful, unshakably good-natured",
    description:
      "A lion of a dog with a soft, waterproof coat and a level head. Leos are confident without being pushy and adore a job that involves the family.",
    api: "leonberg",
    colors: ["Lion Yellow", "Red Brown", "Sandy"],
    price: 3400,
    litter: 1,
  },

  /* ---------------------------- Terrier ----------------------------- */
  {
    slug: "west-highland-white-terrier",
    name: "West Highland White Terrier",
    group: "Terrier",
    size: "Small",
    temperament: "Chipper, self-assured, endlessly game",
    description:
      "A small white Scot with a large opinion. Westies are hardy, funny, and far tougher than their tidy appearance suggests.",
    api: "terrier/westhighland",
    colors: ["White"],
    price: 1900,
    litter: 2,
  },
  {
    slug: "scottish-terrier",
    name: "Scottish Terrier",
    group: "Terrier",
    size: "Small",
    temperament: "Dignified, independent, quietly devoted",
    description:
      "The Scottie is a serious little dog that chooses its people carefully and then never wavers. Expect loyalty rather than fawning.",
    api: "terrier/scottish",
    colors: ["Black", "Wheaten", "Brindle"],
    price: 2000,
    litter: 1,
  },
  {
    slug: "airedale-terrier",
    name: "Airedale Terrier",
    group: "Terrier",
    size: "Large",
    temperament: "Clever, bold, incurably curious",
    description:
      "The King of Terriers: big, versatile, and inventive to a fault. An Airedale that is bored will find its own entertainment, so keep the brain busy.",
    api: "airedale",
    colors: ["Black and Tan", "Grizzle and Tan"],
    price: 2200,
    litter: 1,
  },
  {
    slug: "cairn-terrier",
    name: "Cairn Terrier",
    group: "Terrier",
    size: "Small",
    temperament: "Busy, cheerful, up for anything",
    description:
      "A shaggy working terrier from the Scottish highlands, small enough for a flat and rugged enough for a farm. Toto was one, which tells you about the character.",
    api: "terrier/cairn",
    colors: ["Wheaten", "Brindle", "Gray"],
    price: 1800,
    litter: 2,
  },
  {
    slug: "jack-russell-terrier",
    name: "Jack Russell Terrier",
    group: "Terrier",
    size: "Small",
    temperament: "Fearless, tireless, sharp as a tack",
    description:
      "Ten pounds of pure engine. Jacks need a job, a fence, and a family with a sense of humour, and they will out-think all three.",
    api: "terrier/russell",
    colors: ["White and Tan", "Tri-color", "Black and White"],
    price: 1500,
    litter: 3,
  },
  {
    slug: "soft-coated-wheaten-terrier",
    name: "Soft Coated Wheaten Terrier",
    group: "Terrier",
    size: "Medium",
    temperament: "Exuberant, friendly, famously bouncy",
    description:
      "A terrier that greets everyone as a friend, complete with the signature Wheaten leap. The silky coat sheds little but asks for regular grooming.",
    api: "terrier/wheaten",
    colors: ["Wheaten"],
    price: 2400,
    litter: 1,
  },
  {
    slug: "miniature-schnauzer",
    name: "Miniature Schnauzer",
    group: "Terrier",
    size: "Small",
    temperament: "Spirited, alert, deeply people-oriented",
    description:
      "Whiskers, eyebrows, and an excellent doorbell. Minis are smart, low-shedding, and want to be involved in every single thing you do.",
    api: "schnauzer/miniature",
    colors: ["Salt and Pepper", "Black Silver", "Black"],
    price: 1900,
    litter: 2,
  },
  {
    slug: "border-terrier",
    name: "Border Terrier",
    group: "Terrier",
    size: "Small",
    temperament: "Plucky, affectionate, unusually easygoing",
    description:
      "The most companionable of the working terriers: hardy on a hill walk, sensible in the house, and good-natured with children and dogs alike.",
    api: "terrier/border",
    colors: ["Grizzle and Tan", "Red", "Blue and Tan"],
    price: 1800,
    litter: 1,
  },
  {
    slug: "staffordshire-bull-terrier",
    name: "Staffordshire Bull Terrier",
    group: "Terrier",
    size: "Medium",
    temperament: "Affectionate, brave, famously fond of children",
    description:
      "Known at home as the nanny dog for its patience with families. A well-bred Staffy is muscular, silly, and desperate to be close to you.",
    api: "bullterrier/staffordshire",
    colors: ["Brindle", "Fawn", "Black and White"],
    price: 2000,
    litter: 1,
  },

  /* ------------------------------ Toy ------------------------------- */
  {
    slug: "cavalier-king-charles-spaniel",
    name: "Cavalier King Charles Spaniel",
    group: "Toy",
    size: "Small",
    temperament: "Affectionate, adaptable, happiest in a lap",
    description:
      "A regal little companion with the heart of a spaniel and the manners of a courtier. Cavaliers thrive on closeness and suit apartments and farmhouses alike.",
    api: "spaniel/blenheim",
    colors: ["Blenheim", "Tri-color", "Ruby", "Black and Tan"],
    price: 2800,
    litter: 1,
  },
  {
    slug: "pomeranian",
    name: "Pomeranian",
    group: "Toy",
    size: "Small",
    temperament: "Vivacious, bold, a spitz in miniature",
    description:
      "A tiny sled dog in a fox coat. Poms are bright, showy, and entirely convinced they are the largest animal in the room.",
    api: "pomeranian",
    colors: ["Orange", "Cream", "Black", "Sable"],
    price: 2600,
    litter: 2,
  },
  {
    slug: "pug",
    name: "Pug",
    group: "Toy",
    size: "Small",
    temperament: "Charming, mischievous, born to amuse",
    description:
      "Multum in parvo, a lot of dog in a small space. Pugs live for company and comedy, and they would like to be under the blanket with you, please.",
    api: "pug",
    colors: ["Fawn", "Black", "Silver Fawn"],
    price: 2000,
    litter: 2,
  },
  {
    slug: "chihuahua",
    name: "Chihuahua",
    group: "Toy",
    size: "Small",
    temperament: "Sassy, loyal, one-person devoted",
    description:
      "The smallest breed with the biggest attitude. Chihuahuas attach fiercely to a favourite human and prefer a warm sleeve to a cold morning.",
    api: "chihuahua",
    colors: ["Fawn", "Chocolate", "Merle", "Cream"],
    price: 1600,
    litter: 3,
  },
  {
    slug: "maltese",
    name: "Maltese",
    group: "Toy",
    size: "Small",
    temperament: "Gentle, playful, unfailingly sweet",
    description:
      "A companion dog for two thousand years and it shows. The Maltese is fearless for its size, low-shedding, and delighted by absolutely everyone.",
    api: "maltese",
    colors: ["White"],
    price: 2400,
    litter: 2,
  },
  {
    slug: "yorkshire-terrier",
    name: "Yorkshire Terrier",
    group: "Toy",
    size: "Small",
    temperament: "Feisty, affectionate, a terrier at heart",
    description:
      "A silk-coated toy that has never been told it stopped being a ratter. Yorkies are portable, opinionated, and devoted to their person.",
    api: "terrier/yorkshire",
    colors: ["Blue and Tan", "Black and Gold"],
    price: 2500,
    litter: 2,
  },
  {
    slug: "shih-tzu",
    name: "Shih Tzu",
    group: "Toy",
    size: "Small",
    temperament: "Outgoing, affectionate, bred for the lap",
    description:
      "A Tibetan temple dog turned imperial companion. The Shih Tzu has no job other than your company and performs it beautifully.",
    api: "shihtzu",
    colors: ["Gold and White", "Brindle", "Black and White"],
    price: 2200,
    litter: 2,
  },
  {
    slug: "papillon",
    name: "Papillon",
    group: "Toy",
    size: "Small",
    temperament: "Bright, athletic, surprisingly sporty",
    description:
      "Butterfly ears on one of the cleverest toy dogs alive. Papillons excel at agility and obedience and are far hardier than they look.",
    api: "papillon",
    colors: ["White and Sable", "Black and White", "Tri-color"],
    price: 2300,
    litter: 1,
  },
  {
    slug: "italian-greyhound",
    name: "Italian Greyhound",
    group: "Toy",
    size: "Small",
    temperament: "Sensitive, affectionate, heat-seeking",
    description:
      "A sighthound shrunk to lap size, all elegance and warm-blanket instinct. IGs sprint in bursts and then melt into the nearest sunbeam.",
    api: "greyhound/italian",
    colors: ["Fawn", "Blue", "Seal", "Cream"],
    price: 2500,
    litter: 1,
  },
  {
    slug: "havanese",
    name: "Havanese",
    group: "Toy",
    size: "Small",
    temperament: "Cheerful, clever, a natural shadow",
    description:
      "Cuba's national dog: silky, low-shedding, and happiest trotting from room to room after its family. A wonderful first small dog.",
    api: "havanese",
    colors: ["Sable", "Chocolate", "Parti-color", "Cream"],
    price: 2400,
    litter: 2,
  },
  {
    slug: "toy-poodle",
    name: "Toy Poodle",
    group: "Toy",
    size: "Small",
    temperament: "Brilliant, sensitive, eager to work",
    description:
      "All the Poodle intelligence in a five-kilo package. Toys are quick to train, low-shedding, and tuned closely to their person's mood.",
    api: "poodle/toy",
    colors: ["Apricot", "Silver", "Black", "Cream"],
    price: 2600,
    litter: 2,
  },
  {
    slug: "pekingese",
    name: "Pekingese",
    group: "Toy",
    size: "Small",
    temperament: "Regal, self-possessed, loyal to a chosen few",
    description:
      "Bred for Chinese emperors and quite aware of it. The Peke is dignified, courageous, and affectionate on its own imperial schedule.",
    api: "pekinese",
    colors: ["Red Sable", "Cream", "Black Masked Fawn"],
    price: 2100,
    litter: 1,
  },

  /* -------------------------- Non-Sporting -------------------------- */
  {
    slug: "french-bulldog",
    name: "French Bulldog",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Comical, easygoing, quietly stubborn",
    description:
      "All personality in a compact frame. The Frenchie is a low-exercise charmer that would rather make you laugh than take a long hike, a wonderful city companion.",
    api: "bulldog/french",
    colors: ["Blue Fawn", "Cream", "Brindle", "Pied"],
    price: 4500,
    litter: 0,
  },
  {
    slug: "english-bulldog",
    name: "English Bulldog",
    group: "Non-Sporting",
    size: "Medium",
    temperament: "Kind, courageous, immovably calm",
    description:
      "A gruff exterior over one of the softest temperaments in dogdom. Bulldogs are couch specialists who adore children and dislike heat.",
    api: "bulldog/english",
    colors: ["Red Brindle", "White", "Fawn and White"],
    price: 3800,
    litter: 1,
  },
  {
    slug: "boston-terrier",
    name: "Boston Terrier",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Lively, bright, impeccably mannered",
    description:
      "The American Gentleman in his tuxedo markings. Bostons are compact, funny, and adaptable to nearly any household.",
    api: "bulldog/boston",
    colors: ["Black and White", "Seal and White", "Brindle and White"],
    price: 2000,
    litter: 2,
  },
  {
    slug: "dalmatian",
    name: "Dalmatian",
    group: "Non-Sporting",
    size: "Large",
    temperament: "Energetic, dignified, born to travel",
    description:
      "The original carriage dog, built to trot for miles beside horses. Dals want a running partner and repay one with striking looks and dry humour.",
    api: "dalmatian",
    colors: ["White with Black Spots", "Liver Spotted"],
    price: 2100,
    litter: 2,
  },
  {
    slug: "standard-poodle",
    name: "Standard Poodle",
    group: "Non-Sporting",
    size: "Large",
    temperament: "Exceptionally smart, dignified, secretly silly",
    description:
      "Behind the show clip is a serious water retriever and one of the brightest dogs alive. Standards are athletic, low-shedding, and endlessly trainable.",
    api: "poodle/standard",
    colors: ["Silver", "Apricot", "Black", "Cafe au Lait"],
    price: 2900,
    litter: 2,
  },
  {
    slug: "chow-chow",
    name: "Chow Chow",
    group: "Non-Sporting",
    size: "Medium",
    temperament: "Reserved, clean, cat-like in its independence",
    description:
      "A lion-maned ancient breed with a blue-black tongue and a mind of its own. Chows are undemonstrative but profoundly loyal to their household.",
    api: "chow",
    colors: ["Red", "Cinnamon", "Black", "Cream"],
    price: 2600,
    litter: 1,
  },
  {
    slug: "bichon-frise",
    name: "Bichon Frise",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Merry, gentle, a natural charmer",
    description:
      "A powder-puff companion with a genuinely sunny outlook. Bichons are low-shedding, easy with strangers, and made for family life.",
    api: "frise/bichon",
    colors: ["White", "White and Apricot"],
    price: 2200,
    litter: 2,
  },
  {
    slug: "shiba-inu",
    name: "Shiba Inu",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Spirited, fastidious, charmingly aloof",
    description:
      "Japan's little brushwood dog: fox-faced, immaculate, and famously self-directed. A Shiba respects a household with clear, kind rules.",
    api: "shiba",
    colors: ["Red", "Sesame", "Black and Tan", "Cream"],
    price: 3000,
    litter: 2,
  },
  {
    slug: "lhasa-apso",
    name: "Lhasa Apso",
    group: "Non-Sporting",
    size: "Small",
    temperament: "Confident, comic, a watchdog in miniature",
    description:
      "Bred to guard Tibetan monasteries and still convinced of the assignment. Lhasas are hardy, funny, and devoted to the people they know.",
    api: "lhasa",
    colors: ["Gold", "Grizzle", "Cream"],
    price: 2000,
    litter: 1,
  },
  {
    slug: "keeshond",
    name: "Keeshond",
    group: "Non-Sporting",
    size: "Medium",
    temperament: "Friendly, expressive, the smiling Dutchman",
    description:
      "A Dutch barge dog with spectacles of dark shading around the eyes. Keeshonden are people-focused, sociable, and wonderfully easy to live with.",
    api: "keeshond",
    colors: ["Silver and Black", "Gray and Cream"],
    price: 2200,
    litter: 1,
  },

  /* ---------------------------- Herding ----------------------------- */
  {
    slug: "australian-shepherd",
    name: "Australian Shepherd",
    group: "Herding",
    size: "Medium",
    temperament: "Bright, driven, deeply bonded",
    description:
      "A thinking dog that wants a job. Aussies reward active families with dazzling agility, trainability, and a merle coat no two of which are ever alike.",
    api: "australian/shepherd",
    colors: ["Blue Merle", "Red Merle", "Black Tri", "Red Tri"],
    price: 2600,
    litter: 1,
  },
  {
    slug: "german-shepherd",
    name: "German Shepherd",
    group: "Herding",
    size: "Large",
    temperament: "Courageous, loyal, endlessly capable",
    description:
      "The world's working dog: police, service, search, and family. A German Shepherd needs training and purpose, and gives back devotion without limit.",
    api: "german/shepherd",
    colors: ["Black and Red", "Sable", "Black and Tan", "Bicolor"],
    price: 2500,
    litter: 3,
  },
  {
    slug: "border-collie",
    name: "Border Collie",
    group: "Herding",
    size: "Medium",
    temperament: "Brilliant, intense, never off the clock",
    description:
      "Widely held to be the smartest breed there is, which is a warning as much as a compliment. Borders need work for the body and puzzles for the mind.",
    api: "collie/border",
    colors: ["Black and White", "Red Merle", "Blue Merle", "Tri-color"],
    price: 2200,
    litter: 2,
  },
  {
    slug: "pembroke-welsh-corgi",
    name: "Pembroke Welsh Corgi",
    group: "Herding",
    size: "Small",
    temperament: "Bold, bright, a big dog on short legs",
    description:
      "A cattle drover in a compact package, sturdy, vocal, and very funny. Corgis are smart enough to train themselves if you are not paying attention.",
    api: "pembroke",
    colors: ["Red and White", "Sable", "Tri-color", "Fawn"],
    price: 2800,
    litter: 2,
  },
  {
    slug: "cardigan-welsh-corgi",
    name: "Cardigan Welsh Corgi",
    group: "Herding",
    size: "Small",
    temperament: "Even-tempered, watchful, steady company",
    description:
      "The older of the two corgi breeds, distinguished by its long fox tail. Cardigans are a touch more reserved than Pembrokes and just as devoted.",
    api: "corgi/cardigan",
    colors: ["Brindle", "Blue Merle", "Black and White", "Red"],
    price: 2600,
    litter: 1,
  },
  {
    slug: "shetland-sheepdog",
    name: "Shetland Sheepdog",
    group: "Herding",
    size: "Small",
    temperament: "Sensitive, quick, eager to please",
    description:
      "A miniature working collie from the Shetland Isles. Shelties are exceptionally biddable, a little reserved with strangers, and glued to their family.",
    api: "sheepdog/shetland",
    colors: ["Sable and White", "Blue Merle", "Tri-color"],
    price: 2000,
    litter: 2,
  },
  {
    slug: "old-english-sheepdog",
    name: "Old English Sheepdog",
    group: "Herding",
    size: "Large",
    temperament: "Amiable, bumbling, gently protective",
    description:
      "A shaggy, ambling drover with a famous bear-like gait. OES are affectionate clowns who will herd your children if left to their own devices.",
    api: "sheepdog/english",
    colors: ["Gray and White", "Blue Merle and White"],
    price: 2700,
    litter: 1,
  },
  {
    slug: "rough-collie",
    name: "Rough Collie",
    group: "Herding",
    size: "Large",
    temperament: "Gentle, responsive, famously loyal",
    description:
      "The Lassie collie: sensitive, elegant, and easy to train with a kind voice. Rough Collies are among the softest-natured herding dogs.",
    api: "rough/collie",
    colors: ["Sable and White", "Tri-color", "Blue Merle"],
    price: 2300,
    litter: 1,
  },
  {
    slug: "belgian-malinois",
    name: "Belgian Malinois",
    group: "Herding",
    size: "Large",
    temperament: "Intense, tireless, exceptionally trainable",
    description:
      "The choice of military and police handlers worldwide. A Malinois is a serious commitment and an extraordinary partner for the right experienced home.",
    api: "malinois",
    colors: ["Fawn with Black Mask", "Mahogany", "Red Sable"],
    price: 2400,
    litter: 1,
  },
  {
    slug: "australian-cattle-dog",
    name: "Australian Cattle Dog",
    group: "Herding",
    size: "Medium",
    temperament: "Hardy, clever, relentlessly loyal",
    description:
      "The Blue Heeler: bred to move stubborn cattle across hard country and just as determined at home. Give it work, and it will never let you down.",
    api: "cattledog/australian",
    colors: ["Blue Speckled", "Red Speckled", "Blue Mottled"],
    price: 1900,
    litter: 2,
  },

  /* ----------------------------- Hybrid ----------------------------- */
  {
    slug: "goldendoodle",
    name: "Goldendoodle",
    group: "Hybrid",
    size: "Medium",
    temperament: "Sociable, clever, low-shedding",
    description:
      "The sunny disposition of a Golden with the low-shedding coat of a Poodle. Our doodles are F1b, gently curled, and a thoughtful choice for allergy-conscious homes.",
    api: "labradoodle",
    colors: ["Apricot", "Red", "Cream", "Caramel"],
    price: 3100,
    litter: 0,
  },
  {
    slug: "labradoodle",
    name: "Labradoodle",
    group: "Hybrid",
    size: "Medium",
    temperament: "Friendly, biddable, up for the day",
    description:
      "Lab enthusiasm in a lower-shedding coat. Labradoodles are outgoing, water-loving, and a popular pick for busy family households.",
    api: "labradoodle",
    colors: ["Chocolate", "Caramel", "Cream", "Black"],
    price: 2900,
    litter: 2,
  },
  {
    slug: "cockapoo",
    name: "Cockapoo",
    group: "Hybrid",
    size: "Small",
    temperament: "Merry, affectionate, easy to please",
    description:
      "One of the oldest and best-loved crosses: Cocker sweetness, Poodle brains, and a coat that suits allergy-conscious homes.",
    api: "cockapoo",
    colors: ["Apricot", "Chocolate", "Black and White", "Roan"],
    price: 2400,
    litter: 2,
  },
  {
    slug: "cavapoo",
    name: "Cavapoo",
    group: "Hybrid",
    size: "Small",
    temperament: "Gentle, cuddly, wonderfully adaptable",
    description:
      "Cavalier softness with a Poodle coat. Cavapoos are small, low-shedding, and among the easiest companions for a first-time owner.",
    api: "cavapoo",
    colors: ["Blenheim", "Ruby", "Apricot", "Tri-color"],
    price: 2700,
    litter: 2,
  },
  {
    slug: "puggle",
    name: "Puggle",
    group: "Hybrid",
    size: "Small",
    temperament: "Playful, curious, comically vocal",
    description:
      "Beagle nose, Pug charm, and a longer muzzle that breathes more easily than either parent's stereotype. A sturdy, humorous little companion.",
    api: "puggle",
    colors: ["Fawn", "Tri-color", "Black"],
    price: 1800,
    litter: 1,
  },
];

/* ------------------------------------------------------------------ */
/*  Puppies                                                            */
/* ------------------------------------------------------------------ */

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

/** Hand-written flagship listings. Everything else is generated below. */
const CURATED_PUPPIES: SeedPuppy[] = [
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
      "A teddy bear with the classic Bernese blaze. Sequoia is gentle and unflappable, thunderstorms, vacuums, and toddlers alike leave her unbothered.",
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
      "One blue eye, one brown, and a brain that never stops. Willa is looking for an active home with a job to do, agility, hiking, or herding the kids.",
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
      "A firecracker with a feather-soft coat. Poppy loves water, fetch, and being the center of attention, a joyful pick for a lively household.",
    vetNotes:
      "Fully vaccinated for age · dewormed · microchipped · health guarantee.",
  },
];

/* --- Litter generator: believable listings for the rest of the barn --- */

const FEMALE_NAMES = [
  "Hazel", "Olive", "Maisie", "Winnifred", "Delphine", "Rosalind", "Bramble",
  "Cleo", "Nell", "Birdie", "Tansy", "Merritt", "Pearl", "Wren", "Saffron",
  "Odette", "Fern", "Lottie", "Ivy", "Cordelia", "Peaches", "Sable", "Mabel",
  "Greta", "Bluebell", "Isolde", "Margot", "Nutmeg", "Thea", "Verity",
  "Zinnia", "Agnes", "Bess", "Cricket", "Dahlia", "Elsie", "Flora", "Ginny",
  "Harriet", "Indigo", "Juno", "Kestrel", "Lark", "Millie", "Opal",
  "Primrose", "Rilla", "Sorrel", "Ursa", "Vesper", "Winnie", "Xanthe",
  "Zelda", "Amaryllis", "Clover", "Daphne", "Echo", "Fable", "Gracie",
  "Honeysuckle", "Iris", "Jubilee", "Katydid", "Lavender", "Meadow", "Nova",
  "Orla", "Petal", "Quince", "Rosemary",
];

const MALE_NAMES = [
  "Barnaby", "Otis", "Rufus", "Silas", "Tobias", "Wendell", "Archie", "Bruno",
  "Cassius", "Dashiell", "Emmett", "Ferris", "Gideon", "Huxley", "Ivor",
  "Jasper", "Knox", "Linus", "Murphy", "Nigel", "Orson", "Percy", "Quincy",
  "Ranger", "Sawyer", "Thatcher", "Ulysses", "Vaughn", "Walter", "Xander",
  "Yates", "Zeke", "Alder", "Brody", "Colby", "Denver", "Everett", "Franklin",
  "Gunnar", "Harlan", "Jericho", "Kip", "Lachlan", "Monty", "Ned", "Oakley",
  "Preston", "Quill", "Roscoe", "Sterling", "Tucker", "Upton", "Vance",
  "Wilbur", "Yarrow", "Zephyr", "Angus", "Boone", "Cedar", "Duffy", "Elmer",
  "Fergus", "Hank", "Ives", "Jonah", "Kearney", "Loyal", "Mercer", "Norrie",
  "Ollie",
];

const HABITS = [
  "carries a stuffed lamb from room to room",
  "sleeps belly-up in the sunniest square of the kitchen floor",
  "has already learned what the treat tin sounds like",
  "greets the postman like a long-lost friend",
  "steals socks purely for the chase that follows",
  "tests every lap in the house before choosing the dog bed",
  "brings you a toy the second you sit down",
  "supervises the washing-up from underfoot",
  "is first to the food bowl and first back for seconds",
  "naps in the boot room with both back legs stretched out",
  "follows the wheelbarrow all the way down to the paddock",
  "sits by the window watching for the school bus",
];

const MANNERS = [
  "already sits for meals",
  "is crate-trained and sleeping through the night",
  "is well on the way to house-trained on the litter's schedule",
  "walks politely on a soft lead",
  "rides in the car without a fuss",
  "comes when called from anywhere in the paddock",
  "is used to nail trims and a weekly brush",
];

const VET_NOTES = [
  "First vaccinations complete · dewormed at 2, 4, 6 weeks · microchipped · vet-checked · two-year health guarantee.",
  "Fully vaccinated for age · dewormed on schedule · microchipped · health-tested parents · two-year health guarantee.",
  "Vet-checked at 6 weeks · first vaccinations · dewormed · microchipped · one-year health guarantee.",
  "First vaccinations · dewormed · microchipped · full health records and breeder support for life.",
];

/** Lowercase the first letter of a temperament line so it can be inlined. */
function uncapitalize(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

let femaleCursor = 0;
let maleCursor = 0;

function generateLitter(breed: SeedBreed): SeedPuppy[] {
  const rand = rngFor(breed.slug);
  const out: SeedPuppy[] = [];

  for (let i = 0; i < breed.litter; i++) {
    const sex: "Male" | "Female" = rand() < 0.5 ? "Female" : "Male";
    const name =
      sex === "Female"
        ? FEMALE_NAMES[femaleCursor++ % FEMALE_NAMES.length]
        : MALE_NAMES[maleCursor++ % MALE_NAMES.length];
    const color = breed.colors[Math.floor(rand() * breed.colors.length)];
    const habit = HABITS[Math.floor(rand() * HABITS.length)];
    const manner = MANNERS[Math.floor(rand() * MANNERS.length)];

    const roll = rand();
    const status: SeedPuppy["status"] =
      roll < 0.1 ? "SOLD" : roll < 0.28 ? "RESERVED" : "AVAILABLE";

    out.push({
      name,
      breedSlug: breed.slug,
      sex,
      color,
      weeks: 6 + Math.floor(rand() * 7),
      price: Math.round((breed.price * (0.9 + rand() * 0.25)) / 50) * 50,
      status,
      featured: status === "AVAILABLE" && rand() < 0.12,
      description:
        `A ${color.toLowerCase()} ${sex === "Female" ? "girl" : "boy"} who ${habit}. ` +
        `${name} ${manner}, and has grown up underfoot with our children, the vacuum, ` +
        `and one very patient farm cat. Expect the classic ${breed.name}: ` +
        `${uncapitalize(breed.temperament)}.`,
      vetNotes: VET_NOTES[Math.floor(rand() * VET_NOTES.length)],
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Seed                                                               */
/* ------------------------------------------------------------------ */

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

  // Work out the whole catalog first: hand-written listings come first in a
  // breed's litter, generated ones fill in behind them.
  const plan = BREEDS.map((breed) => ({
    breed,
    puppies: [
      ...CURATED_PUPPIES.filter((p) => p.breedSlug === breed.slug),
      ...generateLitter(breed),
    ],
  }));
  const puppyTotal = plan.reduce((n, e) => n + e.puppies.length, 0);

  // Pull every photo up front, a few breeds at a time, so the writes below
  // are not waiting on the network one row at a time.
  console.log(
    `  fetching photos for ${plan.length} breeds (${puppyTotal} puppies)…`,
  );
  const photosByBreed = await mapLimit(plan, 6, (entry) =>
    fetchDogPhotos(entry.breed.api, 1 + entry.puppies.length * 2),
  );
  const missing = plan
    .filter((_, i) => photosByBreed[i].length === 0)
    .map((e) => e.breed.slug);
  if (missing.length) {
    console.warn(`  no photos returned for: ${missing.join(", ")}`);
  }

  // Clean catalog for idempotent reseeds
  await prisma.puppyImage.deleteMany();
  await prisma.puppy.deleteMany();
  await prisma.breed.deleteMany();

  let photoCount = 0;
  for (const [i, entry] of plan.entries()) {
    const { breed, puppies } = entry;
    const photos = photosByBreed[i];
    const heroImage = photos[0] ?? null;
    const puppyPhotos = photos.slice(1);

    const created = await prisma.breed.create({
      data: {
        slug: breed.slug,
        name: breed.name,
        group: breed.group,
        size: breed.size,
        temperament: breed.temperament,
        description: breed.description,
        heroImage,
      },
    });
    if (heroImage) photoCount++;

    for (const [j, p] of puppies.entries()) {
      const urls = [
        pick(puppyPhotos, j * 2),
        pick(puppyPhotos, j * 2 + 1),
      ].filter((u): u is string => Boolean(u));
      photoCount += urls.length;

      await prisma.puppy.create({
        data: {
          name: p.name,
          breedId: created.id,
          sex: p.sex,
          color: p.color,
          birthDate: weeksAgo(p.weeks),
          priceCents: p.price * 100,
          status: p.status,
          featured: p.featured ?? false,
          description: p.description,
          vetNotes: p.vetNotes,
          images: {
            create: urls.map((url, k) => ({
              url,
              type: "image",
              alt: `${p.name}, a ${breed.name} puppy`,
              sortOrder: k,
            })),
          },
        },
      });
    }
  }

  console.log(`  ${plan.length} breeds created`);
  console.log(`  ${puppyTotal} puppies created (${photoCount} real photos)`);
  console.log("Done.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
