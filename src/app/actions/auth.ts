"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import {
  createSession,
  destroySession,
  hashPassword,
  safeNextPath,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanPersonName } from "@/lib/format";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = cleanPersonName(String(formData.get("name") ?? ""));
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (name.length < 1 || name.length > 60) {
    return { error: "Vul je naam in (maximaal 60 tekens)." };
  }
  if (!emailPattern.test(email) || email.length > 200) {
    return { error: "Vul een geldig e-mailadres in." };
  }
  if (password.length < 8 || password.length > 200) {
    return { error: "Kies een wachtwoord van minstens 8 tekens." };
  }
  if (password !== confirm) return { error: "De wachtwoorden komen niet overeen." };

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { error: "Er bestaat al een account met dit e-mailadres." };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true },
  });
  await createSession(user.id);
  redirect(next);
}

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  const valid = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !valid) return { error: "Onjuist e-mailadres of wachtwoord." };
  await createSession(user.id);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}
