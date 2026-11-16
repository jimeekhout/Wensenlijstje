"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createWishlistAction } from "@/lib/actions";
import { resolveOccasion } from "@/lib/occasions";
import { upsertStoredList } from "@/lib/stored-lists";
import { parseListDraft } from "@/lib/validate";
import { OccasionFields } from "./OccasionFields";

export function CreateListForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preset, setPreset] = useState("");
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const draft = {
      title,
      description,
      occasion: resolveOccasion(preset, custom),
    };
    const parsed = parseListDraft(draft);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createWishlistAction(draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      upsertStoredList({
        id: result.data.list.id,
        ownerToken: result.data.ownerToken,
        title: result.data.list.title,
        occasion: result.data.list.occasion,
        updatedAt: new Date().toISOString(),
      });
      router.push(`/lijst/${result.data.ownerToken}`);
    });
  }

  return (
    <form className="panel" data-ready={ready ? "ja" : "nee"} onSubmit={submit}>
      <div className="panel-head">
        <h2>Nieuw lijstje</h2>
      </div>
      <label className="field" htmlFor="titel">
        <span>Titel</span>
        <input
          id="titel"
          className="text-input"
          type="text"
          maxLength={120}
          value={title}
          placeholder="Bijvoorbeeld: Sinterklaas voor Noor"
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <OccasionFields preset={preset} custom={custom} onPreset={setPreset} onCustom={setCustom} />
      <label className="field" htmlFor="omschrijving">
        <span>Omschrijving</span>
        <textarea
          id="omschrijving"
          maxLength={800}
          value={description}
          placeholder="Iets wat helpt om te kiezen. Bijvoorbeeld de maat of een lievelingskleur."
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button primary full" type="submit" disabled={pending}>
        {pending ? "Bezig…" : "Lijstje maken"}
      </button>
    </form>
  );
}
