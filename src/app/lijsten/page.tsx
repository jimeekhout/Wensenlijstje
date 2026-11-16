import Link from "next/link";
import { OccasionIcon } from "@/components/occasion-icon";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cadeauCount, formatDutchDate } from "@/lib/format";
import { occasionLabel } from "@/lib/occasions";

export const metadata = { title: "Mijn lijstjes" };

export default async function ListsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const lists = await prisma.wishList.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      occasion: true,
      occasionCustom: true,
      eventDate: true,
      _count: { select: { items: true } },
    },
  });
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted">Hoi {firstName}</p>
          <h1 className="text-4xl">Mijn lijstjes</h1>
        </div>
        <Link className="btn" href="/lijsten/nieuw">
          Nieuw lijstje
        </Link>
      </div>
      <p>
        <Link className="font-bold underline" href="/cadeauzoeker">
          Zoek een cadeau-idee
        </Link>
      </p>
      {lists.length === 0 ? (
        <div className="card p-5">
          <h2 className="text-2xl">Je hebt nog geen lijstje</h2>
          <p className="mt-2 text-muted">Maak er een voor Sinterklaas, een verjaardag of een andere gelegenheid.</p>
        </div>
      ) : (
        <ul className="stack">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/lijsten/${list.id}`} className={`card occasion-${list.occasion} block overflow-hidden`}>
                <div className="h-1.5 bg-[var(--occ-accent)]" />
                <div className="flex items-center gap-3 p-4">
                  <span className="occasion-icon">
                    <OccasionIcon name={list.occasion} />
                  </span>
                  <span className="min-w-0">
                    <span className="occasion-kicker">{occasionLabel(list.occasion, list.occasionCustom)}</span>
                    <span className="mt-1 block font-serif text-2xl break-words">{list.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {[list.eventDate ? formatDutchDate(list.eventDate) : null, cadeauCount(list._count.items)]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
