import { compare, hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { hashSecret } from "@/lib/hash";

const COOKIE = "wensenlijstje_session";
const MONTH_MS = 1000 * 60 * 60 * 24 * 30;

// Throwaway hash so a login for an unknown email takes about as long as a real check.
const DUMMY_PASSWORD_HASH = "$2a$10$XezcgdtKIYs/GKUyBnVAWeTc3oG8By5csb2lL./fWgNSmX.strQhS";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string | null) {
  return compare(password, passwordHash ?? DUMMY_PASSWORD_HASH);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MONTH_MS);
  await prisma.session.create({
    data: { userId, tokenHash: hashSecret(token), expiresAt },
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSecret(token) } });
  }
  jar.delete(COOKIE);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSecret(token) },
    select: {
      expiresAt: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return session.user;
});

export function safeNextPath(value: unknown, fallback = "/lijsten") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\r\n]/.test(value)) {
    return fallback;
  }
  return value;
}

export function claimCookieName(itemId: string) {
  return `wens_claim_${itemId}`;
}

export function isClaimCookieId(itemId: string) {
  return /^c[a-z0-9]{8,40}$/.test(itemId);
}
