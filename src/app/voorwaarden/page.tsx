import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voorwaarden",
  description: "Concepttekst over de voorwaarden van hetwensenlijstje.nl. Deze pagina wordt nog aangevuld.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-lg px-4 py-10">
      <p className="kicker">Concept</p>
      <h1 className="mt-2 text-4xl">Voorwaarden</h1>
      <p className="note mt-4">Deze tekst is een tijdelijke versie en wordt nog aangevuld voordat de site definitief live gaat.</p>
      <div className="stack mt-6 text-muted">
        <p>Het maken van een lijstje, delen en lootjes trekken is gratis. Prijzen in de cadeauzoeker zijn richtprijzen, geen aanbod.</p>
        <p>
          Jij bent verantwoordelijk voor wat je op een lijstje zet. Gasten gebruiken de deellink om te kijken en af te strepen. De maker ziet die afstrepingen niet zolang die is ingelogd.
        </p>
        <p>Een volledige set gebruiksvoorwaarden volgt op deze pagina.</p>
      </div>
    </article>
  );
}
