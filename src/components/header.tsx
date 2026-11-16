import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";

export function Header({ userName }: { userName: string | null }) {
  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link href={userName ? "/lijsten" : "/"} className="brand-link">
          <Logo />
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <Link href="/cadeauzoeker" className="btn-ghost min-h-11 px-3">
            Cadeauzoeker
          </Link>
          {userName ? (
            <>
              <Link href="/lijsten" className="btn-ghost min-h-11 px-3">
                Mijn lijstjes
              </Link>
              <Link href="/lootjes" className="btn-ghost min-h-11 px-3">
                Lootjes
              </Link>
              <form action={logout}>
                <button className="btn-secondary min-h-11 px-3" type="submit">
                  Uitloggen
                </button>
              </form>
            </>
          ) : (
            <Link href="/inloggen" className="btn min-h-11 px-3">
              Inloggen
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
