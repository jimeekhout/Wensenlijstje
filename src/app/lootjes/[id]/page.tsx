import { notFound, redirect } from "next/navigation";
import { deleteDraw, removeExclusion, removeParticipant } from "@/app/actions/draws";
import { AddParticipantForm, DrawButton, ExclusionForm } from "@/components/draw-forms";
import { DangerConfirm } from "@/components/danger-confirm";
import { CopyLink } from "@/components/copy-link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDutchDate } from "@/lib/format";
import { formatEuro } from "@/lib/price";
import { requestOrigin } from "@/lib/origin";
import { canRedraw } from "@/lib/lootjes";

export const metadata = { title: "Trekking" };

export default async function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/inloggen?next=/lootjes/${id}`);
  const draw = await prisma.draw.findFirst({
    where: { id, ownerId: user.id },
    select: {
      id: true,
      title: true,
      eventDate: true,
      budgetCents: true,
      drawnAt: true,
      participants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, token: true, viewedAt: true },
      },
      exclusions: { select: { id: true, aId: true, bId: true } },
    },
  });
  if (!draw) notFound();
  const origin = await requestOrigin();
  const viewed = draw.participants.filter((person) => person.viewedAt).length;
  const redraw = canRedraw({ drawnAt: draw.drawnAt, viewedCount: viewed });
  const names = new Map(draw.participants.map((person) => [person.id, person.name]));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" data-testid="draw-organiser">
      <div>
        <p className="kicker">Lootjes</p>
        <h1 className="text-4xl">{draw.title}</h1>
        <p className="mt-1 text-muted">
          {[draw.eventDate ? formatDutchDate(draw.eventDate) : null, draw.budgetCents != null ? `Budget ${formatEuro(draw.budgetCents)}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <aside className="note">
        <p className="font-extrabold">Jij ziet de indeling niet.</p>
        <p className="mt-1">Elke deelnemer krijgt een eigen link en ziet alleen de persoon die hij of zij heeft getrokken.</p>
      </aside>

      <section className="card stack p-4">
        <h2 className="text-2xl">Deelnemers</h2>
        {draw.participants.length === 0 ? <p className="hint">Nog niemand. Voeg hieronder namen toe.</p> : null}
        <ul className="stack">
          {draw.participants.map((person) => (
            <li key={person.id} className="stack rounded-2xl border border-line p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{person.name}</p>
                  {person.email ? <p className="text-sm text-muted">{person.email}</p> : null}
                  <p className="text-sm text-muted">{person.viewedAt ? "Heeft gekeken" : "Nog niet gekeken"}</p>
                </div>
                {viewed === 0 ? (
                  <form action={removeParticipant}>
                    <input type="hidden" name="drawId" value={draw.id} />
                    <input type="hidden" name="participantId" value={person.id} />
                    <button className="btn-danger min-h-11 px-3" type="submit">Weg</button>
                  </form>
                ) : null}
              </div>
              <CopyLink label="Persoonlijke link" value={`${origin}/lootjes/bekijk/${person.token}`} />
            </li>
          ))}
        </ul>
        {viewed === 0 ? <AddParticipantForm drawId={draw.id} /> : null}
      </section>

      <section className="card stack p-4">
        <h2 className="text-2xl">Uitzonderingen</h2>
        <ul className="stack">
          {draw.exclusions.map((pair) => (
            <li key={pair.id} className="flex items-center justify-between gap-3">
              <span>{names.get(pair.aId)} en {names.get(pair.bId)}</span>
              {viewed === 0 ? (
                <form action={removeExclusion}>
                  <input type="hidden" name="drawId" value={draw.id} />
                  <input type="hidden" name="exclusionId" value={pair.id} />
                  <button className="btn-ghost min-h-11 px-3" type="submit">Haal weg</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {viewed === 0 ? <ExclusionForm drawId={draw.id} participants={draw.participants} /> : null}
      </section>

      <section className="card stack p-4">
        {draw.drawnAt ? (
          <p className="notice" role="status">
            De lootjes zijn getrokken. {redraw ? "Niemand heeft het resultaat nog bekeken, dus je kunt opnieuw trekken." : "Iemand heeft al gekeken. Opnieuw trekken kan niet meer."}
          </p>
        ) : (
          <p className="hint">Trek pas als alle namen erbij staan.</p>
        )}
        {viewed === 0 ? <DrawButton drawId={draw.id} /> : null}
      </section>

      <DangerConfirm
        action={deleteDraw}
        label="Trekking verwijderen"
        confirmLabel="Ja, verwijder de trekking"
        hidden={<input type="hidden" name="drawId" value={draw.id} />}
      />
    </div>
  );
}
