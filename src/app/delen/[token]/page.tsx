import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicItem } from "@/components/item-views";
import { OccasionBanner } from "@/components/occasion-banner";
import { claimCookieName, getCurrentUser } from "@/lib/auth";
import { cadeauCount, formatDutchDate } from "@/lib/format";
import { occasionLabel } from "@/lib/occasions";
import { getClaimsForItems, getSharedList } from "@/lib/queries";
import { buildViewerItems } from "@/lib/viewer-items";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const list = await getSharedList(token);
  if (!list) return { title: "Lijstje", robots: { index: false, follow: false } };
  const label = occasionLabel(list.occasion, list.occasionCustom);
  return {
    title: list.title,
    description: `${label}. Een wensenlijstje op hetwensenlijstje.nl.`,
    robots: { index: false, follow: false },
    openGraph: {
      title: list.title,
      description: `${label}. Open de link om het lijstje te bekijken.`,
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const list = await getSharedList(token);
  if (!list) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === list.owner.id;
  const secretsByItemId: Record<string, string | undefined> = {};
  if (!isOwner) {
    const jar = await cookies();
    for (const item of list.items) {
      secretsByItemId[item.id] = jar.get(claimCookieName(item.id))?.value;
    }
  }
  const claims = isOwner ? [] : await getClaimsForItems(list.items.map((item) => item.id));
  const items = buildViewerItems(list.items, claims, { hideClaims: isOwner, secretsByItemId });
  const detail = [
    `Van ${list.owner.name}`,
    list.eventDate ? formatDutchDate(list.eventDate) : null,
    cadeauCount(list.items.length),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" data-testid="public-list">
      <OccasionBanner occasion={list.occasion} custom={list.occasionCustom} title={list.title} detail={detail} />
      {isOwner ? (
        <p className="note">
          Dit is jouw lijstje. Afstrepingen blijven verborgen.{" "}
          <Link className="font-bold underline" href={`/lijsten/${list.id}`}>
            Lijstje bewerken
          </Link>
        </p>
      ) : (
        <p className="hint">De maker van dit lijstje ziet niet wat je afstreept.</p>
      )}
      {items.length === 0 ? (
        <p className="card p-4">Er staan nog geen cadeaus op dit lijstje.</p>
      ) : (
        <ul className="stack">
          {items.map((item) => (
            <li key={item.id}>
              <PublicItem item={item} readOnly={isOwner} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
