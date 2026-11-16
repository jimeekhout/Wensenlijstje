"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

export function Header({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="brand-link" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">{open ? "Menu sluiten" : "Menu openen"}</span>
          <MenuIcon open={open} />
        </button>
        <nav id="site-nav" className={open ? "site-nav is-open" : "site-nav"} aria-label="Hoofdmenu">
          <NavLink href="/cadeauzoeker" pathname={pathname}>
            Cadeauzoeker
          </NavLink>
          <NavLink href="/lootjes" pathname={pathname}>
            Lootjes
          </NavLink>
          {userName ? (
            <>
              <NavLink href="/lijsten" pathname={pathname}>
                Mijn lijstjes
              </NavLink>
              <form action={logout}>
                <button className="btn-secondary min-h-11 px-3" type="submit">
                  Uitloggen
                </button>
              </form>
            </>
          ) : (
            <>
              <NavLink href="/registreren" pathname={pathname}>
                Registreren
              </NavLink>
              <Link className="btn min-h-11 px-3" href="/inloggen">
                Inloggen
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: string;
}) {
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link className="nav-link" href={href} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {open ? <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
    </svg>
  );
}
