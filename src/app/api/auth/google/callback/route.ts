import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { googleAuthConfigured, googleRedirectUri, openOAuthState, planGoogleSignIn } from "@/lib/google";

export const runtime = "nodejs";

const STATE_COOKIE = "wensenlijstje_google_oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const sealed = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  const fail = (code: string) => NextResponse.redirect(new URL(`/inloggen?fout=${code}`, request.url));

  if (!googleAuthConfigured()) return fail("google");
  if (url.searchParams.get("error") === "access_denied") return fail("google-geannuleerd");

  const code = url.searchParams.get("code") ?? "";
  const returnedState = url.searchParams.get("state") ?? "";
  const opened = openOAuthState(sealed, returnedState);
  if (!code || !opened) return fail("google");

  const profile = await fetchGoogleProfile(code);
  if (!profile) return fail("google");

  try {
    const userId = await signInWithGoogle(profile);
    if (typeof userId !== "string") return fail(userId);
    await createSession(userId);
    redirect(opened.next);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("google");
    }
    throw error;
  }
}

async function signInWithGoogle(profile: NonNullable<Awaited<ReturnType<typeof fetchGoogleProfile>>>) {
  return prisma.$transaction(async (tx) => {
    const bySub = await tx.user.findUnique({
      where: { googleSub: profile.sub },
      select: { id: true },
    });
    const byEmail = await tx.user.findUnique({
      where: { email: profile.email.trim().toLowerCase() },
      select: { id: true, googleSub: true },
    });
    const plan = planGoogleSignIn({ profile, bySub, byEmail });
    if (!plan.ok) {
      if (plan.error === "unverified") return "google-niet-geverifieerd";
      if (plan.error === "conflict") return "google-conflict";
      return "google";
    }
    if (plan.kind === "login") return plan.userId;
    if (plan.kind === "link") {
      await tx.user.update({ where: { id: plan.userId }, data: { googleSub: plan.googleSub } });
      return plan.userId;
    }
    const created = await tx.user.create({
      data: { email: plan.email, name: plan.name, googleSub: plan.googleSub },
      select: { id: true },
    });
    return created.id;
  });
}

async function fetchGoogleProfile(code: string) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
      client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!tokenResponse?.ok) return null;

  const tokens = (await tokenResponse.json().catch(() => null)) as { access_token?: string } | null;
  if (!tokens?.access_token) return null;

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!profileResponse?.ok) return null;

  const profile = (await profileResponse.json().catch(() => null)) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
  } | null;
  if (!profile?.sub || !profile.email) return null;

  return {
    sub: profile.sub,
    email: profile.email,
    emailVerified: profile.email_verified === true || profile.email_verified === "true",
    name: profile.name ?? "",
  };
}
