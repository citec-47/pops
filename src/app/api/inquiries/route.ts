import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json({ fieldErrors }, { status: 422 });
  }

  const { name, email, phone, message, puppyId } = parsed.data;

  // Only attach a puppy if it actually exists.
  let validPuppyId: string | null = null;
  if (puppyId) {
    const exists = await prisma.puppy.findUnique({
      where: { id: puppyId },
      select: { id: true },
    });
    validPuppyId = exists?.id ?? null;
  }

  await prisma.inquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      message,
      puppyId: validPuppyId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
