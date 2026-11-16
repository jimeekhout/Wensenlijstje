"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  addItemAction,
  deleteItemAction,
  deleteWishlistAction,
  moveItemAction,
  rememberOwnerAction,
  updateItemAction,
  updateWishlistAction,
} from "@/lib/actions";
import { cadeauLabel, centsToInput, formatPrice, siteName } from "@/lib/format";
import { resolveOccasion, splitOccasion } from "@/lib/occasions";
import { removeStoredList, upsertStoredList } from "@/lib/stored-lists";
import type { ItemDraft, OwnerItem, OwnerWishlist } from "@/lib/types";
import { emptyItemDraft } from "@/lib/types";
import { parseItemDraft, parseListDraft } from "@/lib/validate";
import { CopyField } from "./CopyField";
import { GiftImage } from "./GiftImage";
import { ItemFields } from "./ItemFields";
import { OccasionFields } from "./OccasionFields";

function draftFromItem(item: OwnerItem): ItemDraft {
  return {
    name: item.name,
    url: item.url ?? "",
    price: centsToInput(item.priceCents),
    imageUrl: item.imageUrl ?? "",
    note: item.note ?? "",
    priority: item.priority ?? "",
  };
}

export function OwnerEditor({
  token,
  initialList,
  shareUrl,
  ownerUrl,
}: {
  token: string;
  initialList: OwnerWishlist;
  shareUrl: string;
  ownerUrl: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(initialList);
  const [adding, setAdding] = useState(initialList.items.length === 0);
  const [draft, setDraft] = useState<ItemDraft>(emptyItemDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft>(emptyItemDraft());
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState(false);
  const [pending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  const split = splitOccasion(list.occasion);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description ?? "");
  const [preset, setPreset] = useState(split.preset);
  const [custom, setCustom] = useState(split.custom);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setList((current) => (current.revision > initialList.revision ? current : initialList));
  }, [initialList]);

  useEffect(() => {
    upsertStoredList({
      id: list.id,
      ownerToken: token,
      title: list.title,
      occasion: list.occasion,
      updatedAt: new Date().toISOString(),
    });
    void rememberOwnerAction(token);
  }, [list.id, list.title, list.occasion, list.revision, token]);

  function saveDetails(event: FormEvent) {
    event.preventDefault();
    const next = {
      title,
      description,
      occasion: resolveOccasion(preset, custom),
    };
    const parsed = parseListDraft(next);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await updateWishlistAction(token, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setError(null);
    });
  }

  function addItem(event: FormEvent) {
    event.preventDefault();
    const parsed = parseItemDraft(draft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await addItemAction(token, draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setDraft(emptyItemDraft());
      setAdding(false);
      setError(null);
    });
  }

  function saveItem(event: FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    const parsed = parseItemDraft(editDraft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await updateItemAction(token, editingId, editDraft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setEditingId(null);
      setError(null);
    });
  }

  function removeItem(itemId: string) {
    startTransition(async () => {
      const result = await deleteItemAction(token, itemId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
      setError(null);
    });
  }

  function move(itemId: string, direction: -1 | 1) {
    startTransition(async () => {
      const result = await moveItemAction(token, itemId, direction);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setList(result.data);
    });
  }

  function removeList() {
    startTransition(async () => {
      const result = await deleteWishlistAction(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      removeStoredList(list.id);
      router.push("/");
    });
  }

  return (
    <div data-ready={ready ? "ja" : "nee"}>
      <p className="kicker">{list.occasion ?? "Wensenlijstje"}</p>
      <section className="panel">
        <h1>{list.title}</h1>
        {list.description ? <p>{list.description}</p> : null}
        <p className="banner">
          <strong>Reserveringen blijven verborgen.</strong>
          Jij ziet niet wat familie of vrienden al hebben uitgekozen. Zij zien dat wel, zodat niet iedereen hetzelfde koopt.
        </p>
        <details className="fold">
          <summary>Gegevens aanpassen</summary>
          <form onSubmit={saveDetails}>
            <label className="field" htmlFor="lijst-titel">
              <span>Titel</span>
              <input
                id="lijst-titel"
                className="text-input"
                type="text"
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <OccasionFields preset={preset} custom={custom} onPreset={setPreset} onCustom={setCustom} />
            <label className="field" htmlFor="lijst-omschrijving">
              <span>Omschrijving</span>
              <textarea
                id="lijst-omschrijving"
                maxLength={800}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <button className="button primary" type="submit" disabled={pending}>
              Opslaan
            </button>
          </form>
        </details>
      </section>

      <section className="share-box">
        <h2>Delen</h2>
        <CopyField
          label="Deellink"
          value={shareUrl}
          hint="Stuur deze link naar familie en vrienden. Zij hebben geen account nodig."
        />
        <details className="fold">
          <summary>Beheerlink (niet delen)</summary>
          <CopyField
            label="Beheerlink"
            value={ownerUrl}
            hint="Bewaar deze link. Alleen hiermee pas je het lijstje later aan, ook op een ander apparaat. Deel hem niet: wie de link heeft, kan cadeaus wijzigen."
          />
        </details>
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Cadeaus</h2>
          <span className="muted">{cadeauLabel(list.items.length)}</span>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {adding ? (
          <form className="panel" onSubmit={addItem}>
            <h3>Cadeau toevoegen</h3>
            <ItemFields draft={draft} idPrefix="nieuw" onChange={setDraft} />
            <div className="form-actions">
              <button className="button primary" type="submit" disabled={pending}>
                {pending ? "Bezig…" : "Toevoegen"}
              </button>
              {list.items.length > 0 ? (
                <button className="button ghost" type="button" onClick={() => setAdding(false)}>
                  Annuleren
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <button className="button primary" type="button" onClick={() => setAdding(true)}>
            Cadeau toevoegen
          </button>
        )}

        {list.items.length === 0 ? (
          <div className="empty panel">
            <h3>Nog geen cadeaus</h3>
            <p>Voeg het eerste toe. Een boek, een ervaring of gewoon een hint in de notitie is genoeg.</p>
          </div>
        ) : null}

        {list.items.map((item, index) =>
          editingId === item.id ? (
            <form className="panel" key={item.id} onSubmit={saveItem}>
              <h3>Cadeau bewerken</h3>
              <ItemFields draft={editDraft} idPrefix={`bewerk-${item.id}`} onChange={setEditDraft} />
              <div className="form-actions">
                <button className="button primary" type="submit" disabled={pending}>
                  Opslaan
                </button>
                <button className="button ghost" type="button" onClick={() => setEditingId(null)}>
                  Annuleren
                </button>
              </div>
            </form>
          ) : (
            <article className={`item-card ${item.priority ?? ""}`} key={item.id}>
              <GiftImage src={item.imageUrl} />
              <div className="item-body">
                <div className="item-top">
                  <h3>{item.name}</h3>
                  {item.priceCents != null ? <p className="price">{formatPrice(item.priceCents)}</p> : null}
                </div>
                {item.priority ? (
                  <div className="badges">
                    <span className={`badge ${item.priority}`}>Prioriteit: {item.priority}</span>
                  </div>
                ) : null}
                {item.note ? <p className="note">{item.note}</p> : null}
                {item.url ? (
                  <p>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      Bekijk bij {siteName(item.url)}
                    </a>
                  </p>
                ) : null}
                <div className="row-actions">
                  <button
                    className="button ghost small"
                    type="button"
                    disabled={pending || index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    Omhoog
                  </button>
                  <button
                    className="button ghost small"
                    type="button"
                    disabled={pending || index === list.items.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    Omlaag
                  </button>
                  <button
                    className="button ghost small"
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditDraft(draftFromItem(item));
                      setAdding(false);
                    }}
                  >
                    Bewerken
                  </button>
                  <ConfirmRemove disabled={pending} onConfirm={() => removeItem(item.id)} />
                </div>
              </div>
            </article>
          ),
        )}
      </section>

      <section className="panel">
        <h2>Lijstje verwijderen</h2>
        <p className="muted">Dit haalt het lijstje en alle cadeaus weg. De deellink werkt daarna niet meer.</p>
        {confirmDeleteList ? (
          <div className="confirm-pair">
            <button className="button danger" type="button" disabled={pending} onClick={removeList}>
              Ja, definitief verwijderen
            </button>
            <button className="button ghost" type="button" onClick={() => setConfirmDeleteList(false)}>
              Annuleren
            </button>
          </div>
        ) : (
          <button className="button danger" type="button" onClick={() => setConfirmDeleteList(true)}>
            Lijstje verwijderen
          </button>
        )}
      </section>
    </div>
  );
}

function ConfirmRemove({ onConfirm, disabled }: { onConfirm: () => void; disabled: boolean }) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button className="button danger small" type="button" disabled={disabled} onClick={() => setArmed(true)}>
        Verwijderen
      </button>
    );
  }
  return (
    <span className="confirm-pair">
      <button className="button danger small" type="button" disabled={disabled} onClick={onConfirm}>
        Zeker weten
      </button>
      <button className="button ghost small" type="button" onClick={() => setArmed(false)}>
        Annuleren
      </button>
    </span>
  );
}
