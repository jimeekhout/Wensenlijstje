import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDutchDate } from "@/lib/format";
import { redirect } from "next/navigation";

export const metadata = { title: "Lootjes trekken" };

export default async function DrawsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen?next=/lootjes");
  const draws = await prisma.draw.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      eventDate: true,
      drawnAt: true,
      _count: { select: { participants: true } },
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Lootjes trekken</h1>
          <p className="mt-1 text-muted">Voor Sinterklaas of Kerst. Jij ziet niet wie wie trekt.</p>
        </div>
        <Link className="btn" href="/lootjes/nieuw">
          Nieuwe trekking
        </Link>
      </div>
      {draws.length === 0 ? (
        <div className="card stack p-5">
          <h2 className="text-2xl">Nog geen trekking</h2>
          <ol className="stack text-sm leading-relaxed">
            <li><strong>1.</strong> Zet de namen van de deelnemers erbij.</li>
            <li><strong>2.</strong> Trek de lootjes. Niemand krijgt zichzelf.</li>
            <li><strong>3.</strong> Stuur iedereen een eigen link. Alleen die persoon ziet het resultaat.</li>
          </ol>
          <Link className="btn" href="/lootjes/nieuw">
            Begin een trekking
          </Link>
        </div>
      ) : (
        <ul className="stack">
          {draws.map((draw) => (
            <li key={draw.id}>
              <Link href={`/lootjes/${draw.id}`} className="card block p-4">
                <span className="font-serif text-2xl">{draw.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {[
                    draw.eventDate ? formatDutchDate(draw.eventDate) : null,
                    `${draw._count.participants} deelnemers`,
                    draw.drawnAt ? "Getrokken" : "Nog niet getrokken",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
