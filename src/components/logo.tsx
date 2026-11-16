import { LogoMark } from "@/components/logo-mark";

function StarLetter({ children, x }: { children: string; x: string }) {
  return (
    <span className="logo-starlet" style={{ ["--star-x" as string]: x }}>
      <span className="logo-glyph">{children}</span>
      <svg className="logo-istar" viewBox="0 0 12 12" aria-hidden="true">
        <path fill="#F2C14D" d="M6 0 7.05 4.7 12 6 7.05 7.3 6 12 4.95 7.3 0 6l4.95-1.3Z" />
      </svg>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-logo brand-logo-compact" : "brand-logo"}>
      <LogoMark className="logo-mark" />
      <span className="logo-word" aria-label="hetwensenlijstje.nl">
        <span aria-hidden="true">
          hetwensenl
          <StarLetter x="0.1406em">i</StarLetter>
          <StarLetter x="0.1938em">j</StarLetter>
          stje
          <span className="logo-period">.</span>
          nl
        </span>
      </span>
    </span>
  );
}
