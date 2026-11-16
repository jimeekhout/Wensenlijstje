import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { safeNextPath } from "@/lib/auth";
import { authSecret } from "@/lib/env";
import { cleanPersonName } from "@/lib/format";

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

export function googleAuthConfigured(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.GOOGLE_CLIENT_SECRET?.trim());
}

export function googleRedirectUri(origin = process.env.APP_URL) {
  const override = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (override) return override;
  const base = (origin?.trim() || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${GOOGLE_CALLBACK_PATH}`;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

export type KnownAccount = {
  id: string;
  googleSub: string | null;
};

export type GoogleSignInPlan =
  | { ok: true; kind: "login"; userId: string }
  | { ok: true; kind: "link"; userId: string; googleSub: string }
  | { ok: true; kind: "create"; email: string; name: string; googleSub: string }
  | { ok: false; error: "unverified" | "invalid" | "conflict" };

/**
 * Decide how a verified Google identity maps onto an existing account.
 * An unverified Google email never links to or creates an account.
 */
export function planGoogleSignIn(input: {
  profile: GoogleProfile;
  bySub: { id: string } | null;
  byEmail: KnownAccount | null;
}): GoogleSignInPlan {
  const sub = input.profile.sub.trim();
  const email = input.profile.email.trim().toLowerCase();
  if (!sub || sub.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "invalid" };
  }
  if (!input.profile.emailVerified) return { ok: false, error: "unverified" };

  if (input.bySub) return { ok: true, kind: "login", userId: input.bySub.id };

  if (input.byEmail) {
    if (input.byEmail.googleSub && input.byEmail.googleSub !== sub) {
      return { ok: false, error: "conflict" };
    }
    if (input.byEmail.googleSub === sub) return { ok: true, kind: "login", userId: input.byEmail.id };
    return { ok: true, kind: "link", userId: input.byEmail.id, googleSub: sub };
  }

  const name = cleanPersonName(input.profile.name).slice(0, 60);
  const fallback = cleanPersonName(email.split("@")[0] ?? "").slice(0, 60);
  return {
    ok: true,
    kind: "create",
    email,
    name: name || fallback || "Gebruiker",
    googleSub: sub,
  };
}

export function sealOAuthState(nextPath: string) {
  const state = randomBytes(24).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ state, next: safeNextPath(nextPath), exp: Date.now() + STATE_MAX_AGE_MS }),
  ).toString("base64url");
  const mac = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return { state, cookieValue: `${body}.${mac}` };
}

export function openOAuthState(cookieValue: string | undefined, returnedState: string) {
  if (!cookieValue) return null;
  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0) return null;
  const body = cookieValue.slice(0, separator);
  const mac = cookieValue.slice(separator + 1);
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      state?: string;
      next?: string;
      exp?: number;
    };
    if (!parsed.state || parsed.state !== returnedState || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Date.now()) return null;
    return { next: safeNextPath(parsed.next) };
  } catch {
    return null;
  }
}

export function googleErrorMessage(code: string | undefined) {
  if (code === "google-geannuleerd") return "Inloggen met Google is geannuleerd.";
  if (code === "google-niet-geverifieerd") {
    return "Google heeft dit e-mailadres nog niet geverifieerd. Gebruik e-mail en wachtwoord, of verifieer het adres bij Google.";
  }
  if (code === "google-conflict") {
    return "Dit e-mailadres is al gekoppeld aan een ander Google-account.";
  }
  if (code === "google") return "Inloggen met Google is niet gelukt. Probeer het opnieuw.";
  return null;
}
