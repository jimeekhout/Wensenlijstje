import Link from "next/link";
import { OccasionIcon } from "@/components/occasion-icon";
import { getCurrentUser } from "@/lib/auth";
import { OCCASIONS } from "@/lib/occasions";

const steps = [
  {
    title: "Kies de gelegenheid",
    text: "Verjaardag, Sinterklaas, Kerst, een babyshower, een geboorte of iets van jezelf.",
  },
  {
    title: "Voeg cadeaus toe",
    text: "Typ ze zelf, of plak een link van een webshop. We vullen naam, prijs en foto in als de pagina dat deelt.",
  },
  {
    title: "Stuur één link",
    text: "Wie het lijstje bekijkt, heeft geen account nodig.",
  },
  {
    title: "Zij kopen, jij weet van niks",
    text: "Wie iets reserveert, zet er een naam bij. Op jouw scherm blijft dat verborgen.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-14">
      <div className="stack">
        <p className="text-sm font-extrabold tracking-[0.14em] text-clay uppercase">Voor sinterklaas, verjaardagen en alles daartussenin</p>
        <h1 className="text-5xl text-balance sm:text-6xl">Deel je wensen, bewaar de verrassing.</h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted">
          Maak een lijstje, stuur één link naar familie en vrienden, en laat hen afstrepen wat zij kopen. Jij ziet dat niet.
        </p>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <Link className="btn" href="/lijsten">
              Naar mijn lijstjes
            </Link>
          ) : (
            <Link className="btn" href="/registreren">
              Maak een lijstje
            </Link>
          )}
          <Link className="btn-secondary" href="/cadeauzoeker">
            Zoek een cadeau
          </Link>
        </div>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Gelegenheden">
          {OCCASIONS.map((occasion) => (
            <li key={occasion.id} className={`occasion-${occasion.id} inline-flex items-center gap-2 rounded-full bg-[var(--occ-bg)] px-3 py-1.5 text-sm font-bold text-[var(--occ-ink)]`}>
              <OccasionIcon name={occasion.id} className="h-4 w-4" />
              {occasion.label}
            </li>
          ))}
        </ul>
      </div>

      <aside className="card overflow-hidden">
        <div className="occasion-sinterklaas occasion-banner rounded-none">
          <div className="occasion-icon">
            <OccasionIcon name="sinterklaas" />
          </div>
          <div>
            <p className="occasion-kicker">Zo zien je gasten het</p>
            <p className="mt-1 font-serif text-2xl">Sinterklaas voor Noor</p>
          </div>
        </div>
        <div className="stack p-4">
          <div className="rounded-2xl border border-line p-3">
            <p className="font-bold">Houten treinset</p>
            <p className="text-sm text-muted">Met rails en een brug</p>
            <p className="mt-2 text-sm font-extrabold">€ 49,95</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper/60 p-3">
            <p className="font-bold line-through decoration-clay/70">Warme sloffen</p>
            <p className="claim-stamp mt-2">Gereserveerd door Sam</p>
          </div>
          <p className="hint">Noor ziet de sloffen gewoon nog op het lijstje staan.</p>
        </div>
      </aside>

      <section className="grid gap-3 sm:grid-cols-2 md:col-span-2">
        {steps.map((step, index) => (
          <article key={step.title} className="card p-4">
            <p className="text-sm font-extrabold text-clay">0{index + 1}</p>
            <h2 className="mt-1 text-2xl">{step.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
