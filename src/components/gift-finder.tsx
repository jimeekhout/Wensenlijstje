"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AddToList } from "@/components/add-to-list";
import { GiftPicture } from "@/components/gift-picture";
import { OccasionIcon } from "@/components/occasion-icon";
import { occasionImages } from "@/data/occasion-images";
import { AGE_GROUPS, BUDGETS, CATEGORIES, RECIPIENTS } from "@/data/taxonomy";
import { filterGiftIdeas, sortGiftIdeas } from "@/lib/gift-filter";
import { giftQueryString, parseGiftQuery, type GiftQuery } from "@/lib/gift-query";
import { OCCASIONS, type OccasionId } from "@/lib/occasions";
import { formatEuro } from "@/lib/price";

export type GiftCard = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  art: string;
  image: string;
  imageAlt: string;
  imageUrl?: string;
  popularity: number;
  categories: string[];
  shopUrl?: string;
  shopName?: string;
  recipients: string[];
  occasions: string[];
  interests: string[];
  ageGroups: string[];
};

export function GiftFinder({
  ideas,
  lists,
}: {
  ideas: GiftCard[];
  lists: { id: string; title: string }[] | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const query = useMemo(() => parseGiftQuery(searchParams), [searchParams]);
  const queryRef = useRef(query);
  queryRef.current = query;
  const [draft, setDraft] = useState(query.q);
  useEffect(() => {
    setDraft(query.q);
  }, [query.q]);
  const live = useMemo(() => ({ ...query, q: draft }), [query, draft]);
  const results = useMemo(() => {
    const filtered = filterGiftIdeas(ideas, { ...live, interests: [] });
    return sortGiftIdeas(filtered, live.sort);
  }, [ideas, live]);
  const returnTo = `${pathname}${giftQueryString(live)}`;
  const occasionImage = query.occasion ? occasionImages[query.occasion as OccasionId] : undefined;

  function update(patch: Partial<GiftQuery>) {
    const next = { ...queryRef.current, ...patch };
    queryRef.current = next;
    const href = `${pathname}${giftQueryString(next)}`;
    router.replace(href || pathname, { scroll: false });
  }

  useEffect(() => {
    if (draft === query.q) return;
    const handle = window.setTimeout(() => {
      const next = { ...queryRef.current, q: draft };
      queryRef.current = next;
      const href = `${pathname}${giftQueryString(next)}`;
      router.replace(href || pathname, { scroll: false });
    }, 180);
    return () => window.clearTimeout(handle);
  }, [draft, pathname, query.q, router]);

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const chips = activeChips(query, update);

  return (
    <div className="catalog">
      <form className="catalog-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label className="label" htmlFor="gift-search">
          Zoek een cadeau
        </label>
        <input
          id="gift-search"
          className="input"
          type="search"
          name="q"
          value={draft}
          placeholder="Bijvoorbeeld sokken, spel of thee"
          onChange={(event) => setDraft(event.target.value)}
        />
      </form>

      <div className="catalog-body">
        <aside className="catalog-filters card stack p-4" aria-label="Filters">
          <FilterFields query={query} update={update} />
        </aside>
        <div className="stack">
          <div className="catalog-toolbar">
            <button className="btn-secondary catalog-filter-button" type="button" onClick={() => dialogRef.current?.showModal()}>
              Filters{chips.length ? ` (${chips.length})` : ""}
            </button>
            <p className="font-bold" data-testid="gift-count">
              {results.length === 1 ? "1 cadeau" : `${results.length} cadeaus`}
            </p>
            <label className="catalog-sort">
              <span className="sr-only">Sorteer</span>
              <select
                className="select"
                aria-label="Sorteer"
                value={query.sort}
                onChange={(event) => update({ sort: event.target.value as GiftQuery["sort"] })}
              >
                <option value="populair">Populair</option>
                <option value="prijs-op">Prijs laag–hoog</option>
                <option value="prijs-af">Prijs hoog–laag</option>
              </select>
            </label>
          </div>
          {chips.length ? (
            <div className="catalog-chips" aria-label="Actieve filters">
              {chips.map((chip) => (
                <button key={chip.key} className="chip" type="button" onClick={chip.remove}>
                  {chip.label} <span aria-hidden="true">×</span>
                  <span className="sr-only">Verwijder filter {chip.label}</span>
                </button>
              ))}
              <button className="btn-ghost min-h-11 px-3" type="button" onClick={clearAll}>
                Wis alles
              </button>
            </div>
          ) : null}
          {occasionImage ? <GiftPicture wide src={occasionImage.src} alt={occasionImage.alt} /> : null}
          {results.length === 0 ? (
            <div className="card p-5">
              <h2 className="text-2xl">Geen cadeaus gevonden</h2>
              <p className="hint mt-2">Pas je zoekwoord of filters aan.</p>
              <button className="btn mt-3" type="button" onClick={clearAll}>
                Wis alles
              </button>
            </div>
          ) : (
            <div className="catalog-grid" data-testid="gift-results">
              {results.map((idea) => (
                <article key={idea.id} className="card flex flex-col overflow-hidden" data-testid="gift-card">
                  <GiftPicture src={idea.imageUrl ?? idea.image} alt={idea.imageAlt} />
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h2 className="text-2xl">{idea.name}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{idea.description}</p>
                    </div>
                    <p className="font-extrabold">ca. {formatEuro(idea.priceCents)}</p>
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">
                      {idea.categories
                        .map((id) => CATEGORIES.find((item) => item.id === id)?.label ?? id)
                        .join(" · ")}
                    </p>
                    <div className="mt-auto pt-2">
                      <AddToList ideaId={idea.id} lists={lists} returnTo={returnTo} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <dialog ref={dialogRef} className="filter-sheet" aria-label="Filters">
        <div className="stack p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Filters</h2>
            <button className="btn-ghost min-h-11 px-3" type="button" onClick={() => dialogRef.current?.close()}>
              Sluiten
            </button>
          </div>
          <FilterFields query={query} update={update} />
          <button className="btn" type="button" onClick={() => dialogRef.current?.close()}>
            Toon {results.length === 1 ? "1 cadeau" : `${results.length} cadeaus`}
          </button>
        </div>
      </dialog>
    </div>
  );
}

function FilterFields({ query, update }: { query: GiftQuery; update: (patch: Partial<GiftQuery>) => void }) {
  return (
    <>
      <FilterRow label="Gelegenheid">
        <Chip pressed={query.occasion === null} onClick={() => update({ occasion: null })}>
          Alle
        </Chip>
        {OCCASIONS.map((item) => (
          <Chip key={item.id} pressed={query.occasion === item.id} onClick={() => update({ occasion: item.id })}>
            <OccasionIcon name={item.id} className="h-4 w-4" />
            {item.label}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow label="Voor wie">
        <Chip pressed={query.recipient === null} onClick={() => update({ recipient: null })}>
          Iedereen
        </Chip>
        {RECIPIENTS.map((item) => (
          <Chip key={item.id} pressed={query.recipient === item.id} onClick={() => update({ recipient: item.id })}>
            {item.label}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow label="Leeftijd">
        <Chip pressed={query.ageGroup === null} onClick={() => update({ ageGroup: null })}>
          Alle leeftijden
        </Chip>
        {AGE_GROUPS.map((item) => (
          <Chip key={item.id} pressed={query.ageGroup === item.id} onClick={() => update({ ageGroup: item.id })}>
            {item.label}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow label="Budget">
        {BUDGETS.map((item) => (
          <Chip key={item.id} pressed={query.budgetId === item.id} onClick={() => update({ budgetId: item.id })}>
            {item.label}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow label="Categorie">
        {CATEGORIES.map((item) => {
          const pressed = query.categories.includes(item.id);
          return (
            <Chip
              key={item.id}
              pressed={pressed}
              onClick={() =>
                update({
                  categories: pressed ? query.categories.filter((id) => id !== item.id) : [...query.categories, item.id],
                })
              }
            >
              {item.label}
            </Chip>
          );
        })}
      </FilterRow>
    </>
  );
}

function activeChips(query: GiftQuery, update: (patch: Partial<GiftQuery>) => void) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (query.q) chips.push({ key: "q", label: `Zoek: ${query.q}`, remove: () => update({ q: "" }) });
  if (query.occasion) {
    chips.push({
      key: "occasion",
      label: OCCASIONS.find((item) => item.id === query.occasion)?.label ?? query.occasion,
      remove: () => update({ occasion: null }),
    });
  }
  if (query.recipient) {
    chips.push({
      key: "recipient",
      label: RECIPIENTS.find((item) => item.id === query.recipient)?.label ?? query.recipient,
      remove: () => update({ recipient: null }),
    });
  }
  if (query.ageGroup) {
    chips.push({
      key: "age",
      label: AGE_GROUPS.find((item) => item.id === query.ageGroup)?.label ?? query.ageGroup,
      remove: () => update({ ageGroup: null }),
    });
  }
  if (query.budgetId !== "all") {
    chips.push({
      key: "budget",
      label: BUDGETS.find((item) => item.id === query.budgetId)?.label ?? query.budgetId,
      remove: () => update({ budgetId: "all" }),
    });
  }
  for (const id of query.categories) {
    chips.push({
      key: `cat-${id}`,
      label: CATEGORIES.find((item) => item.id === id)?.label ?? id,
      remove: () => update({ categories: query.categories.filter((item) => item !== id) }),
    });
  }
  return chips;
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-extrabold tracking-wide uppercase">{label}</p>
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
