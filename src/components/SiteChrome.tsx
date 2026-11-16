import type { ReactNode } from "react";

export function GiftMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="14" width="20" height="13" rx="2.5" fill="currentColor" opacity="0.18" />
      <rect x="7" y="15" width="18" height="11" rx="2" fill="#fffaf3" />
      <path d="M16 15v11M7 20h18" stroke="#1d5c40" strokeWidth="1.8" />
      <path
        d="M16 15c-1.6-3.4-5.4-3.6-6.2-1.6-.7 1.8 1.6 3 6.2 1.6 4.6 1.4 6.9.2 6.2-1.6-.8-2-4.6-1.8-6.2 1.6z"
        fill="#f0c14d"
      />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <GiftMark />
        <span className="brand-name">Wensenlijstje</span>
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>De ontvanger ziet niet welke cadeaus gereserveerd zijn. Zo blijft het een verrassing.</p>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="wrap">{children}</main>
      <SiteFooter />
    </>
  );
}
