"use client";

import { useMemo, useState } from "react";
import { AddToList } from "@/components/add-to-list";
import { GiftArt } from "@/components/gift-art";
import { OccasionIcon } from "@/components/occasion-icon";
import { BUDGETS, INTERESTS, RECIPIENTS } from "@/data/taxonomy";
import { filterGiftIdeas } from "@/lib/gift-filter";
import { OCCASIONS } from "@/lib/occasions";
import { formatEuro } from "@/lib/price";

export type GiftCard = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  art: string;
  shopUrl?: string;
  shopName?: string;
  recipients: string[];
  occasions: string[];
  interests: string[];
};

export function GiftFinder({
  ideas,
  lists,
}: {
  ideas: GiftCard[];
  lists: { id: string; title: string }[] | null;
}) {
  const [recipient, setRecipient] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [budgetId, setBudgetId] = useState("all");
  const [interests, setInterests] = useState<string[]>([]);

  const results = useMemo(
    () => filterGiftIdeas(ideas, { recipient, occasion, budgetId, interests }),
    [ideas, recipient, occasion, budgetId, interests],
  );
  const filtersActive = Boolean(recipient || occasion || interests.length || budgetId !== "all");

  function toggleInterest(id: string) {
    setInterests((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="stack">
      <section className="card stack p-4" aria-label="Filters">
        <FilterRow label="Voor wie">
          <Chip pressed={recipient === null} onClick={() => setRecipient(null)}>
            Iedereen
          </Chip>
          {RECIPIENTS.map((item) => (
            <Chip key={item.id} pressed={recipient === item.id} onClick={() => setRecipient(item.id)}>
              {item.label}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Gelegenheid">
          <Chip pressed={occasion === null} onClick={() => setOccasion(null)}>
            Alle
          </Chip>
          {OCCASIONS.map((item) => (
            <Chip key={item.id} pressed={occasion === item.id} onClick={() => setOccasion(item.id)}>
              <OccasionIcon name={item.id} className="h-4 w-4" />
              {item.label}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Budget">
          {BUDGETS.map((item) => (
            <Chip key={item.id} pressed={budgetId === item.id} onClick={() => setBudgetId(item.id)}>
              {item.label}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Interesses">
          {INTERESTS.map((item) => (
            <Chip key={item.id} pressed={interests.includes(item.id)} onClick={() => toggleInterest(item.id)}>
              {item.label}
            </Chip>
          ))}
        </FilterRow>
        {filtersActive ? (
          <button
            className="btn-ghost w-fit"
            type="button"
            onClick={() => {
              setRecipient(null);
              setOccasion(null);
              setBudgetId("all");
              setInterests([]);
            }}
          >
            Wis filters
          </button>
        ) : null}
      </section>

      <p className="font-bold" data-testid="gift-count">
        {results.length === 1 ? "1 idee" : `${results.length} ideeën`}
      </p>

      {results.length === 0 ? (
        <div className="card p-5">
          <h2 className="text-2xl">Geen ideeën met deze combinatie</h2>
          <p className="hint mt-2">Wis een filter en probeer het opnieuw.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2" data-testid="gift-results">
          {results.map((idea) => (
            <article key={idea.id} className="card flex flex-col overflow-hidden" data-testid="gift-card">
              <GiftArt kind={idea.art} />
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h2 className="text-2xl">{idea.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{idea.description}</p>
                </div>
                <p className="font-extrabold">ca. {formatEuro(idea.priceCents)}</p>
                <p className="text-xs font-bold tracking-wide text-muted uppercase">
                  {idea.interests
                    .map((id) => INTERESTS.find((item) => item.id === id)?.label ?? id)
                    .join(" · ")}
                </p>
                {idea.shopUrl && idea.shopName ? (
                  <a
                    className="font-bold text-clay underline decoration-clay/40 underline-offset-4"
                    href={idea.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                  >
                    {idea.shopName}
                  </a>
                ) : null}
                <div className="mt-auto pt-2">
                  <AddToList ideaId={idea.id} lists={lists} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 font-sans text-sm font-extrabold tracking-wide uppercase">{label}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className="chip inline-flex items-center gap-1.5" type="button" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
