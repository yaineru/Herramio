/** The Herramio "H" logomark — mirrors src/app/icon.svg and public/icon.svg. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <rect x="28" y="24" width="14" height="52" rx="3" />
      <rect x="58" y="24" width="14" height="52" rx="3" />
      <rect x="28" y="43" width="44" height="14" rx="3" />
    </svg>
  );
}
