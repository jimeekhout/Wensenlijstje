"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanPersonName } from "@/lib/format";
import { parsePriceToCents } from "@/lib/price";
import { drawAssignments, shareTokenFromInput } from "@/lib/lootjes";

function token() {
  return randomBytes(18).toString("base64url");
}

async function ownedDraw(userId: string, drawId: string) {
  return prisma.draw.findFirst({
    where: { id: drawId, ownerId: userId },
    include: {
      participants: { select: { id: true, viewedAt: true } },
      exclusions: { select: { aId: true, bId: true } },
    },
  });
}

function locked(draw: { participants: { viewedAt: Date | null }[] }) {
  return draw.participants.some((participant) => participant.viewedAt);
}

export async function createDraw(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in om lootjes te trekken." };
  const title = cleanPersonName(String(formData.get("title") ?? ""));
  if (!title || title.length > 80) return { error: "Geef de trekking een naam." };
  const dateRaw = String(formData.get("eventDate") ?? "").trim();
  let eventDate: Date | null = null;
  if (dateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) return { error: "Vul een geldige datum in." };
    eventDate = new Date(`${dateRaw}T12:00:00.000Z`);
  }
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  let budgetCents: number | null = null;
  if (budgetRaw) {
    budgetCents = parsePriceToCents(budgetRaw);
    if (budgetCents == null) return { error: "Vul een geldig budget in, bijvoorbeeld 15." };
  }
  const count = await prisma.draw.count({ where: { ownerId: user.id } });
  if (count >= 30) return { error: "Je hebt het maximum van 30 trekkingen bereikt." };
  const draw = await prisma.draw.create({
    data: { title, eventDate, budgetCents, ownerId: user.id },
    select: { id: true },
  });
  revalidatePath("/lootjes");
  redirect(`/lootjes/${draw.id}`);
}

export async function addParticipant(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in." };
  const draw = await ownedDraw(user.id, String(formData.get("drawId") ?? ""));
  if (!draw) return { error: "Deze trekking is niet gevonden." };
  if (locked(draw)) return { error: "Iemand heeft het resultaat al bekeken. Deelnemers wijzigen kan niet meer." };
  const name = cleanPersonName(String(formData.get("name") ?? ""));
  if (!name || name.length > 60) return { error: "Vul de naam van de deelnemer in." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Dat e-mailadres klopt niet." };
  if (draw.participants.length >= 40) return { error: "Een trekking heeft maximaal 40 deelnemers." };
  await prisma.$transaction([
    prisma.drawParticipant.create({
      data: { drawId: draw.id, name, email: email || null, token: token() },
    }),
    prisma.draw.update({ where: { id: draw.id }, data: { drawnAt: null } }),
    prisma.drawParticipant.updateMany({ where: { drawId: draw.id }, data: { drawsParticipantId: null } }),
  ]);
  revalidatePath(`/lootjes/${draw.id}`);
  return { ok: true, message: "Deelnemer toegevoegd. Trek de lootjes opnieuw.", nonce: crypto.randomUUID() };
}

export async function removeParticipant(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  const draw = await ownedDraw(user.id, String(formData.get("drawId") ?? ""));
  const participantId = String(formData.get("participantId") ?? "");
  if (!draw || locked(draw)) return;
  await prisma.$transaction([
    prisma.drawExclusion.deleteMany({
      where: { drawId: draw.id, OR: [{ aId: participantId }, { bId: participantId }] },
    }),
    prisma.drawParticipant.deleteMany({ where: { id: participantId, drawId: draw.id } }),
    prisma.draw.update({ where: { id: draw.id }, data: { drawnAt: null } }),
    prisma.drawParticipant.updateMany({ where: { drawId: draw.id }, data: { drawsParticipantId: null } }),
  ]);
  revalidatePath(`/lootjes/${draw.id}`);
}

export async function addExclusion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in." };
  const draw = await ownedDraw(user.id, String(formData.get("drawId") ?? ""));
  if (!draw) return { error: "Deze trekking is niet gevonden." };
  if (locked(draw)) return { error: "Iemand heeft het resultaat al bekeken." };
  const aId = String(formData.get("aId") ?? "");
  const bId = String(formData.get("bId") ?? "");
  if (!aId || !bId || aId === bId) return { error: "Kies twee verschillende deelnemers." };
  const ids = new Set(draw.participants.map((participant) => participant.id));
  if (!ids.has(aId) || !ids.has(bId)) return { error: "Die deelnemers horen niet bij deze trekking." };
  const [first, second] = [aId, bId].sort();
  await prisma.drawExclusion.upsert({
    where: { drawId_aId_bId: { drawId: draw.id, aId: first, bId: second } },
    update: {},
    create: { drawId: draw.id, aId: first, bId: second },
  });
  await prisma.draw.update({ where: { id: draw.id }, data: { drawnAt: null } });
  await prisma.drawParticipant.updateMany({ where: { drawId: draw.id }, data: { drawsParticipantId: null } });
  revalidatePath(`/lootjes/${draw.id}`);
  return { ok: true, message: "Uitzondering bewaard. Trek de lootjes opnieuw.", nonce: crypto.randomUUID() };
}

export async function removeExclusion(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  const draw = await ownedDraw(user.id, String(formData.get("drawId") ?? ""));
  if (!draw || locked(draw)) return;
  await prisma.drawExclusion.deleteMany({
    where: { id: String(formData.get("exclusionId") ?? ""), drawId: draw.id },
  });
  await prisma.draw.update({ where: { id: draw.id }, data: { drawnAt: null } });
  await prisma.drawParticipant.updateMany({ where: { drawId: draw.id }, data: { drawsParticipantId: null } });
  revalidatePath(`/lootjes/${draw.id}`);
}

export async function performDraw(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log opnieuw in." };
  const draw = await ownedDraw(user.id, String(formData.get("drawId") ?? ""));
  if (!draw) return { error: "Deze trekking is niet gevonden." };
  if (locked(draw)) return { error: "Iemand heeft het resultaat al bekeken. Opnieuw trekken kan niet meer." };
  if (draw.participants.length < 2) return { error: "Voeg minstens twee deelnemers toe." };
  const assignment = drawAssignments(
    draw.participants.map((participant) => participant.id),
    draw.exclusions.map((pair) => ({ a: pair.aId, b: pair.bId })),
  );
  if (!assignment) {
    return { error: "Met deze uitzonderingen is een eerlijke trekking niet mogelijk. Haal een paar uitzonderingen weg." };
  }
  await prisma.$transaction([
    ...Object.entries(assignment).map(([giver, receiver]) =>
      prisma.drawParticipant.update({ where: { id: giver }, data: { drawsParticipantId: receiver, viewedAt: null } }),
    ),
    prisma.draw.update({ where: { id: draw.id }, data: { drawnAt: new Date() } }),
  ]);
  revalidatePath(`/lootjes/${draw.id}`);
  return { ok: true, message: "De lootjes zijn getrokken. Jij ziet niet wie wie heeft.", nonce: crypto.randomUUID() };
}

export async function deleteDraw(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  await prisma.draw.deleteMany({ where: { id: String(formData.get("drawId") ?? ""), ownerId: user.id } });
  revalidatePath("/lootjes");
  redirect("/lootjes");
}

export async function attachWishList(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const participantToken = String(formData.get("token") ?? "");
  const participant = await prisma.drawParticipant.findUnique({
    where: { token: participantToken },
    select: { id: true, token: true },
  });
  if (!participant) return { error: "Deze link hoort niet bij een trekking." };
  const raw = String(formData.get("listLink") ?? "");
  const shareToken = raw.trim() ? shareTokenFromInput(raw) : null;
  if (raw.trim() && !shareToken) {
    return { error: "Plak de deellink van een lijstje op hetwensenlijstje.nl." };
  }
  if (shareToken) {
    const list = await prisma.wishList.findUnique({ where: { shareToken }, select: { id: true } });
    if (!list) return { error: "Dat lijstje konden we niet vinden." };
  }
  await prisma.drawParticipant.update({
    where: { id: participant.id },
    data: { wishShareToken: shareToken },
  });
  revalidatePath(`/lootjes/bekijk/${participant.token}`);
  return {
    ok: true,
    message: shareToken ? "Je lijstje is gekoppeld. Alleen wie jou trok kan het openen." : "De koppeling is verwijderd.",
    nonce: crypto.randomUUID(),
  };
}
