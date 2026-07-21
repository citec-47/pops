import Image from "next/image";

// Warm gradient pairs — chosen to sit within the brand palette.
const PALETTES = [
  ["#f3ddc9", "#d9a679"],
  ["#e9d9c3", "#c99a3f"],
  ["#e7ddc9", "#7c8a6f"],
  ["#f0dccf", "#b6633f"],
  ["#ded4c4", "#9a8f6f"],
  ["#efd9cf", "#c47d5a"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * A deterministic, on-brand illustrated pup portrait used when there is no
 * uploaded photo. Same seed always renders the same artwork, so the catalog
 * looks intentional rather than placeholder-y.
 */
export function IllustratedPortrait({
  seed,
  className = "",
}: {
  seed: string;
  className?: string;
}) {
  const h = hash(seed);
  const [light, deep] = PALETTES[h % PALETTES.length];
  const gid = `g${(h % 9999).toString(36)}`;
  const noseTilt = (h % 7) - 3;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Illustrated puppy portrait"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${gid})`} />
      <circle cx="200" cy="210" r="150" fill="#ffffff" opacity="0.14" />
      <g transform={`translate(200 205) rotate(${noseTilt})`} fill="#2b2420">
        {/* ears */}
        <path d="M-96-40c-30-14-52-6-56 22-4 30 14 58 44 60 8-30 12-58 12-82Z" opacity="0.92" />
        <path d="M96-40c30-14 52-6 56 22 4 30-14 58-44 60-8-30-12-58-12-82Z" opacity="0.92" />
        {/* head */}
        <path d="M0-96c-58 0-96 40-96 96 0 62 44 104 96 104s96-42 96-104c0-56-38-96-96-96Z" />
      </g>
      <g transform={`translate(200 205) rotate(${noseTilt})`} fill="#faf6f0">
        {/* muzzle */}
        <ellipse cx="0" cy="52" rx="46" ry="38" />
        {/* eyes */}
        <circle cx="-40" cy="-6" r="13" />
        <circle cx="40" cy="-6" r="13" />
      </g>
      <g transform={`translate(200 205) rotate(${noseTilt})`} fill="#2b2420">
        <circle cx="-40" cy="-4" r="6.5" />
        <circle cx="40" cy="-4" r="6.5" />
        {/* nose */}
        <path d="M0 40c-11 0-19 6-19 13 0 8 9 14 19 14s19-6 19-14c0-7-8-13-19-13Z" />
      </g>
    </svg>
  );
}

/**
 * Renders an uploaded photo when present, otherwise the illustrated fallback.
 */
export function PuppyPhoto({
  src,
  alt,
  seed,
  className = "",
  sizes,
  priority,
}: {
  src?: string | null;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return <IllustratedPortrait seed={seed} className={`h-full w-full ${className}`} />;
}
