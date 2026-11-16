"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { initialActionState } from "@/lib/action-state";

export function LoginForm({
  next,
  googleEnabled,
  alert,
}: {
  next: string;
  googleEnabled: boolean;
  alert?: string | null;
}) {
  const [state, action] = useActionState(login, initialActionState);
  return (
    <div className="card stack p-5">
      <h1 className="text-4xl">Inloggen</h1>
      {alert ? (
        <p className="error" role="alert">
          {alert}
        </p>
      ) : null}
      <GoogleSignIn next={next} enabled={googleEnabled} />
      <form action={action} className="stack">
      <input type="hidden" name="next" value={next} />
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
        <input
          id="password"
          className="input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) => event.currentTarget.setCustomValidity("Vul je wachtwoord in.")}
        />
      </div>
      <SubmitButton>Inloggen</SubmitButton>
      <p className="hint">
        Nog geen account? <Link className="font-bold underline" href={`/registreren?next=${encodeURIComponent(next)}`}>Account maken</Link>
      </p>
      </form>
    </div>
  );
}

export function SignupForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const [state, action] = useActionState(signup, initialActionState);
  return (
    <div className="card stack p-5">
      <h1 className="text-4xl">Account maken</h1>
      <p className="hint">Daarna kun je meteen een lijstje beginnen.</p>
      <GoogleSignIn next={next} enabled={googleEnabled} />
      <form action={action} className="stack">
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
        <input
          id="password"
          className="input"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          onInvalid={(event) =>
            event.currentTarget.setCustomValidity(
              event.currentTarget.validity.valueMissing ? "Kies een wachtwoord." : "Kies minstens 8 tekens.",
            )
          }
        />
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
    </div>
  );
}

function GoogleSignIn({ next, enabled }: { next: string; enabled: boolean }) {
  if (!enabled) return null;
  const href = `/api/auth/google?next=${encodeURIComponent(next)}`;
  return (
    <>
      <a className="btn-google" href={href}>
        <GoogleMark />
        Doorgaan met Google
      </a>
      <p className="or-divider">of</p>
    </>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.1 5.5l.1.1 6.3 5.3C39.2 37.1 44 32 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
