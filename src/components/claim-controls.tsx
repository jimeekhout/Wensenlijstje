"use client";

import { useActionState } from "react";
import { claimItem, unclaimItem } from "@/app/actions/claims";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function ClaimForm({ itemId }: { itemId: string }) {
  const [state, action] = useActionState(claimItem, initialActionState);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="itemId" value={itemId} />
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor={`claim-${itemId}`}>
          Jouw naam
        </label>
        <input
          id={`claim-${itemId}`}
          className="input"
          name="name"
          required
          maxLength={40}
          autoComplete="name"
          placeholder="Bijvoorbeeld Sem"
        />
        <p className="hint">Andere bezoekers zien je naam. De maker van het lijstje ziet niet welk cadeau je kiest.</p>
      </div>
      <SubmitButton className="btn w-full" pendingLabel="Bezig…">
        Ik koop dit
      </SubmitButton>
    </form>
  );
}

export function UnclaimForm({ itemId }: { itemId: string }) {
  const [state, action] = useActionState(unclaimItem, initialActionState);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="itemId" value={itemId} />
      <p className="claim-stamp" data-testid="claim-badge">
        Jij koopt dit
      </p>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton className="btn-secondary w-full" pendingLabel="Bezig…">
        Toch niet
      </SubmitButton>
    </form>
  );
}
