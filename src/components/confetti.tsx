export function Confetti({ className = "h-16 w-24" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 80" aria-hidden="true">
      <path d="M22 18 L25.2 26.4 L34 27.4 L27.4 33 L29.4 41.6 L22 36.8 L14.6 41.6 L16.6 33 L10 27.4 L18.8 26.4 Z" fill="#FFD24D" />
      <path d="M96 10 L98.6 16.6 L105.6 17.6 L100.2 22 L101.8 28.8 L96 25.2 L90.2 28.8 L91.8 22 L86.4 17.6 L93.4 16.6 Z" fill="#FF8FBE" />
      <path d="M78 48 L80.4 54.2 L87 55 L82 59 L83.4 65.4 L78 62 L72.6 65.4 L74 59 L69 55 L75.6 54.2 Z" fill="#3DCFC4" />
      <path d="M46 8c8 1 12 7 8 12" fill="none" stroke="#FF8FBE" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M64 28c8-4 16-2 18 4" fill="none" stroke="#FFD24D" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M108 42c6 3 7 9 2 12" fill="none" stroke="#3DCFC4" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
