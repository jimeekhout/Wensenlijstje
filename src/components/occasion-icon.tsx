type Props = { name: string; className?: string };

export function OccasionIcon({ name, className = "h-6 w-6" }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "verjaardag":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M4.5 11.2c.8-1.6 2.2-2.4 3.5-2.4 1.2 0 1.7.8 2.5.8s1.4-.8 2.6-.8 1.3.8 2.5.8 2.7-.8 3.5-2.4c.3.5.4 1.1.4 1.7V18a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-5.1c0-.6.1-1.2.4-1.7Z" />
          <rect x="11.1" y="5.2" width="1.8" height="4.2" rx="0.9" fill="currentColor" />
          <path fill="#FFD24D" d="M12 2.2c.9.7 1.6 1.3 1.6 2.1 0 .7-.6 1.1-1.6 1.1S10.4 5 10.4 4.3c0-.8.7-1.4 1.6-2.1Z" />
        </svg>
      );
    case "sinterklaas":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2.4 5.2 19h13.6L12 2.4Z" />
          <path fill="#fff" d="M12 9.2v2.2M10.6 10.3h2.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          <path fill="#FFD24D" d="M7.2 18.2h9.6v1.8a1 1 0 0 1-1 1H8.2a1 1 0 0 1-1-1v-1.8Z" />
        </svg>
      );
    case "kerst":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2.2 16.2 8h-2.1L17.6 13H6.4l3.5-5H7.8L12 2.2Z" />
          <rect x="10.6" y="13" width="2.8" height="3.2" rx="0.4" fill="#6a4510" />
          <circle cx="10" cy="7.2" r="0.9" fill="#FFD24D" />
          <circle cx="13.6" cy="10.4" r="0.9" fill="#FF8FBE" />
        </svg>
      );
    case "babyshower":
      return (
        <svg {...common}>
          <rect x="9" y="2.2" width="6" height="2.4" rx="1" fill="currentColor" />
          <path fill="currentColor" d="M8.2 6.2h7.6v7.2a3.8 3.8 0 0 1-7.6 0V6.2Z" />
          <rect x="8.6" y="4.6" width="6.8" height="2" rx="0.6" fill="currentColor" />
          <circle cx="12" cy="11.2" r="1.3" fill="#fff" />
        </svg>
      );
    case "bruiloft":
      return (
        <svg {...common}>
          <circle cx="9" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="15" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="12" cy="12" r="1.3" fill="#FFD24D" />
        </svg>
      );
    case "geboorte":
      return (
        <svg {...common}>
          <path fill="currentColor" d="M4 15.2c1.6 3.2 14.4 3.2 16 0v-1.2H4v1.2Z" />
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6.5 14V10.2M17.5 14V10.2M7.2 10.2h9.6M12 10.2V7.4" />
          <circle cx="12" cy="6.1" r="1.5" fill="#FF8FBE" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 2.4 14.2 8l6 .6-4.6 3.9 1.4 5.8L12 15.4 6.9 18.3l1.4-5.8L3.8 8.6 9.8 8 12 2.4Z" />
        </svg>
      );
  }
}
