"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { createItem, updateItem } from "@/app/actions/items";
import { previewProduct } from "@/app/actions/product";
import { RemoteImage } from "@/components/remote-image";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

type Initial = {
  id?: string;
  name: string;
  description: string;
  url: string;
  price: string;
  imageUrl: string;
  priority: string;
};

const empty: Initial = {
  name: "",
  description: "",
  url: "",
  price: "",
  imageUrl: "",
  priority: "",
};

export function ItemForm({
  mode,
  listId,
  initial,
}: {
  mode: "create" | "edit";
  listId: string;
  initial?: Initial;
}) {
  const action = mode === "create" ? createItem : updateItem;
  const [state, formAction] = useActionState(action, initialActionState);
  const [fields, setFields] = useState<Initial>(initial ?? empty);
  const [previewing, setPreviewing] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("");
  const formId = useId();

  useEffect(() => {
    if (mode === "create" && state.ok && state.nonce) {
      setFields(empty);
      setPreviewMessage("Cadeau toegevoegd.");
    }
  }, [mode, state.nonce, state.ok]);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function runPreview(rawUrl = fields.url) {
    const url = rawUrl.trim();
    if (!url) {
      setPreviewMessage("Plak eerst een link naar een productpagina.");
      return;
    }
    setPreviewing(true);
    setPreviewMessage("Bezig met ophalen…");
    try {
      const result = await previewProduct(url);
      if (!result.ok) {
        setPreviewMessage(result.message);
        return;
      }
      setFields((current) => ({
        ...current,
        url: result.url || current.url,
        name: result.name || current.name,
        description: result.description || current.description,
        imageUrl: result.imageUrl || current.imageUrl,
        price: result.price || current.price,
      }));
      setPreviewMessage(result.message);
    } catch {
      setPreviewMessage("Ophalen is niet gelukt. De link kun je wel opslaan en de rest zelf invullen.");
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="listId" value={listId} />
      {initial?.id ? <input type="hidden" name="itemId" value={initial.id} /> : null}
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      {mode === "edit" && state.message ? (
        <p className="notice" role="status">
          {state.message}
        </p>
      ) : null}

      <div>
        <label className="label" htmlFor={`${formId}-url`}>
          Link naar een winkel <span className="font-medium text-muted">(optioneel)</span>
        </label>
        <input
          id={`${formId}-url`}
          className="input"
          name="url"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={fields.url}
          onChange={(event) => set("url", event.target.value)}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text").trim();
            if (/^https?:\/\//i.test(text)) void runPreview(text);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void runPreview();
            }
          }}
        />
        <p className="hint">Plak een productlink. We proberen naam, prijs, foto en omschrijving in te vullen.</p>
        <button className="btn-secondary mt-2" type="button" onClick={() => void runPreview()} disabled={previewing}>
          {previewing ? "Ophalen…" : "Gegevens ophalen"}
        </button>
        {previewMessage ? (
          <p className="note mt-2" role="status" data-testid="product-notice">
            {previewMessage}
          </p>
        ) : null}
      </div>

      <div>
        <label className="label" htmlFor={`${formId}-name`}>
          Naam
        </label>
        <input
          id={`${formId}-name`}
          className="input"
          name="name"
          required
          maxLength={120}
          value={fields.name}
          data-testid={mode === "create" ? "item-name" : undefined}
          autoComplete="off"
          onChange={(event) => set("name", event.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor={`${formId}-description`}>
          Omschrijving <span className="font-medium text-muted">(optioneel)</span>
        </label>
        <textarea
          id={`${formId}-description`}
          className="textarea"
          name="description"
          maxLength={2000}
          value={fields.description}
          onChange={(event) => set("description", event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${formId}-price`}>
            Prijs <span className="font-medium text-muted">(optioneel)</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">€</span>
            <input
              id={`${formId}-price`}
              className="input pl-8"
              name="price"
              inputMode="decimal"
              placeholder="19,95"
              value={fields.price}
              onChange={(event) => set("price", event.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor={`${formId}-priority`}>
            Prioriteit <span className="font-medium text-muted">(optioneel)</span>
          </label>
          <select
            id={`${formId}-priority`}
            className="select"
            name="priority"
            value={fields.priority}
            onChange={(event) => set("priority", event.target.value)}
          >
            <option value="">Geen voorkeur</option>
            <option value="1">Laag</option>
            <option value="2">Normaal</option>
            <option value="3">Hoog</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`${formId}-image`}>
          Afbeelding-URL <span className="font-medium text-muted">(optioneel)</span>
        </label>
        <input
          id={`${formId}-image`}
          className="input"
          name="imageUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={fields.imageUrl}
          onChange={(event) => set("imageUrl", event.target.value)}
        />
        {fields.imageUrl ? (
          <div className="mt-3 overflow-hidden rounded-2xl">
            <RemoteImage src={fields.imageUrl} alt="" />
          </div>
        ) : null}
      </div>

      <SubmitButton>{mode === "create" ? "Cadeau toevoegen" : "Cadeau opslaan"}</SubmitButton>
    </form>
  );
}
