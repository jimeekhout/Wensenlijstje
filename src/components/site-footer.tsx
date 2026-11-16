import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";

export function SiteFooter({ loggedIn }: { loggedIn: boolean }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <LogoMark className="footer-mark" />
          <p className="footer-name">hetwensenlijstje.nl</p>
          <p className="footer-tagline">Wensen delen, verrassingen bewaren.</p>
        </div>
        <nav aria-label="Wensenlijstje">
          <p className="footer-heading">Wensenlijstje</p>
          <ul>
            <li>
              <Link href={loggedIn ? "/lijsten/nieuw" : "/registreren"}>Maak een lijstje</Link>
            </li>
            <li>
              <Link href="/lijsten">Mijn lijstjes</Link>
            </li>
            <li>
              <Link href="/cadeauzoeker">Cadeauzoeker</Link>
            </li>
            <li>
              <Link href="/lootjes">Lootjes trekken</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Hulp">
          <p className="footer-heading">Hulp</p>
          <ul>
            <li>
              <Link href="/#zo-werkt-het">Hoe werkt het</Link>
            </li>
            <li>
              <Link href="/#veelgestelde-vragen">Veelgestelde vragen</Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Over">
          <p className="footer-heading">Over</p>
          <ul>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/voorwaarden">Voorwaarden</Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="footer-bar">© 2026 hetwensenlijstje.nl</p>
    </footer>
  );
}
