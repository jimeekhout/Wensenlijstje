type Props = { className?: string };

export function LogoMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 220 200" fill="none" aria-hidden="true">
      <ellipse cx="108" cy="188" rx="64" ry="7" fill="#F6C9C0" opacity="0.75" />
      <path d="M34 28l3.4 8.6 9 1-6.8 5.6 2.1 8.8L34 47.2l-7.7 4.8 2.1-8.8-6.8-5.6 9-1L34 28Z" fill="#FFD24D" />
      <path d="M176 16l3.2 8 8.4 1.2-6.4 5.2 2 8.2-7.2-4.4-7.2 4.4 2-8.2-6.4-5.2 8.4-1.2L176 16Z" fill="#FF8FBE" />
      <path d="M198 62l2.6 6.4 6.8 1-5.2 4.2 1.6 6.6L198 76.4l-5.8 3.8 1.6-6.6-5.2-4.2 6.8-1L198 62Z" fill="#3DCFC4" />
      <path d="M18 72l2.2 5.4 5.6.8-4.2 3.6 1.4 5.4-5-3.2-5 3.2 1.4-5.4-4.2-3.6 5.6-.8L18 72Z" fill="#FFD24D" />
      <path d="M154 12l2 5 5.4.8-4 3.4 1.2 5-4.6-2.8-4.6 2.8 1.2-5-4-3.4 5.4-.8L154 12Z" fill="#3DCFC4" />
      <path d="M22 42c7 3 9 9 4 13" stroke="#FF8FBE" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M188 40c7-6 15-4 17 3" stroke="#FFD24D" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M206 96c5 3 6 8 2 11" stroke="#3DCFC4" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M168 100c8 2 11 8 6 11" stroke="#FF8FBE" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(-12 108 72)">
        <rect x="24" y="56" width="164" height="44" rx="18" fill="#FF6F6A" stroke="#F25558" strokeWidth="3" />
        <rect x="36" y="66" width="140" height="24" rx="11" fill="none" stroke="#fff" strokeWidth="2.6" strokeDasharray="7 6" strokeLinecap="round" />
        <path d="M92 62c-2-28-46-30-36 2-18 16 10 30 36 14 2-6 2-12 0-16Z" fill="#FFD24D" stroke="#E8B02E" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M116 62c2-30 48-28 36 4 20 16-8 30-36 14-2-6-2-12 0-18Z" fill="#FFE27A" stroke="#E8B02E" strokeWidth="1.8" strokeLinejoin="round" />
        <ellipse cx="104" cy="66" rx="13" ry="11" fill="#FFD24D" stroke="#E8B02E" strokeWidth="1.8" />
        <path d="M98 64c3 4 9 4 12 0" stroke="#E8B02E" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <rect x="28" y="98" width="156" height="86" rx="26" fill="#FF6F6A" stroke="#F25558" strokeWidth="3" />
      <rect x="42" y="110" width="128" height="62" rx="18" fill="none" stroke="#fff" strokeWidth="2.8" strokeDasharray="7 6" strokeLinecap="round" />
      <ellipse cx="84" cy="136" rx="7.5" ry="10" fill="#2C2424" />
      <ellipse cx="124" cy="136" rx="7.5" ry="10" fill="#2C2424" />
      <ellipse cx="81.4" cy="132.5" rx="2.3" ry="3" fill="#fff" />
      <ellipse cx="121.4" cy="132.5" rx="2.3" ry="3" fill="#fff" />
      <path d="M92 152c7 9 22 9 30 0" stroke="#2C2424" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="150" r="8" fill="#FFB3C8" />
      <circle cx="146" cy="150" r="8" fill="#FFB3C8" />
      <path
        d="M150 166c0-3.6 2.8-5.6 5.2-5.6 1.5 0 2.6.8 3.2 1.8.6-1 1.7-1.8 3.2-1.8 2.4 0 5.2 2 5.2 5.6 0 4.6-5.2 7.8-8.4 10.4-3.2-2.6-8.4-5.8-8.4-10.4Z"
        fill="#FF8FB3"
      />
    </svg>
  );
}
