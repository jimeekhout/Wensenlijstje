import { CreateListForm } from "@/components/CreateListForm";
import { SavedLists } from "@/components/SavedLists";
import { Shell } from "@/components/SiteChrome";

export default function HomePage() {
  return (
    <Shell>
      <section className="hero">
        <p className="eyebrow">Voor verjaardagen, Sinterklaas en Kerst</p>
        <h1>Een wensenlijstje delen, zonder de verrassing te verpesten.</h1>
        <p className="lede">
          Zet je cadeauwensen op een lijstje en stuur één link naar familie en vrienden. Zij reserveren een cadeau. Jij
          ziet niet wat — tot het uitgepakt is.
        </p>
        <ol className="steps">
          <li>
            <span>1</span>
            <span>Maak een lijstje voor een gelegenheid.</span>
          </li>
          <li>
            <span>2</span>
            <span>Voeg cadeaus toe, met een link, prijs of notitie.</span>
          </li>
          <li>
            <span>3</span>
            <span>Deel de link. Bewaar de beheerlink voor jezelf.</span>
          </li>
        </ol>
      </section>
      <CreateListForm />
      <SavedLists />
    </Shell>
  );
}
