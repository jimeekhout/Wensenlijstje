type Props = { className?: string };

export function LogoMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#F15D5C" />
      <rect x="15" y="36" width="34" height="20" rx="2.2" fill="#fff" />
      <rect x="29.4" y="36" width="5.2" height="20" fill="#F15D5C" />
      <rect x="15" y="43.4" width="34" height="5.2" fill="#F15D5C" />
      <path d="M31.6 36.2C30.4 27.6 16.2 26.2 17.4 33.6c.8 4.6 8 6.2 14.2 2.6Z" fill="#fff" />
      <path d="M32.6 36.2C34 28.4 47.6 28.8 46.2 35.2c-.8 3.8-7.2 5.4-13.6 1Z" fill="#fff" />
      <circle cx="32" cy="36.2" r="2.7" fill="#fff" />
      <path
        d="M19.5 34.2c-4.2-.6-6.4-4.8-3.6-6.6 2.2-1.4 4.4.6 4.6 2.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path
        d="M44.2 32.4c4.6-1.2 7.2-6.4 5.6-9.4 1.6 1.2 1.2 3.6-.2 4.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
      <path d="M50.6 18.2 51.7 21 54.6 21.2 52.2 23 53.1 25.8 50.6 24.2 48.1 25.8 49 23 46.6 21.2 49.5 21Z" fill="#fff" />
    </svg>
  );
}
