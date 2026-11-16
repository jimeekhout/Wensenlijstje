type Props = { name: string; className?: string };

export function OccasionIcon({ name, className = "h-6 w-6" }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "verjaardag":
      return (
        <svg {...common}>
          <path d="M6 13h12v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5Z" />
          <path d="M6 13c.6-1.6 2-2.4 3.2-2.4 1.3 0 1.8.9 2.8.9s1.6-.9 2.8-.9c1.2 0 2.6.8 3.2 2.4" />
          <path d="M12 10.5V7" />
          <path d="M12 6.2c.7-.5.7-1.3 0-2" />
        </svg>
      );
    case "sinterklaas":
      return (
        <svg {...common}>
          <path d="M4.5 19 8.2 6.5 12 11.5 15.8 6.5 19.5 19Z" />
          <path d="M7.5 19h9" />
          <path d="M12 12.2v2.6" />
          <path d="M10.7 13.5h2.6" />
        </svg>
      );
    case "kerst":
      return (
        <svg {...common}>
          <path d="M12 3 17 10h-2.2L18 16H6l3.2-6H7L12 3Z" />
          <path d="M12 16v3" />
          <path d="M9.5 19.5h5" />
        </svg>
      );
    case "babyshower":
      return (
        <svg {...common}>
          <path d="M10 3h4v2h-4z" />
          <path d="M9 5h6v2H9z" />
          <path d="M8.5 7h7v8.5a3.5 3.5 0 0 1-7 0V7Z" />
        </svg>
      );
    case "bruiloft":
      return (
        <svg {...common}>
          <circle cx="9" cy="12" r="4" />
          <circle cx="15" cy="12" r="4" />
        </svg>
      );
    case "geboorte":
      return (
        <svg {...common}>
          <path d="M4 14c1.5 3.5 14.5 3.5 16 0" />
          <path d="M6 14V10.5" />
          <path d="M18 14V10.5" />
          <path d="M7 10.5h10" />
          <path d="M12 10.5V7.5" />
          <circle cx="12" cy="6.4" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M14 4 20 10 9 21H3v-6L14 4Z" />
          <path d="M12 6 18 12" />
        </svg>
      );
  }
}
