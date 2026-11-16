const scenes: Record<string, React.ReactNode> = {
  warm: (
    <g>
      <path d="M48 28c0-8 8-12 12-6 4-6 12-2 12 6v28H48V28Z" />
      <path d="M88 28c0-8 8-12 12-6 4-6 12-2 12 6v28H88V28Z" />
      <path d="M52 56h20M92 56h20" />
    </g>
  ),
  book: (
    <g>
      <path d="M38 28h40a6 6 0 0 1 6 6v34H44a6 6 0 0 0-6 6V28Z" />
      <path d="M84 28h38v46a6 6 0 0 1-6 6H84" />
      <path d="M50 40h22M50 50h16" />
    </g>
  ),
  audio: (
    <g>
      <path d="M40 62V48a40 40 0 0 1 80 0v14" />
      <rect x="32" y="58" width="18" height="24" rx="6" />
      <rect x="110" y="58" width="18" height="24" rx="6" />
    </g>
  ),
  outdoor: (
    <g>
      <path d="M28 78h104" />
      <circle cx="58" cy="70" r="8" />
      <circle cx="104" cy="70" r="8" />
      <path d="M66 70h30l10-18H78" />
      <path d="M78 52l-8-16h22" />
      <path d="M40 78c10-24 22-36 40-36" />
    </g>
  ),
  baby: (
    <g>
      <circle cx="80" cy="46" r="18" />
      <circle cx="73" cy="44" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="87" cy="44" r="1.6" fill="currentColor" stroke="none" />
      <path d="M74 52c3 3 9 3 12 0" />
      <path d="M62 40c2-10 8-14 18-14s16 4 18 14" />
      <path d="M58 70c8 10 36 10 44 0" />
    </g>
  ),
  play: (
    <g>
      <rect x="42" y="46" width="24" height="24" rx="3" />
      <rect x="70" y="46" width="24" height="24" rx="3" />
      <rect x="56" y="22" width="24" height="24" rx="3" />
    </g>
  ),
  kitchen: (
    <g>
      <path d="M58 30h36v18a18 18 0 0 1-36 0V30Z" />
      <path d="M58 38h36" />
      <path d="M70 30c0-8 12-8 12 0" />
      <path d="M104 42h16" />
    </g>
  ),
  sport: (
    <g>
      <path d="M68 24h24v52a12 12 0 0 1-24 0V24Z" />
      <path d="M68 38h24" />
      <path d="M74 24c2-8 10-8 12 0" />
    </g>
  ),
  creative: (
    <g>
      <path d="M46 28h52v48H46z" />
      <path d="M58 42h28M58 54h20" />
      <path d="M102 36l18-10 8 14-18 10" />
    </g>
  ),
  tech: (
    <g>
      <rect x="36" y="34" width="88" height="48" rx="8" />
      <path d="M68 82h24" />
      <circle cx="80" cy="56" r="8" />
    </g>
  ),
};

export function GiftArt({ kind }: { kind: string }) {
  return (
    <div className={`gift-art art-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 160 110" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        {scenes[kind] ?? scenes.play}
      </svg>
    </div>
  );
}
