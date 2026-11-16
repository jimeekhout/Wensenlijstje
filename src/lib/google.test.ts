import assert from "node:assert/strict";
import { test } from "node:test";
import {
  googleAuthConfigured,
  googleErrorMessage,
  googleRedirectUri,
  openOAuthState,
  planGoogleSignIn,
  sealOAuthState,
} from "./google";

const profile = {
  sub: "google-sub-1",
  email: "Noor@Example.com",
  emailVerified: true,
  name: "Noor de Vries",
};

test("hides Google sign-in until both credentials are set", () => {
  const env = (values: NodeJS.ProcessEnv) => values;
  assert.equal(googleAuthConfigured(env({ NODE_ENV: "test" })), false);
  assert.equal(googleAuthConfigured(env({ NODE_ENV: "test", GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "  " })), false);
  assert.equal(googleAuthConfigured(env({ NODE_ENV: "test", GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secret" })), true);
});

test("uses the public origin in the redirect URI", () => {
  assert.equal(
    googleRedirectUri("https://hetwensenlijstje.vercel.app"),
    "https://hetwensenlijstje.vercel.app/api/auth/google/callback",
  );
  assert.equal(googleRedirectUri("http://localhost:3000/"), "http://localhost:3000/api/auth/google/callback");
});

test("creates, links, or refuses a Google identity", () => {
  assert.deepEqual(planGoogleSignIn({ profile, bySub: null, byEmail: null }), {
    ok: true,
    kind: "create",
    email: "noor@example.com",
    name: "Noor de Vries",
    googleSub: "google-sub-1",
  });

  assert.deepEqual(
    planGoogleSignIn({
      profile,
      bySub: null,
      byEmail: { id: "user-1", googleSub: null },
    }),
    { ok: true, kind: "link", userId: "user-1", googleSub: "google-sub-1" },
  );

  assert.equal(
    planGoogleSignIn({
      profile: { ...profile, emailVerified: false },
      bySub: null,
      byEmail: { id: "user-1", googleSub: null },
    }).ok,
    false,
  );

  assert.deepEqual(
    planGoogleSignIn({
      profile,
      bySub: null,
      byEmail: { id: "user-1", googleSub: "other-sub" },
    }),
    { ok: false, error: "conflict" },
  );

  assert.deepEqual(planGoogleSignIn({ profile, bySub: { id: "user-9" }, byEmail: null }), {
    ok: true,
    kind: "login",
    userId: "user-9",
  });
});

test("oauth state survives a round trip and rejects tampering", () => {
  const sealed = sealOAuthState("/lijsten/abc");
  assert.deepEqual(openOAuthState(sealed.cookieValue, sealed.state), { next: "/lijsten/abc" });
  assert.equal(openOAuthState(sealed.cookieValue, "other-state"), null);
  assert.equal(openOAuthState(`${sealed.cookieValue}x`, sealed.state), null);
  assert.equal(openOAuthState(sealed.cookieValue, sealed.state)?.next, "/lijsten/abc");
  assert.equal(googleErrorMessage("google-geannuleerd"), "Inloggen met Google is geannuleerd.");
});
