import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please share your name.").max(120),
  email: z.string().trim().email("That doesn't look like a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more so we can help.")
    .max(2000),
  puppyId: z.string().optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const puppySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  breedId: z.string().min(1, "Choose a breed."),
  sex: z.enum(["Male", "Female"]),
  color: z.string().trim().min(1, "Color is required.").max(120),
  birthDate: z.string().min(1, "Birth date is required."),
  price: z.coerce.number().min(0, "Price must be positive.").max(1_000_000),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]),
  featured: z.coerce.boolean().optional(),
  description: z.string().trim().min(1, "Add a short description.").max(4000),
  vetNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type PuppyInput = z.infer<typeof puppySchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const breedSchema = z.object({
  name: z.string().trim().min(1, "Breed name is required.").max(80),
  group: z.string().trim().min(1, "Group is required.").max(40),
  size: z.string().trim().min(1, "Size is required.").max(40),
  temperament: z
    .string()
    .trim()
    .min(1, "Add a short temperament line.")
    .max(160),
  description: z.string().trim().min(1, "Add a description.").max(2000),
  heroImage: z.string().trim().optional().or(z.literal("")),
});

export type BreedInput = z.infer<typeof breedSchema>;

/** Turn a name into a URL-safe slug: "French Bulldog" -> "french-bulldog". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
