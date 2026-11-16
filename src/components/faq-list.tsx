export const FAQS = [
  {
    question: "Kost hetwensenlijstje.nl iets?",
    answer: "Nee. Een lijstje maken, delen en lootjes trekken is gratis.",
  },
  {
    question: "Moeten gasten een account maken?",
    answer: "Nee. Met de deellink bekijken ze het lijstje en strepen ze een cadeau af. Een account heb je alleen nodig om je eigen lijstjes te beheren.",
  },
  {
    question: "Ziet degene die het lijstje maakte wat al gekozen is?",
    answer: "Nee. Afstrepingen blijven verborgen voor de maker, zolang die is ingelogd. Andere bezoekers zien wel wat al gereserveerd is, zodat niet twee mensen hetzelfde kopen.",
  },
  {
    question: "Van welke winkel kan ik een link plakken?",
    answer: "Van elke webshop. We proberen naam, prijs en foto over te nemen. Lukt dat niet, dan bewaar je de link en vul je de rest zelf in.",
  },
  {
    question: "Hoe werkt lootjes trekken?",
    answer: "Je zet de namen erin en trekt de lootjes. Iedereen krijgt een eigen link en ziet alleen wie hij of zij heeft getrokken. Jij ziet die indeling niet.",
  },
  {
    question: "Kan ik een lijstje afschermen?",
    answer: "Ja. Zet een wachtwoord op het lijstje. Wie de link opent, vult dat wachtwoord eerst in. Daarna onthoudt de browser het op dat apparaat.",
  },
] as const;

export function FaqList() {
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="stack" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-3xl">Veelgestelde vragen</h2>
      {FAQS.map((item) => (
        <details key={item.question} className="card p-4">
          <summary>{item.question}</summary>
          <p className="pt-3 leading-relaxed text-muted">{item.answer}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
    </section>
  );
}
