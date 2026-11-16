"use client";

import type { ItemDraft, Priority } from "@/lib/types";

const PRIORITIES: { value: "" | Priority; label: string }[] = [
  { value: "", label: "Geen" },
  { value: "laag", label: "Laag" },
  { value: "normaal", label: "Normaal" },
  { value: "hoog", label: "Hoog" },
];

export function ItemFields({
  draft,
  idPrefix,
  onChange,
}: {
  draft: ItemDraft;
  idPrefix: string;
  onChange: (next: ItemDraft) => void;
}) {
  function set<K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <>
      <label className="field" htmlFor={`${idPrefix}-naam`}>
        <span>Naam</span>
        <input
          id={`${idPrefix}-naam`}
          className="text-input"
          type="text"
          maxLength={160}
          autoComplete="off"
          value={draft.name}
          placeholder="Bijvoorbeeld een prentenboek"
          onChange={(event) => set("name", event.target.value)}
        />
      </label>
      <label className="field" htmlFor={`${idPrefix}-link`}>
        <span>Link naar de winkel</span>
        <input
          id={`${idPrefix}-link`}
          className="text-input"
          type="text"
          inputMode="url"
          maxLength={2000}
          placeholder="https://"
          value={draft.url}
          onChange={(event) => set("url", event.target.value)}
        />
      </label>
      <div className="split">
        <label className="field" htmlFor={`${idPrefix}-prijs`}>
          <span>Prijs</span>
          <span className="price-field">
            <em>€</em>
            <input
              id={`${idPrefix}-prijs`}
              className="text-input"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={draft.price}
              onChange={(event) => set("price", event.target.value)}
            />
          </span>
        </label>
        <label className="field" htmlFor={`${idPrefix}-foto`}>
          <span>Afbeelding (link)</span>
          <input
          id={`${idPrefix}-foto`}
          className="text-input"
          type="text"
          inputMode="url"
            maxLength={2000}
            placeholder="https://"
            value={draft.imageUrl}
            onChange={(event) => set("imageUrl", event.target.value)}
          />
        </label>
      </div>
      <fieldset className="chips">
        <legend>Prioriteit</legend>
        {PRIORITIES.map((choice) => (
          <label className="chip" key={choice.label}>
            <input
              type="radio"
              name={`${idPrefix}-prioriteit`}
              value={choice.value}
              checked={draft.priority === choice.value}
              onChange={() => set("priority", choice.value)}
            />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <label className="field" htmlFor={`${idPrefix}-notitie`}>
        <span>Notitie</span>
        <textarea
          id={`${idPrefix}-notitie`}
          maxLength={800}
          placeholder="Maat, kleur, of waar je het het liefst vandaan hebt."
          value={draft.note}
          onChange={(event) => set("note", event.target.value)}
        />
      </label>
    </>
  );
}
