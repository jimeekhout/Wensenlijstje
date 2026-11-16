import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { googleAuthConfigured, googleRedirectUri, sealOAuthState } from "@/lib/google";

export const runtime = "nodejs";

const STATE_COOKIE = "wensenlijstje_google_oauth";

export async function GET(request: Request) {
  if (!googleAuthConfigured()) {
    return NextResponse.redirect(new URL("/inloggen?fout=google", request.url));
  }

  const nextPath = safeNextPath(new URL(request.url).searchParams.get("next"));
  const sealed = sealOAuthState(nextPath);
  const jar = await cookies();
  jar.set(STATE_COOKIE, sealed.cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!.trim());
  authorize.searchParams.set("redirect_uri", googleRedirectUri());
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", sealed.state);
  authorize.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(authorize);
}
