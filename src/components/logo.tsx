import { LogoMark } from "@/components/logo-mark";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-logo brand-logo-compact" : "brand-logo"}>
      <LogoMark className="logo-mark" />
      <span className="logo-word">
        hetwensenlijstje<span className="logo-tld">.nl</span>
      </span>
    </span>
  );
}
