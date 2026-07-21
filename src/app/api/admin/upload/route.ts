import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB (videos can be large)

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!configured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary isn't configured yet. Add CLOUDINARY_CLOUD_NAME to your .env and restart.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large (max 100 MB)." },
      { status: 413 },
    );
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) {
    return NextResponse.json(
      { error: "Please upload an image or a video." },
      { status: 415 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise<{ secure_url: string; resource_type: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
              resource_type: "auto",
              folder: "popupload",
            },
            (err, res) => {
              if (err || !res) reject(err ?? new Error("Upload failed"));
              else resolve(res as { secure_url: string; resource_type: string });
            },
          )
          .end(bytes);
      },
    );

    return NextResponse.json(
      {
        url: result.secure_url,
        type: result.resource_type === "video" ? "video" : "image",
      },
      { status: 201 },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload to Cloudinary failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
