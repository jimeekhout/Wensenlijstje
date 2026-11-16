import { notFound } from "next/navigation";
import { WishAttachForm } from "@/components/wish-attach-form";
import { prisma } from "@/lib/db";
import { formatDutchDate } from "@/lib/format";
import { formatEuro } from "@/lib/price";
import { requestOrigin } from "@/lib/origin";

export const metadata = {
  title: "Jouw lootje",
  robots: { index: false, follow: false },
};

export default async function ParticipantPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const person = await prisma.drawParticipant.findUnique({
    where: { token },
    select: {
      id: true,
      name: true,
      token: true,
      drawsParticipantId: true,
      wishShareToken: true,
      viewedAt: true,
      draw: { select: { title: true, eventDate: true, budgetCents: true, drawnAt: true } },
    },
  });
  if (!person) notFound();

  let drawn: { name: string; wishShareToken: string | null } | null = null;
  if (person.draw.drawnAt && person.drawsParticipantId) {
    drawn = await prisma.drawParticipant.findUnique({
      where: { id: person.drawsParticipantId },
      select: { name: true, wishShareToken: true },
    });
    if (!person.viewedAt) {
      await prisma.drawParticipant.update({ where: { id: person.id }, data: { viewedAt: new Date() } });
    }
  }

  const origin = await requestOrigin();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" data-testid="lootje-result">
      <div>
        <p className="text-sm font-extrabold tracking-[0.12em] text-clay uppercase">{person.draw.title}</p>
        <h1 className="text-4xl">Hoi {person.name}</h1>
        <p className="mt-1 text-muted">
          {[person.draw.eventDate ? formatDutchDate(person.draw.eventDate) : null, person.draw.budgetCents != null ? `Richtprijs ${formatEuro(person.draw.budgetCents)}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {drawn ? (
        <section className="card stack p-5">
          <p className="hint">Dit zie alleen jij.</p>
          <h2 className="text-3xl">Jij hebt {drawn.name} getrokken.</h2>
          {drawn.wishShareToken ? (
            <a className="btn" href={`${origin}/delen/${drawn.wishShareToken}`}>
              Bekijk het wensenlijstje van {drawn.name}
            </a>
          ) : (
            <p className="hint">{drawn.name} heeft nog geen wensenlijstje gekoppeld.</p>
          )}
        </section>
      ) : (
        <p className="note">De lootjes zijn nog niet getrokken. Bewaar deze link en kom later terug.</p>
      )}
      <section className="card stack p-4">
        <h2 className="text-2xl">Jouw wensenlijstje</h2>
        <p className="hint">Koppel je lijstje, dan kan degene die jou trok het zien. De organisator ziet de indeling niet.</p>
        <WishAttachForm token={person.token} current={person.wishShareToken ? `${origin}/delen/${person.wishShareToken}` : ""} />
      </section>
    </div>
  );
}
