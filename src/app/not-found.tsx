import { Shell } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <Shell>
      <section className="panel">
        <p className="kicker">Niet gevonden</p>
        <h1>Deze link klopt niet.</h1>
        <p>Het lijstje is verwijderd, of het adres is niet compleet. Vraag om een nieuwe link.</p>
        <p>
          <a className="button primary" href="/">
            Naar de startpagina
          </a>
        </p>
      </section>
    </Shell>
  );
}
