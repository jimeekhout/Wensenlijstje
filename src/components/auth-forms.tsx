"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, initialActionState);
  return (
    <form action={action} className="card stack p-5">
      <input type="hidden" name="next" value={next} />
      <h1 className="text-4xl">Inloggen</h1>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor="email">
          E-mailadres
        </label>
        <input id="email" className="input" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Wachtwoord
        </label>
        <input id="password" className="input" name="password" type="password" autoComplete="current-password" required />
      </div>
      <SubmitButton>Inloggen</SubmitButton>
      <p className="hint">
        Nog geen account? <Link className="font-bold underline" href={`/registreren?next=${encodeURIComponent(next)}`}>Account maken</Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signup, initialActionState);
  return (
    <form action={action} className="card stack p-5">
      <h1 className="text-4xl">Account maken</h1>
      <p className="hint">Daarna kun je meteen een lijstje beginnen.</p>
      {state.error ? (
        <p className="error" role="alert">
          {state.error}
        </p>
      ) : null}
      <div>
        <label className="label" htmlFor="name">
          Je naam
        </label>
        <input id="name" className="input" name="name" autoComplete="name" required maxLength={60} placeholder="Noor" />
      </div>
      <div>
        <label className="label" htmlFor="email">
          E-mailadres
        </label>
        <input id="email" className="input" name="email" type="email" autoComplete="email" required placeholder="noor@voorbeeld.nl" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Wachtwoord
        </label>
        <input id="password" className="input" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <p className="hint">Minstens 8 tekens.</p>
      </div>
      <div>
        <label className="label" htmlFor="password-confirm">
          Herhaal wachtwoord
        </label>
        <input id="password-confirm" className="input" name="passwordConfirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <input type="hidden" name="next" value={next} />
      <SubmitButton>Account maken</SubmitButton>
      <p className="hint">
        Al een account? <Link className="font-bold underline" href={`/inloggen?next=${encodeURIComponent(next)}`}>Inloggen</Link>
      </p>
    </form>
  );
}
