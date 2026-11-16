"use client";

import { useActionState } from "react";
import { unlockList } from "@/app/actions/access";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function PasswordGate({ shareToken, title }: { shareToken: string; title: string }) {
  const [state, action] = useActionState(unlockList, initialActionState);
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8" data-testid="password-gate">
      <form action={action} className="card stack p-5">
        <input type="hidden" name="shareToken" value={shareToken} />
        <p className="kicker">Afgeschermd lijstje</p>
        <h1 className="text-4xl">{title}</h1>
        <p className="hint">Dit lijstje is alleen zichtbaar met het wachtwoord dat je hebt gekregen.</p>
        {state.error ? (
          <p className="error" role="alert">
            {state.error}
          </p>
        ) : null}
        <div>
          <label className="label" htmlFor="list-password">
            Wachtwoord
          </label>
          <input id="list-password" className="input" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton>Lijstje openen</SubmitButton>
      </form>
    </div>
  );
}
