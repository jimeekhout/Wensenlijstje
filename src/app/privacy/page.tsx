import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Concepttekst over privacy op hetwensenlijstje.nl. Deze pagina wordt nog aangevuld.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-lg px-4 py-10">
      <p className="kicker">Concept</p>
      <h1 className="mt-2 text-4xl">Privacy</h1>
      <p className="note mt-4">Deze tekst is een tijdelijke versie en wordt nog aangevuld voordat de site definitief live gaat.</p>
      <div className="stack mt-6 text-muted">
        <p>
          Je account bewaart je naam, e-mailadres en, als je met een wachtwoord inlogt, een versleutelde vorm van dat wachtwoord. Lijstjes en lootjes die je aanmaakt horen bij dat account.
        </p>
        <p>
          Een deellink is bedoeld voor gasten. Wie die link heeft, kan het lijstje bekijken. Afstrepingen blijven verborgen voor de maker zolang die is ingelogd.
        </p>
        <p>We verkopen geen gegevens. Een volledige privacyverklaring volgt op deze pagina.</p>
      </div>
    </article>
  );
}
