import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores the stray lockfile in the
  // user's home directory and treats this project as the root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      // Real sample dog photos used for the demo puppies.
      { protocol: "https", hostname: "images.dog.ceo" },
      // Your own uploaded puppy photos & videos (Cloudinary).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
