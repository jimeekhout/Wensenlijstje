"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteItem, restoreItem } from "@/app/actions/items";
import { showToast } from "@/components/toaster";
import { initialActionState } from "@/lib/action-state";

export function DeleteItemButton({ itemId }: { itemId: string }) {
  const [armed, setArmed] = useState(false);
  const [state, action] = useActionState(deleteItem, initialActionState);

  useEffect(() => {
    if (!state.nonce || !state.deleted) return;
    const snapshot = state.deleted;
    showToast("Cadeau verwijderd.", {
      label: "Ongedaan maken",
      run: async () => {
        const result = await restoreItem(snapshot);
        showToast(result.ok ? "Cadeau teruggezet." : result.error ?? "Terugzetten is niet gelukt.");
      },
    });
  }, [state.nonce, state.deleted]);

  if (!armed) {
    return (
      <button className="btn-danger" type="button" onClick={() => setArmed(true)}>
        Verwijderen
      </button>
    );
  }

  return (
    <form action={action} className="stack">
      <input type="hidden" name="itemId" value={itemId} />
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <p className="hint">Het cadeau verdwijnt van het lijstje. Je kunt het daarna nog terugzetten.</p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-danger" type="submit">
          Ja, verwijder dit cadeau
        </button>
        <button className="btn-ghost" type="button" onClick={() => setArmed(false)}>
          Annuleren
        </button>
      </div>
    </form>
  );
}
