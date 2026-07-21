"use client";

import { useState } from "react";
import { PuppyPhoto } from "./portrait";

type Media = { url: string; alt: string; type: string };

export function PuppyGallery({
  images,
  seed,
  name,
}: {
  images: Media[];
  seed: string;
  name: string;
}) {
  const [active, setActive] = useState(0);
  const hasMedia = images.length > 0;
  const current = images[active];
  const isVideo = current?.type === "video";

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border border-line bg-bone-deep shadow-[var(--shadow-soft)]">
        {isVideo ? (
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            className="h-full w-full bg-ink object-cover"
          />
        ) : (
          <PuppyPhoto
            src={hasMedia ? current.url : undefined}
            alt={current?.alt || `${name} portrait`}
            seed={seed}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((m, i) => (
            <button
              key={m.url + i}
              onClick={() => setActive(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? "border-clay" : "border-line hover:border-clay/40"
              }`}
              aria-label={`View ${m.type} ${i + 1}`}
            >
              {m.type === "video" ? (
                <span className="flex h-full w-full items-center justify-center bg-ink text-bone">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              ) : (
                <PuppyPhoto src={m.url} alt={m.alt} seed={seed + i} sizes="80px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
