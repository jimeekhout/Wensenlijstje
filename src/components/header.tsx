import Link from "next/link";
import { logout } from "@/app/actions/auth";

export function Header({ userName }: { userName: string | null }) {
  return (
    <header className="border-b border-line/80 bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link href={userName ? "/lijsten" : "/"} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-clay text-card" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h8l3 3v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
              <path d="M14 7v3h3" />
              <path d="M8 14h6M8 17h3" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-serif text-lg leading-none tracking-tight sm:text-xl">hetwensenlijstje.nl</span>
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
