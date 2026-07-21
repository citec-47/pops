import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Willowbrook — Boutique Puppies, Raised With Care",
    template: "%s · Willowbrook",
  },
  description:
    "A small family nursery raising healthy, well-socialized puppies. Meet our available litters, learn about each breed, and reserve your companion.",
  openGraph: {
    title: "Willowbrook — Boutique Puppies, Raised With Care",
    description:
      "A small family nursery raising healthy, well-socialized puppies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
