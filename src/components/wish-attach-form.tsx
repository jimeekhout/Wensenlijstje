"use client";

import { useActionState } from "react";
import { attachWishList } from "@/app/actions/draws";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function WishAttachForm({ token, current }: { token: string; current: string }) {
  const [state, action] = useActionState(attachWishList, initialActionState);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="token" value={token} />
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="notice" role="status">{state.message}</p> : null}
      <label className="label" htmlFor="list-link">Deellink van je lijstje</label>
      <input id="list-link" className="input" name="listLink" defaultValue={current} placeholder="https://" />
      <SubmitButton>Lijstje koppelen</SubmitButton>
    </form>
  );
}
