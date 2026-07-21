export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <circle cx="20" cy="20" r="19" fill="#f0dccf" />
        {/* a simple, friendly pup silhouette */}
        <path
          d="M12.5 15c-1.3-1.6-2.4-2-3.4-1.6-1 .4-1.2 1.9-.6 3.7.3 1 .8 1.8 1.4 2.4-.5 1.2-.8 2.6-.8 4 0 5 4.6 8.6 11 8.6s11-3.6 11-8.6c0-1.4-.3-2.8-.8-4 .6-.6 1.1-1.4 1.4-2.4.6-1.8.4-3.3-.6-3.7-1-.4-2.1 0-3.4 1.6-1.8-1-4-1.6-6.6-1.6-2.6 0-4.8.6-6.6 1.6Z"
          fill="#b6633f"
        />
        <circle cx="16.5" cy="21.5" r="1.5" fill="#2b2420" />
        <circle cx="23.5" cy="21.5" r="1.5" fill="#2b2420" />
        <path
          d="M20 25c-1 0-1.8.5-1.8 1.2 0 .8.8 1.3 1.8 1.3s1.8-.5 1.8-1.3c0-.7-.8-1.2-1.8-1.2Z"
          fill="#2b2420"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold text-ink">
          Willowbrook
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.28em] text-muted">
          Puppy Nursery
        </span>
      </span>
    </span>
  );
}
