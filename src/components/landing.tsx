import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { OccasionIcon } from "@/components/occasion-icon";

const usps = [
  {
    title: "Helemaal gratis",
    text: "Een lijstje maken, delen en lootjes trekken kost niets.",
    icon: "gift",
  },
  {
    title: "Geen account voor gasten",
    text: "Wie de link opent, kan meteen kijken en een cadeau afstrepen.",
    icon: "users",
  },
  {
    title: "De verrassing blijft geheim",
    text: "Jij ziet niet welk cadeau al gereserveerd is, zolang je bent ingelogd.",
    icon: "eye",
  },
  {
    title: "Elke webshop",
    text: "Plak een productlink. Naam en prijs vullen we vaak al voor je in.",
    icon: "link",
  },
  {
    title: "Lootjes trekken",
    text: "Voor Sinterklaas of Kerst. Jij ziet niet wie wie heeft getrokken.",
    icon: "ticket",
  },
  {
    title: "Delen zoals jij wilt",
    text: "WhatsApp, een QR-code, of een lijstje dat achter een wachtwoord zit.",
    icon: "share",
  },
] as const;

const makeSteps = [
  {
    title: "Account of Google",
    text: "Maak een gratis account met je e-mail, of ga verder met Google.",
  },
  {
    title: "Gelegenheid en naam",
    text: "Kies bijvoorbeeld Sinterklaas, een verjaardag of een bruiloft, en geef het lijstje een naam.",
  },
  {
    title: "Cadeaus erop",
    text: "Plak een link uit een webshop, of vul naam en prijs zelf in.",
  },
];

const shareSteps = [
  {
    title: "Stuur één link",
    text: "Kopieer de link, deel hem via WhatsApp of laat iemand de QR-code scannen.",
  },
  {
    title: "Gasten strepen af",
    text: "Ze tikken op Ik koop dit. Andere bezoekers zien wat al gekozen is.",
  },
  {
    title: "Jij blijft verrast",
    text: "Op jouw scherm blijft verborgen welk cadeau al gereserveerd is.",
  },
];

export function Landing({ userName }: { userName: string | null }) {
  const loggedIn = Boolean(userName);
  const firstName = userName?.split(" ")[0];

  return (
    <div className="home">
      <section className="home-section" aria-labelledby="hero-title">
        <div className="home-hero">
          <div className="stack">
            <p className="kicker">
              {loggedIn
                ? `Welkom terug${firstName ? `, ${firstName}` : ""}`
                : "Voor sinterklaas, verjaardagen en alles daartussenin"}
            </p>
            <h1 id="hero-title" className="text-5xl text-balance sm:text-6xl">
              Deel je wensen, bewaar de verrassing.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Eén link voor familie en vrienden. Zij geven aan wat ze kopen. Jij ziet dat niet, dus het cadeau blijft een verrassing.
            </p>
            <HomeCtas loggedIn={loggedIn} />
          </div>
          <PreviewCard />
        </div>
      </section>

      <section className="home-section" aria-labelledby="usp-title">
        <div className="home-wrap">
          <h2 id="usp-title" className="text-3xl">Waarom een lijstje hier</h2>
          <p className="mt-2 max-w-2xl text-muted">Zes dingen die het delen rustig houden, voor jou en voor je gasten.</p>
          <ul className="usp-grid">
            {usps.map((item) => (
              <li key={item.title} className="card p-4">
                <span className="usp-icon" aria-hidden="true">
                  <UspIcon name={item.icon} />
                </span>
                <h3 className="mt-3 text-xl">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-section" aria-labelledby="cta-na-usp">
        <div className="home-wrap">
          <div className="cta-panel">
            <h2 id="cta-na-usp" className="text-3xl">
              {loggedIn ? "Zet een nieuw lijstje klaar" : "Begin wanneer je wilt"}
            </h2>
            <p className="max-w-xl text-muted">
              {loggedIn
                ? "Je account staat klaar. Maak een lijstje of ga terug naar wat je al hebt."
                : "Een account is gratis. Daarna kun je meteen cadeaus toevoegen en de link delen."}
            </p>
            <HomeCtas loggedIn={loggedIn} />
          </div>
        </div>
      </section>

      <section className="home-section" id="zo-werkt-het" aria-labelledby="maken-title">
        <div className="home-wrap">
          <h2 id="maken-title" className="text-3xl">Zo maak je je lijstje</h2>
          <ol className="step-grid">
            {makeSteps.map((step, index) => (
              <li key={step.title} className="card p-4">
                <p className="step-index">{index + 1}</p>
                <h3 className="mt-3 text-2xl">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section" aria-labelledby="delen-title">
        <div className="home-wrap">
          <h2 id="delen-title" className="text-3xl">Zo deel je je lijstje</h2>
          <ol className="step-grid">
            {shareSteps.map((step, index) => (
              <li key={step.title} className="card p-4">
                <p className="step-index">{index + 1}</p>
                <h3 className="mt-3 text-2xl">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="home-section" aria-labelledby="cta-na-stappen">
        <div className="home-wrap">
          <div className="cta-panel">
            <h2 id="cta-na-stappen" className="text-3xl">
              {loggedIn ? "Deel je volgende lijstje" : "Je lijstje staat zo online"}
            </h2>
            <p className="max-w-xl text-muted">Gasten hebben geen account nodig. Jij houdt de verrassing.</p>
            <HomeCtas loggedIn={loggedIn} />
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="lootjes-cta-title">
        <div className="home-wrap">
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="lootjes-cta-title" className="text-3xl">Lootjes trekken</h2>
              <p className="mt-2 max-w-xl text-muted">
                Zet de namen erin en trek de lootjes. Iedereen krijgt een eigen link en ziet alleen de eigen trekking. Jij ziet de indeling niet.
              </p>
            </div>
            <Link className="btn shrink-0" href="/lootjes">
              Naar lootjes trekken
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="slot-title">
        <div className="home-wrap">
          <div className="cta-banner">
            <h2 id="slot-title" className="text-3xl">
              {loggedIn ? "Klaar voor het volgende feest?" : "Maak gratis je lijstje"}
            </h2>
            <p className="max-w-xl">
              {loggedIn
                ? "Open je lijstjes of begin een nieuwe. Delen doe je met één link."
                : "Voor Sinterklaas, Kerst, een verjaardag of een bruiloft. Gasten kijken mee zonder account."}
            </p>
            <HomeCtas loggedIn={loggedIn} />
          </div>
        </div>
      </section>

      <section className="home-section" id="veelgestelde-vragen" aria-labelledby="faq-title">
        <div className="home-wrap">
          <FaqList />
        </div>
      </section>
    </div>
  );
}

function HomeCtas({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) {
    return (
      <div className="home-ctas">
        <Link className="btn" href="/lijsten/nieuw">
          Nieuw lijstje maken
        </Link>
        <Link className="btn-secondary" href="/lijsten">
          Naar mijn lijstjes
        </Link>
      </div>
    );
  }
  return (
    <div className="home-ctas">
      <Link className="btn" href="/registreren">
        Maak gratis je lijstje
      </Link>
      <Link className="btn-secondary" href="/cadeauzoeker">
        Bekijk de cadeauzoeker
      </Link>
    </div>
  );
}

function PreviewCard() {
  return (
    <aside className="card overflow-hidden" aria-label="Voorbeeld van een gedeeld lijstje">
      <div className="occasion-sinterklaas occasion-banner rounded-none">
        <div className="occasion-icon">
          <OccasionIcon name="sinterklaas" />
        </div>
        <div>
          <p className="occasion-kicker">Zo zien je gasten het</p>
          <p className="mt-1 text-2xl font-bold">Sinterklaas voor Noor</p>
        </div>
      </div>
      <div className="stack p-4">
        <div className="rounded-xl border border-line p-3">
          <p className="font-bold">Houten treinset</p>
          <p className="text-sm text-muted">Met rails en een brug</p>
          <p className="mt-2 text-sm font-extrabold">€ 49,95</p>
        </div>
        <div className="rounded-xl border border-line bg-paper/70 p-3">
          <p className="font-bold line-through decoration-clay/70">Warme sloffen</p>
          <p className="claim-stamp mt-2">Gereserveerd door Sam</p>
        </div>
        <p className="hint">Noor ziet de sloffen gewoon nog op het lijstje staan.</p>
      </div>
    </aside>
  );
}

function UspIcon({ name }: { name: (typeof usps)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "gift":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="16" height="9" rx="1.5" />
          <path d="M12 10v9M4 14h16" />
          <path d="M12 10c-1.2-2.4-4.2-2.6-4.2-.8S12 10 12 10s2.6-2.2 4.2-.8S13.2 7.6 12 10Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="2.5" />
          <path d="M4.5 18c.6-2.4 2.4-3.5 4.5-3.5s3.9 1.1 4.5 3.5" />
          <circle cx="16" cy="9.5" r="2" />
          <path d="M15 14.6c1.6.2 2.9 1.1 3.5 3.4" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
          <circle cx="12" cy="12" r="2.4" />
          <path d="M5 5 19 19" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
          <path d="M12 7v10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="7" cy="12" r="2.2" />
          <circle cx="16" cy="8" r="2.2" />
          <circle cx="16" cy="16" r="2.2" />
          <path d="M9 11.2 14 9M9 12.8l5 2.2" />
        </svg>
      );
  }
}
